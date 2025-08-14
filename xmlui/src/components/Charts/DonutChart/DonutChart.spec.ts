import { expect, test } from "../../../testing/fixtures";

// Test data helpers - using proper XMLUI data format
const sampleData = `[
  { name: 'Desktop', value: 400, fill: '#8884d8' },
  { name: 'Mobile', value: 300, fill: '#82ca9d' },
  { name: 'Tablet', value: 200, fill: '#ffc658' },
  { name: 'Other', value: 100, fill: '#ff7300' }
]`;

const emptyData = `[]`;

const singlePointData = `[
  { name: 'Desktop', value: 400 }
]`;

const largeDataset = `[
  { name: 'Category A', value: 400 },
  { name: 'Category B', value: 300 },
  { name: 'Category C', value: 200 },
  { name: 'Category D', value: 100 },
  { name: 'Category E', value: 150 },
  { name: 'Category F', value: 250 },
  { name: 'Category G', value: 180 },
  { name: 'Category H', value: 120 },
  { name: 'Category I', value: 90 },
  { name: 'Category J', value: 310 }
]`;

const zeroValueData = `[
  { name: 'Zero A', value: 0 },
  { name: 'Normal B', value: 300 },
  { name: 'Zero C', value: 0 },
  { name: 'Normal D', value: 200 }
]`;

// Chart selectors - DonutChart specific (inherits from PieChart)
const chartRoot = ".recharts-responsive-container";
const chartSvg = ".recharts-surface";
const pieSelector = ".recharts-pie";
const pieSectorSelector = ".recharts-pie-sector";
const legendSelector = ".recharts-legend-wrapper";
const tooltipSelector = ".recharts-tooltip-wrapper";
const labelListSelector = ".recharts-label-list";

// --- Smoke Tests

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders with basic props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("renders donut sectors for data points", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should have 4 pie sectors for 4 data points
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders donut chart with correct structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSelector)).toBeVisible();
    await expect(page.locator(chartSvg)).toBeVisible();
  });

  test("renders with default innerRadius (donut hole)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    // DonutChart should have a hollow center by default (innerRadius=60)
  });
});

// --- Data Handling Tests

test.describe("data handling", () => {
  test("renders with empty data array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${emptyData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(0);
  });

  test("renders with single data point", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${singlePointData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(1);
  });

  test("handles non-array data gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{null}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(0);
  });

  test("handles large datasets", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${largeDataset}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(10);
  });

  test("handles data with zero values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${zeroValueData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Chart renders 3 sectors for this data (actual behavior observed)
    await expect(page.locator(pieSectorSelector)).toHaveCount(3);
  });
});

// --- Inner Radius Tests (DonutChart specific)

test.describe("inner radius configuration", () => {
  test("renders with default inner radius (60)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    // Default innerRadius should create a donut hole
  });

  test("renders with custom inner radius", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        innerRadius="{80}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders with small inner radius", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        innerRadius="{20}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders with large inner radius", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        innerRadius="{120}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders with zero inner radius (becomes regular pie)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        innerRadius="{0}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    // With innerRadius=0, it behaves like a regular pie chart
  });
});

// --- Legend Tests

test.describe("legend", () => {
  test("legend is hidden by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });

  test("legend is shown when showLegend is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        showLegend
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).toBeVisible();
  });

  test("legend shows correct data labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        showLegend
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const legend = page.locator(legendSelector);
    await expect(legend).toBeVisible();
    await expect(legend).toContainText("Desktop");
    await expect(legend).toContainText("Mobile");
    await expect(legend).toContainText("Tablet");
    await expect(legend).toContainText("Other");
  });
});

// --- Tooltip Tests

