import { expect, test } from "@playwright/test";

test("derived locals update after source writes", async ({ page }) => {
  await page.goto("/?example=reactiveDerivedBasic");

  await expect(page.getByRole("heading", { name: "Reactive derived basic" })).toBeVisible();
  await expect(page.getByText("count: 1", { exact: true })).toBeVisible();
  await expect(page.getByText("double: 2", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Increment: 1" }).click();
  await expect(page.getByText("count: 2", { exact: true })).toBeVisible();
  await expect(page.getByText("double: 4", { exact: true })).toBeVisible();
});

test("derived chains recompute transitively", async ({ page }) => {
  await page.goto("/?example=reactiveDerivedChain");

  await expect(page.getByRole("heading", { name: "Reactive derived chain" })).toBeVisible();
  await expect(page.getByText("double: 2", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Chain count: 1" }).click();
  await expect(page.getByText("double: 4", { exact: true })).toBeVisible();
});

test("derived globals update after global writes", async ({ page }) => {
  await page.goto("/?example=reactiveDerivedGlobals");

  await expect(page.getByRole("heading", { name: "Reactive derived globals" })).toBeVisible();
  await expect(page.getByText("global double: 2", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Global count: 1" }).click();
  await expect(page.getByText("global double: 4", { exact: true })).toBeVisible();
});

test("assigned derived locals stop following their initializer", async ({ page }) => {
  await page.goto("/?example=reactiveDerivedOverride");

  await expect(page.getByRole("heading", { name: "Reactive derived override" })).toBeVisible();
  await expect(page.getByText("double: 2", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Override double" }).click();
  await expect(page.getByText("double: 99", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Increment count" }).click();
  await expect(page.getByText("count: 2", { exact: true })).toBeVisible();
  await expect(page.getByText("double: 99", { exact: true })).toBeVisible();
});

test("prop-driven derived locals update inside user-defined components", async ({ page }) => {
  await page.goto("/?example=reactiveDerivedProps");

  await expect(page.getByRole("heading", { name: "Reactive derived props" })).toBeVisible();
  await expect(page.getByText("child double: 2", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Parent count: 1" }).click();
  await expect(page.getByText("child double: 4", { exact: true })).toBeVisible();
});
