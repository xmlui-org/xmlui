import type { StyleToken } from "./tokens";
import type { StyleInputStream } from "./StyleInputStream";
import { StyleTokenType } from "./tokens";

// States of the lexer's state machine
enum LexerPhase {
  Start = 0,
  InWhiteSpace,
  IdTail,
  Dot,
  IdOrNumber,
  IntPart,
  FractPart,
  ColorCode,
  String,
}

/**
 * This class implements the lexer of binding expressions
 */
export class StyleLexer {
  // --- Already fetched tokens
  private _ahead: StyleToken[] = [];

  // --- Prefetched character (from the next token)
  private _prefetched: string | null = null;

  // --- Prefetched character position (from the next token)
  private _prefetchedPos: number | null = null;

  // --- input position at the beginning of last fetch
  private _lastFetchPosition = 0;

  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(public readonly input: StyleInputStream) {}

  /**
   * Fetches the next token without advancing to its position
   * @param ws If true, retrieve whitespaces too
   */
  peek(ws = false): StyleToken {
    return this.ahead(0, ws);
  }

  /**
   * Reads tokens ahead
   * @param n Number of token positions to read ahead
   * @param ws If true, retrieve whitespaces too
   */
  ahead(n = 1, ws = false): StyleToken {
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
  get(ws = false): StyleToken {
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
   * Gets the remaining characters after the parsing phase
   */
  getTail(): string {
    return this._ahead.length > 0
      ? this.input.getTail(this._ahead[0].start)
      : this.input.getTail(this._lastFetchPosition);
  }

  /**
   * Fetches the next token from the input stream
   */
  private fetch(): StyleToken {
    // --- Captured constants used in nested functions
    const lexer = this;
    const input = this.input;
    const startPos = this._prefetchedPos || input.position;
    this._lastFetchPosition = this.input.position;

    // --- State variables
    let text = "";
    let tokenType = StyleTokenType.Eof;
    let lastEndPos = input.position;
    let ch: string | null = null;
    let useResolver = false;
    let stringWrapper = "";

    // --- Start from the beginning
    let phase: LexerPhase = LexerPhase.Start;

    // --- Process all token characters
    while (true) {
      // --- Get the next character
      ch = fetchNextChar();

      // --- In case of EOF, return the current token data
      if (ch === null) {
        return makeToken();
      }

      // --- Set the initial token type to unknown for the other characters
      if (tokenType === StyleTokenType.Eof) {
        tokenType = StyleTokenType.Unknown;
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
              phase = LexerPhase.InWhiteSpace;
              tokenType = StyleTokenType.Ws;
              break;

            case "-":
              phase = LexerPhase.IdOrNumber;
              break;

            case "*":
              return completeToken(StyleTokenType.Star);

            case "%":
              return completeToken(StyleTokenType.Percentage);

            case "(":
              return completeToken(StyleTokenType.LParent);

            case ")":
              return completeToken(StyleTokenType.RParent);

            case ",":
              return completeToken(StyleTokenType.Comma);

            case "/":
              return completeToken(StyleTokenType.Slash);

            // --- Start of color code
            case "#":
              phase = LexerPhase.ColorCode;
              break;

            // --- Number starting with dot
            case ".":
              phase = LexerPhase.FractPart;
              break;

            case "'":
            case '"':
              stringWrapper = ch;
              phase = LexerPhase.String;
              break;

            default:
              if (isIdStart(ch)) {
                useResolver = true;
                phase = LexerPhase.IdTail;
                tokenType = StyleTokenType.Identifier;
              } else if (isDecimalDigit(ch)) {
                phase = LexerPhase.IntPart;
                tokenType = StyleTokenType.Number;
              } else {
                completeToken(StyleTokenType.Unknown);
              }
              break;
          }
          break;

        // --- Looking for the end of whitespace
        case LexerPhase.InWhiteSpace:
          if (ch !== " " && ch !== "\t" && ch !== "\r" && ch !== "\n") {
            return makeToken();
          }
          break;

        case LexerPhase.IdTail:
          if (!isIdContinuation(ch)) {
            return makeToken();
          }
          break;

        case LexerPhase.IdOrNumber:
          if (ch === ".") {
            phase = LexerPhase.FractPart;
          } else if (isDecimalDigit(ch)) {
            phase = LexerPhase.IntPart;
            tokenType = StyleTokenType.Number;
          } else if (isIdContinuation(ch)) {
            phase = LexerPhase.IdTail;
            tokenType = StyleTokenType.Identifier;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.IntPart:
          if (isDecimalDigit(ch)) {
            break;
          } else if (ch === ".") {
            phase = LexerPhase.FractPart;
            tokenType = StyleTokenType.Unknown;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.FractPart:
          if (!isDecimalDigit(ch)) {
            return makeToken();
          }
          tokenType = StyleTokenType.Number;
          break;

        case LexerPhase.ColorCode:
          if (isHexadecimalDigit(ch)) {
            tokenType =
              text.length === 3 || text.length === 6 || text.length === 4 || text.length === 8
                ? StyleTokenType.HexaColor
                : StyleTokenType.Unknown;
            break;
          } else {
            return makeToken();
          }

        case LexerPhase.String:
          if (ch === stringWrapper) {
            stringWrapper = "";
            return completeToken(StyleTokenType.String);
          }
          break;

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
      lastEndPos = input.position;
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
    function makeToken(): StyleToken {
      if (useResolver) {
        tokenType = styleKeywords[text] ?? (isIdStart(text[0]) ? StyleTokenType.Identifier : StyleTokenType.Unknown);
      }
      return {
        text,
        type: tokenType,
        start: startPos,
        end: lastEndPos,
      };
    }

    /**
     * Add the last character to the token and return it
     */
    function completeToken(suggestedType?: StyleTokenType): StyleToken {
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
function isEof(t: StyleToken): boolean {
  return t.type === StyleTokenType.Eof;
}

/**
 * Tests if a token is whitespace
 * @param t Token instance
 */
function isWs(t: StyleToken): boolean {
  return t.type <= StyleTokenType.Ws;
}

/**
 * Tests if a character is an identifier start character
 * @param ch Character to test
 */
function isIdStart(ch: string): boolean {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") || ch === "-" || ch === "_" || ch === "$";
}

/**
 * Tests if a character is an identifier continuation character
 * @param ch Character to test
 */
function isIdContinuation(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "-" ||
    ch === "_" ||
    ch === "$"
  );
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
 * Reserved ID-like tokens
 */
export const styleKeywords: Record<string, StyleTokenType> = {
  // --- "none" keyword
  none: StyleTokenType.None,

  // --- Size unit tokens
  auto: StyleTokenType.Auto,
  px: StyleTokenType.SizeUnit,
  cm: StyleTokenType.SizeUnit,
  mm: StyleTokenType.SizeUnit,
  in: StyleTokenType.SizeUnit,
  pt: StyleTokenType.SizeUnit,
  pc: StyleTokenType.SizeUnit,
  em: StyleTokenType.SizeUnit,
  rem: StyleTokenType.SizeUnit,
  vw: StyleTokenType.SizeUnit,
  vh: StyleTokenType.SizeUnit,
  ex: StyleTokenType.SizeUnit,
  ch: StyleTokenType.SizeUnit,
  vmin: StyleTokenType.SizeUnit,
  vmax: StyleTokenType.SizeUnit,

  // --- Alignment tokens
  start: StyleTokenType.Alignment,
  center: StyleTokenType.Alignment,
  end: StyleTokenType.Alignment,

  // --- Text alignment tokens
  left: StyleTokenType.TextAlignment,
  right: StyleTokenType.TextAlignment,
  justify: StyleTokenType.TextAlignment,

  // --- Orientation tokens
  vertical: StyleTokenType.Orientation,
  horizontal: StyleTokenType.Orientation,

  // --- Direction tokens
  ltr: StyleTokenType.Direction,
  rtl: StyleTokenType.Direction,

  // --- FontFamily tokens
  serif: StyleTokenType.FontFamily,
  sansSerif: StyleTokenType.FontFamily,
  mono: StyleTokenType.FontFamily,

  // --- Scrolling tokens
  visible: StyleTokenType.Scrolling,
  hidden: StyleTokenType.Scrolling,
  scroll: StyleTokenType.Scrolling,

  // --- Text transform tokens
  capitalize: StyleTokenType.TextTransform,
  uppercase: StyleTokenType.TextTransform,
  lowercase: StyleTokenType.TextTransform,
  "full-width": StyleTokenType.TextTransform,
  "full-size-kana": StyleTokenType.TextTransform,

  // --- Border style values
  dotted: StyleTokenType.BorderStyle,
  dashed: StyleTokenType.BorderStyle,
  solid: StyleTokenType.BorderStyle,
  double: StyleTokenType.BorderStyle,
  groove: StyleTokenType.BorderStyle,
  ridge: StyleTokenType.BorderStyle,
  inset: StyleTokenType.BorderStyle,
  outset: StyleTokenType.BorderStyle,

  // --- Angle tokens
  deg: StyleTokenType.Angle,
  rad: StyleTokenType.Angle,
  grad: StyleTokenType.Angle,
  turn: StyleTokenType.Angle,

  // --- Weight tokens
  lighter: StyleTokenType.FontWeight,
  normal: StyleTokenType.FontWeight,
  bold: StyleTokenType.FontWeight,
  bolder: StyleTokenType.FontWeight,

  // --- Boolean tokens
  true: StyleTokenType.Boolean,
  false: StyleTokenType.Boolean,
  yes: StyleTokenType.Boolean,
  no: StyleTokenType.Boolean,
  on: StyleTokenType.Boolean,
  off: StyleTokenType.Boolean,

  // --- Color function tokens
  rgb: StyleTokenType.ColorFunc,
  rgba: StyleTokenType.ColorFunc,
  hsl: StyleTokenType.ColorFunc,
  hsla: StyleTokenType.ColorFunc,

  // --- Text decoration line
  underline: StyleTokenType.DecorationLine,
  overline: StyleTokenType.DecorationLine,
  "line-through": StyleTokenType.DecorationLine,

  // --- user-select tokens
  all: StyleTokenType.UserSelect,
  text: StyleTokenType.UserSelect,
  contain: StyleTokenType.UserSelect,

  // --- Other tokens
  reset: StyleTokenType.Reset,

  // --- Color codes
  transparent: StyleTokenType.ColorName,

  // CSS Level 1
  black: StyleTokenType.ColorName,
  silver: StyleTokenType.ColorName,
  gray: StyleTokenType.ColorName,
  white: StyleTokenType.ColorName,
  maroon: StyleTokenType.ColorName,
  red: StyleTokenType.ColorName,
  purple: StyleTokenType.ColorName,
  fuchsia: StyleTokenType.ColorName,
  green: StyleTokenType.ColorName,
  lime: StyleTokenType.ColorName,
  olive: StyleTokenType.ColorName,
  yellow: StyleTokenType.ColorName,
  navy: StyleTokenType.ColorName,
  blue: StyleTokenType.ColorName,
  teal: StyleTokenType.ColorName,
  aqua: StyleTokenType.ColorName,

  // CSS Level 2
  orange: StyleTokenType.ColorName,

  // CSS Level 3
  aliceblue: StyleTokenType.ColorName,
  antiquewhite: StyleTokenType.ColorName,
  aquamarine: StyleTokenType.ColorName,
  azure: StyleTokenType.ColorName,
  beige: StyleTokenType.ColorName,
  bisque: StyleTokenType.ColorName,
  blanchedalmond: StyleTokenType.ColorName,
  blueviolet: StyleTokenType.ColorName,
  brown: StyleTokenType.ColorName,
  burlywood: StyleTokenType.ColorName,
  cadetblue: StyleTokenType.ColorName,
  chartreuse: StyleTokenType.ColorName,
  chocolate: StyleTokenType.ColorName,
  coral: StyleTokenType.ColorName,
  cornflowerblue: StyleTokenType.ColorName,
  cornsilk: StyleTokenType.ColorName,
  crimson: StyleTokenType.ColorName,
  cyan: StyleTokenType.ColorName,
  darkblue: StyleTokenType.ColorName,
  darkcyan: StyleTokenType.ColorName,
  darkgoldenrod: StyleTokenType.ColorName,
  darkgray: StyleTokenType.ColorName,
  darkgreen: StyleTokenType.ColorName,
  darkgrey: StyleTokenType.ColorName,
  darkkhaki: StyleTokenType.ColorName,
  darkmagenta: StyleTokenType.ColorName,
  darkolivegreen: StyleTokenType.ColorName,
  darkorange: StyleTokenType.ColorName,
  darkorchid: StyleTokenType.ColorName,
  darkred: StyleTokenType.ColorName,
  darksalmon: StyleTokenType.ColorName,
  darkseagreen: StyleTokenType.ColorName,
  darkslateblue: StyleTokenType.ColorName,
  darkslategray: StyleTokenType.ColorName,
  darkslategrey: StyleTokenType.ColorName,
  darkturquoise: StyleTokenType.ColorName,
  darkviolet: StyleTokenType.ColorName,
  deeppink: StyleTokenType.ColorName,
  deepskyblue: StyleTokenType.ColorName,
  dimgray: StyleTokenType.ColorName,
  dimgrey: StyleTokenType.ColorName,
  dodgerblue: StyleTokenType.ColorName,
  firebrick: StyleTokenType.ColorName,
  floralwhite: StyleTokenType.ColorName,
  forestgreen: StyleTokenType.ColorName,
  gainsboro: StyleTokenType.ColorName,
  ghostwhite: StyleTokenType.ColorName,
  gold: StyleTokenType.ColorName,
  goldenrod: StyleTokenType.ColorName,
  greenyellow: StyleTokenType.ColorName,
  grey: StyleTokenType.ColorName,
  honeydew: StyleTokenType.ColorName,
  hotpink: StyleTokenType.ColorName,
  indianred: StyleTokenType.ColorName,
  indigo: StyleTokenType.ColorName,
  ivory: StyleTokenType.ColorName,
  khaki: StyleTokenType.ColorName,
  lavender: StyleTokenType.ColorName,
  lavenderblush: StyleTokenType.ColorName,
  lawngreen: StyleTokenType.ColorName,
  lemonchiffon: StyleTokenType.ColorName,
  lightblue: StyleTokenType.ColorName,
  lightcoral: StyleTokenType.ColorName,
  lightcyan: StyleTokenType.ColorName,
  lightgoldenrodyellow: StyleTokenType.ColorName,
  lightgray: StyleTokenType.ColorName,
  lightgreen: StyleTokenType.ColorName,
  lightgrey: StyleTokenType.ColorName,
  lightpink: StyleTokenType.ColorName,
  lightsalmon: StyleTokenType.ColorName,
  lightseagreen: StyleTokenType.ColorName,
  lightskyblue: StyleTokenType.ColorName,
  lightslategray: StyleTokenType.ColorName,
  lightslategrey: StyleTokenType.ColorName,
  lightsteelblue: StyleTokenType.ColorName,
  lightyellow: StyleTokenType.ColorName,
  limegreen: StyleTokenType.ColorName,
  linen: StyleTokenType.ColorName,
  magenta: StyleTokenType.ColorName,
  mediumaquamarine: StyleTokenType.ColorName,
  mediumblue: StyleTokenType.ColorName,
  mediumorchid: StyleTokenType.ColorName,
  mediumpurple: StyleTokenType.ColorName,
  mediumseagreen: StyleTokenType.ColorName,
  mediumslateblue: StyleTokenType.ColorName,
  mediumspringgreen: StyleTokenType.ColorName,
  mediumturquoise: StyleTokenType.ColorName,
  mediumvioletred: StyleTokenType.ColorName,
  midnightblue: StyleTokenType.ColorName,
  mintcream: StyleTokenType.ColorName,
  mistyrose: StyleTokenType.ColorName,
  moccasin: StyleTokenType.ColorName,
  navajowhite: StyleTokenType.ColorName,
  oldlace: StyleTokenType.ColorName,
  olivedrab: StyleTokenType.ColorName,
  orangered: StyleTokenType.ColorName,
  orchid: StyleTokenType.ColorName,
  palegoldenrod: StyleTokenType.ColorName,
  palegreen: StyleTokenType.ColorName,
  paleturquoise: StyleTokenType.ColorName,
  palevioletred: StyleTokenType.ColorName,
  papayawhip: StyleTokenType.ColorName,
  peachpuff: StyleTokenType.ColorName,
  peru: StyleTokenType.ColorName,
  pink: StyleTokenType.ColorName,
  plum: StyleTokenType.ColorName,
  powderblue: StyleTokenType.ColorName,
  rosybrown: StyleTokenType.ColorName,
  royalblue: StyleTokenType.ColorName,
  saddlebrown: StyleTokenType.ColorName,
  salmon: StyleTokenType.ColorName,
  sandybrown: StyleTokenType.ColorName,
  seagreen: StyleTokenType.ColorName,
  seashell: StyleTokenType.ColorName,
  sienna: StyleTokenType.ColorName,
  skyblue: StyleTokenType.ColorName,
  slateblue: StyleTokenType.ColorName,
  slategray: StyleTokenType.ColorName,
  slategrey: StyleTokenType.ColorName,
  snow: StyleTokenType.ColorName,
  springgreen: StyleTokenType.ColorName,
  steelblue: StyleTokenType.ColorName,
  tan: StyleTokenType.ColorName,
  thistle: StyleTokenType.ColorName,
  tomato: StyleTokenType.ColorName,
  turquoise: StyleTokenType.ColorName,
  violet: StyleTokenType.ColorName,
  wheat: StyleTokenType.ColorName,
  whitesmoke: StyleTokenType.ColorName,
  yellowgreen: StyleTokenType.ColorName,

  // CSS Level 4
  rebeccapurple: StyleTokenType.ColorName,

  // --- Cursor tokens
  default: StyleTokenType.Default,
  "context-menu": StyleTokenType.Cursor,
  help: StyleTokenType.Cursor,
  pointer: StyleTokenType.Cursor,
  progress: StyleTokenType.Cursor,
  wait: StyleTokenType.Cursor,
  cell: StyleTokenType.Cursor,
  crosshair: StyleTokenType.Cursor,
  "vertical-text": StyleTokenType.Cursor,
  alias: StyleTokenType.Cursor,
  copy: StyleTokenType.Cursor,
  move: StyleTokenType.Cursor,
  "no-drop": StyleTokenType.Cursor,
  "not-allowed": StyleTokenType.Cursor,
  grab: StyleTokenType.Cursor,
  grabbing: StyleTokenType.Cursor,
  "all-scroll": StyleTokenType.Cursor,
  "col-resize": StyleTokenType.Cursor,
  "row-resize": StyleTokenType.Cursor,
  "n-resize": StyleTokenType.Cursor,
  "e-resize": StyleTokenType.Cursor,
  "s-resize": StyleTokenType.Cursor,
  "w-resize": StyleTokenType.Cursor,
  "ne-resize": StyleTokenType.Cursor,
  "nw-resize": StyleTokenType.Cursor,
  "se-resize": StyleTokenType.Cursor,
  "sw-resize": StyleTokenType.Cursor,
  "ew-resize": StyleTokenType.Cursor,
  "ns-resize": StyleTokenType.Cursor,
  "nesw-resize": StyleTokenType.Cursor,
  "nwse-resize": StyleTokenType.Cursor,
  "zoom-in": StyleTokenType.Cursor,
  "zoom-out": StyleTokenType.Cursor,
};
