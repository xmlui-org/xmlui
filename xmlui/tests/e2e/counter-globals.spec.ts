import { expect, test } from "@playwright/test";

test("global counter buttons share state while local count shadows it", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Counter with components" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Click to increment (Global): 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Global Counter #2: 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Global Counter #3: 0" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Local count: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Global Counter #2: 0" }).click();

  await expect(page.getByRole("button", { name: "Click to increment (Global): 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Global Counter #2: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Global Counter #3: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Local count: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Local count: 0" }).click();

  await expect(page.getByRole("button", { name: "Click to increment (Global): 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Global Counter #2: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Global Counter #3: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Local count: 1" })).toBeVisible();
});
