import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/download-a-file-from-an-api.md"),
);

test.describe("Download a report", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Download a report",
  );

  test("shows the report cards with download buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Monthly Reports")).toBeVisible();
    await expect(page.getByText("Sales Report — June 2025")).toBeVisible();
    await expect(page.getByText("Inventory Snapshot")).toBeVisible();
    await expect(page.getByRole("button", { name: "Download" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Download" })).toHaveCount(2);
  });

  test("shows file metadata captions", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("CSV · 2.4 KB")).toBeVisible();
    await expect(page.getByText("JSON · 1.1 KB")).toBeVisible();
  });
});
