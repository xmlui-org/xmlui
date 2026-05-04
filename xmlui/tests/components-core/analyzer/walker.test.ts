import { describe, it, expect, beforeEach } from "vitest";
import { analyze, registerRule, getRules } from "../../../src/components-core/analyzer/index";
import type { AnalyzerRule, RuleContext } from "../../../src/components-core/analyzer/index";
import type { BuildDiagnostic } from "../../../src/components-core/analyzer/diagnostics";
import { buildSuppressionMap, isSuppressed } from "../../../src/components-core/analyzer/suppression";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A minimal mock ComponentRegistry that satisfies the type without
 * importing the full React-based ComponentProvider.
 */
function mockRegistry() {
  return {} as any;
}

// ---------------------------------------------------------------------------
// Walker tests
// ---------------------------------------------------------------------------

describe("analyzer/walker", () => {
  it("returns an empty array when no files are provided", () => {
    const result = analyze({
      files: [],
      componentRegistry: mockRegistry(),
      strict: false,
    });
    expect(result).toEqual([]);
  });

  it("returns an empty array when there are no registered rules", () => {
    const result = analyze({
      files: [{ file: "Main.xmlui", source: "<App />" }],
      componentRegistry: mockRegistry(),
      strict: false,
    });
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Rule registry tests
// ---------------------------------------------------------------------------

describe("analyzer/rule-registry", () => {
  let registered: string[] = [];

  beforeEach(() => {
    // Capture how many rules were registered before this test.
    registered = getRules().map((r) => r.code);
  });

  it("getRules returns a readonly array", () => {
    const rules = getRules();
    expect(Array.isArray(rules)).toBe(true);
    // Must not be the internal mutable array.
    expect(Object.isFrozen(rules) || rules !== getRules()).toBeTruthy();
  });

  it("registerRule adds a new rule and it appears in getRules()", () => {
    const uniqueCode = `test-rule-${Date.now()}-${Math.random()}`;
    const rule: AnalyzerRule = {
      code: uniqueCode,
      description: "Temporary test rule",
      defaultSeverity: "warn",
      strictSeverity: "error",
      appliesTo: "markup",
      run: (_ctx: RuleContext) => [],
    };
    registerRule(rule);
    const rules = getRules();
    expect(rules.some((r) => r.code === uniqueCode)).toBe(true);
  });

  it("registerRule throws when the same code is registered twice", () => {
    const uniqueCode = `test-duplicate-${Date.now()}-${Math.random()}`;
    const rule: AnalyzerRule = {
      code: uniqueCode,
      description: "Test duplicate",
      defaultSeverity: "info",
      strictSeverity: "warn",
      appliesTo: "expression",
      run: () => [],
    };
    registerRule(rule);
    expect(() => registerRule(rule)).toThrow();
  });

  it("a registered rule is called by analyze and its diagnostics are collected", () => {
    const uniqueCode = `test-emitting-${Date.now()}-${Math.random()}`;
    const rule: AnalyzerRule = {
      code: uniqueCode,
      description: "Always emits one diagnostic",
      defaultSeverity: "warn",
      strictSeverity: "error",
      appliesTo: "markup",
      run: (ctx: RuleContext): BuildDiagnostic[] => [
        {
          code: uniqueCode,
          severity: "warn",
          file: ctx.file,
          line: 1,
          column: 1,
          length: 0,
          message: "test diagnostic",
        },
      ],
    };
    registerRule(rule);
    const result = analyze({
      files: [{ file: "Test.xmlui", source: "<App />" }],
      componentRegistry: mockRegistry(),
      strict: false,
    });
    const found = result.filter((d) => d.code === uniqueCode);
    expect(found).toHaveLength(1);
    expect(found[0].message).toBe("test diagnostic");
  });

  it("a crashing rule produces an internal-rule-error diagnostic instead of throwing", () => {
    const uniqueCode = `test-crashing-${Date.now()}-${Math.random()}`;
    const rule: AnalyzerRule = {
      code: uniqueCode,
      description: "Always throws",
      defaultSeverity: "warn",
      strictSeverity: "error",
      appliesTo: "markup",
      run: () => {
        throw new Error("rule exploded");
      },
    };
    registerRule(rule);
    expect(() =>
      analyze({
        files: [{ file: "Test.xmlui", source: "<App />" }],
        componentRegistry: mockRegistry(),
        strict: false,
      }),
    ).not.toThrow();
    const result = analyze({
      files: [{ file: "Test.xmlui", source: "<App />" }],
      componentRegistry: mockRegistry(),
      strict: false,
    });
    const errorDiags = result.filter((d) => d.code === "internal-rule-error");
    expect(errorDiags.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Suppression tests
// ---------------------------------------------------------------------------

describe("analyzer/suppression", () => {

  it("returns an empty map for a file with no suppression comments", () => {
    const map = buildSuppressionMap("<App><Button /></App>");
    expect(map.size).toBe(0);
  });

  it("xmlui-disable-next-line suppresses the following line for the named code", () => {
    const source = [
      "<!-- xmlui-disable-next-line id-unknown-component -->",
      "<Buttn />",
    ].join("\n");
    const map = buildSuppressionMap(source);
    expect(isSuppressed("id-unknown-component", 2, map)).toBe(true);
    // Line 1 (the comment itself) is not suppressed.
    expect(isSuppressed("id-unknown-component", 1, map)).toBe(false);
    // A different code is not suppressed.
    expect(isSuppressed("id-unknown-prop", 2, map)).toBe(false);
  });

  it("xmlui-disable/enable suppresses a range", () => {
    const source = [
      "<App>",
      "<!-- xmlui-disable expr-unused-var -->",
      "<Text value='{unused}' />",
      "<Text value='{alsoUnused}' />",
      "<!-- xmlui-enable expr-unused-var -->",
      "<Text value='{fine}' />",
      "</App>",
    ].join("\n");
    const map = buildSuppressionMap(source);
    // Lines 3 and 4 are inside the disable block.
    expect(isSuppressed("expr-unused-var", 3, map)).toBe(true);
    expect(isSuppressed("expr-unused-var", 4, map)).toBe(true);
    // Line 6 is outside.
    expect(isSuppressed("expr-unused-var", 6, map)).toBe(false);
  });

  it("an unterminated disable block is suppressed to end-of-file", () => {
    const source = [
      "<!-- xmlui-disable id-unknown-component -->",
      "<Foo />",
      "<Bar />",
    ].join("\n");
    const map = buildSuppressionMap(source);
    expect(isSuppressed("id-unknown-component", 2, map)).toBe(true);
    expect(isSuppressed("id-unknown-component", 3, map)).toBe(true);
  });
});
