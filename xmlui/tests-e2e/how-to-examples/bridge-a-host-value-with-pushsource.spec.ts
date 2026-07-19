import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/bridge-a-host-value-with-pushsource.md"),
);

test.describe(`Subscribe a host value stream`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `Subscribe a host value stream`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});
