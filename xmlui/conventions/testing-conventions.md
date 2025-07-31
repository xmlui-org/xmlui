# XMLUI Component Testing Conventions

This document outlines the testing conventions and standards for XMLUI components using Playwright for end-to-end testing. This is the official reference for the development team.

## File Organization Standards

### File Location and Naming
- **Location**: Test files MUST be placed in the same directory as the component implementation
- **Component Location**: Components are in the `xmlui/src/components` folder, each component in its own folder
- **Naming**: Use `ComponentName.spec.ts` format
- **Example**: For `Button.tsx`, create `Button.spec.ts` in the same folder

### Import Structure
```typescript
import { test, expect } from "../../testing/fixtures";
import { ComponentDriverName } from "../../testing/ComponentDrivers";
```

## Mandatory Test Structure

All component test files MUST follow this exact structure with these six categories:

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

## XMLUI-Specific Conventions

### Event Handler Naming (CRITICAL)
**ALWAYS use "on" prefix for all event handlers:**
```typescript
// ✅ CORRECT
onClick="testState = 'clicked'"
onWillOpen="testState = 'opening'"
onValueChange="testState = value"

// ❌ INCORRECT
click="testState = 'clicked'"
willOpen="testState = 'opening'"
valueChange="testState = value"
```

### Template Properties (CRITICAL)
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

### Radix UI Component Testing
For components using Radix UI (DropdownMenu, Popover, Dialog, etc.):
**ALWAYS use page-level selectors in drivers:**
```typescript
// ✅ CORRECT - Radix renders outside component
getTrigger() {
  return this.page.getByRole('button');
}

// ❌ INCORRECT - Won't find Radix elements
getTrigger() {
  return this.component.locator('button');
}
```

## Testing Framework Components

### Core Testing Functions
- **`initTestBed`**: Sets up component with XMLUI markup and optional theme variables
- **`createComponentDriver`**: Creates driver instances for component interaction
- **`expect.poll()`**: Used for async state verification
- **`testStateDriver`**: Handles test state management for event testing

### Standard Test Pattern
```typescript
test("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName prop="value"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Expected Content");
});
```

## Required Test Categories

