/**
 * Tests for analyzer rule: udc-slot-undeclared (plan #14 Step 2.2).
 */

import { describe, it, expect } from "vitest";
import { analyze } from "../../../../src/components-core/analyzer/walker";
import type { ComponentDef } from "../../../../src/abstractions/ComponentDefs";
import type { UdcContract } from "../../../../src/components-core/udc-sandbox";

// Side-effect import registers the rule
import "../../../../src/components-core/analyzer/rules/udc-slot-undeclared";

function makeUdcContract(name: string, slots: string[]): UdcContract {
  return {
    name,
    props: new Map(),
    events: new Set(),
    methods: new Set(),
    slots: new Set(slots),
    slotProvides: new Map(),
    capabilities: new Set(),
    capabilitiesDeclared: false,
    trust: "trusted",
  };
}

function mockRegistry(udcs: Record<string, UdcContract | undefined>) {
  return {
    hasComponent: (name: string) => name in udcs,
    getComponentNames: () => Object.keys(udcs),
    lookupComponentRenderer: (name: string) => {
      if (!(name in udcs)) return undefined;
      return {
        descriptor: undefined,
        isCompoundComponent: true,
        udcContract: udcs[name],
      };
    },
  } as any;
}

describe("rule: udc-slot-undeclared", () => {
  it("emits no diagnostic when the slot is declared", () => {
    const root: ComponentDef = {
      type: "Card",
      children: [
        { type: "Text", props: { slot: "header" } },
      ],
    };
    const registry = mockRegistry({
      Card: makeUdcContract("Card", ["header", "footer"]),
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Card />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "udc-slot-undeclared")).toHaveLength(0);
  });

  it("emits a warn for an undeclared slot in non-strict mode", () => {
    const root: ComponentDef = {
      type: "Card",
      children: [
        { type: "Text", props: { slot: "heder" } },
      ],
    };
    const registry = mockRegistry({
      Card: makeUdcContract("Card", ["header", "footer"]),
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Card />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    const diags = results.filter((d) => d.code === "udc-slot-undeclared");
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("warn");
    expect(diags[0].message).toContain("heder");
    expect(diags[0].suggestions?.[0]?.replacement).toBe("header");
  });

  it("escalates to error in strict mode", () => {
    const root: ComponentDef = {
      type: "Card",
      children: [{ type: "Text", props: { slot: "missing" } }],
    };
    const registry = mockRegistry({
      Card: makeUdcContract("Card", ["header"]),
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Card />", markupAst: root }],
      componentRegistry: registry,
      strict: true,
    });
    const diags = results.filter((d) => d.code === "udc-slot-undeclared");
    expect(diags[0].severity).toBe("error");
  });

  it("skips when the UDC declares no slots (legacy / inferred mode)", () => {
    const root: ComponentDef = {
      type: "Card",
      children: [{ type: "Text", props: { slot: "whatever" } }],
    };
    const registry = mockRegistry({
      Card: makeUdcContract("Card", []),
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Card />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "udc-slot-undeclared")).toHaveLength(0);
  });

  it("skips when the host is not a UDC", () => {
    const root: ComponentDef = {
      type: "Stack",
      children: [{ type: "Text", props: { slot: "x" } }],
    };
    const registry = {
      hasComponent: () => true,
      getComponentNames: () => ["Stack"],
      lookupComponentRenderer: () => ({
        descriptor: {},
        isCompoundComponent: false,
      }),
    } as any;
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Stack />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "udc-slot-undeclared")).toHaveLength(0);
  });

  it("skips children with no slot attribute", () => {
    const root: ComponentDef = {
      type: "Card",
      children: [{ type: "Text" }, { type: "Text", props: {} }],
    };
    const registry = mockRegistry({
      Card: makeUdcContract("Card", ["header"]),
    });
    const results = analyze({
      files: [{ file: "T.xmlui", source: "<Card />", markupAst: root }],
      componentRegistry: registry,
      strict: false,
    });
    expect(results.filter((d) => d.code === "udc-slot-undeclared")).toHaveLength(0);
  });
});
