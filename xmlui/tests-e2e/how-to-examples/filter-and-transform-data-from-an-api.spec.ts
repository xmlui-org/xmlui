import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/filter-and-transform-data-from-an-api.md",
  ),
);

test.describe("Extract, filter, and transform API data", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Extract, filter, and transform API data",
  );

  test("shows all people with groups", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice (A)", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Bob (B)", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Carol (A)", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Dave (B)", { exact: true }).first()).toBeVisible();
  });

  test("active people list excludes inactive members", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Alice, Carol, Dave are active (appear in both lists = 2 times each)
    await expect(page.getByText("Alice (A)", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Carol (A)", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Dave (B)", { exact: true }).first()).toBeVisible();
    // Bob is inactive — appears only once (in All people), not in Active people
    await expect(page.getByText("Bob (B)", { exact: true })).toHaveCount(1);
  });

  test("transformed people list shows city names", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Alice (Austin)")).toBeVisible();
    await expect(page.getByText("Bob (Boston)")).toBeVisible();
    await expect(page.getByText("Carol (Austin)")).toBeVisible();
    await expect(page.getByText("Dave (Boston)")).toBeVisible();
  });
});
