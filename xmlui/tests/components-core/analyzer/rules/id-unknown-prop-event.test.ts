/**
 * Tests for analyzer rules: id-unknown-prop, id-unknown-event
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";

// Side-effect imports register the rules
import "../../../../src/components-core/analyzer/rules/id-unknown-prop";
import "../../../../src/components-core/analyzer/rules/id-unknown-event";

// ---------------------------------------------------------------------------
// Mock registry helpers
// ---------------------------------------------------------------------------

function mockRegistry(
  entries: Record<
    string,
    {
      allowArbitraryProps?: boolean;
      props?: Record<string, { description: string }>;
      events?: Record<string, { description: string }>;
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

// ---------------------------------------------------------------------------
// id-unknown-prop
// ---------------------------------------------------------------------------

describe("rule: id-unknown-prop", () => {
  it("emits no diagnostic when the prop is declared in metadata", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { label: "Click" },
    };
    const registry = mockRegistry({
      Button: { props: { label: { description: "Button label" } } },
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });

  it("emits a warn for an unknown prop in non-strict mode", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { labl: "Click" },
    };
    const registry = mockRegistry({
      Button: { props: { label: { description: "Button label" } } },
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    const diags = results.filter((d) => d.code === "id-unknown-prop");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("warn");
    expect(diags[0].message).toContain("labl");
    expect(diags[0].suggestions?.[0]?.replacement).toBe("label");
  });

  it("escalates to error in strict mode", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { labl: "Click" },
    };
    const registry = mockRegistry({
      Button: { props: { label: { description: "label" } } },
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: true,
    });
    const diags = results.filter((d) => d.code === "id-unknown-prop");
    expect(diags[0].severity).toBe("error");
  });

  it("skips the check when allowArbitraryProps is true", () => {
    const root: ComponentDef = {
      type: "Custom",
      props: { anything: "value" },
    };
    const registry = mockRegistry({ Custom: { allowArbitraryProps: true } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Custom />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });

  it("skips framework-level props (uid, testId, when, slot, etc.)", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { uid: "btn1", testId: "t", when: "true", slot: "footer" },
    };
    const registry = mockRegistry({ Button: { props: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });

  it("skips behavior-contributed props (tooltip, label, bindTo, etc.)", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { tooltip: "Help text", variant: "solid", bookmark: "b1" },
    };
    const registry = mockRegistry({ Button: { props: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });

  it("skips data-* attributes", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { "data-custom": "value" },
    };
    const registry = mockRegistry({ Button: { props: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });

  it("treats onX attributes as events (not props) — skipped by this rule", () => {
    const root: ComponentDef = {
      type: "Button",
      props: { onClick: "handler()" },
    };
    const registry = mockRegistry({ Button: { props: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    // onClick is onX → skipped by id-unknown-prop (handled by id-unknown-event)
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });

  it("emits no diagnostic when markupAst is not provided", () => {
    const registry = mockRegistry({ Button: { props: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />" }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-prop")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// id-unknown-event
// ---------------------------------------------------------------------------

describe("rule: id-unknown-event", () => {
  it("emits no diagnostic for a declared event", () => {
    const root: ComponentDef = {
      type: "Button",
      events: { onClick: "handler()" },
    };
    const registry = mockRegistry({
      Button: { events: { onClick: { description: "Click handler" } } },
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-event")).toHaveLength(0);
  });

  it("emits a warn for an unknown event in non-strict mode", () => {
    const root: ComponentDef = {
      type: "Button",
      events: { onClik: "handler()" },
    };
    const registry = mockRegistry({
      Button: { events: { onClick: { description: "Click handler" } } },
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    const diags = results.filter((d) => d.code === "id-unknown-event");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("warn");
    expect(diags[0].message).toContain("onClik");
    expect(diags[0].suggestions?.[0]?.replacement).toBe("onClick");
  });

  it("escalates to error in strict mode", () => {
    const root: ComponentDef = {
      type: "Button",
      events: { onClik: "handler()" },
    };
    const registry = mockRegistry({
      Button: { events: { onClick: { description: "click" } } },
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: true,
    });
    expect(results.filter((d) => d.code === "id-unknown-event")[0].severity).toBe("error");
  });

  it("allows framework lifecycle events (onMount, onUnmount, onDidChange)", () => {
    const root: ComponentDef = {
      type: "Button",
      events: { onMount: "init()", onUnmount: "cleanup()", onDidChange: "react()" },
    };
    const registry = mockRegistry({ Button: { events: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />", markupAst: root }],
      componentRegistry: registry,
      strict: true,
    });
    expect(results.filter((d) => d.code === "id-unknown-event")).toHaveLength(0);
  });

  it("emits no diagnostic when markupAst is not provided", () => {
    const registry = mockRegistry({ Button: { events: {} } });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Button />" }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "id-unknown-event")).toHaveLength(0);
  });
});
