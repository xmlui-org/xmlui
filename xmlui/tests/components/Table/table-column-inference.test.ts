import { describe, expect, it } from "vitest";
import {
  buildInferredColumns,
  DEFAULT_COLUMN_INFERENCE,
  discoverColumnFields,
  inferColumnType,
  parseColumnInference,
  sampleRowsForColumnInference,
} from "../../../src/components/Table/table-column-inference";

describe("Table columnInference parser", () => {
  it("uses first-n(25) as the default", () => {
    expect(DEFAULT_COLUMN_INFERENCE).toBe("first-n(25)");
    expect(parseColumnInference(undefined)).toEqual({
      mode: { name: "first-n", count: 25 },
      diagnostics: [],
    });
    expect(parseColumnInference(null).mode).toEqual({ name: "first-n", count: 25 });
    expect(parseColumnInference("").mode).toEqual({ name: "first-n", count: 25 });
    expect(parseColumnInference("   ").mode).toEqual({ name: "first-n", count: 25 });
  });

  it.each([
    ["first-only", { name: "first-only" }],
    ["all", { name: "all" }],
    ["non-null-first", { name: "non-null-first" }],
    ["visible-page", { name: "visible-page" }],
    ["schema-only", { name: "schema-only" }],
    ["off", { name: "off" }],
    ["first-n(10)", { name: "first-n", count: 10 }],
    ["sample(100)", { name: "sample", count: 100 }],
    ["until-stable(5)", { name: "until-stable", count: 5 }],
  ])("parses %s", (input, expected) => {
    const result = parseColumnInference(input);
    expect(result.mode).toEqual(expected);
    expect(result.diagnostics).toEqual([]);
  });

  it("normalizes mode casing and whitespace", () => {
    expect(parseColumnInference("  FIRST-N( 25 ) ").mode).toEqual({
      name: "first-n",
      count: 25,
    });
    expect(parseColumnInference(" Sample( 3 ) ").mode).toEqual({
      name: "sample",
      count: 3,
    });
  });

  it.each([
    [42, "invalid-mode-value"],
    [{}, "invalid-mode-value"],
    ["whatever", "unknown-mode"],
    ["first_n(10)", "malformed-mode"],
    ["first-n", "invalid-count"],
    ["first-n()", "invalid-count"],
    ["first-n(0)", "invalid-count"],
    ["first-n(-1)", "invalid-count"],
    ["first-n(1.5)", "invalid-count"],
    ["first-n(x)", "invalid-count"],
    ["sample()", "invalid-count"],
    ["until-stable(0)", "invalid-count"],
    ["all(10)", "invalid-count"],
    ["off(1)", "invalid-count"],
  ] as const)("falls back for invalid input %s", (input, code) => {
    const result = parseColumnInference(input);
    expect(result.mode).toEqual({ name: "first-n", count: 25 });
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({ code, input });
  });

  it("never throws for malformed public input", () => {
    const inputs = [undefined, null, "", 123, {}, [], "first-n(x)", "sample(1,2)", "all(3)"];

    for (const input of inputs) {
      expect(() => parseColumnInference(input)).not.toThrow();
    }
  });
});

