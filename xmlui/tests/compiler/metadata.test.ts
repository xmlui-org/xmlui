import { describe, expect, it } from "vitest";

import {
  collectUnifiedDiagnostics,
  generateXmluiMetadata,
  getXmluiCompletions,
  getXmluiHoverInfo,
  metadataToJson,
  validateXmluiMetadataArtifact,
} from "../../src/metadata";

describe("XMLUI unified metadata", () => {
  it("generates deterministic component metadata from contracts", () => {
    const metadata = generateXmluiMetadata();
    const button = metadata.components.find((component) => component.name === "Button");
    const dataSource = metadata.components.find((component) => component.name === "DataSource");
    const page = metadata.components.find((component) => component.name === "Page");

    expect(metadata.schemaVersion).toBe(1);
    expect(metadata.generatedAt).toBe("1970-01-01T00:00:00.000Z");
    expect(validateXmluiMetadataArtifact(metadata)).toEqual([]);
    expect(button?.props.map((prop) => prop.name)).toEqual(expect.arrayContaining(["label", "enabled"]));
    expect(button?.events).toContainEqual(expect.objectContaining({
      name: "click",
      attributeName: "onClick",
      async: true,
    }));
    expect(dataSource?.apis.map((api) => api.name)).toEqual(expect.arrayContaining(["value", "refetch"]));
    expect(page?.contextVariables.map((item) => item.name)).toEqual(expect.arrayContaining(["$routeParams"]));
    expect(metadata.examples.every((example) => example.demonstratesMutation)).toBe(true);
    expect(JSON.parse(metadataToJson(metadata)).source.contractHash).toBe(metadata.source.contractHash);
  });

  it("extracts user component prop reads from $props", () => {
    const metadata = generateXmluiMetadata({
      userComponents: [{
        id: "IncrementButton.xmlui",
        source: `
          <Component name="IncrementButton" var.count="{0}">
            <Button onClick="count++">{$props.label}: {count}</Button>
          </Component>
        `,
      }],
    });

    const component = metadata.components.find((component) => component.name === "IncrementButton");
    expect(component).toMatchObject({
      kind: "user",
      acceptsArbitraryProps: true,
    });
    expect(component?.props).toContainEqual(expect.objectContaining({ name: "label" }));
  });

  it("provides metadata-driven completions and hover", () => {
    const componentCompletions = getXmluiCompletions("<", 1);
    expect(componentCompletions).toContainEqual(expect.objectContaining({
      label: "Button",
      kind: "component",
    }));

    const propCompletions = getXmluiCompletions("<Button ", "<Button ".length);
    expect(propCompletions).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "label", kind: "prop" }),
      expect.objectContaining({ label: "onClick", kind: "event" }),
    ]));

    const hover = getXmluiHoverInfo("<Button label=\"Save\" />", 3);
    expect(hover).toEqual({
      title: "<Button>",
      body: "Interactive button that can run XMLUI event handlers.",
    });
  });

  it("collects unified diagnostics with categories and ranges", () => {
    const diagnostics = collectUnifiedDiagnostics("<App><Button unknown=\"x\" /></App>");

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "XC002",
        category: "contract",
        message: "<Button> has unknown prop 'unknown'.",
        line: 0,
      }),
    ]);
  });
});

