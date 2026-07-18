import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../../src/compiler/parseXmlui";
import { parseRawXmlui } from "../../../src/compiler/rawXmlui";

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

  it("accepts any non-Component root as an app document", () => {
    const document = parseXmlui(`<Button />`);

    expect(document.kind).toBe("app");
    expect(document.root.type).toBe("Button");
    expect(parseRawXmlui(`<VStack />`)).toMatchObject({
      kind: "app",
      root: { type: "VStack" },
    });
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

  it("treats global helper tags as root global declarations", () => {
    const document = parseXmlui(
      `<App><global name="stations" value="{[ 'Bakerloo', 'Central', 'Circle' ]}" /><Text>{stations.join(', ')}</Text></App>`,
    );

    expect(document.root.globals).toEqual({
      stations: "{[ 'Bakerloo', 'Central', 'Circle' ]}",
    });
    expect(document.root.parsed?.globals?.stations).toMatchObject({
      source: "[ 'Bakerloo', 'Central', 'Circle' ]",
      ast: expect.objectContaining({ kind: "ArrayExpression" }),
    });
    expect(document.root.children).toHaveLength(1);
    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "Text",
    });
  });
});
