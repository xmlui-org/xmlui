# XMLUI Testing Conventions — AI Reference

Authoritative reference for writing E2E and unit tests in the XMLUI monorepo. Follow these patterns exactly when creating or modifying tests.

---

## Two Test Types

| Type | Framework | When to use | Location |
|------|-----------|-------------|----------|
| **E2E** | Playwright + custom fixtures | Full component behavior, user interactions, accessibility, visual output, event firing | `xmlui/src/components/ComponentName/ComponentName.spec.ts` |
| **Unit** | Vitest + React Testing Library | Component-internal logic: props normalization, hook behavior, state transformations, memoization | `xmlui/tests/` (mirrors `src/` structure) |

Never use E2E for internal logic. Never use unit tests for rendering, interactions, or accessibility.

---

## E2E Testing

### File conventions

- **Location:** `xmlui/src/components/ComponentName/ComponentName.spec.ts` (same directory as source)
- **Fixture import:** `import { test, expect } from "../../testing/fixtures";`
- **Reference implementation:** `Checkbox.spec.ts` is the canonical example

### Test structure

```typescript
import { test, expect } from "../../testing/fixtures";
import { SKIP_REASON } from "../../testing/skip-reasons";

test.describe("ComponentName", () => {
  test.describe("Basic Functionality", () => { ... });
  test.describe("Accessibility", () => { ... });
  test.describe("Theme Variables", () => { ... });     // only if component has theme vars
  test.describe("Behaviors and Parts", () => { ... }); // only if component has behaviors/parts
  test.describe("Api", () => { ... });                 // only for input components
  test.describe("Other Edge Cases", () => { ... });
});
```

**Test categories (in order):**

1. **Basic Functionality** — props, events, methods, keyboard/mouse interactions
2. **Accessibility** — ARIA attributes, keyboard navigation, WCAG
3. **Theme Variables** — only for components that advertise theme variable support; use exact colors
4. **Behaviors and Parts** — only for components with behaviors or parts
5. **Api** — for input components: `value`, `setValue`, `focus`
6. **Other Edge Cases** — null/undefined, invalid inputs, edge conditions

### `initTestBed`

The primary fixture. Renders an XMLUI snippet in an isolated test page.

```typescript
// Basic
await initTestBed(`<ComponentName prop="value"/>`);

// With theme variables — always use exact CSS colors: "rgb(255, 0, 0)" not "red"
await initTestBed(`<ComponentName/>`, {
  testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" },
});

// With testState capture
const { testStateDriver } = await initTestBed(`
  <ComponentName onClick="testState = 'clicked'"/>
`);
```

### Clipboard

`initTestBed` returns a `clipboard` helper that provides a test-safe wrapper around the browser clipboard. It intercepts `navigator.clipboard` so tests work consistently without real browser permissions. Line endings are normalized to `\n` on all platforms (Windows Chromium returns `\r\n` from the real API).

```typescript
const { clipboard } = await initTestBed(`<ComponentName />`);
```

| Method | Description |
|--------|-------------|
| `clipboard.read()` | Returns the current clipboard text as a string (`\r\n` normalized to `\n`) |
| `clipboard.write(text)` | Writes `text` to the clipboard |
| `clipboard.clear()` | Clears the clipboard (writes empty string) |
| `clipboard.copy(locator)` | Focuses `locator`, selects all text, presses `ControlOrMeta+C` |
| `clipboard.paste(locator)` | Focuses `locator`, presses `ControlOrMeta+V` |

**Important:** only `writeText` / `readText` are mocked. Calling `navigator.clipboard.write()` or `navigator.clipboard.read()` (the binary variants) throws inside the test bed. Use `clipboard.read()` (not `page.evaluate(() => navigator.clipboard.readText())`) so line-ending normalization is applied.

```typescript
test("copies content to clipboard", async ({ initTestBed, page }) => {
  const { clipboard } = await initTestBed(
    `<Share markdownContent="# Hello\nWorld" />`,
    EXT,
  );
  await page.getByRole("button", { name: "Copy page" }).click();
  expect(await clipboard.read()).toBe("# Hello\nWorld");
});
```

### Event testing

Capture event results via `testState` context variable + `expect.poll()`:

