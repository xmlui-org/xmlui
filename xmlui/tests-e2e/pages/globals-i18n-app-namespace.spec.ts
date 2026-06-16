import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/globals.md"),
);

const appGlobals = { defaultLocale: "en", localePersistKey: null };

test.describe("Example: read the active locale", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "app-locale-active-locale",
  );

  test("initial state renders the English locale", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Active locale: en")).toBeVisible();
  });

  test("clicking Deutsch switches the active locale", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("Active locale: de")).toBeVisible();
  });
});

test.describe("Example: switch locale from buttons", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "app-locale-switch-buttons",
  );

  test("initial state renders the English translation", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Hello")).toBeVisible();
  });

  test("locale buttons switch the rendered translation", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });

    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("Hallo")).toBeVisible();

    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByText("Hello")).toBeVisible();
  });
});

test.describe("Example: register an inline bundle at runtime", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "app-locale-register-inline-bundle",
  );

  test("initial state renders the built-in English bundle", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Hello")).toBeVisible();
  });

  test("clicking Register German registers and activates the German bundle", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Register German" }).click();
    await expect(page.getByText("Hallo")).toBeVisible();
  });
});

// display-only example — no interaction to test
test.describe("Example: translate with variables", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "app-locale-translate-variables",
  );

  test("renders the translated message with variables", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Welcome, Ada!")).toBeVisible();
  });
});

test.describe("Example: active-locale formatters", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "app-locale-formatters",
  );

  test("initial state renders formatter output", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText(/Number:/)).toBeVisible();
    await expect(page.getByText(/Currency:/)).toBeVisible();
    await expect(page.getByText(/List:/)).toBeVisible();
    await expect(page.getByText(/Relative:/)).toBeVisible();
  });

  test("clicking Deutsch keeps formatter output available for the new locale", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText(/Number:/)).toBeVisible();
    await expect(page.getByText(/Currency:/)).toBeVisible();
    await expect(page.getByText(/List:/)).toBeVisible();
    await expect(page.getByText(/Relative:/)).toBeVisible();
  });
});
