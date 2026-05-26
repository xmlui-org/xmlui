import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-09.md"),
);

const sampleInvoice = {
  id: 55,
  invoice_number: "INV-1003",
  client: "Globex Corporation",
  issue_date: "2025-03-13",
  due_date: "2025-03-28",
  status: "sent",
  notes: "Monthly service invoice",
  items: '[{"id": 14, "name": "API Integration", "price": 105, "quantity": 5, "total": 525}]',
  total: 525,
  created_at: "2025-04-19T23:45:47.937465",
  paid_date: null,
};

test.describe("tutorial-09-b744", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "tutorial-09-b744");

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((invoice) => {
      (window as any).sampleInvoice = invoice;
      (window as any).coalesce = (val: unknown) => val ?? "";
    }, sampleInvoice);
  });

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
    const detailsIcon = page.locator('[data-icon-name="doc-outline"]').first();
    await expect(detailsIcon).toBeVisible();
    await detailsIcon.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Notes:")).toBeVisible();
    await expect(page.getByText("Status:")).toBeVisible();
  });
});
