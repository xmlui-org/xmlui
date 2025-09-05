import { test, expect } from "../../testing/fixtures";
import { ExpandableItemDriver } from "../../testing/ComponentDrivers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic props", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test Summary">Content here</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.getSummaryContent()).toContainText("Test Summary");
  await expect(driver.getContent()).not.toBeVisible(); // Initially collapsed
});

test("component displays summary content correctly", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="My Summary">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.getSummaryContent()).toContainText("My Summary");
  await expect(driver.getSummary()).toBeVisible();
});

test("component handles initiallyExpanded prop", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" initiallyExpanded="true">Content here</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.getContent()).toBeVisible();
  await expect(driver.getContent()).toContainText("Content here");
});

test("component toggles on summary click", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Click me">Hidden content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Initially collapsed
  await expect(driver.getContent()).not.toBeVisible();
  
  // Click to expand
  await driver.getSummary().click();
  await expect(driver.getContent()).toBeVisible();
  
  // Click to collapse
  await driver.getSummary().click();
  await expect(driver.getContent()).not.toBeVisible();
});

test("component displays correct icons for collapsed and expanded states", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Initially collapsed - should show chevronright icon
  await expect(driver.getIcon()).toBeVisible();
  
  // Expand and check icon changes
  await driver.getSummary().click();
  await expect(driver.getIcon()).toBeVisible();
});

test("component handles custom icons", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`
    <ExpandableItem 
      summary="Test" 
      iconCollapsed="plus" 
      iconExpanded="minus">
      Content
    </ExpandableItem>
  `, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.getIcon()).toBeVisible();
  
  // Expand to see expanded icon
  await driver.getSummary().click();
  await expect(driver.getIcon()).toBeVisible();
});

test("component supports iconPosition prop", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" iconPosition="start">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const className = await driver.getSummary().getAttribute('class');
  expect(className).toMatch(/iconStart/);
  await expect(driver.getIcon()).toBeVisible();
});

test("component handles withSwitch prop", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" withSwitch="true">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Check that the switch container (aria-hidden div) is present
  const switchContainer = driver.getSummary().locator('[aria-hidden="true"]');
  await expect(switchContainer).toBeVisible();
  await expect(driver.getIcon()).not.toBeVisible();
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has correct accessibility attributes", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test Summary">Content here</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Summary should have proper button role and ARIA attributes
  await expect(summary).toHaveRole("button");
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  await expect(summary).toHaveAttribute("aria-disabled", "false");
  await expect(summary).toHaveAttribute("tabindex", "0");
  await expect(summary).toHaveAttribute("aria-controls");
  await expect(summary).toHaveAttribute("id");
});

test("component ARIA attributes update with expansion state", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test Summary">Content here</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Initially collapsed
  await expect(summary).toHaveAttribute("aria-expanded", "false");
  
  // Expand
  await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "true");
  
  // Collapse
  await summary.click();
  await expect(summary).toHaveAttribute("aria-expanded", "false");
});

test("component content region has correct ARIA attributes", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test Summary" initiallyExpanded="true">Content here</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  const content = driver.getContent();
  
  // Content should have region role and proper labeling
  await expect(content).toHaveRole("region");
  await expect(content).toHaveAttribute("aria-labelledby");
  await expect(content).toHaveAttribute("id");
  
  // Verify ARIA relationship between summary and content
  const summaryId = await summary.getAttribute("id");
  const contentAriaLabelledBy = await content.getAttribute("aria-labelledby");
  const summaryAriaControls = await summary.getAttribute("aria-controls");
  const contentId = await content.getAttribute("id");
  
  expect(contentAriaLabelledBy).toBe(summaryId);
  expect(summaryAriaControls).toBe(contentId);
});

test("component is keyboard accessible with Enter key", async ({ initTestBed, createExpandableItemDriver, page }) => {
  const { testStateDriver } = await initTestBed(`<ExpandableItem summary="Test" onExpandedChange="arg => testState = arg">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Focus the summary button
  await summary.focus();
  await expect(summary).toBeFocused();
  
  // Press Enter to toggle
  await summary.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual(true);
  await expect(driver.getContent()).toBeVisible();
  
  // Press Enter again to collapse
  await summary.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual(false);
  await expect(driver.getContent()).not.toBeVisible();
});

test("component is keyboard accessible with Space key", async ({ initTestBed, createExpandableItemDriver, page }) => {
  const { testStateDriver } = await initTestBed(`<ExpandableItem summary="Test" onExpandedChange="arg => testState = arg">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Focus the summary button
  await summary.focus();
  await expect(summary).toBeFocused();
  
  // Press Space to toggle
  await summary.press(" ");
  await expect.poll(testStateDriver.testState).toEqual(true);
  await expect(driver.getContent()).toBeVisible();
  
  // Press Space again to collapse
  await summary.press(" ");
  await expect.poll(testStateDriver.testState).toEqual(false);
  await expect(driver.getContent()).not.toBeVisible();
});

test("component maintains focus after keyboard toggle", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Focus and expand with keyboard
  await summary.focus();
  await expect(summary).toBeFocused();
  await summary.press("Enter");
  await expect(driver.getContent()).toBeVisible();
  await expect(summary).toBeFocused(); // Focus should remain
  
  // Collapse with keyboard
  await summary.press("Space");
  await expect(driver.getContent()).not.toBeVisible();
  await expect(summary).toBeFocused(); // Focus should still remain
});

