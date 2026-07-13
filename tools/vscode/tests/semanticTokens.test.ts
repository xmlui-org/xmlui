import { describe, expect, it } from "vitest";

import { collectXmluiDiagnostics } from "../src/diagnostics";
import { collectXmluiSemanticTokens } from "../src/semanticTokens";

describe("collectXmluiSemanticTokens", () => {
  it("uses parser-backed markup tokens for tag and attribute highlighting", () => {
    const tokens = collectXmluiSemanticTokens('<Button onClick="count++">Hi</Button>');

    expect(tokens).toEqual(
      expect.arrayContaining([
        { line: 0, character: 1, length: 6, tokenType: "xmluiTag" },
        { line: 0, character: 8, length: 7, tokenType: "xmluiAttribute" },
        { line: 0, character: 26, length: 2, tokenType: "xmluiText" },
      ]),
    );
  });

  it("highlights event handler script using embedded script tokens", () => {
    const tokens = collectXmluiSemanticTokens('<Button onClick="count++" />');

    expect(tokens).toEqual(
      expect.arrayContaining([
        { line: 0, character: 17, length: 5, tokenType: "xmluiWriteTarget" },
        { line: 0, character: 22, length: 2, tokenType: "operator" },
      ]),
    );
  });

  it("highlights mixed text expressions using the script scanner", () => {
    const tokens = collectXmluiSemanticTokens("<Button>Hello {count}</Button>");

    expect(tokens).toEqual(
      expect.arrayContaining([
        { line: 0, character: 15, length: 5, tokenType: "variable" },
      ]),
    );
  });

  it("distinguishes special variables and member names in embedded expressions", () => {
    const tokens = collectXmluiSemanticTokens(
      "<Button>{$props.label || 'Click to increment'}</Button>",
    );

    expect(tokens).toEqual(
      expect.arrayContaining([
        { line: 0, character: 9, length: 6, tokenType: "xmluiSpecial" },
        { line: 0, character: 16, length: 5, tokenType: "xmluiMember" },
        { line: 0, character: 22, length: 2, tokenType: "operator" },
        { line: 0, character: 25, length: 20, tokenType: "string" },
      ]),
    );
  });

  it("highlights broader embedded expression syntax", () => {
    const tokens = collectXmluiSemanticTokens(
      `<Text value="{items.map(item => item.label).join(', ') ?? fallback}" />`,
    );

    expect(tokens).toEqual(
      expect.arrayContaining([
        { line: 0, character: 14, length: 5, tokenType: "variable" },
        { line: 0, character: 20, length: 3, tokenType: "xmluiMember" },
        { line: 0, character: 24, length: 4, tokenType: "variable" },
        { line: 0, character: 29, length: 2, tokenType: "operator" },
        { line: 0, character: 32, length: 4, tokenType: "variable" },
        { line: 0, character: 37, length: 5, tokenType: "xmluiMember" },
        { line: 0, character: 44, length: 4, tokenType: "xmluiMember" },
        { line: 0, character: 49, length: 4, tokenType: "string" },
        { line: 0, character: 55, length: 2, tokenType: "operator" },
        { line: 0, character: 58, length: 8, tokenType: "variable" },
      ]),
    );
  });

  it("highlights statement keywords and assignment write targets in event handlers", () => {
    const tokens = collectXmluiSemanticTokens(
      `<Button onClick="let next = count + 1; count = next; --count" />`,
    );

    expect(tokens).toEqual(
      expect.arrayContaining([
        { line: 0, character: 17, length: 3, tokenType: "keyword" },
        { line: 0, character: 21, length: 4, tokenType: "variable" },
        { line: 0, character: 39, length: 5, tokenType: "xmluiWriteTarget" },
        { line: 0, character: 55, length: 5, tokenType: "xmluiWriteTarget" },
      ]),
    );
  });
});

describe("collectXmluiDiagnostics", () => {
  it("returns parser diagnostics with VS Code-friendly ranges", () => {
    const diagnostics = collectXmluiDiagnostics("<App><Button label= /></App>");

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "XP011",
        message: "A quoted attribute value expected.",
        line: 0,
      }),
    ]);
  });

  it("returns semantic diagnostics for unresolved expressions", () => {
    const diagnostics = collectXmluiDiagnostics("<App><Button>{missing}</Button></App>");

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "XS201",
        message: "Unresolved XMLUI script identifier 'missing'.",
        line: 0,
        character: 14,
        endCharacter: 21,
      }),
    ]);
  });

  it("returns semantic diagnostics for invalid event writes", () => {
    const diagnostics = collectXmluiDiagnostics(
      `<Component name="Broken"><Button onClick="$props.label++" /></Component>`,
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "XS202",
        message: "Cannot write to read-only XMLUI script target '$props.label'.",
      }),
    ]);
  });

  it("returns IR diagnostics when component knowledge is available", () => {
    const diagnostics = collectXmluiDiagnostics(
      "<App><MissingPanel /></App>",
      "Main.xmlui",
      { knownComponents: new Set(["IncrementButton"]) },
    );

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "IR003",
        message: "Unknown XMLUI component reference 'MissingPanel'.",
        character: 5,
        endCharacter: 21,
      }),
    ]);
  });
});
