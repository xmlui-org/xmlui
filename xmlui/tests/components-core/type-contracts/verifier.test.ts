/**
 * Tests for the type-contract verifier (Step 0 skeleton).
 */

import { describe, it, expect } from "vitest";
import { verifyComponentDef } from "../../../src/components-core/type-contracts/verifier";
import type {
  ComponentDef,
  ComponentMetadata,
} from "../../../src/abstractions/ComponentDefs";

function makeRegistry(
  entries: Record<string, Partial<ComponentMetadata>> = {},
): ReadonlyMap<string, ComponentMetadata> {
  return new Map(Object.entries(entries) as [string, ComponentMetadata][]);
}

describe("verifyComponentDef — Step 0 baseline", () => {
  it("returns no diagnostics for an empty ComponentDef of a known type", () => {
    const def: ComponentDef = { type: "App" };
    const registry = makeRegistry({ App: {} });
    expect(verifyComponentDef(def, registry)).toEqual([]);
  });

  it("respects skipUnknown: true for an unregistered component", () => {
    const def: ComponentDef = {
      type: "App",
      children: [{ type: "UnknownWidget" }],
    } as ComponentDef;
    const registry = makeRegistry({ App: {} });
    expect(
      verifyComponentDef(def, registry, { skipUnknown: true }),
    ).toEqual([]);
  });

  it("emits unknown-component (warn) for an unregistered component when not skipping", () => {
    const def: ComponentDef = {
      type: "App",
      children: [{ type: "UnknownWidget" }],
    } as ComponentDef;
    const registry = makeRegistry({ App: {} });
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "unknown-component",
      severity: "warn",
      componentName: "UnknownWidget",
    });
  });

  it("escalates severity to error in strict mode", () => {
    const def: ComponentDef = { type: "UnknownWidget" } as ComponentDef;
    const registry = makeRegistry({ App: {} });
    const result = verifyComponentDef(def, registry, { strict: true });
    expect(result[0].severity).toBe("error");
  });

  it("does not flag framework types (Component, Fragment, #text)", () => {
    const def: ComponentDef = {
      type: "Component",
      children: [{ type: "Fragment" }, { type: "#text" } as any],
    } as ComponentDef;
    const registry = makeRegistry();
    expect(verifyComponentDef(def, registry)).toEqual([]);
  });

  it("recurses into nested children", () => {
    const def: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Stack",
          children: [{ type: "TypoComponent" }],
        },
      ],
    } as ComponentDef;
    const registry = makeRegistry({ App: {}, Stack: {} });
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0].componentName).toBe("TypoComponent");
  });
});
