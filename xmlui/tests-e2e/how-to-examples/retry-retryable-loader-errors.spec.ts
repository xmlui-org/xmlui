import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/retry-retryable-loader-errors.md",
  ),
);

test.describe("retry-a-retryable-report-load", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "retry-a-retryable-report-load",
  );

  test("initial state waits for the user to load the report", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Load report" })).toBeVisible();
    await expect(page.getByText("Report failed")).not.toBeVisible();
    await expect(page.getByText("Report loaded")).not.toBeVisible();
  });

  test("clicking Load report shows a retryable server error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Load report" }).click();
    await expect(page.getByText("Report failed")).toBeVisible();
    await expect(page.getByText("Category: server")).toBeVisible();
    await expect(page.getByText("Retryable: true")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });

  test("clicking Retry reloads the report successfully", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Load report" }).click();
    await page.getByRole("button", { name: "Retry" }).click();
    await expect(page.getByText("Report loaded")).toBeVisible();
    await expect(page.getByText("Loaded after 2 attempts.")).toBeVisible();
  });
});
