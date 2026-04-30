import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/handle-background-operations.md"),
);

test.describe("Background file processing with progress feedback", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Background file processing with progress feedback",
  );

  test("shows the upload button on initial load", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("button", { name: "Upload 5 Files" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload 5 Files" })).toBeEnabled();
  });

  test("clicking upload enqueues files and shows queue status", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Upload 5 Files" }).click();
    await expect.poll(() => page.getByText("Queue length:").isVisible()).toBe(true);
  });

  test("slider is interactive while uploads are running", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Upload 5 Files" }).click();
    await expect
      .poll(() => page.getByRole("slider").isVisible())
      .toBe(true);
    await expect(page.getByRole("slider")).toBeVisible();
  });
});