describe("Table inferred field discovery", () => {
  it("returns no fields for empty or non-object rows", () => {
    expect(discoverColumnFields([], "all")).toEqual([]);
    expect(discoverColumnFields([1, "x", null, undefined], "all")).toEqual([]);
    expect(discoverColumnFields([[1, 2], new Date("2026-01-01")], "all")).toEqual([]);
  });

  it("preserves first sampled row field order", () => {
    const rows = [{ id: 1, name: "Ada", total: 42 }];
    expect(discoverColumnFields(rows, "all")).toEqual(["id", "name", "total"]);
  });

  it("appends later sampled fields in discovery order", () => {
    const rows = [
      { id: 1, name: "Ada" },
      { id: 2, total: 42, status: "sent" },
      { id: 3, name: "Grace", note: "late" },
    ];
    expect(discoverColumnFields(rows, "all")).toEqual(["id", "name", "total", "status", "note"]);
  });

  it("obeys sampling mode while discovering fields", () => {
    const rows = [
      { id: 1, first: true },
      { id: 2, second: true },
      { id: 3, third: true },
    ];
    expect(discoverColumnFields(rows, "first-only")).toEqual(["id", "first"]);
    expect(discoverColumnFields(rows, "first-n(2)")).toEqual(["id", "first", "second"]);
    expect(discoverColumnFields(rows, "all")).toEqual(["id", "first", "second", "third"]);
  });

  it("uses first-n(25) by default", () => {
    const rows = Array.from({ length: 30 }, (_, index) => ({
      id: index,
      [`field${index}`]: true,
    }));
    const fields = discoverColumnFields(rows);
    expect(fields).toContain("field24");
    expect(fields).not.toContain("field25");
  });

  it("ignores runtime order fields", () => {
    expect(discoverColumnFields([{ id: 1, order: 1, name: "Ada" }], "all")).toEqual(["id", "name"]);
  });

  it("ignores prototype and non-enumerable fields", () => {
    const row = Object.create({ inherited: true });
    Object.defineProperty(row, "hidden", { value: true, enumerable: false });
    row.visible = true;
    expect(discoverColumnFields([row], "all")).toEqual([]);

    const plain = { visible: true };
    Object.defineProperty(plain, "hidden", { value: true, enumerable: false });
    expect(discoverColumnFields([plain], "all")).toEqual(["visible"]);
  });

  it("discovers keys even when values are null", () => {
    expect(discoverColumnFields([{ id: 1, nullable: null }], "all")).toEqual(["id", "nullable"]);
  });
});

describe("Table inferred column metadata", () => {
  it("builds sortable column metadata from discovered fields", () => {
    expect(buildInferredColumns([{ id: 1, name: "Ada" }], "all")).toEqual([
      { header: "id", accessorKey: "id", canSort: true, type: "integer" },
      { header: "name", accessorKey: "name", canSort: true, type: "text" },
    ]);
  });

  it("does not mutate input rows", () => {
    const rows = [{ id: 1, name: "Ada" }];
    const snapshot = structuredClone(rows);
    buildInferredColumns(rows, "all");
    expect(rows).toEqual(snapshot);
  });

  it("returns no columns when inference is off", () => {
    expect(buildInferredColumns([{ id: 1, name: "Ada" }], "off")).toEqual([]);
  });
});

describe("Table inferred column types", () => {
  it("infers integer and number values", () => {
    expect(inferColumnType([1, 2, 3])).toBe("integer");
    expect(inferColumnType([1, 2.5, 3])).toBe("number");
  });

  it("falls back to text for non-finite or mixed numeric values", () => {
    expect(inferColumnType([1, Number.NaN])).toBe("text");
    expect(inferColumnType([1, "2"])).toBe("text");
  });

  it("infers boolean values", () => {
    expect(inferColumnType([true, false, true])).toBe("boolean");
  });

  it("ignores nullish and empty string samples", () => {
    expect(inferColumnType([null, undefined, "", 42])).toBe("integer");
    expect(inferColumnType([null, undefined, ""])).toBe("text");
  });

  it("infers date and datetime strings", () => {
    expect(inferColumnType(["2026-08-06", "2026-08-07"])).toBe("date");
    expect(inferColumnType(["2026-08-06T10:15:00Z", "2026-08-07T12:00:00Z"])).toBe("datetime");
  });

  it("infers email, url, and phone strings using a conservative threshold", () => {
    expect(inferColumnType(["a@example.com", "b@example.com", "not email"])).toBe("text");
    expect(
      inferColumnType(["a@example.com", "b@example.com", "c@example.com", "d@example.com"]),
    ).toBe("email");
    expect(inferColumnType(["https://example.com", "http://xmlui.org"])).toBe("url");
    expect(inferColumnType(["+1 555 123 4567", "(555) 234-5678"])).toBe("phone");
  });

  it("infers long text above the length threshold", () => {
    expect(inferColumnType(["short", "x".repeat(81)])).toBe("long-text");
  });

  it("infers enum for low-cardinality short strings", () => {
    expect(inferColumnType(["draft", "sent", "draft", "failed", "sent", "draft"])).toBe("enum");
  });

  it("keeps high-cardinality strings as text", () => {
    expect(inferColumnType(["a", "b", "c", "d", "e", "f"])).toBe("text");
  });

  it("infers tags for arrays of short strings", () => {
    expect(inferColumnType([["red", "blue"], ["green"]])).toBe("tags");
  });

  it("infers array for other arrays", () => {
    expect(inferColumnType([[1, 2], ["text"]])).toBe("array");
  });

  it("infers object for plain objects", () => {
    expect(inferColumnType([{ a: 1 }, { b: 2 }])).toBe("object");
  });
});

