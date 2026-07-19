import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/render-icu-plurals-and-selects.md",
  ),
);

test.describe("render-cart-count-and-shipping-status-messages", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "render-cart-count-and-shipping-status-messages",
  );
  const appGlobals = { defaultLocale: "en", localePersistKey: null };

  test("initial state renders singular count and ready status", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Cart:")).toBeVisible();
    await expect(page.getByText("1 item in cart")).toBeVisible();
    await expect(page.getByText("Status:")).toBeVisible();
    await expect(page.getByText("Ready to ship")).toBeVisible();
  });

  test("count and status buttons update ICU branches", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Five items" }).click();
    await page.getByRole("button", { name: "Delayed" }).click();
    await expect(page.getByText("5 items in cart")).toBeVisible();
    await expect(page.getByText("Delayed by weather")).toBeVisible();

    await page.getByRole("button", { name: "Ready" }).click();
    await expect(page.getByText("Ready to ship")).toBeVisible();
  });

  test("switching locale re-renders ICU output", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Five items" }).click();
    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("5 Artikel im Warenkorb")).toBeVisible();
    await expect(page.getByText("Versandbereit")).toBeVisible();

    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByText("5 items in cart")).toBeVisible();
    await expect(page.getByText("Ready to ship")).toBeVisible();
  });
});
