import { expect, test } from "@playwright/test";

test("sample app boots without framework error overlay", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator("#root")).toBeAttached();
  await expect(page.locator("vite-error-overlay")).toHaveCount(0);
  await expect(page.getByText(/Unresolved XMLUI script identifier|Internal server error/)).toHaveCount(0);
});