describe("Table columnInference sampling", () => {
  const rows = Array.from({ length: 10 }, (_, index) => ({ id: index }));

  it("does not mutate the input rows", () => {
    const original = rows.slice();
    sampleRowsForColumnInference(rows, "sample(4)");
    expect(rows).toEqual(original);
  });

  it("samples first-only", () => {
    expect(sampleRowsForColumnInference(rows, "first-only")).toEqual([{ id: 0 }]);
    expect(sampleRowsForColumnInference([], "first-only")).toEqual([]);
  });

  it("samples first-n", () => {
    expect(sampleRowsForColumnInference(rows, "first-n(3)")).toEqual([
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ]);
    expect(sampleRowsForColumnInference(rows.slice(0, 2), "first-n(5)")).toEqual([
      { id: 0 },
      { id: 1 },
    ]);
  });

  it("samples all rows for all, non-null-first, and until-stable", () => {
    expect(sampleRowsForColumnInference(rows, "all")).toEqual(rows);
    expect(sampleRowsForColumnInference(rows, "non-null-first")).toEqual(rows);
    expect(sampleRowsForColumnInference(rows, "until-stable(2)")).toEqual(rows);
  });

  it("returns no rows for off and schema-only", () => {
    expect(sampleRowsForColumnInference(rows, "off")).toEqual([]);
    expect(sampleRowsForColumnInference(rows, "schema-only")).toEqual([]);
  });

  it("uses deterministic spread sampling", () => {
    expect(sampleRowsForColumnInference(rows, "sample(4)")).toEqual([
      { id: 0 },
      { id: 3 },
      { id: 6 },
      { id: 9 },
    ]);
    expect(sampleRowsForColumnInference(rows, "sample(1)")).toEqual([{ id: 0 }]);
  });

  it("returns all rows when sample count exceeds row count", () => {
    expect(sampleRowsForColumnInference(rows.slice(0, 3), "sample(5)")).toEqual([
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ]);
  });

  it("uses visible rows for visible-page when provided", () => {
    const visibleRows = [{ id: 4 }, { id: 5 }];
    expect(sampleRowsForColumnInference(rows, "visible-page", visibleRows)).toEqual(visibleRows);
  });

  it("falls back to all rows for visible-page without visible rows", () => {
    expect(sampleRowsForColumnInference(rows, "visible-page")).toEqual(rows);
  });

  it("accepts a parsed mode object", () => {
    expect(sampleRowsForColumnInference(rows, { name: "first-n", count: 2 })).toEqual([
      { id: 0 },
      { id: 1 },
    ]);
  });

  it("uses default sampling for invalid mode strings", () => {
    expect(sampleRowsForColumnInference(rows, "wat")).toEqual(rows.slice(0, 10));
    expect(
      sampleRowsForColumnInference(
        Array.from({ length: 30 }, (_, id) => ({ id })),
        "wat",
      ),
    ).toHaveLength(25);
  });
});
