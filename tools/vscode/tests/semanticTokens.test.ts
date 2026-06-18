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
});

describe("collectXmluiDiagnostics", () => {
  it("returns parser diagnostics with VS Code-friendly ranges", () => {
    const diagnostics = collectXmluiDiagnostics("<App><Button label /></App>");

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "XP010",
        message: "Expected '=' after attribute name.",
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
});
