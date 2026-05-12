import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/routing-and-links.md"),
);

test.describe("try clicking Winter Report", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "try clicking Winter Report",
  );

  test("renders navigation panel with all three links", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contacts" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Winter Report" })).toBeVisible();
  });

  test("navigates to the report page with query params on clicking Winter Report", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Winter Report" }).click();
    await expect(page.getByText("Reported period: December-February")).toBeVisible();
  });

  test("navigates back to Home on clicking Home", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "Winter Report" }).click();
    await expect(page.getByText("Reported period: December-February")).toBeVisible();
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page.getByText("Reported period: December-February")).not.toBeVisible();
  });
});

test.describe("Active links", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Active links");

  test("renders navigation panel with Home and About links", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });

  test("navigates to the About page on clicking About", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "About" }).click();
    await expect(page.getByText("About this app")).toBeVisible();
  });

  test("navigates back to Home on clicking Home", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("link", { name: "About" }).click();
    await expect(page.getByText("About this app")).toBeVisible();
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page.getByText("About this app")).not.toBeVisible();
  });
});
