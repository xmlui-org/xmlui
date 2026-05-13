import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-09.md"),
);

test.describe("tutorial-09-b744", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "tutorial-09-b744");

  test("renders the invoices table with a Details icon column", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "invoice_number" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "client" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Details" })).toBeVisible();
  });

  test("clicking the Details icon opens the invoice details dialog", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "doc-outline" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Notes:")).toBeVisible();
    await expect(page.getByText("Status:")).toBeVisible();
  });
});
