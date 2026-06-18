import { expect, test } from "@playwright/test";

test("component counters keep isolated local state per repeated component instance", async ({ page }) => {
  await page.goto("/?example=components");

  await expect(page.getByRole("heading", { name: "Counter with components" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Click to increment: 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter #2: 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter #3: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Counter #2: 0" }).click();

  await expect(page.getByRole("button", { name: "Click to increment: 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter #2: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter #3: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Click to increment: 0" }).click();

  await expect(page.getByRole("button", { name: "Click to increment: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter #2: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter #3: 0" })).toBeVisible();
});
