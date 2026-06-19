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
    expect(document.root.parsed?.vars?.count).toMatchObject({
      source: "0",
      ast: { kind: "Literal", value: 0 },
      ir: { kind: "LiteralExpression", value: 0 },
      compiledSource: "return 0;",
    });
    expect(document.root.children[1]).toMatchObject({
      parsed: {
        events: {
          click: {
            source: "count++",
            ast: { kind: "Program" },
            ir: {
              kind: "EventHandler",
              body: [
                {
                  expression: {
                    kind: "PostfixUpdate",
                    target: {
                      kind: "local",
                      name: "count",
                    },
                  },
                },
              ],
            },
            compiledSource: `ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`,
            invalidates: [{ kind: "local", name: "count" }],
          },
        },
      },
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
    expect(document.root.children[0]).toMatchObject({
      children: [
        {
          kind: "text",
          value: "{$props.label || 'Click to increment'}: {count}",
          segments: [
            expect.objectContaining({
              kind: "expression",
              source: "$props.label || 'Click to increment'",
              ast: expect.objectContaining({ kind: "BinaryExpression" }),
              ir: expect.objectContaining({ kind: "LogicalExpression" }),
              compiledSource: `return (ctx.props?.["label"] || "Click to increment");`,
            }),
            expect.objectContaining({
              kind: "literal",
              value: ": ",
            }),
            expect.objectContaining({
              kind: "expression",
              source: "count",
              ast: expect.objectContaining({ kind: "Identifier", name: "count" }),
              ir: expect.objectContaining({
                kind: "IdentifierRead",
                dependency: expect.objectContaining({ kind: "local", name: "count" }),
              }),
            }),
          ],
        },
      ],
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
    expect(document.root.children[0]).toMatchObject({
      children: [
        {
          kind: "text",
          value: "Local count: {count}",
          segments: [
            { kind: "literal", value: "Local count: " },
            expect.objectContaining({
              kind: "expression",
              source: "count",
              ast: expect.objectContaining({ kind: "Identifier", name: "count" }),
              ir: expect.objectContaining({
                kind: "IdentifierRead",
                dependency: expect.objectContaining({ kind: "local", name: "count" }),
              }),
            }),
          ],
        },
      ],
    });
  });

  it("surfaces unresolved expression diagnostics with XMLUI source ranges", () => {
    expect(() => parseXmlui(`<App><Button>{missing}</Button></App>`, { sourceId: "Main.xmlui" }))
      .toThrow("Unresolved XMLUI script identifier 'missing'.");
  });

  it("classifies source and derived variable initializers", () => {
    const document = parseXmlui(
      `<App var.count="{1}" var.double="{count * 2}" global.seed="{2}" global.total="{seed + 1}" />`,
      { sourceId: "Main.xmlui" },
    );

    expect(document.root.parsed?.vars?.count).toMatchObject({ bindingMode: "source" });
    expect(document.root.parsed?.vars?.double).toMatchObject({ bindingMode: "derived" });
    expect(document.root.parsed?.globals?.seed).toMatchObject({ bindingMode: "source" });
    expect(document.root.parsed?.globals?.total).toMatchObject({ bindingMode: "derived" });
  });

  it("diagnoses local and global derived variable cycles", () => {
    expect(() =>
      parseXmlui(`<App var.a="{b + 1}" var.b="{a + 1}" />`, { sourceId: "Main.xmlui" }),
    ).toThrow("Reactive XMLUI local variable cycle detected: a -> b -> a.");

    expect(() =>
      parseXmlui(`<App global.a="{b + 1}" global.b="{a + 1}" />`, { sourceId: "Main.xmlui" }),
    ).toThrow("Reactive XMLUI global variable cycle detected: a -> b -> a.");
  });

  it("surfaces invalid event target diagnostics", () => {
    expect(() =>
      parseXmlui(`<Component name="Broken"><Button onClick="$props.label++" /></Component>`),
    ).toThrow("Cannot write to read-only XMLUI script target '$props.label'.");
  });

  it("surfaces malformed mixed text expression diagnostics", () => {
    expect(() => parseXmlui(`<App><Button>{count ||}</Button></App>`)).toThrow(
      "Expected expression.",
    );
  });
});
