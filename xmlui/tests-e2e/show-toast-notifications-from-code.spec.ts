import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/show-toast-notifications-from-code.md",
  ),
);

test.describe("Trigger different toast styles", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Trigger different toast styles");

  test("Success button shows success toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Success" }).click();
    await expect(page.getByText("Changes saved successfully.").first()).toBeVisible();
  });

  test("Error button shows error toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Error" }).click();
    await expect(page.getByText("Failed to delete the record.").first()).toBeVisible();
  });

  test("Info button shows neutral toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Info" }).click();
    await expect(page.getByText("Sync started in the background.").first()).toBeVisible();
  });

  test("Loading button shows loading toast", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Loading", exact: true }).click();
    await expect(page.getByText("Uploading file...").first()).toBeVisible();
  });
});
