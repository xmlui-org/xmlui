# XMLUI Testing Conventions and Patterns

This document outlines the testing conventions, patterns, and best practices discovered from analyzing the Checkbox component's end-to-end test suite and the broader XMLUI testing framework.

## Test File Structure and Organization

### Standard Test File Structure
```typescript
// Component.spec.ts
import { getBounds, isIndeterminate, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

// =============================================================================
// VISUAL STATE TESTS (e.g., LABEL POSITIONING)
// =============================================================================

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

// =============================================================================
// API TESTS
// =============================================================================

// =============================================================================
// CUSTOM TEMPLATE TESTS
// =============================================================================

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================
```

### Test Section Guidelines

1. **Basic Functionality Tests**: Core component behavior, prop handling, state management
2. **Accessibility Tests**: ARIA attributes, keyboard navigation, focus management, screen reader support
3. **Visual State Tests**: Layout, positioning, visual configurations, responsive behavior
4. **Validation Status Tests**: Validation state styling and behavior
5. **Event Handling Tests**: Event firing, state management, event data verification
6. **API Tests**: Component public API methods and properties
7. **Custom Template Tests**: Template customization and extension capabilities
8. **Theme Variable Tests**: CSS theming support and custom styling
9. **Performance Tests**: Memory usage, rapid state changes, optimization verification

## Testing Framework Components

### Core Testing Fixtures

#### `initTestBed(markup, options?)`
- Sets up component with XMLUI markup syntax
- Returns `testStateDriver` for event testing
- Supports theme variable injection via options
```typescript
const { testStateDriver } = await initTestBed(`<Checkbox label="test" />`, {
  testThemeVars: {
    "backgroundColor-Checkbox": "rgb(255, 0, 0)"
  }
});
```

#### `page` Object
- Playwright page object for direct DOM interaction
- Use `page.getByRole()`, `page.getByLabel()`, `page.getByTestId()` for element selection
- Prefer semantic selectors over CSS selectors

#### Component Drivers
- `createComponentDriver()` - Creates component-specific driver instances
- Provides abstracted component interaction methods
- Use drivers for complex component interactions

### Driver Architecture

```typescript
// Base classes
ComponentDriver              // Base driver class
├── InputComponentDriver     // Extended driver for input components
    └── CheckboxDriver      // Specific component driver

// Driver properties
driver.component            // Main component locator
driver.field               // Input field locator (for InputComponentDriver)
driver.label               // Label locator (for InputComponentDriver)
```

## Testing Patterns and Conventions

### Test Naming Conventions
✅ **Good Examples**:
- `"component renders with basic props"`
- `"component has correct accessibility attributes"`
- `"component handles null and undefined props gracefully"`
- `"labelPosition=start positions label before input"`

❌ **Avoid**:
- `"test component"`
- `"basic test"`
- Generic or unclear test names

### Skip Reason System

Use the structured `SKIP_REASON` system to document why tests are skipped:

```typescript
test.skip(
  "test name", 
  SKIP_REASON.TO_BE_IMPLEMENTED("Optional description"),
  async ({}) => {}
);
```

#### Available Skip Reasons:
- `SKIP_REASON.TO_BE_IMPLEMENTED()` - Features not yet implemented
- `SKIP_REASON.XMLUI_BUG("description")` - Known bugs preventing test execution
- `SKIP_REASON.NOT_IMPLEMENTED_XMLUI()` - Not implemented in XMLUI framework
- `SKIP_REASON.TEST_INFRA_BUG()` - Testing infrastructure issues
- `SKIP_REASON.TEST_NOT_WORKING()` - Test itself has issues
- `SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED()` - Test infrastructure missing
- `SKIP_REASON.UNSURE("reason required")` - Uncertain about test purpose/implementation

### Component Testing Approach

#### XMLUI Markup Syntax
Use XMLUI markup syntax in `initTestBed()`:
```typescript
await initTestBed(`<Checkbox label="test" initialValue="true" />`);
await initTestBed(`<Checkbox enabled="false" required="{true}" />`);
```

#### Boolean Props
- Use string values: `enabled="true"` or `enabled="false"`
- Use expression syntax for literal booleans: `autoFocus="{true}"`

