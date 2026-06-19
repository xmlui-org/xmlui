import { expect, test } from "@playwright/test";

test("local data updates recompute broader expression bindings", async ({ page }) => {
  await page.goto("/?example=expressionUpdates");

  await expect(page.getByRole("heading", { name: "Expression updates" })).toBeVisible();
  await expect(page.getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByText("one", { exact: true })).toBeVisible();
  await expect(page.getByText("0, 1, 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Increment count: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Increment count: 0" }).click();

  await expect(page.getByText("2", { exact: true })).toBeVisible();
  await expect(page.getByText("one", { exact: true })).toBeVisible();
  await expect(page.getByText("1, 2, 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Increment count: 1" })).toBeVisible();

  await page.getByRole("button", { name: "Increment count: 1" }).click();

  await expect(page.getByText("3", { exact: true })).toBeVisible();
  await expect(page.getByText("many", { exact: true })).toBeVisible();
  await expect(page.getByText("2, 3, 4", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Increment count: 2" })).toBeVisible();
});

test("component-local data updates recompute only the clicked component expressions", async ({ page }) => {
  await page.goto("/?example=expressionComponents");

  await expect(page.getByRole("heading", { name: "Expression update components" })).toBeVisible();
  await expect(page.getByText("Alpha doubled: 0", { exact: true })).toBeVisible();
  await expect(page.getByText("Beta doubled: 0", { exact: true })).toBeVisible();
  await expect(page.getByText("idle", { exact: true })).toHaveCount(2);

  await page.getByRole("button", { name: "Alpha: 0" }).click();

  await expect(page.getByText("Alpha doubled: 2", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Alpha: 1" })).toBeVisible();
  await expect(page.getByText("active", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Beta doubled: 0", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Beta: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Beta: 0" }).click();

  await expect(page.getByText("Alpha doubled: 2", { exact: true })).toBeVisible();
  await expect(page.getByText("Beta doubled: 2", { exact: true })).toBeVisible();
  await expect(page.getByText("active", { exact: true })).toHaveCount(2);
});
