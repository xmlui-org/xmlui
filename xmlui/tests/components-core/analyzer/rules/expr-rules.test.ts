/**
 * Tests for analyzer Phase 2 rules: expr-dead-conditional, expr-handler-no-value
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";

// Side-effect imports register the rules
import "../../../../src/components-core/analyzer/rules/expr-dead-conditional";
import "../../../../src/components-core/analyzer/rules/expr-handler-no-value";

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

// ---------------------------------------------------------------------------
// expr-dead-conditional
// ---------------------------------------------------------------------------

describe("rule: expr-dead-conditional", () => {
  it("emits info for `true ?` literal condition", () => {
    const results = analyzeSource('<Button label="{true ? \'a\' : \'b\'}" />');
    const diags = results.filter((d) => d.code === "expr-dead-conditional");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
  });

  it("emits info for `false ?` literal condition", () => {
    const results = analyzeSource('<Button label="{false ? \'a\' : \'b\'}" />');
    const diags = results.filter((d) => d.code === "expr-dead-conditional");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
  });

  it("emits info for `false &&` short-circuit", () => {
    const results = analyzeSource('<Button when="{false && someCondition}" />');
    const diags = results.filter((d) => d.code === "expr-dead-conditional");
    expect(diags).toHaveLength(1);
  });

  it("emits info for `true ||` short-circuit", () => {
    const results = analyzeSource('<Button when="{true || someCondition}" />');
    const diags = results.filter((d) => d.code === "expr-dead-conditional");
    expect(diags).toHaveLength(1);
  });

  it("escalates to warn in strict mode", () => {
    const results = analyzeSource('<Button when="{true ? \'a\' : \'b\'}" />', true);
    const diags = results.filter((d) => d.code === "expr-dead-conditional");
    expect(diags[0].severity).toBe("warn");
  });

  it("emits no diagnostic for a normal conditional", () => {
    const results = analyzeSource('<Button when="{count > 0 ? \'a\' : \'b\'}" />');
    const diags = results.filter((d) => d.code === "expr-dead-conditional");
    expect(diags).toHaveLength(0);
  });

  it("emits no diagnostic for clean source", () => {
    const results = analyzeSource('<App><VStack><Button label="Click" /></VStack></App>');
    expect(results.filter((d) => d.code === "expr-dead-conditional")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// expr-handler-no-value
// ---------------------------------------------------------------------------

describe("rule: expr-handler-no-value", () => {
  it("emits info for a bare identifier event handler", () => {
    const results = analyzeSource('<Button onClick="{myAction}" />');
    const diags = results.filter((d) => d.code === "expr-handler-no-value");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("info");
    expect(diags[0].message).toContain("myAction");
  });

  it("includes a suggestion to add ()", () => {
    const results = analyzeSource('<Button onClick="{myAction}" />');
    const diags = results.filter((d) => d.code === "expr-handler-no-value");
    expect(diags[0].suggestions?.[0]?.replacement).toBe('onClick="{myAction()}"');
  });

  it("does not flag a properly called handler", () => {
    const results = analyzeSource('<Button onClick="{myAction()}" />');
    expect(results.filter((d) => d.code === "expr-handler-no-value")).toHaveLength(0);
  });

  it("does not flag a non-event attribute", () => {
    const results = analyzeSource('<Button label="{myLabel}" />');
    expect(results.filter((d) => d.code === "expr-handler-no-value")).toHaveLength(0);
  });

  it("escalates to warn in strict mode", () => {
    const results = analyzeSource('<Button onClick="{myAction}" />', true);
    const diags = results.filter((d) => d.code === "expr-handler-no-value");
    expect(diags[0].severity).toBe("warn");
  });

  it("does not flag a handler with a method call chain", () => {
    const results = analyzeSource('<Button onClick="{store.save()}" />');
    expect(results.filter((d) => d.code === "expr-handler-no-value")).toHaveLength(0);
  });
});
