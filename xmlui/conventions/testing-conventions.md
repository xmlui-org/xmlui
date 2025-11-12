# XMLUI Component Testing Conventions

This document outlines the testing conventions and standards for XMLUI components using Playwright for end-to-end testing.

## Test Categories

XMLUI components must be tested across four categories:

1. **Basic Functionality** - Core behavior but also test cases for each property, event, exposed method of the component. Each such item can be it's own category, if there are sufficiently numerous test cases for it (like >= 5, but that's not a hard requirement). It might make sense to combine multiple properties into the group, like `icon` and `iconPosition` under the `icon prop` group. For the props, also handle edge cases like null, undefined, unexpected input types like objects where text is expected for props, invalid values (like -5 pixels for a width prop), specially long unicode characters like 👨‍👩‍👧‍👦, or chinese characters. For interactive componenets, test interactivity with keyboard and mouse. For Layout Components, test arrangement, spacing

```typescript
test("renders with basic props", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName size="sm" variant="primary"/>`);
  await expect(page.getByTestId("component")).toBeVisible();
});
```

2. **Accessibility**

Has ARIA attributes, keyboard navigation and conforms to Accessibility standards.
These tests are partially to conform to WCAG and to reach a better score on benchmarks for them.

```typescript
test("has correct accessibility attributes", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName label="Test Label"/>`);
  const component = page.getByLabel("Test Label");
  await expect(component).toHaveRole("button");
});
```

3. **Theme Variables** - CSS custom properties and fallback behavior. Use exact browser values: `"rgb(255, 0, 0)"` not `"red"`. **Only include this category for components that support theme variables** (check component metadata for theme variable documentation).

```typescript
test("applies theme variables", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName/>`, {
    testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" },
  });
  await expect(page.getByTestId("component")).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
