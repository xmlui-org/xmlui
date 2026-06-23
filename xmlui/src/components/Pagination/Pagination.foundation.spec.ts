import { test, expect } from "../../testing/fixtures";

test.describe("Pagination foundation", () => {
  test("renders page info and controls", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination itemCount="{95}" pageSize="{10}" pageIndex="{1}" />`);
    await expect(page.getByRole("navigation", { name: "Pagination" })).toBeVisible();
    await expect(page.getByText("Page 2 of 10")).toBeVisible();
    await expect(page.getByRole("button", { name: "First page" })).toBeEnabled();
  });

  test("next button fires pageDidChange", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination
        itemCount="{95}"
        pageSize="{10}"
        pageIndex="{1}"
        onPageDidChange="pageIndex => testState = pageIndex" />
    `);
    await page.getByRole("button", { name: "Next page" }).click();
    await expect.poll(testStateDriver.testState).toBe(2);
  });

  test("page size selector fires pageSizeDidChange", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Pagination
        itemCount="{95}"
        pageSize="{10}"
        pageSizeOptions="{[10, 25, 50]}"
        onPageSizeDidChange="pageSize => testState = pageSize" />
    `);
    await page.getByLabel("Items per page").click();
    await page.getByRole("option", { name: "25" }).click();
    await expect.poll(testStateDriver.testState).toBe(25);
  });

  test("simplified mode uses hasPrevPage and hasNextPage", async ({ initTestBed, page }) => {
    await initTestBed(`<Pagination hasPrevPage="{false}" hasNextPage="{true}" />`);
    await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Next page" })).toBeEnabled();
  });
});
