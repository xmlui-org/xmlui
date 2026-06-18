import { expect, test } from "@playwright/test";

test("local counter increments through generated event and expression functions", async ({ page }) => {
  await page.goto("/?example=local");

  await expect(page.getByRole("heading", { name: "Counter example" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Click to increment: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Click to increment: 0" }).click();
  await expect(page.getByRole("button", { name: "Click to increment: 1" })).toBeVisible();

  await page.getByRole("button", { name: "Click to increment: 1" }).click();
  await expect(page.getByRole("button", { name: "Click to increment: 2" })).toBeVisible();
});
