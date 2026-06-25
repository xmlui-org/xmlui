import { createErrorDiagnostic, type ParserDiagnostic } from "../common/diagnostics";
import { InputStream, SourceText, type SourceId, type SourceSpan, type TextSource } from "../common/source";
import type { BaseToken, TokenClassification } from "../common/tokens";
import { ScriptTokenKind } from "./tokenKind";

export type ScriptToken = BaseToken<ScriptTokenKind>;

export type TokenizeScriptOptions = {
  sourceId?: SourceId;
  originSpan?: SourceSpan;
};

export type TokenizeScriptResult = {
  tokens: ScriptToken[];
  diagnostics: ParserDiagnostic[];
};

export class ScriptScanner {
  private readonly input: InputStream;
  private readonly diagnostics: ParserDiagnostic[] = [];
  private readonly sourceId: SourceId;
  private readonly originSpan?: SourceSpan;

  constructor(source: SourceText | TextSource | string, options: TokenizeScriptOptions = {}) {
    this.input = new InputStream(source, options.sourceId);
    this.sourceId = options.originSpan?.sourceId ?? this.input.source.id;
    this.originSpan = options.originSpan;
  }

  getDiagnostics(): ParserDiagnostic[] {
    return [...this.diagnostics];
  }

  scan(): ScriptToken {
    if (this.input.eof) {
      return this.createToken(ScriptTokenKind.EndOfFile, this.input.position, this.input.position);
    }

    const ch = this.input.peek();
    if (ch === "\r" || ch === "\n") {
      return this.scanNewLine();
    }
    if (ch === " " || ch === "\t") {
      return this.scanWhitespace();
    }
    if (ch === "/" && this.input.peek(1) === "/") {
      return this.scanLineComment();
    }
    if (ch === "/" && this.input.peek(1) === "*") {
      return this.scanBlockComment();
    }
    if (ch === `"` || ch === "'") {
      return this.scanString();
    }
    if (isDigit(ch)) {
      return this.scanNumber();
    }
    if (isIdentifierStart(ch)) {
      return this.scanIdentifierOrKeyword();
    }

    return this.scanPunctuationOrUnknown();
  }

