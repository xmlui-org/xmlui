import { describe, expect, it } from "vitest";
import { xmlUiMarkupToComponent } from "../../../src/components-core/xmlui-parser";
import type { CompoundComponentDef } from "../../../src/abstractions/ComponentDefs";
import {
  emptyContract,
  validateUdcPropReferences,
  type UdcContract,
} from "../../../src/components-core/udc-sandbox";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseCompound(source: string): CompoundComponentDef {
  const result = xmlUiMarkupToComponent(source, "Main.xmlui");
  expect(result.errors).toEqual([]);
  return result.component as CompoundComponentDef;
}

// ---------------------------------------------------------------------------
// Tests — contract construction & helpers
// ---------------------------------------------------------------------------

describe("udc-sandbox / contract helpers", () => {
  it("emptyContract produces a valid trusted contract", () => {
    const c = emptyContract("Foo");
    expect(c.name).toBe("Foo");
    expect(c.props.size).toBe(0);
    expect(c.events.size).toBe(0);
    expect(c.methods.size).toBe(0);
    expect(c.slots.size).toBe(0);
    expect(c.capabilities.size).toBe(0);
    expect(c.trust).toBe("trusted");
  });
});

// ---------------------------------------------------------------------------
// Tests — parser produces a contract from declared blocks
// ---------------------------------------------------------------------------

describe("udc-sandbox / parser produces UdcContract", () => {
  it("attaches no contract when the UDC has no declaration blocks", () => {
    const def = parseCompound(`<Component name="LegacyUdc"><Text>{$props.label}</Text></Component>`);
    expect(def.contract).toBeUndefined();
  });

  it("collects declared <Prop> blocks into the contract", () => {
    const def = parseCompound(`
      <Component name="LabeledButton">
        <Prop name="label" type="string" required="true" />
        <Prop name="size" type="string" defaultValue="md" />
        <Button label="{$props.label}" />
      </Component>
    `);
    const c = def.contract as UdcContract;
    expect(c).toBeDefined();
    expect(c.name).toBe("LabeledButton");
    expect(c.props.size).toBe(2);
    expect(c.props.get("label")).toEqual({
      name: "label",
      type: "string",
      required: true,
    });
    expect(c.props.get("size")).toEqual({
      name: "size",
      type: "string",
      defaultValue: "md",
    });
  });

  it("collects <Event>, <Method>, <Slot> declarations", () => {
    const def = parseCompound(`
      <Component name="MyWidget">
        <Event name="changed" />
        <Method name="reset" />
        <Slot name="header" />
        <Slot name="footer" />
        <VStack />
      </Component>
    `);
    const c = def.contract as UdcContract;
    expect(c.events.has("changed")).toBe(true);
    expect(c.methods.has("reset")).toBe(true);
    expect(c.slots.has("header")).toBe(true);
    expect(c.slots.has("footer")).toBe(true);
  });

  it("excludes declaration blocks from the nested component tree", () => {
    // Without the exclusion, the parser would treat <Prop> as a second nested
    // component and either wrap with Fragment or fail.  Validate the root
    // component is the <Button>.
    const def = parseCompound(`
      <Component name="JustOne">
        <Prop name="label" />
        <Button label="{$props.label}" />
      </Component>
    `);
    expect(def.component.type).toBe("Button");
  });
});

// ---------------------------------------------------------------------------
// Tests — udc-prop-undeclared diagnostic
// ---------------------------------------------------------------------------

describe("udc-sandbox / udc-prop-undeclared diagnostic", () => {
  it("emits no diagnostic for legacy UDCs (no declarations)", () => {
    const def = parseCompound(
      `<Component name="LegacyUdc"><Text>{$props.label}</Text></Component>`,
    );
    const diags = validateUdcPropReferences(def, false);
    expect(diags).toEqual([]);
  });

  it("emits no diagnostic when all referenced props are declared", () => {
    const def = parseCompound(`
      <Component name="GoodUdc">
        <Prop name="label" />
        <Text>{$props.label}</Text>
      </Component>
    `);
    const diags = validateUdcPropReferences(def, false);
    expect(diags).toEqual([]);
  });

  it("emits udc-prop-undeclared for each undeclared $props reference", () => {
    const def = parseCompound(`
      <Component name="LeakyUdc">
        <Prop name="label" />
        <Text>{$props.label} — {$props.subtitle}</Text>
      </Component>
    `);
    const diags = validateUdcPropReferences(def, false);
    expect(diags).toHaveLength(1);
    expect(diags[0].code).toBe("udc-prop-undeclared");
    expect(diags[0].udc).toBe("LeakyUdc");
    expect(diags[0].severity).toBe("info");
    expect((diags[0].data as any).propName).toBe("subtitle");
  });

  it("escalates severity to error in strict mode", () => {
    const def = parseCompound(`
      <Component name="StrictUdc">
        <Prop name="x" />
        <Text>{$props.y}</Text>
      </Component>
    `);
    const diags = validateUdcPropReferences(def, /* strict */ true);
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe("error");
  });

  it("validates each UDC at most once (cached by definition identity)", () => {
    const def = parseCompound(`
      <Component name="OnceOnly">
        <Prop name="a" />
        <Text>{$props.b}</Text>
      </Component>
    `);
    const first = validateUdcPropReferences(def, false);
    const second = validateUdcPropReferences(def, false);
    expect(first).toHaveLength(1);
    expect(second).toEqual([]);
  });
});
