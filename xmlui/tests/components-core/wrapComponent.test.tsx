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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} }, props: {} };
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
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} }, props: {} };
    const result = wrapComponent("Test", DummyNative, metadata);

    const context = createMockContext();
    const element = asElement(result.renderer(context as any));
    expect(element.props.contentClassName).toBeUndefined();
  });
});

describe("wrapComponent — mixed config", () => {
  it("combines templates, renderers, contentClassName, and regular props", () => {
    const metadata: any = { contextVars: { $item: {}, $selectedValue: {}, $inTrigger: {}, $itemIndex: {}, $isFirst: {}, $isLast: {}, $isSelected: {}, $index: {} },
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

describe("wrapComponent — deepSyncCallbacks", () => {
  const arrowExpr = (tag: string) => ({ _ARROW_EXPR_: true, args: [], statement: { tag } });

  describe("deepConvertSyncCallbacks helper", () => {
    it("converts arrow-expression objects at arbitrary depth", async () => {
      const { deepConvertSyncCallbacks } = await import("../../src/components-core/wrapComponent");
      const lookup = vi.fn((v: any) => () => v.statement.tag);
      const input = {
        tooltip: { trigger: "item", formatter: arrowExpr("tip") },
        series: [{ type: "map", label: { formatter: arrowExpr("lbl") } }],
      };
      const out = deepConvertSyncCallbacks(input, lookup);
      expect(typeof out.tooltip.formatter).toBe("function");
      expect(out.tooltip.formatter()).toBe("tip");
      expect(typeof out.series[0].label.formatter).toBe("function");
      expect(out.series[0].label.formatter()).toBe("lbl");
      expect(lookup).toHaveBeenCalledTimes(2);
    });

    it("preserves identity of subtrees without arrow expressions", async () => {
      const { deepConvertSyncCallbacks } = await import("../../src/components-core/wrapComponent");
      const lookup = vi.fn((v: any) => () => v);
      const untouched = { visualMap: { min: 0, max: 100 }, data: [1, 2, 3] };
      const input = { untouched, tooltip: { formatter: arrowExpr("t") } };
      const out = deepConvertSyncCallbacks(input, lookup);
      // Converted branch is a new object; untouched branch is the SAME reference
      expect(out).not.toBe(input);
      expect(out.untouched).toBe(untouched);
      expect(out.untouched.data).toBe(untouched.data);
    });

    it("returns the identical value when nothing converts", async () => {
      const { deepConvertSyncCallbacks } = await import("../../src/components-core/wrapComponent");
      const lookup = vi.fn();
      const input = { a: [1, { b: "x" }], c: null, d: undefined };
      expect(deepConvertSyncCallbacks(input, lookup)).toBe(input);
      expect(lookup).not.toHaveBeenCalled();
    });

    it("does not recurse into non-plain objects (class instances, dates)", async () => {
      const { deepConvertSyncCallbacks } = await import("../../src/components-core/wrapComponent");
      const lookup = vi.fn();
      class Thing { formatter = arrowExpr("hidden"); }
      const date = new Date(0);
      const input = { thing: new Thing(), date };
      const out = deepConvertSyncCallbacks(input, lookup);
      expect(out).toBe(input);
      expect(out.date).toBe(date);
      expect(lookup).not.toHaveBeenCalled();
    });

    it("passes primitives and functions through untouched", async () => {
      const { deepConvertSyncCallbacks } = await import("../../src/components-core/wrapComponent");
      const lookup = vi.fn();
      const fn = () => 1;
      expect(deepConvertSyncCallbacks(42, lookup)).toBe(42);
      expect(deepConvertSyncCallbacks("s", lookup)).toBe("s");
      expect(deepConvertSyncCallbacks(fn, lookup)).toBe(fn);
      expect(deepConvertSyncCallbacks(null, lookup)).toBe(null);
    });
  });

  describe("renderer integration", () => {
    const metadata: any = {
      props: { option: { description: "Config object" } },
    };

    it("deep-converts listed props via lookupSyncCallback", () => {
      const lookupSyncCallback = vi.fn((v: any) => () => v.statement.tag);
      const result = wrapComponent("Test", DummyNative, metadata, {
        deepSyncCallbacks: ["option"],
      });
      const rawOption = {
        tooltip: { formatter: arrowExpr("tip") },
        visualMap: { min: 0 },
      };
      const context = createMockContext({
        node: { type: "Test", props: { option: rawOption, other: rawOption }, children: [] },
        lookupSyncCallback,
      });
      const element = asElement(result.renderer(context as any));
      // Listed prop: nested arrow expression became a callable
      expect(typeof element.props.option.tooltip.formatter).toBe("function");
      expect(element.props.option.tooltip.formatter()).toBe("tip");
      // Untouched sibling subtree keeps identity
      expect(element.props.option.visualMap).toBe(rawOption.visualMap);
      // Unlisted prop with the same content is NOT walked
      expect(element.props.other).toBe(rawOption);
      expect(element.props.other.tooltip.formatter).toBe(rawOption.tooltip.formatter);
    });

    it("is inert for components that do not opt in", () => {
      const lookupSyncCallback = vi.fn();
      const result = wrapComponent("Test", DummyNative, metadata, {});
      const rawOption = { tooltip: { formatter: arrowExpr("tip") } };
      const context = createMockContext({
        node: { type: "Test", props: { option: rawOption }, children: [] },
        lookupSyncCallback,
      });
      const element = asElement(result.renderer(context as any));
      // Exact same reference forwarded — no walk, no conversion, no clone
      expect(element.props.option).toBe(rawOption);
      expect(lookupSyncCallback).not.toHaveBeenCalled();
    });
  });
});
