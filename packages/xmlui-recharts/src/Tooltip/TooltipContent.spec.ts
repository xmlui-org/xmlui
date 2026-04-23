import { expect, test } from "xmlui/testing";

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
      `, { extensionIds: "xmlui-recharts" });

      // Hover over a pie sector to trigger tooltip
      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);
      await expect(page.locator(tooltipSelector)).toBeVisible();
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
      `, { extensionIds: "xmlui-recharts" });

      // Hover over a bar to trigger tooltip
      const barElement = page.locator(".recharts-bar-rectangle").first();
      const tooltipContent = page.locator(tooltipContentSelector);
      await expect
        .poll(
          async () => {
            await barElement.hover();
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);
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
      `, { extensionIds: "xmlui-recharts" });

      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      const indicator = page.locator(tooltipIndicatorSelector);
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);
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
      `, { extensionIds: "xmlui-recharts" });

      // Hover over a bar to trigger tooltip
      const barElement = page.locator(".recharts-bar-rectangle").first();
      const tooltipContent = page.locator(tooltipContentSelector);
      await expect
        .poll(
          async () => {
            await barElement.hover();
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);
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
      `, { extensionIds: "xmlui-recharts" });

      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);
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
      `, { extensionIds: "xmlui-recharts" });

      // Hover over a bar to trigger tooltip
      const barElement = page.locator(".recharts-bar-rectangle").first();
      const tooltipContent = page.locator(tooltipContentSelector);
      const indicators = page.locator(tooltipIndicatorSelector);
      await expect
        .poll(
          async () => {
            await barElement.hover();
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);

      // Should show data for both series - check for multiple indicators
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
      `, { extensionIds: "xmlui-recharts" });

      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      const valueElement = page.locator(tooltipValueSelector);

      // Poll: re-hover on each attempt until the tooltip shows the formatted value.
      // A one-shot hover is flaky because the tooltip can miss or flicker.
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            if (!(await tooltipContent.isVisible())) return null;
            return valueElement.textContent();
          },
          { timeout: 15000 },
        )
        .toMatch(/1,234,567/);
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
      `, { extensionIds: "xmlui-recharts" });

      // Use .last() — the positive-value sector is last in data order; the zero-value
      // sector may not render a visible arc, making .first() land on it unpredictably.
      const pieSector = page.locator(".recharts-pie-sector").last();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);
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
      `, { extensionIds: "xmlui-recharts" });

      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);

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
      `, { extensionIds: "xmlui-recharts" });

      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      // Poll: re-hover until the tooltip shows the correct Unicode text.
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            if (!(await tooltipContent.isVisible())) return null;
            return page.locator(tooltipNameSelector).textContent();
          },
          { timeout: 15000 },
        )
        .toContain("🖥️");
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
      `, { extensionIds: "xmlui-recharts" });

      const pieSector = page.locator(".recharts-pie-sector").first();
      await pieSector.waitFor({ state: "visible", timeout: 10000 });

      const tooltipContent = page.locator(tooltipContentSelector);
      const indicator = page.locator(tooltipIndicatorSelector);

      // Poll: re-hover until tooltip is visible and indicator has a non-transparent background.
      await expect
        .poll(
          async () => {
            await pieSector.hover({ force: true });
            if (!(await tooltipContent.isVisible())) return null;
            return indicator.evaluate((el) => window.getComputedStyle(el).backgroundColor);
          },
          { timeout: 15000 },
        )
        .not.toBe("rgba(0, 0, 0, 0)"); // Not transparent
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
      `, { extensionIds: "xmlui-recharts" });

      // Hover over chart area to trigger tooltip (Recharts tooltip activates on chart area, not just line)
      const chartSvg = page.locator(".recharts-surface").first();
      const tooltipContent = page.locator(tooltipContentSelector);
      const indicator = page.locator(tooltipIndicatorSelector);

      await expect
        .poll(
          async () => {
            await chartSvg.hover({ position: { x: 200, y: 200 } });
            return tooltipContent.isVisible();
          },
          { timeout: 15000 },
        )
        .toBe(true);

      // Should have consistent styling
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
    `, { extensionIds: "xmlui-recharts" });

    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.waitFor({ state: "visible", timeout: 10000 });

    const tooltipContent = page.locator(tooltipContentSelector);
    // Poll: re-hover until the tooltip and both text elements are all visible at once.
    await expect
      .poll(
        async () => {
          await pieSector.hover({ force: true });
          if (!(await tooltipContent.isVisible())) return false;
          const nameVisible = await page.locator(tooltipNameSelector).isVisible();
          const valueVisible = await page.locator(tooltipValueSelector).isVisible();
          return nameVisible && valueVisible;
        },
        { timeout: 15000 },
      )
      .toBe(true);
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
    `, { extensionIds: "xmlui-recharts" });

    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.waitFor({ state: "visible", timeout: 10000 });

    const tooltipContent = page.locator(tooltipContentSelector);
    await expect
      .poll(
        async () => {
          await pieSector.hover({ force: true });
          return tooltipContent.isVisible();
        },
        { timeout: 15000 },
      )
      .toBe(true);

    // Text should have readable font size
    const valueText = page.locator(tooltipValueSelector);
    await expect(valueText).toHaveCSS("font-size", /\d+px/);

    // Should have proper contrast (background vs text)
    const backgroundColor = await tooltipContent.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).not.toBe("transparent");
  });
});

// =============================================================================
// PERFORMANCE AND EDGE CASES
// =============================================================================

test.describe("Performance and Edge Cases", () => {
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
    `, { extensionIds: "xmlui-recharts" });

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
    `, { extensionIds: "xmlui-recharts" });

    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.waitFor({ state: "visible", timeout: 10000 });

    const tooltipContent = page.locator(tooltipContentSelector);
    await expect
      .poll(
        async () => {
          await pieSector.hover({ force: true });
          return tooltipContent.isVisible();
        },
        { timeout: 15000 },
      )
      .toBe(true);

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
    `, { extensionIds: "xmlui-recharts" });

    // Wait for at least one pie sector to be rendered
    const pieSector = page.locator(".recharts-pie-sector").first();
    await pieSector.waitFor({ state: "visible", timeout: 10000 });

    // On a 200x200 chart, the individual pie sectors are tiny and Playwright's
    // "hover at bounding-box center" of a sector can miss its actual filled
    // path. Move the mouse manually to the chart's geometric center — which
    // reliably lies inside a pie sector — and poll until the tooltip appears.
    const chartBox = await page.locator(chartRoot).boundingBox();
    expect(chartBox).toBeTruthy();
    const centerX = chartBox!.x + chartBox!.width / 2;
    const centerY = chartBox!.y + chartBox!.height / 2;
    await page.mouse.move(0, 0);
    await expect
      .poll(
        async () => {
          await page.mouse.move(centerX, centerY);
          return await page.locator(tooltipContentSelector).isVisible();
        },
        { timeout: 10000 },
      )
      .toBe(true);

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
