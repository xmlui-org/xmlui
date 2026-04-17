---
agent: agent
description: Add or expand Playwright E2E tests for an XMLUI component
---

# Add E2E Tests

## Before starting

1. Read `feature.md` at the repo root — if it specifies which component to test and any focus areas.
2. Read `guidelines.md` at the repo root — focus on rules from Topics 23, 24.
3. Read these reference files:
   - `.ai/xmlui/testing-conventions.md` — E2E patterns, `initTestBed`, locators, event testing (always)
   - `.ai/xmlui/accessibility.md` — accessibility test patterns (always for interactive components)
   - `.ai/xmlui/testing-conventions.md` — detailed E2E conventions (if more detail needed)
4. Read the component's source and existing tests:
   - `ComponentName.tsx` — metadata (lists all props, events, APIs to test)
   - `ComponentNameNative.tsx` — implementation details
   - `ComponentName.spec.ts` — existing tests (may not exist yet)
5. If the component has a driver, read it: `ComponentName.driver.ts`

## Implementation steps

### Step 1 — Assess current coverage

Read `ComponentName.tsx` metadata and list every:
- Prop (test each with a meaningful value)
- Event (test each fires correctly)
- API method (test each via `testState`)
- Context variable (test each is accessible from child)

Compare against `ComponentName.spec.ts`. Identify untested areas.

### Step 2 — Create or extend the spec file

If no spec file exists, create `ComponentName.spec.ts` with the standard structure:

```typescript
import { test, expect } from "../../testing/fixtures";

// BASIC TESTS

test.describe("ComponentName - Basic", () => {
  test("renders with default props", async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName testId="test-id-component">content</ComponentName>`);
    const component = page.getByTestId("test-id-component");
    await expect(component).toBeVisible();
  });
});

// PROP TESTS

test.describe("ComponentName - Props", () => {
  // One test per prop
});

// EVENT TESTS

test.describe("ComponentName - Events", () => {
  // One test per event using testState + expect.poll
});

// API TESTS

test.describe("ComponentName - APIs", () => {
  // One test per API method using testState
});

// ACCESSIBILITY TESTS

test.describe("Accessibility", () => {
  // ARIA attributes, keyboard operability, focus management
});
```

### Step 3 — Write prop tests

For each prop, test that the component responds correctly:

```typescript
test("applies <propName> correctly", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName propName="value" testId="test-id-component" />`);
  const component = page.getByTestId("test-id-component");
  // Assert the visual or behavioral effect of the prop
});
```

### Step 4 — Write event tests

Use `testState` + `expect.poll` pattern:

```typescript
test("fires <eventName> on interaction", async ({ initTestBed, page }) => {
  await initTestBed(`
    <ComponentName
      testId="test-id-component"
      onEventName="{setState('eventFired', 'yes')}"
    />
  `);
  const component = page.getByTestId("test-id-component");
  await component.click(); // or other trigger
  await expect.poll(() => page.evaluate(() => window.testState?.eventFired)).toBe("yes");
});
```

### Step 5 — Write accessibility tests

```typescript
test.describe("Accessibility", () => {
  test("has correct ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName testId="test-id-component">Content</ComponentName>`);
    const el = page.getByTestId("test-id-component");
    // Check roles, aria-* attributes, tabindex
  });

  test("is keyboard operable", async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName testId="test-id-component">Content</ComponentName>`);
    const el = page.getByTestId("test-id-component");
    await el.focus();
    await expect(el).toBeFocused();
    await page.keyboard.press("Enter");
    // Assert expected behavior
  });
});
```

### Step 6 — Verify

```bash
# Run the new tests
npx playwright test ComponentName.spec.ts --reporter=line

# Verify parallel stability
npx playwright test ComponentName.spec.ts --workers=10
```

## Key patterns

- **Always `toBeFocused()` before keyboard presses** — the #1 cause of flaky tests
- **Use `expect.poll()` for async state** — never `waitForTimeout()`
- **Prefer `getByRole()` and `getByTestId()`** over CSS selectors
- **One assertion focus per test** — test one behavior, not everything at once
- **Use component drivers** when multiple tests need the same locator setup

## Commands

```bash
# Run specific test
npx playwright test ComponentName.spec.ts -g "test name" --reporter=line

# Run all component tests
npx playwright test ComponentName.spec.ts --reporter=line

# Parallel stability check
npx playwright test ComponentName.spec.ts --workers=10
```
