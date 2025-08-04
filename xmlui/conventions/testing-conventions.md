# XMLUI Component Testing Conventions

This document outlines the testing conventions and standards for XMLUI components using Playwright for end-to-end testing. This is the official reference for the development team.

## Test Categories

XMLUI components must be tested across four categories:

1. **Basic Functionality** - Core behavior, props, events, visual states
2. **Accessibility** - ARIA attributes, keyboard navigation, semantic HTML
3. **Theme Variables** - CSS custom properties and fallback behavior
4. **Edge Cases** - Null/undefined props, invalid values, special characters

## File Organization

- **Location**: Test files MUST be in the same directory as the component
- **Naming**: Use `ComponentName.spec.ts` format
- **Import**: `import { test, expect } from "../../testing/fixtures";`

## Mandatory Test Structure

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
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("component applies theme variables", async ({ initTestBed, createComponentDriver }) => {
    // Test implementation
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null props gracefully", async ({ initTestBed, createComponentDriver }) => {
    // Test implementation
  });
});
```

## XMLUI-Specific Conventions

### Event Handler Naming (CRITICAL)
**ALWAYS use "on" prefix for event handlers:**
```typescript
// ✅ CORRECT
onClick="testState = 'clicked'"
onWillOpen="testState = 'opening'"

// ❌ INCORRECT  
click="testState = 'clicked'"
willOpen="testState = 'opening'"
```

**Event vs Handler distinction:**
- **Event names** (no "on"): Used in `<event name="click">` tags
- **Event handlers** (with "on"): Used as attributes `onClick="..."`

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

## Testing Framework

### Test Initialization
**Always use XMLUI test function from `fixtures.ts`:**
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
  testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" }
});

// With test state for events
const { testStateDriver } = await initTestBed(`
  <ComponentName onClick="testState = 'clicked'"/>
`);
```

### Testing Approaches

**Page-Level Testing (Preferred)** - Use for simple interactions:
```typescript
test("button responds to click", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`<Button onClick="testState = 'clicked'"/>`);
  
  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual('clicked');
});
```

**Component Drivers** - Use for complex components with internal structure:
```typescript
test("expandable item icon rotates on expand", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem>Content</ExpandableItem>`);
  const driver = await createExpandableItemDriver();
  
  const icon = driver.getIcon();
  await driver.expand();
  await expect(icon).toHaveCSS('transform', 'rotate(90deg)');
});
```

**When to use drivers:**
- Component has multiple internal elements
- Need specialized interaction methods
- Testing complex state or animations

**Driver patterns:**
- Centrally defined in `ComponentDrivers.ts`
- Use specific methods: `createProgressBarDriver()` not `createDriver(ProgressBarDriver)`

## Required Test Examples

### 1. Basic Functionality
```typescript
test("renders with basic props", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName size="sm" variant="primary"/>`);
  await expect(page.getByTestId("component")).toBeVisible();
  await expect(page.getByTestId("component")).toHaveCSS("font-size", "14px");
});
```

### 2. Accessibility (REQUIRED)
```typescript
test("has correct accessibility attributes", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName label="Test Label"/>`);
  const component = page.getByLabel("Test Label");
  await expect(component).toHaveRole('button');
});

test("is keyboard accessible", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(`<ComponentName onClick="testState = 'activated'"/>`);
  
  await page.getByRole("button").focus();
  await page.getByRole("button").press('Enter');
  await expect.poll(testStateDriver.testState).toEqual('activated');
});
```

### 3. Theme Variables (REQUIRED)
```typescript
test("applies theme variables", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName/>`, {
    testThemeVars: { "backgroundColor-ComponentName": "rgb(255, 0, 0)" }
  });
  await expect(page.getByTestId("component")).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
```

### 4. Edge Cases (REQUIRED)
```typescript
test("handles null props gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName/>`);
  await expect(page.getByTestId("component")).toBeVisible();
});

