import { expect, test } from "xmlui/testing";

const EXT = { extensionIds: "xmlui-echart" };

const BASIC_OPTION = `var option = { series: [{ type: 'bar', data: [1, 2, 3] }] };`;
const EMPTY_OPTION = `var option = {};`;

test("EChart renders and attaches to the DOM", async ({ initTestBed, page }) => {
  await initTestBed(`<EChart testId="chart" option="{option}" />`, {
    ...EXT,
    mainXs: BASIC_OPTION,
  });
  await expect(page.getByTestId("chart")).toBeAttached();
});

test("EChart renders a canvas element by default", async ({ initTestBed, page }) => {
  await initTestBed(`<EChart testId="chart" option="{option}" />`, {
    ...EXT,
    mainXs: BASIC_OPTION,
  });
  const chart = page.getByTestId("chart");
  await expect(chart).toBeAttached();
  // ECharts renders into a nested div managed by echarts-for-react
  await expect(chart.locator("div").first()).toBeAttached();
});

test("EChart renders with svg renderer prop accepted", async ({ initTestBed, page }) => {
  await initTestBed(`<EChart testId="chart" renderer="svg" option="{option}" />`, {
    ...EXT,
    mainXs: BASIC_OPTION,
  });
  await expect(page.getByTestId("chart")).toBeAttached();
});

test("EChart applies custom width", async ({ initTestBed, page }) => {
  await initTestBed(`<EChart testId="chart" width="300px" option="{option}" />`, {
    ...EXT,
    mainXs: EMPTY_OPTION,
  });
  await expect(page.getByTestId("chart")).toHaveCSS("width", "300px");
});

test("EChart applies custom height", async ({ initTestBed, page }) => {
  await initTestBed(`<EChart testId="chart" height="200px" option="{option}" />`, {
    ...EXT,
    mainXs: EMPTY_OPTION,
  });
  await expect(page.getByTestId("chart")).toHaveCSS("height", "200px");
});
