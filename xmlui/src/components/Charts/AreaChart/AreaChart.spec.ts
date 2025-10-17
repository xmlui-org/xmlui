import { expect, test } from "../../../testing/fixtures";

// Test data helpers - using proper XMLUI data format
const sampleData = `[
  { name: 'Jan', value: 100, category: 400 },
  { name: 'Feb', value: 150, category: 300 },
  { name: 'Mar', value: 120, category: 500 },
  { name: 'Apr', value: 180, category: 200 }
]`;

const emptyData = `[]`;

const singlePointData = `[
  { name: 'Jan', value: 100, category: 400 }
]`;

const multiSeriesData = `[
  { month: 'Jan', sales: 1200, profit: 400, expenses: 800 },
  { month: 'Feb', sales: 1900, profit: 600, expenses: 1300 },
  { month: 'Mar', sales: 1500, profit: 500, expenses: 1000 },
  { month: 'Apr', sales: 1800, profit: 700, expenses: 1100 }
]`;

const largeDataset = `[
  ${Array.from({ length: 20 }, (_, i) => 
    `{ name: 'Point${i + 1}', value: ${Math.floor(Math.random() * 1000)}, secondary: ${Math.floor(Math.random() * 500)} }`
  ).join(', ')}
]`;

// Chart selectors - update based on specific Recharts component
const chartRoot = ".recharts-responsive-container";
const chartSvg = ".recharts-surface";
const chartElementsSelector = ".recharts-area"; // AreaChart specific
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
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("renders correct number of chart elements", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    const elements = page.locator(chartElementsSelector);
    await expect(elements).toHaveCount(2); // Should match dataKeys length
  });

  test("handles empty data gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${emptyData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles single data point", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${singlePointData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

// --- Axis Tests

test.describe("x-axis", () => {
  test("x-axis is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(xAxisSelector, { timeout: 10000 });
    await expect(page.locator(xAxisSelector)).toBeVisible();
  });

  test("x-axis can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideX="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(xAxisSelector)).not.toBeVisible();
  });

  test("x-axis tick labels can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTickX="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(xTicksSelector)).not.toBeVisible();
  });
});

test.describe("y-axis", () => {
  test("y-axis is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(yAxisSelector, { timeout: 10000 });
    await expect(page.locator(yAxisSelector)).toBeVisible();
  });

  test("y-axis can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideY="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(yAxisSelector)).not.toBeVisible();
  });

  test("y-axis tick labels can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTickY="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(yTicksSelector)).not.toBeVisible();
  });
});

// --- Legend Tests

test.describe("legend", () => {
  test("legend is hidden by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });

  test("legend can be shown", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        showLegend="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    await expect(page.locator(legendSelector)).toBeVisible();
  });
});

// --- Area Chart Specific Tests

test.describe("stacked areas", () => {
  test("areas are not stacked by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    const areas = page.locator(chartElementsSelector);
    await expect(areas).toHaveCount(2);
  });

  test("areas can be stacked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        stacked="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    const areas = page.locator(chartElementsSelector);
    await expect(areas).toHaveCount(2);
  });
});

test.describe("curved areas", () => {
  test("areas are linear by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toBeVisible();
  });

  test("areas can be curved", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        curved="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toBeVisible();
  });
});

// --- Responsive Behavior Tests

test.describe("responsive behavior", () => {
  test("enters mini mode with very small container height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        showLegend="true"
        width="600px"
        height="100px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // In mini mode, legend and axes should be hidden
    await expect(page.locator(legendSelector)).not.toBeVisible();
    await expect(page.locator(xAxisSelector)).not.toBeVisible();
    await expect(page.locator(yAxisSelector)).not.toBeVisible();
  });

  test("normal mode with adequate height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        showLegend="true"
        width="600px"
        height="300px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // In normal mode, legend and axes should be visible
    await expect(page.locator(legendSelector)).toBeVisible();
    await expect(page.locator(xAxisSelector)).toBeVisible();
    await expect(page.locator(yAxisSelector)).toBeVisible();
  });
});

// --- Tooltip Tests

