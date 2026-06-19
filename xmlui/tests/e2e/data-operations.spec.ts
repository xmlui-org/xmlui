import { expect, test } from "@playwright/test";

test("DataSource mock data is visible through component APIs", async ({ page }) => {
  await page.goto("/?example=dataSourceMock");

  await expect(page.getByRole("heading", { name: "Data source mock" })).toBeVisible();
  await expect(page.getByText("Loaded: yes", { exact: true })).toBeVisible();
  await expect(page.getByText("0: Build runtime", { exact: true })).toBeVisible();
  await expect(page.getByText("1: Write tests", { exact: true })).toBeVisible();
});

test("DataSource refetch updates rendered API values", async ({ page }) => {
  await page.goto("/?example=dataSourceRefetch");

  await expect(page.getByRole("heading", { name: "Data source refetch" })).toBeVisible();
  await expect(page.getByText("Count: 1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Refresh" }).click();
  await expect(page.getByText("Count: 2", { exact: true })).toBeVisible();
});

test("APICall execute mutates data and invalidates a DataSource", async ({ page }) => {
  await page.goto("/?example=apiCallMutation");

  await expect(page.getByRole("heading", { name: "API call mutation" })).toBeVisible();
  await expect(page.getByText("Build runtime", { exact: true })).toBeVisible();
  await expect(page.getByText("Write tests", { exact: true })).toBeVisible();
  await expect(page.getByText("Last result: none", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Add task" }).click();
  await expect(page.getByText("Ship runtime", { exact: true })).toBeVisible();
  await expect(page.getByText("Last result: Ship runtime", { exact: true })).toBeVisible();
});

test("Actions.callApi can be awaited from compiled handlers", async ({ page }) => {
  await page.goto("/?example=actionsCallApi");

  await expect(page.getByRole("heading", { name: "Actions call API" })).toBeVisible();
  await expect(page.getByText("No message", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Load message" }).click();
  await expect(page.getByText("Managed hello", { exact: true })).toBeVisible();
});
