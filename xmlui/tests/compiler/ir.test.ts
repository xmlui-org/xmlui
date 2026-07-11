import { describe, expect, it } from "vitest";

import {
  buildCompilerIrFromDocument,
  collectReferencedComponents,
  compilerIrToRuntimeDocument,
  createIrId,
  createMinimalModuleIr,
  createXmluiIrId,
  createXmluiIrSourceRef,
  emptyDependencySummary,
  sourceSpanFromOffsets,
  validateCompilerIr,
  type XmluiBindingIr,
  type XmluiBuiltinNodeIr,
  type XmluiComponentReferenceNodeIr,
  type XmluiEventIr,
  type XmluiNodeIr,
} from "../../src/compiler/ir/index";
import { parseXmlui } from "../../src/compiler/parseXmlui";

describe("Compiler IR type skeleton", () => {
  it("constructs a minimal app module IR without replacing the runtime descriptor", () => {
    const root = builtinNode("Main.xmlui", ["root"], "App", [
      builtinNode("Main.xmlui", ["root", "0"], "H1"),
      componentReferenceNode("Main.xmlui", ["root", "1"], "IncrementButton"),
    ]);
    const module = createMinimalModuleIr({
      sourceId: "Main.xmlui",
      kind: "app",
      name: "App",
      root,
    });

    expect(module).toMatchObject({
      version: 1,
      id: "module:Main.xmlui:app:App",
      kind: "app",
      sourceId: "Main.xmlui",
      definition: {
        id: "definition:Main.xmlui:app:App",
        kind: "app",
        name: "App",
        rootNodeId: root.id,
        root,
        scope: {
          id: "scope:Main.xmlui:definition/App",
          allowImplicitGlobals: false,
        },
      },
      referencedComponents: ["IncrementButton"],
      diagnostics: [],
    });
  });

  it("constructs binding IR separately from node IR", () => {
    const node = builtinNode("Main.xmlui", ["root"], "Button");
    const binding: XmluiBindingIr = {
      id: createIrId({
        sourceId: "Main.xmlui",
        kind: "binding",
        path: ["root", "props"],
        name: "label",
      }),
      kind: "prop",
      name: "label",
      rawValue: "Counter #2",
      source: createXmluiIrSourceRef("Main.xmlui", sourceSpanFromOffsets("Main.xmlui", 8, 25)),
      dependencies: emptyDependencySummary(),
    };

    expect(binding).toMatchObject({
      id: "binding:Main.xmlui:root/props:label",
      kind: "prop",
      name: "label",
      rawValue: "Counter #2",
      source: {
        sourceId: "Main.xmlui",
        span: { sourceId: "Main.xmlui", start: 8, end: 25 },
      },
    });
    expect(node.bindings).toEqual([]);
  });

  it("collects component references from the node tree", () => {
    const root = builtinNode("Main.xmlui", ["root"], "App", [
      componentReferenceNode("Main.xmlui", ["root", "0"], "IncrementButton"),
      componentReferenceNode("Main.xmlui", ["root", "1"], "IncrementButton"),
      componentReferenceNode("Main.xmlui", ["root", "2"], "OtherPanel"),
    ]);

    expect(collectReferencedComponents(root)).toEqual(["IncrementButton", "OtherPanel"]);
  });
});

describe("Compiler IR stable IDs and source references", () => {
  it("creates deterministic IDs from source, kind, path, and name", () => {
    const first = createXmluiIrId({
      sourceId: "/src/Main.xmlui",
      kind: "node",
      path: ["root", 0, "children", 1],
      name: "Button",
    });
    const second = createXmluiIrId({
      sourceId: "/src/Main.xmlui",
      kind: "node",
      path: ["root", 0, "children", 1],
      name: "Button",
    });

    expect(first).toBe(second);
    expect(first).toBe("node:%2fsrc%2fMain.xmlui:root/0/children/1:Button");
  });

  it("distinguishes repeated sibling nodes by path", () => {
    const first = createXmluiIrId({
      sourceId: "Main.xmlui",
      kind: "node",
      path: ["root", "children", 0],
      name: "IncrementButton",
    });
    const second = createXmluiIrId({
      sourceId: "Main.xmlui",
      kind: "node",
      path: ["root", "children", 1],
      name: "IncrementButton",
    });

    expect(first).not.toBe(second);
    expect(first).toBe("node:Main.xmlui:root/children/0:IncrementButton");
    expect(second).toBe("node:Main.xmlui:root/children/1:IncrementButton");
  });

  it("keeps source references local to the source file", () => {
    const span = sourceSpanFromOffsets("IncrementButton.xmlui", 42, 55);
    const ref = createXmluiIrSourceRef("IncrementButton.xmlui", span);

    expect(ref).toEqual({
      sourceId: "IncrementButton.xmlui",
      span: {
        sourceId: "IncrementButton.xmlui",
        start: 42,
        end: 55,
      },
    });
  });
});

