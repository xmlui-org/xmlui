# Conventions: XMLUI Component E2E Testing

This document outlines the testing conventions and standards for XMLUI components using Playwright for end-to-end testing.

## Test Categories

Test components across these categories:

1. **Basic Functionality** - Core behavior, properties, events, methods. Group related props (e.g., `icon` and `iconPosition`). Test edge cases: null, undefined, invalid values, unicode characters. Test keyboard/mouse interactions for interactive components, arrangement/spacing for layout components.

```typescript
test("renders with basic props", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName size="sm" variant="primary"/>`);
  await expect(page.getByTestId("component")).toBeVisible();
});
```

2. **Accessibility** - ARIA attributes, keyboard navigation, WCAG compliance.

```typescript
test("has correct accessibility attributes", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName label="Test Label"/>`);
  const component = page.getByLabel("Test Label");
  await expect(component).toHaveRole("button");
});
```

3. **Theme Variables** - CSS custom properties. Use exact values: `"rgb(255, 0, 0)"` not `"red"`. **Only for components with theme variable support**.

```typescript
test("applies theme variables", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName/>`, {
    testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" },
  });
  await expect(page.getByTestId("component")).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
```

4. **Other Edge Cases** - General edge cases not tied to specific properties.

```typescript
test("handles no props gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName/>`);
  await expect(page.getByTestId("component")).toBeVisible();
});
```

5. **Behaviors and Parts** - Behavior system (tooltip, variant, animation) and part selection. **Only for components with behaviors or parts**.

## Behaviors and Parts Testing

### Behavior Testing

Common behaviors:
- **tooltipBehavior**: `tooltip` or `tooltipMarkdown` props
- **variantBehavior**: `variant` prop → CSS classes/theme variables
- **animationBehavior**: `animation` prop

```typescript
test.describe("Behaviors and Parts", () => {
  // Test tooltip behavior
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" tooltip="Tooltip text" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  // Test markdown tooltip
  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" tooltipMarkdown="**Bold text**" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  // Test custom variant behavior (applies theme variables with variant suffix)
  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "borderColor-ComponentName-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  // Test animation behavior
  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" animation="fadeIn" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
  });

  // Test combined behaviors
  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" tooltip="Tooltip text" animation="fadeIn" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
    
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });
});
```

### Parts Testing

Components expose internal elements as "parts" using `<Part partId="partName">`.

**Important**: Check `ComponentNameNative.tsx` for actual `partId` values (may differ from metadata).

```typescript
test.describe("Behaviors and Parts", () => {
  // Test individual parts are selectable
  test("can select part: 'partName'", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" />`);
    const part = page.getByTestId("test").locator("[data-part-id='partName']");
    await expect(part).toBeVisible();
  });

  // Test conditional parts (only visible with certain props)
  test("can select part: 'clearButton'", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" clearable="true" />`);
    const clearButton = page.getByTestId("test").locator("[data-part-id='clearButton']");
    await expect(clearButton).toBeVisible();
  });

  // Test that conditional parts are absent without required props
  test("clearButton part is not present without clearable", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" clearable="false" />`);
    const clearButton = page.getByTestId("test").locator("[data-part-id='clearButton']");
    await expect(clearButton).not.toBeVisible();
  });

  // Test that parts remain accessible when behaviors are applied
  test("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(`<ComponentName testId="test" variant="CustomVariant" />`, {
      testThemeVars: { "borderColor-ComponentName-CustomVariant": "rgb(255, 0, 0)" },
    });
    
    const component = page.getByTestId("test");
    const part = component.locator("[data-part-id='partName']");
    
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(part).toBeVisible();
  });

  // Test comprehensive scenario with all behaviors and parts
  test("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <ComponentName 
        testId="test" 
        tooltip="Tooltip text" 
        variant="CustomVariant"
        animation="fadeIn"
      />
    `, {
      testThemeVars: {
        "borderColor-ComponentName-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const part = component.locator("[data-part-id='partName']");
    
    // Verify variant applied
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    
    // Verify parts are visible
    await expect(part).toBeVisible();
    
    // Verify tooltip appears
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });
});
```

**Key Patterns:**
- Select parts: `page.getByTestId("test").locator("[data-part-id='partName']")`
- Test conditional and unconditional parts
- Verify behaviors don't interfere with parts
- Variant theme variables: `"property-ComponentName-VariantName"`
- Check native implementation for actual `partId` values

**Parts Wrapping testId:**
- You cannot scope from `testId` to the part (the part is the parent)
- Select such parts without testId scoping: `page.locator("[data-part-id='partName']")`
- Example from AutoComplete component:
  ```typescript
  // ❌ INCORRECT - listWrapper wraps the testId element
  const listWrapper = page.getByTestId("test").locator("[data-part-id='listWrapper']");
  
  // ✅ CORRECT - Select without testId scoping
  const listWrapper = page.locator("[data-part-id='listWrapper']");
  const inputPart = page.locator("[data-part-id='input']"); // Also works for inner parts
  ```
- Use `.first()` if multiple instances exist on the page: `page.locator("[data-part-id='partName']").first()`

**CSS Property Selection:**
- Choose properties the component supports at top level
- Use `borderColor` (reliable for most components)
- Avoid `backgroundColor` if not directly applied
- Test 1-2 properties per variant test

**Important Limitations:**
- **CSS Pseudo-classes**: Do NOT test `:hover`, `:focus`, or `:active` pseudo-class states using `.toHaveCSS()` assertions. Playwright's `.hover()` action triggers JavaScript behaviors but does not activate CSS pseudo-class selectors for CSS inspection.
  ```typescript
  // ❌ INCORRECT - hover() doesn't trigger CSS :hover selector
  await component.hover();
  await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)"); // Will fail
  
  // ✅ CORRECT - Test functional outcomes of hover instead
  await component.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible(); // Tests the behavior, not CSS
  ```
- Only test base state theme variables for variant behavior, not hover/focus/active states
- If hover behavior needs testing, test the functional outcome (e.g., tooltip appears) rather than CSS changes
- Tooltip tests can be flaky in complex scenarios - if a tooltip test fails consistently, simplify it or remove the tooltip assertion from combined behavior tests

## File Organization

- **Location**: Test files MUST be in the same directory as the component's implementation.
- **Naming**: Use `ComponentName.spec.ts` format
- **Import**: `import { test, expect } from "../../testing/fixtures";`

## Context Information

XMLUI is a declarative, reactive, component-based web framework.

`Checkbox.spec.ts` is an excellent reference for test patterns.

### Documentation Location

Component metadata lives in `Button.tsx` (not `ButtonNative.tsx`). Documentation is in `.md` files.

#### Component Metadata (Required)

**ALWAYS read the `.tsx` file before testing.** Contains:
- Properties with types/descriptions
- Events and parameters
- Theme variable names and defaults

Use the documented theme variable names when creating theme tests instead of guessing:

```typescript
// ✅ CORRECT - Use documented theme variable names from metadata
test("applies theme variables", async ({ initTestBed, page }) => {
  await initTestBed(`<Button/>`, {
    testThemeVars: { "backgroundColor-Button": "rgb(255, 0, 0)" }, // From metadata
  });
  await expect(page.getByTestId("component")).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
```

#### Documentation Files (Recommended)

**Check for `.md` files** - provide examples, advanced features, usage context.

Read both `.tsx` metadata AND `.md` docs before writing tests.

### Commands

**IMPORTANT**: Run from workspace root (`/Users/dotneteer/source/xmlui`), not subdirectories.

```bash
# Standard execution (run from workspace root)
npx playwright test ComponentName.spec.ts

# Category-specific
npx playwright test ComponentName.spec.ts --grep "accessibility"

# Development (recommended during creation) - prevents HTML report auto-opening
npx playwright test ComponentName.spec.ts --reporter=line

# Single worker for debugging (prevents race conditions)
npx playwright test ComponentName.spec.ts --workers=1

# Fast feedback during development (single worker + line reporter)
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line
```

### Timeout Configuration

Optimized timeouts for fast feedback:
- **Expect timeout**: 1000ms
- **Test timeout**: 5 seconds

Tests fail quickly when conditions aren't met.

**Important**: Use `--reporter=line` for immediate feedback without browser windows.

### Development Commands

Best practice combinations:

```bash
# Best practice during test development - single worker + line reporter
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line

# Debug specific failing tests only
npx playwright test ComponentName.spec.ts --grep "test name pattern" --reporter=line

# Run specific test categories during development
npx playwright test ComponentName.spec.ts --grep "Basic Functionality" --reporter=line
```

### Event Handler Naming

**ALWAYS use "on" prefix for event handlers:**

```typescript
// ✅ CORRECT
onClick = "testState = 'clicked'";
onWillOpen = "testState = 'opening'";

// ❌ INCORRECT
click = "testState = 'clicked'";
willOpen = "testState = 'opening'";
```

**Event vs Handler:**
- **Event names** (no "on"): `<event name="click">`
- **Event handlers** (with "on"): `onClick="..."`

### Event Handler Parameters

**Use arrow functions:**

```typescript
// ✅ CORRECT
onExpandedChange = "arg => testState = arg";

// ❌ INCORRECT
onExpandedChange = "testState = arguments[0]";
```

When not accessing the event object, omit the arrow function.

### XMLUI Script Limitations

**NO "new" operator:**

```typescript
// ❌ INCORRECT - "new" operator not supported
throw new Error("test error");
const items = new Set([1, 2, 3]);
const date = new Date();
const regex = new RegExp("pattern");

// ✅ CORRECT - Use alternatives
throw "test error"; // String-based error throwing
// Manual uniqueness check instead of Set
const uniqueCheck = {};
let allUnique = true;
for (let i = 0; i < items.length; i++) {
  if (uniqueCheck[items[i]]) {
    allUnique = false;
    break;
  }
  uniqueCheck[items[i]] = true;
}
// Use string literals for dates
const dateStr = "2025-08-07";
// Use string patterns instead of regex literals
const pattern = "test";
```

### Non-Visual Components

Access APIs through Button click handlers:

```typescript
// ✅ CORRECT - Access APIs through Button onClick
const { testStateDriver } = await initTestBed(`
  <Fragment>
    <Queue id="testQueue" />
    <Button onClick="testState = testQueue.enqueueItem('test')" />
  </Fragment>
`);

// ❌ INCORRECT - Script tags don't provide API access
const { testStateDriver } = await initTestBed(`
  <Queue id="testQueue" />
  <script>testState = testQueue.enqueueItem('test')</script>
`);
```

**Important**: Non-visual components often need event handlers (e.g., `onProcess`) to exhibit expected behavior.

### Template Properties

**Wrap in `<property>` tags:**

```typescript
// ✅ CORRECT
<ComponentName>
  <property name="triggerTemplate">
    <Button>Custom Trigger</Button>
  </property>
</ComponentName>

// ❌ INCORRECT
<ComponentName>
  <triggerTemplate>
    <Button>Custom Trigger</Button>
  </triggerTemplate>
</ComponentName>
```

## Test Structure

Use `test.describe("category")` to group tests. No top-level wrapper needed.

```typescript
// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
    // Test implementation
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({ initTestBed, page }) => {
    // Test implementation
  });
});

// =============================================================================
// THEME VARIABLE TESTS (Only for components that support theme variables)
// =============================================================================

test.describe("Theme Variables", () => {
  test("component applies theme variables", async ({ initTestBed, createComponentDriver }) => {
    // Test implementation
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("component handles null props gracefully", async ({ initTestBed }) => {
    // Test implementation
  });
});
```

## Testing Framework

### Test Initialization

**Use XMLUI test function:**

```typescript
import { test, expect } from "../../testing/fixtures";

test("component renders correctly", async ({ initTestBed }) => {
  await initTestBed(`<ComponentName prop="value"/>`, {});
  // Test implementation
});
```

### initTestBed Usage

```typescript
// Basic usage
await initTestBed(`<ComponentName prop="value"/>`, {});

// With theme variables
await initTestBed(`<ComponentName/>`, {
  testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" },
});

// With test state for events
const { testStateDriver } = await initTestBed(`
  <ComponentName onClick="testState = 'clicked'"/>
`);
```

## Testing Approaches

### Obtaining Locators

Locate by user intent: `page.getByRole('checkbox')` not `page.locator("input").nth(2)`. Use `testId` only when necessary. Avoid `page.locator()` in tests.

Test at location time when possible:

```ts
const cb = page.getByRole("checkbox");
await expect(cb).toBeDisabled();
```

However, use options to differentiate when multiple elements exist:

```ts
await initTestBed(`
<Fragment>
  <Checkbox enabled="false"/>
  <Checkbox />
</Fragment>`);
const cb = page.getByRole("checkbox", { disabled: true });
// do something with the disabled checkbox
```

### Event Testing

Use `testState` in event handlers to verify events fire:

```typescript
test("click event fires on click", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`<Button onClick="testState = 'clicked'"/>`);

  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");
});
```

**API Returns vs State**: Test API return values, not internal state (may not persist without handlers):

```typescript
// ✅ CORRECT - Test API return values
test("enqueueItem returns valid ID", async ({ initTestBed, createButtonDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <Queue id="testQueue" />
      <Button onClick="testState = { id: testQueue.enqueueItem('test'), hasId: true }" />
    </Fragment>
  `);

  const buttonDriver = await createButtonDriver("button");
  await buttonDriver.component.click();

  const result = await testStateDriver.testState();
  expect(result.id).toBeTruthy();
  expect(result.hasId).toBe(true);
});

