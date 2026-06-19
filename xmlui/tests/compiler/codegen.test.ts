import { describe, expect, it } from "vitest";

import {
  emitGeneratedEventHandler,
  emitGeneratedExpressionBinding,
  emitGeneratedMixedTextSegment,
  emitRuntimeDocumentFromIr,
  emitXmluiModule,
  emitFunctionExpression,
  emitIdentifier,
  emitImports,
  emitValue,
  generateEventHandlerFunction,
  generateExpressionFunction,
  rawJs,
  type GeneratedBinding,
  type GeneratedEventHandler,
} from "../../src/compiler/codegen";
import { buildCompilerIrFromDocument } from "../../src/compiler/ir/index";
import { createIrId, createXmluiIrSourceRef, sourceSpanFromOffsets } from "../../src/compiler/ir/index";
import { parseXmlui } from "../../src/compiler/parseXmlui";
import { createXmluiScope, lowerScriptExpression } from "../../src/compiler/scriptSemantics";
import { parseScriptExpression } from "../../src/parser";

describe("codegen descriptor types", () => {
  it("constructs compiled expression, text, and event descriptors separately from Compiler IR", () => {
    const source = createXmluiIrSourceRef("Main.xmlui", sourceSpanFromOffsets("Main.xmlui", 10, 15));
    const localBinding: GeneratedBinding = {
      kind: "local",
      name: "count",
      rawValue: "{0}",
      irId: createIrId({ sourceId: "Main.xmlui", kind: "binding", path: ["root"], name: "count" }),
      source,
      sourceText: "0",
      generatedSource: "return 0;",
      dependencies: [],
      evaluate: () => 0,
    };
    const textBinding: GeneratedBinding = {
      kind: "text",
      name: "text",
      rawValue: "Count: {count}",
      irId: createIrId({ sourceId: "Main.xmlui", kind: "binding", path: ["root", "text"], name: "text" }),
      source,
      sourceText: "Count: {count}",
      dependencies: [{ kind: "local", name: "count", path: ["count"], span: source.span }],
      segments: [
        { kind: "literal", value: "Count: ", source },
        {
          kind: "expression",
          sourceText: "count",
          source,
          dependencies: [{ kind: "local", name: "count", path: ["count"], span: source.span }],
          generatedSource: `return ctx.readLocal("count");`,
          evaluate: (ctx) => ctx.readLocal("count"),
        },
      ],
    };
    const event: GeneratedEventHandler = {
      name: "click",
      irId: createIrId({ sourceId: "Main.xmlui", kind: "event", path: ["root"], name: "click" }),
      source,
      sourceText: "count++",
      generatedSource: `ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`,
      dependencies: [],
      writes: [{ kind: "local", name: "count", path: ["count"], operator: "++", span: source.span }],
      invalidates: [{ kind: "local", name: "count" }],
      execute: (ctx) => ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1),
    };

    expect(localBinding.evaluate({ readLocal: () => 1, readGlobal: () => 2 })).toBe(0);
    expect(textBinding.segments).toHaveLength(2);
    expect(event.invalidates).toEqual([{ kind: "local", name: "count" }]);
  });
});

describe("codegen emitter foundation", () => {
  it("emits deterministic imports, identifiers, values, and functions", () => {
    expect(
      emitImports([
        { localName: "component0", specifier: "./IncrementButton.xmlui" },
        { localName: "component1", specifier: "./Other.xmlui" },
      ]),
    ).toBe(
      [
        `import component0 from "./IncrementButton.xmlui";`,
        `import component1 from "./Other.xmlui";`,
      ].join("\n"),
    );
    expect(emitIdentifier("Increment-Button", new Set(["Increment_Button"]))).toBe("Increment_Button1");
    expect(emitFunctionExpression(`return ctx.readLocal("count");`)).toBe(
      `(ctx) => {\n  return ctx.readLocal("count");\n}`,
    );
    expect(
      emitValue({
        label: `He said "hi"`,
        items: [1, rawJs(`ctx.readGlobal("count")`)],
        omitted: undefined,
      }),
    ).toBe(
      `{\n  "label": "He said \\"hi\\"",\n  "items": [\n    1,\n    ctx.readGlobal("count")\n  ]\n}`,
    );
  });
});

