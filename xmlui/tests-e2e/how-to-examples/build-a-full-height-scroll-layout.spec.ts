import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/build-a-full-height-scroll-layout.md"),
);

test.describe(`Fixed header + footer, scrolling body`, { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, `Fixed header + footer, scrolling body`);

  test("renders the documented example", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.locator("body")).toBeVisible();
  });
});
