import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic setup", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HSplitter height="200px" width="400px" testId="hsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </HSplitter>
    `);
    
    await expect(page.getByTestId("hsplitter")).toBeVisible();
    await expect(page.getByTestId("primary")).toBeVisible();
    await expect(page.getByTestId("secondary")).toBeVisible();
  });

  test("defaults to horizontal orientation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HSplitter height="200px" width="400px" testId="hsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </HSplitter>
    `);

    const primary = page.getByTestId("primary");
    const secondary = page.getByTestId("secondary");
    
    const primaryBounds = await getBounds(primary);
    const secondaryBounds = await getBounds(secondary);
    
    // In horizontal orientation, primary should be to the left of secondary
    expect(primaryBounds.right).toBeLessThanOrEqual(secondaryBounds.left + 10); // Allow for small overlap due to resizer
  });

  test("ignores orientation property when explicitly set", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HSplitter height="200px" width="400px" orientation="vertical" testId="hsplitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </HSplitter>
    `);

    const primary = page.getByTestId("primary");
    const secondary = page.getByTestId("secondary");
    
    const primaryBounds = await getBounds(primary);
    const secondaryBounds = await getBounds(secondary);
    
    // Even with orientation="vertical", HSplitter should still be horizontal
    // Primary should be to the left of secondary, NOT above it
    expect(primaryBounds.right).toBeLessThanOrEqual(secondaryBounds.left + 10);
  });

  test("supports all Splitter properties except orientation", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <HSplitter 
        height="200px" 
        width="400px" 
        initialPrimarySize="30%" 
        minPrimarySize="20%" 
        maxPrimarySize="80%" 
        floating="false" 
        testId="hsplitter"
      >
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </HSplitter>
    `);

    const hsplitter = page.getByTestId("hsplitter");
    const primary = page.getByTestId("primary");
    const driver = await createSplitterDriver(hsplitter);
    
    // Verify initial size is applied
    const hsplitterBounds = await getBounds(hsplitter);
    const primaryBounds = await getBounds(primary);
    
    const expectedWidth = hsplitterBounds.width * 0.3;
    const tolerance = 15;
    expect(Math.abs(primaryBounds.width - expectedWidth)).toBeLessThan(tolerance);
    
    // Verify resizer is visible (floating=false)
    const resizer = await driver.getResizer();
    await expect(resizer).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("resizer has horizontal cursor style", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <HSplitter height="200px" width="400px" testId="hsplitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </HSplitter>
    `);

    const hsplitter = page.getByTestId("hsplitter");
    const driver = await createSplitterDriver(hsplitter);
    const resizer = await driver.getResizer();
    
    // HSplitter should always use horizontal cursor (ew-resize)
    await expect(resizer).toHaveCSS("cursor", "ew-resize");
  });
});
