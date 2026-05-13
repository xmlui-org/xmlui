import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-06.md"),
);

test.describe("slider-b6ce", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "slider-b6ce");

  test("renders the slider demo with initial record count and revenue", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Slider Demo")).toBeVisible();
    await expect(page.getByText("Selected records:")).toBeVisible();
    await expect(page.getByText("Total Revenue:")).toBeVisible();
    await expect(page.getByText("Date range")).toBeVisible();
  });

  test("slider shows all 30 records by default", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Selected records: 30")).toBeVisible();
  });
});
