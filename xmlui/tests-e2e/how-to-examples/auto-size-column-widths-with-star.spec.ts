import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/auto-size-column-widths-with-star.md"),
);

test.describe("Star-sized column widths", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Star-sized column widths");

  test("initial state shows all column headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("ID", { exact: true })).toBeVisible();
    await expect(page.getByText("Project", { exact: true })).toBeVisible();
    await expect(page.getByText("Description", { exact: true })).toBeVisible();
    await expect(page.getByText("Status", { exact: true })).toBeVisible();
    await expect(page.getByText("Progress", { exact: true })).toBeVisible();
  });

  test("initial state renders all four data rows", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("PRJ-001")).toBeVisible();
    await expect(page.getByText("PRJ-002")).toBeVisible();
    await expect(page.getByText("PRJ-003")).toBeVisible();
    await expect(page.getByText("PRJ-004")).toBeVisible();
  });

  test("initial state shows project names in the Project column", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Landing Page Redesign")).toBeVisible();
    await expect(page.getByText("API Documentation")).toBeVisible();
    await expect(page.getByText("Mobile App Prototype")).toBeVisible();
    await expect(page.getByText("Database Migration")).toBeVisible();
  });

  test("initial state shows status badges", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Active").first()).toBeVisible();
    await expect(page.getByText("Done")).toBeVisible();
    await expect(page.getByText("Planning")).toBeVisible();
  });

  test("initial state shows progress values with percent sign", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("65%")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible();
    await expect(page.getByText("10%")).toBeVisible();
    await expect(page.getByText("40%")).toBeVisible();
  });

  test("initial state shows the Medium width preset selected and matching caption", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Narrow (600px)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Medium (900px)" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Wide (1200px)" })).toBeVisible();
    await expect(page.getByText("Currently: 900px")).toBeVisible();
  });

  test("clicking Narrow updates the width caption and keeps all data rendered", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Narrow (600px)" }).click();

    await expect(page.getByText("Currently: 600px")).toBeVisible();
    await expect(page.getByText("Currently: 900px")).not.toBeVisible();
    await expect(page.getByText("PRJ-001")).toBeVisible();
    await expect(page.getByText("Landing Page Redesign")).toBeVisible();
  });

  test("clicking Wide updates the width caption and keeps all data rendered", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Wide (1200px)" }).click();

    await expect(page.getByText("Currently: 1200px")).toBeVisible();
    await expect(page.getByText("Currently: 900px")).not.toBeVisible();
    await expect(page.getByText("PRJ-004")).toBeVisible();
    await expect(page.getByText("Database Migration")).toBeVisible();
  });

  test("cycling through the presets returns to Medium and updates the caption each time", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Narrow (600px)" }).click();
    await expect(page.getByText("Currently: 600px")).toBeVisible();

    await page.getByRole("button", { name: "Wide (1200px)" }).click();
    await expect(page.getByText("Currently: 1200px")).toBeVisible();

    await page.getByRole("button", { name: "Medium (900px)" }).click();
    await expect(page.getByText("Currently: 900px")).toBeVisible();
  });
});
