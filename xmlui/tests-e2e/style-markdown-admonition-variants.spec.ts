import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../website/content/docs/pages/howto/style-markdown-admonition-variants.md"),
);

test.describe("Markdown admonition theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Markdown admonition theming");

  test("initial state renders all four admonition variants and a blockquote", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("This is an")).toBeVisible();
    await expect(page.getByText("info", { exact: true })).toBeVisible();
    await expect(page.getByText("warning", { exact: true })).toBeVisible();
    await expect(page.getByText("danger", { exact: true })).toBeVisible();
    await expect(page.getByText("tip", { exact: true })).toBeVisible();
    await expect(page.getByText("A standard blockquote for comparison.")).toBeVisible();
  });
});
