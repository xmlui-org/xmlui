import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { wrapComponent } from "../../src/components-core/wrapComponent";
import type { WrapComponentConfig, RendererConfig } from "../../src/components-core/wrapComponent";

// --- Minimal mock for inspectorUtils (prevents import errors) ---
vi.mock("../../src/components-core/inspector/inspectorUtils", () => ({
  pushXsLog: vi.fn(),
  createLogEntry: vi.fn(),
  pushTrace: vi.fn(() => "trace-id"),
  popTrace: vi.fn(),
}));

// --- Minimal mock for theming responsive-layout ---
vi.mock("../../src/components-core/theming/responsive-layout", () => ({
  COMPONENT_PART_KEY: "-component",
}));

// --- Minimal mock for container-helpers ---
// MemoizedItem is used in JSX — we mock it as a simple component
// so we can inspect the React element's props directly.
vi.mock("../../src/components/container-helpers", () => {
  const _MockMemoizedItem = (props: any) => null;
  (_MockMemoizedItem as any).__isMock = true;
  return { MemoizedItem: _MockMemoizedItem };
});

// --- Minimal mock for descriptorHelper ---
vi.mock("../../src/components-core/descriptorHelper", () => ({
  layoutOptionKeys: ["width", "height", "backgroundColor", "fontSize"],
}));

// --- Minimal mock for AppContextDefs ---
vi.mock("../../src/abstractions/AppContextDefs", () => ({
  MediaBreakpointKeys: ["sm", "md", "lg"],
}));

// --- Dummy native component ---
function DummyNative(props: any) {
  return React.createElement("div", props);
}

// --- Helper to build a minimal renderer context ---
function createMockContext(overrides: Record<string, any> = {}) {
  return {
    node: { type: "Test", props: {}, children: [] },
    extractValue: Object.assign(
      (val: any) => val,
      {
        asOptionalBoolean: (val: any) => (val === "true" ? true : val === "false" ? false : val),
        asOptionalNumber: (val: any) => (typeof val === "string" ? Number(val) : val),
        asOptionalString: (val: any) => (val != null ? String(val) : undefined),
      },
    ),
    extractResourceUrl: (val: any) => `resolved:${val}`,
    lookupEventHandler: vi.fn(() => undefined),
    lookupSyncCallback: vi.fn(() => undefined),
    renderChild: vi.fn((node: any) => React.createElement("rendered-child", { "data-node": JSON.stringify(node?.type ?? node) })),
    className: "test-class",
    classes: { "-component": "theme-class-abc" },
    updateState: vi.fn(),
    state: {},
    registerComponentApi: vi.fn(),
    appContext: { appGlobals: {} },
    layoutContext: undefined,
    ...overrides,
  };
}

/** Cast renderer result to a React element for prop inspection in tests. */
function asElement(node: React.ReactNode): React.ReactElement {
  return node as React.ReactElement;
}

