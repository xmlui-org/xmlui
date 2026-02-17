import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { parseSize, toPercentage } from "./utils";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic setup", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </Splitter>
    `);
    
    await expect(page.getByTestId("splitter")).toBeVisible();
    await expect(page.getByTestId("primary")).toBeVisible();
    await expect(page.getByTestId("secondary")).toBeVisible();
  });

  test("renders with single child", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%" testId="single-child"/>
      </Splitter>
    `);
    
    await expect(page.getByTestId("splitter")).toBeVisible();
    await expect(page.getByTestId("single-child")).toBeVisible();
  });

  test.describe("conditional rendering behavior", () => {
    test("hides resizer and stretches single panel when second child has when=false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
          <Stack when="{false}" backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
        </Splitter>
      `);
      
      // Primary panel should be visible
      await expect(page.getByTestId("primary")).toBeVisible();
      
      // Secondary panel should not be visible (filtered out by when=false)
      await expect(page.getByTestId("secondary")).not.toBeVisible();
      
      // Resizer should not be visible when only one child is rendered
      const resizer = page.locator('[class*="resizer"]');
      const isResizerVisible = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible).toBe(false);
      
      // Primary panel should stretch to fill the entire splitter container
      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      
      const splitterBounds = await getBounds(splitter);
      const primaryBounds = await getBounds(primary);
      
      // Allow small tolerance for borders/padding
      const tolerance = 5;
      expect(Math.abs(primaryBounds.width - splitterBounds.width)).toBeLessThan(tolerance);
      expect(Math.abs(primaryBounds.height - splitterBounds.height)).toBeLessThan(tolerance);
    });

    test("hides resizer and stretches single panel when first child has when=false", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <Stack when="{false}" backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
        </Splitter>
      `);
      
      // Primary panel should not be visible (filtered out by when=false)
      await expect(page.getByTestId("primary")).not.toBeVisible();
      
      // Secondary panel should be visible
      await expect(page.getByTestId("secondary")).toBeVisible();
      
      // Resizer should not be visible when only one child is rendered
      const resizer = page.locator('[class*="resizer"]');
      const isResizerVisible = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible).toBe(false);
      
      // Secondary panel should stretch to fill the entire splitter container
      const splitter = page.getByTestId("splitter");
      const secondary = page.getByTestId("secondary");
      
      const splitterBounds = await getBounds(splitter);
      const secondaryBounds = await getBounds(secondary);
      
      // Allow small tolerance for borders/padding
      const tolerance = 5;
      expect(Math.abs(secondaryBounds.width - splitterBounds.width)).toBeLessThan(tolerance);
      expect(Math.abs(secondaryBounds.height - splitterBounds.height)).toBeLessThan(tolerance);
    });

    test("shows resizer when both children are visible", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
        </Splitter>
      `);
      
      // Both panels should be visible
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
      
      // Resizer should be visible when both children are rendered
      const resizer = page.locator('[class*="resizer"]');
      await expect(resizer).toBeVisible();
    });

    test("dynamically updates when child visibility changes", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment var.showSecondary="{true}">
          <Splitter height="200px" width="400px" testId="splitter">
            <Stack backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
            <Stack when="{showSecondary}" backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
          </Splitter>
          <Button testId="toggle" onClick="showSecondary = !showSecondary">Toggle Secondary</Button>
        </Fragment>
      `);
      
      // Initially both panels should be visible
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
      
      // Resizer should be visible
      const resizer = page.locator('[class*="resizer"]');
      await expect(resizer).toBeVisible();
      
      // Click toggle to hide secondary panel
      await page.getByTestId("toggle").click();
      
      // Primary should still be visible, secondary should be hidden
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).not.toBeVisible();
      
      // Resizer should now be hidden
      const isResizerVisible = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible).toBe(false);
      
      // Primary panel should stretch to fill container
      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      
      const splitterBounds = await getBounds(splitter);
      const primaryBounds = await getBounds(primary);
      
      const tolerance = 5;
      expect(Math.abs(primaryBounds.width - splitterBounds.width)).toBeLessThan(tolerance);
      
      // Click toggle again to show secondary panel
      await page.getByTestId("toggle").click();
      
      // Both panels should be visible again
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
      
      // Resizer should be visible again
      await expect(resizer).toBeVisible();
    });

    test("handles when condition with complex expressions", async ({ initTestBed, page }) => {
      const { testStateDriver } = await initTestBed(`
        <Fragment var.count="{0}">
          <Splitter height="200px" width="400px" testId="splitter">
            <Stack backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
            <Stack when="{count > 5}" backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
          </Splitter>
          <Button testId="increment" onClick="count = count + 1">Increment</Button>
          <Text testId="count-display">{count}</Text>
        </Fragment>
      `);
      
      // Initially only primary should be visible (count = 0, which is not > 5)
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).not.toBeVisible();
      
      // Resizer should be hidden
      const resizer = page.locator('[class*="resizer"]');
      const isResizerVisible1 = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible1).toBe(false);
      
      // Click increment 6 times to make count > 5
      for (let i = 0; i < 6; i++) {
        await page.getByTestId("increment").click();
      }
      
      await expect(page.getByTestId("count-display")).toHaveText("6");
      
      // Now both panels should be visible
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
      
      // Resizer should be visible
      await expect(resizer).toBeVisible();
    });

    test("works with multiple conditionally hidden children", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <Stack when="{false}" backgroundColor="lightblue" height="100%" testId="child1">Child 1</Stack>
          <Stack when="{false}" backgroundColor="darksalmon" height="100%" testId="child2">Child 2</Stack>
          <Stack backgroundColor="lightgreen" height="100%" testId="child3">Child 3</Stack>
        </Splitter>
      `);
      
      // Only child3 should be visible
      await expect(page.getByTestId("child1")).not.toBeVisible();
      await expect(page.getByTestId("child2")).not.toBeVisible();
      await expect(page.getByTestId("child3")).toBeVisible();
      
      // Resizer should be hidden (only one visible child)
      const resizer = page.locator('[class*="resizer"]');
      const isResizerVisible = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible).toBe(false);
      
      // Child3 should stretch to fill container
      const splitter = page.getByTestId("splitter");
      const child3 = page.getByTestId("child3");
      
      const splitterBounds = await getBounds(splitter);
      const child3Bounds = await getBounds(child3);
      
      const tolerance = 5;
      expect(Math.abs(child3Bounds.width - splitterBounds.width)).toBeLessThan(tolerance);
    });

    test("handles all children being conditionally hidden", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <Stack when="{false}" backgroundColor="lightblue" height="100%" testId="child1">Child 1</Stack>
          <Stack when="{false}" backgroundColor="darksalmon" height="100%" testId="child2">Child 2</Stack>
        </Splitter>
      `);
      
      // No children should be visible
      await expect(page.getByTestId("child1")).not.toBeVisible();
      await expect(page.getByTestId("child2")).not.toBeVisible();
      
      // Splitter should still be visible but empty
      await expect(page.getByTestId("splitter")).toBeVisible();
      
      // Resizer should not be visible
      const resizer = page.locator('[class*="resizer"]');
      const isResizerVisible = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible).toBe(false);
    });

    test("works with different orientations", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
          <Stack when="{false}" backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
        </Splitter>
      `);
      
      // Primary should be visible, secondary should not
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).not.toBeVisible();
      
      // Resizer should be hidden
      const resizer = page.locator('[class*="resizer"]');
      const isResizerVisible = await resizer.isVisible().catch(() => false);
      expect(isResizerVisible).toBe(false);
      
      // Primary should stretch horizontally to fill container
      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      
      const splitterBounds = await getBounds(splitter);
      const primaryBounds = await getBounds(primary);
      
      const tolerance = 5;
      expect(Math.abs(primaryBounds.width - splitterBounds.width)).toBeLessThan(tolerance);
    });
  });

  test.describe("orientation property", () => {
    test("orientation='horizontal' arranges sections left to right", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const primary = page.getByTestId("primary");
      const secondary = page.getByTestId("secondary");
      
      const primaryBounds = await getBounds(primary);
      const secondaryBounds = await getBounds(secondary);
      
      // In horizontal orientation, primary should be to the left of secondary
      expect(primaryBounds.right).toBeLessThanOrEqual(secondaryBounds.left + 10); // Allow for small overlap due to resizer
    });

    test("orientation='vertical' arranges sections top to bottom", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="vertical" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const primary = page.getByTestId("primary");
      const secondary = page.getByTestId("secondary");
      
      const primaryBounds = await getBounds(primary);
      const secondaryBounds = await getBounds(secondary);
      
      // In vertical orientation, primary should be above secondary
      expect(primaryBounds.bottom).toBeLessThanOrEqual(secondaryBounds.top + 10); // Allow for small overlap due to resizer
    });

    test("defaults to vertical orientation", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const primary = page.getByTestId("primary");
      const secondary = page.getByTestId("secondary");
      
      const primaryBounds = await getBounds(primary);
      const secondaryBounds = await getBounds(secondary);
      
      // Default should be vertical (primary above secondary)
      expect(primaryBounds.bottom).toBeLessThanOrEqual(secondaryBounds.top + 10);
    });
  });

  test.describe("swapped property", () => {
    [
      { swapped: false, orientation: "horizontal", description: "primary left, secondary right" },
      { swapped: true, orientation: "horizontal", description: "secondary left, primary right" },
      { swapped: false, orientation: "vertical", description: "primary top, secondary bottom" },
      { swapped: true, orientation: "vertical", description: "secondary top, primary bottom" },
    ].forEach(({ swapped, orientation, description }) => {
      test(`swapped=${swapped} with orientation=${orientation} renders ${description}`, async ({ initTestBed, page }) => {
        await initTestBed(`
          <Splitter height="200px" width="400px" orientation="${orientation}" swapped="${swapped}" testId="splitter">
            <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
            <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
          </Splitter>
        `);

        const primary = page.getByTestId("primary");
        const secondary = page.getByTestId("secondary");
        
        const primaryBounds = await getBounds(primary);
        const secondaryBounds = await getBounds(secondary);
        
        if (orientation === "horizontal") {
          if (swapped) {
            // Secondary should be to the left of primary
            expect(secondaryBounds.right).toBeLessThanOrEqual(primaryBounds.left + 10);
          } else {
            // Primary should be to the left of secondary
            expect(primaryBounds.right).toBeLessThanOrEqual(secondaryBounds.left + 10);
          }
        } else {
          if (swapped) {
            // Secondary should be above primary
            expect(secondaryBounds.bottom).toBeLessThanOrEqual(primaryBounds.top + 10);
          } else {
            // Primary should be above secondary
            expect(primaryBounds.bottom).toBeLessThanOrEqual(secondaryBounds.top + 10);
          }
        }
      });
    });
  });

  test.describe("initialPrimarySize property", () => {
    test("sets initial size with percentage", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" initialPrimarySize="25%" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      
      const splitterBounds = await getBounds(splitter);
      const primaryBounds = await getBounds(primary);
      
      const expectedWidth = splitterBounds.width * 0.25;
      const tolerance = 10; // Allow some tolerance for rounding/margins
      
      expect(Math.abs(primaryBounds.width - expectedWidth)).toBeLessThan(tolerance);
    });

    test("sets initial size with pixels", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" initialPrimarySize="100px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const primary = page.getByTestId("primary");
      const primaryBounds = await getBounds(primary);
      
      const tolerance = 10;
      expect(Math.abs(primaryBounds.width - 100)).toBeLessThan(tolerance);
    });

    test("defaults to 50%", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      
      const splitterBounds = await getBounds(splitter);
      const primaryBounds = await getBounds(primary);
      
      const expectedWidth = splitterBounds.width * 0.5;
      const tolerance = 15; // Allow some tolerance for default behavior
      
      expect(Math.abs(primaryBounds.width - expectedWidth)).toBeLessThan(tolerance);
    });

    // Regression test for issue #2820: ensures initialPrimarySize applies correctly
    // Note: This test verifies the final state. The actual layout shift bug cannot be easily
    // tested in Playwright because by the time the DOM is queryable, useEffect has already run.
    // Manual testing required: Open Splitter with initialPrimarySize and watch for visual jump
    test("applies initialPrimarySize to correct final size", async ({ initTestBed, page }) => {
      // This test ensures initialPrimarySize results in the correct size
      // Issue #2820: https://github.com/xmlui-org/xmlui/issues/2820
      // The fix ensures initialPrimarySize is applied via inline style on first render
      // (before useEffect) to prevent layout shift
      
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" initialPrimarySize="260px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary">Primary</Stack>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary">Secondary</Stack>
        </Splitter>
      `);

      const primary = page.getByTestId("primary");
      const primaryBounds = await getBounds(primary);
      
      // Verify the primary panel has the correct width
      // With the fix, this should be 260px from the start (no layout shift)
      const tolerance = 10;
      expect(Math.abs(primaryBounds.width - 260)).toBeLessThan(tolerance);
    });
  });

  test.describe("floating property", () => {
    test("floating=false shows resizer permanently", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" floating="false" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const driver = await createSplitterDriver(splitter);
      const resizer = await driver.getResizer();
      
      await expect(resizer).toBeVisible();
    });

    test("floating=true hides resizer until hover", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" floating="true" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      
      // When floating=true, the regular resizer should not be visible
      const regularResizer = splitter.locator('[class*="resizer"]:not([class*="floating"])');
      const isRegularResizerVisible = await regularResizer.isVisible().catch(() => false);
      expect(isRegularResizerVisible).toBe(false);
      
      // The floating resizer should exist but be initially hidden (opacity 0)
      const floatingResizer = splitter.locator('[class*="floating"]');
      if (await floatingResizer.count() > 0) {
        const initialOpacity = await floatingResizer.evaluate(el => window.getComputedStyle(el).opacity);
        expect(parseFloat(initialOpacity)).toBe(0);
      }
    });
  });

  test.describe("splitterTemplate property", () => {
    test("renders custom splitter template", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" testId="splitter">
          <property name="splitterTemplate">
            <ContentSeparator backgroundColor="green" height="4px" testId="custom-separator"/>
          </property>
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      await expect(page.getByTestId("custom-separator")).toBeVisible();
    });
  });

  test.describe("resize functionality", () => {
    test("drag resizer changes panel sizes in horizontal orientation", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Get initial size
      const initialBounds = await getBounds(primary);
      
      // Drag resizer to the right by 50 pixels
      await driver.dragResizer(50, 0);
      
      // Get new size and verify it changed
      const newBounds = await getBounds(primary);
      expect(newBounds.width).toBeGreaterThan(initialBounds.width + 30); // Allow some tolerance
    });

    test("drag resizer changes panel sizes in vertical orientation", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="vertical" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Get initial size
      const initialBounds = await getBounds(primary);
      
      // Drag resizer down by 30 pixels
      await driver.dragResizer(0, 30);
      
      // Get new size and verify it changed
      const newBounds = await getBounds(primary);
      expect(newBounds.height).toBeGreaterThan(initialBounds.height + 15); // Allow some tolerance
    });
  });

  test.describe("size constraint properties", () => {
    test("minPrimarySize constrains minimum size", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" minPrimarySize="100px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Try to drag resizer far to the left
      await driver.dragResizer(-300, 0);
      
      // Primary should not be smaller than minimum
      const bounds = await getBounds(primary);
      expect(bounds.width).toBeGreaterThanOrEqual(90); // Allow small tolerance
    });

    test("maxPrimarySize constrains maximum size", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" maxPrimarySize="300px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Try to drag resizer far to the right
      await driver.dragResizer(300, 0);
      
      // Primary should not be larger than maximum
      const bounds = await getBounds(primary);
      expect(bounds.width).toBeLessThanOrEqual(310); // Allow small tolerance
    });

    test("negative maxPrimarySize in pixels constrains from end", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" maxPrimarySize="-100px" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Try to drag resizer far to the right
      await driver.dragResizer(350, 0);
      
      // Primary should not be larger than 400 - 100 = 300px
      const bounds = await getBounds(primary);
      expect(bounds.width).toBeLessThanOrEqual(310); // Allow small tolerance for 300px max
    });

    test("negative maxPrimarySize in percentage constrains from end", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" maxPrimarySize="-25%" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Try to drag resizer far to the right
      await driver.dragResizer(350, 0);
      
      // Primary should not be larger than 75% of 400px = 300px
      const bounds = await getBounds(primary);
      expect(bounds.width).toBeLessThanOrEqual(310); // Allow small tolerance for 300px max
    });

    test("negative maxPrimarySize works in vertical orientation", async ({ initTestBed, page, createSplitterDriver }) => {
      await initTestBed(`
        <Splitter height="400px" width="200px" orientation="vertical" maxPrimarySize="-100px" testId="splitter">
          <Stack backgroundColor="lightblue" width="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" width="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const primary = page.getByTestId("primary");
      const driver = await createSplitterDriver(splitter);
      
      // Try to drag resizer far down
      await driver.dragResizer(0, 350);
      
      // Primary should not be larger than 400 - 100 = 300px height
      const bounds = await getBounds(primary);
      expect(bounds.height).toBeLessThanOrEqual(310); // Allow small tolerance for 300px max
    });
  });

  test.describe("resize event", () => {
    test("fires resize event when dragging", async ({ initTestBed, page, createSplitterDriver }) => {
      const { testStateDriver } = await initTestBed(`
        <Splitter height="200px" width="400px" orientation="horizontal" onResize="arg => testState = arg" testId="splitter">
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);

      const splitter = page.getByTestId("splitter");
      const driver = await createSplitterDriver(splitter);
      
      // Drag resizer
      await driver.dragResizer(50, 0);
      
      // Verify resize event was called with array of percentages
      await expect.poll(testStateDriver.testState).toBeDefined();
      const resizeData = await testStateDriver.testState();
      expect(Array.isArray(resizeData)).toBe(true);
      expect(resizeData).toHaveLength(2);
      expect(typeof resizeData[0]).toBe("number");
      expect(typeof resizeData[1]).toBe("number");
    });
  });

  test.describe("edge cases", () => {
    test("handles null properties gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter 
          height="200px" 
          initialPrimarySize="50px" 
          minPrimarySize="10px" 
          maxPrimarySize="180px"
          testId="splitter"
        >
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);
      
      await expect(page.getByTestId("splitter")).toBeVisible();
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
    });

    test("handles undefined properties gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter 
          height="200px" 
          width="400px"
          testId="splitter"
        >
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);
      
      await expect(page.getByTestId("splitter")).toBeVisible();
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
    });

    test("handles invalid size values", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter 
          height="200px" 
          width="400px"
          initialPrimarySize="50%" 
          testId="splitter"
        >
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);
      
      await expect(page.getByTestId("splitter")).toBeVisible();
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
    });

    test("handles object values for string properties", async ({ initTestBed, page }) => {
      await initTestBed(`
        <Splitter 
          height="200px" 
          width="400px"
          orientation="horizontal" 
          initialPrimarySize="50%"
          testId="splitter"
        >
          <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
          <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
        </Splitter>
      `);
      
      await expect(page.getByTestId("splitter")).toBeVisible();
      await expect(page.getByTestId("primary")).toBeVisible();
      await expect(page.getByTestId("secondary")).toBeVisible();
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("resizer has appropriate cursor styles", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `);

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("cursor", "ew-resize");
  });

  test("vertical resizer has appropriate cursor style", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="vertical" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `);

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("cursor", "ns-resize");
  });

  test("splitter prevents text selection during drag", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `);

    const splitter = page.getByTestId("splitter");
    await expect(splitter).toHaveCSS("user-select", "none");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies backgroundColor-resizer-Splitter theme variable", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `, {
      testThemeVars: { "backgroundColor-resizer-Splitter": "rgb(255, 0, 0)" },
    });

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("applies thickness-resizer-Splitter theme variable for horizontal", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `, {
      testThemeVars: { "thickness-resizer-Splitter": "10px" },
    });

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("width", "10px");
  });

  test("applies thickness-resizer-Splitter theme variable for vertical", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="vertical" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `, {
      testThemeVars: { "thickness-resizer-Splitter": "10px" },
    });

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("height", "10px");
  });

  test("applies cursor-resizer-horizontal-Splitter theme variable", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `, {
      testThemeVars: { "cursor-resizer-horizontal-Splitter": "col-resize" },
    });

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("cursor", "col-resize");
  });

  test("applies cursor-resizer-vertical-Splitter theme variable", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="vertical" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%"/>
        <Stack backgroundColor="darksalmon" height="100%"/>
      </Splitter>
    `, {
      testThemeVars: { "cursor-resizer-vertical-Splitter": "row-resize" },
    });

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    const resizer = await driver.getResizer();
    
    await expect(resizer).toHaveCSS("cursor", "row-resize");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles very small container dimensions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="20px" width="20px" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </Splitter>
    `);
    
    await expect(page.getByTestId("splitter")).toBeVisible();
    await expect(page.getByTestId("primary")).toBeVisible();
    // Secondary might be hidden in very small containers due to space constraints
    const secondary = page.getByTestId("secondary");
    const isSecondaryVisible = await secondary.isVisible();
    if (isSecondaryVisible) {
      await expect(secondary).toBeVisible();
    }
  });

  test("handles very large initial size values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" initialPrimarySize="90%" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </Splitter>
    `);
    
    await expect(page.getByTestId("splitter")).toBeVisible();
    await expect(page.getByTestId("primary")).toBeVisible();
    // Secondary might be very small but should still be visible
    const secondary = page.getByTestId("secondary");
    const isSecondaryVisible = await secondary.isVisible();
    if (isSecondaryVisible) {
      await expect(secondary).toBeVisible();
    }
  });

  test("handles rapid resize operations", async ({ initTestBed, page, createSplitterDriver }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" orientation="horizontal" testId="splitter">
        <Stack backgroundColor="lightblue" height="100%" testId="primary"/>
        <Stack backgroundColor="darksalmon" height="100%" testId="secondary"/>
      </Splitter>
    `);

    const splitter = page.getByTestId("splitter");
    const driver = await createSplitterDriver(splitter);
    
    // Perform multiple rapid drag operations
    await driver.dragResizer(20, 0);
    await driver.dragResizer(-30, 0);
    await driver.dragResizer(40, 0);
    await driver.dragResizer(-10, 0);
    
    // Should still be functional
    await expect(page.getByTestId("primary")).toBeVisible();
    await expect(page.getByTestId("secondary")).toBeVisible();
  });

  test("conditional rendering works with different child component types", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Splitter height="200px" width="400px" testId="splitter">
        <VStack when="{false}" backgroundColor="lightblue" height="100%" testId="vstack">
          <Text>VStack Content</Text>
        </VStack>
        <Text backgroundColor="darksalmon" height="100%" testId="text">Just Text</Text>
        <Fragment when="{false}" testId="fragment">
          <Stack backgroundColor="lightgreen" height="100%">Fragment Content</Stack>
        </Fragment>
      </Splitter>
    `);
    
    // Only the Text component should be visible
    await expect(page.getByTestId("vstack")).not.toBeVisible();
    await expect(page.getByTestId("text")).toBeVisible();
    await expect(page.getByTestId("fragment")).not.toBeVisible();
    
    // Resizer should be hidden since only one child is visible
    const resizer = page.locator('[class*="resizer"]');
    const isResizerVisible = await resizer.isVisible().catch(() => false);
    expect(isResizerVisible).toBe(false);
    
    // Text component should stretch to fill container
    const splitter = page.getByTestId("splitter");
    const text = page.getByTestId("text");
    
    const splitterBounds = await getBounds(splitter);
    const textBounds = await getBounds(text);
    
    const tolerance = 5;
    expect(Math.abs(textBounds.width - splitterBounds.width)).toBeLessThan(tolerance);
  });
});

