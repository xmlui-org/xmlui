import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/register-locale-bundles-at-runtime.md",
  ),
);

test.describe("Load a Spanish bundle from an action", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "load-a-spanish-bundle-from-an-action",
  );
  const appGlobals = { defaultLocale: "en", localePersistKey: null };

  test("initial state renders the startup English bundle", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Welcome, Ada!")).toBeVisible();
    await expect(page.getByText("Active locale: en")).toBeVisible();
  });

  test("loading Spanish registers and activates the new bundle", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Load Spanish" }).click();
    await expect(page.getByText("Bienvenida, Ada!")).toBeVisible();
    await expect(page.getByText("Active locale: es")).toBeVisible();
  });
});
