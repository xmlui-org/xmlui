import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/load-a-served-csv-into-a-table.md",
  ),
);

// The website serves /resources/files/sample-products.csv for real (see
// website/public/resources/files/sample-products.csv), but the Playwright
// test bed's static server does not carry that file. Mock the same URL here
// so the parsing behavior under test — not the hosting — is what's pinned.
const sampleProductsCsv =
  "name,price,category,inStock\n" +
  "Widget,9.99,Tools,true\n" +
  "Gadget,19.99,Electronics,true\n" +
  "Doohickey,4.99,Misc,false\n" +
  "Thingamajig,14.99,Tools,true\n" +
  "Whatsit,24.99,Electronics,true\n" +
  "Gizmo,7.99,Misc,true";

const sampleProductsWithIdsCsv = sampleProductsCsv
  .split("\n")
  .map((row, index) => (index === 0 ? `id,${row}` : `${index},${row}`))
  .join("\n");

const sampleProductsInterceptor = {
  operations: {
    "sample-products-csv": {
      url: "/resources/files/sample-products.csv",
      method: "get",
      handler: `return ${JSON.stringify(sampleProductsCsv)};`,
    },
    "sample-products-with-ids-csv": {
      url: "/resources/files/sample-products-with-ids.csv",
      method: "get",
      handler: `return ${JSON.stringify(sampleProductsWithIdsCsv)};`,
    },
  },
};

test.describe("Load a served CSV into a table", { tag: "@website" }, () => {
  const { app, components } = extractXmluiExample(markdown, "load-served-csv");

  test("header-derived bindTo produces populated cells", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor: sampleProductsInterceptor });

    const table = page.getByTestId("productsTable");
    await expect(table).toContainText("Widget");
    await expect(table).toContainText("9.99");
    await expect(table).toContainText("Tools");
    await expect(table).toContainText("true");
    await expect(table).toContainText("Gizmo");
  });
});

test.describe("Infer Table columns from the loaded CSV", { tag: "@website" }, () => {
  const { app, components } = extractXmluiExample(markdown, "infer-table-columns-from-csv");

  test("loaded rows create sortable columns without explicit Column children", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor: sampleProductsInterceptor });

    const table = page.getByTestId("inferredProductsTable");
    await expect(table.locator("th")).toHaveCount(4);
    await expect(table.locator("th").nth(0)).toContainText("name");
    await expect(table.locator("th").nth(1)).toContainText("price");
    await expect(table).toContainText("Widget");
    await expect(table).toContainText("24.99");

    const priceHeader = table.locator("th").filter({ hasText: "price" }).locator("button");
    await expect(priceHeader).toBeVisible();
  });
});

test.describe("Sort CSV values with row identity", { tag: "@website" }, () => {
  const { app: existingIdApp, components: existingIdComponents } = extractXmluiExample(
    markdown,
    "csv-data-typing-existing-ids",
  );

  test("rows with an existing id sort after price conversion", async ({ initTestBed, page }) => {
    await initTestBed(existingIdApp, {
      components: existingIdComponents,
      apiInterceptor: sampleProductsInterceptor,
    });

    const table = page.getByTestId("typedProductsWithIdsTable");
    await expect(table.locator("th").filter({ hasText: "price" }).locator("button")).toBeVisible();
    await table.locator("th").filter({ hasText: "price" }).locator("button").click();
    await expect(table.locator("tbody tr").first()).toContainText("4.99");
  });
});
