import { describe, expect, it } from "vitest";

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

  it("preserves old root validation errors", () => {
    expect(() => parseXmlui(`<Button />`)).toThrow(
      "Expected <App> or <Component> as the document root, got <Button>.",
    );
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
