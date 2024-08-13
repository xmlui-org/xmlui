import type { UemlToken } from "./UemlToken.js";

import { UemlInputStream } from "./UemlInputStream.js";
import { UemlTokenType } from "./UemlToken.js";

// States of the lexer's state machine
enum LexerPhase {
  Start = 0,
  InWhiteSpace,
  LeftAngle,
  LeftAngleExcl,
  LeftAngleExclDash,
  Comment,
  CommentDash,
  CommentTwoDash,
  SingleWord,
  CloseStart,
  HardLiteral,
  ScriptLiteral,
  InNestedWhitespace,
  NestedText,

  // --- String processing phases
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

  BackSlash,
  Ampersand,
}

// --- Regex used to recognize UEML identifiers
const uemlIdRegex = /^[A-Z_][$0-9A-Z_.\-]*$/i;

export const HARD_LITERAL_START = "<![CDATA[";
export const HARD_LITERAL_END = "]]>";

export const SCRIPT_LITERAL_START = "<script>";
export const SCRIPT_LITERAL_END = "</script>";

/**
 * This class implements the lexer of binding expressions
 */
export class UemlLexer {
  // --- Already fetched tokens
  private _ahead: UemlToken[] = [];

  // --- Prefetched character (from the next token)
  private _prefetched: string | null = null;

  // --- Prefetched character position (from the next token)
  private _prefetchedPos: number | null = null;

  // --- Prefetched character column (from the next token)
  private _prefetchedColumn: number | null = null;

  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(public readonly input: UemlInputStream) {}

  /**
   * Fetches the next token without advancing to its position
   * @param ws If true, retrieve whitespaces too
   */
  peek(ws = false): UemlToken {
    return this.ahead(0, ws);
  }

