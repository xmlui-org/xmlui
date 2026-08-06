import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/use-smart-table-columns.md"),
);

// display-only example — no interaction to test
test.describe("Render a table without writing columns", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "render-a-table-without-writing-columns",
  );

  test("initial state renders inferred headers and cells", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator("th").filter({ hasText: "customer" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "total" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "status" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Ada", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "sent", exact: true })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Compare inference sampling modes", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "compare-inference-sampling-modes",
  );

  test("initial state shows default sampling finds later fields", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(
      page.getByTestId("default-table").locator("th").filter({ hasText: "total" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("first-only-table").locator("th").filter({ hasText: "total" }),
    ).toHaveCount(0);
  });
});

// display-only example — no interaction to test
test.describe("Turn inference off", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "turn-inference-off");

  test("initial state renders no inferred headers or cells", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator("th")).toHaveCount(0);
    await expect(page.getByText("Ada", { exact: true })).toHaveCount(0);
  });
});

// display-only example — no interaction to test
test.describe("Use explicit columns when you want control", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "use-explicit-columns-when-you-want-control",
  );

  test("initial state renders only explicit columns", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator("th").filter({ hasText: "Customer" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "Total" })).toBeVisible();
    await expect(page.locator("th").filter({ hasText: "status" })).toHaveCount(0);
    await expect(page.getByText("sent", { exact: true })).toHaveCount(0);
    await expect(page.getByText("$123.45", { exact: true })).toBeVisible();
  });
});

test.describe("Sort inferred columns", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "sort-inferred-columns");

  test("initial state renders inferred sortable data", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.locator("th").filter({ hasText: "quantity" })).toBeVisible();
    await expect(page.locator("tbody tr").first().locator("td").nth(1)).toHaveText("Notebook");
  });

  test("clicking an inferred column header sorts rows", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.locator("th").filter({ hasText: "quantity" }).locator("button").click();
    await expect(page.locator("tbody tr").first().locator("td").nth(1)).toHaveText("Folder");
    await expect(page.locator("tbody tr").first().locator("td").nth(2)).toHaveText("7");
  });
});
