# Conventions: XMLUI Unit Testing

This document outlines the testing conventions and standards for XMLUI unit tests using Vitest and React Testing Library.

## Purpose

Unit tests verify component logic in isolation without full rendering pipeline or browser environment. Use for:

- Internal logic and state management
- Props normalization and validation
- Memoization and optimization
- Hook behavior and lifecycle
- Edge case handling
- Error boundaries

**NOT for**: Full rendering, user interactions, visual layout, event execution. Use E2E tests instead.

## File Organization

- **Location**: `xmlui/tests/` directory matching source structure
- **Naming**: `ComponentName.test.tsx` or `ComponentName.test.ts`
- **Import**: `import { describe, it, expect, vi } from "vitest";`

Example:
```
xmlui/src/components-core/rendering/ComponentAdapter.tsx
xmlui/tests/components-core/rendering/ComponentAdapter.test.tsx
```

## Test Structure

**Use flat structure with single describe block:**

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

// Mock dependencies first
vi.mock("../path/to/dependency", () => ({
  useSomething: vi.fn(() => ({ value: "mocked" })),
}));

// Import component after mocks
import ComponentName from "../src/path/ComponentName";

// ============================================================================
// ComponentName Unit Tests
// ============================================================================

describe("ComponentName", () => {
  // ========================================================================
  // Category 1 Tests
  // ========================================================================

  it("test description", () => {
    // Test implementation
  });

  // ========================================================================
  // Category 2 Tests
  // ========================================================================

  it("another test", () => {
    // Test implementation
  });
});
```

**Key points:**
- Single `describe` block for component
- Section comments for organization
- No nested describes
- Mock dependencies before importing component

## Common Test Categories

Organize tests with section comments:

```typescript
// ========================================================================
// Props Normalization Tests
// ========================================================================

// ========================================================================
// Conditional Rendering Tests
// ========================================================================

// ========================================================================
// Lifecycle Events Tests
// ========================================================================

// ========================================================================
// State Management Tests
// ========================================================================

// ========================================================================
// Memoization Tests
// ========================================================================

// ========================================================================
// Error Handling Tests
// ========================================================================
```

## Mocking

### Mock Dependencies Before Import

```typescript
vi.mock("../../../src/components/ComponentRegistryContext", () => ({
  useComponentRegistry: vi.fn(() => ({
    lookupComponentRenderer: vi.fn().mockReturnValue({
      renderer: vi.fn().mockReturnValue(React.createElement("div", null, "Rendered")),
      descriptor: {},
      isCompoundComponent: false,
    }),
  })),
}));

// Import AFTER mocks
import ComponentAdapter from "../../../src/components-core/rendering/ComponentAdapter";
```

### Mock Functions

```typescript
// Return undefined (not Promise)
const lookupAction = vi.fn().mockReturnValue(undefined);

// Return function
const lookupAction = vi.fn().mockReturnValue(() => {});

// Return value
const dispatch = vi.fn();
```

**Important**: Use `mockReturnValue` not `mockResolvedValue` unless function actually returns Promise.

### Mock Utilities

```typescript
vi.mock("../../../src/components-core/utils/extractParam", () => ({
  extractParam: vi.fn((state, value) => value),
  shouldKeep: vi.fn((when) => when !== false),
}));
```

## Test Utilities

### Creating Mock Props

Create helper function for consistent test data:

```typescript
interface MockNode {
  type: string;
  uid?: string;
  props?: Record<string, any>;
  events?: Record<string, any>;
}

const createMockNode = (overrides?: Partial<MockNode>): MockNode => ({
  type: "MockComponent",
  uid: "test-component",
  props: {},
  events: {},
  ...overrides,
});

const createMockProps = (overrides?: Partial<Props>) => {
  return {
    node: createMockNode(),
    state: {},
    dispatch: vi.fn(),
    lookupAction: vi.fn().mockReturnValue(undefined),
    // ... other required props
    ...overrides,
  };
};
```

### Rendering

```typescript
import { render, waitFor } from "@testing-library/react";

// Basic render
render(<ComponentAdapter ref={null} {...props} />);

// Access container
const { container } = render(<ComponentAdapter {...props} />);
expect(container.firstChild).toBeVisible();

