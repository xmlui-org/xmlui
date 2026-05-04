import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/style-per-level-heading-sizes.md"),
);

test.describe("Per-level heading size scale", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Per-level heading size scale");

  test("initial state renders all six heading levels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("heading", { name: "H1 — Page title" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H2 — Section heading" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H3 — Sub-section" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H4 — Minor heading" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H5 — Detail heading" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "H6 — Fine print heading" })).toBeVisible();
  });
});
