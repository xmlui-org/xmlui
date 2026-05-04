import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/enable-multi-row-selection-in-a-table.md",
  ),
);

test.describe("Multi-row selection with bulk actions", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Multi-row selection with bulk actions",
  );

  test("initial state shows 5 employees and 0 selected with buttons disabled", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("0 selected")).toBeVisible();
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("Bob Martinez")).toBeVisible();
    await expect(page.getByRole("button", { name: "Export Selected" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Delete Selected" })).toBeDisabled();
  });

  test("selecting a row enables the action buttons and updates the count", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    // nth(0) is Alice Johnson's row checkbox (no header select-all)
    await page.getByRole("checkbox").nth(0).click();
    await expect(page.getByText("1 selected")).toBeVisible();
    await expect(page.getByRole("button", { name: "Export Selected" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Delete Selected" })).toBeEnabled();
  });

  test("Export Selected shows the selected employee name", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("checkbox").nth(0).click(); // Alice Johnson
    await page.getByRole("button", { name: "Export Selected" }).click();
    await expect(page.getByText("Exported Alice Johnson")).toBeVisible();
  });

  test("Delete Selected removes the row from the table", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("checkbox").nth(0).click(); // Alice Johnson
    await page.getByRole("button", { name: "Delete Selected" }).click();
    await expect(page.getByText("Deleted 1 item(s)")).toBeVisible();
    await expect(page.getByText("Alice Johnson")).not.toBeVisible();
    await expect(page.getByText("0 selected")).toBeVisible();
  });

  test("selecting two rows updates the count to 2", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.getByRole("checkbox").nth(0).click(); // Alice Johnson
    await page.getByRole("checkbox").nth(1).click(); // Bob Martinez
    await expect(page.getByText("2 selected")).toBeVisible();
  });
});
