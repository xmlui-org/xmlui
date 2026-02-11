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

### Debugging Techniques

#### Console Message Capture

Playwright can capture `console.log` messages from the browser for debugging:

```typescript
test("debug with console messages", async ({ page, initTestBed }) => {
  // Capture console messages
  const consoleMessages: string[] = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  await initTestBed(`<ComponentName testId="test" />`);
  
  // Your test code here
  
  // Log captured messages for debugging
  console.log("Captured console messages:", consoleMessages);
});
```

**Best Practices:**
- Use console capture for debugging complex issues during development
- Remove console capture code before committing tests
- Console messages include all types: `log`, `error`, `warn`, `debug`, etc.
- Access message type with `msg.type()` and content with `msg.text()`

#### UI-Based Debugging

For visual verification, display debug values directly in the UI using Text elements:

```typescript
test("debug with UI elements", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <ComponentName id="comp" onStatusUpdate="statusData => testState = statusData" />
      <Text testId="debug-status">Status: {testState?.status}</Text>
      <Text testId="debug-progress">Progress: {testState?.progress}</Text>
    </Fragment>
  `);
  
  // Visually verify values in the UI
  await expect(page.getByTestId("debug-progress")).toContainText("Progress: 25");
});
```

**When to Use Each Approach:**
- **Console capture**: Best for inspecting values, execution flow, or complex data structures during debugging
- **UI debugging**: Best for visual verification, when you need to see values persist in the UI, or for E2E scenarios where the user would see the values
- **testState**: Best for final test assertions - more reliable and doesn't require cleanup

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

### APIInterceptor State Management

**CRITICAL**: In APIInterceptor handlers, use `$state` to maintain state across API calls, NOT `globalThis`:

```typescript
// ✅ CORRECT - Use $state context variable
const mockBackend: ApiInterceptorDefinition = {
  "initialize": "$state.pollCount = 0; $state.items = [];",
  "operations": {
    "create": {
      "url": "/api/items",
      "method": "post",
      "handler": "
        $state.items.push({ id: $state.items.length + 1, name: $body.name });
        return { id: $state.items.length };
      "
    },
    "list": {
      "url": "/api/items",
      "method": "get",
      "handler": "return { items: $state.items };"
    },
    "status": {
      "url": "/api/status",
      "method": "get",
      "handler": "
        $state.pollCount++;
        return { pollCount: $state.pollCount };
      "
    }
  }
};

// ❌ INCORRECT - globalThis is not available
const mockBackend: ApiInterceptorDefinition = {
  "operations": {
    "create": {
      "handler": "
        globalThis.items = globalThis.items || [];  // Will not work!
        globalThis.items.push(...);
      "
    }
  }
};
```

**Key Points:**
- `$state` is a singleton state object accessible across all API operations in a test
- Use `initialize` property to set initial state values
- Properties can be read and modified: `$state.count++`, `$state.items.push(item)`
- State persists across multiple API calls within the same test
- Each test gets a fresh `$state` instance
- Available context variables in handlers: `$state`, `$body`, `$params`, `$query`

**NO async/await keywords:**

XMLUI automatically handles asynchronous operations without explicit `async`/`await` syntax:

```typescript
// ✅ CORRECT - XMLUI handles async automatically
<Button onClick="api.execute(); delay(100); testState = api.getStatus();" />

// ❌ INCORRECT - No await keyword
<Button onClick="await api.execute(); await delay(100); testState = api.getStatus();" />
```

**Use delay() instead of setTimeout():**

```typescript
// ✅ CORRECT - Use delay() function
<Button onClick="api.execute(); delay(100); testState = api.getStatus();" />

// ❌ INCORRECT - setTimeout not available
<Button onClick="api.execute().then(() => { setTimeout(() => { testState = api.getStatus(); }, 100); })" />
```

**Sequential async operations:**

Write async operations in sequence - XMLUI executes them sequentially:

```typescript
// ✅ CORRECT - XMLUI awaits each operation automatically
<Button onClick="
  let result = api.execute();
  delay(100);
  let status = api.getStatus();
  testState = { result, status };
" />

// ❌ INCORRECT - Promise chains not needed
<Button onClick="
  api.execute().then(result => {
    return delay(100).then(() => {
      testState = { result, status: api.getStatus() };
    });
  });
" />
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

### Keyboard Navigation Testing

**CRITICAL**: Always wait for elements to be visible and focus to be stable before using `page.keyboard.press()`. Keyboard presses immediately after `initTestBed()` or `.focus()` can execute before components are fully rendered, causing race conditions in parallel test execution.

**Verified Solution**: This pattern has been tested across 174 keyboard press occurrences in 29 component files and achieves 100% test success rate with 10 parallel workers.

