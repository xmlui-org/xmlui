import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/show-section-fallback-from-loader-error.md",
  ),
);

test.describe("Render fallback UI from a failed orders load", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "render-fallback-ui-from-a-failed-orders-load",
  );

  test("initial state waits for the user to load orders", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Load recent orders" })).toBeVisible();
    await expect(page.getByText("Orders are unavailable")).not.toBeVisible();
    await expect(page.getByText("Cached orders loaded")).not.toBeVisible();
  });

  test("clicking the load button renders fallback UI with structured error fields", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Load recent orders" }).click();
    await expect(page.getByText("Orders are unavailable")).toBeVisible();
    await expect(page.getByText("Category: server")).toBeVisible();
    await expect(page.getByText("Code: http-503")).toBeVisible();
    await expect(page.getByText("Status: 503")).toBeVisible();
  });

  test("clicking recovery action loads cached orders", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Load recent orders" }).click();
    await page.getByRole("button", { name: "Load cached orders" }).click();
    await expect(page.getByText("Cached orders loaded")).toBeVisible();
    await expect(page.getByText("Orders: 2")).toBeVisible();
  });
});
