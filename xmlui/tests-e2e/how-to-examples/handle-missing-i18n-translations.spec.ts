import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/handle-missing-i18n-translations.md",
  ),
);

// display-only example — no interaction to test
test.describe("Show fallback text for missing i18n messages", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "show-fallback-text-for-missing-i18n-messages",
  );

  test("renders valid translations and key fallbacks", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Profile", { exact: true })).toBeVisible();
    await expect(page.getByText("Missing key: profile.subtitle")).toBeVisible();
    await expect(page.getByText("Broken ICU: broken.items")).toBeVisible();
  });
});
