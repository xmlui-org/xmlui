import { expect, test } from "@playwright/test";

test("Pages, Page, and NavLink route between views", async ({ page }) => {
  await page.goto("/?example=routingBasic");

  await expect(page.getByRole("heading", { name: "Routing home" })).toBeVisible();
  await expect(page.getByText("Path: /", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Details" }).click();
  await expect(page).toHaveURL(/#\/details\/42$/);
  await expect(page.getByRole("heading", { name: "Routing details" })).toBeVisible();
  await expect(page.getByText("Id: 42", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Details" })).toHaveAttribute("aria-current", "page");
});

test("navigate updates query params visible to expressions", async ({ page }) => {
  await page.goto("/?example=routingQuery");

  await expect(page.getByRole("heading", { name: "Routing query" })).toBeVisible();
  await expect(page.getByText("Query: none", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/#\/search\?q=xmlui&page=2$/);
  await expect(page.getByText("Query: xmlui", { exact: true })).toBeVisible();
  await expect(page.getByText("Page: 2", { exact: true })).toBeVisible();
});

test("routing preserves global state mutations across pages", async ({ page }) => {
  await page.goto("/?example=routingState");

  await expect(page.getByRole("heading", { name: "Routing counter" })).toBeVisible();
  await page.getByRole("button", { name: "Count: 0" }).click();
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible();

  await page.getByRole("link", { name: "Summary" }).click();
  await expect(page.getByRole("heading", { name: "Routing summary" })).toBeVisible();
  await expect(page.getByText("Count is 1", { exact: true })).toBeVisible();
});

test("route params drive managed data fetching", async ({ page }) => {
  await page.goto("/?example=routingData");

  await expect(page.getByRole("heading", { name: "Routing data" })).toBeVisible();
  await expect(page.getByText("Message text: Message 1", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Message 2" }).click();
  await expect(page).toHaveURL(/#\/messages\/2$/);
  await expect(page.getByText("Message text: Message 2", { exact: true })).toBeVisible();
});
