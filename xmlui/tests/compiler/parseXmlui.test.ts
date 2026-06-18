import { describe, expect, it } from "vitest";

import { parseXmlui } from "../../src/compiler/parseXmlui";

describe("parseXmlui", () => {
  it("parses local variables and events from the counter example", () => {
    const document = parseXmlui(`
      <App var.count="{0}">
        <H1>Counter example</H1>
        <Button onClick="count++">Click to increment: {count}</Button>
      </App>
    `);

    expect(document.kind).toBe("app");
    expect(document.root.vars).toEqual({ count: "{0}" });
    expect(document.root.children[1]).toMatchObject({
      kind: "element",
      type: "Button",
      events: { click: "count++" },
    });
  });

  it("parses component definitions and props", () => {
    const document = parseXmlui(`
      <Component name="IncrementButton" var.count="{0}">
        <Button onClick="count++">
          {$props.label || 'Click to increment'}: {count}
        </Button>
      </Component>
    `);

    if (document.kind !== "component") {
      throw new Error("Expected a component document.");
    }
    expect(document.name).toBe("IncrementButton");
    expect(document.root.vars).toEqual({ count: "{0}" });
    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "Button",
      events: { click: "count++" },
    });
  });

  it("parses global variables and local shadowing", () => {
    const document = parseXmlui(`
      <App global.count="{0}">
        <Button var.count="{0}" onClick="count++">Local count: {count}</Button>
      </App>
    `);

    expect(document.kind).toBe("app");
    expect(document.root.globals).toEqual({ count: "{0}" });
    expect(document.root.children[0]).toMatchObject({
      kind: "element",
      type: "Button",
      vars: { count: "{0}" },
      events: { click: "count++" },
    });
  });
});
