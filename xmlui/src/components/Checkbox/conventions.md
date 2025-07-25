# XMLUI Testing Conventions

Quick reference guide for creating comprehensive component tests using Playwright and XMLUI testing framework.

## Test File Structure

```typescript
import { getBounds, isIndeterminate, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================
test.describe("Basic Functionality", () => {
  // Core behavior, props, state management
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================
test.describe("Accessibility", () => {
  // ARIA, keyboard navigation, focus, screen readers
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================
test.describe("Edge Cases", () => {
  // Special chars, Unicode, invalid props, rapid changes
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================
test.describe("Event Handling", () => {
  // Event firing, data verification, state changes
});
```

## Essential Patterns

### Setup & Selection
```typescript
// ✅ Use inline setup - clear and self-contained
test("component renders", async ({ initTestBed, page }) => {
  await initTestBed(`<Component prop="value" />`);
  const element = page.getByRole("button"); // Use semantic selectors
  await expect(element).toBeVisible();
});

// ✅ XMLUI markup syntax
await initTestBed(`<Checkbox label="test" enabled="false" required="{true}" />`);
```

### Event Testing
```typescript
test("event fires on interaction", async ({ initTestBed, page }) => {
  const { testStateDriver } = await initTestBed(
    `<Component onEvent="testState = 'fired'" />`
  );
  await page.getByRole("button").click();
  await expect.poll(testStateDriver.testState).toEqual("fired");
});
```

### Skip Reasons
```typescript
test.skip(
  "feature not implemented", 
  SKIP_REASON.TO_BE_IMPLEMENTED("Description"),
  async () => {}
);
```

## Must-Test Categories

### Basic Functionality
- ✅ Component renders
- ✅ All props work correctly
- ✅ State changes and interactions
- ✅ Prop combinations and conflicts

### Accessibility (Required)
- ✅ ARIA attributes
- ✅ Keyboard navigation (`Tab`, `Space`, `Enter`)
- ✅ Focus management
- ✅ Label association

### Edge Cases (Critical)
- ✅ Special characters: `&amp;`, `&lt;`, `&gt;`
- ✅ Unicode: `"同意条款 ✓"`
- ✅ Long content
- ✅ Invalid props
- ✅ Rapid state changes

### Events
- ✅ Event firing
- ✅ Event data accuracy
- ✅ State synchronization

## Common Test Examples

### Props Testing
```typescript
test("prop affects behavior", async ({ initTestBed, page }) => {
  await initTestBed(`<Component prop="value" />`);
  await expect(page.getByRole("element")).toHaveAttribute("expected", "value");
});
```

### Accessibility
```typescript
test("keyboard navigation works", async ({ initTestBed, page }) => {
  await initTestBed(`<Component />`);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("element")).toBeFocused();
});
```

### Edge Cases
```typescript
test("handles special characters", async ({ initTestBed, page }) => {
  await initTestBed(`<Component text="Test &amp; More &lt;&gt;" />`);
  await expect(page.getByText("Test & More <>")).toBeVisible();
});
```

### Layout Testing
```typescript
test("positions correctly", async ({ initTestBed, page }) => {
  await initTestBed(`<Component position="left" />`);
  const { left: elementLeft } = await getBounds(page.getByRole("element"));
  const { right: containerRight } = await getBounds(page.getByTestId("container"));
  expect(elementLeft).toBeLessThan(containerRight);
});
```

## Testing Best Practices

### DO
- ✅ Use descriptive test names: `"component handles invalid props gracefully"`
- ✅ Test all component props
- ✅ Include comprehensive accessibility tests
- ✅ Use semantic selectors: `getByRole()`, `getByLabel()`
- ✅ Test edge cases and error conditions
- ✅ Keep tests independent and isolated
- ✅ Use inline setup for clarity

### AVOID
- ❌ Generic test names: `"test component"`
- ❌ Skipping accessibility tests
- ❌ Using CSS selectors when semantic ones work
- ❌ Making tests depend on each other
- ❌ Testing implementation details vs behavior
- ❌ Creating unnecessary helper abstractions for simple setups

## Quick Reference

### Common Assertions
```typescript
await expect(element).toBeVisible();
await expect(element).toBeChecked();
await expect(element).toBeFocused();
await expect(element).toBeDisabled();
await expect(element).toHaveAttribute("aria-checked", "true");
await expect(element).toHaveRole("button");
```

### Skip Reasons
- `SKIP_REASON.TO_BE_IMPLEMENTED()` - Feature not implemented
- `SKIP_REASON.XMLUI_BUG("desc")` - Known framework bug
- `SKIP_REASON.TEST_INFRA_BUG()` - Test infrastructure issue

### Test Data Patterns
```typescript
// Boolean props
enabled="true" | enabled="false" | autoFocus="{true}"

// Complex markup
await initTestBed(`
  <Fragment>
    <Component testId="first" />
    <Component testId="second" />
  </Fragment>
`);
```

This guide ensures consistent, comprehensive testing across all XMLUI components.