### 1. Basic Functionality (REQUIRED)
Test core component behavior and prop handling:
```typescript
test("component prop changes update display correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName size="sm"/>`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toHaveCSS("width", "48px");
});
```

### 2. Accessibility (REQUIRED)
**EVERY component MUST have accessibility tests:**
```typescript
test("component has correct accessibility attributes", async ({ initTestBed, createComponentDriver, page }) => {
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

### 3. Visual States & Themes (REQUIRED)
**EVERY component MUST test theme variables:**
```typescript
test("component applies theme variables", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName/>`, {
    testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" }
  });
  const driver = await createComponentDriver();
  await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
```

### 4. Edge Cases (REQUIRED)
**EVERY component MUST handle edge cases:**
```typescript
test("component handles null props gracefully", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName/>`);
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});

test("component handles special characters", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName label="Test with émojis 🚀 & quotes"/>`);
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});
```

### 5. Performance (REQUIRED)
Test component efficiency and stability:
```typescript
test("component memoization prevents unnecessary re-renders", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`<ComponentName onClick="testState = ++testState || 1"/>`);
  const driver = await createComponentDriver();
  
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual(1);
  
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual(2);
});
```

### 6. Integration (REQUIRED)
Test component behavior in different contexts:
```typescript
test("component works in layout contexts", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`
    <VStack>
      <ComponentName label="Layout Test"/>
    </VStack>
  `);
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});
```

## Test Naming Standards

### Descriptive Test Names (REQUIRED)
- ✅ `"component renders with basic props"`
- ✅ `"component has correct accessibility attributes"`
- ✅ `"component handles null and undefined props gracefully"`
- ❌ `"test component"`
- ❌ `"basic test"`

### Naming Patterns
- **Behavior Tests**: `"component {verb} {feature} {when/with} {condition}"`
- **Property Tests**: `"component prioritizes {specific-prop} over {general-prop}"`
- **State Tests**: `"component handles {state-name} state correctly"`

## Common Testing Patterns

### Data Type Handling (Input Components)
```typescript
test("accepts different data types", async ({ initTestBed, page }) => {
  await initTestBed(`<TextBox initialValue="{123}" />`);
  await expect(page.getByRole("textbox")).toHaveValue("123");
  
  await initTestBed(`<TextBox initialValue="{null}" />`);
  await expect(page.getByRole("textbox")).toHaveValue("");
});
```

### Event Handler Parameter Access (CRITICAL)
**ALWAYS use arrow function syntax for accessing event parameters:**
```typescript
// ✅ CORRECT - Arrow function syntax works in XMLUI
test("component event handlers work correctly", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ExpandableItem onExpandedChange="arg => testState = arg">Content</ExpandableItem>
  `, {});
  const driver = await createComponentDriver();
  
  await driver.getSummary().click();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

// ❌ INCORRECT - arguments object doesn't work in XMLUI context
onExpandedChange="testState = arguments[0]"
onClick="testState = arguments[0].type"
onValueChange="testState = arguments[0]"
```

### API Testing Pattern
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

### Force Click for UI Overlays
```typescript
// Use when elements are intercepted by overlays
await page.getByTestId("button").click({ force: true });
```

### Component Organization (Large Components)
```typescript
test.describe("Basic Functionality", () => { /* core tests */ });
test.describe("Accessibility", () => { /* a11y tests */ });
test.describe("API", () => { /* programmatic tests */ });
```

## CSS Testing Standards

### Browser Normalization
```typescript
// ✅ Use exact browser values
await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
await expect(component).toHaveCSS("box-shadow", "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px");

// ❌ Don't use shorthand that might not match
await expect(component).toHaveCSS("background-color", "red");
```

## Test Execution Standards

### Required Commands
```bash
# Standard test execution
npx playwright test ComponentName.spec.ts

# Category-specific testing
npx playwright test ComponentName.spec.ts --grep "accessibility"
npx playwright test ComponentName.spec.ts --grep "edge case"

# Parallel execution for performance
npx playwright test ComponentName.spec.ts --workers=7

# Development/debugging (recommended during test creation)
npx playwright test ComponentName.spec.ts --reporter=dot
```

## Best Practices (Team Standards)

### DO (REQUIRED):
- **Test Isolation**: Each test must be independent
- **Descriptive Names**: Use clear, specific test descriptions
- **Comprehensive Coverage**: Test all props, states, edge cases
- **Accessibility First**: Always include a11y testing
- **Functional Testing**: Test behavior, not implementation
- **Standard Selectors**: Use `page.getByRole()`, `page.getByLabel()`

### DON'T (PROHIBITED):
- **Skip Edge Cases**: Never skip tests for null/undefined handling
- **Test Implementation**: Don't test internal details like `aria-labelledby` for standard forms
- **Create Dependencies**: Never create tests that depend on execution order
- **Generic Names**: Never use vague test descriptions
- **Skip Accessibility**: Accessibility testing is mandatory for all components

## Test.Skip Convention

Use `test.skip` for comprehensive coverage with review notes:
```typescript
test.skip("advanced feature behavior", async ({ initTestBed, page }) => {
  // TODO: review these tests for accuracy
  // Full test implementation here...
});
```

## Advanced Testing Patterns

### Component-Specific Strategies
- **Form Inputs**: Test data coercion, validation, user interaction, accessibility
- **Interactive Components**: Test all states, keyboard/mouse events, visual transitions  
- **Layout Components**: Test arrangement, spacing, responsive behavior, nesting
- **Composite Components**: Test sub-component interactions, data flow, performance
- **Text Components**: Test value vs content prop precedence, whitespace handling, variant rendering

### Large Test Suite Creation
1. **Analyze Similar Components** for reusable patterns
2. **Use `test.describe()`** for logical grouping
3. **Test Data Types** comprehensively for input components
4. **Choose Appropriate Tools**: `page.getByRole()` vs component drivers

### Test Suite Restructuring Patterns
```typescript
// Organize with test.describe() blocks for clarity
test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, createComponentDriver }) => {
    // Implementation
  });
});

test.describe("Accessibility", () => {
  test("supports proper semantic HTML variants", async ({ initTestBed, createComponentDriver }) => {
    // Implementation
  });
});
```

### Component Variant Testing
```typescript
// Test all variants systematically
Object.entries(ComponentVariantEnum).forEach(([variant, htmlElement]) => {
  test(`variant=${variant} renders correct HTML element: ${htmlElement}`, async ({
    initTestBed,
    createComponentDriver,
  }) => {
    await initTestBed(`<ComponentName variant="${variant}" />`);
    const driver = await createComponentDriver();
    
    const tagName = await driver.getComponentTagName();
    expect(tagName).toEqual(htmlElement);
  });
});
```

### Data Type Comprehensive Testing
```typescript
[
  { label: "undefined", value: "'{undefined}'", toExpected: "" },
  { label: "null", value: "'{null}'", toExpected: "" },
  { label: "empty string", value: "''", toExpected: "" },
  { label: "string", value: "'test'", toExpected: "test" },
  { label: "integer", value: "'{1}'", toExpected: "1" },
  { label: "float", value: "'{1.2}'", toExpected: "1.2" },
  { label: "boolean", value: "'{true}'", toExpected: "true" },
].forEach(({ label, value, toExpected }) => {
  test(`handles ${label} value prop correctly`, async ({
    initTestBed,
    createComponentDriver,
  }) => {
    await initTestBed(`<ComponentName value=${value} />`);
    const driver = await createComponentDriver();
    await expect(driver.component).toHaveText(toExpected);
  });
});
```

## Common Issues & Solutions

### Event Handler Parameter Access Issues
**Problem**: Tests fail when using `arguments[0]` to access event parameters in XMLUI markup.
**Solution**: Use arrow function syntax instead: `onEvent="param => testState = param"`. The `arguments` object doesn't work in XMLUI's JavaScript evaluation context.

### FileInput Component Testing Issues
**Problem**: Focus/blur events don't fire on the expected elements in FileInput tests.
**Solution**: FileInput uses a complex structure with dropzone integration. Focus events may need to target the correct button element or be skipped if the event handling is internal to the component. Use `test.skip()` for problematic event tests and focus on functional behavior instead.

### Label Association Testing
**Problem**: Tests fail checking `aria-labelledby` on form inputs.
**Solution**: Use `page.getByLabel()` for functional testing. XMLUI uses standard HTML `<label htmlFor="id">` association.

### CSS Testing
**Problem**: CSS values don't match due to browser normalization.
**Solution**: Use exact browser values: `"rgb(255, 0, 0)"` not `"red"`.

### Test Execution
**Problem**: Tests fail from wrong directory.
**Solution**: Run from workspace root, verify import paths.

This document provides the official testing standards and reference patterns for XMLUI component development. All team members must follow these conventions to ensure consistent, high-quality testing across all components.
