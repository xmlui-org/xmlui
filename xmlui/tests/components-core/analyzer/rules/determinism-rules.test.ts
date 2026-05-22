/**
 * Tests for analyzer W7-3 rules:
 *   - determinism-floating-point-token (plan #16 Step 3.1)
 *   - determinism-iteration-order-symbol (plan #16 Step 3.2)
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";

// Side-effect imports register the rules
import "../../../../src/components-core/analyzer/rules/determinism-floating-point-token";
import "../../../../src/components-core/analyzer/rules/determinism-iteration-order-symbol";

function mockRegistry() {
  return {
    hasComponent: () => false,
    getComponentNames: () => [],
    lookupComponentRenderer: () => undefined,
  } as any;
}

function analyzeSource(source: string, strict = false) {
  return analyze({
    files: [{ file: "T.xmlui", source }],
    componentRegistry: mockRegistry(),
    strict,
  });
}

describe("rule: determinism-floating-point-token", () => {
  it("flags decimal arithmetic in style attribute", () => {
    const results = analyzeSource('<Button style="margin: {0.1 + 0.2}rem" />');
    const diags = results.filter((d) => d.code === "determinism-floating-point-token");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
  });

  it("flags decimal arithmetic in vars attribute", () => {
    const results = analyzeSource('<Theme vars="{ padding: 0.5 * 2 }" />');
    const diags = results.filter((d) => d.code === "determinism-floating-point-token");
    expect(diags).toHaveLength(1);
  });

  it("escalates to warn in strict mode", () => {
    const results = analyzeSource('<Button style="margin: {0.1 + 0.2}rem" />', true);
    const diags = results.filter((d) => d.code === "determinism-floating-point-token");
    expect(diags[0].severity).toBe("warn");
  });

  it("does not flag plain integer arithmetic", () => {
    const results = analyzeSource('<Button style="margin: {2 + 3}px" />');
    const diags = results.filter((d) => d.code === "determinism-floating-point-token");
    expect(diags).toHaveLength(0);
  });

  it("does not flag style values without arithmetic", () => {
    const results = analyzeSource('<Button style="margin: 1.5rem; padding: 0.5rem" />');
    const diags = results.filter((d) => d.code === "determinism-floating-point-token");
    expect(diags).toHaveLength(0);
  });

  it("does not flag other attributes", () => {
    const results = analyzeSource('<Text value="{0.1 + 0.2}" />');
    const diags = results.filter((d) => d.code === "determinism-floating-point-token");
    expect(diags).toHaveLength(0);
  });
});

describe("rule: determinism-iteration-order-symbol", () => {
  it("flags Object.getOwnPropertySymbols", () => {
    const results = analyzeSource(
      '<Items data="{Object.getOwnPropertySymbols(obj)}" />',
    );
    const diags = results.filter((d) => d.code === "determinism-iteration-order-symbol");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
  });

  it("flags Reflect.ownKeys", () => {
    const results = analyzeSource(
      '<Items data="{Reflect.ownKeys(obj)}" />',
    );
    const diags = results.filter((d) => d.code === "determinism-iteration-order-symbol");
    expect(diags).toHaveLength(1);
  });

  it("flags Symbol() construction inside expressions", () => {
    const results = analyzeSource(
      '<Items data="{[Symbol(\'a\'), Symbol(\'b\')]}" />',
    );
    const diags = results.filter((d) => d.code === "determinism-iteration-order-symbol");
    expect(diags.length).toBeGreaterThanOrEqual(1);
  });

  it("escalates to warn in strict mode", () => {
    const results = analyzeSource(
      '<Items data="{Object.getOwnPropertySymbols(obj)}" />',
      true,
    );
    const diags = results.filter((d) => d.code === "determinism-iteration-order-symbol");
    expect(diags[0].severity).toBe("warn");
  });

  it("does not flag plain Object.keys", () => {
    const results = analyzeSource('<Items data="{Object.keys(obj)}" />');
    const diags = results.filter((d) => d.code === "determinism-iteration-order-symbol");
    expect(diags).toHaveLength(0);
  });
});