```

4. **Other Edge Cases** - These are the test cases that fall into the edge cases category, but not within one particular property. So a button with an object variant should still live in the basic functionality category, within the variant prop group. Here could be a test for a datepicker stating that it covers the text below it (the text is not visible), when the user clicks on it, because the detepicker menu appears. This doesn't belong to a property, but is still an edge case.

```typescript
test("handles no props gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName/>`);
  await expect(page.getByTestId("component")).toBeVisible();
});
```

5. **Behaviors and Parts** - Tests for XMLUI's behavior system (tooltip, variant, animation) and component part selection system. **Only include this category for components that support behaviors or have identifiable parts**.

## Behaviors and Parts Testing

### Behavior Testing

XMLUI has a behavior system that automatically wraps components with additional functionality when certain props are present. Common behaviors include:

- **tooltipBehavior**: Wraps component in a Tooltip when `tooltip` or `tooltipMarkdown` props are present
- **variantBehavior**: Applies CSS classes and theme variables based on `variant` prop
- **animationBehavior**: Wraps component in an Animation when `animation` prop is present

Test these behaviors systematically:

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

Components can expose internal elements as "parts" using `<Part partId="partName">`. This allows users to style or reference specific internal elements. 

**Important**: Always check the component's native implementation file (e.g., `ComponentNameNative.tsx`) to find the actual `partId` values used in the code, as they may differ from metadata documentation.

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

**Key Testing Patterns:**
- Use `page.getByTestId("test").locator("[data-part-id='partName']")` to select parts
- Test both unconditional parts and parts that require specific props to be visible
- Verify that behaviors (tooltips, variants, animations) don't interfere with part accessibility
- For variant testing, use theme variables with the pattern `"property-ComponentName-VariantName"`
- Always verify actual `partId` values in the native implementation before writing tests

**Parts That Wrap testId Elements:**
Some components have parts that wrap the element with the `testId` attribute. In these cases:
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

**CSS Property Selection for Variant Testing:**
- Choose CSS properties that the component actually supports and applies at the top level
- Use `borderColor` as a reliable property for most components
- Avoid `backgroundColor` on components that don't apply it directly (may be transparent)
- Test only one or two CSS properties per variant test to keep tests focused

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

Xmlui is a declarative, reactive, component based web framework.

Checkbox.spec.ts is an excellent testing file with good examples, and it's a great resource on how to write tests.

### Documentation location

There's documentation for the components, which we call metadata. They lives in the component's file, like `Button.tsx` next to the testing file `Button.spec.ts`, but not in the native implementation file `ButtonNative.tsx`. Generally, you should not read or rely on the native implementation details.
There's also documentation in the `.md` files, next to the component's file.

#### Component Metadata (Required Reading)

**ALWAYS read the component's `.tsx` file before creating tests.** The component files contain essential metadata that documents:

- **Properties**: All available props with their types and descriptions
- **Events**: Available event handlers and their parameters
- **Theme Variables**: Default values and names for CSS custom properties used in theme testing

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

#### Documentation Files (Highly Recommended)

**ALWAYS check for and read the component's `.md` documentation file** in the same directory. This documentation:

- **Merges with metadata** to provide complete component information
- **Contains comprehensive examples** showing real usage patterns
- **Documents advanced features** and edge cases
- **Provides context** for proper testing scenarios

Example documentation locations:

- `Button.tsx` - Contains metadata
- `Button.md` - Contains examples and detailed usage
- `Button.spec.ts` - Your test file

**Best Practice**: Read both the `.tsx` metadata AND the `.md` documentation before writing any tests to ensure comprehensive coverage of all documented features.

### Commands

**IMPORTANT**: All Playwright test commands must be run from the workspace root directory (`/Users/dotneteer/source/xmlui`), NOT from subdirectories. The workspace root is the monorepo directory that contains multiple packages including the `xmlui` subdirectory.

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

XMLUI uses optimized timeout settings for faster feedback during development:

- **Expect timeout**: 1000ms (1 second) - How long to wait for assertions like `expect.poll()`
- **Test timeout**: 5 seconds - Maximum time for entire test execution
- **Global timeout**: Configured in `playwright.config.ts`

These settings ensure tests fail quickly when conditions aren't met, providing rapid feedback during development. The shorter expect timeout helps identify issues faster than the default 5-second timeout.

**Important**: Never manually show the HTML report or wait for Ctrl+C during test development. Use `--reporter=line` to get immediate console feedback without browser interference.

### Development Testing Commands

For comprehensive debugging and development, use these command combinations:

```bash
# Best practice during test development - single worker + line reporter
npx playwright test ComponentName.spec.ts --workers=1 --reporter=line

# Debug specific failing tests only
npx playwright test ComponentName.spec.ts --grep "test name pattern" --reporter=line

# Run specific test categories during development
npx playwright test ComponentName.spec.ts --grep "Basic Functionality" --reporter=line
```

The line reporter provides detailed progress information and immediate feedback about test failures without opening browser windows or HTML reports, making it ideal for iterative test development.

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

**Event vs Handler distinction:**

- **Event names** (no "on"): Used in `<event name="click">` tags
- **Event handlers** (with "on"): Used as attributes `onClick="..."`

### Event Handler Parameters

**ALWAYS use arrow function syntax:**

```typescript
// ✅ CORRECT
onExpandedChange = "arg => testState = arg";
onClick = "event => testState = event.type";

// ❌ INCORRECT - arguments object doesn't work
onExpandedChange = "testState = arguments[0]";
```

most of the time (when the event handler does not need to access the event object),
you can omit the arrow function and write the handler body directly.

### XMLUI Script Limitations

XMLUI scripts have important JavaScript syntax limitations that must be followed:

**NO "new" operator support:**

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

### Non-Visual Component Testing

For non-visual components (like Queue, DataStore), use Button click handlers to access APIs:

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

**Important**: Non-visual components often require event handlers (like `onProcess`) to exhibit expected behavior. Without processing handlers, queue-like components may not retain items as expected.

### Template Properties

**ALWAYS wrap template properties in `<property>` tags:**

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

## Mandatory Test Structure

Use `test.describe("category name")` to group test cases.
Don't need a top level group that encompuses every test case.

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

**Always use XMLUI test function from `fixtures.ts`:**

```typescript
import { test, expect } from "../../testing/fixtures";