test("handles special characters", async ({ initTestBed, page }) => {
  await initTestBed(`<ComponentName label="Test with émojis 🚀 & quotes"/>`);
  await expect(page.getByTestId("component")).toBeVisible();
});
```

## Test Naming & Patterns

### Naming Standards
- Avoid using the "component" word in names, it's redundant
- Use concrete property, event, api, attribute, etc.

- ✅ `"renders with 'variant' property"`
- ✅ `"has correct 'aria-clickable'"`  
- ✅ `"handles null and undefined 'variant' property"`
- ❌ `"test component"` or `"basic test"`

### Event Handler Parameters (CRITICAL)
**ALWAYS use arrow function syntax:**
```typescript
// ✅ CORRECT
onExpandedChange="arg => testState = arg"
onClick="event => testState = event.type"

// ❌ INCORRECT - arguments object doesn't work
onExpandedChange="testState = arguments[0]"
```

## Test Execution

### Commands
```bash
# Standard execution
npx playwright test ComponentName.spec.ts

# Category-specific
npx playwright test ComponentName.spec.ts --grep "accessibility"

# Development (recommended during creation)
npx playwright test ComponentName.spec.ts --reporter=line
```

## Best Practices

### DO (REQUIRED)
- **Test Isolation**: Each test must be independent
- **Descriptive Names**: Use clear, specific descriptions
- **Comprehensive Coverage**: Test all props, states, edge cases
- **Accessibility First**: Always include accessibility testing
- **Standard Selectors**: Use `page.getByRole()`, `page.getByLabel()`

### DON'T (PROHIBITED)
- **Test Implementation**: Don't test internal details
- **Create Dependencies**: Never create execution order dependencies
- **Generic Names**: Never use vague descriptions

### Use test.skip for comprehensive coverage
```typescript
test.skip("advanced feature behavior", async ({ initTestBed, page }) => {
  // TODO: review these tests for accuracy
  // Full test implementation here...
});
```

## Advanced Patterns

### Component-Specific Strategies
- **Form Inputs**: Test data coercion, validation, accessibility, use various input types (number, string, boolean, array, object, null, undefined)
- **Interactive Components**: Test states, keyboard/mouse events, transitions  
- **Layout Components**: Test arrangement, spacing

### Systematic Testing
```typescript
// Test all variants
Object.entries(ComponentVariantEnum).forEach(([variant, htmlElement]) => {
  test(`variant=${variant} renders ${htmlElement}`, async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName variant="${variant}" />`);
    const tagName = await page.getByTestId("component").evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toEqual(htmlElement);
  });
});

// Data type testing
[
  { label: "null", value: "'{null}'", expected: "" },
  { label: "string", value: "'test'", expected: "test" },
  { label: "integer", value: "'{123}'", expected: "123" },
].forEach(({ label, value, expected }) => {
  test(`handles ${label} correctly`, async ({ initTestBed, page }) => {
    await initTestBed(`<ComponentName value=${value} testId="component"/>`);
    await expect(page.getByTestId("component")).toHaveText(expected);
  });
});
```

## Common Issues & Solutions

### CSS Testing Issues
**Problem**: CSS values don't match due to browser normalization.  
**Solution**: Use exact browser values: `"rgb(255, 0, 0)"` not `"red"`.

### Component-Specific Issues
**Problem**: Focus/blur events don't fire on expected elements in complex components.  
**Solution**: Use `test.skip()` for problematic events, focus on functional behavior.

**Problem**: Tests fail checking `aria-labelledby` on form inputs.  
**Solution**: Use `page.getByLabel()` for functional testing.

**Problem**: Tests fail from wrong directory.  
**Solution**: Run from workspace root, verify import paths.


DO NOT CHANGE ANYTHING FOLLOWING THIS PART. WHEN RESTRUCTURING THE DOCUMENT INCLUDE EVERTHING BELOW.

- Checkbox.spec.ts: Excellent pattern
- Use drivers only when the normal mode does not help
- When you need to use a driver heavily, perhaps the component design is flaky
- Drivers:
  - Execute actions
  - Access component internals

- Replace the "Page-Level Testing (Preferred)" pattern with a correct one
- Replace the "Component Drivers" pattern with a correct one