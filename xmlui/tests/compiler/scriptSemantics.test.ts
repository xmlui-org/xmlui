import { describe, expect, it } from "vitest";

import { parseScriptEventHandler, parseScriptExpression } from "../../src/parser";
import { parseXmlui } from "../../src/compiler/parseXmlui";
import {
  bindScriptExpression,
  compileXmluiEventHandler,
  compileXmluiExpression,
  createChildXmluiScope,
  createXmluiScope,
  lowerScriptEventHandler,
  lowerScriptExpression,
  resolveXmluiIdentifier,
} from "../../src/compiler/scriptSemantics";
import type { XmluiElement } from "../../src/compiler/ir";

describe("XMLUI script scope model", () => {
  it("builds local, global, and props scope entries from parsed XMLUI elements", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button var.label="Click">{count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const appScope = createXmluiScope(document.root, { sourceId: "Main.xmlui" });
    const button = document.root.children[0] as XmluiElement;
    const buttonScope = createChildXmluiScope(appScope, button);

    expect(resolveXmluiIdentifier(appScope, "count")).toMatchObject({
      kind: "global",
      name: "count",
      mutable: true,
      span: { sourceId: "Main.xmlui" },
    });
    expect(resolveXmluiIdentifier(buttonScope, "label")).toMatchObject({
      kind: "local",
      name: "label",
      mutable: true,
      span: { sourceId: "Main.xmlui" },
    });
    expect(resolveXmluiIdentifier(buttonScope, "$props")).toMatchObject({
      kind: "special",
      name: "$props",
      mutable: false,
    });
  });

  it("resolves local variables before globals for shadowed names", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button var.count="{0}">{count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const appScope = createXmluiScope(document.root, { sourceId: "Main.xmlui" });
    const button = document.root.children[0] as XmluiElement;
    const buttonScope = createChildXmluiScope(appScope, button);

    expect(resolveXmluiIdentifier(appScope, "count")?.kind).toBe("global");
    expect(resolveXmluiIdentifier(buttonScope, "count")).toMatchObject({
      kind: "local",
      name: "count",
    });
  });

  it("inherits parent local variables for descendant expressions", () => {
    const document = parseXmlui(`<App var.count="{0}"><Button>{count}</Button></App>`);
    const appScope = createXmluiScope(document.root);
    const button = document.root.children[0] as XmluiElement;
    const buttonScope = createChildXmluiScope(appScope, button);

    expect(resolveXmluiIdentifier(buttonScope, "count")).toMatchObject({
      kind: "local",
      name: "count",
    });
  });
});

