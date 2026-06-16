import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/canonicalize-application-urls.md",
  ),
);

test.describe("Rewrite a report URL to its canonical form", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "rewrite-a-report-url-to-its-canonical-form",
  );

  const appGlobals = {
    urlCase: "lower",
    urlTrailingSlash: "never",
    urlQueryParamOrder: "alphabetical",
    nonCanonicalUrl: "rewrite",
  };

  test("initial state shows the reports home", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await expect(page.getByText("Reports home")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open messy report URL" })).toBeVisible();
  });

  test("messy report URL is rewritten to the canonical address", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor, appGlobals });
    await page.getByRole("button", { name: "Open messy report URL" }).click();
    await expect(page.getByText("Report route")).toBeVisible();
    await expect
      .poll(() => new URL(page.url()).pathname + new URL(page.url()).search)
      .toBe("/reports?a=first&z=last");
  });
});
