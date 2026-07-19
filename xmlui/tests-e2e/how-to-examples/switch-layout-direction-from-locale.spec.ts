import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/switch-layout-direction-from-locale.md",
  ),
);

test.describe("switch-direction-automatically-from-locale", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "switch-direction-automatically-from-locale",
  );
  const appGlobals = { defaultLocale: "en", localePersistKey: null };

  test("initial state uses English and left-to-right direction", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Account settings")).toBeVisible();
    await expect(page.getByText("Locale: en")).toBeVisible();
    await expect(page.getByText("Direction: ltr")).toBeVisible();
  });

  test("Arabic locale switches text and direction", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Arabic" }).click();
    await expect(page.getByText("اعدادات الحساب")).toBeVisible();
    await expect(page.getByText("Locale: ar")).toBeVisible();
    await expect(page.getByText("Direction: rtl")).toBeVisible();
  });
});
