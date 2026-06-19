import { createErrorDiagnostic, type ParserDiagnostic } from "../common/diagnostics";
import { SourceText, type SourceId, type TextSource } from "../common/source";
import { tokenizeMarkup, type MarkupToken } from "./scanner";
import { isMarkupTrivia, MarkupSyntaxKind } from "./syntaxKind";
import {
  createErrorNode,
  createSyntaxNode,
  createTokenNode,
  getNodeText,
  type MarkupSyntaxNode,
} from "./syntaxNode";

export type ParseMarkupResult = {
  source: SourceText;
  node: MarkupSyntaxNode;
  diagnostics: ParserDiagnostic[];
};

export function parseMarkup(source: SourceText | TextSource | string, sourceId?: SourceId) {
  return new MarkupParser(source, sourceId).parse();
}

class MarkupParser {
  private readonly source: SourceText;
  private readonly tokens: MarkupToken[];
  private readonly diagnostics: ParserDiagnostic[];
  private offset = 0;
  private pendingTrivia: MarkupSyntaxNode[] = [];
  private rootElementSeen = false;

  constructor(source: SourceText | TextSource | string, sourceId?: SourceId) {
    this.source = source instanceof SourceText ? source : new SourceText(source, sourceId);
    const tokenizeResult = tokenizeMarkup(this.source);
    this.tokens = tokenizeResult.tokens;
    this.diagnostics = [...tokenizeResult.diagnostics];
  }

  parse(): ParseMarkupResult {
    const content = this.parseContentList();
    const eof = this.consume(MarkupSyntaxKind.EndOfFile);
    const node = createSyntaxNode(
      MarkupSyntaxKind.Document,
      [content, eof],
      this.source.span(0, this.source.length),
    );

    return {
      source: this.source,
      node,
      diagnostics: this.diagnostics,
    };
  }

  private parseContentList(stopTagName?: string): MarkupSyntaxNode {
    const children: MarkupSyntaxNode[] = [];

    while (!this.at(MarkupSyntaxKind.EndOfFile)) {
      this.collectTrivia();

      if (this.at(MarkupSyntaxKind.EndOfFile)) {
        break;
      }
      if (this.at(MarkupSyntaxKind.CloseNodeStart)) {
        break;
      }
      if (this.at(MarkupSyntaxKind.OpenNodeStart)) {
        const element = this.parseElement();
        children.push(element);
        if (!stopTagName) {
          if (this.rootElementSeen) {
            this.report(
              "XP001",
              "XMLUI documents must have a single root element.",
              element.pos,
              element.end,
            );
          }
          this.rootElementSeen = true;
        }
        continue;
      }
      if (this.at(MarkupSyntaxKind.Text)) {
        children.push(this.consume());
        continue;
      }

      const unexpected = this.consume();
      this.report("XP002", `Unexpected token '${unexpected.text}'.`, unexpected.pos, unexpected.end);
      children.push(createErrorNode(this.source.span(unexpected.pos, unexpected.end), [unexpected]));
    }

    return createSyntaxNode(MarkupSyntaxKind.ContentList, children, this.spanFromChildren(children));
  }

  private parseElement(): MarkupSyntaxNode {
    const children: MarkupSyntaxNode[] = [];
    const openStart = this.consume(MarkupSyntaxKind.OpenNodeStart);
    children.push(openStart);

    const openTagName = this.parseTagName("An opening tag name expected.");
    children.push(openTagName);
    const openTagText = this.textOfName(openTagName);

    const attributes = this.parseAttributeList();
    children.push(attributes);

    if (this.at(MarkupSyntaxKind.NodeClose)) {
      children.push(this.consume(MarkupSyntaxKind.NodeClose));
      return createSyntaxNode(MarkupSyntaxKind.Element, children);
    }

    if (this.at(MarkupSyntaxKind.NodeEnd)) {
      children.push(this.consume(MarkupSyntaxKind.NodeEnd));
    } else {
      const error = this.expected(
        "XP003",
        "Expected '>' or '/>' at the end of the opening tag.",
        this.current(),
      );
      children.push(error);
      return createSyntaxNode(MarkupSyntaxKind.Element, children);
    }

    const content = this.parseContentList(openTagText);
    children.push(content);

    if (!this.at(MarkupSyntaxKind.CloseNodeStart)) {
      this.report(
        "XP004",
        `Expected closing tag '</${openTagText}>'.`,
        openStart.pos,
        Math.max(openStart.end, content.end),
      );
      children.push(createErrorNode(this.source.span(content.end, content.end)));
      return createSyntaxNode(MarkupSyntaxKind.Element, children);
    }

    const closeStart = this.consume(MarkupSyntaxKind.CloseNodeStart);
    children.push(closeStart);
    const closeTagName = this.parseTagName("A closing tag name expected.");
    children.push(closeTagName);
    const closeTagText = this.textOfName(closeTagName);

    if (openTagText && closeTagText && openTagText !== closeTagText) {
      this.report(
        "XP005",
        `Opening and closing tag names should match. Expected '</${openTagText}>', got '</${closeTagText}>'.`,
        closeTagName.pos,
        closeTagName.end,
        openTagName,
      );
    }

    if (this.at(MarkupSyntaxKind.NodeEnd)) {
      children.push(this.consume(MarkupSyntaxKind.NodeEnd));
    } else {
      children.push(this.expected("XP006", "Expected '>' at the end of the closing tag.", this.current()));
    }

    return createSyntaxNode(MarkupSyntaxKind.Element, children);
  }