describe("XMLUI script event write analysis", () => {
  it("accepts postfix increments against local state", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptEventHandler("count++").node, scope);

    expect(bound.diagnostics).toEqual([]);
    expect(bound.writes).toEqual([
      expect.objectContaining({
        kind: "local",
        name: "count",
        path: ["count"],
        operator: "++",
        binding: expect.objectContaining({ kind: "local", name: "count" }),
      }),
    ]);
    expect(bound.dependencies).toEqual([
      expect.objectContaining({
        kind: "local",
        name: "count",
        path: ["count"],
      }),
    ]);
  });

  it("accepts postfix increments against global state", () => {
    const document = parseXmlui(`<App global.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptEventHandler("count++").node, scope);

    expect(bound.diagnostics).toEqual([]);
    expect(bound.writes).toEqual([
      expect.objectContaining({
        kind: "global",
        name: "count",
        path: ["count"],
        operator: "++",
      }),
    ]);
  });

  it("rejects writes to $props member targets", () => {
    const document = parseXmlui(`<Component name="IncrementButton" />`);
    if (document.kind !== "component") {
      throw new Error("Expected component document.");
    }
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptEventHandler("$props.label++").node, scope);

    expect(bound.writes).toEqual([
      expect.objectContaining({
        kind: "invalid",
        name: "label",
        path: ["label"],
        operator: "++",
      }),
    ]);
    expect(bound.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS202",
          message: "Cannot write to read-only XMLUI script target '$props.label'.",
        }),
      ]),
    );
  });

  it("rejects unresolved write targets", () => {
    const document = parseXmlui(`<App />`);
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptEventHandler("missing++").node, scope);

    expect(bound.writes).toEqual([
      expect.objectContaining({
        kind: "unresolved",
        name: "missing",
        path: ["missing"],
      }),
    ]);
    expect(bound.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS201",
          message: "Unresolved XMLUI script identifier 'missing'.",
        }),
      ]),
    );
  });

  it("rejects non-assignable postfix update targets", () => {
    const document = parseXmlui(`<App var.count="{0}" var.other="{1}" />`);
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptEventHandler("(count || other)++").node, scope);

    expect(bound.writes).toEqual([
      expect.objectContaining({
        kind: "invalid",
        name: "",
        path: [],
      }),
    ]);
    expect(bound.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS203",
          message: "Invalid XMLUI script write target.",
        }),
      ]),
    );
  });
});

describe("XMLUI expression and event semantic IR", () => {
  it("lowers the local counter event handler into postfix update IR", () => {
    const document = parseXmlui(`<App var.count="{0}"><Button onClick="count++" /></App>`);
    const appScope = createXmluiScope(document.root);
    const button = document.root.children[0] as XmluiElement;
    const buttonScope = createChildXmluiScope(appScope, button);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, buttonScope);

    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.ir).toMatchObject({
      kind: "EventHandler",
      body: [
        {
          kind: "ExpressionStatement",
          expression: {
            kind: "PostfixUpdate",
            operator: "++",
            target: {
              kind: "local",
              name: "count",
              path: ["count"],
            },
          },
        },
      ],
    });
  });

  it("lowers component label fallback text into logical expression IR", () => {
    const document = parseXmlui(`<Component name="IncrementButton" var.count="{0}" />`);
    if (document.kind !== "component") {
      throw new Error("Expected component document.");
    }
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptExpression(
      parseScriptExpression("$props.label || 'Click to increment'").node,
      scope,
    );

    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.ir).toMatchObject({
      kind: "LogicalExpression",
      operator: "||",
      left: {
        kind: "ScopedMemberRead",
        scope: "$props",
        member: "label",
        dependency: expect.objectContaining({
          kind: "props",
          name: "label",
        }),
      },
      right: {
        kind: "LiteralExpression",
        value: "Click to increment",
      },
    });
  });

  it("lowers global counter event handlers through inherited global scope", () => {
    const document = parseXmlui(`<App global.count="{0}"><IncrementButton /></App>`);
    const appScope = createXmluiScope(document.root);
    const component = document.root.children[0] as XmluiElement;
    const componentScope = createChildXmluiScope(appScope, component);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, componentScope);

    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.ir.body[0].expression).toMatchObject({
      kind: "PostfixUpdate",
      target: {
        kind: "global",
        name: "count",
        path: ["count"],
      },
    });
  });

  it("lowers broader expressions with dependencies and callback-local parameters", () => {
    const document = parseXmlui(`<App var.count="{2}" var.user="{0}" var.items="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptExpression(
      parseScriptExpression(
        "items.map(item => item.label).join(', ') || (count > 1 ? user.name : 'one')",
      ).node,
      scope,
    );

    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "local", name: "items", path: ["items", "map"] }),
        expect.objectContaining({ kind: "local", name: "count", path: ["count"] }),
        expect.objectContaining({ kind: "local", name: "user", path: ["user", "name"] }),
      ]),
    );
    expect(lowered.dependencies).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "item" })]),
    );
    expect(lowered.ir.kind).toBe("LogicalExpression");
  });
});

