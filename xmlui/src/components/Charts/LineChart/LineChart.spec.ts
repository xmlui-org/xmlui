import { expect, test } from "../../../testing/fixtures";

// Test data helpers - using proper XMLUI data format
const sampleData = `[
  { name: 'Jan', sales: 100, profit: 20 },
  { name: 'Feb', sales: 150, profit: 30 },
  { name: 'Mar', sales: 120, profit: 25 },
  { name: 'Apr', sales: 180, profit: 40 }
]`;

const emptyData = `[]`;

const singlePointData = `[
  { name: 'Jan', sales: 100, profit: 20 }
]`;

// Chart selectors - updated for actual Recharts output
const chartRoot = ".recharts-responsive-container";
const chartSvg = ".recharts-surface";
const linesSelector = ".recharts-line";
const legendSelector = ".recharts-legend-wrapper";
const tooltipSelector = ".recharts-tooltip-wrapper";
const xAxisSelector = ".recharts-xAxis";
const yAxisSelector = ".recharts-yAxis";
const xTicksSelector = ".recharts-xAxis .recharts-cartesian-axis-tick-value";
const yTicksSelector = ".recharts-yAxis .recharts-cartesian-axis-tick-value";

// --- Smoke Tests

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders with basic props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("renders correct number of line series", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(linesSelector)).toHaveCount(2);
  });
});

// --- Data Handling Tests

test.describe("data handling", () => {
  test("renders with empty data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${emptyData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(linesSelector)).toHaveCount(0);
  });

  test("renders with single data point", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${singlePointData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(linesSelector)).toHaveCount(2);
  });

  test("handles non-array data gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{null}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(linesSelector)).toHaveCount(0);
  });
});

// --- Legend Tests

test.describe("legend", () => {
  test("legend is hidden by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });

  test("legend is shown when showLegend is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        showLegend
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).toBeVisible();
  });
});

// --- Tooltip Tests

test.describe("tooltip", () => {
  test("tooltip appears on hover by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const chart = page.locator(chartSvg).first();
    await chart.hover({ position: { x: 200, y: 100 } });
    
    // Wait for tooltip to appear
    await page.waitForTimeout(500);
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });

  test("tooltip is hidden when hideTooltip is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        hideTooltip
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const chart = page.locator(chartSvg).first();
    await chart.hover({ position: { x: 200, y: 100 } });
    
    await page.waitForTimeout(500);
    await expect(page.locator(tooltipSelector)).not.toBeVisible();
  });
});

// --- Axis Tests

test.describe("x-axis", () => {
  test("x-axis is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(xAxisSelector)).toBeVisible();
    // Check that at least one tick is present
    const tickCount = await page.locator(xTicksSelector).count();
    expect(tickCount).toBeGreaterThan(0);
  });

  test("x-axis is hidden when hideX is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        hideX
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(xTicksSelector)).toHaveCount(0);
  });

  test("x-axis ticks are hidden when hideTickX is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        hideTickX
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // When hideTickX is true, ticks should not be rendered in DOM
    await expect(page.locator(xTicksSelector)).toHaveCount(0);
    // But the axis line itself should still be present (though not visible due to tickLine=false)
    await expect(page.locator(xAxisSelector)).toBeAttached();
  });
});

test.describe("y-axis", () => {
  test("y-axis is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(yAxisSelector)).toBeVisible();
    // Check that at least one tick is present
    const tickCount = await page.locator(yTicksSelector).count();
    expect(tickCount).toBeGreaterThan(0);
  });

  test("y-axis is hidden when hideY is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        hideY
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(yTicksSelector)).toHaveCount(0);
  });

  test("y-axis ticks are hidden when hideTickY is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        hideTickY
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // When hideTickY is true, ticks should not be rendered in DOM
    await expect(page.locator(yTicksSelector)).toHaveCount(0);
    // But the axis line itself should still be present (though not visible due to tickLine=false)
    await expect(page.locator(yAxisSelector)).toBeAttached();
  });
});

// --- Formatter Tests

