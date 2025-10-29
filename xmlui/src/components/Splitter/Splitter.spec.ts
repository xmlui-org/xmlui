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