```typescript
test("fires onClick", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Button onClick="testState = 'clicked'"/>
  `);
  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");
});
```

**Event handler rules:**
- Prefix with `on`: `onClick="..."` ✅ `click="..."` ❌
- Arrow functions for parameters: `onExpandedChange="arg => testState = arg"` ✅
- Do NOT use `arguments[0]`

### XMLUI scripting restrictions inside `initTestBed` strings

- **No `new` operator** — use `throw "error"` not `throw new Error("...")`
- **No `async`/`await`** — XMLUI handles async automatically; write operations sequentially
- **No `Promise` chains** — use `delay(ms)` for pauses, not `setTimeout`
- **Template properties require `<property>` wrapper:**

```xml
<!-- ✅ -->
<ComponentName>
  <property name="triggerTemplate">
    <Button>Trigger</Button>
  </property>
</ComponentName>

<!-- ❌ -->
<ComponentName>
  <triggerTemplate><Button>Trigger</Button></triggerTemplate>
</ComponentName>
```

### Locators

| Prefer | Avoid |
|--------|-------|
| `page.getByRole("button")` | `page.locator("button")` |
| `page.getByLabel("Email")` | `page.locator("input[type=email]")` |
| `page.getByTestId("x")` (last resort) | Raw `page.locator()` |

Use `testId` only when semantic locators are insufficient.

### Keyboard interactions — CRITICAL

Always verify focus is stable before pressing keys:

```typescript
// ✅ CORRECT
await element.focus();
await expect(element).toBeFocused();   // never skip this
await page.keyboard.press("Enter");

// ❌ INCORRECT — races under parallel execution
await element.focus();
await page.keyboard.press("Enter");
```

- Never use `{ delay: X }` workarounds — add explicit `toBeFocused()` / `toBeVisible()` waits
- For multi-input components, wait for ALL inputs to be visible before interacting
- For sequential arrow-key navigation, confirm focus after each step before the next

### Click interactions

Wait for elements to be visible before clicking, especially immediately after `initTestBed()`:

```typescript
await initTestBed(`<DatePicker testId="dp" />`);
await expect(page.getByTestId("dp")).toBeVisible();  // ✅ always wait
await page.getByTestId("dp").click();
```

**CSS pseudo-classes cannot be tested with `.toHaveCSS()`** — Playwright `.hover()` triggers JavaScript hover events but not CSS `:hover`/`:focus`/`:active`. Test the functional outcome instead (e.g., tooltip appearing).

### Component drivers

For complex component interactions, use typed drivers instead of raw Playwright:

```typescript
test("filter options", async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`<Select searchable="true">...</Select>`);
  const driver = await createSelectDriver(page.getByRole("combobox"));
  await driver.searchFor("second");
  await driver.chooseFirstOption();
});
```

Drivers return locators for assertions. Never put `expect()` calls inside a driver. Only create a driver when raw Playwright is insufficient.

### API interceptor (mock backend)

```typescript
const mockBackend: ApiInterceptorDefinition = {
  "initialize": "$state.count = 0; $state.items = [];",
  "operations": {
    "create": {
      "url": "/api/items", "method": "post",
      "handler": "$state.items.push({ id: $state.items.length + 1 }); return { id: $state.items.length };"
    },
    "list": {
      "url": "/api/items", "method": "get",
      "handler": "return { items: $state.items };"
    }
  }
};
```

Handler context variables: `$state`, `$body`, `$params`, `$query`. Each test gets a fresh `$state`.

Use `$state` (not `globalThis`) to share state across operation handlers.

### Non-visual components

Access APIs through Button click handlers, not script tags:

```xml
<!-- ✅ -->
<Fragment>
  <Queue id="q" />
  <Button onClick="testState = q.enqueueItem('x')" />
</Fragment>
```

### Behaviors and parts testing

```typescript
test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" tooltip="Tip text" />`);
    await page.getByTestId("test").hover();
    await expect(page.getByRole("tooltip")).toHaveText("Tip text");
  });

  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" variant="V" />`, {
      testThemeVars: { "borderColor-ComponentName-V": "rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });
});
```

### Layout spacing reference

`space-N` = `N × 0.25rem`. Example: `space-4` → `1rem` → `16px` at default font size.

- Gap + percentage sizing can overflow (sum may exceed container)
- Gap + star sizing (`*`) does not overflow (star accounts for gaps)

### Test naming

Avoid the word "component":
- ✅ `"renders with 'variant' property"`, `"fires onClick when clicked"`
- ❌ `"test component"`, `"basic component test"`

### Skipping tests

```typescript
// Placeholder for later implementation:
test.skip("placeholder text", async ({ initTestBed, page }) => {});

