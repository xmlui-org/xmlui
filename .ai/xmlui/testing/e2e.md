# Conventions: XMLUI E2E Testing

E2E tests use Playwright via the custom fixtures from `../../testing/fixtures`.

## File Conventions

- **Location**: Same directory as the component implementation (`xmlui/src/components/ComponentName/`)
- **Naming**: `ComponentName.spec.ts`
- **Import**: `import { test, expect } from "../../testing/fixtures";`

`Checkbox.spec.ts` is the best reference for overall test patterns.

## Test Categories

Group tests with `test.describe` — no top-level wrapper needed:

1. **Basic Functionality** — properties, events, methods, keyboard/mouse interactions
2. **Accessibility** — ARIA attributes, keyboard navigation, WCAG
3. **Theme Variables** — only for components that advertise theme variable support
4. **Behaviors and Parts** — only for components with behaviors or parts
5. **Other Edge Cases** — null/undefined values, invalid inputs, edge conditions

## initTestBed

```typescript
// Basic
await initTestBed(`<ComponentName prop="value"/>`);

// With theme variables — always use exact colors: "rgb(255, 0, 0)" not "red"
await initTestBed(`<ComponentName/>`, {
  testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" },
});

// With event state capture
const { testStateDriver } = await initTestBed(`
  <ComponentName onClick="testState = 'clicked'"/>
`);
```

Read the component's `.tsx` metadata file before writing tests — use documented theme variable names, not guesses.

## Event Testing

Capture event results via `testState` and poll:

```typescript
test("fires onClick", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`
    <Button onClick="testState = 'clicked'"/>
  `);
  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");
});
```

Event handler rules:
- Prefix with `on`: `onClick="..."` ✅  `click="..."` ❌
- Use arrow functions for parameters: `onExpandedChange="arg => testState = arg"` ✅
- Do NOT use `arguments[0]`

## XMLUI Script Limitations (in initTestBed strings)

See `.ai/xmlui/markup.md` → *Scripting Language Semantics* for the full reference. Key rules for test strings:

**No `new` operator:**
```
throw "error"              // ✅
throw new Error("...")     // ❌
```

**No `async`/`await`** — XMLUI handles async automatically. Write sequential operations in order:
```
// ✅
<Button onClick="let r = api.execute(); delay(100); testState = r;" />
// ❌
<Button onClick="await api.execute();" />
```

Use `delay(ms)` not `setTimeout`. No `Promise` chains.

**Template properties use `<property>` wrapper:**
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

## APIInterceptor State

Use `$state` (not `globalThis`) to share state across API operation handlers:

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

Available handler context variables: `$state`, `$body`, `$params`, `$query`. Each test gets a fresh `$state`.

## Non-Visual Components

Access APIs through Button click handlers — not script tags:

```xml
<!-- ✅ -->
<Fragment>
  <Queue id="q" />
  <Button onClick="testState = q.enqueueItem('x')" />
</Fragment>
```

## Locators

Prefer semantic locators:
- `page.getByRole("button")` over `page.locator("button")`
- `page.getByLabel("Email")` over `page.locator("input[type=email]")`
- Use `testId` only when semantic locators are insufficient
- Avoid raw `page.locator()` in tests

## Component Drivers

For complex component-specific interactions use typed drivers instead of raw Playwright:

```typescript
test("filter options", async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`<Select searchable="true">...</Select>`);
  const driver = await createSelectDriver(page.getByRole("combobox"));
  await driver.searchFor("second");
  await driver.chooseFirstOption();
});
```

Drivers return locators for assertions — no expectations inside drivers. Only create a driver when raw Playwright is insufficient.

## Keyboard Interaction

**CRITICAL**: Always verify focus is stable before pressing keys. Without this, tests fail under parallel execution.

```typescript
// ✅ CORRECT
await element.focus();
await expect(element).toBeFocused();   // verify — do not skip this
await page.keyboard.press("Enter");

// ❌ INCORRECT
await element.focus();
await page.keyboard.press("Enter");    // may fire before focus settles
```

