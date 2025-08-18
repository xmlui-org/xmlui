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
  { name: 'Category G', value: 180 }
]`;

// Chart selectors - PieChart specific
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
      <PieChart
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

  test("renders pie sectors for data points", async ({ initTestBed, page }) => {
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
    // Should have 4 pie sectors for 4 data points
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders pie chart with correct structure", async ({ initTestBed, page }) => {
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
    await expect(page.locator(pieSelector)).toBeVisible();
    await expect(page.locator(chartSvg)).toBeVisible();
  });
});

// --- Data Handling Tests

test.describe("data handling", () => {
  test("renders with empty data array", async ({ initTestBed, page }) => {
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
    await expect(page.locator(pieSectorSelector)).toHaveCount(0);
  });

  test("renders with single data point", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
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
      <PieChart
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
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${largeDataset}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(7);
  });
});

// --- Legend Tests

test.describe("legend", () => {
  test("legend is hidden by default", async ({ initTestBed, page }) => {
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
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });

  test("legend is shown when showLegend is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
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
});

// --- Tooltip Tests

test.describe("tooltip", () => {
  test("tooltip appears on hover by default", async ({ initTestBed, page }) => {
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
    const pieSector = page.locator(pieSectorSelector).first();
    await pieSector.hover();
    
    // Wait for tooltip to appear
    await page.waitForTimeout(500);
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });

  test("tooltip shows correct data on hover", async ({ initTestBed, page }) => {
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
    const pieSector = page.locator(pieSectorSelector).first();
    await pieSector.hover();
    
    await page.waitForTimeout(500);
    const tooltip = page.locator(tooltipSelector);
    await expect(tooltip).toBeVisible();
    // Tooltip should contain data from the first sector
    await expect(tooltip).toContainText("Desktop");
    await expect(tooltip).toContainText("400");
  });
});

// --- Label Tests

test.describe("labels", () => {
  test("labels are shown by default (showLabel=true)", async ({ initTestBed, page }) => {
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
    // Labels should be rendered as text elements
    const labels = page.locator('text').filter({ hasText: /Desktop|Mobile|Tablet|Other/ });
    await expect(labels).toHaveCount(4);
  });

  test("labels are hidden when showLabel is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
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
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // When showLabelList is false (default), there should be no LabelList elements
    // We check for the absence of the recharts-label-list class
    await expect(page.locator(labelListSelector)).toHaveCount(0);
  });

  test("label list is shown when showLabelList is true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
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

  test("label list position can be configured", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        showLabel="{false}"
        showLabelList
        labelListPosition="outside"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // LabelList creates text elements with the label content
    const labelTexts = page.locator('text').filter({ hasText: /Desktop|Mobile|Tablet|Other/ });
    await expect(labelTexts).toHaveCount(4);
  });
});

// --- Radius Tests (PieChart specific)

test.describe("radius configuration", () => {
  test("renders with default outer radius", async ({ initTestBed, page }) => {
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
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders with custom outer radius", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        outerRadius="{100}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders as donut chart with inner radius", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        innerRadius="{50}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    // With inner radius, it becomes a donut chart
  });

  test("renders with both inner and outer radius", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        innerRadius="{40}"
        outerRadius="{80}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });
});

// --- Responsive Behavior Tests

test.describe("responsive behavior", () => {
  test("renders in small containers", async ({ initTestBed, page }) => {
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
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });

  test("renders in very small containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
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
      <PieChart
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

  test("handles rectangular containers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
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

test.describe("interaction", () => {
  test("pie sectors are interactive on hover", async ({ initTestBed, page }) => {
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
    const pieSector = page.locator(pieSectorSelector).first();
    
    // Hover should trigger active shape rendering
    await pieSector.hover();
    await page.waitForTimeout(300);
    
    // The sector should still be visible (active shape effect)
    await expect(pieSector).toBeVisible();
  });

  test("multiple sectors can be hovered", async ({ initTestBed, page }) => {
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
    const sectors = page.locator(pieSectorSelector);
    
    // Hover over different sectors
    await sectors.nth(0).hover();
    await page.waitForTimeout(200);
    await sectors.nth(1).hover();
    await page.waitForTimeout(200);
    await sectors.nth(2).hover();
    await page.waitForTimeout(200);
    
    // All sectors should still be present
    await expect(sectors).toHaveCount(4);
  });
});

// --- Children Support Tests

test.describe("children support", () => {
  test("renders with child components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      >
        <Text>Chart Title</Text>
      </PieChart>
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
    await expect(page.getByText("Chart Title")).toBeVisible();
  });
});

// --- Edge Cases

test.describe("edge cases", () => {
  test("handles missing dataKey gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        nameKey="name"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should still render the container but may not have sectors
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles missing nameKey gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <PieChart
        dataKey="value"
        data="{${sampleData}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles data with missing values", async ({ initTestBed, page }) => {
    const dataWithMissingValues = `[
      { name: 'Desktop', value: 400 },
      { name: 'Mobile', value: null },
      { name: 'Tablet', value: 200 },
      { name: 'Other' }
    ]`;

    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${dataWithMissingValues}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    // Should render sectors for valid data points
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles data with zero values", async ({ initTestBed, page }) => {
    const dataWithZeros = `[
      { name: 'Desktop', value: 400 },
      { name: 'Mobile', value: 0 },
      { name: 'Tablet', value: 200 },
      { name: 'Other', value: 0 }
    ]`;

    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${dataWithZeros}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    // Should handle zero values appropriately
  });

  test("handles negative values", async ({ initTestBed, page }) => {
    const dataWithNegatives = `[
      { name: 'Desktop', value: 400 },
      { name: 'Mobile', value: -100 },
      { name: 'Tablet', value: 200 },
      { name: 'Other', value: 100 }
    ]`;

    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${dataWithNegatives}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    // Should handle negative values (though they may not render as sectors)
  });

  test("handles very large values", async ({ initTestBed, page }) => {
    const dataWithLargeValues = `[
      { name: 'Desktop', value: 1000000 },
      { name: 'Mobile', value: 2000000 },
      { name: 'Tablet', value: 500000 },
      { name: 'Other', value: 100000 }
    ]`;

    await initTestBed(`
      <PieChart
        nameKey="name"
        dataKey="value"
        data="{${dataWithLargeValues}}"
        width="400px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(pieSectorSelector)).toHaveCount(4);
  });
});
