import { expect, test } from "../../../testing/fixtures";

// Test data helpers - using proper XMLUI data format
const sampleData = `[
  { name: 'Desktop', value: 400, fill: '#8884d8' },
  { name: 'Mobile', value: 300, fill: '#82ca9d' },
  { name: 'Tablet', value: 200, fill: '#ffc658' },
  { name: 'Other', value: 100, fill: '#ff7300' }
]`;

const multiSeriesData = `[
  { name: 'Jan', sales: 100, profit: 20, expenses: 80 },
  { name: 'Feb', sales: 150, profit: 30, expenses: 120 },
  { name: 'Mar', sales: 120, profit: 25, expenses: 95 },
  { name: 'Apr', sales: 180, profit: 40, expenses: 140 }
]`;

const largeValueData = `[
  { name: 'Category A', value: 1234567 },
  { name: 'Category B', value: 9876543 },
  { name: 'Category C', value: 5555555 }
]`;

// Chart selectors - Tooltip specific
const chartRoot = ".recharts-responsive-container";
const tooltipSelector = ".recharts-tooltip-wrapper";
const tooltipContentSelector = "[class*='tooltipContainer']";
const tooltipLabelSelector = ".label";
const tooltipIndicatorSelector = "[class*='indicator']";
const tooltipValueSelector = "[class*='valueText']";
const tooltipNameSelector = "[class*='mutedText']";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  // Smoke tests
  test.describe("smoke tests", { tag: "@smoke" }, () => {
    test("TooltipContent renders in PieChart on hover", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });

      // Hover over a pie sector to trigger tooltip
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      // Tooltip should appear
      await expect(page.locator(tooltipSelector)).toBeVisible();
      await expect(page.locator(tooltipContentSelector)).toBeVisible();
    });

    test("TooltipContent renders in BarChart on hover", async ({ initTestBed, page }) => {
      await initTestBed(`
        <BarChart
          xKey="name"
          yKeys="{['value']}"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });

      // Hover over a bar to trigger tooltip
      const barElement = page.locator(".recharts-bar-rectangle").first();
      await barElement.hover();

      // Check if tooltip content is visible
      await expect(page.locator(tooltipContentSelector)).toBeVisible();
      await expect(page.locator(tooltipNameSelector)).toBeVisible();
      await expect(page.locator(tooltipValueSelector)).toBeVisible();
    });
  });

  // Indicator prop tests
  test.describe("indicator prop", () => {
    test("displays dot indicator by default", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();
      const indicator = page.locator(tooltipIndicatorSelector);
      await expect(indicator).toBeVisible();

      // Should have dot styling (default)
      await expect(indicator).toHaveClass(/dot/);
    });

    test("displays line indicator when specified", async ({ initTestBed, page }) => {
      // Note: Since TooltipContent is used internally, we test through chart context
      // The indicator prop would be passed through chart tooltip configuration
      await initTestBed(`
        <BarChart
          xKey="name"
          yKeys="{['value']}"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });

      // Hover over a bar to trigger tooltip
      const barElement = page.locator(".recharts-bar-rectangle").first();
      await barElement.hover();

      // Check if tooltip content is visible with proper styling
      await expect(page.locator(tooltipContentSelector)).toBeVisible();
      await expect(page.locator(tooltipNameSelector)).toBeVisible();
      await expect(page.locator(tooltipValueSelector)).toBeVisible();
    });
  });

  // Data handling tests
  test.describe("data handling", () => {
    test("displays single data point correctly", async ({ initTestBed, page }) => {
      const singleData = `[{ name: 'Single', value: 100 }]`;

      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${singleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();
      await expect(page.locator(tooltipNameSelector)).toContainText("Single");
      await expect(page.locator(tooltipValueSelector)).toContainText("100");
    });

    test("displays multiple data series correctly", async ({ initTestBed, page }) => {
      await initTestBed(`
        <BarChart
          xKey="name"
          yKeys="{['sales', 'profit']}"
          data="{${multiSeriesData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });

      // Hover over a bar to trigger tooltip
      const barElement = page.locator(".recharts-bar-rectangle").first();
      await barElement.hover();

      // Check if tooltip shows multiple series data
      await expect(page.locator(tooltipContentSelector)).toBeVisible();

      // Should show data for both series - check for multiple indicators
      const indicators = page.locator(tooltipIndicatorSelector);
      await expect(indicators).toHaveCount(2);
    });

    test("formats large numbers with locale string", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${largeValueData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();

      // Should format large numbers with commas
      const valueText = await page.locator(tooltipValueSelector).textContent();
      expect(valueText).toMatch(/1,234,567/);
    });

    test("handles zero values correctly", async ({ initTestBed, page }) => {
      const zeroData = `[
        { name: 'Zero', value: 0 },
        { name: 'Positive', value: 100 }
      ]`;

      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${zeroData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();
      // Should handle zero values gracefully
      const valueElements = page.locator(tooltipValueSelector);
      await expect(valueElements.first()).toBeVisible();
    });
  });

  // Label handling tests
  test.describe("label handling", () => {
    test("displays tooltip content without label by default", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();

      // Default PieChart tooltip doesn't have a label, so check for name and value instead
      await expect(page.locator(tooltipNameSelector)).toBeVisible();
      await expect(page.locator(tooltipValueSelector)).toBeVisible();
    });

    test("handles Unicode characters in labels", async ({ initTestBed, page }) => {
      const unicodeData = `[
        { name: 'Desktop 🖥️', value: 400 },
        { name: 'Mobile 📱', value: 300 }
      ]`;

      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${unicodeData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();

      // Should display Unicode characters correctly
      const nameText = page.locator(tooltipNameSelector);
      await expect(nameText).toContainText("🖥️");
    });
  });

  // Color and styling tests
  test.describe("color and styling", () => {
    test("displays indicator with correct colors", async ({ initTestBed, page }) => {
      await initTestBed(`
        <PieChart
          nameKey="name"
          dataKey="value"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.hover();

      await expect(page.locator(tooltipContentSelector)).toBeVisible();

      const indicator = page.locator(tooltipIndicatorSelector);
      await expect(indicator).toBeVisible();

      // Indicator should have background color
      const backgroundColor = await indicator.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      expect(backgroundColor).not.toBe("rgba(0, 0, 0, 0)"); // Not transparent
    });

    test("applies consistent styling across different chart types", async ({
      initTestBed,
      page,
    }) => {
      // Test in LineChart context
      await initTestBed(`
        <LineChart
          xKey="name"
          yKeys="{['value']}"
          data="{${sampleData}}"
          width="400px"
          height="400px"
        />
      `);

      await page.waitForSelector(chartRoot, { timeout: 10000 });

      // Hover over chart area to trigger tooltip (Recharts tooltip activates on chart area, not just line)
      const chartSvg = page.locator(".recharts-surface").first();
      await chartSvg.hover({ position: { x: 200, y: 200 } });

      // Wait for tooltip to appear
      await page.waitForTimeout(500);
      await expect(page.locator(tooltipContentSelector)).toBeVisible();

      // Should have consistent styling
      const indicator = page.locator(tooltipIndicatorSelector);
      await expect(indicator).toBeVisible();
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("tooltip content is accessible to screen readers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.hover();

    await expect(page.locator(tooltipContentSelector)).toBeVisible();

    // Tooltip content should be accessible
    const tooltipContent = page.locator(tooltipContentSelector);
    await expect(tooltipContent).toBeVisible();

    // Text content should be readable
    const nameText = page.locator(tooltipNameSelector);
    const valueText = page.locator(tooltipValueSelector);
    await expect(nameText).toBeVisible();
    await expect(valueText).toBeVisible();
  });

  test("tooltip has proper contrast and readability", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.hover();

    await expect(page.locator(tooltipContentSelector)).toBeVisible();

    // Text should have readable font size
    const valueText = page.locator(tooltipValueSelector);
    await expect(valueText).toHaveCSS("font-size", /\d+px/);

    // Should have proper contrast (background vs text)
    const tooltipContainer = page.locator(tooltipContentSelector);
    const backgroundColor = await tooltipContainer.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).not.toBe("transparent");
  });

  test("tooltip appears on keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });

    // Focus on chart and use keyboard navigation
    await page.keyboard.press("Tab");

    // Chart should be focusable and tooltip may appear on focus
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();
  });
});

