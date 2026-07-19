import { expect, test } from "@playwright/test";

test("local counter state updates the owning app variable", async ({ page }) => {
  await page.goto("/?example=local");

  await expect(page.getByRole("heading", { name: "Counter example" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Click to increment: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Click to increment: 0" }).click();

  await expect(page.getByRole("button", { name: "Click to increment: 1" })).toBeVisible();
});
