import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/navigate-programmatically.md"),
);

test.describe("Navigate after a button click", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Navigate after a button click");

  test("initial state shows the Home page with current path", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("Current path:")).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to Team" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to Settings (replace)" })).toBeVisible();
  });

  test("Go to Team button navigates to the Team page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Go to Team" }).click();
    await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to Home" })).toBeVisible();
  });

  test("Back to Home button returns to the Home page from Team", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Go to Team" }).click();
    await page.getByRole("button", { name: "Back to Home" }).click();
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
  });

  test("Go to Settings (replace) button navigates to the Settings page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Go to Settings (replace)" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open profile tab" })).toBeVisible();
  });

  test("Open profile tab button appends query params to the URL", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Go to Settings (replace)" }).click();
    await page.getByRole("button", { name: "Open profile tab" }).click();
    await expect(page.getByText('Query: {"profile":"admin"}', { exact: true })).toBeVisible();
  });
});
