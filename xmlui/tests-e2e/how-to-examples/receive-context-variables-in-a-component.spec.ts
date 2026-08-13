import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/receive-context-variables-in-a-component.md",
  ),
);

test.describe("reusable-table-column-receives-cell", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "reusable-table-column-receives-cell",
  );

  test("cell slot content receives row index and cell value", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByTestId("item-cell").first()).toHaveText("1. Apples");
    await expect(page.getByTestId("item-cell").nth(1)).toHaveText("2. Bananas");
    await expect(page.getByTestId("item-cell").nth(2)).toHaveText("3. Carrots");
  });
});
