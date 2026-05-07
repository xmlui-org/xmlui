import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/run-a-one-time-action-on-page-load.md"),
);

test.describe("One-time page load action", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "One-time page load action");

  test("page renders the Dashboard heading and welcome text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Welcome! The page has loaded.")).toBeVisible();
  });

  test("onInit fires on mount and the initialized card appears", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText(/Page initialized at \d/)).toBeVisible();
  });
});
