import { expect, test } from "@playwright/test";

test("async handlers await delay before continuing mutations", async ({ page }) => {
  await page.goto("/?example=asyncSequence");

  await expect(page.getByRole("heading", { name: "Async handler sequence" })).toBeVisible();
  await expect(page.getByText("status: idle", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Run async step: 0" }).click();
  await expect(page.getByText("status: waiting", { exact: true })).toBeVisible();
  await expect(page.getByText("status: done", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run async step: 1" })).toBeVisible();
});

test("cooperative loop yielding keeps other handlers responsive", async ({ page }) => {
  await page.goto("/?example=asyncResponsiveLoop");

  await expect(page.getByRole("heading", { name: "Async responsive loop" })).toBeVisible();
  await page.getByRole("button", { name: "Run slow loop: 0" }).click();
  await page.getByRole("button", { name: "Fast counter: 0" }).click();

  await expect(page.getByRole("button", { name: "Fast counter: 1" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Run slow loop: 1" })).toBeVisible();
  await expect(page.getByText("status: done", { exact: true })).toBeVisible();
});

test("block and queue directives schedule repeated starts", async ({ page }) => {
  await page.goto("/?example=asyncDirectives");

  await expect(page.getByRole("heading", { name: "Async handler directives" })).toBeVisible();

  const blockButton = page.getByRole("button", { name: "Block: 0" });
  await blockButton.click();
  await blockButton.click();
  await expect(page.getByText("blocked: 1", { exact: true })).toBeVisible();

  const queueButton = page.getByRole("button", { name: "Queue: 0" });
  await queueButton.click();
  await queueButton.click();
  await expect(page.getByText("queued: 2", { exact: true })).toBeVisible();
});