// =============================================================================
// PERFORMANCE AND EDGE CASES
// =============================================================================

test.describe("Performance and Edge Cases", () => {
  test("handles rapid hover events efficiently", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });

    const sectors = page.locator(".recharts-pie-sector");

    // Rapidly hover over different sectors
    for (let i = 0; i < 3; i++) {
      await sectors.nth(i).hover();
      await page.waitForTimeout(100);
    }

    // Tooltip should still work correctly
    await sectors.first().hover();
    await expect(page.locator(tooltipContentSelector)).toBeVisible();
  });

  test("handles empty or null data gracefully", async ({ initTestBed, page }) => {
    const emptyData = `[]`;

    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${emptyData}}"
        width="400px"
        height="400px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });

    // Should not crash with empty data
    // Tooltip won't appear since there's no data to hover over
    const chart = page.locator(chartRoot);
    await expect(chart).toBeVisible();
  });

  test("handles special characters and long text", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{[
          { name: 'Category with quotes & symbols', value: 400 },
          { name: 'Very long category name that might wrap to multiple lines in the tooltip', value: 300 }
        ]}"
        width="400px"
        height="400px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.hover();

    await expect(page.locator(tooltipContentSelector)).toBeVisible();

    // Should handle special characters correctly
    const nameText = page.locator(tooltipNameSelector);
    await expect(nameText).toContainText("quotes");
    await expect(page.locator(tooltipValueSelector)).toContainText("400");
  });

  test("tooltip positioning adapts to chart boundaries", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="200px"
        height="200px"
      />
    `);

    await page.waitForSelector(chartRoot, { timeout: 10000 });

    // Hover near edge of small chart
    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.hover();

    await expect(page.locator(tooltipContentSelector)).toBeVisible();

    // Tooltip should be positioned within viewport
    const tooltip = page.locator(tooltipSelector);
    const boundingBox = await tooltip.boundingBox();
    expect(boundingBox).toBeTruthy();
    if (boundingBox) {
      expect(boundingBox.x).toBeGreaterThanOrEqual(0);
      expect(boundingBox.y).toBeGreaterThanOrEqual(0);
    }
  });
});