// Known bug or unimplemented feature:
test.fixme(
  "label on autocomplete",
  SKIP_REASON.XMLUI_BUG("Two labels from nested component cause error"),
  async ({ initTestBed, page }) => { ... }
);
```

### Parallel execution verification

Always verify with `--workers=10` before declaring tests done:

```bash
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line  # development
npx playwright test ComponentName.spec.ts --workers=10                  # stability check
```

Tests that pass at `--workers=1` but fail at `--workers=10` almost always have a missing `toBeFocused()` or `toBeVisible()` wait.

---

## Unit Testing

### When to use

Use for component-**internal** logic only:
- Props normalization and transformation
- Hook behavior and custom hooks
- State transformations
- Memoization correctness
- Error boundaries

**Never use unit tests for:** full rendering, user interactions, visual layout, event execution, accessibility — use E2E instead.

### File conventions

Mirror the source structure under `xmlui/tests/`:

```
xmlui/src/components-core/rendering/ComponentAdapter.tsx
xmlui/tests/components-core/rendering/ComponentAdapter.test.tsx
```

File naming: `ComponentName.test.tsx` or `ComponentName.test.ts`  
Import: `import { describe, it, expect, vi } from "vitest";`

### Test structure

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

// 1. Mock dependencies FIRST — before importing the component under test
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

### Mocking

```typescript
// Mock a module
vi.mock("../../../src/components/SomeContext", () => ({
  useSomething: vi.fn(() => ({ value: "mocked" })),
}));

// Mock a function returning a value (not a Promise)
const lookupAction = vi.fn().mockReturnValue(undefined);

// Mock a function returning a function
const lookupAction = vi.fn().mockReturnValue(() => {});
```

Use `mockReturnValue` not `mockResolvedValue` unless the function actually returns a Promise.

### Test props helper pattern

```typescript
const createMockProps = (overrides?: Partial<Props>) => ({
  node: { type: "MockComponent", uid: "test-id", props: {}, events: {} },
  state: {},
  dispatch: vi.fn(),
  lookupAction: vi.fn().mockReturnValue(undefined),
  ...overrides,
});
```

### Running unit tests

```bash
# Run specific test file (watch mode during development)
npx vitest ComponentAdapter.test.tsx --watch

# Run tests matching a pattern
npx vitest ComponentAdapter.test.tsx -t "props normalization"

# Run all unit tests in the xmlui package
npm run test:unit -w xmlui

# From workspace root
npx turbo run xmlui#test:unit
```

### What NOT to test in unit tests

- React internals or library behavior
- Visual rendering or layout (use E2E)
- Full integration scenarios (use E2E)
- That a mock returns what you configured it to return

---

## Running All Tests

```bash
# From workspace root:

# Full test suite (unit + E2E)
npm run test

# Smoke E2E tests only + unit tests
npm run test-smoke

# E2E with dev server (fastest iteration)
npm run test-e2e-dev

# E2E with pre-built server (CI mode)
npm run test:e2e

# Smoke E2E only (no unit tests)
npm run test:e2e:smoke

# From xmlui/ directory:
npm run test:unit              # Unit tests only
npm run test:e2e-smoke         # E2E smoke
npm run test:e2e-non-smoke     # Full E2E
```

---

## Key Files

| File | Role |
|------|------|
| `xmlui/src/testing/fixtures/` | Playwright fixture definitions (`initTestBed`, drivers) |
| `xmlui/src/testing/skip-reasons.ts` | `SKIP_REASON` constants for `test.fixme()` |
| `xmlui/src/components/Checkbox/Checkbox.spec.ts` | Canonical E2E reference |
| `xmlui/tests/` | Unit test directory (mirrors `src/`) |
| `playwright.config.ts` | E2E test runner config, project definitions |
| `vitest.workspace.ts` | Vitest workspace configuration |
| `xmlui/src/testing/infrastructure/` | Test bed app (serves E2E tests) |
