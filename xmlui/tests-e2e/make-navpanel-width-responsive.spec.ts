import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/make-navpanel-width-responsive.md"),
);

test.describe("Shrink the window to see the NavPanel respond", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Shrink the window to see the NavPanel respond",
  );

  // The navPanelWrapper div carries a CSS-module class containing "navPanelWrapper".
  // At sizeIndex >= 2 (>= 768px): width = 18rem ≈ 288px, labels shown.
  // At sizeIndex <= 1 (<  768px): width = 6rem  ≈  96px, labels hidden (null).

  test("at desktop width the NavPanel is wide and shows nav labels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.setViewportSize({ width: 1100, height: 800 });
    const navPanel = page.locator('[class*="navPanelWrapper"]');
    await expect(navPanel).toBeVisible();
    // 18rem ≈ 288px — expect well above 150px threshold
    await expect.poll(async () => (await navPanel.boundingBox())!.width).toBeGreaterThan(150);
    await expect(navPanel.getByText("Home")).toBeVisible();
    await expect(navPanel.getByText("Compose")).toBeVisible();
    await expect(navPanel.getByText("Notifications")).toBeVisible();
  });

  test("at phone width the NavPanel is narrow and hides nav labels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.setViewportSize({ width: 400, height: 800 });
    const navPanel = page.locator('[class*="navPanelWrapper"]');
    await expect(navPanel).toBeVisible();
    // 6rem ≈ 96px — expect well below 150px threshold
    await expect.poll(async () => (await navPanel.boundingBox())!.width).toBeLessThan(150);
    await expect(navPanel.getByText("Home")).not.toBeVisible();
    await expect(navPanel.getByText("Compose")).not.toBeVisible();
    await expect(navPanel.getByText("Notifications")).not.toBeVisible();
  });

  test("resizing from desktop to phone narrows the NavPanel and hides labels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.setViewportSize({ width: 1100, height: 800 });
    const navPanel = page.locator('[class*="navPanelWrapper"]');
    await expect(navPanel.getByText("Home")).toBeVisible();
    await page.setViewportSize({ width: 400, height: 800 });
    await expect.poll(() => navPanel.getByText("Home").isVisible()).toBe(false);
    await expect.poll(async () => (await navPanel.boundingBox())!.width).toBeLessThan(150);
  });

  test("resizing from phone to desktop widens the NavPanel and shows labels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page.setViewportSize({ width: 400, height: 800 });
    const navPanel = page.locator('[class*="navPanelWrapper"]');
    await expect.poll(async () => (await navPanel.boundingBox())!.width).toBeLessThan(150);
    await page.setViewportSize({ width: 1100, height: 800 });
    await expect.poll(() => navPanel.getByText("Home").isVisible()).toBe(true);
    await expect.poll(async () => (await navPanel.boundingBox())!.width).toBeGreaterThan(150);
  });
});
