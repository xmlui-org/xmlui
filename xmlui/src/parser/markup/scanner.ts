import { createErrorDiagnostic, type ParserDiagnostic } from "../common/diagnostics";
import { InputStream, SourceText, type SourceId, type TextSource } from "../common/source";
import type { BaseToken, TokenClassification } from "../common/tokens";
import { MarkupSyntaxKind } from "./syntaxKind";

export type MarkupToken = BaseToken<MarkupSyntaxKind>;

export type TokenizeMarkupResult = {
  tokens: MarkupToken[];
  diagnostics: ParserDiagnostic[];
};

type ScannerMode = "content" | "tag";

export class MarkupScanner {
  private readonly input: InputStream;
  private readonly diagnostics: ParserDiagnostic[] = [];
  private mode: ScannerMode = "content";

  constructor(source: SourceText | TextSource | string, sourceId?: SourceId) {
    this.input = new InputStream(source, sourceId);
  }

  getDiagnostics(): ParserDiagnostic[] {
    return [...this.diagnostics];
  }

  scan(): MarkupToken {
    if (this.input.eof) {
      return this.createToken(MarkupSyntaxKind.EndOfFile, this.input.position, this.input.position);
    }

    if (this.input.startsWith("<!--")) {
      return this.scanComment();
    }

    const ch = this.input.peek();
    if (ch === "\r" || ch === "\n") {
      return this.scanNewLine();
    }
    if (ch === " " || ch === "\t") {
      return this.scanWhitespace();
    }
    if (ch === "<") {
      return this.scanOpenStart();
    }
    if (this.mode === "tag") {
      return this.scanTagToken();
    }
    return this.scanText();
  }

  private scanOpenStart(): MarkupToken {
    const start = this.input.position;
    if (this.input.startsWith("</")) {
      this.input.advance(2);
      this.mode = "tag";
      return this.createToken(MarkupSyntaxKind.CloseNodeStart, start, this.input.position);
    }
    this.input.advance();
    this.mode = "tag";
    return this.createToken(MarkupSyntaxKind.OpenNodeStart, start, this.input.position);
  }

  private scanTagToken(): MarkupToken {
    const ch = this.input.peek();
    const start = this.input.position;

    if (ch === null) {
      return this.createToken(MarkupSyntaxKind.EndOfFile, start, start);
    }
    if (ch === ">") {
      this.input.advance();
      this.mode = "content";
      return this.createToken(MarkupSyntaxKind.NodeEnd, start, this.input.position);
    }
    if (ch === "/" && this.input.peek(1) === ">") {
      this.input.advance(2);
      this.mode = "content";
      return this.createToken(MarkupSyntaxKind.NodeClose, start, this.input.position);
    }
    if (ch === "=") {
      this.input.advance();
      return this.createToken(MarkupSyntaxKind.Equal, start, this.input.position);
    }
    if (ch === ".") {
      this.input.advance();
      return this.createToken(MarkupSyntaxKind.Dot, start, this.input.position);
    }
    if (ch === ":") {
      this.input.advance();
      return this.createToken(MarkupSyntaxKind.Colon, start, this.input.position);
    }
    if (ch === `"` || ch === "'") {
      return this.scanString();
    }
    if (isIdentifierStart(ch)) {
      return this.scanIdentifier();
    }

    this.input.advance();
    this.report("XM001", `Unknown markup character '${ch}'.`, start, this.input.position);
    return this.createToken(MarkupSyntaxKind.Unknown, start, this.input.position);
  }

  private scanIdentifier(): MarkupToken {
    const start = this.input.position;
    this.input.advance();
    while (isIdentifierPart(this.input.peek())) {
      this.input.advance();
    }
    return this.createToken(MarkupSyntaxKind.Identifier, start, this.input.position);
  }

