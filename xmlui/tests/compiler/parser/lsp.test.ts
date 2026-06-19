import { describe, expect, it } from "vitest";

import {
  diagnosticsToLspDiagnostics,
  findMarkupCursorContext,
  findScriptCursorContext,
  markupSemanticTokens,
  parseMarkup,
  scriptSemanticTokens,
  SourceText,
} from "../../../src/parser";

describe("parser LSP adapters", () => {
  it("returns markup semantic-token data", () => {
    const tokens = markupSemanticTokens('<Button onClick="count++">Hi</Button>', "Main.xmlui");

    expect(tokens).toEqual(
      expect.arrayContaining([
        {
          text: "Button",
          classification: "identifier",
          range: { start: { line: 0, character: 1 }, end: { line: 0, character: 7 } },
        },
        {
          text: '"count++"',
          classification: "string",
          range: { start: { line: 0, character: 16 }, end: { line: 0, character: 25 } },
        },
        {
          text: "Hi",
          classification: "text",
          range: { start: { line: 0, character: 26 }, end: { line: 0, character: 28 } },
        },
      ]),
    );
  });

  it("returns script semantic-token data with embedded ranges", () => {
    const tokens = scriptSemanticTokens("$props.label || count", {
      originSpan: { sourceId: "Main.xmlui", start: 100, end: 121 },
    });

    expect(tokens[0]).toEqual({
      text: "$",
      classification: "punctuation",
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
    });
    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "||", classification: "operator" }),
        expect.objectContaining({ text: "count", classification: "identifier" }),
      ]),
    );
  });

  it("returns broader expression semantic-token data", () => {
    const tokens = scriptSemanticTokens("items.map(item => item.label).join(', ') ?? fallback");

    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: "items", classification: "identifier" }),
        expect.objectContaining({ text: "=>", classification: "operator" }),
        expect.objectContaining({ text: "??", classification: "operator" }),
        expect.objectContaining({ text: "', '", classification: "string" }),
      ]),
    );
  });

  it("maps diagnostics to LSP ranges", () => {
    const source = new SourceText("<App>\n<Button label />\n</App>", "Main.xmlui");
    const parsed = parseMarkup(source);

    expect(diagnosticsToLspDiagnostics(parsed.diagnostics, source)).toEqual([
      expect.objectContaining({
        code: "XP010",
        message: "Expected '=' after attribute name.",
        range: { start: { line: 1, character: 14 }, end: { line: 1, character: 16 } },
      }),
    ]);
  });

  it("finds markup cursor contexts", () => {
    const context = findMarkupCursorContext('<App><Button /></App>', 7, "Main.xmlui");

    expect(context.lookup?.chainAtPos.at(-1)?.text).toBe("Button");
    expect(context.parseResult.diagnostics).toEqual([]);
  });

  it("finds script cursor contexts", () => {
    const context = findScriptCursorContext("$props.label || count", 2);

    expect(context.lookup?.chainAtPos.map((node) => node.kind)).toEqual([
      "BinaryExpression",
      "MemberExpression",
      "Identifier",
    ]);
  });
});
