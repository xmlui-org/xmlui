import { expect, test } from "@playwright/test";

test("assignment handlers update dependent rendered values", async ({ page }) => {
  await page.goto("/?example=handlerAssignments");

  await expect(page.getByRole("heading", { name: "Assignment handler updates" })).toBeVisible();
  await expect(page.getByText("count: 0", { exact: true })).toBeVisible();
  await expect(page.getByText("doubled: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Update: 0" }).click();
  await expect(page.getByText("count: 1", { exact: true })).toBeVisible();
  await expect(page.getByText("doubled: 2", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Update: 1" }).click();
  await expect(page.getByText("count: 2", { exact: true })).toBeVisible();
  await expect(page.getByText("doubled: 4", { exact: true })).toBeVisible();
});

test("conditional handlers update branch-selected state", async ({ page }) => {
  await page.goto("/?example=handlerConditionals");

  await expect(page.getByRole("heading", { name: "Conditional handler updates" })).toBeVisible();
  await expect(page.getByText("idle", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Count: 0" }).click();
  await expect(page.getByText("one", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible();

  await page.getByRole("button", { name: "Count: 1" }).click();
  await expect(page.getByText("many", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Count: 2" })).toBeVisible();
});

test("handler locals feed later state writes", async ({ page }) => {
  await page.goto("/?example=handlerLocals");

  await expect(page.getByRole("heading", { name: "Handler locals" })).toBeVisible();
  await expect(page.getByText("total: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Add next: 0" }).click();
  await expect(page.getByText("total: 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add next: 1" })).toBeVisible();

  await page.getByRole("button", { name: "Add next: 1" }).click();
  await expect(page.getByText("total: 3", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add next: 2" })).toBeVisible();
});

test("loop handlers run bounded updates", async ({ page }) => {
  await page.goto("/?example=handlerLoops");

  await expect(page.getByRole("heading", { name: "Loop handler updates" })).toBeVisible();
  await expect(page.getByText("total: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Run loop" }).click();
  await expect(page.getByText("total: 6", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Run loop" }).click();
  await expect(page.getByText("total: 12", { exact: true })).toBeVisible();
});