// ❌ POTENTIALLY INCORRECT - Component state may not persist without handlers
test("queue length increases", async ({ initTestBed, createButtonDriver }) => {
  // Without onProcess handler, queue might not retain items
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <Queue id="testQueue" />
      <Button onClick="testQueue.enqueueItem('test'); testState = testQueue.getQueueLength()" />
    </Fragment>
  `);
  // This test might fail if Queue doesn't retain items without processing
});
```

### Actions and Drivers

Not all tests need actions. Use actions directly only for simple, clear operations:

```ts
const cb = page.getByRole("checkbox");
await cb.check();
await expect(cb).toBeChecked();
await cb.uncheck();
await expect(cb).not.toBeChecked();
```

For complex actions, use component drivers with meaningful names:

```ts
test("search filters option labels", async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`
    <Select searchable="true">
      <Option value="opt1" label="first"/>
      <Option value="opt2" label="second"/>
      <Option value="opt3" label="third"/>
    </FormItem>
  `);
  const select = page.getByRole("combobox");
  const driver = await createSelectDriver(select);

  await driver.searchFor("second");
  await driver.chooseFirstOption();
  await expect(select).toHaveValue("opt2");
});
```

Drivers encapsulate component-specific actions. Use meaningful names (e.g., `toggleDropdownVisibility` not `click`).

Drivers are optional - only create when needed.

### Internal Structure Drivers

Rarely needed - usually indicates missing accessibility features. Express the accessible approach.

For purely visual components or specific DOM assertions, drivers can return locators.

Drivers should NOT:
- Have expectations/assertions (return locators for tests to assert)
- Reimplement Playwright API (`click`, `hover` wrappers)

### Assertions

Use web-first assertions: `await expect(checkbox).not.toBeChecked()`. Prefer built-in assertions over attribute checks.

## Test Naming

- Avoid "component" - it's redundant
- Use concrete names: property, event, API, attribute

- ✅ `"renders with 'variant' property"`
- ✅ `"has correct 'aria-clickable'"`
- ✅ `"handles null and undefined 'variant' property"`
- ❌ `"test component"` or `"basic test"`

## Best Practices

### Avoid Frontend Imports

Don't import frontend code (especially with stylesheets) into E2E tests - causes issues and slows execution.

Define shared data in separate files importable by both.

### Skipping Tests

**For coverage** - tests planned but not implemented:

```typescript
test.skip("placeholder defaults to 'example.com'", async ({ initTestBed, page }) => {});
```

**For bugs/unimplemented features** - use `test.fixme` with skip reason:

```typescript
test.fixme(
  `label displayed for type 'autocomplete'`,
  SKIP_REASON.XMLUI_BUG(
    "There are two labels in Autocomplete: one is ours, the other comes from the wrapped component -> this results in an error",
  ),
  async ({ initTestBed, page }) => {
    await initTestBed(`<Autocomplete label="test" />`);
    await expect(page.getByLabel("test"));
    // ...rest of the test is not relevant
  },
);
```

### Parameterized Tests

Avoid duplication with data-driven tests:

```typescript
// Data type testing
[
  { label: "null", value: "'{null}'", expected: "" },
  { label: "string", value: "'test'", expected: "test" },
  { label: "integer", value: "'{123}'", expected: "123" },
  // more cases...
].forEach(({ label, value, expected }) => {
  test(`handles ${label} correctly`, async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName value=${value} testId="component"/>`);
    await expect(page.getByTestId("component")).toHaveText(expected);
  });
});
```

## Layout Testing

Verify visual arrangement using `getBounds` utility.

**Best Practices:**
- Import from `"../../testing/component-test-helpers"`
- Destructure specific properties: `{ left, right, top, bottom }`
- Test RTL when direction affects layout
- Verify invalid value handling

### Element Positioning

Use `getBounds()` to get element coordinates and verify relative positioning:

```typescript
test("ComponentName appears at the correct side of ComponentName2", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <Fragment>
      <ComponentName testId="comp1" />
      <ComponentName2 testId="comp2" />
    <Fragment>
  `);

  const { left: comp1Left } = await getBounds(page.getByTestId("comp1"));
  const { right: comp2Right } = await getBounds(page.getByTestId("comp2"));

  expect(comp1Left).toBeLessThan(comp2Right);
});
```

### Directional Layout (RTL/LTR)

```typescript
test("startText displays at beginning of input (rtl)", async ({ initTestBed, page }) => {
  await initTestBed(`<TextBox testId="input" direction="rtl" startText="$" />`);

  const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
  const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

  await expect(page.getByTestId("input")).toContainText("$");
  expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
});
```

### Size Properties

```typescript
test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
  const expected = 200;
  await initTestBed(`<InputComponent label="test test" labelWidth="${expected}px" />`);
  const { width } = await getBounds(page.getByText("test test"));
  expect(width).toEqual(expected);
});
```

### Complex Layouts

```typescript
test("all adornments appear in the right place", async ({ initTestBed, page }) => {
  await initTestBed(`
    <TextBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" direction="ltr" />
  `);
  const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
  const { left: startTextLeft, right: startTextRight } = await getBounds(page.getByText("$"));
  const { left: endTextLeft, right: endTextRight } = await getBounds(page.getByText("USD"));
  const { left: startIconLeft, right: startIconRight } = await getBounds(
    page.getByRole("img").first(),
  );
  const { left: endIconLeft, right: endIconRight } = await getBounds(page.getByRole("img").last());

  // Check order of adornments relative to their container component bounds
  expect(startTextRight - compLeft).toBeLessThanOrEqual(compRight - startTextLeft);
  expect(startIconRight - compLeft).toBeLessThanOrEqual(compRight - startIconLeft);
  expect(endTextRight - compLeft).toBeGreaterThanOrEqual(compRight - endTextLeft);
  expect(endIconRight - compLeft).toBeGreaterThanOrEqual(compRight - endIconLeft);
});
```

## Input Component API

Test in `test.describe("Api")` for input components:
- value
- setValue  
- focus

**Example:**

```typescript
test("component setValue API updates state", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <TextBox id="myTextBox" />
      <Button testId="setBtn" onClick="myTextBox.setValue('api value')" />
    </Fragment>
  `);
  await page.getByTestId("setBtn").click();
  await expect(page.getByRole("textbox")).toHaveValue("api value");
});
```
