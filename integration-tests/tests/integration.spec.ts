import { test, expect } from "@playwright/test";

test("No unknown component errors", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();

  await expect(page.getByText("Unknown component")).not.toBeVisible();
});

test("TestComponent renders via extension", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("TestComponent: hello from home")).toBeVisible();
});

test("routing to /about works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByRole("heading", { name: "About Page" })).toBeVisible();
  await expect(page).toHaveURL(/\/about\/?$/);
});
