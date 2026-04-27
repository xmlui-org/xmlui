import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/communicate-between-sibling-components.md",
  ),
);

test.describe("Shared filter state between siblings", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Shared filter state between siblings",
  );

  test("initial state shows all articles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Build a search bar — UI")).toBeVisible();
    await expect(page.getByText("Paginate API results — Data")).toBeVisible();
    await expect(page.getByText("Create a responsive grid — Layout")).toBeVisible();
  });

  test("selecting UI filter shows only UI articles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("radio", { name: "UI" }).click();
    await expect(page.getByText("Build a search bar — UI")).toBeVisible();
    await expect(page.getByText("Show a confirmation dialog — UI")).toBeVisible();
    await expect(page.getByText("Paginate API results — Data")).not.toBeVisible();
    await expect(page.getByText("Create a responsive grid — Layout")).not.toBeVisible();
  });

  test("selecting Data filter shows only Data articles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("radio", { name: "Data" }).click();
    await expect(page.getByText("Paginate API results — Data")).toBeVisible();
    await expect(page.getByText("Cache API responses — Data")).toBeVisible();
    await expect(page.getByText("Build a search bar — UI")).not.toBeVisible();
  });

  test("switching back to All restores all articles", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("radio", { name: "UI" }).click();
    await expect(page.getByText("Paginate API results — Data")).not.toBeVisible();
    await page.getByRole("radio", { name: "All" }).click();
    await expect(page.getByText("Paginate API results — Data")).toBeVisible();
    await expect(page.getByText("Build a search bar — UI")).toBeVisible();
  });
});
