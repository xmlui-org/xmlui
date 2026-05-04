import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../../website/content/docs/pages/howto/lazy-load-tree-children-on-expand.md",
  ),
);

test.describe("Department tree with lazy-loaded members", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Department tree with lazy-loaded members",
  );

  test("initial state shows three department root nodes", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Engineering")).toBeVisible();
    await expect(page.getByText("Design")).toBeVisible();
    await expect(page.getByText("Marketing")).toBeVisible();
  });

  test("expanding Engineering loads its three members", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page
      .locator('[role="treeitem"]')
      .filter({ hasText: "Engineering" })
      .locator("[data-tree-expand-icon]")
      .click();
    await expect
      .poll(() => page.getByText("Alice Chen").isVisible(), { timeout: 3000 })
      .toBe(true);
    await expect(page.getByText("Bob Martinez")).toBeVisible();
    await expect(page.getByText("Dave Lee")).toBeVisible();
  });

  test("expanding Design loads its two members", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page
      .locator('[role="treeitem"]')
      .filter({ hasText: "Design" })
      .locator("[data-tree-expand-icon]")
      .click();
    await expect
      .poll(() => page.getByText("Carol Kim").isVisible(), { timeout: 3000 })
      .toBe(true);
    await expect(page.getByText("Eve Torres")).toBeVisible();
  });

  test("expanding Marketing loads its single member", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await page
      .locator('[role="treeitem"]')
      .filter({ hasText: "Marketing" })
      .locator("[data-tree-expand-icon]")
      .click();
    await expect
      .poll(() => page.getByText("Frank Brown").isVisible(), { timeout: 3000 })
      .toBe(true);
  });
});
