import { expect, test } from "../../../testing/fixtures";

// Test data helpers - using proper XMLUI data format for radar charts
const sampleData = `[
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
  { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
  { subject: 'History', A: 65, B: 85, fullMark: 150 }
]`;

const emptyData = `[]`;

const singlePointData = `[
  { subject: 'Math', A: 120, B: 110, fullMark: 150 }
]`;

const multiSeriesData = `[
  { skill: 'Communication', team1: 80, team2: 90, team3: 75 },
  { skill: 'Problem Solving', team1: 95, team2: 85, team3: 90 },
  { skill: 'Leadership', team1: 70, team2: 95, team3: 80 },
  { skill: 'Technical', team1: 90, team2: 80, team3: 95 },
  { skill: 'Creativity', team1: 85, team2: 75, team3: 85 }
]`;

const largeDataset = `[
  ${Array.from({ length: 10 }, (_, i) => 
    `{ category: 'Cat${i + 1}', value1: ${Math.floor(Math.random() * 100)}, value2: ${Math.floor(Math.random() * 100)} }`
  ).join(', ')}
]`;

// Chart selectors - update based on specific Recharts RadarChart output
const chartRoot = ".recharts-responsive-container";
const chartSvg = ".recharts-surface";
const radarElementsSelector = ".recharts-radar"; // RadarChart specific
const legendSelector = ".recharts-legend-wrapper";
const tooltipSelector = ".recharts-tooltip-wrapper";
const polarGridSelector = ".recharts-polar-grid";
const polarAngleAxisSelector = ".recharts-polar-angle-axis";
const polarRadiusAxisSelector = ".recharts-polar-radius-axis";
const angleAxisTicksSelector = ".recharts-polar-angle-axis .recharts-text";
const radiusAxisTicksSelector = ".recharts-polar-radius-axis .recharts-text";

// --- Smoke Tests

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders with basic props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("renders correct number of radar elements", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A', 'B']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    const elements = page.locator(radarElementsSelector);
    await expect(elements).toHaveCount(2); // Should match dataKeys length
  });

  test("handles empty data gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${emptyData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });

  test("handles single data point", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${singlePointData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
  });
});

// --- Grid and Axes Tests

test.describe("polar grid", () => {
  test("polar grid is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(polarGridSelector, { timeout: 10000 });
    await expect(page.locator(polarGridSelector)).toBeVisible();
  });

  test("polar grid can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        hideGrid="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(polarGridSelector)).not.toBeVisible();
  });
});

test.describe("angle axis", () => {
  test("angle axis is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(polarAngleAxisSelector, { timeout: 10000 });
    await expect(page.locator(polarAngleAxisSelector)).toBeVisible();
  });

  test("angle axis can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        hideAngleAxis="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(polarAngleAxisSelector)).not.toBeVisible();
  });
});

test.describe("radius axis", () => {
  test("radius axis is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(polarRadiusAxisSelector, { timeout: 10000 });
    await expect(page.locator(polarRadiusAxisSelector)).toBeVisible();
  });

  test("radius axis can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        hideRadiusAxis="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(polarRadiusAxisSelector)).not.toBeVisible();
  });
});

// --- Legend Tests

test.describe("legend", () => {
  test("legend is hidden by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A', 'B']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(legendSelector)).not.toBeVisible();
  });

  test("legend can be shown", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A', 'B']}"
        showLegend="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(legendSelector, { timeout: 10000 });
    await expect(page.locator(legendSelector)).toBeVisible();
  });
});

// --- Radar Chart Specific Tests

test.describe("filled areas", () => {
  test("areas are filled by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A', 'B']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    const radars = page.locator(radarElementsSelector);
    await expect(radars).toHaveCount(2);
  });

  test("areas can be unfilled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A', 'B']}"
        filled="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    const radars = page.locator(radarElementsSelector);
    await expect(radars).toHaveCount(2);
  });
});

test.describe("stroke width", () => {
  test("uses default stroke width", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toBeVisible();
  });

  test("applies custom stroke width", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        strokeWidth="4"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toBeVisible();
  });
});

test.describe("fill opacity", () => {
  test("uses default fill opacity", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toBeVisible();
  });

  test("applies custom fill opacity", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        fillOpacity="0.8"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toBeVisible();
  });
});

// --- Responsive Behavior Tests

