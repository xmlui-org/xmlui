import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/globals.md"),
);

test.describe(`app-locale-active-locale`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `app-locale-active-locale`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe(`app-locale-switch-buttons`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `app-locale-switch-buttons`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe(`app-locale-register-inline-bundle`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `app-locale-register-inline-bundle`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe(`app-locale-translate-variables`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `app-locale-translate-variables`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe(`app-locale-formatters`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `app-locale-formatters`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});
