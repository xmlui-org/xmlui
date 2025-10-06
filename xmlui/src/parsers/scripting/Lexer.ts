import { parseRegExpLiteral } from "@eslint-community/regexpp";

import type { GenericToken } from "../common/GenericToken";
import type { InputStream } from "../common/InputStream";
import { TokenType } from "./TokenType";

type Token = GenericToken<TokenType>;

/**
 * This enum indicates the current lexer phase
 */
enum LexerPhase {
  // Start getting a token
  Start = 0,

  // Collecting whitespace
  InWhiteSpace,

  // Comment phases
  InlineCommentTrail,
  BlockCommentTrail1,
  BlockCommentTrail2,

  // Multi-char tokens
  Slash,
  Dollar,
  Or,
  Asterisk,
  Ampersand,
  Equal,
  DoubleEqual,
  NotEqual,
  Exclamation,
  AngleLeft,
  AngleRight,
  SignedShiftRight,
  IdTail,
  Dot,
  DotDot,
  Colon,
  Zero,
  QuestionMark,
  HexaFirst,
  HexaTail,
  BinaryFirst,
  BinaryTail,
  DecimalOrReal,
  RealFractionalFirst,
  RealFractionalTail,
  RealExponent,
  RealExponentSign,
  RealExponentTail,
  StringTemplateLiteralBackSlash,
  StringTemplateLiteral,
  String,
  StringBackSlash,
  StringHexa1,
  StringHexa2,
  StringUHexa1,
  StringUHexa2,
  StringUHexa3,
  StringUHexa4,
  StringUcp1,
  StringUcp2,
  StringUcp3,
  StringUcp4,
  StringUcp5,
  StringUcp6,
  StringUcpTail,

  // --- Assignments
  Exponent,
  Plus,
  Minus,
  Divide,
  Remainder,
  ShiftLeft,
  ShiftRight,
  LogicalAnd,
  BitwiseXor,
  LogicalOr,
  NullCoalesce,

  // --- Other
  RegEx,
}

/**
 * This class implements the lexer of binding expressions
 */
export class Lexer {
  // --- Already fetched tokens
  private _ahead: Token[] = [];

  // --- Prefetched character (from the next token)
  private _prefetched: string | null = null;

  // --- Prefetched character position (from the next token)
  private _prefetchedPos: number | null = null;

  // --- Prefetched character column (from the next token)
  private _prefetchedColumn: number | null = null;

  // --- input position at the beginning of last fetch
  private _lastFetchPosition = 0;

  private _phaseExternallySet: null | LexerPhase = null;
  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(public readonly input: InputStream) {}

  /**
   * Fetches the next token without advancing to its position
   * @param ws If true, retrieve whitespaces too
   */
  peek(ws = false): Token {
    return this.ahead(0, ws);
  }

  /**
   * Reads tokens ahead
   * @param n Number of token positions to read ahead
   * @param ws If true, retrieve whitespaces too
   */
  ahead(n = 1, ws = false): Token {
    if (n > 16) {
      throw new Error("Cannot look ahead more than 16 tokens");
    }

    // --- Prefetch missing tokens
    while (this._ahead.length <= n) {
      const token = this.fetch();
      if (isEof(token)) {
        return token;
      }
      if (ws || (!ws && !isWs(token))) {
        this._ahead.push(token);
      }
    }
    return this._ahead[n];
  }

  /**
   * Fetches the next token and advances the stream position
   * @param ws If true, retrieve whitespaces too
   */
  get(ws = false): Token {
    if (this._ahead.length > 0) {
      const token = this._ahead.shift();
      if (!token) {
        throw new Error("Token expected");
      }
      return token;
    }
    while (true) {
      const token = this.fetch();
      if (isEof(token) || ws || (!ws && !isWs(token))) {
        return token;
      }
    }
  }

  /**
   * Gets a RegEx from the current position
   */
  getRegEx(): RegExpLexerResult {
    return this.fetchRegEx();
  }

  /**
   * Gets the remaining characters after the parsing phase
   */
  getTail(): string {
    return this._ahead.length > 0
      ? this.input.getTail(this._ahead[0].startPosition)
      : this.input.getTail(this._lastFetchPosition);
  }

