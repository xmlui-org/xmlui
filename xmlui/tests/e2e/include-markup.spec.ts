import { expect, test } from "@playwright/test";

test("IncludeMarkup foundation fetches markup and preserves included state updates", async ({ page }) => {
  await page.goto("/?example=includeMarkupFoundation");

  await expect(page.getByRole("heading", { name: "IncludeMarkup foundation" })).toBeVisible();
  await expect(page.getByTestId("included-count")).toHaveText("Included count: 0");

  await page.getByTestId("included-button").click();
  await expect(page.getByTestId("included-count")).toHaveText("Included count: 1");
});
