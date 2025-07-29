# XMLUI Component Testing Conventions

This document outlines the testing conventions for XMLUI components using Playwright for end-to-end testing.

## Test File Organization

### File Location and Naming
- **Location**: Test files MUST be placed in the same directory as the component implementation
- **Component Location**: Components can be found in the `xmlui/src/components` folder, each component in its own folder
- **Naming**: Use `ComponentName.spec.ts` format
- **Example**: For `Button.tsx`, create `Button.spec.ts` in the same folder

### Import Structure
```typescript
import { test, expect } from "../../testing/fixtures";
import { getElementStyle } from "../../testing/component-test-helpers";
```

## Test Structure and Categories

Organize tests using clear section separators and these mandatory categories:

```typescript
// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

// =============================================================================
// INTEGRATION TESTS
// =============================================================================
```

## Test Framework Components

### Core Testing Functions
- **`initTestBed`**: Sets up component with XMLUI markup and optional theme variables
- **`createComponentDriver`**: Creates driver instances for component interaction
- **`expect.poll()`**: Used for async state verification
- **`testStateDriver`**: Handles test state management for event testing

### Basic Test Pattern
```typescript
test("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName prop="value"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Expected Content");
});
```

## Test Categories and Patterns

### 1. Basic Functionality Tests
Test core component behavior and prop handling:

```typescript
test("component prop changes update display correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName size="sm"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveCSS("width", "48px");
});
```

### 2. Accessibility Tests (REQUIRED)
Always include comprehensive accessibility testing:

```typescript
test("component has correct accessibility attributes", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName label="Test Label"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveAttribute('aria-label', 'Test Label');
  await expect(driver.component).toHaveAttribute('role', 'button');
});

test("label is properly associated with input", async ({ initTestBed, page }) => {
  const label = "Test Label";
  await initTestBed(`<ComponentName label="${label}"/>`);
  const component = page.getByLabel(label);
  await expect(component).toHaveRole('button'); // Use appropriate role for component
});

test("component is keyboard accessible when interactive", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName onClick="testState = 'keyboard-activated'"/>
  `, {});
  
  const driver = await createComponentDriver();
  
  await driver.component.focus();
  await expect(driver.component).toBeFocused();
  
  await driver.component.press('Enter');
  await expect.poll(testStateDriver.testState).toEqual('keyboard-activated');
});
```

### 3. Visual State Tests
Test different visual configurations and theme variables:

```typescript
test("component applies theme variables correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName/>`, {
    testThemeVars: {
      "backgroundColor-ComponentName": "rgb(255, 0, 0)",
      "textColor-ComponentName": "rgb(0, 255, 0)",
    },
  });
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(driver.component).toHaveCSS("color", "rgb(0, 255, 0)");
});
```

### 4. Edge Case Tests (CRITICAL)
Test boundary conditions and error scenarios:

```typescript
test("component handles null and undefined props gracefully", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toBeVisible();
  
  await initTestBed(`<ComponentName prop=""/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toBeVisible();
});

test("component handles special characters correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="José María!@#$"/>`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});
```

### 5. Event Handling Tests
Test component interactions and state changes:

```typescript
test("component handles events correctly", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName onClick="testState = 'clicked'"/>
  `, {});
  
  const driver = await createComponentDriver();
  await driver.component.click();
  
  await expect.poll(testStateDriver.testState).toEqual('clicked');
});
```

## Test Naming Conventions

### Descriptive Test Names
- ✅ `"component renders with basic props"`
- ✅ `"component has correct accessibility attributes"`
- ✅ `"component handles null and undefined props gracefully"`
- ❌ `"test component"`
- ❌ `"basic test"`

### Naming Patterns
- **Behavior Tests**: `"{verb} {feature} {when/with} {condition}"`
- **Property Tests**: `"prioritizes {specific-prop} over {general-prop}"`
- **State Tests**: `"handles {state-name} state correctly"`

## Common Testing Patterns

### State Management Testing
```typescript
test("updates state using API", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <ComponentName id="comp" initialValue="{{ counter: 0 }}" />
      <Button testId="btn" onClick="comp.update({ counter: comp.value.counter + 1 })">
        Increment
      </Button>
      <Text testId="value">{JSON.stringify(comp.value)}</Text>
    </Fragment>
  `);

  await expect(page.getByTestId("value")).toHaveText('{"counter":0}');
  await page.getByTestId("btn").click();
  await expect(page.getByTestId("value")).toHaveText('{"counter":1}');
});
```

### Form Control Testing
```typescript
test("form control toggles state correctly", async ({ initTestBed, page }) => {
  await initTestBed(`<Checkbox />`);
  const checkbox = page.getByRole("checkbox");

  await expect(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.click();
  await expect(checkbox).not.toBeChecked();
});
```

### CSS Property Verification
```typescript
// Handle browser normalization - use specific expected values
await expect(component).toHaveCSS("box-shadow", "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px");
await expect(component).toHaveCSS("border-radius", "4px");
```

### Label Association Testing
For form components with labels, use functional testing rather than attribute checking:

```typescript
// ✅ CORRECT: Test functional label association
test("label is properly associated with input", async ({ initTestBed, page }) => {
  const label = "Test Label";
  await initTestBed(`<ComponentName label="${label}"/>`);
  const component = page.getByLabel(label);
  await expect(component).toHaveRole('switch'); // Use appropriate role
});

// ❌ INCORRECT: Don't test for aria-labelledby unless specifically required
test("should not test aria-labelledby for standard form inputs", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName label="Test Label"/>`);
  const component = page.getByRole('switch');
  // This is wrong for standard HTML form elements:
  const labelId = await component.getAttribute("aria-labelledby");
  expect(labelId).toBeTruthy(); // This will fail for standard htmlFor/id association
});
```

**Important**: HTML form inputs use the standard `<label htmlFor="id">` and `<input id="id">` association pattern. Only test for `aria-labelledby` when the component specifically implements ARIA-based labeling instead of standard HTML semantics.

## Test Execution

### Running Tests
```bash
# Run all tests for a component
npx playwright test ComponentName.spec.ts

# Run specific test categories
npx playwright test ComponentName.spec.ts --grep "accessibility"
npx playwright test ComponentName.spec.ts --grep "edge case"

# Run tests in parallel
npx playwright test ComponentName.spec.ts --workers=7
```

## Test Organization Best Practices

### DO:
1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Comprehensive Coverage**: Cover all props, states, and edge cases
4. **Accessibility Focus**: Always include accessibility testing
5. **Performance Awareness**: Include performance-critical scenarios
6. **Error Handling**: Test error conditions and graceful degradation

### DON'T:
1. **Skip Edge Cases**: Don't skip tests for null/undefined props
2. **Ignore Accessibility**: Never skip accessibility testing
3. **Test Interdependence**: Avoid tests that depend on execution order
4. **Incomplete Coverage**: Don't leave component props or behaviors untested
5. **Vague Test Names**: Avoid generic test names
6. **Test Implementation Details**: Don't test `aria-labelledby` for standard HTML form elements that use `htmlFor`/`id` association

## Component-Specific Considerations

### For Form Components:
- Test all input states (checked/unchecked, enabled/disabled, valid/invalid)
- Test keyboard navigation and accessibility
- Test form validation and error states
- Test programmatic API methods (setValue, getValue)

### For Visual Components:
- Test different size variants
- Test theme variable application
- Test responsive behavior
- Test image loading and fallback states

### For Interactive Components:
- Test click, hover, focus, and keyboard interactions
- Test event handling and state changes
- Test disabled/non-interactive states
- Test ARIA attributes and roles

## Skeleton Test Creation

When creating comprehensive test coverage for existing components:

1. **Organize existing tests** into appropriate categories
2. **Create skipped tests** for missing coverage using `.skip` modifier
3. **Include TODO comments**: `// TODO: review these Copilot-created tests`
4. **Implement complete test bodies** even for skipped tests
5. **Follow naming conventions** for all tests

**Important**: When creating new tests for a component, always use `test.skip(...)` and add a TODO comment at the top of the test method body so that someone can review it before enabling the test.

Example skeleton test:
```typescript
test.skip("component handles keyboard navigation correctly", async ({ initTestBed, createComponentDriver }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <ComponentName onKeyDown="testState = 'key-pressed'"/>
  `, {});
  
  const driver = await createComponentDriver();
  await driver.component.focus();
  await driver.component.press('Enter');
  
  await expect.poll(testStateDriver.testState).toEqual('key-pressed');
});
```

This approach ensures comprehensive test coverage while maintaining clear organization and providing a roadmap for future test implementation.

## Common Testing Issues and Solutions

### Label Association Test Failures
**Problem**: Test fails when checking for `aria-labelledby` attribute on form inputs.

**Solution**: Use functional testing with `page.getByLabel()` instead:
```typescript
// ✅ Works with standard HTML form elements
const label = "My Label";
await initTestBed(`<ComponentName label="${label}"/>`);
const component = page.getByLabel(label);
await expect(component).toHaveRole('switch');
```

**Explanation**: XMLUI components use standard HTML `<label htmlFor="id">` and `<input id="id">` association, not ARIA-based labeling.

### Test Execution Context
**Problem**: Tests fail when run from wrong directory or can't find component drivers.

**Solution**: 
- Always run component tests from the component's directory or workspace root
- Verify import paths are correct: `import { test, expect } from "../../testing/fixtures";`
- Check that the appropriate component driver exists in the testing fixtures

### Theme Variable Testing
**Problem**: CSS values don't match expected format due to browser normalization.

**Solution**: Use exact browser-normalized values:
```typescript
// ✅ Use exact expected values
await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
// ❌ Don't use CSS shorthand that browsers might normalize differently
await expect(component).toHaveCSS("background-color", "red");
```