describe("Compiler IR lowering from analyzed XMLUI documents", () => {
  it("lowers local counter scopes, declarations, and bindings", () => {
    const document = parseXmlui(
      `<App var.count="{0}"><Button onClick="count++">Click: {count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, { sourceId: "Main.xmlui" });

    expect(ir.definition.scope).toMatchObject({
      id: "scope:Main.xmlui:root",
      allowImplicitGlobals: false,
      declarations: [
        expect.objectContaining({
          kind: "local",
          name: "count",
          mutable: true,
          initializerBindingId: "binding:Main.xmlui:root:count",
        }),
      ],
    });
    expect(ir.definition.root.bindings).toEqual([
      expect.objectContaining({
        kind: "local",
        name: "count",
        rawValue: "{0}",
        expression: expect.objectContaining({
          sourceText: "0",
          compiledSource: "return 0;",
        }),
      }),
    ]);
    const root = expectChildren(ir.definition.root);
    expect(root.children[0]).toMatchObject({
      kind: "builtin",
      type: "Button",
      events: [
        expect.objectContaining({
          name: "click",
          rawSource: "count++",
          compiledSource: expect.stringContaining(`ctx.writeLocal("count", __xmluiNext);`),
          invalidates: [{ kind: "local", name: "count" }],
        }),
      ],
    });
  });

  it("lowers component prop and mixed-text binding IR", () => {
    const document = parseXmlui(
      `<Component name="IncrementButton" var.count="{0}"><Button>{$props.label || 'Click'}: {count}</Button></Component>`,
      { sourceId: "IncrementButton.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, { sourceId: "IncrementButton.xmlui" });
    const button = expectChildren(ir.definition.root).children[0];

    expect(ir).toMatchObject({
      kind: "component",
      referencedComponents: [],
      definition: {
        name: "IncrementButton",
        scope: {
          allowImplicitGlobals: true,
          declarations: [
            expect.objectContaining({ kind: "local", name: "count" }),
          ],
        },
      },
    });
    expect(button.kind).toBe("builtin");
    const buttonWithChildren = expectChildren(button);
    expect(button.bindings).toEqual([]);
    expect(buttonWithChildren.children[0]).toMatchObject({
      kind: "text",
      bindings: [
        {
          kind: "text",
          name: "text",
          textSegments: [
            expect.objectContaining({
              kind: "expression",
              sourceText: "$props.label || 'Click'",
              expression: expect.objectContaining({
                compiledSource: `return (ctx.props?.["label"] || "Click");`,
              }),
            }),
            expect.objectContaining({ kind: "literal", value: ": " }),
            expect.objectContaining({
              kind: "expression",
              sourceText: "count",
              expression: expect.objectContaining({
                dependencies: [expect.objectContaining({ kind: "local", name: "count" })],
              }),
            }),
          ],
        },
      ],
    });
  });

  it("lowers globals, component references, and local shadowing", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><IncrementButton /><Button var.count="{0}">Local: {count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, { sourceId: "Main.xmlui" });

    expect(ir.referencedComponents).toEqual(["IncrementButton"]);
    expect(ir.definition.scope.declarations).toEqual([
      expect.objectContaining({ kind: "global", name: "count" }),
    ]);
    const root = expectChildren(ir.definition.root);
    expect(root.children[0]).toMatchObject({
      kind: "component-reference",
      name: "IncrementButton",
    });
    expect(root.children[1]).toMatchObject({
      kind: "builtin",
      type: "Button",
      scopeId: "scope:Main.xmlui:root/children/1",
      bindings: [expect.objectContaining({ kind: "local", name: "count" })],
    });
  });

  it("preserves derived binding metadata through Compiler IR round-trips", () => {
    const document = parseXmlui(
      `<App var.count="{1}" var.double="{count * 2}"><Text value="{double}" /></App>`,
      { sourceId: "Main.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, { sourceId: "Main.xmlui" });

    expect(ir.definition.root.bindings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "local", name: "count", bindingMode: "source" }),
        expect.objectContaining({ kind: "local", name: "double", bindingMode: "derived" }),
      ]),
    );
    expect(compilerIrToRuntimeDocument(ir).root.parsed?.vars?.double).toMatchObject({
      bindingMode: "derived",
    });
  });

  it("lowers event IR for local, global, and shadowed writes", () => {
    const localDocument = parseXmlui(`<App var.count="{0}"><Button onClick="count++" /></App>`);
    const localIr = buildCompilerIrFromDocument(localDocument);
    const localButton = expectChildren(localIr.definition.root).children[0];
    expect(localButton.events[0]).toMatchObject({
      name: "click",
      rawSource: "count++",
      compiledSource: expect.stringContaining(`ctx.writeLocal("count", __xmluiNext);`),
      writes: [expect.objectContaining({ kind: "local", name: "count" })],
      invalidates: [{ kind: "local", name: "count" }],
    });

    const globalDocument = parseXmlui(`<App global.count="{0}"><Button onClick="count++" /></App>`);
    const globalIr = buildCompilerIrFromDocument(globalDocument);
    const globalButton = expectChildren(globalIr.definition.root).children[0];
    expect(globalButton.events[0]).toMatchObject({
      compiledSource: expect.stringContaining(`ctx.writeGlobal("count", __xmluiNext);`),
      writes: [expect.objectContaining({ kind: "global", name: "count" })],
      invalidates: [{ kind: "global", name: "count" }],
    });

    const shadowDocument = parseXmlui(
      `<App global.count="{0}"><Button var.count="{0}" onClick="count++" /></App>`,
    );
    const shadowIr = buildCompilerIrFromDocument(shadowDocument);
    const shadowButton = expectChildren(shadowIr.definition.root).children[0];
    expect(shadowButton.events[0]).toMatchObject({
      compiledSource: expect.stringContaining(`ctx.writeLocal("count", __xmluiNext);`),
      writes: [expect.objectContaining({ kind: "local", name: "count" })],
    });
  });

  it("distinguishes definition roots, built-in nodes, component references, text nodes, and child order", () => {
    const document = parseXmlui(
      `<App><H1>Title</H1><IncrementButton /><Button>Tail</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, { sourceId: "Main.xmlui" });
    const root = expectChildren(ir.definition.root);

    expect(ir.definition).toMatchObject({
      kind: "app",
      name: "App",
      rootNodeId: "node:Main.xmlui:root:App",
    });
    expect(root.children.map((child) => child.kind)).toEqual([
      "builtin",
      "component-reference",
      "builtin",
    ]);
    expect(root.children[0]).toMatchObject({ kind: "builtin", type: "H1" });
    expect(root.children[1]).toMatchObject({
      kind: "component-reference",
      name: "IncrementButton",
    });
    expect(root.children[2]).toMatchObject({ kind: "builtin", type: "Button" });
    expect(expectChildren(root.children[0]).children[0]).toMatchObject({
      kind: "text",
      text: "Title",
    });
  });

  it("aggregates dependency summaries at node, definition, and module levels", () => {
    const document = parseXmlui(
      `<App global.count="{0}"><Button onClick="count++">Global: {count}</Button></App>`,
      { sourceId: "Main.xmlui" },
    );
    const ir = buildCompilerIrFromDocument(document, { sourceId: "Main.xmlui" });
    const button = expectChildren(ir.definition.root).children[0];

    expect(button.dependencies.reads).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "global", name: "count" })]),
    );
    expect(button.dependencies.writes).toEqual([
      expect.objectContaining({ kind: "global", name: "count" }),
    ]);
    expect(button.dependencies.invalidates).toEqual([{ kind: "global", name: "count" }]);
    expect(ir.definition.dependencies.reads).toEqual(
      expect.arrayContaining([expect.objectContaining({ kind: "global", name: "count" })]),
    );
    expect(ir.definition.dependencies.writes).toEqual(button.dependencies.writes);
    expect(ir.dependencies.invalidates).toEqual(button.dependencies.invalidates);
  });

  it("validates unknown component references when known components are provided", () => {
    const document = parseXmlui(`<App><MissingPanel /></App>`, { sourceId: "Main.xmlui" });
    const ir = buildCompilerIrFromDocument(document, {
      sourceId: "Main.xmlui",
      validation: { knownComponents: new Set(["IncrementButton"]) },
    });

    expect(ir.diagnostics).toEqual([
      expect.objectContaining({
        code: "IR003",
        message: "Unknown XMLUI component reference 'MissingPanel'.",
      }),
    ]);
  });

  it("validates invalid writes and duplicate declarations in IR", () => {
    const document = parseXmlui(`<App var.count="{0}"><Button onClick="count++" /></App>`);
    const ir = buildCompilerIrFromDocument(document);
    const button = expectChildren(ir.definition.root).children[0];
    const firstDeclaration = ir.definition.scope.declarations[0];

    button.events[0] = {
      ...button.events[0],
      writes: [
        {
          kind: "invalid",
          name: "count",
          path: ["count"],
          operator: "++",
          span: button.events[0].source.span,
        },
      ],
    } satisfies XmluiEventIr;
    ir.definition.scope.declarations.push({ ...firstDeclaration });

    expect(validateCompilerIr(ir)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "IR006",
          message: "Invalid XMLUI IR event write target.",
        }),
        expect.objectContaining({
          code: "IR007",
          message: "Duplicate XMLUI IR local declaration 'count'.",
        }),
      ]),
    );
  });
});