describe("XMLUI expression JavaScript compilation", () => {
  it("compiles literal expressions into executable functions", () => {
    const document = parseXmlui(`<App />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptExpression(parseScriptExpression("0").node, scope);
    const compiled = compileXmluiExpression(lowered.ir, lowered.dependencies);

    expect(compiled.source).toBe("return 0;");
    expect(compiled.execute(testContext())).toBe(0);
  });

  it("compiles local and global reads through explicit context access", () => {
    const document = parseXmlui(`<App var.localCount="{1}" global.globalCount="{2}" />`);
    const scope = createXmluiScope(document.root);
    const local = lowerScriptExpression(parseScriptExpression("localCount").node, scope);
    const global = lowerScriptExpression(parseScriptExpression("globalCount").node, scope);
    const context = testContext({
      locals: { localCount: 11 },
      globals: { globalCount: 22 },
    });

    expect(compileXmluiExpression(local.ir, local.dependencies).source).toBe(
      `return ctx.readLocal("localCount");`,
    );
    expect(compileXmluiExpression(local.ir, local.dependencies).execute(context)).toBe(11);
    expect(compileXmluiExpression(global.ir, global.dependencies).source).toBe(
      `return ctx.readGlobal("globalCount");`,
    );
    expect(compileXmluiExpression(global.ir, global.dependencies).execute(context)).toBe(22);
  });

  it("compiles $props fallback expressions with XMLUI optional member reads", () => {
    const document = parseXmlui(`<Component name="IncrementButton" />`);
    if (document.kind !== "component") {
      throw new Error("Expected component document.");
    }
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptExpression(
      parseScriptExpression("$props.label || 'Click to increment'").node,
      scope,
    );
    const compiled = compileXmluiExpression(lowered.ir, lowered.dependencies);

    expect(compiled.source).toBe(`return (ctx.props?.["label"] || "Click to increment");`);
    expect(compiled.execute(testContext({ props: { label: "Counter #2" } }))).toBe("Counter #2");
    expect(compiled.execute(testContext())).toBe("Click to increment");
  });

  it("compiles broader expression syntax into executable functions", () => {
    const document = parseXmlui(
      `<App var.count="{0}" var.user="{0}" var.items="{0}" var.index="{0}" />`,
    );
    const scope = createXmluiScope(document.root);
    const context = testContext({
      locals: {
        count: 2,
        user: { name: "Ada", profile: null },
        items: [{ label: "One" }, { label: "Two" }],
        index: 1,
      },
    });

    const arithmetic = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("count + 1 * 2").node, scope).ir,
    );
    const optional = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("user.profile.title ?? user.name").node, scope).ir,
    );
    const ternary = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("count > 1 ? 'many' : 'one'").node, scope).ir,
    );
    const indexed = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("items[index].label").node, scope).ir,
    );
    const mapped = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("items.map(item => item.label).join(', ')").node, scope).ir,
    );
    const object = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("{ name: user.name, labels: items.map(item => item.label) }").node, scope).ir,
    );

    expect(arithmetic.source).toBe(`return (ctx.readLocal("count") + (1 * 2));`);
    expect(arithmetic.execute(context)).toBe(4);
    expect(optional.execute(context)).toBe("Ada");
    expect(ternary.execute(context)).toBe("many");
    expect(indexed.execute(context)).toBe("Two");
    expect(mapped.execute(context)).toBe("One, Two");
    expect(object.execute(context)).toEqual({ name: "Ada", labels: ["One", "Two"] });
  });

  it("rejects unsupported expression calls during semantic analysis", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptExpression(parseScriptExpression("save(count)").node, scope);

    expect(lowered.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS204",
          message: "Unsupported XMLUI expression call target.",
        }),
      ]),
    );
  });

  it("rejects unresolved expression reads during compilation", () => {
    const document = parseXmlui(`<App />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptExpression(parseScriptExpression("missing").node, scope);

    expect(() => compileXmluiExpression(lowered.ir, lowered.dependencies)).toThrow(
      "Cannot compile unresolved XMLUI identifier 'missing'.",
    );
  });
});

describe("XMLUI event-handler JavaScript compilation", () => {
  it("compiles local counter increments into explicit writes", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 0 } });

    expect(compiled.source).toBe(`ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`);
    expect(compiled.invalidates).toEqual([{ kind: "local", name: "count" }]);
    compiled.execute(context);
    expect(context.locals.count).toBe(1);
  });

  it("compiles global counter increments into explicit writes", () => {
    const document = parseXmlui(`<App global.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ globals: { count: 5 } });

    expect(compiled.source).toBe(`ctx.writeGlobal("count", Number(ctx.readGlobal("count")) + 1);`);
    expect(compiled.invalidates).toEqual([{ kind: "global", name: "count" }]);
    compiled.execute(context);
    expect(context.globals.count).toBe(6);
  });

  it("honors local shadowing when compiling event writes", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button var.count="{0}" onClick="count++" /></App>`,
    );
    const appScope = createXmluiScope(document.root);
    const buttonScope = createChildXmluiScope(appScope, document.root.children[0] as XmluiElement);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, buttonScope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 10 }, globals: { count: 100 } });

    compiled.execute(context);
    expect(context.locals.count).toBe(11);
    expect(context.globals.count).toBe(100);
  });

  it("rejects invalid event write targets during compilation", () => {
    const document = parseXmlui(`<Component name="IncrementButton" />`);
    if (document.kind !== "component") {
      throw new Error("Expected component document.");
    }
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("$props.label++").node, scope);

    expect(() => compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes)).toThrow(
      "Cannot compile invalid XMLUI event write target 'label'.",
    );
  });
});