test.describe("tooltip", () => {
  test("tooltip is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Hover over chart area to trigger tooltip
    await page.locator(chartElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });

  test("tooltip can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTooltip="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Hover over chart area - tooltip should not appear
    await page.locator(chartElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).not.toBeVisible();
  });
});

// --- Comprehensive Prop Tests

test.describe("data prop", () => {
  test("handles array data correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(chartElementsSelector)).toHaveCount(1);
  });

  test("handles empty array gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${emptyData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles large datasets", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${largeDataset}}"
        dataKeys="{['value', 'secondary']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(2);
  });

  test("handles missing data prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

test.describe("dataKeys prop", () => {
  test("renders single data series", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(1);
  });

  test("renders multiple data series", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="month"
        data="{${multiSeriesData}}"
        dataKeys="{['sales', 'profit', 'expenses']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(3);
  });

  test("handles empty dataKeys array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{[]}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(chartElementsSelector)).toHaveCount(0);
  });

  test("handles non-existent dataKeys", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['nonexistent', 'alsononexistent']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

test.describe("nameKey prop", () => {
  test("uses correct nameKey for x-axis labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(xTicksSelector, { timeout: 10000 });
    const firstTick = page.locator(xTicksSelector).first();
    await expect(firstTick).toContainText("Jan");
  });

  test("handles different nameKey", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="month"
        data="{${multiSeriesData}}"
        dataKeys="{['sales']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(xTicksSelector, { timeout: 10000 });
    const firstTick = page.locator(xTicksSelector).first();
    await expect(firstTick).toContainText("Jan");
  });

  test("handles missing nameKey", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles non-existent nameKey", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="nonexistent"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

test.describe("hideX prop", () => {
  test("shows X-axis by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(xAxisSelector, { timeout: 10000 });
    await expect(page.locator(xAxisSelector)).toBeVisible();
  });

  test("hides X-axis when hideX is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideX="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(xAxisSelector)).not.toBeVisible();
  });

  test("shows X-axis when hideX is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideX="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(xAxisSelector, { timeout: 10000 });
    await expect(page.locator(xAxisSelector)).toBeVisible();
  });
});

test.describe("hideY prop", () => {
  test("shows Y-axis by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(yAxisSelector, { timeout: 10000 });
    await expect(page.locator(yAxisSelector)).toBeVisible();
  });

  test("hides Y-axis when hideY is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideY="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(yAxisSelector)).not.toBeVisible();
  });

  test("shows Y-axis when hideY is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideY="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(yAxisSelector, { timeout: 10000 });
    await expect(page.locator(yAxisSelector)).toBeVisible();
  });
});

test.describe("hideTickX prop", () => {
  test("shows X-axis ticks by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(xAxisSelector, { timeout: 5000 });
    // Wait a bit more for ticks to render
    await page.waitForTimeout(1000);
    const ticks = page.locator(xTicksSelector);
    await expect(ticks.first()).toBeVisible();
  });

  test("hides X-axis ticks when hideTickX is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTickX="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(xTicksSelector)).not.toBeVisible();
  });

  test("shows X-axis ticks when hideTickX is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTickX="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(xAxisSelector, { timeout: 5000 });
    await page.waitForTimeout(1000);
    const ticks = page.locator(xTicksSelector);
    await expect(ticks.first()).toBeVisible();
  });
});

test.describe("hideTickY prop", () => {
  test("shows Y-axis ticks by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(yAxisSelector, { timeout: 5000 });
    await page.waitForTimeout(1000);
    const ticks = page.locator(yTicksSelector);
    await expect(ticks.first()).toBeVisible();
  });

  test("hides Y-axis ticks when hideTickY is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTickY="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(yTicksSelector)).not.toBeVisible();
  });

  test("shows Y-axis ticks when hideTickY is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTickY="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(yAxisSelector, { timeout: 5000 });
    await page.waitForTimeout(1000);
    const ticks = page.locator(yTicksSelector);
    await expect(ticks.first()).toBeVisible();
  });
});

