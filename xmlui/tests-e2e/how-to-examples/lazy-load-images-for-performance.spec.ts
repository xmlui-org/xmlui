import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/lazy-load-images-for-performance.md"),
);

test.describe("Scroll down to lazy-load images", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Scroll down to lazy-load images",
  );

  test("initial state shows the gallery heading and caption", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Team gallery")).toBeVisible();
    await expect(page.getByText("Scroll down — images below the fold load on demand.")).toBeVisible();
  });

  test("first image card is visible in the initial viewport", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Photo 1", { exact: true })).toBeInViewport();
  });

  test("last image card is not in the viewport initially", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Photo 200", { exact: true })).not.toBeInViewport();
  });

  test("scrolling to the bottom brings the last image card into the viewport", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Photo 200", { exact: true })).not.toBeInViewport();
    await page.locator('[style*="overflow: auto"]').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await expect(page.getByText("Photo 200", { exact: true })).toBeInViewport();
  });
});

