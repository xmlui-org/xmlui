import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/announce-text-changes-with-withliveregion.md"),
);

test.describe("Announce changing text", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "announce-changing-text");

  test("initial state announces the text and badge values", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("button", { name: "Start sync" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Finish sync" })).toBeVisible();
    await expect(page.getByText("Waiting").first()).toBeVisible();
    await expect(page.getByText("2").first()).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Waiting" })).toBeAttached();
    await expect(page.getByRole("status").filter({ hasText: "2 pending approvals" })).toBeAttached();
  });

  test("clicking Start sync updates the text live region", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Start sync" }).click();

    await expect(page.getByText("Sync in progress").first()).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Sync in progress" })).toBeAttached();
  });

  test("clicking Finish sync updates both announcements", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("button", { name: "Finish sync" }).click();

    await expect(page.getByText("Sync complete").first()).toBeVisible();
    await expect(page.getByText("0").first()).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Sync complete" })).toBeAttached();
    await expect(page.getByRole("status").filter({ hasText: "0 pending approvals" })).toBeAttached();
  });
});