describe("script function generation", () => {
  it("generates executable expression functions for literals, local/global reads, props, and logical OR", () => {
    const document = parseXmlui(
      `<App global.total="{0}" var.count="{0}"><Button label="{$props.label || 'Click'}">{count} {total}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const app = document.root;
    const button = app.children[0];
    if (button.kind !== "element") {
      throw new Error("Expected button.");
    }
    const local = app.parsed?.vars?.count;
    const global = app.parsed?.globals?.total;
    const label = button.parsed?.props?.label;
    const text = button.children[0];
    if (!local || Array.isArray(local) || !global || Array.isArray(global) || !label || Array.isArray(label) || text.kind !== "text") {
      throw new Error("Expected parsed bindings.");
    }
    const localGenerated = generateExpressionFunction(local.ir!);
    const globalGenerated = generateExpressionFunction(global.ir!);
    const labelExpression = label;
    const countExpression = text.segments?.find(
      (segment) => segment.kind === "expression" && segment.source === "count",
    );
    const totalExpression = text.segments?.find(
      (segment) => segment.kind === "expression" && segment.source === "total",
    );
    if (!countExpression || countExpression.kind !== "expression" || !totalExpression || totalExpression.kind !== "expression") {
      throw new Error("Expected expression segments.");
    }

    expect(localGenerated).toMatchObject({
      body: "return 0;",
      functionSource: `(ctx) => {\n  return 0;\n}`,
    });
    expect(runGeneratedExpression(localGenerated.functionSource, {})).toBe(0);
    expect(runGeneratedExpression(globalGenerated.functionSource, {})).toBe(0);
    expect(runGeneratedExpression(generateExpressionFunction(labelExpression.ir!).functionSource, {
      props: {},
    })).toBe("Click");
    expect(runGeneratedExpression(generateExpressionFunction(labelExpression.ir!).functionSource, {
      props: { label: "Provided" },
    })).toBe("Provided");
    expect(runGeneratedExpression(generateExpressionFunction(countExpression.ir!).functionSource, {
      locals: { count: 7 },
      globals: { total: 11 },
    })).toBe(7);
    expect(runGeneratedExpression(generateExpressionFunction(totalExpression.ir!).functionSource, {
      locals: { count: 7 },
      globals: { total: 11 },
    })).toBe(11);
  });

  it("generates executable event functions for local, global, and shadowed writes", () => {
    const localEvent = eventFrom(`<App var.count="{0}"><Button onClick="count++" /></App>`);
    const localGenerated = generateEventHandlerFunction(localEvent.ir!, localEvent.writes);
    const localState = { count: 1 };
    runGeneratedEvent(localGenerated.functionSource, { locals: localState, globals: {} });
    expect(localState.count).toBe(2);
    expect(localGenerated.invalidates).toEqual([{ kind: "local", name: "count" }]);

    const globalEvent = eventFrom(`<App global.count="{0}"><Button onClick="count++" /></App>`);
    const globalGenerated = generateEventHandlerFunction(globalEvent.ir!, globalEvent.writes);
    const globalState = { count: 4 };
    runGeneratedEvent(globalGenerated.functionSource, { locals: {}, globals: globalState });
    expect(globalState.count).toBe(5);
    expect(globalGenerated.invalidates).toEqual([{ kind: "global", name: "count" }]);

    const shadowEvent = eventFrom(
      `<App global.count="{0}"><Button var.count="{0}" onClick="count++" /></App>`,
    );
    const shadowGenerated = generateEventHandlerFunction(shadowEvent.ir!, shadowEvent.writes);
    const shadowLocals = { count: 10 };
    const shadowGlobals = { count: 99 };
    runGeneratedEvent(shadowGenerated.functionSource, { locals: shadowLocals, globals: shadowGlobals });
    expect(shadowLocals.count).toBe(11);
    expect(shadowGlobals.count).toBe(99);
  });

  it("generates executable expression functions for broader expression syntax", () => {
    const document = parseXmlui(
      `<App var.count="{0}" var.user="{0}" var.items="{0}" var.index="{0}" />`,
      { sourceId: "Main.xmlui" },
    );
    const scope = createXmluiScope(document.root, { sourceId: "Main.xmlui" });
    const expression = lowerScriptExpression(
      parseScriptExpression(
        "items.map(item => item.label).join(', ') || (count > 1 ? user.name : items[index].label)",
      ).node,
      scope,
    );
    const generated = generateExpressionFunction(expression.ir);

    expect(generated.body).toContain(`?.["map"]?.((item) =>`);
    expect(generated.body).toContain(`?.["join"]?.(", ")`);
    expect(runGeneratedExpression(generated.functionSource, {
      locals: {
        count: 0,
        user: { name: "Ada" },
        items: [{ label: "One" }, { label: "Two" }],
        index: 1,
      },
    })).toBe("One, Two");
  });

  it("rejects invalid event write targets during generation", () => {
    const source = createXmluiIrSourceRef("Main.xmlui", sourceSpanFromOffsets("Main.xmlui", 0, 5));

    expect(() =>
      generateEventHandlerFunction({
        kind: "EventHandler",
        span: source.span,
        body: [
          {
            kind: "ExpressionStatement",
            span: source.span,
            expression: {
              kind: "PostfixUpdate",
              span: source.span,
              operator: "++",
              target: {
                kind: "invalid",
                name: "label",
                path: ["label"],
                operator: "++",
                span: source.span,
              },
            },
          },
        ],
      }),
    ).toThrow("Cannot generate invalid XMLUI event write target 'label'.");
  });
});

describe("binding and event code generation", () => {
  it("emits compiled prop/local/global/text bindings and event functions", () => {
    const document = parseXmlui(
      `<App global.total="{0}" var.count="{0}"><Button onClick="count++" label="{$props.label || 'Click'}">Count: {count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const app = document.root;
    const button = app.children[0];
    if (button.kind !== "element") {
      throw new Error("Expected button.");
    }
    const count = app.parsed?.vars?.count;
    const total = app.parsed?.globals?.total;
    const label = button.parsed?.props?.label;
    const event = button.parsed?.events?.click;
    const text = button.children[0];
    if (!count || Array.isArray(count) || !total || Array.isArray(total) || !label || Array.isArray(label) || !event || text.kind !== "text" || !text.segments) {
      throw new Error("Expected parsed bindings.");
    }

    const localSource = emitValue(emitGeneratedExpressionBinding(count));
    const globalSource = emitValue(emitGeneratedExpressionBinding(total));
    const labelSource = emitValue(emitGeneratedExpressionBinding(label));
    const eventSource = emitValue(emitGeneratedEventHandler(event));
    const textSource = emitValue(text.segments.map(emitGeneratedMixedTextSegment));

    expect(localSource).toContain('"evaluate": (ctx) => {\n  return 0;\n}');
    expect(globalSource).toContain('"evaluate": (ctx) => {\n  return 0;\n}');
    expect(labelSource).toContain(`return (ctx.props?.["label"] || "Click");`);
    expect(eventSource).toContain(`ctx.writeLocal("count", Number(ctx.readLocal("count")) + 1);`);
    expect(textSource).toContain(`return ctx.readLocal("count");`);
    expect(evaluateGeneratedObject(localSource).evaluate(fakeContext())).toBe(0);
  });
});

describe("runtime descriptor attachment and module emission", () => {
  it("walks Compiler IR into runtime-rendered node data with compiled functions and debug metadata", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button onClick="count++">Count: {count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, {
      sourceId: "Main.xmlui",
      filename: "Main.xmlui",
    });
    const source = emitValue(emitRuntimeDocumentFromIr(ir));
    const emitted = evaluateGeneratedObject(source);
    const button = emitted.root.children[0];
    const text = button.children[0];

    expect(emitted).toMatchObject({
      kind: "app",
      sourceId: "Main.xmlui",
      filename: "Main.xmlui",
      irId: "module:Main.xmlui:app:App",
      root: {
        irId: "node:Main.xmlui:root:App",
        source: { sourceId: "Main.xmlui" },
      },
    });
    expect(button.parsed.events.click.generatedName).toContain("event_");
    expect(button.parsed.events.click.compiledSource).toBe(
      `ctx.writeGlobal("count", Number(ctx.readGlobal("count")) + 1);`,
    );
    expect(text.segments[1].generatedName).toContain("expr_");
    expect(text.segments[1].evaluate(fakeContext({ globals: { count: 3 } }))).toBe(3);
  });

  it("emits Vite modules with stable imports, compiled functions, and source metadata", () => {
    const document = parseXmlui(`<App><IncrementButton /></App>`, { sourceId: "/src/Main.xmlui" });
    const ir = buildCompilerIrFromDocument(document, {
      sourceId: "/src/Main.xmlui",
      filename: "/src/Main.xmlui",
      validation: { knownComponents: new Set(["IncrementButton"]) },
    });
    const moduleSource = emitXmluiModule({
      compilerIr: ir,
      imports: [
        {
          localName: "component0",
          componentName: "IncrementButton",
          specifier: "./IncrementButton.xmlui",
        },
      ],
    });

    expect(moduleSource).toContain(`import component0 from "./IncrementButton.xmlui";`);
    expect(moduleSource).toContain(`"sourceId": "/src/Main.xmlui"`);
    expect(moduleSource).toContain(`"irId": "module:%2fsrc%2fMain.xmlui:app:App"`);
    expect(moduleSource).toContain(`const module = createXmluiModule(document, [component0]);`);
  });
});

function eventFrom(source: string) {
  const document = parseXmlui(source, { sourceId: "Main.xmlui" });
  const button = document.root.children[0];
  if (button.kind !== "element" || !button.parsed?.events?.click) {
    throw new Error("Expected button click event.");
  }
  return button.parsed.events.click;
}

function runGeneratedExpression(
  functionSource: string,
  options: { props?: Record<string, unknown>; locals?: Record<string, unknown>; globals?: Record<string, unknown> },
): unknown {
  const fn = evaluateGeneratedFunction(functionSource) as (ctx: ReturnType<typeof fakeContext>) => unknown;
  return fn(fakeContext(options));
}

function runGeneratedEvent(
  functionSource: string,
  options: { locals: Record<string, unknown>; globals: Record<string, unknown> },
): void {
  const fn = evaluateGeneratedFunction(functionSource) as (ctx: ReturnType<typeof fakeContext>) => void;
  fn(fakeContext(options));
}

function fakeContext({
  props = {},
  locals = {},
  globals = {},
}: { props?: Record<string, unknown>; locals?: Record<string, unknown>; globals?: Record<string, unknown> } = {}) {
  return {
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

function evaluateGeneratedFunction(functionSource: string): unknown {
  return Function(`"use strict"; return (${functionSource});`)();
}

function evaluateGeneratedObject(objectSource: string): any {
  return Function(`"use strict"; return (${objectSource});`)();
}
