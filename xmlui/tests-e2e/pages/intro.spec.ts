import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/intro.md"),
);

// display-only example — no interaction to test
// NOTE: This example fetches from the external TfL API (api.tfl.gov.uk) which is
// not available in the test environment. The list renders empty; only the App
// container itself is asserted.
test.describe("London Tube Status", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "London Tube Status");

  test("renders the app container without error", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});
