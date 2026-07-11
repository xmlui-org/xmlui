import { test, expect } from "../../testing/fixtures";

test("page size selector preserves original label and trigger styling", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`<Pagination itemCount="50" pageSize="10" pageSizeOptions="{[5, 10, 20]}"/>`);

  const pageSizeLabel = page.locator("label", { hasText: "Items per page" });
  await expect(pageSizeLabel).toHaveCSS("font-size", "14px");
  await expect(pageSizeLabel).toHaveCSS("font-weight", "500");
  await expect(pageSizeLabel).toHaveCSS("color", "rgb(0, 0, 0)");

  const pageSizeSelector = page.getByLabel("Items per page");
  await expect(pageSizeSelector).toHaveCSS("font-size", "16px");
  await expect(pageSizeSelector).toHaveCSS("border", "1px solid rgb(199, 214, 225)");
  await expect(pageSizeSelector).toHaveCSS("box-shadow", "none");
});
