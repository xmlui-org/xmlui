import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/working-with-markdown.md"),
);

// display-only example — no interaction to test
test.describe("Example: using the Table component", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Example: using the Table component",
  );

  test("renders table with apples, pears and oranges columns", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("apples")).toBeVisible();
    await expect(page.getByText("pears")).toBeVisible();
    await expect(page.getByText("oranges")).toBeVisible();
  });
});
