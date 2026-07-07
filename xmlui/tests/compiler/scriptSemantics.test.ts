import { describe, expect, it, vi } from "vitest";

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
  type CompiledEventContext,
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

  it("resolves AppContextObject properties as context identifiers", () => {
    const document = parseXmlui(`<App><Button onClick="toast('Button clicked')" /></App>`);
    const appScope = createXmluiScope(document.root);
    const button = document.root.children[0] as XmluiElement;
    const buttonScope = createChildXmluiScope(appScope, button);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler("toast('Button clicked')").node,
      buttonScope,
    );

    expect(resolveXmluiIdentifier(buttonScope, "toast")).toMatchObject({
      kind: "context",
      name: "toast",
      mutable: false,
    });
    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.ir).toMatchObject({
      kind: "EventHandler",
      body: [
        {
          kind: "ExpressionStatement",
          expression: {
            kind: "CallExpression",
            callee: {
              kind: "IdentifierRead",
              name: "toast",
              dependency: expect.objectContaining({ kind: "context", name: "toast" }),
            },
          },
        },
      ],
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

  it("tracks array push calls against mutable state as invalidating writes", () => {
    const document = parseXmlui(`
      <App var.newItems="{[]}">
        <AutoComplete onItemCreated="item => newItems.push(item)" />
      </App>
    `);
    const autoComplete = document.root.children[0] as XmluiElement;
    const event = autoComplete.parsed?.events?.itemCreated;

    expect(event?.writes).toEqual([
      expect.objectContaining({
        kind: "local",
        name: "newItems",
        path: ["newItems"],
        operator: "mutate",
      }),
    ]);
    expect(event?.invalidates).toEqual([{ kind: "local", name: "newItems" }]);
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
    const statement = lowered.ir.body[0];

    expect(lowered.diagnostics).toEqual([]);
    expect(statement.kind).toBe("ExpressionStatement");
    if (statement.kind !== "ExpressionStatement") {
      throw new Error("Expected expression statement.");
    }
    expect(statement.expression).toMatchObject({
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
      `return (ctx.readGlobal("globalCount") ?? ctx.readReference?.("globalCount"));`,
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
    const arraySpread = compileXmluiExpression(
      lowerScriptExpression(parseScriptExpression("[0, ...items.map(item => item.label), 'Done']").node, scope).ir,
    );

    expect(arithmetic.source).toBe(`return (ctx.readLocal("count") + (1 * 2));`);
    expect(arithmetic.execute(context)).toBe(4);
    expect(optional.execute(context)).toBe("Ada");
    expect(ternary.execute(context)).toBe("many");
    expect(indexed.execute(context)).toBe("Two");
    expect(mapped.execute(context)).toBe("One, Two");
    expect(object.execute(context)).toEqual({ name: "Ada", labels: ["One", "Two"] });
    expect(arraySpread.execute(context)).toEqual([0, "One", "Two", "Done"]);
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
  it("extracts event handler directive prologues into execution options", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler(`"async, queue"; "dedicatedYield"; count++`).node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);

    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.ir.options).toEqual({
      directives: ["async", "queue", "dedicatedYield"],
      executionMode: "async",
      schedulingPolicy: "queue",
    });
    expect(compiled.source).toContain(`ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`);
    expect(compiled.source).toContain("__xmluiYieldIfNeeded");
    expect(compiled.options).toEqual(lowered.ir.options);
  });

  it("diagnoses unknown and conflicting event handler directives", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler(`"sync; async"; "block, queue"; "dedicatedYield"; count++`).node,
      scope,
    );

    expect(lowered.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS206",
          message: "Conflicting XMLUI event handler directives 'sync' and 'async'.",
        }),
        expect.objectContaining({
          code: "XS206",
          message: "Conflicting XMLUI event handler directives 'block' and 'queue'.",
        }),
        expect.objectContaining({
          code: "XS206",
          message: "Conflicting XMLUI event handler directives 'sync' and 'dedicatedYield'.",
        }),
      ]),
    );
  });

  it("omits yield checkpoints for sync handlers", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler(`"sync"; count++`).node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 0 } });

    expect(lowered.diagnostics).toEqual([]);
    expect(lowered.ir.options.executionMode).toBe("sync");
    expect(compiled.source).toContain(`ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`);
    expect(compiled.source).not.toContain("__xmluiYieldIfNeeded");
    await compiled.execute(context);
    expect(context.locals.count).toBe(1);
  });

  it("diagnoses function calls in sync handlers", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler(`"sync"; delay(1); count++`).node, scope);

    expect(lowered.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS207",
          message: "Sync XMLUI event handlers cannot contain async-capable function calls.",
        }),
      ]),
    );
  });

  it("compiles local counter increments into explicit writes", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 0 } });

    expect(compiled.source).toContain(`ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`);
    expect(compiled.source).toContain("__xmluiYieldIfNeeded");
    expect(compiled.invalidates).toEqual([{ kind: "local", name: "count" }]);
    await compiled.execute(context);
    expect(context.locals.count).toBe(1);
  });

  it("compiles global counter increments into explicit writes", async () => {
    const document = parseXmlui(`<App global.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ globals: { count: 5 } });

    expect(compiled.source).toContain(`ctx.writeGlobal("count", Number(ctx.readGlobal("count")) + 1);`);
    expect(compiled.source).toContain("__xmluiYieldIfNeeded");
    expect(compiled.invalidates).toEqual([{ kind: "global", name: "count" }]);
    await compiled.execute(context);
    expect(context.globals.count).toBe(6);
  });

  it("honors local shadowing when compiling event writes", async () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button var.count="{0}" onClick="count++" /></App>`,
    );
    const appScope = createXmluiScope(document.root);
    const buttonScope = createChildXmluiScope(appScope, document.root.children[0] as XmluiElement);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("count++").node, buttonScope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 10 }, globals: { count: 100 } });

    await compiled.execute(context);
    expect(context.locals.count).toBe(11);
    expect(context.globals.count).toBe(100);
  });

  it("compiles navigate calls as special event calls", async () => {
    const document = parseXmlui(`<App />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler("navigate('/search', { q: 'xmlui', page: 2 })").node,
      scope,
    );
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const calls: unknown[][] = [];
    const context = testContext({
      navigate: (target, queryParams) => calls.push([target, queryParams]),
    });

    expect(lowered.diagnostics).toEqual([]);
    expect(compiled.source).toContain("ctx.navigate");
    await compiled.execute(context);
    expect(calls).toEqual([["/search", { q: "xmlui", page: 2 }]]);
  });

  it("compiles assignments and compound assignments into explicit writes", async () => {
    const document = parseXmlui(`<App var.count="{0}" var.total="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler("count = count + 1; total += count * 2").node,
      scope,
    );
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 1, total: 4 } });

    expect(compiled.source).toContain(`ctx.writeLocal("count", (ctx.readLocal("count") + 1));`);
    expect(compiled.source).toContain(`ctx.writeLocal("total", (ctx.readLocal("total") + (ctx.readLocal("count") * 2)));`);
    expect(compiled.invalidates).toEqual([
      { kind: "local", name: "count" },
      { kind: "local", name: "total" },
    ]);
    await compiled.execute(context);
    expect(context.locals).toMatchObject({ count: 2, total: 8 });
  });

  it("compiles handler-local variables, branches, and loops", async () => {
    const document = parseXmlui(`<App var.count="{0}" var.total="{0}" var.label="{''}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler(
        "let i = 0; while (i < 3) { total += count + i; i++ }; if (total > 5) { label = 'high' } else { label = 'low' }",
      ).node,
      scope,
    );
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 1, total: 0, label: "" } });

    expect(lowered.diagnostics).toEqual([]);
    expect(compiled.source).toContain("let i = 0;");
    expect(compiled.source).toContain("while (");
    expect(compiled.source).not.toContain("XMLUI handler loop guard exceeded");
    expect(compiled.source).toContain("__xmluiYieldIfNeeded");
    expect(compiled.source).toContain("ctx.yieldIfNeeded");
    expect(compiled.invalidates).toEqual([
      { kind: "local", name: "total" },
      { kind: "local", name: "label" },
    ]);
    await compiled.execute(context);
    expect(context.locals).toMatchObject({ count: 1, total: 6, label: "high" });
  });

  it("cooperatively yields during compiled handler loops", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("let i = 0; while (i < 3) { i++; count++ }").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const yielded: number[] = [];
    const context = testContext({ locals: { count: 0 } });

    let now = 0;
    const nowSpy = vi.spyOn(performance, "now").mockImplementation(() => {
      now += 101;
      return now;
    });
    context.yieldIfNeeded = (iteration) => {
      yielded.push(iteration);
    };

    try {
      await compiled.execute(context);
      expect(yielded.length).toBeGreaterThan(0);
      expect(yielded.every((iteration) => iteration === 0)).toBe(true);
      expect(context.locals.count).toBe(3);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("paces fallback execution for long cheap loops", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("let i = 0; while (i < 512) { i++ }; count = i").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const yielded: number[] = [];
    const context = testContext({ locals: { count: 0 } });

    let now = 0;
    const nowSpy = vi.spyOn(performance, "now").mockImplementation(() => {
      now += 101;
      return now;
    });
    context.yieldIfNeeded = (iteration) => {
      yielded.push(iteration);
    };

    try {
      await compiled.execute(context);
      expect(yielded.length).toBeGreaterThanOrEqual(2);
      expect(yielded.every((iteration) => iteration === 0)).toBe(true);
      expect(context.locals.count).toBe(512);
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("compiles prefix and decrement updates", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("++count; count--; --count").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 2 } });

    await compiled.execute(context);
    expect(context.locals.count).toBe(1);
  });

  it("keeps handler-local block shadowing separate during IR execution", async () => {
    const document = parseXmlui(`<App var.total="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler("let count = 10; { let count = 1; count++ }; total = count").node,
      scope,
    );
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { total: 0 } });

    expect(lowered.diagnostics).toEqual([]);
    await compiled.execute(context);
    expect(context.locals.total).toBe(10);
  });

  it("uses the expression call allowlist in handlers", async () => {
    const document = parseXmlui(`<App var.items="{0}" var.label="{''}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(
      parseScriptEventHandler("label = items.join(', ')").node,
      scope,
    );
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { items: ["One", "Two"], label: "" } });

    expect(lowered.diagnostics).toEqual([]);
    await compiled.execute(context);
    expect(context.locals.label).toBe("One, Two");
  });

  it("awaits runtime delay helpers before continuing handler execution", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("delay(5); count++").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const calls: number[] = [];
    const context = testContext({ locals: { count: 0 } });

    context.delay = async (ms) => {
      calls.push(ms);
      expect(context.locals.count).toBe(0);
    };

    expect(lowered.diagnostics).toEqual([]);
    expect(compiled.source).toContain("await ((ctx.delay");
    await compiled.execute(context);
    expect(calls).toEqual([5]);
    expect(context.locals.count).toBe(1);
  });

  it("recursively completes promise-valued call results in handlers", async () => {
    const document = parseXmlui(`<App var.items="{0}" var.result="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("result = items.map(item => item.value)").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { items: [{ value: "ignored" }], result: [] } });

    context.call = () => [{ value: Promise.resolve("One") }];
    context.complete = async (value) => {
      const settled = await value;
      if (Array.isArray(settled)) {
        return Promise.all(settled.map(async (item) => ({
          value: await item.value,
        })));
      }
      return settled;
    };

    expect(compiled.source).toContain("ctx.complete");
    await compiled.execute(context);
    expect(context.locals.result).toEqual([{ value: "One" }]);
  });

  it("rejects unsupported handler calls during semantic analysis", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("save(count)").node, scope);

    expect(lowered.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS204",
          message: "Unsupported XMLUI expression call target.",
        }),
      ]),
    );
  });

  it("runs loops beyond the old guard limit", async () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("let i = 0; while (i < 10001) { i++; count++ }").node, scope);
    const compiled = compileXmluiEventHandler(lowered.ir, lowered.dependencies, lowered.writes);
    const context = testContext({ locals: { count: 0 } });

    await compiled.execute(context);
    expect(context.locals.count).toBe(10001);
  });

  it("rejects writes to const handler-local variables", () => {
    const document = parseXmlui(`<App var.count="{0}" />`);
    const scope = createXmluiScope(document.root);
    const lowered = lowerScriptEventHandler(parseScriptEventHandler("const next = count + 1; next++").node, scope);

    expect(lowered.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "XS202",
          message: "Cannot write to read-only XMLUI script target 'next'.",
        }),
      ]),
    );
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
  navigate,
}: {
  locals?: Record<string, unknown>;
  globals?: Record<string, unknown>;
  props?: Record<string, unknown>;
  navigate?: CompiledEventContext["navigate"];
} = {}): CompiledEventContext & {
  locals: Record<string, unknown>;
  globals: Record<string, unknown>;
} {
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
    navigate,
  };
}
