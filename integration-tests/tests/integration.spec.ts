import { test, expect } from "@playwright/test";

test("TestComponent renders via extension", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-testid='test-component']")).toBeVisible();
  await expect(page.locator("[data-testid='test-component']")).toContainText(
    "TestComponent: hello from home",
  );
});

test("TestComponent has theme-var styles applied", async ({ page }) => {
  await page.goto("/");
  const el = page.locator("[data-testid='test-component']");
  const bg = await el.evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(bg).not.toBe("");
  expect(bg).not.toBe("rgba(0, 0, 0, 0)");
});

test("routing to /about works", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Go to About");
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
});

test("routing back to home restores extension component", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Go to About");
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
  await page.click("text=Back to Home");
  await expect(page.locator("[data-testid='test-component']")).toBeVisible();
});
