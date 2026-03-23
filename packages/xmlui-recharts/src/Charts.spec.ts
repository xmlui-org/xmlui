import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-recharts" };

const SERIES_DATA = `var data = [
  { name: "Jan", value: 40, cost: 24 },
  { name: "Feb", value: 30, cost: 13 },
  { name: "Mar", value: 50, cost: 38 },
];
var yKeys = ["value"];`;

const PIE_DATA = `var data = [
  { name: "Alpha", value: 400 },
  { name: "Beta",  value: 300 },
  { name: "Gamma", value: 200 },
];`;

// =============================================================================
// BarChart
// =============================================================================

test.describe("BarChart", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<BarChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}" />`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
  });

  test("renders an SVG element", async ({ initTestBed, page }) => {
    await initTestBed(
      `<BarChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}" />`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
    await expect(page.locator("svg").first()).toBeAttached();
  });
});

// =============================================================================
// LineChart
// =============================================================================

test.describe("LineChart", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<LineChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}" />`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
  });

  test("renders an SVG element", async ({ initTestBed, page }) => {
    await initTestBed(
      `<LineChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}" />`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
    await expect(page.locator("svg").first()).toBeAttached();
  });
});

// =============================================================================
// AreaChart
// =============================================================================

test.describe("AreaChart", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<AreaChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}" />`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
  });
});

// =============================================================================
// PieChart
// =============================================================================

test.describe("PieChart", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<PieChart testId="chart" data="{data}" nameKey="name" dataKey="value" />`,
      { ...EXT, mainXs: PIE_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
  });

  test("renders an SVG element", async ({ initTestBed, page }) => {
    await initTestBed(
      `<PieChart testId="chart" data="{data}" nameKey="name" dataKey="value" />`,
      { ...EXT, mainXs: PIE_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
    await expect(page.locator("svg").first()).toBeAttached();
  });
});

// =============================================================================
// DonutChart
// =============================================================================

test.describe("DonutChart", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<DonutChart testId="chart" data="{data}" nameKey="name" dataKey="value" />`,
      { ...EXT, mainXs: PIE_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
  });
});

// =============================================================================
// RadarChart
// =============================================================================

test.describe("RadarChart", () => {
  test("renders and attaches to the DOM", async ({ initTestBed, page }) => {
    await initTestBed(
      `<RadarChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}" />`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
  });
});

// =============================================================================
// LabelList (used as a child of BarChart)
// =============================================================================

test.describe("LabelList", () => {
  test("renders inside a BarChart without errors", async ({ initTestBed, page }) => {
    await initTestBed(
      `<BarChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}">
        <LabelList dataKey="value" position="top" />
      </BarChart>`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
    await expect(page.locator("svg").first()).toBeAttached();
  });
});

// =============================================================================
// Legend (used as a child of BarChart)
// =============================================================================

test.describe("Legend", () => {
  test("renders inside a BarChart without errors", async ({ initTestBed, page }) => {
    await initTestBed(
      `<BarChart testId="chart" data="{data}" xKey="name" yKeys="{yKeys}">
        <Legend align="center" verticalAlign="bottom" />
      </BarChart>`,
      { ...EXT, mainXs: SERIES_DATA },
    );
    await expect(page.locator('[data-testid="chart"]').first()).toBeAttached();
    await expect(page.locator("svg").first()).toBeAttached();
  });
});