describe("wrapComponent — templates (static)", () => {
  it("auto-detects ComponentDef props from metadata and renders them via renderChild", () => {
    const metadata = {
      props: {
        emptyListTemplate: { description: "Empty template", valueType: "ComponentDef" as const },
        label: { description: "A label", valueType: "string" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata);
    const context = createMockContext({
      node: {
        type: "Test",
        props: {
          emptyListTemplate: { type: "Text", props: {}, children: [] },
          label: "hello",
        },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    // The component should receive the rendered template, not the raw AST
    const { emptyListTemplate, label } = element.props;
    expect(emptyListTemplate).toBeDefined();
    expect(emptyListTemplate.type).toBe("rendered-child");
    expect(label).toBe("hello");
  });

  it("uses explicit templates config with rename", () => {
    const metadata = {
      props: {
        headerTemplate: { description: "Header", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      templates: { headerTemplate: "header" },
    });
    const context = createMockContext({
      node: {
        type: "Test",
        props: {
          headerTemplate: { type: "Stack", props: {}, children: [] },
        },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    // Should be renamed from headerTemplate to header
    expect(element.props.header).toBeDefined();
    expect(element.props.header.type).toBe("rendered-child");
    expect(element.props.headerTemplate).toBeUndefined();
  });

  it("does not forward ComponentDef prop as raw value", () => {
    const metadata = {
      props: {
        myTemplate: { description: "A template", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata);
    const templateAst = { type: "Fragment", props: {}, children: [] };
    const context = createMockContext({
      node: { type: "Test", props: { myTemplate: templateAst }, children: [] },
    });

    const element = asElement(result.renderer(context as any));
    // myTemplate should be a rendered React element, not the raw AST object
    expect(element.props.myTemplate).toBeDefined();
    expect(element.props.myTemplate).not.toBe(templateAst);
    expect(element.props.myTemplate.type).toBe("rendered-child");
  });

  it("skips template prop when not provided in node.props", () => {
    const metadata = {
      props: {
        emptyListTemplate: { description: "Empty", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata);
    const context = createMockContext({
      node: { type: "Test", props: {}, children: [] },
    });

    const element = asElement(result.renderer(context as any));
    expect(element.props.emptyListTemplate).toBeUndefined();
  });

  it("templates array form keeps same prop name", () => {
    const metadata = {
      props: {
        footerTemplate: { description: "Footer", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      templates: ["footerTemplate"],
    });
    const context = createMockContext({
      node: {
        type: "Test",
        props: { footerTemplate: { type: "Text", props: {}, children: [] } },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    expect(element.props.footerTemplate).toBeDefined();
    expect(element.props.footerTemplate.type).toBe("rendered-child");
  });
});

describe("wrapComponent — renderers (render-prop)", () => {
  it("creates a render-prop callback with positional context vars", () => {
    const metadata = {
      props: {
        optionTemplate: { description: "Option template", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        optionTemplate: {
          contextVars: ["$item", "$selectedValue", "$inTrigger"],
        },
      },
    });

    const templateNode = { type: "CustomOption", props: {}, children: [] };
    const context = createMockContext({
      node: { type: "Test", props: { optionTemplate: templateNode }, children: [] },
    });

    const element = asElement(result.renderer(context as any));
    // Should have optionRenderer (convention: Template → Renderer)
    const renderer = element.props.optionRenderer;
    expect(renderer).toBeInstanceOf(Function);

    // Call the renderer with some args
    const rendered = renderer({ label: "Foo" }, "bar", true);
    // rendered is a React element with MemoizedItem as type
    expect((rendered.type as any).__isMock).toBe(true);
    expect(rendered.props.contextVars).toEqual({
      $item: { label: "Foo" },
      $selectedValue: "bar",
      $inTrigger: true,
    });
    expect(rendered.props.node).toBe(templateNode);
  });

  it("uses custom reactProp name", () => {
    const metadata = {
      props: {
        itemTemplate: { description: "Item", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        itemTemplate: {
          reactProp: "renderItem",
          contextVars: ["$item"],
        },
      },
    });

    const context = createMockContext({
      node: {
        type: "Test",
        props: { itemTemplate: { type: "Row", props: {}, children: [] } },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    expect(element.props.renderItem).toBeInstanceOf(Function);
    expect(element.props.itemRenderer).toBeUndefined();
    expect(element.props.itemTemplate).toBeUndefined();
  });

  it("uses function form for computed context vars", () => {
    const metadata = {
      props: {
        itemTemplate: { description: "Item", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        itemTemplate: {
          reactProp: "itemRenderer",
          contextVars: (item: any, _key: any, rowIndex: number, count: number, isSelected: boolean) => ({
            $item: item,
            $itemIndex: rowIndex,
            $isFirst: rowIndex === 0,
            $isLast: rowIndex === count - 1,
            $isSelected: isSelected,
          }),
        },
      },
    });

    const context = createMockContext({
      node: {
        type: "Test",
        props: { itemTemplate: { type: "ListItem", props: {}, children: [] } },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    const renderer = element.props.itemRenderer;
    const rendered = renderer({ name: "Alice" }, "key-1", 0, 3, true);
    expect((rendered.type as any).__isMock).toBe(true);
    expect(rendered.props.contextVars).toEqual({
      $item: { name: "Alice" },
      $itemIndex: 0,
      $isFirst: true,
      $isLast: false,
      $isSelected: true,
    });
  });

  it("skips render-prop when template is not provided", () => {
    const metadata = {
      props: {
        optionTemplate: { description: "Option", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        optionTemplate: {
          contextVars: ["$item"],
        },
      },
    });

    const context = createMockContext({
      node: { type: "Test", props: {}, children: [] },
    });

    const element = asElement(result.renderer(context as any));
    expect(element.props.optionRenderer).toBeUndefined();
  });

  it("null in positional contextVars skips that argument", () => {
    const metadata = {
      props: {
        itemTemplate: { description: "Item", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        itemTemplate: {
          contextVars: ["$item", null, "$index"],
        },
      },
    });

    const context = createMockContext({
      node: {
        type: "Test",
        props: { itemTemplate: { type: "Item", props: {}, children: [] } },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    const rendered = element.props.itemRenderer("data", "skipped", 5);
    expect((rendered.type as any).__isMock).toBe(true);
    expect(rendered.props.contextVars).toEqual({ $item: "data", $index: 5 });
  });

  it("renderer overrides auto-detected template for same prop", () => {
    const metadata = {
      props: {
        optionTemplate: { description: "Option", valueType: "ComponentDef" as const },
        emptyListTemplate: { description: "Empty", valueType: "ComponentDef" as const },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        optionTemplate: {
          contextVars: ["$item"],
        },
      },
    });

    const context = createMockContext({
      node: {
        type: "Test",
        props: {
          optionTemplate: { type: "Opt", props: {}, children: [] },
          emptyListTemplate: { type: "Empty", props: {}, children: [] },
        },
        children: [],
      },
    });

    const element = asElement(result.renderer(context as any));
    // optionTemplate → render-prop (optionRenderer)
    expect(element.props.optionRenderer).toBeInstanceOf(Function);
    // emptyListTemplate → static template (auto-detected)
    expect(element.props.emptyListTemplate).toBeDefined();
    expect(element.props.emptyListTemplate.type).toBe("rendered-child");
  });
});

describe("wrapComponent — contentClassName", () => {
  it("passes classes[COMPONENT_PART_KEY] as contentClassName when enabled", () => {
    const metadata = { props: {} };
    const result = wrapComponent("Test", DummyNative, metadata, {
      contentClassName: true,
    });

    const context = createMockContext({
      classes: { "-component": "my-theme-class" },
    });

    const element = asElement(result.renderer(context as any));
    expect(element.props.contentClassName).toBe("my-theme-class");
  });

  it("does not add contentClassName when not configured", () => {
    const metadata = { props: {} };
    const result = wrapComponent("Test", DummyNative, metadata);

    const context = createMockContext();
    const element = asElement(result.renderer(context as any));
    expect(element.props.contentClassName).toBeUndefined();
  });
});

describe("wrapComponent — mixed config", () => {
  it("combines templates, renderers, contentClassName, and regular props", () => {
    const metadata = {
      props: {
        enabled: { description: "Enabled", valueType: "boolean" as const },
        placeholder: { description: "Placeholder", valueType: "string" as const },
        emptyListTemplate: { description: "Empty", valueType: "ComponentDef" as const },
        optionTemplate: { description: "Option", valueType: "ComponentDef" as const },
      },
      events: {
        didChange: { description: "Change event" },
      },
    };

    const result = wrapComponent("Test", DummyNative, metadata, {
      renderers: {
        optionTemplate: {
          contextVars: ["$item", "$selectedValue"],
        },
      },
      contentClassName: true,
      exposeRegisterApi: true,
    });

    const onDidChange = vi.fn();
    const context = createMockContext({
      node: {
        type: "Test",
        props: {
          enabled: true,
          placeholder: "Search...",
          emptyListTemplate: { type: "Text", props: {}, children: [] },
          optionTemplate: { type: "CustomOpt", props: {}, children: [] },
        },
        children: [],
      },
      lookupEventHandler: vi.fn((name: string) =>
        name === "didChange" ? onDidChange : undefined,
      ),
      classes: { "-component": "combined-theme" },
    });

    const element = asElement(result.renderer(context as any));

    // Regular props
    expect(element.props.enabled).toBe(true);
    expect(element.props.placeholder).toBe("Search...");

    // Static template (auto-detected)
    expect(element.props.emptyListTemplate).toBeDefined();
    expect(element.props.emptyListTemplate.type).toBe("rendered-child");

    // Render-prop template
    expect(element.props.optionRenderer).toBeInstanceOf(Function);

    // contentClassName
    expect(element.props.contentClassName).toBe("combined-theme");

    // Event handler
    expect(element.props.onDidChange).toBeInstanceOf(Function);

    // registerComponentApi
    expect(element.props.registerComponentApi).toBeDefined();
  });
});