describe("XMLUI script semantic binding", () => {
  it("binds identifier reads to local state dependencies", () => {
    const document = parseXmlui(`<App var.count="{0}">{count}</App>`);
    const scope = createXmluiScope(document.root);
    const expression = parseScriptExpression("count").node;
    const bound = bindScriptExpression(expression, scope);

    expect(bound.diagnostics).toEqual([]);
    expect(bound.dependencies).toEqual([
      expect.objectContaining({
        kind: "local",
        name: "count",
        path: ["count"],
        binding: expect.objectContaining({ kind: "local", name: "count" }),
      }),
    ]);
  });

  it("binds identifier reads to global state when no local shadows it", () => {
    const document = parseXmlui(`<App global.count="{0}">{count}</App>`);
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptExpression("count").node, scope);

    expect(bound.diagnostics).toEqual([]);
    expect(bound.dependencies).toEqual([
      expect.objectContaining({
        kind: "global",
        name: "count",
        path: ["count"],
      }),
    ]);
  });

  it("binds $props member reads as props dependencies", () => {
    const document = parseXmlui(`<Component name="IncrementButton" />`);
    if (document.kind !== "component") {
      throw new Error("Expected component document.");
    }
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(parseScriptExpression("$props.label").node, scope);

    expect(bound.diagnostics).toEqual([]);
    expect(bound.dependencies).toEqual([
      expect.objectContaining({
        kind: "props",
        name: "label",
        path: ["label"],
      }),
    ]);
  });

  it("binds logical expressions without duplicating the $props root", () => {
    const document = parseXmlui(`<Component name="IncrementButton" var.count="{0}" />`);
    if (document.kind !== "component") {
      throw new Error("Expected component document.");
    }
    const scope = createXmluiScope(document.root);
    const bound = bindScriptExpression(
      parseScriptExpression("$props.label || count").node,
      scope,
    );

    expect(bound.diagnostics).toEqual([]);
    expect(bound.dependencies).toEqual([
      expect.objectContaining({ kind: "props", name: "label", path: ["label"] }),
      expect.objectContaining({ kind: "local", name: "count", path: ["count"] }),
    ]);
  });

  it("returns diagnostics and partial dependency metadata for unresolved reads", () => {
    const document = parseXmlui(`<App />`);
    const scope = createXmluiScope(document.root, { sourceId: "Main.xmlui" });
    const bound = bindScriptExpression(
      parseScriptExpression("missing", {
        originSpan: { sourceId: "Main.xmlui", start: 10, end: 17 },
      }).node,
      scope,
    );

    expect(bound.dependencies).toEqual([
      expect.objectContaining({
        kind: "unresolved",
        name: "missing",
        path: ["missing"],
        span: { sourceId: "Main.xmlui", start: 10, end: 17 },
      }),
    ]);
    expect(bound.diagnostics).toEqual([
      expect.objectContaining({
        code: "XS201",
        message: "Unresolved XMLUI script identifier 'missing'.",
        span: { sourceId: "Main.xmlui", start: 10, end: 17 },
      }),
    ]);
  });
});

function testContext({
  locals = {},
  globals = {},
  props = {},
}: {
  locals?: Record<string, unknown>;
  globals?: Record<string, unknown>;
  props?: Record<string, unknown>;
} = {}) {
  return {
    locals,
    globals,
    props,
    readLocal: (name: string) => locals[name],
    readGlobal: (name: string) => globals[name],
    writeLocal: (name: string, value: unknown) => {
      locals[name] = value;
    },
    writeGlobal: (name: string, value: unknown) => {
      globals[name] = value;
    },
  };
}
