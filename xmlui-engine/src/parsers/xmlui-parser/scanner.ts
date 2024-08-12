import { CharacterCodes } from "./CharacterCodes";
import {
  Diag_Invalid_Character,
  Diag_Unterminated_CData,
  Diag_Unterminated_Comment,
  Diag_Unterminated_Script,
  Diag_Unterminated_String_Literal,
  DiagnosticMessageFromScanner,
} from "./diagnostics";
import { SyntaxKind, isTrivia } from "./syntax-kind";

export type ScannerErrorCallback = (message: DiagnosticMessageFromScanner, length: number, arg0?: any) => void;

export interface Scanner {
  getStartPos(): number;
  getToken(): SyntaxKind;
  getTokenStart(): number;
  getTokenEnd(): number;
  getTokenText(): string;
  getTokenValue(): string;
  isIdentifier(): boolean;
  peekChar(ahead?: number): number | null;
  scanChar(): number | null;
  scan(): SyntaxKind;
  scanTrivia(): SyntaxKind | null;
  scanText(): SyntaxKind;
  getText(): string;
  setText(text: string | undefined, start?: number, length?: number): void;
  setOnError(onError: ScannerErrorCallback | undefined): void;
  resetTokenState(pos: number): void;
  back(): void;
}

export function createScanner(
  skipTrivia: boolean,
  textInitial?: string,
  onError?: ScannerErrorCallback,
  start?: number,
  length?: number
): Scanner {
  let text = textInitial ?? "";

  // Current position (end position of text of current token)
  let pos: number;

  // End of text
  let end: number;

  // Start position of whitespace before current token
  let fullStartPos: number;

  // Start position of text of current token
  let tokenStart: number;

  let token: SyntaxKind;
  let tokenValue!: string;

  setText(text, start, length);

  // Create the scanner instance
  return {
    getStartPos: () => fullStartPos,
    getTokenEnd: () => pos,
    getToken: () => token,
    getTokenStart: () => tokenStart,
    getTokenText: () => text.substring(tokenStart, pos),
    getTokenValue: () => tokenValue,
    isIdentifier: () => token === SyntaxKind.Identifier,
    peekChar,
    scanChar,
    scan,
    scanTrivia,
    scanText,
    getText,
    setText,
    setOnError,
    resetTokenState,
    back,
  };

  function peekChar(ahead?: number): number | null {
    if (pos + (ahead ?? 0) >= end) {
      return null;
    }
    const ch = codePointUnchecked(pos + (ahead ?? 0));
    return isNaN(ch) ? null : ch;
  }

  function scanChar(): number | null {
    if (pos >= end) {
      return null;
    }
    const ch = codePointUnchecked(pos);
    pos += charSize(ch);
    return ch;
  }

  function scan(): SyntaxKind {
    fullStartPos = pos;
    while (true) {
      tokenStart = pos;
      if (pos >= end) {
        return (token = SyntaxKind.EndOfFileToken);
      }

      const ch = codePointUnchecked(pos);

      switch (ch) {
        // --- Collect line break
        case CharacterCodes.lineFeed:
        case CharacterCodes.carriageReturn:
          if (skipTrivia) {
            pos++;
            continue;
          } else {
            if (
              ch === CharacterCodes.carriageReturn &&
              pos + 1 < end &&
              charCodeUnchecked(pos + 1) === CharacterCodes.lineFeed
            ) {
              // consume both CR and LF
              pos += 2;
            } else {
              pos++;
            }
            return (token = SyntaxKind.NewLineTrivia);
          }

        // --- Collect whitespace
        case CharacterCodes.tab:
        case CharacterCodes.verticalTab:
        case CharacterCodes.formFeed:
        case CharacterCodes.space:
        case CharacterCodes.nonBreakingSpace:
        case CharacterCodes.ogham:
        case CharacterCodes.enQuad:
        case CharacterCodes.emQuad:
        case CharacterCodes.enSpace:
        case CharacterCodes.emSpace:
        case CharacterCodes.threePerEmSpace:
        case CharacterCodes.fourPerEmSpace:
        case CharacterCodes.sixPerEmSpace:
        case CharacterCodes.figureSpace:
        case CharacterCodes.punctuationSpace:
        case CharacterCodes.thinSpace:
        case CharacterCodes.hairSpace:
        case CharacterCodes.zeroWidthSpace:
        case CharacterCodes.narrowNoBreakSpace:
        case CharacterCodes.mathematicalSpace:
        case CharacterCodes.ideographicSpace:
        case CharacterCodes.byteOrderMark:
          if (skipTrivia) {
            pos++;
            continue;
          } else {
            while (pos < end && isWhiteSpaceSingleLine(charCodeUnchecked(pos))) {
              pos++;
            }
            return (token = SyntaxKind.WhitespaceTrivia);
          }

        // --- Collect string literal
        case CharacterCodes.doubleQuote:
        case CharacterCodes.singleQuote:
        case CharacterCodes.backtick:
          tokenValue = scanString();
          return (token = SyntaxKind.StringLiteral);

        // --- Collext XML entities
        case CharacterCodes.ampersand:
          if (
            charCodeUnchecked(pos + 1) === CharacterCodes.a &&
            charCodeUnchecked(pos + 2) === CharacterCodes.m &&
            charCodeUnchecked(pos + 3) === CharacterCodes.p &&
            charCodeUnchecked(pos + 4) === CharacterCodes.semicolon
          ) {
            pos += 5;
            return (token = SyntaxKind.AmpersandEntity);
          } else if (
            charCodeUnchecked(pos + 1) === CharacterCodes.l &&
            charCodeUnchecked(pos + 2) === CharacterCodes.t &&
            charCodeUnchecked(pos + 3) === CharacterCodes.semicolon
          ) {
            pos += 4;
            return (token = SyntaxKind.LessThanEntity);
          } else if (
            charCodeUnchecked(pos + 1) === CharacterCodes.g &&
            charCodeUnchecked(pos + 2) === CharacterCodes.t &&
            charCodeUnchecked(pos + 3) === CharacterCodes.semicolon
          ) {
            pos += 4;
            return (token = SyntaxKind.GreaterThanEntity);
          } else if (
            charCodeUnchecked(pos + 1) === CharacterCodes.q &&
            charCodeUnchecked(pos + 2) === CharacterCodes.u &&
            charCodeUnchecked(pos + 3) === CharacterCodes.o &&
            charCodeUnchecked(pos + 4) === CharacterCodes.t &&
            charCodeUnchecked(pos + 5) === CharacterCodes.semicolon
          ) {
            pos += 6;
            return (token = SyntaxKind.DoubleQuoteEntity);
          } else if (
            charCodeUnchecked(pos + 1) === CharacterCodes.a &&
            charCodeUnchecked(pos + 2) === CharacterCodes.p &&
            charCodeUnchecked(pos + 3) === CharacterCodes.o &&
            charCodeUnchecked(pos + 4) === CharacterCodes.s &&
            charCodeUnchecked(pos + 5) === CharacterCodes.semicolon
          ) {
            pos += 6;
            return (token = SyntaxKind.SingleQuoteEntity);
          }
          pos++;
          error(Diag_Invalid_Character, 1)
          return (token = SyntaxKind.Unknown);

        // --- Collect equal token
        case CharacterCodes.equals:
          pos++;
          return (token = SyntaxKind.Equal);

        // --- Collect colon token
        case CharacterCodes.colon:
          pos++;
          return (token = SyntaxKind.Colon);

        // --- Collect tokens starting with '<'
        case CharacterCodes.lessThan:
          if (charCodeUnchecked(pos + 1) === CharacterCodes.slash) {
            // --- "</"
            pos += 2;
            return (token = SyntaxKind.CloseNodeStart);
          } else if (
            // --- "<!-- -->", XMLUI comment
            charCodeUnchecked(pos + 1) === CharacterCodes.exclamation &&
            charCodeUnchecked(pos + 2) === CharacterCodes.minus &&
            charCodeUnchecked(pos + 3) === CharacterCodes.minus
          ) {
            pos += 4;
            while (pos < end) {
              if (
                charCodeUnchecked(pos) === CharacterCodes.minus &&
                charCodeUnchecked(pos + 1) === CharacterCodes.minus &&
                charCodeUnchecked(pos + 2) === CharacterCodes.greaterThan
              ) {
                pos += 3;
                return (token = SyntaxKind.CommentTrivia);
              }
              pos += charSize(charCodeUnchecked(pos));
            }
            error(Diag_Unterminated_Comment,4);
            return (token = SyntaxKind.Unknown);
          }  else if (
            // --- <![CDATA[ section
            charCodeUnchecked(pos + 1) === CharacterCodes.exclamation &&
            charCodeUnchecked(pos + 2) === CharacterCodes.openBracket &&
            charCodeUnchecked(pos + 3) === CharacterCodes.C &&
            charCodeUnchecked(pos + 4) === CharacterCodes.D &&
            charCodeUnchecked(pos + 5) === CharacterCodes.A &&
            charCodeUnchecked(pos + 6) === CharacterCodes.T &&
            charCodeUnchecked(pos + 7) === CharacterCodes.A &&
            charCodeUnchecked(pos + 8) === CharacterCodes.openBracket
          ) {
            pos += 9;
            while (pos < end) {
              if (
                charCodeUnchecked(pos) === CharacterCodes.closeBracket &&
                charCodeUnchecked(pos + 1) === CharacterCodes.closeBracket &&
                charCodeUnchecked(pos + 2) === CharacterCodes.greaterThan
              ) {
                pos += 3;
                return (token = SyntaxKind.CData);
              }
              pos += charSize(charCodeUnchecked(pos));
            }
            error(Diag_Unterminated_CData, 9);
            return (token = SyntaxKind.CData);
          } else if (
            // --- <script>
            charCodeUnchecked(pos + 1) === CharacterCodes.s &&
            charCodeUnchecked(pos + 2) === CharacterCodes.c &&
            charCodeUnchecked(pos + 3) === CharacterCodes.r &&
            charCodeUnchecked(pos + 4) === CharacterCodes.i &&
            charCodeUnchecked(pos + 5) === CharacterCodes.p &&
            charCodeUnchecked(pos + 6) === CharacterCodes.t &&
            charCodeUnchecked(pos + 7) === CharacterCodes.greaterThan
          ){
            pos += 8;
            while (pos < end) {
              if (
            charCodeUnchecked(pos) === CharacterCodes.lessThan &&
            charCodeUnchecked(pos + 1) === CharacterCodes.slash &&
            charCodeUnchecked(pos + 2) === CharacterCodes.s &&
            charCodeUnchecked(pos + 3) === CharacterCodes.c &&
            charCodeUnchecked(pos + 4) === CharacterCodes.r &&
            charCodeUnchecked(pos + 5) === CharacterCodes.i &&
            charCodeUnchecked(pos + 6) === CharacterCodes.p &&
            charCodeUnchecked(pos + 7) === CharacterCodes.t &&
            charCodeUnchecked(pos + 8) === CharacterCodes.greaterThan
              ) {
                pos += 9;
                return (token = SyntaxKind.Script);
              }
              pos += charSize(charCodeUnchecked(pos));
            }
            error(Diag_Unterminated_Script,9);
            return (token = SyntaxKind.Script);
          }

          pos++;
          return (token = SyntaxKind.OpenNodeStart);

        case CharacterCodes.slash:
          if (charCodeUnchecked(pos + 1) === CharacterCodes.greaterThan) {
            pos += 2;
            return (token = SyntaxKind.NodeClose);
          }
          pos++;
          error(Diag_Invalid_Character, 1);
          return (token = SyntaxKind.Unknown);

        // --- Collect node closing token
        case CharacterCodes.greaterThan:
          pos++;
          return (token = SyntaxKind.NodeEnd);

        default:
          const identifierKind = scanIdentifier(ch);
          if (identifierKind) {
            return (token = identifierKind);
          } else if (isWhiteSpaceSingleLine(ch)) {
            pos += charSize(ch);
            continue;
          } else if (isLineBreak(ch)) {
            pos += charSize(ch);
            continue;
          }
          const size = charSize(ch);
          pos += size;
          error(Diag_Invalid_Character, size);
          return (token = SyntaxKind.Unknown);
      }
    }
  }

  function scanTrivia(): SyntaxKind | null {
    const currentPos = pos;
    const token = scan();
    if (isTrivia(token)) {
      return token;
    }
    resetTokenState(currentPos);
    return null;
  }

  function scanText(): SyntaxKind {
    return SyntaxKind.Unknown;
  }

  function getText(): string {
    return text;
  }

  /**
   * Returns the char code for the character at the given position within `text`. This
   * should only be used when pos is guaranteed to be within the bounds of `text` as this
   * function does not perform bounds checks.
   */
  function charCodeUnchecked(pos: number) {
    return text.charCodeAt(pos);
  }

  function codePointUnchecked(pos: number) {
    return codePointAt(text, pos);
  }

  function codePointAt(s: string, i: number): number {
    return s.codePointAt(i) ?? 0;
  }

  function setText(newText: string | undefined, start: number | undefined, length: number | undefined) {
    text = newText || "";
    end = length === undefined ? text.length : start! + length;
    resetTokenState(start || 0);
  }

  function setOnError(errorCallback: ScannerErrorCallback | undefined) {
    onError = errorCallback;
  }

  function resetTokenState(position: number) {
    pos = position;
    fullStartPos = position;
    tokenStart = position;
    token = SyntaxKind.Unknown;
    tokenValue = undefined!;
  }

  function back() {
    resetTokenState(fullStartPos);
  }

  function scanIdentifier(startCharacter: number) {
    let ch = startCharacter;
    if (isIdentifierStart(ch)) {
      pos += charSize(ch);
      while (pos < end && isIdentifierPart((ch = codePointUnchecked(pos)))) {
        pos += charSize(ch);
      }
      tokenValue = text.substring(tokenStart, pos);
      return getIdentifierToken();
    }
  }

  function getIdentifierToken(): SyntaxKind.Identifier {
    return (token = SyntaxKind.Identifier);
  }

  function scanString(): string {
    const quote = charCodeUnchecked(pos);
    pos++;
    let result = "";
    let start = pos;
    while (true) {
      if (pos >= end) {
        result += text.substring(start, pos);
        error(Diag_Unterminated_String_Literal, 1);
        break;
      }
      const ch = charCodeUnchecked(pos);
      if (ch === quote) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      pos++;
    }
    return result;
  }

  function error(message: DiagnosticMessageFromScanner, troublesomePrefixLength: number = 0): void {
    if (onError) {
      onError(message, troublesomePrefixLength);
    }
  }
}

