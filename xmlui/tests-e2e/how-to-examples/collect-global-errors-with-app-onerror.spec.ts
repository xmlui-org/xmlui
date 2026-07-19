import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/collect-global-errors-with-app-onerror.md",
  ),
);

test.describe("collect-app-errors-in-a-global-status-panel", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "collect-app-errors-in-a-global-status-panel",
  );

  test("initial state has no captured errors", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("No errors captured")).toBeVisible();
    await expect(page.getByText("Buffered errors: 0")).toBeVisible();
  });

  test("a thrown action is captured by App onError and added to App.errors", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Run risky action" }).click();
    await expect(page.getByText("internal: Report export failed")).toBeVisible();
    await expect(page.getByText("Buffered errors: 1")).toBeVisible();
    await expect(page.getByText("Latest code: unknown")).toBeVisible();
  });
});
