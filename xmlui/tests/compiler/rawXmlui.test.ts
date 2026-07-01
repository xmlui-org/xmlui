import { describe, expect, it } from "vitest";

import { parseRawXmlui } from "../../src/compiler/rawXmlui";

describe("parseRawXmlui", () => {
  it("preserves raw structure for the local counter example", () => {
    const document = parseRawXmlui(
      `<App var.count="{0}"><H1>Counter example</H1><Button onClick="count++">Click: {count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );

    expect(document).toMatchObject({
      kind: "app",
      sourceId: "Main.xmlui",
      root: {
        kind: "element",
        type: "App",
        attributes: [{ name: "var.count", value: "{0}" }],
        children: [
          { kind: "element", type: "H1", children: [{ kind: "text", value: "Counter example" }] },
          {
            kind: "element",
            type: "Button",
            attributes: [{ name: "onClick", value: "count++" }],
            children: [{ kind: "text", value: "Click: {count}" }],
          },
        ],
      },
    });
  });

  it("preserves component definitions and props before semantic analysis", () => {
    const document = parseRawXmlui(
      `<Component name="IncrementButton" var.count="{0}"><Button>{$props.label || 'Click'}: {count}</Button></Component>`,
    );

    expect(document).toMatchObject({
      kind: "component",
      name: "IncrementButton",
      root: {
        type: "Component",
        attributes: [
          { name: "name", value: "IncrementButton" },
          { name: "var.count", value: "{0}" },
        ],
        children: [
          {
            type: "Button",
            children: [
              {
                kind: "text",
                value: "{$props.label || 'Click'}: {count}",
              },
            ],
          },
        ],
      },
    });
  });

  it("preserves global and local shadowing structure", () => {
    const document = parseRawXmlui(
      `<App global.count="{0}"><Button var.count="{0}" onClick="count++">Local: {count}</Button></App>`,
    );

    expect(document.root.attributes).toEqual([
      expect.objectContaining({ name: "global.count", value: "{0}" }),
    ]);
    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "Button",
      attributes: [
        expect.objectContaining({ name: "var.count", value: "{0}" }),
        expect.objectContaining({ name: "onClick", value: "count++" }),
      ],
    });
  });

  it("accepts component roots as app documents", () => {
    const document = parseRawXmlui(`<VStack><Button /></VStack>`, { sourceId: "Main.xmlui" });

    expect(document).toMatchObject({
      kind: "app",
      sourceId: "Main.xmlui",
      root: {
        kind: "element",
        type: "VStack",
        children: [{ kind: "element", type: "Button" }],
      },
    });
  });

  it("preserves name-only attributes as true-valued raw attributes", () => {
    const document = parseRawXmlui(
      `<App><ColorPicker initialValue="#ffff00" label="Cannot be edited" readOnly /></App>`,
    );

    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "ColorPicker",
      attributes: [
        { name: "initialValue", value: "#ffff00" },
        { name: "label", value: "Cannot be edited" },
        { name: "readOnly", value: "true" },
      ],
    });
  });
});
