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

## Test Categories (Required)

### 1. Basic Functionality
```typescript
test("component prop changes update display correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName size="sm"/>`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toHaveCSS("width", "48px");
});
```

### 2. Accessibility (REQUIRED)
```typescript
test("label is properly associated with input", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName label="Test Label"/>`);
  const component = page.getByLabel("Test Label");
  await expect(component).toHaveRole('button');
});

test("component is keyboard accessible", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`<ComponentName onClick="testState = 'activated'"/>`);
  const driver = await createComponentDriver();
  
  await driver.component.focus();
  await driver.component.press('Enter');
  await expect.poll(testStateDriver.testState).toEqual('activated');
});
```

### 3. Visual States & Themes
```typescript
test("component applies theme variables", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName/>`, {
    testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" }
  });
  const driver = await createComponentDriver();
  await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
```

### 4. Edge Cases (CRITICAL)
```typescript
test("component handles null props gracefully", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName/>`);
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});
```

### 5. Events & Performance
```typescript
test("component handles events correctly", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`<ComponentName onClick="testState = 'clicked'"/>`);
  const driver = await createComponentDriver();
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual('clicked');
});
```

### 6. Integration
Test component behavior in different contexts and with other components.

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

## Testing Patterns

### Data Type Handling (Input Components)
```typescript
test("accepts different data types", async ({ initTestBed, page }) => {
  await initTestBed(`<TextBox initialValue="{123}" />`);
  await expect(page.getByRole("textbox")).toHaveValue("123");
  
  await initTestBed(`<TextBox initialValue="{null}" />`);
  await expect(page.getByRole("textbox")).toHaveValue("");
});
```

### API Testing
```typescript
test("programmatic control works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <TextBox id="input" />
      <Button testId="focusBtn" onClick="input.focus()">Focus</Button>
    </Fragment>
  `);
  
  await page.getByTestId("focusBtn").click();
  await expect(page.getByRole("textbox")).toBeFocused();
});
```

### Component Organization (Large Components)
```typescript
test.describe("Basic Functionality", () => { /* core tests */ });
test.describe("Accessibility", () => { /* a11y tests */ });
test.describe("API", () => { /* programmatic tests */ });
```

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

## Best Practices

### DO:
- **Test Isolation**: Each test independent
- **Descriptive Names**: Clear, specific test descriptions
- **Comprehensive Coverage**: All props, states, edge cases
- **Accessibility First**: Always include a11y testing
- **Functional Testing**: Test behavior, not implementation
- **Use Standard Selectors**: `page.getByRole()`, `page.getByLabel()`

### DON'T:
- **Skip Edge Cases**: Always test null/undefined handling
- **Test Implementation**: Don't test `aria-labelledby` for standard HTML forms
- **Create Dependencies**: Avoid test interdependence
- **Generic Names**: Avoid vague test descriptions

## Test.Skip Convention

Use `test.skip` for comprehensive test coverage with review requirement:

```typescript
test.skip("advanced feature behavior", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests
  // Full test implementation here...
});
```

## Common Issues & Solutions

### Label Association Testing
**Problem**: Tests fail checking `aria-labelledby` on form inputs.
**Solution**: Use `page.getByLabel()` for functional testing. XMLUI uses standard HTML `<label htmlFor="id">` association.

### CSS Testing
**Problem**: CSS values don't match due to browser normalization.
**Solution**: Use exact browser values: `"rgb(255, 0, 0)"` not `"red"`.

### Test Execution
**Problem**: Tests fail from wrong directory.
**Solution**: Run from workspace root, verify import paths.

## Advanced Patterns

### Component-Specific Strategies
- **Form Inputs**: Test data coercion, validation, user interaction, accessibility
- **Interactive**: Test all states, keyboard/mouse events, visual transitions  
- **Layout**: Test arrangement, spacing, responsive behavior, nesting
- **Composite**: Test sub-component interactions, data flow, performance

### Large Test Suite Creation
1. **Analyze Similar Components** for reusable patterns
2. **Replace Scattered Tests** with organized six-category structure
3. **Use `test.describe()`** for logical grouping
4. **Test Data Types** comprehensively for input components
5. **Choose Appropriate Tools**: `page.getByRole()` vs component drivers

### File Management
For complete test file replacement: Use `rm` + `create_file` rather than large string replacements.

This systematic approach ensures comprehensive, maintainable test coverage while building on proven patterns.