  private scanString(): MarkupToken {
    const start = this.input.position;
    const quote = this.input.peek();
    this.input.advance();
    const valueStart = this.input.position;

    while (!this.input.eof && this.input.peek() !== quote) {
      this.input.advance();
    }

    if (this.input.eof) {
      this.report("XM002", "Unterminated string literal.", start, this.input.position);
      return this.createToken(
        MarkupSyntaxKind.StringLiteral,
        start,
        this.input.position,
        this.input.slice(valueStart, this.input.position),
      );
    }

    const valueEnd = this.input.position;
    this.input.advance();
    return this.createToken(
      MarkupSyntaxKind.StringLiteral,
      start,
      this.input.position,
      this.input.slice(valueStart, valueEnd),
    );
  }

  private scanText(): MarkupToken {
    const start = this.input.position;
    while (!this.input.eof && this.input.peek() !== "<") {
      this.input.advance();
    }
    return this.createToken(MarkupSyntaxKind.Text, start, this.input.position);
  }

  private scanWhitespace(): MarkupToken {
    const start = this.input.position;
    while (this.input.peek() === " " || this.input.peek() === "\t") {
      this.input.advance();
    }
    return this.createToken(MarkupSyntaxKind.WhitespaceTrivia, start, this.input.position);
  }

  private scanNewLine(): MarkupToken {
    const start = this.input.position;
    if (this.input.peek() === "\r" && this.input.peek(1) === "\n") {
      this.input.advance(2);
    } else {
      this.input.advance();
    }
    return this.createToken(MarkupSyntaxKind.NewLineTrivia, start, this.input.position);
  }

  private scanComment(): MarkupToken {
    const start = this.input.position;
    const end = this.input.source.text.indexOf("-->", start + 4);
    if (end < 0) {
      this.input.seek(this.input.source.length);
      this.report("XM003", "Unterminated comment.", start, this.input.position);
      return this.createToken(MarkupSyntaxKind.CommentTrivia, start, this.input.position);
    }
    this.input.seek(end + 3);
    return this.createToken(MarkupSyntaxKind.CommentTrivia, start, this.input.position);
  }

  private createToken(
    kind: MarkupSyntaxKind,
    start: number,
    end: number,
    value?: string,
  ): MarkupToken {
    const text = this.input.source.slice(start, end);
    return {
      kind,
      span: this.input.source.span(start, end),
      text,
      ...(value !== undefined ? { value } : {}),
      classification: classifyMarkupToken(kind),
    };
  }

  private report(code: string, message: string, start: number, end: number): void {
    this.diagnostics.push(createErrorDiagnostic(code, message, this.input.source.span(start, end)));
  }
}

export function tokenizeMarkup(source: SourceText | TextSource | string, sourceId?: SourceId) {
  const scanner = new MarkupScanner(source, sourceId);
  const tokens: MarkupToken[] = [];

  while (true) {
    const token = scanner.scan();
    tokens.push(token);
    if (token.kind === MarkupSyntaxKind.EndOfFile) {
      break;
    }
  }

  return {
    tokens,
    diagnostics: scanner.getDiagnostics(),
  } satisfies TokenizeMarkupResult;
}

function classifyMarkupToken(kind: MarkupSyntaxKind): TokenClassification {
  switch (kind) {
    case MarkupSyntaxKind.CommentTrivia:
      return "comment";
    case MarkupSyntaxKind.Identifier:
      return "identifier";
    case MarkupSyntaxKind.StringLiteral:
      return "string";
    case MarkupSyntaxKind.Text:
      return "text";
    case MarkupSyntaxKind.WhitespaceTrivia:
    case MarkupSyntaxKind.NewLineTrivia:
      return "trivia";
    case MarkupSyntaxKind.Unknown:
      return "unknown";
    case MarkupSyntaxKind.Equal:
      return "operator";
    default:
      return "punctuation";
  }
}

function isIdentifierStart(ch: string | null): boolean {
  return ch !== null && /[A-Za-z_$]/.test(ch);
}

function isIdentifierPart(ch: string | null): boolean {
  return ch !== null && /[\w$-]/.test(ch);
}
