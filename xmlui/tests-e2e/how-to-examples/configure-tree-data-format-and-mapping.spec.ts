import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(__dirname, "../../../website/content/docs/pages/howto/configure-tree-data-format-and-mapping.md"),
);

test.describe("Tree flat vs hierarchy data format", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(markdown, "Tree flat vs hierarchy data format");

  test("initial state shows both format labels", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    await expect(page.getByText("Flat format")).toBeVisible();
    await expect(page.getByText("Hierarchy format")).toBeVisible();
    await expect(page.getByText("Each node references its parent by ID")).toBeVisible();
    await expect(page.getByText("Each node embeds its children inline")).toBeVisible();
  });

  test("flat tree shows all nodes fully expanded", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const flatTree = page.getByRole("tree", { name: "Tree navigation" }).first();
    // All flat-format nodes should be visible since defaultExpanded="all"
    await expect(flatTree.getByRole("treeitem", { name: "Electronics" })).toBeVisible();
    await expect(flatTree.getByRole("treeitem", { name: "Phones" })).toBeVisible();
    await expect(flatTree.getByRole("treeitem", { name: "Laptops" })).toBeVisible();
    await expect(flatTree.getByRole("treeitem", { name: "iPhone" })).toBeVisible();
    await expect(flatTree.getByRole("treeitem", { name: "Pixel" })).toBeVisible();
  });

  test("hierarchy tree shows all nodes fully expanded", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    const hierarchyTree = page.getByRole("tree", { name: "Tree navigation" }).nth(1);
    // Both trees render identical node labels; the hierarchy tree renders the same items
    await expect(hierarchyTree.getByRole("treeitem", { name: "Electronics" })).toBeVisible();
    await expect(hierarchyTree.getByRole("treeitem", { name: "Phones" })).toBeVisible();
    await expect(hierarchyTree.getByRole("treeitem", { name: "Laptops" })).toBeVisible();
    await expect(hierarchyTree.getByRole("treeitem", { name: "iPhone" })).toBeVisible();
    await expect(hierarchyTree.getByRole("treeitem", { name: "Pixel" })).toBeVisible();
  });
});
