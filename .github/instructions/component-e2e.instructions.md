---
applyTo: '**'
---
# Component End-to-End Testing Instructions

I want to create comprehensive end-to-end tests for XMLUI components using Playwright. This instruction file provides all the necessary context and patterns for creating thorough test suites that ensure component reliability, accessibility, and performance.

## Testing Framework and Setup

XMLUI components use Playwright for end-to-end testing with a custom test framework that includes:

- **`initTestBed`**: Sets up component with XMLUI markup and optional theme variables
- **`createComponentDriver`**: Creates driver instances for component interaction
- **`expect.poll()`**: Used for async state verification
- **`testStateDriver`**: Handles test state management for event testing

## Test Structure and Organization

Follow this structured approach for organizing component tests:

### 1. Test File Organization
```typescript
// Component.spec.ts structure
import { test, expect } from '@playwright/test';

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

### 2. Test Naming Convention
Use descriptive test names that clearly indicate what behavior is being tested:
- ✅ `"component renders with basic props"`
- ✅ `"component has correct accessibility attributes"`
- ✅ `"component handles null and undefined props gracefully"`
- ❌ `"test component"`
- ❌ `"basic test"`

## Comprehensive Test Coverage Categories

### 1. Basic Functionality Tests
Test core component behavior and prop handling:

```typescript
test("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName prop="value"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.component).toContainText("Expected Content");
});

test("component prop changes update display correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName size="sm"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveCSS("width", "48px");
  
  await initTestBed(`<ComponentName size="lg"/>`, {});
  const driver2 = await createComponentDriver();
  
  await expect(driver2.component).toHaveCSS("width", "96px");
});
```

### 2. Accessibility Tests (REQUIRED)
Always include comprehensive accessibility testing:

```typescript
test("component has correct accessibility attributes", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="Test User"/>`, {});
  const driver = await createComponentDriver();
  
  await expect(driver.component).toHaveAttribute('aria-label', 'Expected Label');
  await expect(driver.component).toHaveAttribute('role', 'expected-role');
});

test("component is keyboard accessible when interactive", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName 
      name="Test User"
      onClick="testState = 'keyboard-activated'"
    />
  `, {});
  
  const driver = await createComponentDriver();
  
  // Test focus management
  await driver.component.focus();
  await expect(driver.component).toBeFocused();
  
  // Test keyboard activation
  await driver.component.press('Enter');
  await expect.poll(testStateDriver.testState).toEqual('keyboard-activated');
});

