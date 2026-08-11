import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/format-table-columns-by-type.md"),
);

// display-only example — no interaction to test
test.describe("Format common text values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "format-common-text-values",
  );

  test("initial state renders typed text and contact links", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("cell", { name: "Ada", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "ada@example.com" })).toHaveAttribute(
      "href",
      "mailto:ada@example.com",
    );
    await expect(page.getByRole("link", { name: "+1 555 123 4567" })).toHaveAttribute(
      "href",
      "tel:+1 555 123 4567",
    );
    await expect(page.getByRole("link", { name: "example.com", exact: true })).toHaveAttribute(
      "href",
      "https://example.com/profile",
    );
    await expect(page.locator('[data-column-cell-kind="long-text"]')).toHaveCSS(
      "white-space",
      "normal",
    );
  });
});

// display-only example — no interaction to test
test.describe("Format numbers", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "format-numbers");

  test("initial state renders numeric formats and decimal parts", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const numberCells = page.locator('[data-column-cell-kind="number"]');
    await expect(numberCells.nth(0)).toHaveText("1,234.568");
    await expect(numberCells.nth(0).locator('[data-number-part="integer"]')).toHaveText("1,234");
    await expect(numberCells.nth(0).locator('[data-number-part="decimal"]')).toHaveText(".");
    await expect(numberCells.nth(0).locator('[data-number-part="fraction"]')).toHaveText("568");
    await expect(numberCells.nth(1)).toHaveText("13");
    await expect(numberCells.nth(2)).toHaveText("12%");
    await expect(numberCells.nth(3)).toHaveText("$1,234.50");
  });
});

// display-only example — no interaction to test
test.describe("Format dates and times", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "format-dates-and-times",
  );

  test("initial state renders date/time values with typed hooks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    const dateCells = page.locator('[data-column-cell-kind="date"]');
    await expect(dateCells).toHaveCount(5);
    await expect(dateCells.nth(0)).not.toHaveText("2026-08-06");
    await expect(dateCells.nth(2)).not.toHaveText("2026-08-06T12:00:00Z");
    await expect(dateCells.nth(3)).toHaveText("2026-08-06");
    await expect(dateCells.nth(4)).toContainText(/in \d+ years/);
  });
});

// display-only example — no interaction to test
test.describe("Display enums and statuses", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "display-enums-and-statuses",
  );

  test("initial state renders status plainly and enum labels from typeOptions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator('[data-column-cell-kind="status"]').first()).toHaveText("pending");
    await expect(page.locator('[data-column-cell-kind="enum"]').first()).toHaveText(
      "Sent to customer",
    );
    await expect(page.locator('[data-column-cell-kind="enum"]').nth(1)).toHaveText("Draft");
  });
});

test.describe("Display structured and media values", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "display-structured-and-media-values",
  );

  test("initial state renders json, tags, color input, and avatar values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator('[data-column-cell-kind="json"]')).toHaveText('{"level":"admin"}');
    await expect(page.locator('[data-column-cell-kind="tags"]')).toHaveText("math, logic");
    await expect(page.locator('[data-column-cell-kind="color"]')).toHaveValue("#336699");
    await expect(page.getByRole("img", { name: "Sample avatar" })).toBeVisible();
    await expect(page.locator('[data-column-cell-kind="avatar"]')).toHaveCSS(
      "border-radius",
      "50%",
    );
  });
});

// display-only example — no interaction to test
test.describe("Override a typed column with custom cell markup", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "override-a-typed-column-with-custom-cell-markup",
  );

  test("initial state renders custom child content instead of default type formatting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Custom total: 1234.5", { exact: true })).toBeVisible();
    await expect(page.getByText("$1,234.50", { exact: true })).toHaveCount(0);
  });
});