describe("Compiler IR runtime adapter", () => {
  it("reconstructs the local counter runtime descriptor", () => {
    expectRoundTripRuntimeDescriptor(
      `<App var.count="{0}">
  <H1>Counter example</H1>
  <Button onClick="count++">
    Click to increment: {count}
  </Button>
</App>`,
      "Main.xmlui",
    );
  });

  it("reconstructs the user-defined component counter descriptors", () => {
    expectRoundTripRuntimeDescriptor(
      `<App>
  <H1>Counter with components</H1>
  <IncrementButton />
  <IncrementButton label="Counter #2" />
  <IncrementButton label="Counter #3" />
</App>`,
      "Main.xmlui",
    );
    expectRoundTripRuntimeDescriptor(
      `<Component name="IncrementButton" var.count="{0}">
  <Button onClick="count++">
    {$props.label || 'Click to increment'}: {count}
  </Button>
</Component>`,
      "IncrementButton.xmlui",
    );
  });

  it("reconstructs global and shadowed counter runtime descriptors", () => {
    expectRoundTripRuntimeDescriptor(
      `<App global.count="{0}">
  <H1>Counter with components</H1>
  <IncrementButton />
  <IncrementButton label="Global Counter #2" />
  <IncrementButton label="Global Counter #3" />
  <Button var.count="{0}" onClick="count++">
    Local count: {count}
  </Button>
</App>`,
      "Main.xmlui",
    );
    expectRoundTripRuntimeDescriptor(
      `<Component name="IncrementButton">
  <Button onClick="count++">
    {$props.label || 'Click to increment (Global)'}: {count}
  </Button>
</Component>`,
      "IncrementButton.xmlui",
    );
  });
});

