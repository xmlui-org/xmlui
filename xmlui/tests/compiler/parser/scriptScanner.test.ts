import { describe, expect, it } from "vitest";

import { ScriptTokenKind, tokenizeScript, type ScriptToken } from "../../../src/parser";

describe("ScriptScanner", () => {
  it("tokenizes initial expression examples", () => {
    expect(kinds(tokenizeScript("0").tokens)).toEqual([
      ScriptTokenKind.NumberLiteral,
      ScriptTokenKind.EndOfFile,
    ]);
    expect(kinds(tokenizeScript("count").tokens)).toEqual([
      ScriptTokenKind.Identifier,
      ScriptTokenKind.EndOfFile,
    ]);
    expect(kinds(tokenizeScript("$props.label || 'Click to increment'").tokens)).toEqual([
      ScriptTokenKind.Dollar,
      ScriptTokenKind.Identifier,
      ScriptTokenKind.Dot,
      ScriptTokenKind.Identifier,
      ScriptTokenKind.WhitespaceTrivia,
      ScriptTokenKind.LogicalOr,
      ScriptTokenKind.WhitespaceTrivia,
      ScriptTokenKind.StringLiteral,
      ScriptTokenKind.EndOfFile,
    ]);
  });

  it("tokenizes the initial event-handler example", () => {
    const result = tokenizeScript("count++");

    expect(result.diagnostics).toEqual([]);
    expect(kinds(result.tokens)).toEqual([
      ScriptTokenKind.Identifier,
      ScriptTokenKind.PlusPlus,
      ScriptTokenKind.EndOfFile,
    ]);
    expect(result.tokens[1]).toMatchObject({
      text: "++",
      classification: "operator",
    });
  });

  it("classifies keywords, identifiers, literals, trivia, and punctuation", () => {
    const result = tokenizeScript("true false null undefined call(1)");

    expect(project(result.tokens)).toEqual([
      ["TrueKeyword", "true", "keyword"],
      ["WhitespaceTrivia", " ", "trivia"],
      ["FalseKeyword", "false", "keyword"],
      ["WhitespaceTrivia", " ", "trivia"],
      ["NullKeyword", "null", "keyword"],
      ["WhitespaceTrivia", " ", "trivia"],
      ["UndefinedKeyword", "undefined", "keyword"],
      ["WhitespaceTrivia", " ", "trivia"],
      ["Identifier", "call", "identifier"],
      ["OpenParen", "(", "punctuation"],
      ["NumberLiteral", "1", "string"],
      ["CloseParen", ")", "punctuation"],
      ["EndOfFile", "", "punctuation"],
    ]);
  });

  it("maps embedded script spans back to the containing xmlui source span", () => {
    const result = tokenizeScript("count++", {
      originSpan: {
        sourceId: "Main.xmlui",
        start: 42,
        end: 49,
      },
    });

    expect(result.tokens[0].span).toEqual({
      sourceId: "Main.xmlui",
      start: 42,
      end: 47,
      generatedFrom: {
        sourceId: "anonymous.xmlui",
        start: 0,
        end: 5,
      },
    });
    expect(result.tokens[1].span).toMatchObject({
      sourceId: "Main.xmlui",
      start: 47,
      end: 49,
    });
  });

  it("preserves comments and reports recoverable scanner diagnostics", () => {
    const comments = tokenizeScript("count // note\n/* block */");
    const unknown = tokenizeScript("count @");
    const unterminatedString = tokenizeScript("'oops");
    const unterminatedComment = tokenizeScript("/* nope");

    expect(project(comments.tokens)).toEqual([
      ["Identifier", "count", "identifier"],
      ["WhitespaceTrivia", " ", "trivia"],
      ["LineCommentTrivia", "// note", "comment"],
      ["NewLineTrivia", "\n", "trivia"],
      ["BlockCommentTrivia", "/* block */", "comment"],
      ["EndOfFile", "", "punctuation"],
    ]);

    expect(unknown.diagnostics[0]).toMatchObject({
      code: "XS001",
      message: "Unknown script character '@'.",
      severity: "error",
      span: { sourceId: "anonymous.xmlui", start: 6, end: 7 },
    });
    expect(kinds(unknown.tokens)).toContain(ScriptTokenKind.Unknown);

    expect(unterminatedString.diagnostics[0]).toMatchObject({
      code: "XS002",
      span: { sourceId: "anonymous.xmlui", start: 0, end: 5 },
    });
    expect(unterminatedComment.diagnostics[0]).toMatchObject({
      code: "XS003",
      span: { sourceId: "anonymous.xmlui", start: 0, end: 7 },
    });
  });
});

function kinds(tokens: ScriptToken[]) {
  return tokens.map((token) => token.kind);
}

function project(tokens: ScriptToken[]) {
  return tokens.map((token) => [token.kind, token.text, token.classification]);
}