  private scanPunctuationOrUnknown(): ScriptToken {
    const start = this.input.position;

    if (this.input.startsWith("||")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.LogicalOr, start, this.input.position);
    }
    if (this.input.startsWith("&&")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.LogicalAnd, start, this.input.position);
    }
    if (this.input.startsWith("++")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.PlusPlus, start, this.input.position);
    }
    if (this.input.startsWith("--")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.MinusMinus, start, this.input.position);
    }
    if (this.input.startsWith("??")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.NullishCoalescing, start, this.input.position);
    }
    if (this.input.startsWith("?.")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.QuestionDot, start, this.input.position);
    }
    if (this.input.startsWith("=>")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.Arrow, start, this.input.position);
    }
    if (this.input.startsWith("...")) {
      this.input.advance(3);
      return this.createToken(ScriptTokenKind.Ellipsis, start, this.input.position);
    }
    if (this.input.startsWith("===")) {
      this.input.advance(3);
      return this.createToken(ScriptTokenKind.EqualEqualEqual, start, this.input.position);
    }
    if (this.input.startsWith("!==")) {
      this.input.advance(3);
      return this.createToken(ScriptTokenKind.ExclamationEqualEqual, start, this.input.position);
    }
    if (this.input.startsWith("==")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.EqualEqual, start, this.input.position);
    }
    if (this.input.startsWith("!=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.ExclamationEqual, start, this.input.position);
    }
    if (this.input.startsWith("<=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.LessThanEqual, start, this.input.position);
    }
    if (this.input.startsWith(">=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.GreaterThanEqual, start, this.input.position);
    }
    if (this.input.startsWith("+=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.PlusEqual, start, this.input.position);
    }
    if (this.input.startsWith("-=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.MinusEqual, start, this.input.position);
    }
    if (this.input.startsWith("*=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.StarEqual, start, this.input.position);
    }
    if (this.input.startsWith("/=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.SlashEqual, start, this.input.position);
    }
    if (this.input.startsWith("%=")) {
      this.input.advance(2);
      return this.createToken(ScriptTokenKind.PercentEqual, start, this.input.position);
    }

    const ch = this.input.peek();
    this.input.advance();
    switch (ch) {
      case "$":
        return this.createToken(ScriptTokenKind.Dollar, start, this.input.position);
      case ".":
        return this.createToken(ScriptTokenKind.Dot, start, this.input.position);
      case "(":
        return this.createToken(ScriptTokenKind.OpenParen, start, this.input.position);
      case ")":
        return this.createToken(ScriptTokenKind.CloseParen, start, this.input.position);
      case "[":
        return this.createToken(ScriptTokenKind.OpenBracket, start, this.input.position);
      case "]":
        return this.createToken(ScriptTokenKind.CloseBracket, start, this.input.position);
      case "{":
        return this.createToken(ScriptTokenKind.OpenBrace, start, this.input.position);
      case "}":
        return this.createToken(ScriptTokenKind.CloseBrace, start, this.input.position);
      case ",":
        return this.createToken(ScriptTokenKind.Comma, start, this.input.position);
      case ";":
        return this.createToken(ScriptTokenKind.Semicolon, start, this.input.position);
      case ":":
        return this.createToken(ScriptTokenKind.Colon, start, this.input.position);
      case "?":
        return this.createToken(ScriptTokenKind.Question, start, this.input.position);
      case "!":
        return this.createToken(ScriptTokenKind.Exclamation, start, this.input.position);
      case "=":
        return this.createToken(ScriptTokenKind.Equal, start, this.input.position);
      case "<":
        return this.createToken(ScriptTokenKind.LessThan, start, this.input.position);
      case ">":
        return this.createToken(ScriptTokenKind.GreaterThan, start, this.input.position);
      case "+":
        return this.createToken(ScriptTokenKind.Plus, start, this.input.position);
      case "-":
        return this.createToken(ScriptTokenKind.Minus, start, this.input.position);
      case "*":
        return this.createToken(ScriptTokenKind.Star, start, this.input.position);
      case "/":
        return this.createToken(ScriptTokenKind.Slash, start, this.input.position);
      case "%":
        return this.createToken(ScriptTokenKind.Percent, start, this.input.position);
      default:
        this.report("XS001", `Unknown script character '${ch}'.`, start, this.input.position);
        return this.createToken(ScriptTokenKind.Unknown, start, this.input.position);
    }
  }

  private scanIdentifierOrKeyword(): ScriptToken {
    const start = this.input.position;
    this.input.advance();
    while (isIdentifierPart(this.input.peek())) {
      this.input.advance();
    }

    const text = this.input.slice(start, this.input.position);
    return this.createToken(keywordKind(text), start, this.input.position);
  }

  private scanNumber(): ScriptToken {
    const start = this.input.position;
    while (isDigit(this.input.peek())) {
      this.input.advance();
    }
    if (this.input.peek() === "." && isDigit(this.input.peek(1))) {
      this.input.advance();
      while (isDigit(this.input.peek())) {
        this.input.advance();
      }
    }
    return this.createToken(
      ScriptTokenKind.NumberLiteral,
      start,
      this.input.position,
      this.input.slice(start, this.input.position),
    );
  }

  private scanString(): ScriptToken {
    const start = this.input.position;
    const quote = this.input.peek();
    this.input.advance();
    const valueStart = this.input.position;

    while (!this.input.eof) {
      const ch = this.input.peek();
      if (ch === "\\") {
        this.input.advance(2);
        continue;
      }
      if (ch === quote) {
        break;
      }
      this.input.advance();
    }

    if (this.input.eof) {
      this.report("XS002", "Unterminated string literal.", start, this.input.position);
      return this.createToken(
        ScriptTokenKind.StringLiteral,
        start,
        this.input.position,
        this.input.slice(valueStart, this.input.position),
      );
    }

    const valueEnd = this.input.position;
    this.input.advance();
    return this.createToken(
      ScriptTokenKind.StringLiteral,
      start,
      this.input.position,
      this.input.slice(valueStart, valueEnd),
    );
  }

  private scanWhitespace(): ScriptToken {
    const start = this.input.position;
    while (this.input.peek() === " " || this.input.peek() === "\t") {
      this.input.advance();
    }
    return this.createToken(ScriptTokenKind.WhitespaceTrivia, start, this.input.position);
  }

  private scanNewLine(): ScriptToken {
    const start = this.input.position;
    if (this.input.peek() === "\r" && this.input.peek(1) === "\n") {
      this.input.advance(2);
    } else {
      this.input.advance();
    }
    return this.createToken(ScriptTokenKind.NewLineTrivia, start, this.input.position);
  }

  private scanLineComment(): ScriptToken {
    const start = this.input.position;
    while (!this.input.eof && this.input.peek() !== "\n" && this.input.peek() !== "\r") {
      this.input.advance();
    }
    return this.createToken(ScriptTokenKind.LineCommentTrivia, start, this.input.position);
  }

  private scanBlockComment(): ScriptToken {
    const start = this.input.position;
    const end = this.input.source.text.indexOf("*/", start + 2);
    if (end < 0) {
      this.input.seek(this.input.source.length);
      this.report("XS003", "Unterminated block comment.", start, this.input.position);
      return this.createToken(ScriptTokenKind.BlockCommentTrivia, start, this.input.position);
    }
    this.input.seek(end + 2);
    return this.createToken(ScriptTokenKind.BlockCommentTrivia, start, this.input.position);
  }

  private createToken(
    kind: ScriptTokenKind,
    start: number,
    end: number,
    value?: string,
  ): ScriptToken {
    const text = this.input.source.slice(start, end);
    return {
      kind,
      span: this.mapSpan(start, end),
      text,
      ...(value !== undefined ? { value } : {}),
      classification: classifyScriptToken(kind),
    };
  }

  private report(code: string, message: string, start: number, end: number): void {
    this.diagnostics.push(createErrorDiagnostic(code, message, this.mapSpan(start, end)));
  }

  private mapSpan(start: number, end: number): SourceSpan {
    if (!this.originSpan) {
      return this.input.source.span(start, end);
    }
    return {
      sourceId: this.sourceId,
      start: this.originSpan.start + start,
      end: this.originSpan.start + end,
      generatedFrom: this.input.source.span(start, end),
    };
  }
}

export function tokenizeScript(
  source: SourceText | TextSource | string,
  options: TokenizeScriptOptions = {},
) {
  const scanner = new ScriptScanner(source, options);
  const tokens: ScriptToken[] = [];

  while (true) {
    const token = scanner.scan();
    tokens.push(token);
    if (token.kind === ScriptTokenKind.EndOfFile) {
      break;
    }
  }

  return {
    tokens,
    diagnostics: scanner.getDiagnostics(),
  } satisfies TokenizeScriptResult;
}

function classifyScriptToken(kind: ScriptTokenKind): TokenClassification {
  switch (kind) {
    case ScriptTokenKind.Identifier:
      return "identifier";
    case ScriptTokenKind.TrueKeyword:
    case ScriptTokenKind.FalseKeyword:
    case ScriptTokenKind.NullKeyword:
    case ScriptTokenKind.UndefinedKeyword:
    case ScriptTokenKind.LetKeyword:
    case ScriptTokenKind.ConstKeyword:
    case ScriptTokenKind.IfKeyword:
    case ScriptTokenKind.ElseKeyword:
    case ScriptTokenKind.WhileKeyword:
    case ScriptTokenKind.ForKeyword:
    case ScriptTokenKind.ReturnKeyword:
    case ScriptTokenKind.DeleteKeyword:
      return "keyword";
    case ScriptTokenKind.NumberLiteral:
    case ScriptTokenKind.StringLiteral:
      return "string";
    case ScriptTokenKind.WhitespaceTrivia:
    case ScriptTokenKind.NewLineTrivia:
      return "trivia";
    case ScriptTokenKind.LineCommentTrivia:
    case ScriptTokenKind.BlockCommentTrivia:
      return "comment";
    case ScriptTokenKind.Unknown:
      return "unknown";
    case ScriptTokenKind.LogicalOr:
    case ScriptTokenKind.LogicalAnd:
    case ScriptTokenKind.NullishCoalescing:
    case ScriptTokenKind.Exclamation:
    case ScriptTokenKind.Equal:
    case ScriptTokenKind.EqualEqual:
    case ScriptTokenKind.EqualEqualEqual:
    case ScriptTokenKind.ExclamationEqual:
    case ScriptTokenKind.ExclamationEqualEqual:
    case ScriptTokenKind.LessThan:
    case ScriptTokenKind.LessThanEqual:
    case ScriptTokenKind.GreaterThan:
    case ScriptTokenKind.GreaterThanEqual:
    case ScriptTokenKind.Plus:
    case ScriptTokenKind.Minus:
    case ScriptTokenKind.Star:
    case ScriptTokenKind.Slash:
    case ScriptTokenKind.Percent:
    case ScriptTokenKind.PlusPlus:
    case ScriptTokenKind.MinusMinus:
    case ScriptTokenKind.PlusEqual:
    case ScriptTokenKind.MinusEqual:
    case ScriptTokenKind.StarEqual:
    case ScriptTokenKind.SlashEqual:
    case ScriptTokenKind.PercentEqual:
    case ScriptTokenKind.Arrow:
      return "operator";
    default:
      return "punctuation";
  }
}

function keywordKind(text: string): ScriptTokenKind {
  switch (text) {
    case "true":
      return ScriptTokenKind.TrueKeyword;
    case "false":
      return ScriptTokenKind.FalseKeyword;
    case "null":
      return ScriptTokenKind.NullKeyword;
    case "undefined":
      return ScriptTokenKind.UndefinedKeyword;
    case "let":
      return ScriptTokenKind.LetKeyword;
    case "const":
      return ScriptTokenKind.ConstKeyword;
    case "if":
      return ScriptTokenKind.IfKeyword;
    case "else":
      return ScriptTokenKind.ElseKeyword;
    case "while":
      return ScriptTokenKind.WhileKeyword;
    case "for":
      return ScriptTokenKind.ForKeyword;
    case "return":
      return ScriptTokenKind.ReturnKeyword;
    case "delete":
      return ScriptTokenKind.DeleteKeyword;
    default:
      return ScriptTokenKind.Identifier;
  }
}

function isIdentifierStart(ch: string | null): boolean {
  return ch !== null && /[A-Za-z_]/.test(ch);
}

function isIdentifierPart(ch: string | null): boolean {
  return ch !== null && /[\w$]/.test(ch);
}

function isDigit(ch: string | null): boolean {
  return ch !== null && /[0-9]/.test(ch);
}