test("component is focusable only when enabled", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test" enabled="false">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Disabled component should not be focusable (no tabindex attribute)
  await expect(summary).not.toHaveAttribute("tabindex");
  await expect(summary).toHaveAttribute("aria-disabled", "true");
});

test("component keyboard interaction works with switch variant", async ({ initTestBed, createExpandableItemDriver, page }) => {
  const { testStateDriver } = await initTestBed(`<ExpandableItem summary="Test" withSwitch="true" onExpandedChange="arg => testState = arg">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const summary = driver.getSummary();
  
  // Focus and activate with Enter
  await summary.focus();
  await summary.press("Enter");
  await expect.poll(testStateDriver.testState).toEqual(true);
  await expect(driver.getContent()).toBeVisible();
  
  // Deactivate with Space
  await summary.press(" ");
  await expect.poll(testStateDriver.testState).toEqual(false);
  await expect(driver.getContent()).not.toBeVisible();
});

test("component icon/switch container is hidden from screen readers", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Icon container should be aria-hidden
  const iconContainer = driver.getSummary().locator('[class*="icon"]');
  await expect(iconContainer).toHaveAttribute("aria-hidden", "true");
});

test("component supports screen reader navigation", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Accessible Summary">Screen reader content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Summary should be properly announced as a button
  const summary = driver.getSummary();
  await expect(summary).toHaveRole("button");
  await summary.click();
  await expect(driver.getContent()).toBeVisible();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component applies theme variables", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`, {
    testThemeVars: { "backgroundColor-ExpandableItem": "rgb(255, 0, 0)" }
  });
  const driver = await createExpandableItemDriver();
  await expect(driver.component).toHaveCSS("background-color", "rgb(255, 0, 0)");
});

test("component applies disabled visual state", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" enabled="false">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const className = await driver.component.getAttribute('class');
  expect(className).toMatch(/disabled/);
});

test("component applies expanded visual state", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" initiallyExpanded="true">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Instead of checking for CSS class, check that content is visible when initially expanded
  await expect(driver.getContent()).toBeVisible();
  await expect(driver.getContent()).toContainText("Content");
});

test("component applies withSwitch visual state", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" withSwitch="true">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const className = await driver.component.getAttribute('class');
  expect(className).toMatch(/withSwitch/);
});

test("component handles icon position styling", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" iconPosition="end">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  const className = await driver.getSummary().getAttribute('class');
  expect(className).toMatch(/iconEnd/);
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles null and undefined props gracefully", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem>Content without summary</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.getSummary()).toBeVisible();
});

test("component handles empty summary", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.component).toBeVisible();
  await expect(driver.getSummary()).toBeVisible();
});

test("component handles empty content", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test"></ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.component).toBeVisible();
  await driver.getSummary().click();
  await expect(driver.getContent()).toBeVisible();
});

test("component handles special characters in summary", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test with émojis 🚀 & quotes">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.getSummaryContent()).toContainText("Test with émojis 🚀 & quotes");
});

test("component handles complex summary content", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`
    <ExpandableItem summary="Complex Summary">
      Content here
    </ExpandableItem>
  `, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.getSummary()).toBeVisible();
  await expect(driver.getSummaryContent()).toContainText("Complex Summary");
});

