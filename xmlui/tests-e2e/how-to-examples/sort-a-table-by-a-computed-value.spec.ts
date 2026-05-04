import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/sort-a-table-by-a-computed-value.md",
  ),
);

test.describe("Sort by computed score", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Sort by computed score",
  );

  test("renders the table with all tasks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Fix login bug")).toBeVisible();
    await expect(page.getByText("Update docs")).toBeVisible();
    await expect(page.getByText("Redesign dashboard")).toBeVisible();
    await expect(page.getByText("Add dark mode")).toBeVisible();
    await expect(page.getByText("Migrate database")).toBeVisible();
  });

  test("shows priority score column header", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Priority Score")).toBeVisible();
  });

  test("scores are formatted with one decimal place", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Fix login bug: (5*2 + 3*3) / 2 = 9.5
    await expect(page.getByText("9.5")).toBeVisible();
  });

  test("table is sorted descending by priority score by default", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    const rows = page.getByRole("row");
    // First data row (after header) should be the highest-scoring task
    // Update docs: (2*2 + 4*3) / 1 = 16.0 — highest score
    await expect(rows.nth(1)).toContainText("Update docs");
  });
});