  private parseTagName(message: string): MarkupSyntaxNode {
    this.collectTrivia();
    if (!this.at(MarkupSyntaxKind.Identifier)) {
      return this.expected("XP007", message, this.current());
    }

    const children = [this.consume(MarkupSyntaxKind.Identifier)];
    if (this.at(MarkupSyntaxKind.Colon)) {
      children.push(this.consume(MarkupSyntaxKind.Colon));
      if (this.at(MarkupSyntaxKind.Identifier)) {
        children.push(this.consume(MarkupSyntaxKind.Identifier));
      } else {
        children.push(this.expected("XP013", "A tag name segment expected after ':'.", this.current()));
      }
    }
    return createSyntaxNode(MarkupSyntaxKind.TagName, children);
  }

  private parseAttributeList(): MarkupSyntaxNode {
    const attributes: MarkupSyntaxNode[] = [];

    while (!this.at(MarkupSyntaxKind.EndOfFile)) {
      this.collectTrivia();
      if (
        this.at(MarkupSyntaxKind.NodeEnd) ||
        this.at(MarkupSyntaxKind.NodeClose) ||
        this.at(MarkupSyntaxKind.OpenNodeStart) ||
        this.at(MarkupSyntaxKind.CloseNodeStart)
      ) {
        break;
      }
      attributes.push(this.parseAttribute());
    }

    return createSyntaxNode(MarkupSyntaxKind.AttributeList, attributes, this.spanFromChildren(attributes));
  }

  private parseAttribute(): MarkupSyntaxNode {
    const children: MarkupSyntaxNode[] = [];
    const keyChildren: MarkupSyntaxNode[] = [];

    if (!this.at(MarkupSyntaxKind.Identifier)) {
      const error = this.expected("XP008", "An attribute name expected.", this.current(), true);
      return createSyntaxNode(MarkupSyntaxKind.Attribute, [error]);
    }

    keyChildren.push(this.consume(MarkupSyntaxKind.Identifier));
    while (this.at(MarkupSyntaxKind.Dot) || this.at(MarkupSyntaxKind.Colon)) {
      const separator = this.consume();
      keyChildren.push(separator);
      if (this.at(MarkupSyntaxKind.Identifier)) {
        keyChildren.push(this.consume(MarkupSyntaxKind.Identifier));
      } else {
        keyChildren.push(this.expected(
          "XP009",
          `An attribute segment expected after '${separator.text}'.`,
          this.current(),
        ));
        break;
      }
    }
    children.push(createSyntaxNode(MarkupSyntaxKind.AttributeKey, keyChildren));

    this.collectTrivia();
    if (this.at(MarkupSyntaxKind.Equal)) {
      children.push(this.consume(MarkupSyntaxKind.Equal));
    } else {
      children.push(this.expected("XP010", "Expected '=' after attribute name.", this.current()));
      return createSyntaxNode(MarkupSyntaxKind.Attribute, children);
    }

    this.collectTrivia();
    if (this.at(MarkupSyntaxKind.StringLiteral)) {
      children.push(this.consume(MarkupSyntaxKind.StringLiteral));
    } else {
      children.push(this.expected("XP011", "A quoted attribute value expected.", this.current()));
    }

    return createSyntaxNode(MarkupSyntaxKind.Attribute, children);
  }

  private collectTrivia(): void {
    while (isMarkupTrivia(this.current().kind)) {
      this.pendingTrivia.push(createTokenNode(this.current()));
      this.offset++;
    }
  }

  private consume(expectedKind?: MarkupSyntaxKind): MarkupSyntaxNode {
    const token = this.current();
    if (expectedKind && token.kind !== expectedKind) {
      return this.expected("XP012", `Expected ${expectedKind}.`, token);
    }
    this.offset++;
    const trivia = this.pendingTrivia;
    this.pendingTrivia = [];
    return createTokenNode(token, trivia);
  }

  private expected(
    code: string,
    message: string,
    token: MarkupToken,
    consumeToken: boolean = false,
  ): MarkupSyntaxNode {
    const span = this.source.span(token.span.start, token.span.end);
    this.diagnostics.push(createErrorDiagnostic(code, message, span));

    if (consumeToken && token.kind !== MarkupSyntaxKind.EndOfFile) {
      const consumed = this.consume();
      return createErrorNode(span, [consumed]);
    }
    return createErrorNode(span);
  }

  private report(
    code: string,
    message: string,
    start: number,
    end: number,
    contextNode?: MarkupSyntaxNode,
  ): void {
    this.diagnostics.push(
      createErrorDiagnostic(
        code,
        message,
        this.source.span(start, end),
        contextNode ? this.source.span(contextNode.pos, contextNode.end) : undefined,
      ),
    );
  }

  private at(kind: MarkupSyntaxKind): boolean {
    return this.current().kind === kind;
  }

  private current(): MarkupToken {
    return this.tokens[this.offset] ?? this.tokens[this.tokens.length - 1];
  }

  private textOfName(node: MarkupSyntaxNode): string {
    return node.children?.map((child) => getNodeText(child, this.source)).join("") ?? "";
  }

  private spanFromChildren(children: MarkupSyntaxNode[]) {
    const first = children[0];
    const last = children.at(-1);
    const start = first?.pos ?? this.current().span.start;
    return this.source.span(start, last?.end ?? start);
  }
}