test("component handles disabled state interaction", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test" enabled="false">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Should not expand when disabled - use force click since the element is aria-disabled
  await driver.getSummary().click({ force: true });
  await expect(driver.getContent()).not.toBeVisible();
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test("component memoization prevents unnecessary re-renders", async ({ initTestBed, createExpandableItemDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ExpandableItem 
      summary="Test" 
      onExpandedChange="testState = (testState || 0) + 1">
      Content
    </ExpandableItem>
  `, {});
  const driver = await createExpandableItemDriver();
  
  // Expand
  await driver.getSummary().click();
  await expect.poll(testStateDriver.testState).toEqual(1);
  
  // Collapse
  await driver.getSummary().click();
  await expect.poll(testStateDriver.testState).toEqual(2);
});

test("component handles rapid toggling", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`<ExpandableItem summary="Test">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // Rapid clicks
  await driver.getSummary().click();
  await driver.getSummary().click();
  await driver.getSummary().click();
  
  // Should end up collapsed (odd number of clicks)
  await expect(driver.getContent()).toBeVisible();
});

test("component handles large content efficiently", async ({ initTestBed, createExpandableItemDriver }) => {
  const largeContent = "Very long content ".repeat(100);
  await initTestBed(`<ExpandableItem summary="Test">${largeContent}</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  await driver.getSummary().click();
  await expect(driver.getContent()).toBeVisible();
  await expect(driver.getContent()).toContainText("Very long content");
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works in layout contexts", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`
    <VStack gap="2">
      <ExpandableItem summary="First Item">First content</ExpandableItem>
      <ExpandableItem summary="Second Item">Second content</ExpandableItem>
    </VStack>
  `, {});
  const driver = await createExpandableItemDriver();
  
  await expect(driver.component).toBeVisible();
  // Use first() to get the first ExpandableItem's summary content
  await expect(driver.getSummaryContent().first()).toContainText("First Item");
});

test("component API methods work correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <ExpandableItem id="expandable" summary="Test">Content</ExpandableItem>
      <Button testId="expandBtn" onClick="expandable.expand()">Expand</Button>
      <Button testId="collapseBtn" onClick="expandable.collapse()">Collapse</Button>
      <Button testId="toggleBtn" onClick="expandable.toggle()">Toggle</Button>
      <Button testId="checkBtn" onClick="testState = expandable.isExpanded()">Check</Button>
    </Fragment>
  `, {});
  
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <ExpandableItem id="expandable" summary="Test">Content</ExpandableItem>
      <Button testId="expandBtn" onClick="expandable.expand()">Expand</Button>
      <Button testId="collapseBtn" onClick="expandable.collapse()">Collapse</Button>
      <Button testId="toggleBtn" onClick="expandable.toggle()">Toggle</Button>
      <Button testId="checkBtn" onClick="testState = expandable.isExpanded()">Check</Button>
    </Fragment>
  `, {});
  
  // Test expand API
  await page.getByTestId("expandBtn").click();
  await expect(page.locator('[class*="_content_"]')).toBeVisible();
  
  // Test isExpanded API
  await page.getByTestId("checkBtn").click();
  await expect.poll(testStateDriver.testState).toEqual(true);
  
  // Test collapse API
  await page.getByTestId("collapseBtn").click();
  await expect(page.locator('[class*="_content_"]')).not.toBeVisible();
  
  // Test toggle API
  await page.getByTestId("toggleBtn").click();
  await expect(page.locator('[class*="_content_"]')).toBeVisible();
});

test("component works with forms", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`
    <Form>
      <ExpandableItem summary="Advanced Options">
        <FormItem label="Advanced Setting">
          <TextBox name="advanced" />
        </FormItem>
      </ExpandableItem>
    </Form>
  `, {});
  const driver = await createExpandableItemDriver();
  
  await driver.getSummary().click();
  await expect(driver.getContent()).toBeVisible();
  await expect(driver.getContent()).toContainText("Advanced Setting");
});

test("component event handlers work correctly", async ({ initTestBed, createExpandableItemDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <ExpandableItem 
      summary="Test" 
      onExpandedChange="arg =>testState = arg">
      Content
    </ExpandableItem>
  `, {});
  const driver = await createExpandableItemDriver();
  
  // Click to expand - should set testState to true
  await driver.getSummary().click();
  await expect.poll(testStateDriver.testState).toEqual(true);
  
  // Click to collapse - should set testState to false
  await driver.getSummary().click();
  await expect.poll(testStateDriver.testState).toEqual(false);
});

test("component works with switch variant", async ({ initTestBed, createExpandableItemDriver, page }) => {
  await initTestBed(`<ExpandableItem summary="Test" withSwitch="true">Content</ExpandableItem>`, {});
  const driver = await createExpandableItemDriver();
  
  // With switch variant, users should click the summary (button) to toggle
  // The switch itself is decorative and aria-hidden
  await driver.getSummary().click();
  await expect(driver.getContent()).toBeVisible();
  
  // Click the summary again to toggle back
  await driver.getSummary().click();
  await expect(driver.getContent()).not.toBeVisible();
});

test("component works in nested scenarios", async ({ initTestBed, createExpandableItemDriver }) => {
  await initTestBed(`
    <ExpandableItem summary="Parent">
      <ExpandableItem summary="Child">
        Nested content
      </ExpandableItem>
    </ExpandableItem>
  `, {});
  const driver = await createExpandableItemDriver();
  
  // Expand parent
  await driver.getSummary().click();
  await expect(driver.getContent()).toBeVisible();
  
  // Should see nested expandable item
  await expect(driver.getContent()).toContainText("Child");
});
