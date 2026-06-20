import { expect, test } from "@playwright/test";

test("migrated App content spacing is visible and content updates after data mutation", async ({ page }) => {
  await page.goto("/?example=appMainContentLayout");

  await expect(page.getByRole("heading", { name: "App main content layout" })).toBeVisible();
  await expect(page.getByText("Mode: comfortable", { exact: true })).toBeVisible();

  const app = page.locator('[data-xmlui-component="App"][data-xmlui-part="root"]');
  const content = page.locator('[data-xmlui-component="App"][data-xmlui-part="pageContent"]');
  const swatch = page.locator('[data-xmlui-component="VStack"]').first();
  await expect(app).toHaveCSS("font-size", "15px");
  await expect(app).toHaveCSS("line-height", "25.5px");
  await expect(app).toHaveCSS("background-color", "rgb(243, 247, 249)");
  await expect(app).toHaveCSS("display", "flex");
  await expect(app).toHaveCSS("flex-direction", "column");
  await expect(app).toHaveCSS("min-height", `${page.viewportSize()?.height ?? 720}px`);
  await expect(page.locator('[data-xmlui-component="App"][data-xmlui-part="content"]')).toHaveCSS(
    "background-color",
    "rgb(243, 247, 249)",
  );
  await expect(content).toHaveCSS("display", "flex");
  await expect(content).toHaveCSS("flex-direction", "column");
  await expect(content).toHaveCSS("max-width", "1280px");
  await expect(content).toHaveCSS("padding-left", "15px");
  await expect(content).toHaveCSS("padding-top", "18.75px");
  await expect(content).toHaveCSS("gap", "18.75px");
  await expect(swatch).toHaveCSS("width", "220px");

  await page.getByRole("button", { name: "Toggle sample state" }).click();

  await expect(page.getByText("Mode: compact", { exact: true })).toBeVisible();
  await expect(content).toHaveCSS("padding-left", "15px");
  await expect(content).toHaveCSS("padding-top", "18.75px");
  await expect(content).toHaveCSS("gap", "18.75px");
  await expect(swatch).toHaveCSS("width", "160px");
});
