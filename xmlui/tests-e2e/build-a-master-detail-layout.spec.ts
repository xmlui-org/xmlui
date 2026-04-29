import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/build-a-master-detail-layout.md"),
);

test.describe("Master–detail with selectable rows", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Master–detail with selectable rows",
  );

  test("shows the table and the placeholder text on initial load", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Landing Page Redesign")).toBeVisible();
    await expect(page.getByText("API Documentation")).toBeVisible();
    await expect(page.getByText("Mobile App Prototype")).toBeVisible();
    await expect(page.getByText("Database Migration")).toBeVisible();
    await expect(page.getByText("Click a row to see project details")).toBeVisible();
  });

  test("clicking a row shows its details in the detail panel", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Landing Page Redesign").first().click();
    await expect(page.getByText("$12,000")).toBeVisible();
    await expect(page.getByText("2026-01-15")).toBeVisible();
  });

  test("selecting a different row updates the detail panel", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Landing Page Redesign").first().click();
    await expect(page.getByText("$12,000")).toBeVisible();
    await page.getByText("API Documentation").click();
    await expect(page.getByText("$5,000")).toBeVisible();
  });
});
