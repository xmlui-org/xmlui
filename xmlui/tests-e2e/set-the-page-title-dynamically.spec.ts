import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/set-the-page-title-dynamically.md"),
);

test.describe("Page title changes with the active tab", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Page title changes with the active tab",
  );

  test("initial state shows Dashboard section with three buttons", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reports" })).toBeVisible();
    await expect(page.getByText("You are viewing the Dashboard section.")).toBeVisible();
  });

  test("clicking Settings updates the section content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByText("You are viewing the Settings section.")).toBeVisible();
  });

  test("clicking Reports updates the section content", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Reports" }).click();
    await expect(page.getByText("You are viewing the Reports section.")).toBeVisible();
  });

  test("clicking Dashboard after switching returns to Dashboard section", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Settings" }).click();
    await page.getByRole("button", { name: "Dashboard" }).click();
    await expect(page.getByText("You are viewing the Dashboard section.")).toBeVisible();
  });
});
