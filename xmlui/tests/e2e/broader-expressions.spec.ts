import { expect, test } from "@playwright/test";

test("broader expressions render through generated expression functions", async ({ page }) => {
  await page.goto("/?example=expressions");

  await expect(page.getByRole("heading", { name: "Broader expression compilation" })).toBeVisible();
  await expect(page.getByText("4")).toBeVisible();
  await expect(page.getByText("Ada")).toBeVisible();
  await expect(page.getByText("One, Two")).toBeVisible();
  await expect(page.getByText("many")).toBeVisible();
  await expect(page.getByText("Two", { exact: true })).toBeVisible();
});
