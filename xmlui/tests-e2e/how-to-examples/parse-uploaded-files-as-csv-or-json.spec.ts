import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/parse-uploaded-files-as-csv-or-json.md",
  ),
);

test.describe("Parse CSV and JSON file uploads", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Parse CSV and JSON file uploads",
  );

  test("CSV upload populates the parsed rows table", async ({
    initTestBed,
    page,
    createFileInputDriver,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const csvInput = await createFileInputDriver("csvInput");
    await csvInput.getHiddenInput().setInputFiles(
      path.join(__dirname, "../../../website/public/resources/files/sample-products.csv"),
    );

    await expect(page.getByText("Loaded 6 rows from sample-products.csv (CSV)")).toBeVisible();
    await expect(page.getByText("Detected columns: name, price, category, inStock")).toBeVisible();
    await expect(page.getByTestId("parsedRows")).toContainText("Widget");
    await expect(page.getByTestId("parsedRows")).toContainText("Electronics");
  });

  test("JSON upload populates the parsed rows table", async ({
    initTestBed,
    page,
    createFileInputDriver,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const jsonInput = await createFileInputDriver("jsonInput");
    await jsonInput.getHiddenInput().setInputFiles(
      path.join(__dirname, "../../../website/public/resources/files/sample-products.json"),
    );

    await expect(page.getByText("Loaded 6 rows from sample-products.json (JSON)")).toBeVisible();
    await expect(page.getByText("Detected columns: name, price, category, inStock")).toBeVisible();
    await expect(page.getByTestId("parsedRows")).toContainText("Gadget");
    await expect(page.getByTestId("parsedRows")).toContainText("Tools");
  });
});