function expectChildren<TNode extends XmluiNodeIr>(
  node: TNode,
): TNode & { children: XmluiNodeIr[] } {
  if (!("children" in node)) {
    throw new Error("Expected IR node to have children.");
  }
  return node as TNode & { children: XmluiNodeIr[] };
}

function expectRoundTripRuntimeDescriptor(source: string, sourceId: string): void {
  const document = parseXmlui(source, { sourceId });
  const ir = buildCompilerIrFromDocument(document, { sourceId });

  expect(compilerIrToRuntimeDocument(ir)).toEqual(document);
}

function builtinNode(
  sourceId: string,
  path: readonly (string | number)[],
  type: string,
  children: XmluiNodeIr[] = [],
): XmluiBuiltinNodeIr {
  return {
    id: createIrId({ sourceId, kind: "node", path, name: type }),
    kind: "builtin",
    type,
    source: createXmluiIrSourceRef(sourceId, sourceSpanFromOffsets(sourceId, 0, 1)),
    bindings: [],
    events: [],
    methods: [],
    dependencies: emptyDependencySummary(),
    children,
  };
}

function componentReferenceNode(
  sourceId: string,
  path: readonly (string | number)[],
  name: string,
): XmluiComponentReferenceNodeIr {
  return {
    id: createIrId({ sourceId, kind: "node", path, name }),
    kind: "component-reference",
    name,
    source: createXmluiIrSourceRef(sourceId, sourceSpanFromOffsets(sourceId, 0, 1)),
    bindings: [],
    events: [],
    methods: [],
    dependencies: emptyDependencySummary(),
    children: [],
  };
}
