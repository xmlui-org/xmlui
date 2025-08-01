---
applyTo: '**'
---
# Component End-to-End Testing Instructions

I want to create comprehensive end-to-end tests for XMLUI components using Playwright. This instruction file provides AI assistants with the necessary context and patterns for creating thorough test suites that ensure component reliability, accessibility, and performance.

## Primary Objective

When asked to create end-to-end tests for XMLUI components, always:

1. **Create comprehensive test coverage** across all six mandatory categories
2. **Implement custom ComponentDriver** if needed for component-specific interactions
3. **Follow XMLUI-specific conventions** for markup, events, and template properties
4. **Ensure all tests pass** before completing the task
5. **Document any learnings** or patterns discovered during implementation

## Testing Framework Reference

XMLUI uses a custom Playwright-based testing framework:

- **`initTestBed`**: Sets up component with XMLUI markup and optional theme variables
- **`createSpecificDriver`**: Creates component-specific driver instances (e.g., `createContentSeparatorDriver`)
- **`createDriver`**: Generic driver creation method (use specific drivers when available)
- **`expect.poll()`**: Used for async state verification
- **`testStateDriver`**: Handles test state management for event testing

### Centralized Driver Pattern

All component drivers should be:
1. **Defined in `ComponentDrivers.ts`** - Never embed drivers in test files
2. **Added to `fixtures.ts`** - Include both import and creation function
3. **Used via specific methods** - Use `createContentSeparatorDriver()` not `createDriver(ContentSeparatorDriver)`

## XMLUI-Specific Testing Conventions

### Critical XMLUI Markup Rules

**Event Handler Naming** - Always use "on" prefix:
```typescript
// ✅ Correct
onWillOpen="testState = 'event-fired'"
onClick="testState = 'clicked'"

// ❌ Incorrect  
willOpen="testState = 'event-fired'"
```

**Template Properties** - Wrap in `<property>` tags:
```typescript
// ✅ Correct
<property name="triggerTemplate">
  <Button>Custom</Button>
</property>

// ❌ Incorrect
<triggerTemplate>
  <Button>Custom</Button>
</triggerTemplate>
```

**Radix UI Components** - Use page-level selectors in drivers:
```typescript
// ✅ Correct for DropdownMenu, Popover, Dialog, etc.
this.page.getByRole('button')

// ❌ Incorrect - Radix renders outside component
this.component.locator('button')
```

## Mandatory Test Structure

Create tests using this exact six-category structure with clear section separators:

```typescript
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ initTestBed, createSpecificComponentDriver }) => {
    await initTestBed(`<ComponentName prop="value"/>`);
    const driver = await createSpecificComponentDriver();
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS (REQUIRED)
// =============================================================================

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({ initTestBed, createSpecificComponentDriver }) => {
    await initTestBed(`<ComponentName label="Accessible Component"/>`);
    const driver = await createSpecificComponentDriver();
    await expect(driver.getTrigger()).toHaveRole('button');
  });

  test("component is keyboard accessible", async ({ initTestBed, createSpecificComponentDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <ComponentName onClick="testState = 'activated'"/>
    `);
    const driver = await createSpecificComponentDriver();
    
    await driver.component.focus();
    await driver.component.press('Enter');
    await expect.poll(testStateDriver.testState).toEqual('activated');
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States & Themes", () => {
  test("component applies theme variables correctly", async ({ initTestBed, createSpecificComponentDriver }) => {
    await initTestBed(`<ComponentName/>`, {
      testThemeVars: {
        "backgroundColor-ComponentName": "rgb(255, 0, 0)",
      },
    });
    const driver = await createSpecificComponentDriver();
    await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });
});