#### Complex Markup
```typescript
await initTestBed(`
  <Fragment>
    <Checkbox testId="first" label="First" />
    <Checkbox testId="second" label="Second" />
  </Fragment>
`);
```

## Accessibility Testing Patterns

### Required Accessibility Tests

1. **ARIA Attributes**:
```typescript
test("component has correct accessibility attributes", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox label="Accept terms" />`);
  await expect(page.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
  await expect(page.getByRole("checkbox")).toHaveAttribute("aria-required", "false");
});
```

2. **Keyboard Navigation**:
```typescript
test("component supports keyboard navigation", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox />`);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox")).toBeFocused();
});
```

3. **Keyboard Activation**:
```typescript
test("pressing Space after focus checks the control", async ({ initTestBed, page }) => {
  const checkbox = page.getByRole("checkbox");
  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toBeChecked();
});
```

4. **Label Association**:
```typescript
test("label is associated with input", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox label="test" />`);
  const component = page.getByLabel("test", { exact: true });
  expect(component).toHaveRole("checkbox");
});
```

## Event Testing Patterns

### Event State Management
Use `testStateDriver` to capture and verify events:

```typescript
test("didChange event fires on state change", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(
    `<Checkbox onDidChange="testState = 'changed'" />`
  );
  await page.getByRole("checkbox").click();
  await expect.poll(testStateDriver.testState).toEqual("changed");
});
```

### Event Data Verification
```typescript
test("didChange event passes new value", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(
    `<Checkbox onDidChange="(value) => testState = value" />`
  );
  const checkbox = page.getByRole("checkbox");
  await checkbox.check();
  await expect.poll(testStateDriver.testState).toEqual(true);
});
```

### Common Events to Test
- `onDidChange` - Value/state changes
- `onGotFocus` - Focus events
- `onLostFocus` - Blur events
- Component-specific events

## Edge Case Testing

### Required Edge Cases

1. **Special Characters**:
```typescript
test("handle special characters in label", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox label="Accept terms &amp; conditions &lt;&gt;&amp;" />`);
  await expect(page.locator("label")).toContainText("Accept terms & conditions <>&");
});
```

2. **Unicode Characters**:
```typescript
test("handle Unicode characters in label", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox label="同意条款 ✓" />`);
  await expect(page.locator("label")).toContainText("同意条款 ✓");
});
```

3. **Long Content**:
```typescript
test("component handles very long label text", async ({ initTestBed, page }) => {
  const longLabel = "Very long text that might cause layout issues...";
  await initTestBed(`<Checkbox label="${longLabel}" />`);
  await expect(page.locator("label")).toContainText(longLabel);
});
```

4. **Invalid Props**:
```typescript
test("component handles invalid props gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox labelPosition="invalid" label="test" />`);
  await expect(page.getByLabel("test")).toBeVisible();
});
```

5. **Rapid State Changes**:
```typescript
test("component handles rapid state changes", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox initialValue="false" />`);
  const checkbox = page.getByRole("checkbox");
  await checkbox.click({ clickCount: 10 });
  await expect(checkbox).not.toBeChecked(); // Should end up unchecked
});
```

## Layout Testing Patterns

### Position Testing with `getBounds()`
```typescript
test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox direction="ltr" label="test" labelPosition="start" />`);
  
  const { left: checkboxLeft } = await getBounds(page.getByLabel("test"));
  const { right: labelRight } = await getBounds(page.getByText("test"));
  
  expect(labelRight).toBeLessThan(checkboxLeft);
});
```

### Dimension Testing
```typescript
test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
  const expected = 200;
  await initTestBed(`<Checkbox label="test" labelWidth="${expected}px" />`);
  const { width } = await getBounds(page.getByText("test"));
  expect(width).toEqual(expected);
});
```

## State and Interaction Testing

### State Verification
```typescript
// Checked/unchecked states
await expect(checkbox).toBeChecked();
await expect(checkbox).not.toBeChecked();

// Focus states
await expect(checkbox).toBeFocused();
await expect(checkbox).not.toBeFocused();

// Disabled states
await expect(checkbox).toBeDisabled();
await expect(checkbox).not.toBeDisabled();

