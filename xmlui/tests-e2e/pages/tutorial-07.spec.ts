import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-07.md"),
);

test.describe("invoices-b6c2", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "invoices-b6c2");

  test("renders the invoices table with column headers", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Invoices")).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "invoice_number" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "client" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Details" })).toBeVisible();
  });

  test("the Create Invoice button is disabled", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByRole("button", { name: "Create Invoice" }),
    ).toBeDisabled();
  });
});