// =============================================================================
// EDGE CASE TESTS (CRITICAL)
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null and undefined props gracefully", async ({ initTestBed, createSpecificComponentDriver }) => {
    await initTestBed(`<ComponentName/>`);
    const driver = await createSpecificComponentDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles special characters correctly", async ({ initTestBed, createSpecificComponentDriver }) => {
    await initTestBed(`<ComponentName label="Test with émojis 🚀 & quotes"/>`);
    const driver = await createSpecificComponentDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles invalid props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName invalidProp="invalid" />`);

    // Component with invalid props may not be visible, but should not crash
    const component = page.getByTestId("test-id-component");
    const isVisible = await component.isVisible();
    
    // Either it's visible with fallback behavior or gracefully hidden
    if (isVisible) {
      // If visible, it should have fallback behavior
      await expect(component).toBeVisible();
    } else {
      // It's acceptable for component to be hidden with invalid props
      expect(isVisible).toBe(false);
    }
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("component memoization prevents unnecessary re-renders", async ({ initTestBed, createSpecificComponentDriver }) => {
    // Test component behavior remains consistent through multiple interactions
    const { testStateDriver } = await initTestBed(`
      <ComponentName onClick="testState = ++testState || 1"/>
    `);
    const driver = await createSpecificComponentDriver();
    
    await driver.component.click();
    await expect.poll(testStateDriver.testState).toEqual(1);
    
    await driver.component.click();
    await expect.poll(testStateDriver.testState).toEqual(2);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in different layout contexts", async ({ initTestBed, createSpecificComponentDriver }) => {
    await initTestBed(`
      <VStack>
        <ComponentName label="Layout Test"/>
      </VStack>
    `);
    const driver = await createSpecificComponentDriver();
    await expect(driver.component).toBeVisible();
  });
});
```

### Test Naming Convention
Use descriptive test names that clearly indicate what behavior is being tested:
- ✅ `"component renders with basic props"`
- ✅ `"component has correct accessibility attributes"`
- ✅ `"component handles null and undefined props gracefully"`
- ❌ `"test component"`
- ❌ `"basic test"`

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

## Component Driver Development

### Basic ComponentDriver Structure
```typescript
export class ComponentNameDriver extends ComponentDriver {
  // Component-specific locators
  get specificElement() {
    return this.component.locator('.specific-class');
  }

  // Async methods for component interaction
  async getComputedStyle(property: string) {
    return await this.component.evaluate((el, prop) => {
      return window.getComputedStyle(el)[prop];
    }, property);
  }

  // Component state inspection methods
  async getComponentState() {
    const classList = await this.component.evaluate((el) => el.className);
    return classList;
  }
}
```

### CSS Class and Style Testing
When testing visual components, use computed styles:
```typescript
// Test actual rendered styles, not CSS classes
const height = await driver.getComputedHeight();
expect(height).toBe('10px');

// For CSS class testing
const orientation = await driver.getOrientation(); // Custom driver method
expect(orientation).toBe('horizontal');
```

### Zero-Size Element Handling
Components with zero dimensions need special handling:
```typescript
test("component handles zero size", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName size="0px" />`);
  
  const component = page.getByTestId("test-id-component");
  // Zero-size elements might not be "visible" but should exist
  const exists = await component.count();
  expect(exists).toBe(1);
  
  const height = await component.evaluate((el) => window.getComputedStyle(el).height);
  expect(height).toBe('0px');
});
```

## Critical Testing Patterns

### Event Handler Testing with "on" Prefix
```typescript
test("component handles events correctly", async ({ initTestBed, createSpecificComponentDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ComponentName onWillOpen="testState = 'willOpen-fired'; return true"/>
  `, {});
  
  const driver = await createSpecificComponentDriver();
  await driver.open();
  
  await expect.poll(testStateDriver.testState).toEqual('willOpen-fired');
});
```

### Template Property Testing
```typescript
test("component supports custom templates", async ({ initTestBed, createSpecificComponentDriver }) => {
  await initTestBed(`
    <ComponentName>
      <property name="templateName">
        <Button>Custom Content</Button>
      </property>
    </ComponentName>
  `, {});
  
  const driver = await createSpecificComponentDriver();
  await expect(driver.component).toContainText('Custom Content');
});
```

### Radix UI Component Driver Patterns
For components using Radix UI that render portals outside the component container:
```typescript
class ComponentDriver extends ComponentDriver {
  // Use page-level selectors instead of component-scoped
  getTrigger() {
    return this.page.getByRole('button');
  }
  
  async open() {
    await this.getTrigger().click();
  }
  
  async isOpen() {
    return await this.page.getByRole('menu').isVisible();
  }
}
```

### Component Graceful Degradation Testing
XMLUI components may hide themselves when receiving invalid props:
```typescript
test("component handles invalid props gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName invalidProp="invalid" />`);

  // Component with invalid props may not be visible, but should not crash
  const component = page.getByTestId("test-id-component");
  const isVisible = await component.isVisible();
  
  // Either it's visible with fallback behavior or gracefully hidden
  if (isVisible) {
    // If visible, it should have fallback behavior
    await expect(component).toBeVisible();
  } else {
    // It's acceptable for component to be hidden with invalid props
    expect(isVisible).toBe(false);
  }
});
```

### Force Click for UI Overlays
When dealing with UI overlays or interception issues:
```typescript
// Use force click to bypass intercepting elements
await page.getByTestId("button").click({ force: true });
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

