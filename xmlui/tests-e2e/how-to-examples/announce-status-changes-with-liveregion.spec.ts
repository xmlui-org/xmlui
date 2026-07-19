import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/announce-status-changes-with-liveregion.md"),
);

test.describe("announce-save-status", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "announce-save-status");

  test("initial state shows the save button and initial status", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible();
    await expect(page.getByText("No save attempted").first()).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("No save attempted");
  });

  test("clicking Save settings updates the visible and announced status", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Save settings" }).click();

    await expect(page.getByText("Settings saved").first()).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("Settings saved");
  });
});
