/**
 * Tests for analyzer rule: id-unknown-component
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import { registerRule, getRules } from "../../../../src/components-core/analyzer/rule-registry";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

// Side-effect import registers the rule
import "../../../../src/components-core/analyzer/rules/id-unknown-component";

// ---------------------------------------------------------------------------
// Mock registry
// ---------------------------------------------------------------------------

type MockEntry = { descriptor?: { allowArbitraryProps?: boolean; props?: Record<string, any>; events?: Record<string, any> } };

function mockRegistry(
  knownComponents: string[] = [],
  entries: Record<string, MockEntry> = {},
) {
  return {
    hasComponent: (name: string) => knownComponents.includes(name),
    lookupComponentRenderer: (name: string) => entries[name] ?? undefined,
    getComponentNames: () => knownComponents,
  } as any;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeInput(root: ComponentDef, source = "<App />"): any {
  return {
    files: [{ file: "Test.xmlui", source, markupAst: root }],
    componentRegistry: mockRegistry(["App", "Button", "VStack", "Text"]),
    strict: false,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("rule: id-unknown-component", () => {
  it("emits no diagnostic for a known component", () => {
    const root: ComponentDef = { type: "App", children: [{ type: "Button" }] };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(0);
  });

  it("emits an error for an unknown component tag", () => {
    const root: ComponentDef = { type: "App", children: [{ type: "Buttn" }] };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(1);
    expect(ruleResults[0].severity).toBe("error");
    expect(ruleResults[0].message).toContain("Buttn");
  });

  it("includes a Levenshtein suggestion for close misspellings", () => {
    const root: ComponentDef = { type: "App", children: [{ type: "Buttn" }] };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults[0].suggestions?.[0]?.replacement).toBe("Button");
  });

  it("does not include a suggestion when nothing is close", () => {
    const root: ComponentDef = { type: "App", children: [{ type: "XyzAbc123" }] };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(1);
    expect(ruleResults[0].suggestions).toBeUndefined();
  });

  it("skips the Component (compound component root) type", () => {
    const root: ComponentDef = { type: "Component", children: [{ type: "Button" }] };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(0);
  });

  it("skips lowercase HTML tag names", () => {
    const root: ComponentDef = {
      type: "App",
      children: [{ type: "div" }, { type: "html-button" }],
    };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(0);
  });

  it("emits no diagnostic when markupAst is not provided", () => {
    const results = analyze({
      files: [{ file: "Test.xmlui", source: "<App />" }],
      componentRegistry: mockRegistry(),
      strict: false,
    });
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(0);
  });

  it("walks nested children and reports each unknown", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "VStack", children: [{ type: "Textt" }, { type: "Btn" }] },
      ],
    };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults).toHaveLength(2);
  });

  it("reports the source file in each diagnostic", () => {
    const root: ComponentDef = { type: "App", children: [{ type: "Buttn" }] };
    const results = analyze(makeInput(root));
    const ruleResults = results.filter((d) => d.code === "id-unknown-component");
    expect(ruleResults[0].file).toBe("Test.xmlui");
  });
});