**Common Patterns:**

```typescript
// ✅ CORRECT - Tab navigation between elements
await initTestBed(`<Fragment><Input1 /><Input2 /></Fragment>`);
await expect(input1).toBeVisible();
await expect(input2).toBeVisible(); // Wait for all elements
await input1.focus();
await expect(input1).toBeFocused(); // Verify focus is stable
await page.keyboard.press("Tab");

// ✅ CORRECT - Arrow navigation after focus
const combobox = page.getByRole("combobox");
await combobox.focus();
await expect(combobox).toBeFocused(); // Wait for focus to be stable
await page.keyboard.press("ArrowDown");

// ✅ CORRECT - Sequential arrow key navigation
await expect(item1).toBeFocused();
await page.keyboard.press("ArrowDown");
await expect(item2).toBeFocused();
// Wait for previous focus to be stable before next navigation
await expect(item2).toBeFocused();
await page.keyboard.press("ArrowDown");

// ✅ CORRECT - Enter/Space after focus
const button = page.getByRole("button");
await button.focus();
await expect(button).toBeFocused();
await page.keyboard.press("Enter");

// ✅ CORRECT - Keyboard shortcuts (platform-aware)
const isMac = process.platform === 'darwin';
const selectAllKey = isMac ? 'Meta+A' : 'Control+A';
await expect(table).toBeVisible();
await page.keyboard.press(selectAllKey);

// ✅ CORRECT - Multi-input components (DateInput, TimeInput)
await expect(monthInput).toBeVisible();
await expect(dayInput).toBeVisible();
await expect(yearInput).toBeVisible(); // Wait for ALL inputs
await monthInput.focus();
await expect(monthInput).toBeFocused();
await page.keyboard.press("Tab");

// ✅ CORRECT - Dropdown/Menu navigation
await driver.open(); // Open dropdown
const menuItem = page.getByRole("menuitem", { name: "Item 1" });
await expect(menuItem).toBeVisible(); // Wait for menu to render
await page.keyboard.press("ArrowDown");

// ❌ INCORRECT - No visibility/focus checks
await initTestBed(`<ComponentName />`);
await page.keyboard.press("Tab"); // May fail with multiple workers

// ❌ INCORRECT - Focus without stability check
await element.focus();
await page.keyboard.press("Enter"); // May execute before focus is stable

// ❌ INCORRECT - Delay workarounds mask the problem
await page.keyboard.press("Tab", { delay: 100 }); // Remove delays
await page.waitForTimeout(100); // Avoid timeouts before keyboard press
```

**Key Rules:**
1. **Always** wait for target elements to be **visible** before keyboard interaction
2. **Always** wait for focus to be **stable** after calling `.focus()`
3. **Never use `{ delay: X }` workarounds** - add proper waits instead
4. For multi-input components, wait for **ALL** inputs to be visible
5. For sequential navigation, verify focus is stable before the next `keyboard.press()`
6. For dropdowns/menus, verify menu items are visible before navigating

**When to Use Which Check:**
- `.toBeVisible()` - Before first interaction or when checking if UI is ready
- `.toBeFocused()` - After `.focus()` call or before keyboard action requiring focus
- Both can be used together for maximum stability in complex scenarios

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

## Spacing Theme Variables

XMLUI provides a predefined scale of spacing values in relative units, affected by the `space-base` variable. These spacing variables (`space-0`, `space-1`, ..., `space-96`) are useful for defining sizes, gaps, paddings, and margins.

When testing components that support spacing-related props (gap, padding, margin, width, height), verify that they correctly apply spacing theme variables.

**Best Practices:**
- **Always verify component metadata first** - Not all components support all spacing props (e.g., Stack only supports `gap`, not `padding`)
- Test with common spacing values: `space-2`, `space-4`, `space-8`
- Use `getBounds()` to verify actual rendered spacing
- **Use `toBeCloseTo()` for pixel assertions** - Floating point arithmetic and sub-pixel rendering can cause exact equality checks to fail
- Test gap properties on layout containers (HStack, VStack, FlowLayout, Stack)
- Test padding on components that expose padding props (Card, Box, Pages - but NOT Stack)
- Calculate expected pixel values based on `space-base` (typically 0.25rem = 4px at default font size)
- **Gap behavior differs**: Gap + percentage sizing causes overflow, gap + star sizing accounts for gaps in available space

### Gap Spacing

Test gap properties on layout containers (HStack, VStack, FlowLayout):

