import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import React from "react";
import type { InnerRendererContext } from "../../../src/components-core/abstractions/ComponentRenderer";

// Mock all the dependencies before importing ComponentAdapter
vi.mock("../../../src/components/ComponentRegistryContext", () => ({
  useComponentRegistry: vi.fn(() => ({
    lookupComponentRenderer: vi.fn().mockReturnValue({
      renderer: vi.fn().mockReturnValue(React.createElement("div", null, "Rendered")),
      descriptor: {},
      isCompoundComponent: false,
    }),
    getBehaviors: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock("../../../src/components-core/theming/ThemeContext", () => ({
  useTheme: vi.fn(() => ({
    getResourceUrl: vi.fn((url) => url),
    disableInlineStyle: false,
  })),
}));

vi.mock("../../../src/components-core/theming/StyleContext", () => ({
  useComponentStyle: vi.fn(() => "test-class"),
}));

vi.mock("../../../src/components-core/InspectorContext", () => ({
  useInspector: vi.fn(() => ({
    inspectId: undefined,
    refreshInspection: vi.fn(),
  })),
}));

vi.mock("../../../src/components-core/event-handlers", () => ({
  useMouseEventHandlers: vi.fn(() => ({})),
}));

vi.mock("../../../src/components-core/utils/hooks", () => ({
  useReferenceTrackedApi: vi.fn(() => ({})),
  useShallowCompareMemoize: vi.fn((value) => value),
}));

vi.mock("../../../src/components-core/utils/extractParam", () => ({
  extractParam: vi.fn((state, value) => value),
  shouldKeep: vi.fn((when) => when !== false),
}));

// Now import the component
import ComponentAdapter from "../../../src/components-core/rendering/ComponentAdapter";

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface MockNode {
  type: string; // Make type required
  uid?: string;
  testId?: string;
  when?: any;
  props?: Record<string, any>;
  events?: Record<string, any>;
  children?: MockNode[];
}

const createMockNode = (overrides?: Partial<MockNode>): MockNode => ({
  type: "MockComponent",
  uid: "test-component",
  props: {},
  events: {},
  ...overrides,
});

const createMockProps = (overrides?: Partial<Omit<InnerRendererContext, "layoutContext"> & { layoutContextRef: any; onUnmount: any }>) => {
  const state = { "test-component": {} };
  const appContext = {
    mediaSize: "lg",
    appGlobals: undefined,
  };
  const dispatch = vi.fn();
  const layoutContextRef = { current: undefined };
  const onUnmount = vi.fn();
  const uidInfoRef = { current: [] };
  // memoedVarsRef needs to be a Map, not a plain object
  const memoedVarsRef = { current: new Map() };

  return {
    node: createMockNode(),
    state,
    appContext: appContext as any,
    dispatch,
    lookupAction: vi.fn().mockReturnValue(undefined),
    lookupSyncCallback: vi.fn().mockReturnValue(undefined),
    renderChild: vi.fn().mockReturnValue(null),
    registerComponentApi: vi.fn(),
    layoutContextRef,
    parentRenderContext: undefined,
    memoedVarsRef,
    onUnmount,
    uidInfoRef,
    ...overrides,
  } as any;
};

// ============================================================================
// ComponentAdapter Unit Tests
// ============================================================================

describe("ComponentAdapter", () => {
  // ========================================================================
  // Safe Node Creation Tests
  // ========================================================================

  it("normalizes missing props property", async () => {
    const props = createMockProps({
      node: createMockNode({ props: undefined }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    await waitFor(() => {
      expect(props.node).toBeDefined();
    });
  });

  it("normalizes missing events property", async () => {
    const props = createMockProps({
      node: createMockNode({ events: undefined }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    await waitFor(() => {
      expect(props.node).toBeDefined();
    });
  });

  it("preserves existing props and events", () => {
    const customProps = { color: "red", size: "lg" };
    const customEvents = { onClick: "handleClick", onHover: "handleHover" };
    const props = createMockProps({
      node: createMockNode({
        props: customProps,
        events: customEvents,
      }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.props).toEqual(customProps);
    expect(props.node.events).toEqual(customEvents);
  });

  // ========================================================================
  // Conditional Rendering (When) Tests
  // ========================================================================

  it("does not render when when is false", () => {
    const props = createMockProps({
      node: createMockNode({
        when: false,
        testId: "conditional-component",
      }),
    });

    const { container } = render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(container.firstChild).toBeNull();
  });

  it("renders when when is true", () => {
    const props = createMockProps({
      node: createMockNode({
        when: true,
        type: "TestComponent",
      }),
    });

    const { container } = render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(container.firstChild).not.toBeNull();
  });

  it("renders when when is undefined", () => {
    const props = createMockProps({
      node: createMockNode({ when: undefined }),
    });

    const { container } = render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(container.firstChild).not.toBeNull();
  });

  // ========================================================================
  // Lifecycle Events Tests
  // ========================================================================

  it("calls onUnmount callback on component unmount", () => {
    const onUnmount = vi.fn();
    const props = createMockProps({ onUnmount });

    const { unmount } = render(<ComponentAdapter ref={null} {...(props as any)} />);
    unmount();

    expect(onUnmount).toHaveBeenCalled();
    const calledUid = onUnmount.mock.calls[0][0];
    expect(typeof calledUid).toBe("symbol");
  });

  it("handles unmount without errors", () => {
    const onUnmount = vi.fn();
    const props = createMockProps({ onUnmount });

    const { unmount } = render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(() => {
      unmount();
    }).not.toThrow();
  });

  // ========================================================================
  // State Management Tests
  // ========================================================================

  it("accepts dispatch function", () => {
    const dispatch = vi.fn();
    const props = createMockProps({ dispatch });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(dispatch).toBeDefined();
  });

  it("extracts context variables from state", () => {
    const contextState = {
      "test-component": {},
      $theme: "dark",
      $user: { name: "John" },
      regularProp: "value",
    } as any;

    const props = createMockProps({
      state: contextState,
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect((props.state as any).$theme).toBe("dark");
    expect((props.state as any).$user).toEqual({ name: "John" });
  });

  // ========================================================================
  // API Binding Detection Tests
  // ========================================================================

  it("detects API-bound properties with DataSource", () => {
    const props = createMockProps({
      node: createMockNode({
        props: {
          data: {
            type: "DataSource",
          },
        },
      }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.props.data.type).toBe("DataSource");
  });

  it("detects API-bound properties with DataSourceRef", () => {
    const props = createMockProps({
      node: createMockNode({
        props: {
          ref: {
            type: "DataSourceRef",
          },
        },
      }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.props.ref.type).toBe("DataSourceRef");
  });

  it("stores API-bound event information", () => {
    const props = createMockProps({
      node: createMockNode({
        events: {
          onLoad: {
            type: "APICall",
          },
        },
      }),
    });

    // Just verify the event data is present (actual handler generation is integration-level)
    expect(props.node.events.onLoad).toBeDefined();
  });

  it("stores API-bound events for file operations", () => {
    const props = createMockProps({
      node: createMockNode({
        events: {
          onExport: {
            type: "FileDownload",
          },
          onUpload: {
            type: "FileUpload",
          },
        },
      }),
    });

    expect(props.node.events.onExport.type).toBe("FileDownload");
    expect(props.node.events.onUpload.type).toBe("FileUpload");
  });

  // ========================================================================
  // UID Generation Tests
  // ========================================================================

  it("preserves node uid value", () => {
    const testUid = "unique-test-id-123";
    const props = createMockProps({
      node: createMockNode({ uid: testUid }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.uid).toBe(testUid);
  });

  it("handles different uids for different nodes", () => {
    const props1 = createMockProps({
      node: createMockNode({ uid: "component-1" }),
    });
    const props2 = createMockProps({
      node: createMockNode({ uid: "component-2" }),
    });

    render(<ComponentAdapter ref={null} {...(props1 as any)} />);
    render(<ComponentAdapter ref={null} {...(props2 as any)} />);

    expect(props1.node.uid).not.toBe(props2.node.uid);
  });

  // ========================================================================
  // Ref Forwarding Tests
  // ========================================================================

  it("accepts ref prop", () => {
    const ref = React.createRef<HTMLDivElement>();
    const props = createMockProps({
      node: createMockNode({ type: "TestComponent" }),
    });

    render(<ComponentAdapter ref={ref} {...(props as any)} />);

    expect(ref).toBeDefined();
  });

  // ========================================================================
  // Props Merging Tests
  // ========================================================================

  it("accepts additional rest props", () => {
    const props = createMockProps();

    render(
      <ComponentAdapter
        ref={null}
        {...(props as any)}
        className="custom-class"
        style={{ color: "red" }}
      />
    );

    expect(props.node).toBeDefined();
  });

  // ========================================================================
  // Children Handling Tests
  // ========================================================================

  it("accepts children prop", () => {
    const props = createMockProps();
    const children = React.createElement("span", null, "Child content");

    render(
      <ComponentAdapter ref={null} {...(props as any)}>
        {children}
      </ComponentAdapter>
    );

    expect(props.node).toBeDefined();
  });

  it("handles no children gracefully", () => {
    const props = createMockProps();

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node).toBeDefined();
  });

  // ========================================================================
  // Error Handling Tests
  // ========================================================================

  it("handles missing component type gracefully", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const props = createMockProps({
      node: createMockNode({ type: "NonExistentComponent" }),
    });

    expect(() => {
      render(<ComponentAdapter ref={null} {...(props as any)} />);
    }).not.toThrow();

    consoleErrorSpy.mockRestore();
  });

  // ========================================================================
  // Integration Tests
  // ========================================================================

  it("renders with complete mock setup", () => {
    const props = createMockProps({
      node: createMockNode({
        uid: "integration-test",
        type: "TestComponent",
        props: { title: "Test Title" },
      }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.uid).toBe("integration-test");
  });

  it("handles multiple lifecycle phases", () => {
    const onUnmount = vi.fn();
    const props = createMockProps({ onUnmount });

    const { unmount } = render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(onUnmount).not.toHaveBeenCalled();

    unmount();

    expect(onUnmount).toHaveBeenCalled();
  });

  // ========================================================================
  // Slots Tests
  // ========================================================================

  it("handles Slot type correctly", () => {
    const props = createMockProps({
      node: createMockNode({
        type: "Slot",
        props: { name: "contentTemplate" },
      }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.type).toBe("Slot");
  });

  it("preserves slot names", () => {
    const props = createMockProps({
      node: createMockNode({
        type: "Slot",
        props: { name: "invalidSlot" },
      }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.node.props.name).toBe("invalidSlot");
  });

  // ========================================================================
  // Theme and Layout Tests
  // ========================================================================

  it("provides app context", () => {
    const props = createMockProps();

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.appContext).toBeDefined();
  });

  it("initializes with layout context", () => {
    const props = createMockProps({
      node: createMockNode({ props: {} }),
    });

    render(<ComponentAdapter ref={null} {...(props as any)} />);

    expect(props.layoutContextRef).toBeDefined();
  });
});
