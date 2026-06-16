import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/reference/components/I18n.md"),
);

test.describe("I18n component reference examples", { tag: "@website" }, () => {
  const appGlobals = { defaultLocale: "en", localePersistKey: null };

  test("renders a simple translated message", async ({ initTestBed, page }) => {
    const { app, components, apiInterceptor } = extractXmluiExample(
      markdown,
      "Example: simple translated message",
    );
    await initTestBed(app, { components, apiInterceptor, appGlobals });

    await expect(page.getByText("Hello!")).toBeVisible();
  });

  test("passes variables and switches locale", async ({ initTestBed, page }) => {
    const { app, components, apiInterceptor } = extractXmluiExample(
      markdown,
      "Example: variables and locale switching",
    );
    await initTestBed(app, { components, apiInterceptor, appGlobals });

    await expect(page.getByText("Welcome, Ada!")).toBeVisible();
    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("Willkommen, Ada!")).toBeVisible();
    await page.getByRole("button", { name: "English" }).click();
    await expect(page.getByText("Welcome, Ada!")).toBeVisible();
  });

  test("renders plural and select ICU branches", async ({ initTestBed, page }) => {
    const { app, components, apiInterceptor } = extractXmluiExample(
      markdown,
      "Example: ICU plural and select messages",
    );
    await initTestBed(app, { components, apiInterceptor, appGlobals });

    await expect(page.getByText("1 item in cart")).toBeVisible();
    await expect(page.getByText("Ready to ship")).toBeVisible();

    await page.getByRole("button", { name: "Five items" }).click();
    await page.getByRole("button", { name: "Delayed" }).click();
    await expect(page.getByText("5 items in cart")).toBeVisible();
    await expect(page.getByText("Delayed by weather")).toBeVisible();

    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("5 Artikel im Warenkorb")).toBeVisible();
    await expect(page.getByText("Durch Wetter verzogert")).toBeVisible();
  });

  test("renders translated inline slots", async ({ initTestBed, page }) => {
    const { app, components, apiInterceptor } = extractXmluiExample(
      markdown,
      "Example: translated inline slots",
    );
    await initTestBed(app, { components, apiInterceptor, appGlobals });

    await expect(
      page.getByText("Read the terms of service and privacy policy before continuing."),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "terms of service" })).toBeVisible();
    await expect(page.getByRole("link", { name: "privacy policy" })).toBeVisible();
  });

  test("renders the key when a translation is missing", async ({ initTestBed, page }) => {
    const { app, components, apiInterceptor } = extractXmluiExample(
      markdown,
      "Example: missing key fallback",
    );
    await initTestBed(app, { components, apiInterceptor, appGlobals });

    await expect(page.getByText("Profile", { exact: true })).toBeVisible();
    await expect(page.getByText("profile.subtitle")).toBeVisible();
  });
});
