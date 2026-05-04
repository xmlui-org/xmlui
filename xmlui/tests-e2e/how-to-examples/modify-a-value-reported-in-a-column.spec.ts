import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/modify-a-value-reported-in-a-column.md",
  ),
);

const INVOICES = [
  { id: 73, invoice_number: "INV-1022", client: "Initech", issue_date: "2025-04-19", due_date: "2025-05-05", paid_date: "2025-05-15", total: 700, status: "paid", notes: "", items: "[]" },
  { id: 105, invoice_number: "INV-1054", client: "Globex Corporation", issue_date: "2025-02-22", due_date: "2025-04-27", paid_date: "", total: 555.04, status: "sent", notes: "", items: "[]" },
  { id: 133, invoice_number: "INV-1082", client: "Oscorp Industries", issue_date: "2025-04-28", due_date: "2025-04-25", paid_date: "", total: 640, status: "draft", notes: "", items: "[]" },
  { id: 120, invoice_number: "INV-1069", client: "Genco Pura Oil", issue_date: "2025-03-20", due_date: "2025-04-22", paid_date: "", total: 81.22, status: "draft", notes: "", items: "[]" },
  { id: 131, invoice_number: "INV-1080", client: "Genco Pura Oil", issue_date: "2025-05-14", due_date: "2025-04-12", paid_date: "", total: 320, status: "draft", notes: "", items: "[]" },
];

test.describe("Modify a value reported in a Column", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Modify a value reported in a Column",
  );

  test("initial state renders the invoice table with all columns", async ({
    initTestBed,
    page,
  }) => {
    await page.route("**/resources/files/invoices.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INVOICES) }),
    );
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "invoice_number" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "client" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "total" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "status" })).toBeVisible();
  });

  test("total column values are formatted with a dollar sign and two decimal places", async ({
    initTestBed,
    page,
  }) => {
    await page.route("**/resources/files/invoices.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INVOICES) }),
    );
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("$700.00")).toBeVisible();
    await expect(page.getByText("$555.04")).toBeVisible();
    await expect(page.getByText("$81.22")).toBeVisible();
  });

  test("status column renders as badges for each status value", async ({
    initTestBed,
    page,
  }) => {
    await page.route("**/resources/files/invoices.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INVOICES) }),
    );
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("paid", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("sent", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("draft", { exact: true }).first()).toBeVisible();
  });

  test("client names appear in the table rows", async ({ initTestBed, page }) => {
    await page.route("**/resources/files/invoices.json", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(INVOICES) }),
    );
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Initech")).toBeVisible();
    await expect(page.getByText("Globex Corporation")).toBeVisible();
    await expect(page.getByText("Oscorp Industries")).toBeVisible();
  });
});
