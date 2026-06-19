import { expect, test } from "@playwright/test";

const standaloneBaseUrl = "http://127.0.0.1:5174";

test("standalone script auto-starts component apps and creates #root", async ({ page }) => {
  await page.goto(`${standaloneBaseUrl}/counter-components/`);

  await expect(page.locator("#root")).toBeAttached();
  await expect(page.getByRole("heading", { name: "Standalone counter with components" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Standalone increment: 0" })).toBeVisible();

  await page.getByRole("button", { name: "Standalone increment: 0" }).click();
  await expect(page.getByRole("button", { name: "Standalone increment: 1" })).toBeVisible();

  await page.getByRole("button", { name: "Standalone Counter #2: 0" }).click();
  await expect(page.getByRole("button", { name: "Standalone Counter #2: 1" })).toBeVisible();
});

test("standalone style mutation updates expression-backed styles", async ({ page }) => {
  await page.goto(`${standaloneBaseUrl}/style-mutation/`);

  const stack = page.locator('[data-xmlui-component="VStack"]').first();
  await expect(page.getByRole("heading", { name: "Standalone style mutation" })).toBeVisible();
  await expect(page.getByText("Mode: comfortable", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "420px");
  await expect(stack).toHaveCSS("gap", "18px");

  await page.getByRole("button", { name: "Toggle standalone style" }).click();

  await expect(page.getByText("Mode: compact", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "260px");
  await expect(stack).toHaveCSS("gap", "4px");
});

test("standalone hash routing preserves global state", async ({ page }) => {
  await page.goto(`${standaloneBaseUrl}/routing-state/`);

  await expect(page.getByRole("heading", { name: "Standalone routing counter" })).toBeVisible();
  await page.getByRole("button", { name: "Count: 0" }).click();
  await expect(page.getByRole("button", { name: "Count: 1" })).toBeVisible();

  await page.getByRole("link", { name: "Summary" }).click();
  await expect(page.getByRole("heading", { name: "Standalone routing summary" })).toBeVisible();
  await expect(page.getByText("Count is 1", { exact: true })).toBeVisible();
});

test("standalone extension package registration renders and mutates state", async ({ page }) => {
  await page.goto(`${standaloneBaseUrl}/extension-counter-badge/`);

  await expect(page.getByRole("heading", { name: "Standalone extension counter" })).toBeVisible();
  await expect(page.getByText("Standalone extension: 0")).toBeVisible();
  await page.getByRole("button", { name: "+1" }).click();
  await expect(page.getByText("Standalone extension: 1")).toBeVisible();
});