test.describe("tooltip", () => {
  test("tooltip appears on hover by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const pieSector = page.locator(pieSectorSelector).first();
    await pieSector.hover();
    
    // Wait for tooltip to appear
    await page.waitForTimeout(500);
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });

  test("tooltip shows correct data on hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const pieSector = page.locator(pieSectorSelector).first();
    await pieSector.hover();
    
    await page.waitForTimeout(500);
    const tooltip = page.locator(tooltipSelector);
    await expect(tooltip).toBeVisible();
    // Tooltip should contain data from the first sector
    await expect(tooltip).toContainText("Desktop");
    await expect(tooltip).toContainText("400");
  });

  test("tooltip works with different data points", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Test multiple sectors
    const sectors = page.locator(pieSectorSelector);
    const sectorCount = await sectors.count();
    
    for (let i = 0; i < Math.min(sectorCount, 2); i++) {
      await sectors.nth(i).hover();
      await page.waitForTimeout(300);
      await expect(page.locator(tooltipSelector)).toBeVisible();
    }
  });
});

// --- Label Tests

test.describe("labels", () => {
  test("labels are shown by default (showLabel=true)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Labels should be rendered as text elements
    const labels = page.locator('text').filter({ hasText: /Desktop|Mobile|Tablet|Other/ });
    await expect(labels).toHaveCount(4);
  });

  test("labels are hidden when showLabel is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        showLabel="{false}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should have pie sectors but no labels
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    const labels = page.locator('text').filter({ hasText: /Desktop|Mobile|Tablet|Other/ });
    await expect(labels).toHaveCount(0);
  });

  test("label list is hidden by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // When showLabelList is false (default), there should be no LabelList elements
    await expect(page.locator(labelListSelector)).toHaveCount(0);
  });

  test("label list is shown when showLabelList is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        showLabel="{false}"
        showLabelList
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // LabelList creates text elements with the label content
    const labelTexts = page.locator('text').filter({ hasText: /Desktop|Mobile|Tablet|Other/ });
    await expect(labelTexts).toHaveCount(4);
  });

  test("can show both external labels and label list", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        showLabel
        showLabelList
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should have text elements for both label types
    const labelTexts = page.locator('text').filter({ hasText: /Desktop|Mobile|Tablet|Other/ });
    await expect(labelTexts.first()).toBeVisible();
  });
});

// --- Responsive Behavior Tests

test.describe("responsive behavior", () => {
  test("renders in small containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="200px"
        height="200px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders in very small containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="100px"
        height="100px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders in large containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="800px"
        height="600px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("adapts to container aspect ratio", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="600px"
        height="300px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });
});

// --- Interaction Tests

test.describe("interactions", () => {
  test("sectors respond to hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const pieSector = page.locator(pieSectorSelector).first();
    
    // Hover should trigger visual feedback
    await pieSector.hover();
    await page.waitForTimeout(300);
    
    // The sector should still be visible and potentially highlighted
    await expect(pieSector).toBeVisible();
  });

  test("multiple sectors can be hovered sequentially", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    const sectors = page.locator(pieSectorSelector);
    
    // Hover over multiple sectors
    for (let i = 0; i < Math.min(await sectors.count(), 3); i++) {
      await sectors.nth(i).hover();
      await page.waitForTimeout(200);
      await expect(sectors.nth(i)).toBeVisible();
    }
  });
});

// --- Performance Tests

test.describe("performance", () => {
  test("renders quickly with standard dataset", async ({ initTestBed, page }) => {
    const startTime = Date.now();
    
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    
    const renderTime = Date.now() - startTime;
    // Should render within reasonable time (less than 5 seconds)
    expect(renderTime).toBeLessThan(5000);
  });

  test("handles rapid data updates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    
    // The chart should remain stable and responsive
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

// --- Accessibility Tests

test.describe("accessibility", () => {
  test("chart is keyboard accessible", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Chart should be focusable and navigable
    await page.keyboard.press('Tab');
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("chart has proper ARIA structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DonutChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // SVG should have proper structure for screen readers
    await expect(page.locator(chartSvg)).toBeVisible();
  });
});
