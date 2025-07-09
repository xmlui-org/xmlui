import { describe, expect, it } from "vitest";
import {
  encodeToBase64,
  decodeFromBase64,
  transformCodeLines,
  extractMetaFromChildren,
  CodeHighlighterMetaKeys,
} from "../../../src/components/CodeBlock/highlight-code";

describe("highlight-code", () => {
  it("encodeToBase64", () => {
    expect(encodeToBase64("test")).toBe("dGVzdA==");
  });

  it("decodeFromBase64", () => {
    expect(decodeFromBase64("dGVzdA==")).toBe("test");
  });

  it("transformCodeLines: empty", () => {
    const result = transformCodeLines("");
    expect(result).toBe("");
  });

  it("transformCodeLines: preserve whitespaces if no content", () => {
    const result = transformCodeLines("   ");
    expect(result).toBe("   ");
  });

  it("transformCodeLines: preserve newlines if no content", () => {
    const result = transformCodeLines("\n\n\n");
    expect(result).toBe("\n\n\n");
  });

  it("transformCodeLines: remove leading whitespaces", () => {
    const result = transformCodeLines("\n\n\ntest");
    expect(result).toBe("test");
  });

  it("transformCodeLines: remove trailing whitespaces", () => {
    const result = transformCodeLines("test\n\n\n");
    expect(result).toBe("test");
  });

  it("transformCodeLines: return single word", () => {
    const result = transformCodeLines("test");
    expect(result).toBe("test");
  });

  it("transformCodeLines: return multi-lines", () => {
    const code = "test1\n" + "test2";
    const result = transformCodeLines(code);
    expect(result).toBe(code);
  });

  it("transformCodeLines: return multi-lines with empty line", () => {
    const code = "test1\n" + "\n" + "test2";
    const result = transformCodeLines(code);
    expect(result).toBe(code);
  });

  it("transformCodeLines: single line code", () => {
    const code = "```\n" + "test\n" + "```";
    const result = transformCodeLines(code);
    expect(result).toBe(code);
  });

  it("transformCodeLines: multi-line code", () => {
    const code = "```\n" + "test1\n" + "test2\n" + "```";
    const result = transformCodeLines(code);
    expect(result).toBe(code);
  });

  it("transformCodeLines: remove backslash from escaped codefence", () => {
    const code = "\\```\n" + "test\n" + "```";
    const expectation = "```\n" + "test\n" + "```";
    const result = transformCodeLines(code);
    expect(result).toBe(expectation);
  });

  it("transformCodeLines: preserve double backslash", () => {
    const code = "\\\\```\n" + "test\n" + "```";
    const result = transformCodeLines(code);
    expect(result).toBe(code);
  });

  it("meta: empty", () => {
    const result = extractMetaFromChildren({}, "");
    expect(result).toStrictEqual({
      copy: false,
      filename: undefined,
      highlightRows: [],
      highlightSubstrings: [],
      highlightSubstringsEmphasized: [],
      language: undefined,
    });
  });

  it("meta: disregard unrecognized keys", () => {
    const meta = {
      langage: "js",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result).toStrictEqual({
      copy: false,
      filename: undefined,
      highlightRows: [],
      highlightSubstrings: [],
      highlightSubstringsEmphasized: [],
      language: undefined,
    });
  });

  it("meta: language", () => {
    const meta = {
      [CodeHighlighterMetaKeys.language.data]: "js",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.language.prop]).toBe("js");
  });

  it("meta: copy", () => {
    const meta = {
      [CodeHighlighterMetaKeys.copy.data]: "true",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.copy.prop]).toBe(true);
  });

  it("meta: filename", () => {
    const meta = {
      [CodeHighlighterMetaKeys.filename.data]: "file",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.filename.prop]).toBe("file");
  });

  it("highlightRows empty", () => {
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows bad input", () => {
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "test",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows bad input #2", () => {
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "{1}",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows single", () => {
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 0,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows < lower bound disregarded", () => {
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "0",
    };
    const result = extractMetaFromChildren(meta, "");
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows > upper bound disregarded", () => {
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "2",
    };
    const result = extractMetaFromChildren(meta, "test");
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows first line", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 4,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows last line", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 5,
        end: 9,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows two single lines", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1, 2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 4,
        properties: { class: "codeBlockHighlightRow" },
      },
      {
        start: 5,
        end: 9,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows two single lines, disregard out of bounds", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1, 2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 4,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows two single lines, disregard out of bounds", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1, 2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 4,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows invalid input with single line", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1, a",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 4,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 9,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows disregard multiline out of bounds", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard malformed upper bound multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-a",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard malformed lower bound multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "a-2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard empty upper bound multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard empty lower bound multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "-2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard empty lower & upper bounds multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "-",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard double dash multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-2-3",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows disregard long dash multiline", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1--2",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([]);
  });

  it("highlightRows single & multiline", () => {
    const code = "test\ntest\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1, 2-3",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 4,
        properties: { class: "codeBlockHighlightRow" },
      },
      {
        start: 5,
        end: 14,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows multiline & single", () => {
    const code = "test\ntest\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-2, 3",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 9,
        properties: { class: "codeBlockHighlightRow" },
      },
      {
        start: 10,
        end: 14,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows overlapping multilines", () => {
    const code = "test\ntest\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-2, 2-3",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 9,
        properties: { class: "codeBlockHighlightRow" },
      },
      {
        start: 5,
        end: 14,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightRows overlapping multilines #2", () => {
    const code = "test\ntest\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightRows.data]: "1-3, 2-3",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightRows.prop]).toStrictEqual([
      {
        start: 0,
        end: 14,
        properties: { class: "codeBlockHighlightRow" },
      },
      {
        start: 5,
        end: 14,
        properties: { class: "codeBlockHighlightRow" },
      },
    ]);
  });

  it("highlightSubstrings empty", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64(""),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([]);
  });

  it("highlightSubstrings is number", () => {
    const code = "test3";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64(3),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 4,
        end: 5,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstrings is boolean", () => {
    const code = "test true test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64(true),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 5,
        end: 9,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstrings is object", () => {
    const code = 'test {"a":1} test';
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64({ a: 1 }),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 5,
        end: 12,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstrings single character", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64("t"),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 0,
        end: 1,
        properties: { class: "codeBlockHighlightString" },
      },
      {
        start: 3,
        end: 4,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstrings disregard not in code", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64("a"),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([]);
  });

  it("highlightSubstrings disregard partially in code", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64("esa"),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([]);
  });

  it("highlightSubstrings disregard unencoded", () => {
    const code = "test";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: "test",
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([]);
  });

  it("highlightSubstrings multiple characters", () => {
    const code = "test\ntest";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]: encodeToBase64("tes"),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 0,
        end: 3,
        properties: { class: "codeBlockHighlightString" },
      },
      {
        start: 5,
        end: 8,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstrings multiple strings", () => {
    const code = "<property name='inputTemplate'>";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]:
        `${encodeToBase64("prop")} ${encodeToBase64("inputTemplate")}`,
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 1,
        end: 5,
        properties: { class: "codeBlockHighlightString" },
      },
      {
        start: 16,
        end: 29,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstrings multiple overlapping strings", () => {
    const code = "<property name='inputTemplate'>";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstrings.data]:
        `${encodeToBase64("prop")} ${encodeToBase64("property")}`,
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstrings.prop]).toStrictEqual([
      {
        start: 1,
        end: 5,
        properties: { class: "codeBlockHighlightString" },
      },
      {
        start: 1,
        end: 9,
        properties: { class: "codeBlockHighlightString" },
      },
    ]);
  });

  it("highlightSubstringsEmphasized adds different style", () => {
    const code = "<property name='inputTemplate'>";
    const meta = {
      [CodeHighlighterMetaKeys.highlightSubstringsEmphasized.data]: encodeToBase64("property"),
    };
    const result = extractMetaFromChildren(meta, code);
    expect(result[CodeHighlighterMetaKeys.highlightSubstringsEmphasized.prop]).toStrictEqual([
      {
        start: 1,
        end: 9,
        properties: { class: "codeBlockHighlightStringEmphasis" },
      }
    ]);
  });
});
