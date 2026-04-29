import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/use-the-same-modaldialog-to-add-or-edit.md",
  ),
);

test.describe("Use the same ModalDialog to add or edit", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Use the same ModalDialog to add or edit",
  );

  test("initial state shows product table with two products", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Product Inventory")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add New Product" })).toBeVisible();
    await expect(page.getByText("Laptop Pro")).toBeVisible();
    await expect(page.getByText("Wireless Mouse")).toBeVisible();
  });

  test("clicking Add New Product opens the dialog in add mode", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Add New Product" }).click();
    await expect(page.getByText("Add Product")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Product Name" })).toBeVisible();
  });

  test("clicking Edit opens the dialog in edit mode with pre-filled data", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("button", { name: "Edit" }).first().click();
    await expect(page.getByText("Edit Product")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Product Name" })).toHaveValue("Laptop Pro");
  });
});