// Wait for async operations
await waitFor(() => {
  expect(props.node).toBeDefined();
});
```

## Test Patterns

### Props Normalization

```typescript
it("normalizes missing props property", async () => {
  const props = createMockProps({
    node: createMockNode({ props: undefined }),
  });

  render(<ComponentAdapter ref={null} {...props} />);

  await waitFor(() => {
    expect(props.node).toBeDefined();
  });
});
```

### Conditional Rendering

```typescript
it("does not render when when is false", () => {
  const props = createMockProps({
    node: createMockNode({ when: false }),
  });

  const { container } = render(<ComponentAdapter ref={null} {...props} />);

  expect(container.firstChild).toBeNull();
});
```

### Lifecycle Events

```typescript
it("calls onUnmount callback on component unmount", () => {
  const onUnmount = vi.fn();
  const props = createMockProps({ onUnmount });

  const { unmount } = render(<ComponentAdapter ref={null} {...props} />);
  unmount();

  expect(onUnmount).toHaveBeenCalled();
  const calledUid = onUnmount.mock.calls[0][0];
  expect(typeof calledUid).toBe("symbol");
});
```

### State Management

```typescript
it("extracts context variables from state", () => {
  const contextState = {
    "test-component": {},
    $theme: "dark",
    $user: { name: "John" },
    regularProp: "value",
  };

  const props = createMockProps({ state: contextState });

  render(<ComponentAdapter ref={null} {...props} />);

  expect(props.state.$theme).toBe("dark");
  expect(props.state.$user).toEqual({ name: "John" });
});
```

### Error Handling

```typescript
it("handles missing component type gracefully", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  const props = createMockProps({
    node: createMockNode({ type: "NonExistentComponent" }),
  });

  expect(() => {
    render(<ComponentAdapter ref={null} {...props} />);
  }).not.toThrow();

  consoleErrorSpy.mockRestore();
});
```

### Ref Forwarding

```typescript
it("accepts ref prop", () => {
  const ref = React.createRef<HTMLDivElement>();
  const props = createMockProps();

  render(<ComponentAdapter ref={ref} {...props} />);

  expect(ref).toBeDefined();
});
```

## Assertions

### Function Calls

```typescript
expect(onUnmount).toHaveBeenCalled();
expect(onUnmount).toHaveBeenCalledWith(expectedValue);
expect(dispatch).not.toHaveBeenCalled();

// Check call arguments
const calledUid = onUnmount.mock.calls[0][0];
expect(typeof calledUid).toBe("symbol");
```

### Values

```typescript
expect(props.node.props).toEqual(customProps);
expect(props.node.uid).toBe(testUid);
expect(container.firstChild).toBeNull();
expect(container.firstChild).not.toBeNull();
```

### Type Checks

```typescript
expect(typeof calledUid).toBe("symbol");
expect(Array.isArray(result)).toBe(true);
```

## Best Practices

### Mock Return Types

Match actual return types:

```typescript
// ✅ CORRECT - lookupAction returns function or undefined
lookupAction: vi.fn().mockReturnValue(undefined)

// ❌ INCORRECT - Returns Promise instead of function
lookupAction: vi.fn().mockResolvedValue(undefined)
```

### Refs for Mutable Objects

Use refs for objects that should persist across renders:

```typescript
const layoutContextRef = { current: undefined };
const memoedVarsRef = { current: new Map() };
const uidInfoRef = { current: [] };
```

### Avoid Over-Testing

Don't test:
- React internals
- Library behavior
- Visual rendering (use E2E)
- Full integration (use E2E)

Focus on:
- Component-specific logic
- Edge cases
- Error handling
- State transformations

### Test What Matters

```typescript
// ✅ CORRECT - Test component behavior
it("preserves existing props and events", () => {
  const customProps = { color: "red", size: "lg" };
  const props = createMockProps({
    node: createMockNode({ props: customProps }),
  });

  render(<ComponentAdapter ref={null} {...props} />);

  expect(props.node.props).toEqual(customProps);
});

// ❌ INCORRECT - Testing mock itself
it("mock returns correct value", () => {
  expect(createMockProps().dispatch).toBeDefined();
});
```

### Async Operations

Use `waitFor` for async operations:

```typescript
await waitFor(() => {
  expect(props.node).toBeDefined();
});
```

### Spy on Console

Suppress expected errors:

```typescript
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

// Test code that logs errors

consoleErrorSpy.mockRestore();
```

## Commands

Run from workspace root (`/Users/dotneteer/source/xmlui`):

```bash
# Run all tests
npx vitest

# Run specific test file
npx vitest ComponentAdapter.test.tsx

# Watch mode (recommended during development)
npx vitest ComponentAdapter.test.tsx --watch

# Run tests matching pattern
npx vitest ComponentAdapter.test.tsx -t "props normalization"

# Coverage
npx vitest --coverage

# UI mode
npx vitest --ui
```

## Test Naming

Use clear, specific names:

- ✅ `"normalizes missing props property"`
- ✅ `"calls onUnmount callback on component unmount"`
- ✅ `"extracts context variables from state"`
- ✅ `"handles missing component type gracefully"`
- ❌ `"test component"` or `"basic test"`

Avoid:
- Generic words like "component"
- Vague descriptions
- Implementation details over behavior

## When to Skip Unit Tests

Use E2E tests for:
- Full rendering pipeline
- User interactions (click, hover, keyboard)
- Visual layout and styling
- Event handler execution
- Complex component hierarchies
- Browser-specific behavior
- Accessibility testing
- Theme and behavior system

Unit tests are faster but limited. Choose the right tool for each scenario.
