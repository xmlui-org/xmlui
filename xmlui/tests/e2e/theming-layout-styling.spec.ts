import { expect, test } from "@playwright/test";

test("layout-core applies universal layout props and part hooks", async ({ page }) => {
  await page.goto("/?example=layoutCore");

  await expect(page.getByRole("heading", { name: "Layout core" })).toBeVisible();

  const stack = page.locator('[data-xmlui-component="VStack"]').first();
  await expect(stack).toHaveCSS("display", "flex");
  await expect(stack).toHaveCSS("flex-direction", "column");
  await expect(stack).toHaveCSS("gap", "12px");
  await expect(stack).toHaveCSS("padding", "16px");
  await expect(stack).toHaveCSS("width", "420px");
  await expect(stack).toHaveCSS("border-radius", "6px");

  const hstack = page.locator('[data-xmlui-component="HStack"]').first();
  await expect(hstack).toHaveCSS("display", "flex");
  await expect(hstack).toHaveCSS("align-items", "center");

  const text = page.getByText("Flexible text", { exact: true });
  await expect(text).toHaveAttribute("data-xmlui-part", "root");
});

test("theme variables resolve through scoped CSS custom properties", async ({ page }) => {
  await page.goto("/?example=themeVars");

  await expect(page.getByRole("heading", { name: "Theme variables" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Theme variables" })).toHaveCSS("color", "rgb(185, 28, 28)");
  await expect(page.getByText("Themed text", { exact: true })).toHaveCSS("color", "rgb(185, 28, 28)");
  await expect(page.locator('[data-xmlui-component="VStack"]').first()).toHaveCSS("background-color", "rgb(254, 226, 226)");
});

test("nested theme scopes affect only their subtree", async ({ page }) => {
  await page.goto("/?example=themeScope");

  const outer = page.getByText("Outer scoped text", { exact: true });
  const inner = page.getByText("Inner scoped text", { exact: true });
  const outerAgain = page.getByText("Outer scoped text again", { exact: true });

  await expect(outer).toHaveCSS("color", "rgb(37, 99, 235)");
  await expect(inner).toHaveCSS("color", "rgb(4, 120, 87)");
  await expect(outerAgain).toHaveCSS("color", "rgb(37, 99, 235)");
});

test("expression-backed styles update after data mutation", async ({ page }) => {
  await page.goto("/?example=styleMutation");

  const stack = page.locator('[data-xmlui-component="VStack"]').first();
  const mode = page.getByText("Mode: comfortable", { exact: true });

  await expect(mode).toBeVisible();
  await expect(stack).toHaveCSS("width", "420px");
  await expect(stack).toHaveCSS("gap", "18px");
  await expect(stack).toHaveCSS("background-color", "rgb(219, 234, 254)");

  await page.getByRole("button", { name: "Toggle style" }).click();

  await expect(page.getByText("Mode: compact", { exact: true })).toBeVisible();
  await expect(stack).toHaveCSS("width", "260px");
  await expect(stack).toHaveCSS("gap", "4px");
  await expect(stack).toHaveCSS("background-color", "rgb(243, 244, 246)");
});

