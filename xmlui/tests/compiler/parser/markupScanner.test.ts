import { describe, expect, it } from "vitest";

import { MarkupSyntaxKind, tokenizeMarkup } from "../../../src/parser";
import type { MarkupToken } from "../../../src/parser";

describe("MarkupScanner", () => {
  it("tokenizes the local counter example with stable kinds and offsets", () => {
    const source =
      '<App var.count="{0}"><H1>Counter example</H1><Button onClick="count++">Click: {count}</Button></App>';
    const result = tokenizeMarkup(source, "Main.xmlui");

    expect(result.diagnostics).toEqual([]);
    expect(kinds(result.tokens)).toEqual([
      MarkupSyntaxKind.OpenNodeStart,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.WhitespaceTrivia,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.Dot,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.Equal,
      MarkupSyntaxKind.StringLiteral,
      MarkupSyntaxKind.NodeEnd,
      MarkupSyntaxKind.OpenNodeStart,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.NodeEnd,
      MarkupSyntaxKind.Text,
      MarkupSyntaxKind.CloseNodeStart,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.NodeEnd,
      MarkupSyntaxKind.OpenNodeStart,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.WhitespaceTrivia,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.Equal,
      MarkupSyntaxKind.StringLiteral,
      MarkupSyntaxKind.NodeEnd,
      MarkupSyntaxKind.Text,
      MarkupSyntaxKind.CloseNodeStart,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.NodeEnd,
      MarkupSyntaxKind.CloseNodeStart,
      MarkupSyntaxKind.Identifier,
      MarkupSyntaxKind.NodeEnd,
      MarkupSyntaxKind.EndOfFile,
    ]);

    const appToken = result.tokens[1];
    expect(appToken.text).toBe("App");
    expect(appToken.span).toEqual({ sourceId: "Main.xmlui", start: 1, end: 4 });

    const countAttribute = result.tokens.find(
      (token) => token.kind === MarkupSyntaxKind.Identifier && token.text === "count",
    );
    expect(countAttribute?.span).toEqual({ sourceId: "Main.xmlui", start: 9, end: 14 });

    const eventValue = result.tokens.find((token) => token.value === "count++");
    expect(eventValue).toMatchObject({
      kind: MarkupSyntaxKind.StringLiteral,
      text: '"count++"',
      classification: "string",
      value: "count++",
    });
  });

  it("tokenizes component and global counter features", () => {
    const component = tokenizeMarkup(
      `<Component name="IncrementButton" var.count="{0}">
        <Button onClick="count++">{$props.label || 'Click to increment'}: {count}</Button>
      </Component>`,
      "IncrementButton.xmlui",
    );
    const globals = tokenizeMarkup(
      `<App global.count="{0}"><Button var.count="{0}" onClick="count++" /></App>`,
      "Main.xmlui",
    );

    expect(component.diagnostics).toEqual([]);
    expect(globals.diagnostics).toEqual([]);
    expect(texts(component.tokens)).toContain("{$props.label || 'Click to increment'}: {count}");
    expect(texts(globals.tokens)).toEqual(
      expect.arrayContaining(["global", ".", "count", "var", ".", "count"]),
    );
  });

  it("preserves trivia and comments", () => {
    const result = tokenizeMarkup("<App>\n  <!-- note -->\n  <Button />\n</App>", "Main.xmlui");

    expect(result.diagnostics).toEqual([]);
    expect(result.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: MarkupSyntaxKind.NewLineTrivia,
          text: "\n",
          classification: "trivia",
        }),
        expect.objectContaining({
          kind: MarkupSyntaxKind.WhitespaceTrivia,
          text: "  ",
          classification: "trivia",
        }),
        expect.objectContaining({
          kind: MarkupSyntaxKind.CommentTrivia,
          text: "<!-- note -->",
          classification: "comment",
        }),
      ]),
    );
  });

  it("exposes token classifications suitable for LSP adapters", () => {
    const result = tokenizeMarkup('<Button onClick="count++">Click</Button>', "Main.xmlui");

    expect(classified(result.tokens, "Button")).toMatchObject({
      kind: MarkupSyntaxKind.Identifier,
      classification: "identifier",
    });
    expect(classified(result.tokens, "=")).toMatchObject({
      kind: MarkupSyntaxKind.Equal,
      classification: "operator",
    });
    expect(classified(result.tokens, "Click")).toMatchObject({
      kind: MarkupSyntaxKind.Text,
      classification: "text",
    });
    expect(classified(result.tokens, '"count++"')).toMatchObject({
      kind: MarkupSyntaxKind.StringLiteral,
      classification: "string",
    });
  });

  it("reports scanner diagnostics while still returning tokens", () => {
    const unknown = tokenizeMarkup("<App @ />", "Main.xmlui");
    const unterminatedString = tokenizeMarkup('<App name="oops>', "Main.xmlui");
    const unterminatedComment = tokenizeMarkup("<App><!-- note", "Main.xmlui");

    expect(unknown.diagnostics[0]).toMatchObject({
      code: "XM001",
      message: "Unknown markup character '@'.",
      severity: "error",
      span: { sourceId: "Main.xmlui", start: 5, end: 6 },
    });
    expect(kinds(unknown.tokens)).toContain(MarkupSyntaxKind.Unknown);
    expect(texts(unknown.tokens)).toEqual(
      expect.arrayContaining(["<", "App", "@", " ", "/>", ""]),
    );

    expect(unterminatedString.diagnostics[0]).toMatchObject({
      code: "XM002",
      severity: "error",
      span: { sourceId: "Main.xmlui", start: 10, end: 16 },
    });
    expect(unterminatedString.tokens.at(-1)?.kind).toBe(MarkupSyntaxKind.EndOfFile);

    expect(unterminatedComment.diagnostics[0]).toMatchObject({
      code: "XM003",
      severity: "error",
      span: { sourceId: "Main.xmlui", start: 5, end: 14 },
    });
    expect(unterminatedComment.tokens.at(-1)?.kind).toBe(MarkupSyntaxKind.EndOfFile);
  });
});

function kinds(tokens: MarkupToken[]) {
  return tokens.map((token) => token.kind);
}

function texts(tokens: MarkupToken[]) {
  return tokens.map((token) => token.text);
}

function classified(tokens: MarkupToken[], text: string) {
  const token = tokens.find((candidate) => candidate.text === text);
  if (!token) {
    throw new Error(`Expected to find token "${text}".`);
  }
  return token;
}
