/**
 * Tests for the type-contract verifier.
 * Step 0 baseline + Phase 2 (W3-2) per-component prop / event checks.
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

// ─── Phase 2 — per-component prop / event checks (W3-2) ─────────────────────

describe("verifyComponentDef — missing-required", () => {
  it("emits missing-required when a required prop is absent", () => {
    const registry = makeRegistry({
      Form: {
        props: {
          data: { description: "Form data", isRequired: true, valueType: "any" },
        },
      },
    });
    const def = { type: "Form" } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "missing-required",
      componentName: "Form",
      propName: "data",
    });
  });

  it("does not emit missing-required when required prop is present", () => {
    const registry = makeRegistry({
      Form: {
        props: {
          data: { description: "Form data", isRequired: true, valueType: "any" },
        },
      },
    });
    const def = { type: "Form", props: { data: "myData" } } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });
});

describe("verifyComponentDef — unknown-prop", () => {
  it("emits unknown-prop for a prop not in metadata", () => {
    const registry = makeRegistry({
      Button: {
        props: { label: { description: "Button label" } },
      },
    });
    const def = { type: "Button", props: { typoField: "oops" } } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "unknown-prop",
      componentName: "Button",
      propName: "typoField",
    });
  });

  it("provides a Levenshtein suggestion for a close match", () => {
    const registry = makeRegistry({
      Button: {
        props: { label: { description: "Button label" } },
      },
    });
    // "labe" is 1 edit away from "label"
    const def = { type: "Button", props: { labe: "Save" } } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "unknown-prop",
      componentName: "Button",
      propName: "labe",
      suggestion: "label",
    });
  });

  it("does not suggest when the typo is too far from any known prop", () => {
    const registry = makeRegistry({
      Button: {
        props: { label: { description: "Button label" } },
      },
    });
    const def = { type: "Button", props: { completelywrong: "x" } } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0].suggestion).toBeUndefined();
  });

  it("skips layout option props (e.g. width, height)", () => {
    const registry = makeRegistry({
      Button: {
        props: { label: { description: "Button label" } },
      },
    });
    // Layout props should be silently accepted
    const def = {
      type: "Button",
      props: { label: "Save", width: "200px", height: "40px" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });

  it("skips responsive layout variants (e.g. width-md)", () => {
    const registry = makeRegistry({
      Button: { props: { label: { description: "label" } } },
    });
    const def = {
      type: "Button",
      props: { "width-md": "100px", "height-lg": "50px" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });

  it("skips all props for components with allowArbitraryProps", () => {
    const registry = makeRegistry({
      HtmlDiv: { allowArbitraryProps: true },
    });
    const def = {
      type: "HtmlDiv",
      props: { "data-testid": "div", customAttr: "val" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });
});

describe("verifyComponentDef — wrong-type", () => {
  it("emits wrong-type for a literal value that fails the declared valueType", () => {
    const registry = makeRegistry({
      NumberBox: {
        props: {
          initialValue: { description: "Initial value", valueType: "number" },
        },
      },
    });
    const def = {
      type: "NumberBox",
      props: { initialValue: "not-a-number" },
    } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "wrong-type",
      componentName: "NumberBox",
      propName: "initialValue",
    });
  });

  it("does not emit wrong-type for an expression-valued prop", () => {
    const registry = makeRegistry({
      NumberBox: {
        props: {
          initialValue: { description: "Initial value", valueType: "number" },
        },
      },
    });
    const def = {
      type: "NumberBox",
      props: { initialValue: "{state.count}" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });

  it("does not emit wrong-type for a valid literal value", () => {
    const registry = makeRegistry({
      NumberBox: {
        props: {
          initialValue: { description: "Initial value", valueType: "number" },
        },
      },
    });
    const def = {
      type: "NumberBox",
      props: { initialValue: "42" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });

  it("emits wrong-type for an invalid integer value", () => {
    const registry = makeRegistry({
      Slider: {
        props: { step: { description: "Step size", valueType: "integer" } },
      },
    });
    const def = { type: "Slider", props: { step: "1.5" } } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("wrong-type");
  });
});

describe("verifyComponentDef — value-not-in-enum", () => {
  it("emits value-not-in-enum for a literal not in availableValues", () => {
    const registry = makeRegistry({
      Button: {
        props: {
          variant: {
            description: "Button variant",
            availableValues: ["primary", "secondary", "ghost"],
          },
        },
      },
    });
    const def = {
      type: "Button",
      props: { variant: "vibrant" },
    } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "value-not-in-enum",
      componentName: "Button",
      propName: "variant",
      actual: "vibrant",
    });
  });

  it("does not emit value-not-in-enum for a valid enum value", () => {
    const registry = makeRegistry({
      Button: {
        props: {
          variant: {
            description: "Button variant",
            availableValues: ["primary", "secondary"],
          },
        },
      },
    });
    const def = {
      type: "Button",
      props: { variant: "primary" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });

  it("skips enum check for expression-valued props", () => {
    const registry = makeRegistry({
      Button: {
        props: {
          variant: {
            description: "Button variant",
            availableValues: ["primary", "secondary"],
          },
        },
      },
    });
    const def = {
      type: "Button",
      props: { variant: "{state.variant}" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });

  it("enum failure takes priority over wrong-type for the same prop", () => {
    // A prop with both availableValues and a valueType — enum check fires and
    // the wrong-type check is suppressed for that prop.
    const registry = makeRegistry({
      Button: {
        props: {
          size: {
            description: "Size",
            valueType: "string",
            availableValues: ["sm", "md", "lg"],
          },
        },
      },
    });
    const def = { type: "Button", props: { size: "xxl" } } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("value-not-in-enum");
  });
});

describe("verifyComponentDef — unknown-event", () => {
  it("emits unknown-event for an event not in metadata", () => {
    const registry = makeRegistry({
      Button: {
        events: { click: { description: "Click event" } },
      },
    });
    const def = {
      type: "Button",
      events: { doubleClick: "handler()" },
    } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "unknown-event",
      componentName: "Button",
      propName: "doubleClick",
    });
  });

  it("does not emit unknown-event for a declared event", () => {
    const registry = makeRegistry({
      Button: {
        events: { click: { description: "Click event" } },
      },
    });
    const def = {
      type: "Button",
      events: { click: "handleClick()" },
    } as ComponentDef;
    expect(verifyComponentDef(def, registry)).toHaveLength(0);
  });
});

describe("verifyComponentDef — deprecated-prop", () => {
  it("emits deprecated-prop (warn) for a prop with a deprecationMessage", () => {
    const registry = makeRegistry({
      Button: {
        props: {
          isDisabled: {
            description: "Legacy disabled",
            deprecationMessage: "Use 'enabled' instead.",
          },
        },
      },
    });
    const def = {
      type: "Button",
      props: { isDisabled: "true" },
    } as ComponentDef;
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "deprecated-prop",
      severity: "warn",
      componentName: "Button",
      propName: "isDisabled",
    });
  });

  it("keeps deprecated-prop as warn even in strict mode", () => {
    const registry = makeRegistry({
      Button: {
        props: {
          isDisabled: {
            description: "Legacy disabled",
            deprecationMessage: "Use 'enabled' instead.",
          },
        },
      },
    });
    const def = {
      type: "Button",
      props: { isDisabled: "true" },
    } as ComponentDef;
    const result = verifyComponentDef(def, registry, { strict: true });
    const dep = result.find((d) => d.code === "deprecated-prop");
    expect(dep?.severity).toBe("warn");
  });
});

describe("verifyComponentDef — recursion and tree walk", () => {
  it("finds unknown props in deeply nested children", () => {
    const registry = makeRegistry({
      App: {},
      Stack: { props: { gap: { description: "Gap" } } },
      Button: { props: { label: { description: "Label" } } },
    });
    const def: ComponentDef = {
      type: "App",
      children: [
        {
          type: "Stack",
          children: [
            {
              type: "Button",
              props: { lable: "Save" }, // typo
            } as ComponentDef,
          ],
        } as ComponentDef,
      ],
    };
    const result = verifyComponentDef(def, registry);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      code: "unknown-prop",
      componentName: "Button",
      propName: "lable",
      suggestion: "label",
    });
  });

  it("handles a tree with 1000 nodes in under 50 ms", () => {
    // Build a flat 1000-node tree under a single App root
    const registry = makeRegistry({
      App: {},
      Text: { props: { value: { description: "Content", valueType: "string" } } },
    });
    const children: ComponentDef[] = Array.from({ length: 1000 }, (_, i) => ({
      type: "Text",
      props: { value: `item-${i}` },
    } as ComponentDef));
    const def: ComponentDef = { type: "App", children };

    const t0 = performance.now();
    const result = verifyComponentDef(def, registry);
    const elapsed = performance.now() - t0;

    expect(elapsed).toBeLessThan(50);
    expect(result).toHaveLength(0);
  });
});

describe("verifyComponentDef — severity escalation", () => {
  it("escalates all violations to error in strict mode", () => {
    const registry = makeRegistry({
      Button: {
        props: {
          label: { description: "Label", isRequired: true },
        },
      },
    });
    const def = {
      type: "Button",
      props: { unknownProp: "x" },
    } as ComponentDef;
    const result = verifyComponentDef(def, registry, { strict: true });
    // missing-required (label absent) + unknown-prop (unknownProp)
    expect(result.every((d) => d.severity === "error")).toBe(true);
  });
});


