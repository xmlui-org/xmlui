import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../../website/content/docs/pages/wrap-component/echarts.md",
  ),
);

// display-only example — no interaction to test
test.describe("line-chart-with-toolbox-b7d5", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "line-chart-with-toolbox-b7d5",
  );

  test("renders the line chart with toolbox", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-echart" });
    await expect(page.locator("canvas")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("donut-chart-b851", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "donut-chart-b851");

  test("renders the donut chart", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, extensionIds: "xmlui-echart" });
    await expect(page.locator("canvas")).toBeVisible();
  });
});