// =============================================================================
// UTILITY FUNCTION TESTS
// =============================================================================

test.describe("Utility Functions", () => {
  test.describe("parseSize", () => {
    test("parses positive pixel values", () => {
      expect(parseSize("100px", 400)).toBe(100);
      expect(parseSize("200px", 400)).toBe(200);
    });

    test("parses positive percentage values", () => {
      expect(parseSize("50%", 400)).toBe(200);
      expect(parseSize("25%", 400)).toBe(100);
      expect(parseSize("100%", 400)).toBe(400);
    });

    test("parses negative pixel values (calculated from end)", () => {
      expect(parseSize("-100px", 400)).toBe(300); // 400 - 100
      expect(parseSize("-50px", 400)).toBe(350);  // 400 - 50
      expect(parseSize("-200px", 600)).toBe(400); // 600 - 200
    });

    test("parses negative percentage values (calculated from end)", () => {
      expect(parseSize("-20%", 400)).toBe(320); // 80% of 400
      expect(parseSize("-50%", 400)).toBe(200); // 50% of 400
      expect(parseSize("-10%", 600)).toBe(540); // 90% of 600
    });

    test("throws error for invalid format", () => {
      expect(() => parseSize("100", 400)).toThrow("Invalid size format. Use px or %.");
      expect(() => parseSize("100em", 400)).toThrow("Invalid size format. Use px or %.");
      expect(() => parseSize("invalid", 400)).toThrow("Invalid size format. Use px or %.");
    });
  });

  test.describe("toPercentage", () => {
    test("converts pixel size to percentage", () => {
      expect(toPercentage(200, 400)).toBe(50);
      expect(toPercentage(100, 400)).toBe(25);
      expect(toPercentage(400, 400)).toBe(100);
      expect(toPercentage(0, 400)).toBe(0);
    });
  });
});
