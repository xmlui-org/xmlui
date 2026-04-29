import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/add-row-actions-with-a-context-menu.md",
  ),
);

test.describe("Table with right-click context menu", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Table with right-click context menu",
  );

  test("renders all project rows on initial load", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Landing Page Redesign")).toBeVisible();
    await expect(page.getByText("API Documentation")).toBeVisible();
    await expect(page.getByText("Mobile App Prototype")).toBeVisible();
    await expect(page.getByText("Database Migration")).toBeVisible();
  });

  test("right-clicking a row opens the context menu", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Landing Page Redesign").click({ button: "right" });
    await expect(page.getByText("Edit")).toBeVisible();
    await expect(page.getByText("Duplicate")).toBeVisible();
    await expect(page.getByText("Delete")).toBeVisible();
  });

  test("clicking Edit in the context menu shows last action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("Landing Page Redesign").click({ button: "right" });
    await page.getByText("Edit").click();
    await expect
      .poll(() => page.getByText("Last action: Edit: Landing Page Redesign").isVisible())
      .toBe(true);
  });

  test("clicking Delete shows the delete action", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByText("API Documentation").click({ button: "right" });
    await page.getByText("Delete").click();
    await expect
      .poll(() => page.getByText("Last action: Delete: API Documentation").isVisible())
      .toBe(true);
  });
});
