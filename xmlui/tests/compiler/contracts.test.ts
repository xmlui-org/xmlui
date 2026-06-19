import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { compileXmluiModule } from "../../src/compiler/compileXmluiModule";
import {
  contractRegistryToLspMetadata,
  createContractRegistry,
  normalizeEventName,
  validateManagedReactContracts,
} from "../../src/compiler/contracts";
import { buildCompilerIrFromDocument } from "../../src/compiler/ir/index";
import { parseXmlui } from "../../src/compiler/parseXmlui";

describe("Managed React contract registry", () => {
  it("exposes built-in contracts and normalizes event names", () => {
    const registry = createContractRegistry();

    expect(registry.get("App")).toMatchObject({
      name: "App",
      declarations: { local: true, global: true },
    });
    expect(registry.get("Button")?.props).toHaveProperty("label");
    expect(registry.get("Button")?.events).toHaveProperty("click");
    expect(normalizeEventName("onClick")).toBe("click");
    expect(normalizeEventName("click")).toBe("click");
  });

  it("registers user-defined components and exposes LSP-shaped metadata", () => {
    const registry = createContractRegistry({ userComponents: ["IncrementButton"] });
    const metadata = contractRegistryToLspMetadata(registry);

    expect(registry.get("IncrementButton")).toMatchObject({
      kind: "user",
      acceptsArbitraryProps: true,
    });
    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "Button",
        props: ["enabled", "label"],
        events: ["click"],
        templates: [],
        contextVariables: [],
        apis: [],
      }),
    );
    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "Items",
        props: ["data", "items", "reverse"],
        templates: ["itemTemplate"],
        contextVariables: ["$isFirst", "$isLast", "$item", "$itemIndex"],
      }),
    );
    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "TextBox",
        props: ["enabled", "initialValue", "label", "placeholder", "readOnly"],
        events: ["didChange", "gotFocus", "lostFocus"],
      }),
    );
    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "Checkbox",
        props: ["enabled", "indeterminate", "initialValue", "label", "readOnly"],
        events: ["click", "didChange", "gotFocus", "lostFocus"],
      }),
    );
    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "Option",
        props: ["enabled", "keywords", "label", "value"],
      }),
    );
    expect(metadata.components).toContainEqual(
      expect.objectContaining({
        name: "IncrementButton",
        kind: "user",
        acceptsArbitraryProps: true,
      }),
    );
  });
});

describe("Managed React contract validation", () => {
  it("accepts the three initial examples", () => {
    expect(validateSource(`<App var.count="{0}"><H1>Title</H1><Button onClick="count++">Count</Button></App>`)).toEqual([]);
    expect(
      validateSource(`<App><IncrementButton label="Counter" /></App>`, ["IncrementButton"]),
    ).toEqual([]);
    expect(validateSource(`<Component name="IncrementButton" var.count="{0}"><Button onClick="count++" /></Component>`)).toEqual([]);
  });

  it("reports unknown components, props, and events with contract codes", () => {
    expect(validateSource(`<App><Missing /></App>`)[0]).toMatchObject({
      code: "XC001",
      message: "Unknown XMLUI component <Missing>.",
    });
    expect(validateSource(`<App><Button foo="x" /></App>`)[0]).toMatchObject({
      code: "XC002",
      message: "<Button> has unknown prop 'foo'.",
    });
    expect(validateSource(`<App><H1 onClick="0">Title</H1></App>`)[0]).toMatchObject({
      code: "XC003",
      message: "<H1> has unknown event 'click'.",
    });
  });

  it("reports invalid component names and declaration placement", () => {
    expect(validateSource(`<Component name="incrementButton" />`)[0]).toMatchObject({
      code: "XC007",
    });
    expect(validateSource(`<Component name="IncrementButton" global.count="{0}" />`)[0]).toMatchObject({
      code: "XC004",
      message: "<IncrementButton> does not allow global variable declarations here.",
    });
    expect(validateSource(`<App><H1 var.count="{0}">Title</H1></App>`)[0]).toMatchObject({
      code: "XC004",
      message: "<H1> does not allow local variable declarations.",
    });
  });

  it("reports duplicate declarations through contract validation", () => {
    const ir = buildCompilerIrFromDocument(parseXmlui(`<App var.count="{0}" />`));
    const duplicate = { ...ir.definition.scope.declarations[0] };
    ir.definition.scope.declarations.push(duplicate);
    ir.definition.scopes[0].declarations.push(duplicate);

    expect(validateManagedReactContracts(ir, createContractRegistry())[0]).toMatchObject({
      code: "XC005",
      message: "Duplicate XMLUI local declaration 'count'.",
    });
  });
});

describe("Managed React contracts in compileXmluiModule", () => {
  it("surfaces contract diagnostics during compilation", () => {
    expect(() =>
      compileXmluiModule({
        id: "/tmp/Main.xmlui",
        source: `<App><Button foo="x" /></App>`,
      }),
    ).toThrow("<Button> has unknown prop 'foo'.");
  });

  it("uses sibling component names as user-defined contracts", () => {
    const dir = path.join(tmpdir(), `xmlui-rs-contracts-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "IncrementButton.xmlui"), `<Component name="IncrementButton" />`);

    expect(() =>
      compileXmluiModule({
        id: path.join(dir, "Main.xmlui"),
        source: `<App><IncrementButton label="Counter" /></App>`,
      }),
    ).not.toThrow();
  });
});

function validateSource(source: string, userComponents: string[] = []) {
  const document = parseXmlui(source, { sourceId: "test.xmlui" });
  const registeredUserComponents = new Set(userComponents);
  if (document.kind === "component") {
    registeredUserComponents.add(document.name);
  }
  const ir = buildCompilerIrFromDocument(document, {
    sourceId: "test.xmlui",
    validation: { knownComponents: registeredUserComponents },
  });
  return validateManagedReactContracts(
    ir,
    createContractRegistry({ userComponents: registeredUserComponents }),
  );
}