test("non-interactive component is not focusable", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="Non Interactive"/>`, {});
  const driver = await createComponentDriver();
  
  const tabIndex = await driver.component.getAttribute('tabindex');
  expect(tabIndex).not.toBe('0');
  
  await driver.component.focus();
  await expect(driver.component).not.toBeFocused();
});
```

### 3. Visual State Tests
Test different visual configurations and state transitions:

```typescript
test("component handles different visual states", async ({ initTestBed, createComponentDriver }) => {
  // Test initial state
  await initTestBed(`<ComponentName state="initial"/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toHaveClass(/initial-state/);
  
  // Test changed state
  await initTestBed(`<ComponentName state="changed"/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toHaveClass(/changed-state/);
});

test("component transitions smoothly between states", async ({ initTestBed, createComponentDriver }) => {
  // Test state A
  await initTestBed(`<ComponentName mode="modeA"/>`, {});
  const driverA = await createComponentDriver();
  await expect(driverA.component).toBeVisible();
  
  // Test state B
  await initTestBed(`<ComponentName mode="modeB"/>`, {});
  const driverB = await createComponentDriver();
  await expect(driverB.component).toBeVisible();
  
  // Verify transition worked correctly
  const tagName = await driverB.getComponentTagName();
  expect(tagName).toBe("expected-element");
});
```

### 4. Edge Case Tests (CRITICAL)
Test boundary conditions and error scenarios:

```typescript
test("component handles null and undefined props gracefully", async ({ initTestBed, createComponentDriver }) => {
  // Test with undefined props
  await initTestBed(`<ComponentName/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toBeVisible();
  
  // Test with empty string props
  await initTestBed(`<ComponentName prop=""/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toBeVisible();
});

test("component handles special characters correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="José María"/>`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
  // Test specific behavior with special characters
});

test("component handles very long input values", async ({ initTestBed, createComponentDriver }) => {
  const longValue = "Very long value that might cause issues with component rendering or processing";
  await initTestBed(`<ComponentName value="${longValue}"/>`, {});
  const driver = await createComponentDriver();
  await expect(driver.component).toBeVisible();
});
```

### 5. Performance Tests
Test memoization, efficient updates, and memory stability:

```typescript
test("component memoization prevents unnecessary re-renders", async ({ initTestBed, createComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName 
      name="Test User"
      onClick="testState = ++testState || 1"
    />
  `, {});
  
  const driver = await createComponentDriver();
  
  // Test that memoization works through stable behavior
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual(1);
  
  await driver.component.click();
  await expect.poll(testStateDriver.testState).toEqual(2);
  
  // Component should maintain consistent behavior
  await expect(driver.component).toBeVisible();
});

test("component handles rapid prop changes efficiently", async ({ initTestBed, createComponentDriver }) => {
  // Test multiple rapid prop changes
  await initTestBed(`<ComponentName prop="value1"/>`, {});
  const driver1 = await createComponentDriver();
  await expect(driver1.component).toBeVisible();
  
  await initTestBed(`<ComponentName prop="value2"/>`, {});
  const driver2 = await createComponentDriver();
  await expect(driver2.component).toBeVisible();
  
  // Verify final state is correct
  await expect(driver2.component).toContainText("Expected Final Content");
});

test("component memory usage stays stable", async ({ initTestBed, createComponentDriver }) => {
  // Test multiple instances don't cause memory leaks
  const configurations = [
    { name: "User 1", size: "sm" },
    { name: "User 2", size: "md" },
    { name: "User 3", size: "lg" }
  ];
  
  for (const config of configurations) {
    await initTestBed(`<ComponentName name="${config.name}" size="${config.size}"/>`, {});
    const driver = await createComponentDriver();
    await expect(driver.component).toBeVisible();
  }
  
  // Verify final state is clean
  await initTestBed(`<ComponentName name="Final Test"/>`, {});
  const finalDriver = await createComponentDriver();
  await expect(finalDriver.component).toBeVisible();
});
```

### 6. Integration Tests
Test component behavior in different contexts:

```typescript
test("component works correctly in different layout contexts", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="Layout Test"/>`, {});
  const driver = await createComponentDriver();
  
  // Test basic layout integration
  await expect(driver.component).toBeVisible();
  
  // Test bounding box and dimensions
  const boundingBox = await driver.component.boundingBox();
  expect(boundingBox).not.toBeNull();
  expect(boundingBox!.width).toBeGreaterThan(0);
  expect(boundingBox!.height).toBeGreaterThan(0);
});
```

## Common Testing Patterns

### Theme Variable Testing
```typescript
test("component applies theme variables correctly", async ({ initTestBed, createComponentDriver }) => {
  await initTestBed(`<ComponentName name="Theme Test"/>`, {
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

### CSS Property Verification
```typescript
// Handle browser normalization - use specific expected values
await expect(component).toHaveCSS("box-shadow", "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px");
await expect(component).toHaveCSS("border-radius", "4px");
```

### Event Handling Testing
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

## Test Execution Commands

### Run All Tests
```bash
npx playwright test ComponentName.spec.ts
```

### Run Specific Test Categories
```bash
npx playwright test ComponentName.spec.ts --grep "accessibility"
npx playwright test ComponentName.spec.ts --grep "edge case"
npx playwright test ComponentName.spec.ts --grep "performance"
```

### Run Tests in Parallel
```bash
npx playwright test ComponentName.spec.ts --workers=7
```

## Testing Best Practices

### DO:
1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Use clear, descriptive test names
3. **Comprehensive Coverage**: Cover all props, states, and edge cases
4. **Accessibility Focus**: Always include accessibility testing
5. **Performance Awareness**: Include performance-critical scenarios
6. **Error Handling**: Test error conditions and graceful degradation
7. **Browser Compatibility**: Ensure tests work across different browsers

### DON'T:
1. **Skip Edge Cases**: Don't skip tests for null/undefined props
2. **Ignore Accessibility**: Never skip accessibility testing
3. **Test Interdependence**: Avoid tests that depend on execution order
4. **Incomplete Coverage**: Don't leave component props or behaviors untested
5. **Vague Test Names**: Avoid generic test names like "test component"

## Component-Specific Testing Considerations

### For Components with Images/URLs:
- Test image loading and error handling
- Test different URL formats (relative, absolute, data URLs)
- Test fallback behavior when images fail to load
- Test alt text and accessibility for images

### For Components with Text/Names:
- Test different text lengths (short, long, empty)
- Test special characters, Unicode, and emoji
- Test text processing and abbreviation logic
- Test internationalization scenarios

### For Components with Sizes:
- Test all size variants (xs, sm, md, lg, etc.)
- Test invalid size fallback behavior
- Test font scaling with different sizes
- Test responsive behavior

### For Interactive Components:
- Test click, hover, focus, and keyboard interactions
- Test event handling and state changes
- Test disabled/non-interactive states
- Test ARIA attributes and roles

## Session Documentation

When creating component tests, document your progress by:

1. **Recording Test Coverage**: Track which test categories are completed
2. **Logging Test Results**: Document passing/failing tests and execution times
3. **Noting Edge Cases**: Record any unusual behaviors or edge cases discovered
4. **Performance Metrics**: Note any performance issues or optimizations needed
5. **Accessibility Findings**: Document accessibility improvements or issues

## Example Complete Test Structure

```typescript
// ComponentName.spec.ts
import { test, expect } from '@playwright/test';

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic props", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

test("component prop changes update display correctly", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has correct accessibility attributes", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

test("component is keyboard accessible when interactive", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component handles different visual states", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles null and undefined props gracefully", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

test("component handles special characters correctly", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test("component memoization prevents unnecessary re-renders", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly in different layout contexts", async ({ initTestBed, createComponentDriver }) => {
  // Implementation
});
```

This instruction file provides comprehensive guidance for creating thorough, reliable, and maintainable end-to-end tests for XMLUI components. Follow these patterns to ensure consistent, high-quality testing across all components.
