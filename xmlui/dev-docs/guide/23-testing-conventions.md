# 23 — Testing Conventions

## Why This Matters

XMLUI has ~100 built-in components, each with props, events, APIs, theme variables, and behaviors to verify. The test infrastructure provides a tight loop: write XMLUI markup as a string, render it in a real browser via Playwright, and assert on the result. Knowing the rules of this system — when to use E2E vs unit tests, how `initTestBed` works, which locator patterns are stable — prevents flaky tests and wasted debugging time.

---

## Table of Contents

1. [Two Test Types](#two-test-types)
2. [E2E Testing with Playwright](#e2e-testing-with-playwright)
3. [Unit Testing with Vitest](#unit-testing-with-vitest)
4. [Running Tests](#running-tests)
5. [Key Files](#key-files)
6. [Key Takeaways](#key-takeaways)

---

## Two Test Types

XMLUI uses two test frameworks for different purposes:

| Type | Framework | Purpose |
|------|-----------|---------|
| **E2E** | Playwright + custom fixtures | Component behavior, user interactions, accessibility, event firing, visual output |
| **Unit** | Vitest + React Testing Library | Internal logic: props normalization, hook behavior, state transformations |

The division is strict. E2E tests go through a real browser rendering XMLUI markup. Unit tests run in jsdom with mocked dependencies. Never use a unit test to assert that a component renders correctly — that belongs in E2E. Never use an E2E test to verify a normalization algorithm — that belongs in unit tests.

---

## E2E Testing with Playwright

### File conventions

E2E test files live alongside their component source:

```
xmlui/src/components/Button/
  Button.tsx
  ButtonNative.tsx
  Button.spec.ts       ← E2E tests here
```

Import fixtures from the shared fixture module:

```typescript
import { test, expect } from "../../testing/fixtures";
```

The canonical reference implementation is `Checkbox.spec.ts` — read it before writing a new spec.

### Test structure and categories

Every spec file wraps all tests in a single `test.describe("ComponentName")`. Inside, tests are grouped into these sections (only include sections that are relevant to the component):

```typescript
test.describe("ComponentName", () => {
  test.describe("Basic Functionality", () => {
    // Props, events, default values, rendering
  });

  test.describe("Accessibility", () => {
    // ARIA attributes, keyboard navigation
  });

  test.describe("Theme Variables", () => {
    // Only if the component exposes theme variables
  });

  test.describe("Behaviors and Parts", () => {
    // Only if the component uses behaviors (tooltip, variant, etc.)
  });

  test.describe("Api", () => {
    // Only for input components: value, setValue, focus
  });

  test.describe("Other Edge Cases", () => {
    // Null/undefined, invalid inputs, boundary conditions
  });
});
```

### The `initTestBed` fixture

`initTestBed` is the core testing primitive. It renders XMLUI markup in an isolated browser page and returns handles for assertions.

```typescript
// Minimal usage
await initTestBed(`<Button label="Click me"/>`);

// With theme variable overrides — use exact CSS color strings
await initTestBed(`<Button/>`, {
  testThemeVars: {
    "backgroundColor-Button": "rgb(255, 0, 0)",   // ✅ exact
    // "backgroundColor-Button": "red",            // ❌ won't match
  },
});

// Capturing event results
const { testStateDriver } = await initTestBed(`
  <Button onClick="testState = 'clicked'"/>
`);
```

Always read the component's `.tsx` metadata file before writing tests — use the actual documented theme variable names, not guesses.

### Testing events with `testState`

XMLUI provides a `testState` context variable that tests can write to from event handlers. After triggering the event, use `expect.poll()` to wait for the value to settle:

```typescript
test("fires onClick when clicked", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Button onClick="testState = 'clicked'"/>
  `);
  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");
});
```

Event handler rules:
- Always prefix with `on`: `onClick` ✅ `click` ❌
- Use arrow functions for event arguments: `onExpandedChange="arg => testState = arg"` ✅
- Do NOT use `arguments[0]` — the XMLUI scripting language does not support it

### XMLUI scripting restrictions in test strings

The XMLUI scripting language is a JavaScript subset. Several constructs are not available and will silently fail or throw:

**No `new` operator:**
```
throw "error"               // ✅
throw new Error("error")    // ❌ not supported
```

**No `async`/`await`:**
```
// ✅ Write operations sequentially — XMLUI handles async automatically
<Button onClick="let r = api.execute(); delay(100); testState = r;" />

// ❌ Not supported
<Button onClick="const r = await api.execute(); testState = r;" />
```

**No `Promise` chains** — use `delay(ms)` for pauses.

**Template properties must use `<property>` wrapper syntax:**

```xml
<!-- ✅ Correct -->
<ComponentName>
  <property name="triggerTemplate">
    <Button>Trigger</Button>
  </property>
</ComponentName>

<!-- ❌ Wrong — looks plausible but doesn't work -->
<ComponentName>
  <triggerTemplate><Button>Trigger</Button></triggerTemplate>
</ComponentName>
```

### Locator strategy

Prefer locators that reflect user-visible semantics:

```typescript
// In order of preference:
page.getByRole("button", { name: "Submit" })  // 1st choice
page.getByLabel("Email address")               // for form inputs
page.getByText("Hello")                        // for text content
page.getByTestId("submit-btn")                 // last resort only

// Avoid:
page.locator("button.submit")                  // too implementation-specific
page.locator("[data-testid=submit-btn]")        // use getByTestId instead
```

Use `testId` prop on the XMLUI component (becomes `data-testid` in the DOM) only when no semantic locator exists.

### Keyboard interaction — the most common source of flakiness

Always confirm focus *before* pressing keys. Omitting the `toBeFocused()` check is the most common cause of tests that pass at low worker counts but fail under parallel execution:

```typescript
// ✅ Correct
await element.focus();
await expect(element).toBeFocused();    // Do not skip this
await page.keyboard.press("ArrowDown");

// ❌ Races when running with --workers=10
await element.focus();
await page.keyboard.press("ArrowDown");
```

Additional rules:
- Never use `{ delay: X }` workarounds — fix the root cause with proper waits
- For multi-input components, wait for ALL inputs to be visible before interacting
- For sequential arrow-key navigation, confirm each step's focus before the next keypress

### Click interactions

Always wait for elements to be visible before clicking, especially immediately after `initTestBed()`:

```typescript
await initTestBed(`<DatePicker testId="dp"/>`);
await expect(page.getByTestId("dp")).toBeVisible();   // always wait first
await page.getByTestId("dp").click();
```

**CSS pseudo-classes cannot be asserted with `.toHaveCSS()`** — Playwright's `.hover()` triggers JavaScript hover events but not CSS `:hover`, `:focus`, or `:active`. Instead, test the functional outcome (e.g., that a tooltip appeared, that a hover style was applied via a JavaScript class change).

### Component drivers

For components with complex interaction patterns, typed drivers encapsulate the interaction mechanics so tests stay readable:

```typescript
test("filters options", async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`<Select searchable="true">...</Select>`);
  const driver = await createSelectDriver(page.getByRole("combobox"));
  await driver.searchFor("second");
  await driver.chooseFirstOption();
  // Assertions go here, not inside the driver
  await expect(page.getByRole("option", { selected: true })).toHaveText("Second");
});
```

Two rules for drivers:
1. Drivers return locators for assertions — never put `expect()` calls inside a driver
2. Only create a driver when raw Playwright interactions become unwieldy

### Mock API backends

Tests that exercise data fetching use the `ApiInterceptorDefinition` pattern:

```typescript
const mockBackend: ApiInterceptorDefinition = {
  "initialize": "$state.items = [];",
  "operations": {
    "list": {
      "url": "/api/items", "method": "get",
      "handler": "return { items: $state.items };"
    },
    "create": {
      "url": "/api/items", "method": "post",
      "handler": "$state.items.push($body); return $body;"
    }
  }
};
```

Handler context variables: `$state`, `$body`, `$params`, `$query`. Each test run starts with a fresh `$state` — use it (not `globalThis`) to share state across operations within a test.

### Non-visual component testing

Components without a visual DOM representation (queues, timers, etc.) are accessed through event handlers on a visible component:

```xml
<!-- ✅ Drive non-visual APIs through click handlers -->
<Fragment>
  <Queue id="q" />
  <Button onClick="testState = q.enqueueItem('x')" />
</Fragment>

<!-- ❌ Script tags don't work for this -->
```

### Behaviors and parts

Test behavior-provided features (tooltip, variant, animation) under `"Behaviors and Parts"`:

```typescript
test("handles tooltip", async ({ page, initTestBed }) => {
  await initTestBed(`<Button testId="btn" tooltip="Submit the form" />`);
  await page.getByTestId("btn").hover();
  await expect(page.getByRole("tooltip")).toHaveText("Submit the form");
});

test("applies custom theme via variant", async ({ page, initTestBed }) => {
  await initTestBed(`<Button testId="btn" variant="Danger" />`, {
    testThemeVars: { "backgroundColor-Button-Danger": "rgb(220, 53, 69)" },
  });
  await expect(page.getByTestId("btn")).toHaveCSS("background-color", "rgb(220, 53, 69)");
});
```

### Layout spacing reference

When asserting on spacing values: `space-N` = `N × 0.25rem`. At the default 16px font size, `space-4` = `1rem` = `16px`.

- Gap + percentage sizing **can** overflow (the percentages don't account for gaps)
- Gap + star sizing (`*`) **cannot** overflow (star allocation already deducts gap)

### Test naming

Don't use "component" as a noun in test names:

```typescript
// ✅
"renders with 'disabled' property"
"fires onClick when clicked"
"applies 'variant' theme class"

// ❌
"test component renders"
"basic component test"
"tests the button component"
```

### Skipping tests

```typescript
// Placeholder — will implement later
test.skip("some future behavior", async ({ initTestBed, page }) => {});

// Known bug or unimplemented feature
test.fixme(
  "label renders correctly on autocomplete",
  SKIP_REASON.XMLUI_BUG("Nested labels cause duplicate label error"),
  async ({ initTestBed, page }) => { ... }
);
```

### Parallel execution validation

Always run with `--workers=10` before declaring tests complete:

```bash
# During development (single worker for easy debugging)
npx playwright test Button.spec.ts --workers=1 --reporter=line

# Before committing — must pass
npx playwright test Button.spec.ts --workers=10
```

Tests that pass at `--workers=1` but fail at `--workers=10` almost always have a missing `toBeFocused()` or `toBeVisible()` wait. For throttle/debounce tests, it's usually a missing range assertion.

---

## Unit Testing with Vitest

### When to use unit tests

Unit tests cover component-**internal** logic that doesn't require a browser:

- Props normalization (e.g., converting string "true" to boolean `true`)
- Custom hook behavior
- State transformation functions
- Memoization correctness
- Error boundary behavior

**Not appropriate for unit tests:** full component rendering, user interactions, visual layout, event execution, accessibility. Use E2E instead.

### File conventions

Unit test files live in `xmlui/tests/`, mirroring the source structure:

```
xmlui/src/components-core/rendering/ComponentAdapter.tsx
xmlui/tests/components-core/rendering/ComponentAdapter.test.tsx
```

File naming: `ComponentName.test.tsx` or `ComponentName.test.ts`.

### Test structure

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";

// Step 1: Mock dependencies BEFORE importing the module under test
vi.mock("../path/to/dependency", () => ({
  useSomething: vi.fn(() => ({ value: "mocked" })),
}));

// Step 2: Import the module AFTER all mocks are set up
import ComponentAdapter from "../src/path/ComponentAdapter";

describe("ComponentAdapter", () => {
  // ===================================================================
  // Props Normalization
  // ===================================================================
  it("normalizes missing props to defaults", async () => {
    // ...
  });

  // ===================================================================
  // Lifecycle Events
  // ===================================================================
  it("calls onUnmount when unmounted", () => {
    // ...
  });
});
```

Mock ordering is critical — Vitest hoists `vi.mock()` calls, but importing the module before mocks are configured can cause test pollution.

### Mocking patterns

```typescript
// Mock an entire module
vi.mock("../../../src/components/SomeContext", () => ({
  useSomething: vi.fn(() => ({ value: "mocked" })),
}));

// Function returning a plain value
const dispatch = vi.fn().mockReturnValue(undefined);

// Function returning another function
const lookupAction = vi.fn().mockReturnValue(() => "result");
```

Use `mockReturnValue`, not `mockResolvedValue`, unless the function actually returns a Promise.

### Test props helper

Create factory functions to reduce boilerplate and centralize defaults:

```typescript
const createMockProps = (overrides?: Partial<ComponentProps>) => ({
  node: { type: "TestComponent", uid: "test-uid", props: {}, events: {} },
  state: {},
  dispatch: vi.fn(),
  lookupAction: vi.fn().mockReturnValue(undefined),
  ...overrides,
});
```

---

## Running Tests

### Commands

From the workspace root:

```bash
npm run test               # Full suite: unit + E2E
npm run test-smoke         # Smoke E2E + unit tests
npm run test-e2e-dev       # E2E using dev server (fastest for development)
npm run test:e2e           # E2E with pre-built test server
npm run test:e2e:smoke     # Smoke E2E only
```

From `xmlui/`:

```bash
npm run test:unit          # Unit tests only
npm run test:e2e-smoke     # E2E smoke tests
npm run test:e2e-non-smoke # Full E2E suite
npm run start-test-bed     # Start the test bed server manually
```

Direct Playwright:

```bash
npx playwright test Button.spec.ts --workers=1   # Single file, single worker
npx playwright test Button.spec.ts --workers=10  # Parallel stability check
npx playwright test --project=*-smoke            # Smoke tests only
```

Direct Vitest:

```bash
npx vitest ComponentAdapter.test.tsx --watch     # Watch mode
npx vitest ComponentAdapter.test.tsx -t "normalizes"  # Filter by name
```

---

## Key Files

| File | Role |
|------|------|
| `xmlui/src/testing/fixtures/` | Playwright fixture definitions (`initTestBed`, component drivers) |
| `xmlui/src/testing/skip-reasons.ts` | `SKIP_REASON` constants for `test.fixme()` |
| `xmlui/src/components/Checkbox/Checkbox.spec.ts` | Canonical E2E reference implementation |
| `xmlui/tests/` | Unit test directory, mirrors `src/` structure |
| `playwright.config.ts` | Playwright config: projects, workers, base URL |
| `vitest.workspace.ts` | Vitest workspace configuration |
| `xmlui/src/testing/infrastructure/` | The test bed application served during E2E tests |

---

## Key Takeaways

- **E2E for behavior, unit for logic.** Rendering, interactions, accessibility, and events belong in E2E (Playwright). Props normalization, hooks, and state transformations belong in unit tests (Vitest). Never mix these concerns.
- **`initTestBed` is the E2E entry point.** It renders XMLUI markup in a real browser page. Read the component's `.tsx` file for exact theme variable names before writing theme tests.
- **`testState` + `expect.poll()` is the event testing pattern.** Write to `testState` in event handlers; poll it after triggering the event. Never use `setTimeout` to wait for events.
- **Always confirm focus before pressing keys.** Missing `toBeFocused()` is the #1 cause of tests that pass at `--workers=1` and fail at `--workers=10`. Do not skip this check.
- **Wait for elements to be visible before clicking.** Immediately after `initTestBed()`, elements may not yet be in the DOM. `await expect(el).toBeVisible()` before `.click()`.
- **Template properties need `<property>` wrapper.** Using tag-based syntax (`<myTemplate>`) silently fails. Always use `<property name="myTemplate">`.
- **Mock before import in unit tests.** Vitest hoists `vi.mock()`, but importing the module before mocks are configured causes test pollution.
- **Verify parallel safety.** Run with `--workers=10` before committing. Flakiness at high worker counts always has a root cause — find and fix it rather than adding delays.
- **`Checkbox.spec.ts` is the canonical reference.** When in doubt about structure, naming, or patterns, read this file.
