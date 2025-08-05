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

These commands should be ran inside the npm package named `xmlui`, which is inside the directory called `xmlui`.
There might be a root level directory called `xmlui` (a monorepo) which contains the `xmlui` subdirectory. You want to run the commands from the `xmlui` subdirectory.

```bash
# Standard execution
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

Sometimes you need to test events. The easies was is to do something like this:

Don't worry about how the testState is actually obtained. Just know that inside an event handler, you can write javascript and access the `testState` variable, which you can make assertions against later by polling that value. Just make it obvious that testState is actually changed, so use an obvious name like 'changed', or if you need to test the handler multiple times, use a counter like `onDidChange="testState = testState == null ? 1 : testState + 1"` Test state is initialized to be null.

```typescript
test("click event fires on click", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`<Button onClick="testState = 'clicked'"/>`);

  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("clicked");
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

fill in later

## Bad test case patterns

fill in later
