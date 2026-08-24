import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/cancel-an-api-call.md"),
);

test.describe("Cancel a slow API call", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Cancel a slow API call",
  );

  test("cancels the running API call without showing failure", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Ready to generate preview")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await page.getByRole("button", { name: "Generate" }).click();
    await expect(page.getByText("Generating preview...")).toBeVisible();
    await expect(page.getByRole("button", { name: "Generate" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeEnabled();

    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByText("Preview cancelled: user")).toBeVisible();
    await expect(page.getByText("Last cancellation reason: user")).toBeVisible();
    await expect(page.getByText("Preview failed")).toBeHidden();
    await expect(page.getByRole("button", { name: "Generate" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await page.getByRole("button", { name: "Generate" }).click();
    await expect(page.getByText("Generating preview...")).toBeVisible();
    await expect(page.getByText("Preview cancelled: user")).toBeHidden();
    await expect(page.getByText("Last cancellation reason: user")).toBeHidden();

    await expect(page.getByText("Preview ready: preview-42")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: "Generate" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });
});
