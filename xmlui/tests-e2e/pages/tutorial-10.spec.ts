import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/tutorial-10.md"),
);

// display-only example — no interaction to test
test.describe("search-b76c", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "search-b76c");

  test("renders the Search component with two tabs", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByRole("tab", { name: "Find invoices issued after date" }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Search clients, products, and invoices" }),
    ).toBeVisible();
  });
});

test.describe("search-invoices-after-date-b82e", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "search-invoices-after-date-b82e",
  );

  test("renders the date picker with initial value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByTestId('dateAfter')).toBeVisible();
  });

  test("shows invoice results after the initial date", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Table should be visible with results (data from /resources/files/invoices.json filtered by date)
    await expect(page.getByRole("columnheader", { name: "Client" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Issue Date" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Total" })).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("search-everything-b9b3", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "search-everything-b9b3",
  );

  test("renders the search box with placeholder text", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(
      page.getByPlaceholder("Enter search term..."),
    ).toBeVisible();
  });

  test("shows search results when a term is typed", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByPlaceholder("Enter search term...").fill("a");
    await expect(page.getByRole("columnheader", { name: "Type" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Title" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Match Details" })).toBeVisible();
  });
});