// Visibility
await expect(checkbox).toBeVisible();
```

### Special States
```typescript
// Indeterminate state (custom helper)
const indeterminate = await isIndeterminate(page.getByRole("checkbox"));
expect(indeterminate).toBe(true);

// ARIA states
await expect(checkbox).toHaveAttribute("aria-checked", "mixed");
```

### Interaction Testing
```typescript
// Standard clicks
await checkbox.click();

// Forced clicks (for disabled/readonly testing)
await checkbox.click({ force: true });

// Keyboard interactions
await checkbox.press("Space");
await checkbox.press("Enter");

// Focus management
await checkbox.focus();
await checkbox.blur();
```

## Test Data Patterns

### Common Props to Test
- `initialValue` - Initial state
- `enabled` - Enable/disable functionality
- `required` - Required validation
- `readOnly` - Read-only state
- `autoFocus` - Auto-focus behavior
- `label` - Label text and association
- `labelPosition` - Label positioning
- `labelWidth` - Label sizing
- `labelBreak` - Label text wrapping
- `indeterminate` - Special checkbox state
- `validationStatus` - Validation state styling

### Prop Combinations to Test
```typescript
// Conflicting states
test("readOnly is not the same as disabled", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox readOnly="true" enabled="true" />`);
  await expect(page.getByRole("checkbox")).toHaveAttribute("readonly");
  await expect(page.getByRole("checkbox")).not.toBeDisabled();
});

// State combinations
test("indeterminate state with initialValue=true", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox indeterminate="true" initialValue="true" />`);
  const checkbox = page.getByRole("checkbox");
  const indeterminate = await isIndeterminate(checkbox);
  expect(indeterminate).toBe(true);
  await expect(checkbox).toBeChecked();
});
```

## Helper Functions and Utilities

### Layout Helpers
- `getBounds(locator)` - Gets element bounding box for layout testing
- `getComponentTagName(locator)` - Gets element tag name

### State Helpers
- `isIndeterminate(locator)` - Checks checkbox indeterminate state

### Custom Assertions
```typescript
// Use semantic matchers
await expect(element).toBeVisible();
await expect(element).toBeChecked();
await expect(element).toBeFocused();
await expect(element).toHaveAttribute("aria-checked", "true");
await expect(element).toHaveRole("checkbox");
```

### Element Selection Best Practices

#### Direct Element Selection Pattern (Recommended)
**Pattern**: Use direct `page.getByRole()` calls within each test for clarity and explicitness.

```typescript
// ✅ Preferred approach - clear and self-contained
test("component click toggles checked state", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox />`);
  const checkbox = page.getByRole("checkbox");

  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();
});
```

**Benefits**:
- **Explicit**: Each test clearly shows what element it's selecting
- **Self-contained**: No need to look at helper functions to understand element selection
- **Debuggable**: When tests fail, the selector is immediately visible
- **Flexible**: Easy to modify selection strategy per test if needed
- **Standard**: Follows Playwright's recommended patterns

**When to use helper functions**: Only when the selection logic becomes complex (multiple chained selectors, conditional logic, etc.)

### Test Setup Best Practices

#### Inline Test Setup Pattern (Recommended)
**Pattern**: Use direct `initTestBed()` calls within each test for maximum clarity and readability.

```typescript
// ✅ Preferred approach - clear and self-contained
test("initialValue sets checked state", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox initialValue="true" />`);
  await expect(page.getByRole("checkbox")).toBeChecked();
});

