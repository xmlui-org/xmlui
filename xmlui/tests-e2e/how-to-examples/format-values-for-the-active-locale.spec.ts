import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/format-values-for-the-active-locale.md",
  ),
);

test.describe("Format numbers currency lists and relative time", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "format-numbers-currency-lists-and-relative-time",
  );
  const appGlobals = { defaultLocale: "en", localePersistKey: null };

  test("initial state formats values for English", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Invoice summary")).toBeVisible();
    await expect(page.getByText("Number: 1,234.5")).toBeVisible();
    await expect(page.getByText("List: Ada, Lin, and Sam")).toBeVisible();
    await expect(page.getByText("Relative: 3 days ago")).toBeVisible();
  });

  test("switching locale formats values for German", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Deutsch" }).click();
    await expect(page.getByText("Rechnungszusammenfassung")).toBeVisible();
    await expect(page.getByText("Number: 1.234,5")).toBeVisible();
    await expect(page.getByText("List: Ada, Lin und Sam")).toBeVisible();
    await expect(page.getByText("Relative: vor 3 Tagen")).toBeVisible();
  });
});
