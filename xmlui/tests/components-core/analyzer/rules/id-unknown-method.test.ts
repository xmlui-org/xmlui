/**
 * Tests for analyzer rule: id-unknown-method
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

import "../../../../src/components-core/analyzer/rules/id-unknown-method";

function mockRegistry(
  entries: Record<
    string,
    {
      allowArbitraryProps?: boolean;
      apis?: Record<string, { description: string }>;
    }
  > = {},
) {
  return {
    hasComponent: (name: string) => name in entries,
    getComponentNames: () => Object.keys(entries),
    lookupComponentRenderer: (name: string) => {
      if (!(name in entries)) return undefined;
      return { descriptor: entries[name] };
    },
  } as any;
}

function runWithAst(root: ComponentDef, registry: any, strict = false) {
  return analyze({
    files: [{ file: "T.xmlui", source: "<App/>", markupAst: root }],
    componentRegistry: registry,
    strict,
  });
}

describe("rule: id-unknown-method", () => {
  it("flags unknown method invocation on a uid-referenced component", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", uid: "myBtn", events: { onClick: "myBtn.fla()" } },
      ],
    };
    const registry = mockRegistry({
      Button: { apis: { flash: { description: "flash" } } },
    });
    const results = runWithAst(root, registry);
    const diags = results.filter((d) => d.code === "id-unknown-method");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("warn");
    expect(diags[0].message).toContain("fla");
    expect(diags[0].suggestions?.[0]?.replacement).toBe("flash");
  });

  it("does not flag a declared method", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", uid: "myBtn", events: { onClick: "myBtn.flash()" } },
      ],
    };
    const registry = mockRegistry({
      Button: { apis: { flash: { description: "flash" } } },
    });
    const results = runWithAst(root, registry);
    expect(results.filter((d) => d.code === "id-unknown-method")).toHaveLength(0);
  });

  it("escalates to error in strict mode", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", uid: "myBtn", events: { onClick: "myBtn.fla()" } },
      ],
    };
    const registry = mockRegistry({
      Button: { apis: { flash: { description: "flash" } } },
    });
    const results = runWithAst(root, registry, true);
    const diags = results.filter((d) => d.code === "id-unknown-method");
    expect(diags[0].severity).toBe("error");
  });

  it("skips when the rooted component allowArbitraryProps", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Custom", uid: "x", events: { onClick: "x.anything()" } },
      ],
    };
    const registry = mockRegistry({ Custom: { allowArbitraryProps: true } });
    const results = runWithAst(root, registry);
    expect(results.filter((d) => d.code === "id-unknown-method")).toHaveLength(0);
  });

  it("does not flag chains longer than one hop", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Form", uid: "f", events: { onSubmit: "f.fields.unknown()" } },
      ],
    };
    const registry = mockRegistry({ Form: { apis: { submit: { description: "submit" } } } });
    const results = runWithAst(root, registry);
    // Chain has memberPath length > 1 → rule skips
    expect(results.filter((d) => d.code === "id-unknown-method")).toHaveLength(0);
  });

  it("does not flag chains rooted at an unknown identifier", () => {
    const root: ComponentDef = {
      type: "App",
      children: [
        { type: "Button", events: { onClick: "notAUid.flash()" } },
      ],
    };
    const registry = mockRegistry({ Button: { apis: { flash: { description: "" } } } });
    const results = runWithAst(root, registry);
    // The root identifier isn't a known uid, so id-unknown-method skips.
    expect(results.filter((d) => d.code === "id-unknown-method")).toHaveLength(0);
  });
});
