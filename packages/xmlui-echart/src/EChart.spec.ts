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
  // Wait for ECharts to initialise and render the canvas element
  await expect(page.getByTestId("chart").locator("canvas, div").first()).toBeAttached();
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

// --- #3674: a callback with a statement body inside `option` (e.g. a tooltip formatter)
// --- must reach ECharts as a function, not be re-parsed as a `{...}` template.
const formatterMarkup = (formatter: string) => `
<App var.out="">
  <EChart id="chart" testId="chart" height="300px" option="{{
    series: [{ type: 'treemap', data: [{ name: 'a', value: 1000 }, { name: 'b', value: 2000 }] }],
    tooltip: { formatter: ${formatter} }
  }}" />
  <Button testId="call" label="Call formatter"
    onClick="out = chart.getEchartsInstance().getOption().tooltip[0].formatter({ name: 'a', value: 1500 })" />
  <Text testId="out" value="{out}" />
</App>`;

for (const [name, formatter] of [
  ["a function with a statement body", "function(p) { return p.name + ': ' + (p.value / 1000).toFixed(1) + ' MB'; }"],
  ["an arrow with a block body", "(p) => { return p.name + ': ' + (p.value / 1000).toFixed(1) + ' MB'; }"],
  ["an arrow with an expression body", "(p) => p.name + ': ' + (p.value / 1000).toFixed(1) + ' MB'"],
]) {
  test(`EChart option formatter works as ${name} (#3674)`, async ({ initTestBed, page }) => {
    await initTestBed(formatterMarkup(formatter), EXT);
    await expect(page.getByText("component problems")).toHaveCount(0);
    await expect(page.getByTestId("chart").locator("canvas, div").first()).toBeAttached();
    await page.getByTestId("call").click();
    await expect(page.getByTestId("out")).toHaveText("a: 1.5 MB");
  });
}
