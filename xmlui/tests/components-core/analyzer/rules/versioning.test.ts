/**
 * Tests for analyzer rule family: versioning (plan #12)
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

// Side-effect import registers the versioning rule family.
import "../../../../src/components-core/analyzer/rules/versioning";

function mockRegistry(entries: Record<string, any> = {}) {
  return {
    hasComponent: (name: string) => name in entries,
    lookupComponentRenderer: (name: string) =>
      name in entries ? { descriptor: entries[name] } : undefined,
    getComponentNames: () => Object.keys(entries),
  } as any;
}

function runAnalyzer(root: ComponentDef, registry: any, strict = false) {
  return analyze({
    files: [{ file: "Test.xmlui", source: "<App />", markupAst: root }],
    componentRegistry: registry,
    strict,
  });
}

describe("analyzer rule: versioning", () => {
  it("emits deprecated-component for a component with status deprecated", () => {
    const reg = mockRegistry({
      OldThing: { status: "deprecated", deprecationMessage: "Use NewThing." },
    });
    const root: ComponentDef = { type: "OldThing" };
    const results = runAnalyzer(root, reg);
    const ruleResults = results.filter((d) => d.code === "deprecated-component");
    expect(ruleResults).toHaveLength(1);
    expect(ruleResults[0].severity).toBe("warn");
    expect(ruleResults[0].message).toContain("Use NewThing");
  });

  it("emits experimental-use for an experimental component", () => {
    const reg = mockRegistry({ NewThing: { status: "experimental" } });
    const results = runAnalyzer({ type: "NewThing" }, reg);
    const findings = results.filter((d) => d.code === "experimental-use");
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe("info");
  });

  it("emits internal-component-use warn by default and error in strict mode", () => {
    const reg = mockRegistry({ Internal: { status: "internal" } });
    const def: ComponentDef = { type: "Internal" };

    const lax = runAnalyzer(def, reg, false).filter(
      (d) => d.code === "internal-component-use",
    );
    expect(lax[0].severity).toBe("warn");

    const strict = runAnalyzer(def, reg, true).filter(
      (d) => d.code === "internal-component-use",
    );
    expect(strict[0].severity).toBe("error");
  });

  it("emits deprecated-prop for a prop carrying deprecationMessage", () => {
    const reg = mockRegistry({
      Button: {
        props: {
          oldProp: { deprecationMessage: "Use newProp.", replacement: "newProp" },
        },
      },
    });
    const root: ComponentDef = {
      type: "Button",
      props: { oldProp: "x" },
    } as any;
    const results = runAnalyzer(root, reg);
    const findings = results.filter((d) => d.code === "deprecated-prop");
    expect(findings).toHaveLength(1);
    expect(findings[0].message).toContain("oldProp");
  });

  it("emits deprecated-event for a deprecated event handler", () => {
    const reg = mockRegistry({
      Button: {
        events: { onLegacyClick: { deprecationMessage: "Use onClick." } },
      },
    });
    const root: ComponentDef = {
      type: "Button",
      events: { onLegacyClick: "doSomething()" },
    } as any;
    const results = runAnalyzer(root, reg);
    const findings = results.filter((d) => d.code === "deprecated-event");
    expect(findings).toHaveLength(1);
  });

  it("does not double-emit when called repeatedly thanks to caching", () => {
    const reg = mockRegistry({ X: { status: "deprecated" } });
    const root: ComponentDef = { type: "X" };
    const a = runAnalyzer(root, reg).filter((d) => d.code === "deprecated-component");
    const b = runAnalyzer(root, reg).filter((d) => d.code === "deprecated-component");
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });

  it("does not emit anything when the registry has no metadata for the type", () => {
    const reg = mockRegistry({});
    const root: ComponentDef = { type: "Unknown" };
    const results = runAnalyzer(root, reg);
    const findings = results.filter((d) => d.code.startsWith("deprecated"));
    expect(findings).toHaveLength(0);
  });
});