  /** Parsing template literals requires a context sensitive lexer.
   * This method has to be called by the parser when the lexer needs to scan a string inside a template literal.
   * Call this after the first opening backing and after the parser is done with parsing a placeholder, after the right brace.
   */
  setStartingPhaseToTemplateLiteral() {
    this._phaseExternallySet = LexerPhase.StringTemplateLiteral;
  }

  /**
   * Fetches the next character from the input stream
   */
  private fetchNextChar(): string | null {
    if (!this._prefetched) {
      this._prefetchedPos = this.input.position;
      this._prefetchedColumn = this.input.column;
      this._prefetched = this.input.get();
    }
    return this._prefetched;
  }

  /**
   * Fetches the next token from the input stream
   */
  private fetch(): Token {
    // --- Captured constants used in nested functions
    const lexer = this;
    const input = this.input;
    const startPos = this._prefetchedPos || input.position;
    const line = input.line;
    const startColumn = this._prefetchedColumn || input.column;
    this._lastFetchPosition = this.input.position;

    // --- State variables
    let stringState: string | null = null;
    let text = "";
    let tokenType = TokenType.Eof;
    let lastEndPos = input.position;
    let lastEndColumn = input.column;
    let ch: string | null = null;
    let useResolver = false;

    // --- Start from the beginning
    let phase: LexerPhase = this.getStartingPhaseThenReset();

    // --- Process all token characters
    while (true) {
      // --- Get the next character
      ch = this.fetchNextChar();

      // --- In case of EOF, return the current token data
      if (ch === null) {
        return makeToken();
      }

      // --- Set the initial token type to unknown for the other characters
      if (tokenType === TokenType.Eof) {
        tokenType = TokenType.Unknown;
      }

      // --- Follow the lexer state machine
      phaseSwitch: switch (phase) {
        // ====================================================================
        // Process the first character
        case LexerPhase.Start:
          switch (ch) {
            // --- Go on with whitespaces
            case " ":
            case "\t":
            case "\n":
            case "\r":
              phase = LexerPhase.InWhiteSpace;
              tokenType = TokenType.Ws;
              break;

            // --- Divide, BlockComment, or EolComment
            case "/":
              phase = LexerPhase.Slash;
              tokenType = TokenType.Divide;
              break;

            case "$":
              phase = LexerPhase.Dollar;
              tokenType = TokenType.Identifier;
              break;

            case "*":
              phase = LexerPhase.Asterisk;
              tokenType = TokenType.Multiply;
              break;

            case "%":
              phase = LexerPhase.Remainder;
              tokenType = TokenType.Remainder;
              break;

            case "+":
              phase = LexerPhase.Plus;
              tokenType = TokenType.Plus;
              break;

            case "-":
              phase = LexerPhase.Minus;
              tokenType = TokenType.Minus;
              break;

            case "^":
              phase = LexerPhase.BitwiseXor;
              tokenType = TokenType.BitwiseXor;
              break;

            // --- BitwiseOr, LogicalOr
            case "|":
              phase = LexerPhase.Or;
              tokenType = TokenType.BitwiseOr;
              break;

            // --- BitwiseAnd, LogicalAnd
            case "&":
              phase = LexerPhase.Ampersand;
              tokenType = TokenType.BitwiseAnd;
              break;

            // --- "?", "?", or "?."
            case "?":
              phase = LexerPhase.QuestionMark;
              tokenType = TokenType.QuestionMark;
              break;

            case ";":
              return completeToken(TokenType.Semicolon);

            case ",":
              return completeToken(TokenType.Comma);

            case "(":
              return completeToken(TokenType.LParent);

            case ")":
              return completeToken(TokenType.RParent);

            // --- ":" or "::"
            case ":":
              phase = LexerPhase.Colon;
              tokenType = TokenType.Colon;
              break;

            case "`":
              return completeToken(TokenType.Backtick);

            case "[":
              return completeToken(TokenType.LSquare);

            case "]":
              return completeToken(TokenType.RSquare);

            case "~":
              return completeToken(TokenType.BinaryNot);

            case "{":
              return completeToken(TokenType.LBrace);

            case "}":
              return completeToken(TokenType.RBrace);

            // --- "=","==", "===", or "=>"
            case "=":
              phase = LexerPhase.Equal;
              tokenType = TokenType.Assignment;
              break;

            // --- "!", "!=", or "!=="
            case "!":
              phase = LexerPhase.Exclamation;
              tokenType = TokenType.LogicalNot;
              break;

            // --- "<", "<=", or "<<"
            case "<":
              phase = LexerPhase.AngleLeft;
              tokenType = TokenType.LessThan;
              break;

            // --- ">", ">=", ">>", or ">>>"
            case ">":
              phase = LexerPhase.AngleRight;
              tokenType = TokenType.GreaterThan;
              break;

            // --- Decimal or Real literal
            case "0":
              phase = LexerPhase.Zero;
              tokenType = TokenType.DecimalLiteral;
              break;

            case ".":
              phase = LexerPhase.Dot;
              tokenType = TokenType.Dot;
              break;

            // --- String (both " and ' are accepted as string wrappers
            case '"':
            case "'":
              stringState = ch;
              phase = LexerPhase.String;
              break;

            default:
              if (isIdStart(ch)) {
                useResolver = true;
                phase = LexerPhase.IdTail;
                tokenType = TokenType.Identifier;
              } else if (isDecimalDigit(ch)) {
                phase = LexerPhase.DecimalOrReal;
                tokenType = TokenType.DecimalLiteral;
              } else {
                completeToken(TokenType.Unknown);
              }
              break;
          }
          break;

        // ====================================================================
        // Process comments

        // --- Looking for the end of whitespace
        case LexerPhase.InWhiteSpace:
          if (ch !== " " && ch !== "\t" && ch !== "\r" && ch !== "\n") {
            return makeToken();
          }
          break;

        // --- Wait for an "*" that may complete a block comment
        case LexerPhase.BlockCommentTrail1:
          if (ch === "*") {
            phase = LexerPhase.BlockCommentTrail2;
          }
          break;

        // --- Wait for a "/" that may complete a block comment
        case LexerPhase.BlockCommentTrail2:
          if (ch === "/") {
            return completeToken(TokenType.BlockComment);
          }
          break;

        case LexerPhase.InlineCommentTrail:
          if (ch === "\n") {
            return completeToken();
          }
          break;

        // ====================================================================
        // Process identifiers

        case LexerPhase.IdTail:
          if (!isIdContinuation(ch)) {
            return makeToken();
          }
          break;

        // ====================================================================
        // Process miscellaneous tokens

        case LexerPhase.Colon:
          return ch === ":" ? completeToken(TokenType.Global) : makeToken();

        case LexerPhase.Slash:
          if (ch === "*") {
            phase = LexerPhase.BlockCommentTrail1;
          } else if (ch === "/") {
            phase = LexerPhase.InlineCommentTrail;
            tokenType = TokenType.EolComment;
          } else if (ch === "=") {
            return completeToken(TokenType.DivideAssignment);
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.Plus:
          if (ch === "+") {
            return completeToken(TokenType.IncOp);
          }
          return ch === "=" ? completeToken(TokenType.AddAssignment) : makeToken();

        case LexerPhase.Minus:
          if (ch === "-") {
            return completeToken(TokenType.DecOp);
          }
          return ch === "=" ? completeToken(TokenType.SubtractAssignment) : makeToken();

        case LexerPhase.Remainder:
          return ch === "=" ? completeToken(TokenType.RemainderAssignment) : makeToken();

        case LexerPhase.BitwiseXor:
          return ch === "=" ? completeToken(TokenType.BitwiseXorAssignment) : makeToken();

        case LexerPhase.Or:
          if (ch === "=") {
            return completeToken(TokenType.BitwiseOrAssignment);
          }
          if (ch === "|") {
            phase = LexerPhase.LogicalOr;
            tokenType = TokenType.LogicalOr;
            break;
          }
          return makeToken();

        case LexerPhase.LogicalOr:
          return ch === "=" ? completeToken(TokenType.LogicalOrAssignment) : makeToken();

        case LexerPhase.Ampersand:
          if (ch === "=") {
            return completeToken(TokenType.BitwiseAndAssignment);
          }
          if (ch === "&") {
            phase = LexerPhase.LogicalAnd;
            tokenType = TokenType.LogicalAnd;
            break;
          }
          return makeToken();

        case LexerPhase.LogicalAnd:
          return ch === "=" ? completeToken(TokenType.LogicalAndAssignment) : makeToken();

        case LexerPhase.Asterisk:
          if (ch === "*") {
            phase = LexerPhase.Exponent;
            tokenType = TokenType.Exponent;
            break;
          } else if (ch === "=") {
            return completeToken(TokenType.MultiplyAssignment);
          }
          return makeToken();

        case LexerPhase.Exponent:
          return ch === "=" ? completeToken(TokenType.ExponentAssignment) : makeToken();

        case LexerPhase.QuestionMark:
          if (ch === "?") {
            phase = LexerPhase.NullCoalesce;
            tokenType = TokenType.NullCoalesce;
            break;
          }
          if (ch === ".") {
            return completeToken(TokenType.OptionalChaining);
          }
          return makeToken();

        case LexerPhase.NullCoalesce:
          return ch === "=" ? completeToken(TokenType.NullCoalesceAssignment) : makeToken();

        case LexerPhase.Equal:
          if (ch === ">") {
            return completeToken(TokenType.Arrow);
          }
          if (ch === "=") {
            phase = LexerPhase.DoubleEqual;
            tokenType = TokenType.Equal;
            break;
          }
          return makeToken();

        case LexerPhase.DoubleEqual:
          return ch === "=" ? completeToken(TokenType.StrictEqual) : makeToken();

        case LexerPhase.Exclamation:
          if (ch === "=") {
            phase = LexerPhase.NotEqual;
            tokenType = TokenType.NotEqual;
            break;
          }
          return makeToken();

        case LexerPhase.NotEqual:
          return ch === "=" ? completeToken(TokenType.StrictNotEqual) : makeToken();

        case LexerPhase.AngleLeft:
          if (ch === "=") {
            return completeToken(TokenType.LessThanOrEqual);
          }
          if (ch === "<") {
            phase = LexerPhase.ShiftLeft;
            tokenType = TokenType.ShiftLeft;
            break;
          }
          return makeToken();

        case LexerPhase.ShiftLeft:
          return ch === "=" ? completeToken(TokenType.ShiftLeftAssignment) : makeToken();

        case LexerPhase.AngleRight:
          if (ch === "=") {
            return completeToken(TokenType.GreaterThanOrEqual);
          }
          if (ch === ">") {
            phase = LexerPhase.SignedShiftRight;
            tokenType = TokenType.SignedShiftRight;
            break;
          }
          return makeToken();

        case LexerPhase.SignedShiftRight:
          if (ch === ">") {
            phase = LexerPhase.ShiftRight;
            tokenType = TokenType.ShiftRight;
            break;
          }
          if (ch === "=") {
            return completeToken(TokenType.SignedShiftRightAssignment);
          }
          return makeToken();

        case LexerPhase.ShiftRight:
          return ch === "=" ? completeToken(TokenType.ShiftRightAssignment) : makeToken();

        // ====================================================================
        // --- Literals

        case LexerPhase.Zero:
          if (ch === "x") {
            phase = LexerPhase.HexaFirst;
            tokenType = TokenType.Unknown;
          } else if (ch === "b") {
            phase = LexerPhase.BinaryFirst;
            tokenType = TokenType.Unknown;
          } else if (isDecimalDigit(ch) || ch === "_") {
            phase = LexerPhase.DecimalOrReal;
          } else if (ch === ".") {
            phase = LexerPhase.RealFractionalFirst;
            tokenType = TokenType.Unknown;
          } else if (ch === "e" || ch === "E") {
            phase = LexerPhase.RealExponent;
            tokenType = TokenType.Unknown;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.Dot:
          if (ch === ".") {
            phase = LexerPhase.DotDot;
            tokenType = TokenType.Unknown;
            break;
          }
          if (!isDecimalDigit(ch)) {
            return makeToken();
          }
          phase = LexerPhase.RealFractionalTail;
          tokenType = TokenType.RealLiteral;
          break;

        case LexerPhase.DotDot:
          return ch === "." ? completeToken(TokenType.Spread) : makeToken();

        case LexerPhase.HexaFirst:
          if (ch === "_") {
            break;
          }
          if (!isHexadecimalDigit(ch)) {
            return makeToken();
          }
          phase = LexerPhase.HexaTail;
          tokenType = TokenType.HexadecimalLiteral;
          break;

        case LexerPhase.HexaTail:
          if (!isHexadecimalDigit(ch) && ch !== "_") {
            return makeToken();
          }
          break;

        case LexerPhase.BinaryFirst:
          if (ch === "_") {
            break;
          }
          if (!isBinaryDigit(ch)) {
            return makeToken();
          }
          phase = LexerPhase.BinaryTail;
          tokenType = TokenType.BinaryLiteral;
          break;

        case LexerPhase.BinaryTail:
          if (!isBinaryDigit(ch) && ch !== "_") {
            return makeToken();
          }
          tokenType = TokenType.BinaryLiteral;
          break;

        case LexerPhase.DecimalOrReal:
          if (isDecimalDigit(ch) || ch === "_") {
            break;
          } else if (ch === "." && (this.input.peek() === null || isDecimalDigit(this.input.peek()!))) {
            phase = LexerPhase.RealFractionalFirst;
            tokenType = TokenType.Unknown;
          } else if (ch === "e" || ch === "E") {
            phase = LexerPhase.RealExponent;
            tokenType = TokenType.Unknown;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.RealFractionalFirst:
          if (isDecimalDigit(ch)) {
            phase = LexerPhase.RealFractionalTail;
            tokenType = TokenType.RealLiteral;
          } else if (ch === "e" || ch === "E") {
            phase = LexerPhase.RealExponent;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.RealFractionalTail:
          if (ch === "e" || ch === "E") {
            phase = LexerPhase.RealExponent;
            tokenType = TokenType.Unknown;
          } else if (!isDecimalDigit(ch) && ch !== "_") {
            return makeToken();
          }
          break;

        case LexerPhase.RealExponent:
          if (ch === "+" || ch === "-") {
            phase = LexerPhase.RealExponentSign;
          } else if (isDecimalDigit(ch)) {
            phase = LexerPhase.RealExponentTail;
            tokenType = TokenType.RealLiteral;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.RealExponentSign:
          if (isDecimalDigit(ch)) {
            phase = LexerPhase.RealExponentTail;
            tokenType = TokenType.RealLiteral;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.RealExponentTail:
          if (!isDecimalDigit(ch)) {
            return makeToken();
          }
          break;

        // A dollar sign is also a valid variable name. When it isn't a dollar left brace, we continue as if it was an identifier
        case LexerPhase.Dollar:
          if (ch === "{") {
            return completeToken(TokenType.DollarLBrace);
          }
          phase = LexerPhase.IdTail;
          useResolver = true;
          tokenType = TokenType.Identifier;
          if (!isIdContinuation(ch)) {
            makeToken();
          }
          break;

        case LexerPhase.StringTemplateLiteralBackSlash: {
          phase = LexerPhase.StringTemplateLiteral;
          const charAhead1 = this.input.ahead(0);
          const charAhead2 = this.input.ahead(1);

          if (charAhead1 === "`" || (charAhead1 === "$" && charAhead2 === "{")) {
            return completeToken(TokenType.StringLiteral);
          }
          break;
        }

        case LexerPhase.StringTemplateLiteral:
          switch (ch) {
            case "\\":
              phase = LexerPhase.StringTemplateLiteralBackSlash;
              tokenType = TokenType.Unknown;
              break phaseSwitch;
            case "`":
              return completeToken(TokenType.Backtick);
            case "$":
              const charAhead = this.input.ahead(0);
              if (charAhead === "{") {
                appendTokenChar();
                this.fetchNextChar();
                return completeToken(TokenType.DollarLBrace);
              }
          }
          const charAhead1 = this.input.ahead(0);
          const charAhead2 = this.input.ahead(1);

          if (charAhead1 === "`" || (charAhead1 === "$" && charAhead2 === "{")) {
            return completeToken(TokenType.StringLiteral);
          }
          break;

        case LexerPhase.String:
          if (ch === stringState) {
            return completeToken(TokenType.StringLiteral);
          } else if (isRestrictedInString(ch)) {
            return completeToken(TokenType.Unknown);
          } else if (ch === "\\") {
            phase = LexerPhase.StringBackSlash;
            tokenType = TokenType.Unknown;
          }
          break;

        // Start of string character escape
        case LexerPhase.StringBackSlash:
          switch (ch) {
            case "b":
            case "f":
            case "n":
            case "r":
            case "t":
            case "v":
            case "S":
            case "0":
            case "'":
            case '"':
            case "`":
            case "\\":
              phase = LexerPhase.String;
              break;
            case "x":
              phase = LexerPhase.StringHexa1;
              break;
            case "u":
              phase = LexerPhase.StringUHexa1;
              break;
            default:
              phase = LexerPhase.String;
              break;
          }
          break;

        // --- First hexadecimal digit of string character escape
        case LexerPhase.StringHexa1:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringHexa2;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Second hexadecimal digit of character escape
        case LexerPhase.StringHexa2:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.String;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- First hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa1:
          if (ch === "{") {
            phase = LexerPhase.StringUcp1;
            break;
          }
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUHexa2;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Second hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa2:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUHexa3;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Third hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa3:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUHexa4;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Fourth hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa4:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.String;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- First hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp1:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp2;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Second hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp2:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp3;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Third hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp3:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp4;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Fourth hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp4:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp5;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Fifth hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp5:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp6;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Sixth hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp6:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcpTail;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // --- Closing bracket of Unicode codepoint string character escape
        case LexerPhase.StringUcpTail:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // ====================================================================
        // --- We cannot continue
        default:
          return makeToken();
      }

      // --- Append the char to the current text
      appendTokenChar();

      // --- Go on with parsing the next character
    }

    /**
     * Appends the last character to the token, and manages positions
     */
    function appendTokenChar(): void {
      text += ch;
      lexer._prefetched = null;
      lexer._prefetchedPos = null;
      lexer._prefetchedColumn = null;
      lastEndPos = input.position;
      lastEndColumn = input.position;
    }

    /**
     * Packs the specified type of token to send back
     */
    function makeToken(): Token {
      if (useResolver) {
        tokenType =
          resolverHash.get(text) ??
          (isIdStart(text[0]) && text[text.length - 1] !== "'" ? TokenType.Identifier : TokenType.Unknown);
      }
      return {
        text,
        type: tokenType,
        startPosition: startPos,
        endPosition: lastEndPos,
        startLine: line,
        endLine: line,
        startColumn,
        endColumn: lastEndColumn,
      };
    }

    /**
     * Add the last character to the token and return it
     */
    function completeToken(suggestedType?: TokenType): Token {
      appendTokenChar();

      // --- Send back the token
      if (suggestedType !== undefined) {
        tokenType = suggestedType;
      }
      return makeToken();
    }
  }

  getStartingPhaseThenReset(): LexerPhase {
    if (this._phaseExternallySet !== null) {
      const phase = this._phaseExternallySet;
      this._phaseExternallySet = null;
      return phase;
    }
    return LexerPhase.Start;
  }

  /**
   * Fetches the next RegEx token from the input stream
   */
  private fetchRegEx(): RegExpLexerResult {
    // --- Get the tail
    const tailPosition = this._ahead.length > 0 ? this._ahead[0].startPosition : this._lastFetchPosition;
    const tail = this.input.getTail(tailPosition);

    // --- Parse the tail. If no error, the entire tail is the RegExp
    try {
      const regexpResult = parseRegExpLiteral(tail);
      const text = regexpResult.raw;

      // --- Consume the characters parsed successfully
      for (let i = 1; i < text.length; i++) {
        this.fetchNextChar();
        this._prefetched = null;
        this._prefetchedPos = null;
        this._prefetchedColumn = null;
      }

      this._ahead.length = 0;

      // --- Return the token
      return {
        success: true,
        pattern: regexpResult.pattern.raw,
        flags: regexpResult.flags.raw,
        length: text.length,
      };
    } catch (parseErr: any) {
      let errorIndex = parseErr.index;
      if (parseErr.toString().includes("Invalid flag")) {
        while (errorIndex < tail.length && "dgimsuy".includes(tail[errorIndex])) {
          errorIndex++;
        }
      }

      // --- If there is no error, something is wrong
      if (errorIndex === undefined) {
        return {
          success: false,
          pattern: tail[0],
        };
      }

      // --- Try to parse the tail before the error position
      const tailBeforeError = tail.substring(0, errorIndex);
      try {
        const regexpResult = parseRegExpLiteral(tailBeforeError);
        const text = regexpResult.raw;

        // --- Consume the characters parsed successfully
        for (let i = 1; i < text.length; i++) {
          this.fetchNextChar();
          this._prefetched = null;
          this._prefetchedPos = null;
          this._prefetchedColumn = null;
        }

        this._ahead.length = 0;

        // --- Return the token
        return {
          success: true,
          pattern: regexpResult.pattern.raw,
          flags: regexpResult.flags.raw,
          length: text.length,
        };
      } catch (parseErr2) {
        // --- This is really not a regexp
        return {
          success: false,
          pattern: tailBeforeError,
        };
      }
    }
  }
}

/**
 * Reserved ID-like tokens
 */
const resolverHash = new Map<string, TokenType>();
resolverHash.set("typeof", TokenType.Typeof);
resolverHash.set("Infinity", TokenType.Infinity);
resolverHash.set("NaN", TokenType.NaN);
resolverHash.set("true", TokenType.True);
resolverHash.set("false", TokenType.False);
resolverHash.set("undefined", TokenType.Undefined);
resolverHash.set("null", TokenType.Null);
resolverHash.set("in", TokenType.In);
resolverHash.set("let", TokenType.Let);
resolverHash.set("const", TokenType.Const);
resolverHash.set("var", TokenType.Var);
resolverHash.set("if", TokenType.If);
resolverHash.set("else", TokenType.Else);
resolverHash.set("return", TokenType.Return);
resolverHash.set("break", TokenType.Break);
resolverHash.set("continue", TokenType.Continue);
resolverHash.set("do", TokenType.Do);
resolverHash.set("while", TokenType.While);
resolverHash.set("for", TokenType.For);
resolverHash.set("of", TokenType.Of);
resolverHash.set("try", TokenType.Try);
resolverHash.set("catch", TokenType.Catch);
resolverHash.set("finally", TokenType.Finally);
resolverHash.set("throw", TokenType.Throw);
resolverHash.set("switch", TokenType.Switch);
resolverHash.set("case", TokenType.Case);
resolverHash.set("default", TokenType.Default);
resolverHash.set("delete", TokenType.Delete);
resolverHash.set("function", TokenType.Function);
resolverHash.set("as", TokenType.As);

/**
 * Tests if a token id EOF
 * @param t Token instance
 */
function isEof(t: Token): boolean {
  return t.type === TokenType.Eof;
}

/**
 * Tests if a token is whitespace
 * @param t Token instance
 */
function isWs(t: Token): boolean {
  return t.type <= TokenType.Ws;
}

/**
 * Tests if a character is an identifier start character
 * @param ch Character to test
 */
function isIdStart(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "_" || ch === "$";
}

/**
 * Tests if a character is an identifier continuation character
 * @param ch Character to test
 */
function isIdContinuation(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || (ch >= "0" && ch <= "9") || ch === "_" || ch === "$";
}

/**
 * Tests if a character is a binary digit
 * @param ch Character to test
 */
function isBinaryDigit(ch: string): boolean {
  return ch === "0" || ch === "1";
}

/**
 * Tests if a character is a decimal digit
 * @param ch Character to test
 */
function isDecimalDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

/**
 * Tests if a character is a hexadecimal digit
 * @param ch Character to test
 */
function isHexadecimalDigit(ch: string): boolean {
  return (ch >= "0" && ch <= "9") || (ch >= "A" && ch <= "F") || (ch >= "a" && ch <= "f");
}

/**
 * Tests if a character is restricted in a string
 * @param ch Character to test
 */
function isRestrictedInString(ch: string): boolean {
  return ch === "\r" || ch === "\n" || ch === "\u0085" || ch === "\u2028" || ch === "\u2029";
}

// --- Result from RegExp lexing
export type RegExpLexerResult = {
  success: boolean;
  pattern?: string;
  flags?: string;
  length?: number;
};
