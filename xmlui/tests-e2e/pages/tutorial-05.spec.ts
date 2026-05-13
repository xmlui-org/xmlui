import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-05.md"),
);

// display-only example — no interaction to test
test.describe("charts-b76c", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "charts-b76c");

  test("renders the Statuses donut chart inside a Card", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Statuses")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("multiseries-charts-b8f6", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "multiseries-charts-b8f6",
  );

  test("renders the MonthlyStatus bar chart", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // The MonthlyStatus component wraps the chart in a Card
    await expect(page.locator("canvas")).toBeVisible();
  });
});