test.describe("formatters", () => {
  test("applies tickFormatterX when provided", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
          nameKey="name"
          data="{${sampleData}}"
          dataKeys="{['sales', 'profit']}"
          tickFormatterX="{(value) => value + ' (X)'}"
          width="600px"
          height="400px"
        />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Check that formatted text appears in x-axis ticks
    await expect(page.locator(xTicksSelector).first()).toContainText("(X)");
  });

  test("applies tickFormatterY when provided", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
          nameKey="name"
          data="{${sampleData}}"
          dataKeys="{['sales', 'profit']}"
          tickFormatterY="{(value) => '$' + value}"
          width="600px"
          height="400px"
        />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Check that formatted text appears in y-axis ticks
    await expect(page.locator(yTicksSelector).first()).toContainText("$");
  });
});

// --- Margin Tests

test.describe("margins", () => {
  test("applies custom margins", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        marginTop="{20}"
        marginRight="{30}"
        marginBottom="{40}"
        marginLeft="{50}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Chart should render with custom margins applied
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

// --- Responsive Behavior Tests

test.describe("responsive behavior", () => {
  test("enters mini mode with very small container height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="50px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // In mini mode, x-axis ticks should be hidden (tick=false)
    await expect(page.locator(xTicksSelector)).toHaveCount(0);
    // Y-axis ticks should also be hidden in mini mode
    await expect(page.locator(yTicksSelector)).toHaveCount(0);
    // Chart should still render the lines
    await expect(page.locator(linesSelector)).toHaveCount(2);
  });

  test("renders normally with adequate height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="200px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // With adequate height, should have ticks
    const tickCount = await page.locator(xTicksSelector).count();
    expect(tickCount).toBeGreaterThan(0);
    // Chart should render normally
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("adjusts tick intervals for narrow containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="150px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should still render with narrow width
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(linesSelector)).toHaveCount(2);
  });
});

// --- Tooltip Template Tests

test.describe("tooltipTemplate", () => {
  test("renders custom tooltip template", async ({ initTestBed, page }) => {
    await initTestBed(`
      <BarChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        width="600px"
        height="400px"
      >
        <property name="tooltipTemplate">
          <VStack>
            <Text>Custom Tooltip</Text>
            <Text>Label: {$tooltip.label}</Text>
            <Text>Active: {$tooltip.active}</Text>
          </VStack>
        </property>
      </BarChart>
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const chart = page.locator(chartSvg).first();
    await chart.hover({ position: { x: 200, y: 100 } });
    
    // Wait for tooltip to appear
    await page.waitForTimeout(500);
    await expect(page.locator(tooltipSelector)).toBeVisible();
    
    // Check for custom tooltip content
    await expect(page.getByText("Custom Tooltip")).toBeVisible();
    await expect(page.getByText(/Label:/)).toBeVisible();
    await expect(page.getByText(/Active:/)).toBeVisible();
  });

  test("tooltip template is not rendered when hideTooltip is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <LineChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['sales', 'profit']}"
        hideTooltip
        width="600px"
        height="400px"
      >
        <property name="tooltipTemplate">
          <Text>This tooltip should not appear</Text>
        </property>
      </LineChart>
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const chart = page.locator(chartSvg).first();
    await chart.hover({ position: { x: 200, y: 100 } });
    
    await page.waitForTimeout(500);
    await expect(page.locator(tooltipSelector)).not.toBeVisible();
    await expect(page.getByText("This tooltip should not appear")).not.toBeVisible();
  });

  test("falls back to default tooltip when tooltipTemplate is not provided", async ({ initTestBed, page }) => {
      await initTestBed(`
        <LineChart
          nameKey="name"
          data="{${sampleData}}"
          dataKeys="{['sales', 'profit']}"
          width="600px"
          height="400px"
        />
      `);
      
      await page.waitForSelector(chartRoot, { timeout: 10000 });
      const chart = page.locator(chartSvg).first();
      await chart.hover({ position: { x: 200, y: 100 } });
      
      await page.waitForTimeout(500);
      await expect(page.locator(tooltipSelector)).toBeVisible();
      
      // Default tooltip should contain standard recharts tooltip content
      const tooltip = page.locator(tooltipSelector);
      await expect(tooltip).toBeVisible();
    });
});