```typescript
test("gap applies spacing correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <HStack testId="container" gap="$space-4">
      <Text testId="item1">First</Text>
      <Text testId="item2">Second</Text>
    </HStack>
  `);

  const { right: item1Right } = await getBounds(page.getByTestId("item1"));
  const { left: item2Left } = await getBounds(page.getByTestId("item2"));
  
  const gap = item2Left - item1Right;
  // space-4 = 4 * 0.25rem = 1rem = 16px at default font size
  expect(gap).toBeCloseTo(16, 0);
});
```

### Padding Spacing

Test padding properties on components that support them:

```typescript
test("padding applies spacing correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="card" padding="$space-6">
      <Text testId="content">Content</Text>
    </Card>
  `);

  const { left: cardLeft, top: cardTop } = await getBounds(page.getByTestId("card"));
  const { left: contentLeft, top: contentTop } = await getBounds(page.getByTestId("content"));
  
  const paddingLeft = contentLeft - cardLeft;
  const paddingTop = contentTop - cardTop;
  
  // space-6 = 6 * 0.25rem = 1.5rem = 24px at default font size
  expect(paddingLeft).toBeCloseTo(24, 0);
  expect(paddingTop).toBeCloseTo(24, 0);
});
```

### Size Spacing

Test width/height properties with spacing values:

```typescript
test("width accepts spacing theme variables", async ({ initTestBed, page }) => {
  await initTestBed(`<Stack testId="box" width="$space-32" height="$space-16" />`);

  const { width, height } = await getBounds(page.getByTestId("box"));
  
  // space-32 = 32 * 0.25rem = 8rem = 128px at default font size
  expect(width).toBeCloseTo(128, 0);
  // space-16 = 16 * 0.25rem = 4rem = 64px at default font size
  expect(height).toBeCloseTo(64, 0);
});
```

### Named Spacing Variables

Test named spacing variables for gaps and paddings:

```typescript
test("gap-tight applies smaller gap", async ({ initTestBed, page }) => {
  await initTestBed(`
    <VStack testId="container" gap="$gap-tight">
      <Text testId="item1">First</Text>
      <Text testId="item2">Second</Text>
    </VStack>
  `);

  const { bottom: item1Bottom } = await getBounds(page.getByTestId("item1"));
  const { top: item2Top } = await getBounds(page.getByTestId("item2"));
  
  const gap = item2Top - item1Bottom;
  // gap-tight is typically space-2 (8px)
  expect(gap).toBeGreaterThan(0);
  expect(gap).toBeLessThan(12); // Less than gap-normal
});

test("padding-loose applies larger padding", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Card testId="card" padding="$padding-loose">
      <Text testId="content">Content</Text>
    </Card>
  `);

  const { left: cardLeft } = await getBounds(page.getByTestId("card"));
  const { left: contentLeft } = await getBounds(page.getByTestId("content"));
  
  const padding = contentLeft - cardLeft;
  // padding-loose is typically space-6 or space-8 (24-32px)
  expect(padding).toBeGreaterThan(20);
});
```

### Important Considerations

**Component Metadata Verification:**
Before writing spacing tests, check the component's metadata file (e.g., `Stack.tsx`, `Card.tsx`) to verify which spacing props are supported. Different components support different spacing props:
- **Stack**: Supports `gap` only (not padding)
- **Card/Box/Pages**: Support `padding`, `paddingHorizontal`, `paddingVertical`
- **FlowLayout**: Supports `gap`

**Spacing Assertions:**
Use `toBeCloseTo(expectedValue, 0)` instead of `toEqual()` for pixel-based spacing assertions to handle floating point precision and sub-pixel rendering:

```typescript
// ✅ CORRECT - handles floating point precision
expect(gap).toBeCloseTo(16, 0);

// ❌ INCORRECT - may fail due to sub-pixel values
expect(gap).toEqual(16);
```

**Gap Behavior with Different Sizing:**
- **Gap + Percentage**: Gaps push content out of the container, causing overflow when percentages sum to 100%
- **Gap + Star Sizing**: Star sizing accounts for gaps when calculating available space, preventing overflow

```typescript
// Gap + percentage causes overflow
test("gap with percentage causes overflow", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack testId="stack" orientation="horizontal" gap="$space-4">
      <Text width="50%">First</Text>
      <Text width="50%">Second</Text>
    </Stack>
  `);
  const isOverflown = await overflows(page.getByTestId("stack"), "x");
  expect(isOverflown).toEqual(true); // Gap pushes content out
});

// Gap + star sizing doesn't overflow
test("gap with star sizing doesn't overflow", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Stack testId="stack" orientation="horizontal" gap="$space-4">
      <Text width="*">First</Text>
      <Text width="*">Second</Text>
    </Stack>
  `);
  const isOverflown = await overflows(page.getByTestId("stack"), "x");
  expect(isOverflown).toEqual(false); // Star sizing accounts for gaps
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
