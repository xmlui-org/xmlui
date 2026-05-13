import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/use-echarts-for-advanced-charting.md",
  ),
);

// display-only example — no interaction to test
test.describe("basic-bar-chart-b6ce", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "basic-bar-chart-b6ce",
  );

  test("renders the bar chart inside a card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("canvas")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("pie-donut-chart-b72a", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "pie-donut-chart-b72a",
  );

  test("renders the donut chart inside a card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("canvas")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("line-chart-with-multiple-series-b7b6", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "line-chart-with-multiple-series-b7b6",
  );

  test("renders the multi-series line chart inside a card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("canvas")).toBeVisible();
  });
});
