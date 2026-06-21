import { expect, test } from "@playwright/test";

test("event tags compile and mutate state through the normal event pipeline", async ({ page }) => {
  await page.goto("/?example=eventTagHandler");

  await expect(page.getByRole("heading", { name: "Event tag handler" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Event tag count: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Event tag count: 0" }).click();
  await expect(page.getByRole("button", { name: "Event tag count: 1" })).toBeVisible();
});