test("component with label and disabled state", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox label="Accept terms" enabled="false" />`);
  const checkbox = page.getByRole("checkbox");
  await expect(checkbox).toBeDisabled();
  await expect(page.getByText("Accept terms")).toBeVisible();
});
```

**Benefits**:
- **No mental hopping**: Everything needed to understand the test is right there
- **Self-documenting**: The exact markup being tested is immediately visible
- **Easy debugging**: When tests fail, you can see the exact setup without looking elsewhere
- **Intuitive**: Follows natural reading flow from setup to assertions
- **Flexible**: Each test can have unique setup without abstraction constraints

**Avoid**: Creating helper functions for simple, repetitive setups as they break the straightforward flow of reading tests.

## Theme Testing (Future Implementation)

### Theme Variable Testing Pattern
```typescript
test("component applies theme variables correctly", async ({ initTestBed, createCheckboxDriver }) => {
  await initTestBed(`<Checkbox />`, {
    testThemeVars: {
      "backgroundColor-Checkbox": "rgb(255, 0, 0)",
      "borderColor-Checkbox": "rgb(0, 255, 0)",
    },
  });
  const driver = await createCheckboxDriver();
  
  await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(driver.component).toHaveCSS("border-color", "rgb(0, 255, 0)");
});
```

## Performance Testing Patterns

### Areas to Test (Future Implementation)
- Memory leak prevention
- Rapid user input response
- Rapid prop changes
- Component memoization effectiveness
- Event handler efficiency

## Testing Best Practices

### DO:
1. **Use Descriptive Test Names**: Clearly indicate what behavior is being tested
2. **Test All Props**: Ensure every component prop is tested
3. **Include Edge Cases**: Test with null, undefined, invalid, and extreme values
4. **Focus on Accessibility**: Always include comprehensive accessibility testing
5. **Test State Combinations**: Test how different props interact with each other
6. **Use Semantic Selectors**: Prefer `getByRole()`, `getByLabel()` over CSS selectors
7. **Document Skip Reasons**: Always use `SKIP_REASON` with clear descriptions
8. **Test Event Behavior**: Verify both event firing and event data
9. **Separate Concerns**: Group related tests in describe blocks

### DON'T:
1. **Skip Accessibility**: Never omit accessibility testing
2. **Use Generic Names**: Avoid vague test names like "test component"
3. **Test Implementation Details**: Focus on behavior, not internal implementation
4. **Ignore Error States**: Always test error conditions and edge cases
5. **Make Tests Interdependent**: Each test should be independent and isolated
6. **Hardcode Values**: Use variables for repeated test data
7. **Skip Documentation**: Always document complex test logic
8. **Ignore Browser Differences**: Consider cross-browser compatibility

## Component-Specific Considerations

### For Form Components:
- Test validation states and error handling
- Test required/optional behavior
- Test form submission integration
- Test accessibility for form controls

### For Interactive Components:
- Test all interaction methods (click, keyboard, touch)
- Test disabled/readonly states
- Test focus management
- Test event handling

### For Layout Components:
- Test positioning and sizing
- Test responsive behavior
- Test overflow handling
- Test RTL/LTR support

### For Visual Components:
- Test theme variable application
- Test different visual states
- Test animation/transition behavior
- Test high contrast mode support

This document serves as a comprehensive guide for maintaining consistency and quality in XMLUI component testing.

## Code Quality Analysis of Checkbox.spec.ts

### Duplications Worth Extracting

#### 1. Indeterminate State Testing
**Issue**: Indeterminate testing logic is duplicated:
```typescript
// Repeated in 3 tests:
const indeterminate = await isIndeterminate(checkbox);
expect(indeterminate).toBe(true);
```

#### 2. ARIA Attribute Testing
**Issue**: ARIA attribute assertions follow the same pattern:
```typescript
// Repeated pattern:
await expect(page.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
await expect(page.getByRole("checkbox")).toHaveAttribute("aria-required", "true");
```

### Missing Test Cases

#### 1. Component Props Not Tested
- **`description` prop**: Defined in metadata but no tests exist
- **`direction` prop**: Only used in label positioning tests, not tested independently
- **`testId` prop**: Used in Fragment test but not tested as a standalone feature

#### 2. Missing Prop Combinations
- `required` + `disabled` combination
- `indeterminate` + `disabled` combination  
- `autoFocus` + `disabled` combination
- `readOnly` + `required` combination

#### 3. Missing Edge Cases
- Empty string values for props: `label=""`, `labelWidth=""`
- Zero values: `labelWidth="0px"`
- Negative values: `labelWidth="-10px"`
- Very large values: `labelWidth="9999px"`

#### 4. Missing Interaction Tests
- Double-click behavior
- Right-click behavior (should not change state)
- Mouse hover effects
- Touch/mobile interaction

#### 5. Missing Accessibility Tests
- High contrast mode support
- Screen reader announcements
- Color-only information dependencies
- Focus order in complex layouts

#### 6. Missing State Transition Tests
- `enabled="false"` → `enabled="true"` state change
- `readOnly="true"` → `readOnly="false"` state change
- Dynamic `indeterminate` state changes
- Dynamic `label` changes

#### 7. Missing Browser Behavior Tests
- Form submission with checkbox values
- Form reset behavior
- Form validation integration
- Browser autocomplete behavior

### Inconsistencies Between Test Titles and Activities

#### 1. Misleading Test Names
**Test**: `"checked component validationStatus=valid shows error styling"`
**Issue**: Title says "error styling" but should say "valid styling"

**Test**: `"checked component validationStatus=warning shows error styling"`  
**Issue**: Title says "error styling" but should say "warning styling"

#### 2. Incomplete Test Names
**Test**: `"enabled=false disables interaction"`
**Issue**: Only tests click interaction, title suggests all interactions

**Test**: `"readOnly prevents state changes"`
**Issue**: Only tests click, should specify "click interactions"

#### 3. Vague Test Names
**Test**: `"readOnly"`
**Issue**: Doesn't specify what aspect of readOnly is being tested (should be "readOnly adds readonly attribute")

### Opportunities for Simplification

#### 1. Reduce Repeated Assertions
**Current**:
```typescript
await expect(page.getByRole("checkbox")).toHaveAttribute("readonly");
await expect(page.getByRole("checkbox")).not.toBeDisabled();
```
**Simplified**:
```typescript
const checkbox = page.getByRole("checkbox");
await expect(checkbox).toHaveAttribute("readonly");
await expect(checkbox).not.toBeDisabled();
```

#### 2. Combine Related Assertions
**Current** (separate tests):
```typescript
test("aria-checked=false applies correctly", ...)
test("aria-checked=true applies correctly", ...)
```
**Simplified** (single test):
```typescript
test("aria-checked attribute reflects checkbox state", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox />`);
  const checkbox = page.getByRole("checkbox");
  
  await expect(checkbox).toHaveAttribute("aria-checked", "false");
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("aria-checked", "true");
});
```

#### 3. Use More Specific Selectors
**Current**:
```typescript
await expect(page.locator("label")).toContainText("Accept terms");
```
**Simplified**:
```typescript
await expect(page.getByText("Accept terms")).toBeVisible();
```

#### 4. Extract Test Data
**Current**: Inline test data scattered throughout
**Simplified**: Extract to constants at the top:
```typescript
const TEST_LABELS = {
  BASIC: "test",
  SPECIAL_CHARS: "Accept terms &amp; conditions &lt;&gt;&amp;",
  UNICODE: "同意条款 ✓",
  LONG: "This is a very long label that might cause layout issues..."
};
```

#### 5. Consolidate Similar Test Groups
**Current**: Separate `autoFocus` tests for with/without label
**Simplified**: Single test with both scenarios or use `test.each()` for variations

### Additional Code Quality Issues

#### 1. Inconsistent Prop Syntax
**Issue**: Mixed usage of string vs expression syntax:
```typescript
autoFocus="{true}"     // Expression syntax
enabled="false"        // String syntax  
required="{true}"      // Expression syntax
indeterminate="true"   // String syntax
```
**Recommendation**: Establish consistent pattern (prefer string syntax for boolean props)

#### 2. Inconsistent Variable Naming
**Issue**: Sometimes `checkbox`, sometimes direct `page.getByRole("checkbox")`
**Recommendation**: Always use consistent variable names

#### 3. Missing Test Documentation
**Issue**: Complex tests (like label positioning) lack explanatory comments
**Recommendation**: Add comments explaining the positioning logic

### Recommended Improvements Summary

1. **Extract Common Patterns**: Create helper functions for repeated element selection and assertion patterns
2. **Add Missing Tests**: Cover all component props, edge cases, and interaction scenarios  
3. **Fix Test Names**: Ensure test titles accurately describe the test behavior
4. **Simplify Assertions**: Reduce duplication and combine related assertions
5. **Standardize Prop Syntax**: Use consistent boolean prop syntax throughout
6. **Add Documentation**: Comment complex test logic, especially layout tests
7. **Group Related Tests**: Use `test.each()` for variations of the same concept
8. **Extract Test Data**: Move repeated test data to constants