test.describe("hideTooltip prop", () => {
  test("shows tooltip by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.locator(chartElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });

  test("hides tooltip when hideTooltip is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTooltip="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.locator(chartElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).not.toBeVisible();
  });

  test("shows tooltip when hideTooltip is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideTooltip="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.locator(chartElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });
});

test.describe("showLegend prop", () => {
  test("hides legend by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });

  test("shows legend when showLegend is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        showLegend="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    await expect(page.locator(legendSelector)).toBeVisible();
  });

  test("hides legend when showLegend is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        showLegend="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });
});

test.describe("stacked prop", () => {
  test("areas are not stacked by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(2);
  });

  test("stacks areas when stacked is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        stacked="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(2);
  });

  test("does not stack when stacked is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value', 'category']}"
        stacked="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(2);
  });
});

test.describe("curved prop", () => {
  test("areas are linear by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toBeVisible();
  });

  test("curves areas when curved is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        curved="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toBeVisible();
  });

  test("keeps areas linear when curved is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        curved="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartElementsSelector, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toBeVisible();
  });
});

test.describe("tickFormatter props", () => {
  test("applies custom X-axis tick formatter", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        tickFormatterX="{(value) => 'X-' + value}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(xTicksSelector, { timeout: 10000 });
    const firstTick = page.locator(xTicksSelector).first();
    await expect(firstTick).toContainText("X-");
  });

  test("applies custom Y-axis tick formatter", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        tickFormatterY="{(value) => value + '%'}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(yTicksSelector, { timeout: 10000 });
    const firstTick = page.locator(yTicksSelector).first();
    await expect(firstTick).toContainText("%");
  });

  test("works without tick formatters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(xAxisSelector, { timeout: 5000 });
    await page.waitForSelector(yAxisSelector, { timeout: 5000 });
    await page.waitForTimeout(1000);
    const xTicks = page.locator(xTicksSelector);
    const yTicks = page.locator(yTicksSelector);
    await expect(xTicks.first()).toBeVisible();
    await expect(yTicks.first()).toBeVisible();
  });
});

test.describe("combined props", () => {
  test("all visual props combined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="month"
        data="{${multiSeriesData}}"
        dataKeys="{['sales', 'profit']}"
        stacked="true"
        curved="true"
        showLegend="true"
        hideTickX="true"
        hideTickY="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(2);
    await expect(page.locator(legendSelector)).toBeVisible();
    await expect(page.locator(xTicksSelector)).not.toBeVisible();
    await expect(page.locator(yTicksSelector)).not.toBeVisible();
  });

  test("minimal configuration", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="name"
        data="{${sampleData}}"
        dataKeys="{['value']}"
        hideX="true"
        hideY="true"
        hideTooltip="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(1);
    await expect(page.locator(xAxisSelector)).not.toBeVisible();
    await expect(page.locator(yAxisSelector)).not.toBeVisible();
  });

  test("maximum configuration", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AreaChart
        nameKey="month"
        data="{${multiSeriesData}}"
        dataKeys="{['sales', 'profit', 'expenses']}"
        stacked="true"
        curved="true"
        showLegend="true"
        hideX="false"
        hideY="false"
        hideTickX="false"
        hideTickY="false"
        hideTooltip="false"
        tickFormatterX="{(value) => 'Month: ' + value}"
        tickFormatterY="{(value) => '$' + value}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(chartElementsSelector, { timeout: 5000 });
    await expect(page.locator(chartElementsSelector)).toHaveCount(3);
    
    await page.waitForSelector(legendSelector, { timeout: 5000 });
    await expect(page.locator(legendSelector)).toBeVisible();
    
    await page.waitForSelector(xAxisSelector, { timeout: 5000 });
    await page.waitForSelector(yAxisSelector, { timeout: 5000 });
    await expect(page.locator(xAxisSelector)).toBeVisible();
    await expect(page.locator(yAxisSelector)).toBeVisible();
    
    await page.waitForTimeout(1000);
    const xTicks = page.locator(xTicksSelector);
    const yTicks = page.locator(yTicksSelector);
    await expect(xTicks.first()).toBeVisible();
    await expect(yTicks.first()).toBeVisible();
  });
});