  /**
   * Reads tokens ahead
   * @param n Number of token positions to read ahead
   * @param ws If true, retrieve whitespaces too
   */
  ahead(n = 1, ws = false): UemlToken {
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
   @param searchForNested Search for a nested element token   */
  get(ws = false, searchForNested = false): UemlToken {
    if (this._ahead.length > 0) {
      const token = this._ahead.shift();
      if (!token) {
        throw new Error("Token expected");
      }
      return token;
    }
    while (true) {
      const token = this.fetch(searchForNested);
      if (isEof(token) || ws || (!ws && !isWs(token))) {
        return token;
      }
    }
  }

  /**
   * Fetches the next child element token without advancing to its position
   */
  peekNested(): UemlToken {
    if (!this._ahead.length) {
      const token = this.fetch(true);
      if (isEof(token)) {
        return token;
      }
      this._ahead.push(token);
    }
    return this._ahead[0];
  }

  /**
   * Fetches the next token from the input stream
   * @param searchForNested Search for a nested element token
   */
  private fetch(searchForNested = false): UemlToken {
    // --- Captured constants used in nested functions
    const lexer = this;
    const input = this.input;
    const startPos = this._prefetchedPos || input.position;
    const line = input.line;
    const startColumn = this._prefetchedColumn || input.column;

    // --- State variables
    let stringState = null;
    let text = "";
    let tokenType = UemlTokenType.Eof;
    let lastEndPos = input.position;
    let lastEndColumn = input.column;
    let ch: string | null = null;
    let skipTextAppend = false;

    // --- Start from the beginning
    let phase: LexerPhase = LexerPhase.Start;

    // --- Process all token characters
    while (true) {
      // --- Get the next character
      ch = fetchNextChar();
      skipTextAppend = false;

      // --- In case of EOF, return the current token data
      if (ch === null) {
        return makeToken();
      }

      // --- Set the initial token type to unknown for the other characters
      if (tokenType === UemlTokenType.Eof) {
        tokenType = UemlTokenType.Unknown;
      }

      // --- Follow the lexer state machine
      switch (phase) {
        // ====================================================================
        // Process the first character
        case LexerPhase.Start:
          switch (ch) {
            // --- Go on with whitespaces
            case " ":
            case "\t":
            case "\n":
            case "\r":
              if (searchForNested) {
                phase = searchForNested ? LexerPhase.InNestedWhitespace : LexerPhase.InWhiteSpace;
                tokenType = UemlTokenType.NestedText;
              } else {
                phase = LexerPhase.InWhiteSpace;
                tokenType = UemlTokenType.Ws;
              }
              break;

            case "<":
              phase = handleHardLiteralCase();
              if (phase === LexerPhase.LeftAngle) {
                phase = handleScriptLiteralCase();
              }
              break;

            case ">":
              return completeToken(UemlTokenType.NodeEnd);

            case "/":
              if (searchForNested) {
                phase = LexerPhase.NestedText;
                tokenType = UemlTokenType.NestedText;
                break;
              }
              phase = LexerPhase.CloseStart;
              break;

            case "=":
              if (searchForNested) {
                phase = LexerPhase.NestedText;
                tokenType = UemlTokenType.NestedText;
                break;
              }
              return completeToken(UemlTokenType.Equal);

            case ":":
              if (searchForNested) {
                phase = LexerPhase.NestedText;
                tokenType = UemlTokenType.NestedText;
                break;
              }
              return completeToken(UemlTokenType.Colon);

            case "'":
            case '"':
            case "`":
              phase = LexerPhase.String;
              stringState = ch;
              break;

            case "&":
              if (searchForNested) {
                phase = LexerPhase.Ampersand;
                tokenType = UemlTokenType.NestedText;
                break;
              }
              return completeToken(UemlTokenType.Unknown);

            case "\\":
              if (searchForNested) {
                phase = LexerPhase.BackSlash;
                tokenType = UemlTokenType.NestedText;
                break;
              }
              return completeToken(UemlTokenType.Unknown);

            default:
              if (isSingleWordChar(ch)) {
                if (searchForNested) {
                  phase = LexerPhase.NestedText;
                  tokenType = UemlTokenType.NestedText;
                } else {
                  phase = LexerPhase.SingleWord;
                  tokenType = UemlTokenType.SingleWord;
                }
                break;
              }
              if (searchForNested) {
                phase = LexerPhase.NestedText;
                tokenType = UemlTokenType.NestedText;
                break;
              }
              return completeToken(UemlTokenType.Unknown);
          }
          break;

        // ====================================================================
        // Whitespace processing
        case LexerPhase.InWhiteSpace:
          if (ch !== " " && ch !== "\t" && ch !== "\r" && ch !== "\n") {
            return makeToken();
          }
          break;

        case LexerPhase.InNestedWhitespace:
          if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n") {
            break;
          }

          if (ch === "<") {
            phase = handleHardLiteralCase();
            if (phase === LexerPhase.LeftAngle) {
              phase = handleScriptLiteralCase();
            }
            break;
          }

          if (ch === "'" || ch === '"' || ch === "`") {
            phase = LexerPhase.String;
            stringState = ch;
            break;
          }

          // --- This is the start of a nested text
          phase = LexerPhase.NestedText;
          tokenType = UemlTokenType.NestedText;
          break;

        // ====================================================================
        // Hard literal processing
        case LexerPhase.HardLiteral:
          if (ch === HARD_LITERAL_END[0]) {
            // --- Recognize if hard literal end found
            let isHardLiteral = true;
            for (let i = 1; i < HARD_LITERAL_END.length; i++) {
              isHardLiteral = isHardLiteral && input.ahead(i - 1) === HARD_LITERAL_END[i];
              if (!isHardLiteral) break;
            }
            if (isHardLiteral) {
              text += HARD_LITERAL_END;
              skipTextAppend = true;
              for (let i = 1; i < HARD_LITERAL_END.length; i++) {
                input.get();
              }
              return completeToken(UemlTokenType.HardLiteral);
            }
            break;
          }

          // --- We're still within a hard literal
          break;

        // ====================================================================
        // Hard literal processing
        case LexerPhase.ScriptLiteral:
          if (ch === SCRIPT_LITERAL_END[0]) {
            // --- Recognize if hard literal end found
            let isScriptLiteral = true;
            for (let i = 1; i < SCRIPT_LITERAL_END.length; i++) {
              isScriptLiteral = isScriptLiteral && input.ahead(i - 1) === SCRIPT_LITERAL_END[i];
              if (!isScriptLiteral) break;
            }
            if (isScriptLiteral) {
              text += SCRIPT_LITERAL_END;
              skipTextAppend = true;
              for (let i = 1; i < SCRIPT_LITERAL_END.length; i++) {
                input.get();
              }
              return completeToken(UemlTokenType.ScriptLiteral);
            }
            break;
          }

          // --- We're still within a script literal
          break;

        // ====================================================================
        // Nested text processing
        case LexerPhase.BackSlash:
          if (ch === "&") {
            // --- Remove the last "\"
            text = text.substring(0, text.length - 1);
          }
          phase = LexerPhase.NestedText;
          tokenType = UemlTokenType.NestedText;
          break;

        case LexerPhase.Ampersand:
          const tail = input.getTail(input.position - 1);
          if (tail.startsWith("amp;")) {
            text = text.substring(0, text.length - 1);
            ch = "&";
            input.get(); // m
            input.get(); // p
            input.get(); // ;
          } else if (tail.startsWith("gt;")) {
            text = text.substring(0, text.length - 1);
            ch = ">";
            input.get(); // t
            input.get(); // ;
          } else if (tail.startsWith("lt;")) {
            text = text.substring(0, text.length - 1);
            ch = "<";
            input.get(); // t
            input.get(); // ;
          } else if (tail.startsWith("apos;")) {
            text = text.substring(0, text.length - 1);
            ch = "'";
            input.get(); // p
            input.get(); // o
            input.get(); // s
            input.get(); // ;
          } else if (tail.startsWith("quot;")) {
            text = text.substring(0, text.length - 1);
            ch = '"';
            input.get(); // u
            input.get(); // o
            input.get(); // t
            input.get(); // ;
          }
          phase = LexerPhase.NestedText;
          break;

        case LexerPhase.NestedText:
          if (ch === "\\") {
            phase = LexerPhase.BackSlash;
          } else if (ch === "&") {
            phase = LexerPhase.Ampersand;
          } else if (ch === "<") {
            return makeToken();
          }

          // --- We're still within a nested text
          break;

        // ====================================================================
        // Opening and closing tags
        case LexerPhase.LeftAngle:
          if (ch === "!") {
            phase = LexerPhase.LeftAngleExcl;
            tokenType = UemlTokenType.Unknown;
          } else if (ch === "/") {
            return completeToken(UemlTokenType.CloseNodeStart);
          } else {
            return makeToken();
          }
          break;

        // --- Testing for closing tags
        case LexerPhase.CloseStart:
          return ch === ">" ? completeToken(UemlTokenType.NodeClose) : makeToken();

        // ====================================================================
        // Collecting "single word" characters
        case LexerPhase.SingleWord:
          if (!isSingleWordChar(ch)) {
            return makeToken();
          }
          break;

        // ====================================================================
        // Comment processing
        case LexerPhase.LeftAngleExcl:
          if (ch === "-") {
            phase = LexerPhase.LeftAngleExclDash;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.LeftAngleExclDash:
          if (ch === "-") {
            phase = LexerPhase.Comment;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.Comment:
          if (ch === "-") {
            phase = LexerPhase.CommentDash;
          }
          break;

        case LexerPhase.CommentDash:
          phase = ch === "-" ? LexerPhase.CommentTwoDash : LexerPhase.Comment;
          break;

        case LexerPhase.CommentTwoDash:
          if (ch === ">") {
            return completeToken(UemlTokenType.Comment);
          } else {
            phase = LexerPhase.Comment;
          }
          break;

        // ====================================================================
        // String processing

        case LexerPhase.String:
          if (ch === stringState) {
            if (searchForNested) {
              const tail = input.getTail(input.position)?.trim();
              if (tail?.[0] === "<") {
                return completeToken(UemlTokenType.StringLiteral);
              }
              phase = LexerPhase.NestedText;
              tokenType = UemlTokenType.NestedText;
              break;
            } else {
              return completeToken(UemlTokenType.StringLiteral);
            }
          } else if (ch === "\\") {
            const tail = input.getTail(input.position);
            if (tail.startsWith("&amp;")) {
              text += "&amp";
              ch = ";";
              input.get(); // &
              input.get(); // a
              input.get(); // m
              input.get(); // p
              input.get(); // ;
            } else if (tail.startsWith("&gt;")) {
              text += "&gt";
              ch = ";";
              input.get(); // &
              input.get(); // g
              input.get(); // t
              input.get(); // ;
            } else if (tail.startsWith("&lt;")) {
              text += "&lt";
              ch = ";";
              input.get(); // &
              input.get(); // l
              input.get(); // t
              input.get(); // ;
            } else if (tail.startsWith("&apos;")) {
              text += "&apos";
              ch = ";";
              input.get(); // &
              input.get(); // a
              input.get(); // p
              input.get(); // o
              input.get(); // s
              input.get(); // ;
            } else if (tail.startsWith("&quot;")) {
              text += "&quot";
              ch = ";";
              input.get(); // &
              input.get(); // q
              input.get(); // u
              input.get(); // o
              input.get(); // t
              input.get(); // ;
            } else {
              phase = LexerPhase.StringBackSlash;
              tokenType = UemlTokenType.Unknown;
            }
          } else {
            const tail = input.getTail(input.position - 1);
            if (tail.startsWith("&amp;")) {
              ch = "&";
              input.get(); // a
              input.get(); // m
              input.get(); // p
              input.get(); // ;
            } else if (tail.startsWith("&gt;")) {
              ch = ">";
              input.get(); // g
              input.get(); // t
              input.get(); // ;
            } else if (tail.startsWith("&lt;")) {
              ch = "<";
              input.get(); // l
              input.get(); // t
              input.get(); // ;
            } else if (tail.startsWith("&apos;")) {
              ch = "'";
              input.get(); // a
              input.get(); // p
              input.get(); // o
              input.get(); // s
              input.get(); // ;
            } else if (tail.startsWith("&quot;")) {
              ch = '"';
              input.get(); // q
              input.get(); // u
              input.get(); // o
              input.get(); // t
              input.get(); // ;
            }
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
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Second hexadecimal digit of character escape
        case LexerPhase.StringHexa2:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.String;
          } else {
            return completeToken(UemlTokenType.Unknown);
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
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Second hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa2:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUHexa3;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Third hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa3:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUHexa4;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Fourth hexadecimal digit of Unicode string character escape
        case LexerPhase.StringUHexa4:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.String;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- First hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp1:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp2;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Second hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp2:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp3;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Third hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp3:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp4;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Fourth hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp4:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp5;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Fifth hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp5:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcp6;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Sixth hexadecimal digit of Unicode codepoint string character escape
        case LexerPhase.StringUcp6:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringUcpTail;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;

        // --- Closing bracket of Unicode codepoint string character escape
        case LexerPhase.StringUcpTail:
          if (ch === "}") {
            phase = LexerPhase.String;
          } else {
            return completeToken(UemlTokenType.Unknown);
          }
          break;
      }

      // --- Append the char to the current text
      appendTokenChar();

      // --- Go on with parsing the next character
    }

    // --- Handle hard literal checking
    function handleHardLiteralCase(): LexerPhase {
      let isHardLiteral = true;
      for (let i = 1; i < HARD_LITERAL_START.length; i++) {
        const ahead = input.ahead(i - 1);
        isHardLiteral = isHardLiteral && ahead === HARD_LITERAL_START[i];
        if (!isHardLiteral) break;
      }
      if (isHardLiteral) {
        text += HARD_LITERAL_START;
        skipTextAppend = true;
        for (let i = 1; i < HARD_LITERAL_START.length; i++) {
          input.get();
        }
        return LexerPhase.HardLiteral;
      }
      tokenType = UemlTokenType.OpenNodeStart;
      return LexerPhase.LeftAngle;
    }

    // --- Handle hard literal checking
    function handleScriptLiteralCase(): LexerPhase {
      let isScriptLiteral = true;
      for (let i = 1; i < SCRIPT_LITERAL_START.length; i++) {
        const ahead = input.ahead(i - 1);
        isScriptLiteral = isScriptLiteral && ahead === SCRIPT_LITERAL_START[i];
        if (!isScriptLiteral) break;
      }
      if (isScriptLiteral) {
        text += SCRIPT_LITERAL_START;
        skipTextAppend = true;
        for (let i = 1; i < SCRIPT_LITERAL_START.length; i++) {
          input.get();
        }
        return LexerPhase.ScriptLiteral;
      }
      tokenType = UemlTokenType.OpenNodeStart;
      return LexerPhase.LeftAngle;
    }

    /**
     * Appends the last character to the token, and manages positions
     */
    function appendTokenChar(): void {
      if (!skipTextAppend) {
        text += ch;
      }
      lexer._prefetched = null;
      lexer._prefetchedPos = null;
      lexer._prefetchedColumn = null;
      lastEndPos = input.position;
      lastEndColumn = input.position;
    }

    /**
     * Fetches the next character from the input stream
     */
    function fetchNextChar(): string | null {
      if (!lexer._prefetched) {
        lexer._prefetchedPos = input.position;
        lexer._prefetched = input.get();
      }
      return lexer._prefetched;
    }

    /**
     * Packs the specified type of token to send back
     */
    function makeToken(): UemlToken {
      if (tokenType === UemlTokenType.SingleWord) {
        // --- A single word may be an identifier
        if (uemlIdRegex.test(text)) {
          tokenType = UemlTokenType.Identifier;
        } else {
          tokenType = UemlTokenType.Unknown;
        }
      }
      return {
        text,
        type: tokenType,
        location: {
          startPosition: startPos,
          endPosition: lastEndPos,
          startLine: line,
          endLine: line,
          startColumn,
          endColumn: lastEndColumn,
        },
      };
    }

    /**
     * Add the last character to the token and return it
     */
    function completeToken(suggestedType?: UemlTokenType): UemlToken {
      appendTokenChar();

      // --- Send back the token
      if (suggestedType !== undefined) {
        tokenType = suggestedType;
      }
      return makeToken();
    }
  }
}

/**
 * Tests if a token id EOF
 * @param t Token instance
 */
function isEof(t: UemlToken): boolean {
  return t.type === UemlTokenType.Eof;
}

/**
 * Tests if a token is whitespace
 * @param t Token instance
 */
function isWs(t: UemlToken): boolean {
  return t.type <= UemlTokenType.Ws;
}

/**
 * Tests if a character is an identifier start character
 * @param ch Character to test
 */
function isSingleWordChar(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "$" ||
    ch === "#" ||
    ch === "@" ||
    ch === "_" ||
    ch === "." ||
    ch === "," ||
    ch === "%" ||
    ch === "(" ||
    ch === ")" ||
    ch === "{" ||
    ch === "}" ||
    ch === "[" ||
    ch === "]" ||
    ch === "+" ||
    ch === "*" ||
    ch === "-"
  );
}

/**
 * Tests if a character is a hexadecimal digit
 * @param ch Character to test
 */
function isHexadecimalDigit(ch: string): boolean {
  return (ch >= "0" && ch <= "9") || (ch >= "A" && ch <= "F") || (ch >= "a" && ch <= "f");
}
