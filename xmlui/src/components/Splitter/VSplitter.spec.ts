import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic setup", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VSplitter height="200px" width="400px" testId="vsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </VSplitter>
    `);
    
    await expect(page.getByTestId("vsplitter")).toBeVisible();
    await expect(page.getByTestId("primary")).toBeVisible();
    await expect(page.getByTestId("secondary")).toBeVisible();
  });

  test("defaults to vertical orientation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VSplitter height="200px" width="400px" testId="vsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </VSplitter>
    `);

    const primary = page.getByTestId("primary");
    const secondary = page.getByTestId("secondary");
    
    const primaryBounds = await getBounds(primary);
    const secondaryBounds = await getBounds(secondary);
    
    // In vertical orientation, primary should be above secondary
    expect(primaryBounds.bottom).toBeLessThanOrEqual(secondaryBounds.top + 10); // Allow for small overlap due to resizer
  });

  test("ignores orientation property when explicitly set", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VSplitter height="200px" width="400px" orientation="horizontal" testId="vsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </VSplitter>
    `);

    const primary = page.getByTestId("primary");
    const secondary = page.getByTestId("secondary");
    
    const primaryBounds = await getBounds(primary);
    const secondaryBounds = await getBounds(secondary);
    
    // Even with orientation="horizontal", VSplitter should still be vertical
    // Primary should be above secondary, NOT to the left of it
    expect(primaryBounds.bottom).toBeLessThanOrEqual(secondaryBounds.top + 10);
  });

  test("works with swapped property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VSplitter height="200px" width="400px" swapped="true" testId="vsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </VSplitter>
    `);

    const primary = page.getByTestId("primary");
    const secondary = page.getByTestId("secondary");
    
    const primaryBounds = await getBounds(primary);
    const secondaryBounds = await getBounds(secondary);
    
    // With swapped=true, secondary should be above primary
    expect(secondaryBounds.bottom).toBeLessThanOrEqual(primaryBounds.top + 10);
  });

  test("maintains vertical orientation even with invalid orientation values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VSplitter height="200px" width="400px" orientation="invalid-value" testId="vsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </VSplitter>
    `);

    const primary = page.getByTestId("primary");
    const secondary = page.getByTestId("secondary");
    
    const primaryBounds = await getBounds(primary);
    const secondaryBounds = await getBounds(secondary);
    
    // Should still be vertical regardless of invalid orientation value
    expect(primaryBounds.bottom).toBeLessThanOrEqual(secondaryBounds.top + 10);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("resizer has vertical cursor style", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <VSplitter height="200px" width="400px" testId="vsplitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </VSplitter>
    `);

    const vsplitter = page.getByTestId("vsplitter");
    const driver = await createSplitterDriver(vsplitter);
    const resizer = await driver.getResizer();
    
    // VSplitter should always use vertical cursor (ns-resize)
    await expect(resizer).toHaveCSS("cursor", "ns-resize");
  });
});
