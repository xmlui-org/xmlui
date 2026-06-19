import { expect, test } from "@playwright/test";

test("user-defined components render projected default children", async ({ page }) => {
  await page.goto("/?example=udcDefaultChildren");

  await expect(page.getByRole("heading", { name: "UDC default children" })).toBeVisible();
  await expect(page.getByText("Projected Counter", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Projected count: 0" }).click();
  await expect(page.getByRole("button", { name: "Projected count: 1" })).toBeVisible();
});

test("named template slots receive slot context and mutate parent state", async ({ page }) => {
  await page.goto("/?example=udcSlotContext");

  await expect(page.getByRole("heading", { name: "UDC slot context" })).toBeVisible();
  await expect(page.getByText("Selected: none", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Build: idle" }).click();
  await expect(page.getByText("Selected: build", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Build: selected" })).toBeVisible();

  await page.getByRole("button", { name: "Test: idle" }).click();
  await expect(page.getByText("Selected: test", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Test: selected" })).toBeVisible();
});

test("custom component events flow up to parent listeners", async ({ page }) => {
  await page.goto("/?example=udcEventEmission");

  await expect(page.getByRole("heading", { name: "UDC event emission" })).toBeVisible();
  await expect(page.getByText("Done: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Ship it" }).click();
  await expect(page.getByText("Done: 1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Ship again" }).click();
  await expect(page.getByText("Done: 2", { exact: true })).toBeVisible();
});

test("exported component methods mutate private state and return values", async ({ page }) => {
  await page.goto("/?example=udcMethods");

  await expect(page.getByRole("heading", { name: "UDC methods" })).toBeVisible();
  await expect(page.getByText("Internal count: 0", { exact: true })).toBeVisible();
  await expect(page.getByText("Component count: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Read component count" }).click();
  await expect(page.getByText("Internal count: 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Component count: 1", { exact: true })).toBeVisible();
});

test("combined composition sample updates parent state from projected content", async ({ page }) => {
  await page.goto("/?example=udcCombined");

  await expect(page.getByRole("heading", { name: "UDC combined composition" })).toBeVisible();
  await expect(page.getByText("Picked: none", { exact: true })).toBeVisible();
  await expect(page.getByText("Events: 0", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Alpha: ready" }).click();
  await expect(page.getByText("Picked: alpha", { exact: true })).toBeVisible();
  await expect(page.getByText("Events: 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Alpha: picked" })).toBeVisible();
});