function charSize(ch: number) {
  if (ch >= 0x10000) {
    return 2;
  }
  if (ch === CharacterCodes.EOF) {
    return 0;
  }
  return 1;
}

function isASCIILetter(ch: number): boolean {
  return (ch >= CharacterCodes.A && ch <= CharacterCodes.Z) || (ch >= CharacterCodes.a && ch <= CharacterCodes.z);
}

function isWordCharacter(ch: number): boolean {
  return isASCIILetter(ch) || isDigit(ch) || ch === CharacterCodes._;
}

function isDigit(ch: number): boolean {
  return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}

export function isIdentifierStart(ch: number): boolean {
  return isASCIILetter(ch) || ch === CharacterCodes.$ || ch === CharacterCodes._;
}

function isIdentifierPart(ch: number): boolean {
  return isWordCharacter(ch) || ch === CharacterCodes.$ || ch === CharacterCodes.minus || ch === CharacterCodes.dot;
}

function isWhiteSpaceSingleLine(ch: number): boolean {
  // Note: nextLine is in the Zs space, and should be considered to be a whitespace.
  // It is explicitly not a line-break as it isn't in the exact set specified by EcmaScript.
  return (
    ch === CharacterCodes.space ||
    ch === CharacterCodes.tab ||
    ch === CharacterCodes.verticalTab ||
    ch === CharacterCodes.formFeed ||
    ch === CharacterCodes.nonBreakingSpace ||
    ch === CharacterCodes.nextLine ||
    ch === CharacterCodes.ogham ||
    (ch >= CharacterCodes.enQuad && ch <= CharacterCodes.zeroWidthSpace) ||
    ch === CharacterCodes.narrowNoBreakSpace ||
    ch === CharacterCodes.mathematicalSpace ||
    ch === CharacterCodes.ideographicSpace ||
    ch === CharacterCodes.byteOrderMark
  );
}

function isLineBreak(ch: number): boolean {
  return (
    ch === CharacterCodes.lineFeed ||
    ch === CharacterCodes.carriageReturn ||
    ch === CharacterCodes.lineSeparator ||
    ch === CharacterCodes.paragraphSeparator
  );
}
