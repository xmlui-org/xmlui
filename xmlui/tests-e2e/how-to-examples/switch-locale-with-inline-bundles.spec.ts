import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/switch-locale-with-inline-bundles.md",
  ),
);

test.describe("switch-between-english-and-german-bundles", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "switch-between-english-and-german-bundles",
  );
  const appGlobals = { defaultLocale: "en", localePersistKey: null };

  test("initial state renders English translations", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Dashboard")).toBeVisible();
    await expect(page.getByText("Hello, Ada!")).toBeVisible();
    await expect(page.getByText("Active locale: en")).toBeVisible();
  });

  test("clicking Deutsch switches the rendered bundle", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("Ubersicht")).toBeVisible();
    await expect(page.getByText("Hallo, Ada!")).toBeVisible();
    await expect(page.getByText("Active locale: de")).toBeVisible();
  });
});
