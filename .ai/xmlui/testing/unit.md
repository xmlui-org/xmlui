# Conventions: XMLUI Unit Testing

Unit tests use Vitest + React Testing Library. Run from the workspace root.

## When to Use Unit Tests

Use for component-**internal** logic: props normalization, memoization, hook behavior, state transformations, error boundaries.

**NOT for**: full rendering, user interactions, visual layout, event execution, accessibility — use E2E tests instead.

## File Organization

Mirror the source structure under `xmlui/tests/`:

```
xmlui/src/components-core/rendering/ComponentAdapter.tsx
xmlui/tests/components-core/rendering/ComponentAdapter.test.tsx
```

File naming: `ComponentName.test.tsx` or `ComponentName.test.ts`.
Import: `import { describe, it, expect, vi } from "vitest";`

## Test Structure

Single `describe` block for the component. Use section comments for organization. Mock dependencies **before** importing the component under test.

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

// 1. Mock dependencies first
vi.mock("../path/to/dependency", () => ({
  useSomething: vi.fn(() => ({ value: "mocked" })),
}));

// 2. Import component AFTER mocks
import ComponentAdapter from "../src/path/ComponentAdapter";

describe("ComponentAdapter", () => {
  // ========================================================================
  // Props Normalization
  // ========================================================================

  it("normalizes missing props", async () => { ... });

  // ========================================================================
  // Lifecycle Events
  // ========================================================================

  it("calls onUnmount on unmount", () => { ... });
});
```

## Mocking

```typescript
// Mock a module
vi.mock("../../../src/components/SomeContext", () => ({
  useSomething: vi.fn(() => ({ value: "mocked" })),
}));

// Mock function returning a value (not a Promise)
const lookupAction = vi.fn().mockReturnValue(undefined);

// Mock function returning a function
const lookupAction = vi.fn().mockReturnValue(() => {});
```

Use `mockReturnValue` not `mockResolvedValue` unless the function actually returns a Promise.

## Creating Test Props

Helper functions keep test data consistent:

```typescript
const createMockProps = (overrides?: Partial<Props>) => ({
  node: { type: "MockComponent", uid: "test-id", props: {}, events: {} },
  state: {},
  dispatch: vi.fn(),
  lookupAction: vi.fn().mockReturnValue(undefined),
  ...overrides,
});
```

## Commands

Run from workspace root (`/Users/dotneteer/source/xmlui`):

```bash
# Run specific test file (watch mode recommended during development)
npx vitest ComponentAdapter.test.tsx --watch

# Run tests matching a pattern
npx vitest ComponentAdapter.test.tsx -t "props normalization"

# Run all unit tests
npm run test:unit -w xmlui
```

## What NOT to Test

Avoid testing:
- React internals or library behavior
- Visual rendering or layout (use E2E)
- Full integration scenarios (use E2E)
- That a mock returns what you configured it to return
