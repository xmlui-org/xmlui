import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/cancel-an-upload.md"),
);

test.describe("Cancel a receipt upload", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Cancel a receipt upload",
  );

  test("selects a file, starts upload, and cancels it", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Choose a receipt to upload")).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload", exact: true })).toBeDisabled();

    await page.locator('input[type="file"]').setInputFiles({
      name: "receipt.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("test receipt"),
    });

    await expect(page.getByRole("button", { name: "Upload", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel upload" })).toBeDisabled();

    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await expect(page.getByText("Uploading receipt...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload", exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel upload" })).toBeEnabled();

    await page.getByRole("button", { name: "Cancel upload" }).click();

    await expect(page.getByText("Upload cancelled: user")).toBeVisible();
    await expect(page.getByText("Last cancellation reason: user")).toBeVisible();
    await expect(page.getByRole("button", { name: "Upload", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel upload" })).toBeDisabled();

    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await expect(page.getByText("Uploading receipt...")).toBeVisible();
    await expect(page.getByText("Upload cancelled: user")).toBeHidden();
    await expect(page.getByText("Last cancellation reason: user")).toBeHidden();

    await expect(page.getByText("Uploaded receipt.pdf")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Upload", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel upload" })).toBeDisabled();
  });
});