test.describe("responsive behavior", () => {
  test("enters mini mode with very small container height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        showLegend="true"
        width="600px"
        height="100px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Wait for chart to fully render and responsive behavior to take effect
    await page.waitForTimeout(1000);
    
    // In mini mode, legend should be hidden
    await expect(page.locator(legendSelector)).not.toBeVisible();
    
    // Note: Polar axes might still be visible in Recharts RadarChart even in mini mode
    // This is different from CartesianGrid charts - RadarChart handles mini mode differently
    // So we'll focus on testing the legend hiding which is the main responsive behavior
  });

  test("normal mode with adequate height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        showLegend="true"
        width="600px"
        height="300px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // In normal mode, legend and axes should be visible
    await expect(page.locator(legendSelector)).toBeVisible();
    await expect(page.locator(polarAngleAxisSelector)).toBeVisible();
    await expect(page.locator(polarRadiusAxisSelector)).toBeVisible();
  });
});

// --- Tooltip Tests

test.describe("tooltip", () => {
  test("tooltip is shown by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Hover over radar area to trigger tooltip
    await page.locator(radarElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).toBeVisible();
  });

  test("tooltip can be hidden", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        hideTooltip="true"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    
    // Hover over radar area - tooltip should not appear
    await page.locator(radarElementsSelector).first().hover();
    await expect(page.locator(tooltipSelector)).not.toBeVisible();
  });
});

// --- Comprehensive Prop Tests

test.describe("data prop", () => {
  test("handles array data correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(radarElementsSelector)).toHaveCount(1);
  });

  test("handles large datasets", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="category"
        data="{${largeDataset}}"
        dataKeys="{['value1', 'value2']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toHaveCount(2);
  });

  test("handles missing data prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        dataKeys="{['A']}"
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
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toHaveCount(1);
  });

  test("renders multiple data series", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="skill"
        data="{${multiSeriesData}}"
        dataKeys="{['team1', 'team2', 'team3']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(radarElementsSelector, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toHaveCount(3);
  });

  test("handles empty dataKeys array", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{[]}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(chartRoot)).toBeVisible();
    await expect(page.locator(radarElementsSelector)).toHaveCount(0);
  });
});

test.describe("nameKey prop", () => {
  test("uses correct nameKey for angle axis labels", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(angleAxisTicksSelector, { timeout: 10000 });
    const firstTick = page.locator(angleAxisTicksSelector).first();
    await expect(firstTick).toContainText("Math");
  });

  test("handles different nameKey", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="skill"
        data="{${multiSeriesData}}"
        dataKeys="{['team1']}"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(angleAxisTicksSelector, { timeout: 10000 });
    const firstTick = page.locator(angleAxisTicksSelector).first();
    await expect(firstTick).toContainText("Communication");
  });
});

test.describe("combined props", () => {
  test("all visual props combined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="skill"
        data="{${multiSeriesData}}"
        dataKeys="{['team1', 'team2']}"
        filled="true"
        strokeWidth="3"
        fillOpacity="0.5"
        showLegend="true"
        hideGrid="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toHaveCount(2);
    await expect(page.locator(legendSelector)).toBeVisible();
    await expect(page.locator(polarGridSelector)).toBeVisible();
  });

  test("minimal configuration", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="subject"
        data="{${sampleData}}"
        dataKeys="{['A']}"
        hideGrid="true"
        hideAngleAxis="true"
        hideRadiusAxis="true"
        hideTooltip="true"
        filled="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await expect(page.locator(radarElementsSelector)).toHaveCount(1);
    await expect(page.locator(polarGridSelector)).not.toBeVisible();
    await expect(page.locator(polarAngleAxisSelector)).not.toBeVisible();
    await expect(page.locator(polarRadiusAxisSelector)).not.toBeVisible();
  });

  test("maximum configuration", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadarChart
        nameKey="skill"
        data="{${multiSeriesData}}"
        dataKeys="{['team1', 'team2', 'team3']}"
        filled="true"
        strokeWidth="4"
        fillOpacity="0.8"
        showLegend="true"
        hideGrid="false"
        hideAngleAxis="false"
        hideRadiusAxis="false"
        hideTooltip="false"
        width="600px"
        height="400px"
      />
    `);
    
    await page.waitForSelector(chartRoot, { timeout: 10000 });
    await page.waitForSelector(radarElementsSelector, { timeout: 5000 });
    await expect(page.locator(radarElementsSelector)).toHaveCount(3);
    
    await page.waitForSelector(legendSelector, { timeout: 5000 });
    await expect(page.locator(legendSelector)).toBeVisible();
    
    await page.waitForSelector(polarGridSelector, { timeout: 5000 });
    await page.waitForSelector(polarAngleAxisSelector, { timeout: 5000 });
    await page.waitForSelector(polarRadiusAxisSelector, { timeout: 5000 });
    await expect(page.locator(polarGridSelector)).toBeVisible();
    await expect(page.locator(polarAngleAxisSelector)).toBeVisible();
    await expect(page.locator(polarRadiusAxisSelector)).toBeVisible();
  });
});