## Session Documentation

When creating component tests, document your progress by:

1. **Recording Test Coverage**: Track which test categories are completed
2. **Logging Test Results**: Document passing/failing tests and execution times
3. **Noting Edge Cases**: Record any unusual behaviors or edge cases discovered
4. **Performance Metrics**: Note any performance issues or optimizations needed
5. **Accessibility Findings**: Document accessibility improvements or issues

## Key Testing Conventions Learned

### XMLUI Event Naming Convention
- **Always use "on" prefix** for event handler attributes
- ✅ Correct: `onWillOpen`, `onClick`, `onClose`, `onValueChange`
- ❌ Incorrect: `willOpen`, `click`, `close`, `valueChange`
- This convention ensures proper event binding in XMLUI components

### Template Property Syntax
- **Always wrap templates in `<property>` tags** with the template name
- ✅ Correct: `<property name="triggerTemplate"><Button>Custom</Button></property>`
- ❌ Incorrect: `<triggerTemplate><Button>Custom</Button></triggerTemplate>`
- Template properties are special XMLUI constructs that require the property wrapper

### Radix UI Integration Patterns
- Components using Radix UI render content outside the component container
- Use **page-level selectors** in drivers instead of component-scoped selectors
- ✅ Correct: `this.page.getByRole('button')` for finding triggers
- ❌ Incorrect: `this.component.locator('button')` may not find Radix UI elements
- This is critical for components like DropdownMenu, Popover, Dialog, etc.

### XMLUI Component Behavior Patterns
- **Components can hide with invalid props** - Test for both visible fallback and graceful hiding
- **CSS modules use transformed class names** - Test computed styles, not raw CSS classes
- **Zero-size elements may not be "visible"** - Use element count checks instead of visibility
- **Numeric vs string props** - Some components handle `"3px"` differently from `3`

### Testing Framework Usage Patterns
- **Use centralized drivers** - Define in `ComponentDrivers.ts`, import in `fixtures.ts`
- **Specific driver methods preferred** - Use `createContentSeparatorDriver()` over `createDriver(ContentSeparatorDriver)`
- **CSS class inspection via evaluate** - Access className and computed styles through component evaluation
- **Theme variable testing** - Test both CSS properties and computed dimensions

### UI Interaction Best Practices
- Use `{ force: true }` for clicks when elements are intercepted by overlays
- Handle async state changes with `expect.poll()` for reliable event testing
- Test both successful interactions and prevented actions (e.g., onWillOpen returning false)
- Use `page.getByTestId()` when component locator scope is insufficient

This instruction file provides comprehensive guidance for creating thorough, reliable, and maintainable end-to-end tests for XMLUI components. Follow these patterns to ensure consistent, high-quality testing across all components.
