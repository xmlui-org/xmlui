import { describe, expect, it } from "vitest";

import { buildCompilerIrFromDocument } from "../../../src/compiler/ir/index";
import { parseXmlui } from "../../../src/compiler/parseXmlui";

describe("parser compatibility hardening", () => {
  it("ignores comments and decodes XML entities in attributes", () => {
    const document = parseXmlui(
      `<App><!-- note --><Button label="Tom &amp; Jerry">Hello</Button></App>`,
    );

    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "Button",
      props: { label: "Tom & Jerry" },
    });
  });

  it("accepts component roots as app documents", () => {
    const document = parseXmlui(`<VStack><Button /></VStack>`);
    const compilerIr = buildCompilerIrFromDocument(document);

    expect(document).toMatchObject({
      kind: "app",
      root: {
        kind: "element",
        type: "VStack",
        children: [{ kind: "element", type: "Button" }],
      },
    });
    expect(compilerIr).toMatchObject({
      kind: "app",
      definition: {
        root: {
          kind: "builtin",
          type: "VStack",
        },
      },
      diagnostics: [],
    });
  });

  it("treats name-only attributes as true-valued props", () => {
    const document = parseXmlui(
      `<App><ColorPicker initialValue="#ffff00" label="Cannot be edited" readOnly /></App>`,
    );

    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "ColorPicker",
      props: {
        initialValue: "#ffff00",
        label: "Cannot be edited",
        readOnly: "true",
      },
    });
  });

  it("preserves old component root validation errors", () => {
    expect(() => parseXmlui(`<Component />`)).toThrow("<Component> requires a name attribute.");
  });

  it("preserves single-root and mismatched-tag failures", () => {
    expect(() => parseXmlui(`<App /><App />`)).toThrow(
      "XMLUI documents must have a single root element.",
    );
    expect(() => parseXmlui(`<App><Button></App>`)).toThrow(
      "Opening and closing tag names should match. Expected '</Button>', got '</App>'.",
    );
  });

  it("keeps runtime-facing strings stable while adding parsed metadata", () => {
    const document = parseXmlui(
      `<App var.count="{0}"><Button onClick="count++">Count: {count}</Button></App>`,
    );

    expect(document.root.vars).toEqual({ count: "{0}" });
    expect(document.root.children[0]).toMatchObject({
      events: { click: "count++" },
      children: [{ value: "Count: {count}" }],
    });
    expect(document.root.parsed?.vars?.count).toMatchObject({
      source: "0",
      ast: expect.objectContaining({ kind: "Literal", value: 0 }),
    });
  });
});
