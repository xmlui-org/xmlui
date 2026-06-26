import { expect, test } from "@playwright/test";

test("toast service renders notifications from compiled handlers and preserves data updates", async ({ page }) => {
  await page.goto("/?example=runtimeToast");

  await expect(page.getByRole("heading", { name: "Runtime toast service" })).toBeVisible();
  await expect(page.getByText("Count: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Save and toast" }).click();
  await expect(page.getByText("Count: 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Saved count 1" })).toBeVisible();

  await page.getByRole("button", { name: "Start loading toast" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Working on count 1" })).toBeVisible();

  await page.getByRole("button", { name: "Complete loading toast" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Done with count 1" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Working on count 1" })).toHaveCount(0);
  await expect(page.locator("[aria-live='polite'][aria-label='Done with count 1']")).toBeAttached();

  await page.getByRole("button", { name: "Error toast" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Failed count 1" })).toBeVisible();
  await expect(page.locator("[aria-live='assertive'][aria-label='Failed count 1']")).toBeAttached();

  await page.getByRole("button", { name: "Dismiss toasts" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);
});
