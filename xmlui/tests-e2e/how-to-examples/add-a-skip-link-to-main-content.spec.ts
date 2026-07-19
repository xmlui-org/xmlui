import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/add-a-skip-link-to-main-content.md"),
);

test.describe("skip-repeated-navigation", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "skip-repeated-navigation");

  async function tabToSkipLink(page: any, skipLink: any) {
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      if (await skipLink.evaluate((el) => el === document.activeElement)) {
        return;
      }
    }
    await expect(skipLink).toBeFocused();
  }

  test("initial state shows navigation and the dashboard page", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("link", { name: "Skip to main content" })).toBeAttached();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Filter dashboard cards" })).toBeVisible();
  });

  test("tabbing to the skip link reveals it and Enter moves focus to dashboard content", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await tabToSkipLink(page, skipLink);
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect.poll(() => skipLink.evaluate((el) => el.parentElement === document.body)).toBe(true);

    const hashBeforeSkip = await page.evaluate(() => window.location.hash);
    await page.keyboard.press("Enter");

    await expect(page.getByRole("textbox", { name: "Filter dashboard cards" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hashBeforeSkip);
  });

  test("orders route has a separate page and skip target", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search orders" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Create order" })).toBeVisible();

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await tabToSkipLink(page, skipLink);
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect.poll(() => skipLink.evaluate((el) => el.parentElement === document.body)).toBe(true);

    const hashBeforeSkip = await page.evaluate(() => window.location.hash);
    await page.keyboard.press("Enter");

    await expect(page.getByRole("textbox", { name: "Search orders" })).toBeFocused();
    await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hashBeforeSkip);
  });
});