- Never use `{ delay: X }` workarounds — add proper `toBeFocused()` / `toBeVisible()` checks instead
- For multi-input components, wait for ALL inputs to be visible before interacting
- For sequential arrow-key navigation, confirm each step's focus before the next press

## Click Interactions

Wait for elements to be visible before clicking, especially immediately after `initTestBed()`:

```typescript
await initTestBed(`<DatePicker testId="dp" />`);
await expect(page.getByTestId("dp")).toBeVisible();   // ✅ wait first
await page.getByTestId("dp").click();
```

**CSS pseudo-classes cannot be tested with `.toHaveCSS()`** — Playwright `.hover()` triggers JS but not CSS `:hover`/`:focus`/`:active`. Test the functional outcome instead (e.g., tooltip appearing).

## Behaviors and Parts

### Behaviors

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

Common behaviors: `tooltipBehavior` (`tooltip`/`tooltipMarkdown`), `variantBehavior` (`variant`), `animationBehavior` (`animation`).

### Parts

Parts use `[data-part-id='name']` selectors. Check `ComponentNameNative.tsx` for actual `partId` values (may differ from metadata).

```typescript
const part = page.getByTestId("test").locator("[data-part-id='icon']");
await expect(part).toBeVisible();
```

**Parts that wrap the testId element**: Select without testId scoping:

```typescript
// When the part is an ANCESTOR of the testId element use page-level selection:
const wrapper = page.locator("[data-part-id='listWrapper']");
const inputPart = page.locator("[data-part-id='input']");
```

Use `.first()` if multiple instances exist: `page.locator("[data-part-id='name']").first()`.

## Throttle/Debounce Testing

Use range assertions — exact counts are unreliable with parallel workers and in CI:

```typescript
// ❌ — exact count breaks under CPU contention
await expect.poll(testState).toMatchObject({ count: 2 });

// ✅ — verify throttle reduced calls without asserting exact count
const before = (await testStateDriver.testState()).count;
await input.pressSequentially("aaaaaa", { delay: 10 });
await page.waitForTimeout(1200);  // extra margin for CI
const after = (await testStateDriver.testState()).count;
expect(after).toBeGreaterThan(before);  // throttle fired
expect(after).toBeLessThan(10);         // but not every character
```

## Layout Testing

Use `getBounds` from `"../../testing/component-test-helpers"`:

```typescript
import { getBounds } from "../../testing/component-test-helpers";

const { right: item1Right } = await getBounds(page.getByTestId("item1"));
const { left: item2Left }   = await getBounds(page.getByTestId("item2"));

// Always toBeCloseTo — not toEqual — for pixel math (sub-pixel rendering)
expect(item2Left - item1Right).toBeCloseTo(16, 0);
```

Spacing variables: `space-N` = `N × 0.25rem`. E.g. `space-4` → `1rem` → `16px` at default font size.

**Gap + percentage sizing overflows** (sum can exceed container); **gap + star sizing (`*`) does not** (star accounts for gaps).

## Input Component API

Test in `test.describe("Api")` for input components: `value`, `setValue`, `focus`.

## Test Naming

Avoid the word "component":
- ✅ `"renders with 'variant' property"`, `"has correct 'aria-clickable'"`
- ❌ `"test component"`, `"basic component test"`

## Skipping Tests

```typescript
// Placeholder (will implement later):
test.skip("placeholder text", async ({ initTestBed, page }) => {});

// Known bug / unimplemented feature:
test.fixme(
  "label on autocomplete",
  SKIP_REASON.XMLUI_BUG("Two labels from nested component cause error"),
  async ({ initTestBed, page }) => { ... }
);
```

## Parallel Execution

Always verify with `--workers=10` before declaring tests done:

```bash
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line  # development
npx playwright test ComponentName.spec.ts --workers=10                  # stability check
```

Tests that pass with `--workers=1` but fail with `--workers=10` almost always have a missing `toBeFocused()` or `toBeVisible()` wait. For throttle/debounce tests it is a missing range assertion.