test("component renders correctly", async ({ initTestBed }) => {
  await initTestBed(`<ComponentName prop="value"/>`, {});
  // This will create a webpage where the whole content of it is the top level xmlui component,
  // specified in the initTestBed's first parameter as source code.

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

### Obtaining a locator (element)

Locate elements in a way a user would locate them guided by their intention. For example `const checkboxLocator = await page.getByRole('checkbox')`, rather than relying on internal structure like `page.locator("input").nth(2)`. If and only if there are more elements of the same type and it does not make sense to use text (because the test is not about labels or content text, or because the layout would change due to the presence of the content), prefer to use `testId`-s in the source code and use those test ids to locate the elements. You should aviod using `page.locator()` in test cases.

If it is possible to test something at the time of locationg the element, prefer that. `page.getByRole` is the prime example of this, because it also tests for accessibility and intent (the user is not looking for a div with a certain class on it, they are looking for an image or a button). Avoid long selectors, that could be more readable by adding some assertions. For example, this is better:

```ts
const cb = page.getByRole("checkbox");
await expect(cb).toBeDisabled();
```

and this is worse:

```ts
const cb = page.getByRole("checkbox", { disabled: true });
await expect(cb).toBeVisible();
```

However, if there are multiple elements of the same type and an option could differentiate them and assertions would need to be written out after locating the element anyway, this approach is better than using test ids. For example, this is a good use of the `{disabled: true}` option:

```ts
await initTestBed(`
<Fragment>
  <Checkbox enabled="false"/>
  <Checkbox />
</Fragment>`);
const cb = page.getByRole("checkbox", { disabled: true });
// do something with the disabled checkbox
```

### Event testing

Sometimes you need to test events. The easiest way is to do something like this:

Don't worry about how the testState is actually obtained. Just know that inside an event handler, you can write javascript and access the `testState` variable, which you can make assertions against later by polling that value. Just make it obvious that testState is actually changed, so use an obvious name like 'changed', or if you need to test the handler multiple times, use a counter like `onDidChange="testState = testState == null ? 1 : testState + 1"` Test state is initialized to be null.

```typescript
test("click event fires on click", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`<Button onClick="testState = 'clicked'"/>`);

  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");
});
```

**Testing API Returns vs Component State**: For non-visual components, focus on testing API return values rather than internal component state, as the latter may not behave as expected without proper event handlers:

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

### Writing actions and drivers

Not all tests need actions. Some are just instantiating the webpage with a given component and then making assertions on that.

Actions are the most varried part of writing component tests. If and only if the action is super simple and consists of one step, and the action's name gives clarity on what it is doing, should you use actions directly on the locators. For example, this is good, because it is clear what the actions are doing, as the `check` and `uncheck` actions are complete in themselves:

```ts
const cb = page.getByRole("checkbox");
await cb.check();
await expect(cb).toBeChecked();
await cb.uncheck();
await expect(cb).not.toBeChecked();
```

However, in any other case, you should use a component driver to encapsulate the logic of the action. For example:

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

In this case, if the `searchFor` method were to be substituted with clicking on the locator and typing into the input field the label text, that would not convey the intent of the action, which is searching. Actions should have componenet-specific names. For example, a Dropdown can have a `toggleDropdownVisibility` method, which is pretty much just a click, but with a more meaningful name. You would not call it `click`.

Drivers are derived from a base ComponentDriver class. Not every component needs a driver, so don't just create one for each component. In fact, if you can avoid it, you should, as they are a layer of abstraction.

### Drivers for internal component structure

In extremely rare cases, you need to access the DOM structure of the component. This is usually a sign that the component is not well designed, and lacking accessibility features. In these cases, if you are an AI express the best approach that has accessability baked in. For example, you might be asked to test a spinner's border. You cound use the internal structure of the top level component, but it's better to encourage the programmer to implement role="status" on the component, so you can use `page.getByRole("status")`.
In some RARE cases, they are the right approach though.
For example, if the component is purely visual and has no accessibility attributes, or we actually want to assert something about a particular DOM element (like an internal element's border has a certain width): you can use the driver to obtain the locator, but only for that.

Drivers should NOT:

- have expectations and assertions in them. Those belong to the test case. Instead, return the locator from a method (in case driver is used for obtaining internal structure) and assert against it in the test case.
- reimplement the playwright API, such as having a `click` or `hover` method which just wraps the playwright API and executes it on one of it's internal element'.

### Writing assertions

Use web-first assertions, like `await expect(checkboxLocator).not.toBeChecked()`. If there is a built-in assertion, prefer that over an assertion checking against a the dom attributes. This is an antipattern: `await expect(checkboxLocator).toHaveAttribute("type", "checkbox");` because it relies on the element being an input element.

## Test Naming & Patterns

### Naming Standards

- Avoid using the "component" word in names, it's redundant
- Use concrete property, event, api, attribute, etc.

- ✅ `"renders with 'variant' property"`
- ✅ `"has correct 'aria-clickable'"`
- ✅ `"handles null and undefined 'variant' property"`
- ❌ `"test component"` or `"basic test"`

## Best Practices

### Avoid Frontend Code in E2E Tests

It is crucial to avoid importing frontend code into E2E tests, especially if it transitively imports stylesheets. This can lead to unexpected issues with the test runner and slow down test execution.

For example, importing `defaultProps` from a component file like `ButtonNative.tsx` into a test file like `Button.spec.ts` is an anti-pattern. The component file likely imports SCSS or CSS files, which should not be part of the test environment.

Instead, if you need to share data between your component and your tests, define it in a separate file that can be imported safely by both.

### Skipping tests

#### Skipping For coverage

Use `test.skip` for comprehensive coverage, when you know which tests you want to write, but you haven't gotten around to implementing them yet.

```typescript
test.skip("placeholder defaults to 'example.com'", async ({ initTestBed, page }) => {});
```

#### Skipping for any other reason

There are other reasons to skip tests, such as when a feature is not yet implemented or when a bug is present.
After becoming certain the test is well written, skip the test with the appropriate skip reason.

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

### Systematic Testing

In case there would be a lot of duplication for testing a property that has the exact same structure, use parameterized tests.

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

## Good test case patterns

### Layout/Positioning Tests

Components that support layout properties (like `labelPosition`, `direction`, positioning, sizing) should include tests that verify visual arrangement using the `getBounds` utility function.

#### Best Practices for Layout Testing

- **Import getBounds**: Import from `"../../testing/component-test-helpers"`
- **Use descriptive coordinates**: Destructure specific properties like `{ left, right, top, bottom }`
- **Test both directions**: Include RTL tests when direction affects layout
- **Verify invalid values**: Test graceful handling of invalid layout properties

#### Testing Element Positioning

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

#### Testing Directional Layout (RTL/LTR)

Test layout behavior in both directions when applicable:

```typescript
test("startText displays at beginning of input (rtl)", async ({ initTestBed, page }) => {
  await initTestBed(`<TextBox testId="input" direction="rtl" startText="$" />`);

  const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
  const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

  await expect(page.getByTestId("input")).toContainText("$");
  expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
});
```

#### Testing Size Properties

Verify width, height, and other sizing properties:

```typescript
test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
  const expected = 200;
  await initTestBed(`<InputComponent label="test test" labelWidth="${expected}px" />`);
  const { width } = await getBounds(page.getByText("test test"));
  expect(width).toEqual(expected);
});
```

#### Testing Complex Layout Arrangements

For components with multiple positioned elements, test their relative arrangement:

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

### Testing Input Component API

Test the following in a `test.describe("Api", () => {...})` block for input components (such as TextBox, Checkbox, Slider, etc.):

- value
- setValue
- focus

#### Example

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

## Bad test case patterns

fill in later
