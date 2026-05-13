import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/news-and-reviews.md"),
);

// display-only example — no interaction to test
test.describe("news-and-reviews-b75a", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "news-and-reviews-b75a");

  test("renders the news and reviews table with date, title, and source columns", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByRole("columnheader", { name: "date" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "title" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "source" })).toBeVisible();
  });
});
