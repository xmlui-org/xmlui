import { test, expect } from "@playwright/test";

test("extension components render and mutate XMLUI state", async ({ page }) => {
  await page.goto("/?example=extensionCounterBadge");

  await expect(page.getByRole("heading", { name: "Extension counter" })).toBeVisible();
  await expect(page.getByText("Plain extension: 0")).toBeVisible();
  await page.getByRole("button", { name: "+1" }).first().click();
  await expect(page.getByText("Plain extension: 1")).toBeVisible();
  await expect(page.getByText("Namespaced extension: 1")).toBeVisible();
  await page.getByRole("button", { name: "+1" }).nth(1).click();
  await expect(page.getByText("Plain extension: 3")).toBeVisible();
  await expect(page.getByText("Shared count: 3")).toBeVisible();
});

