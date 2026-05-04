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
    // All flat-format nodes should be visible since defaultExpanded="all"
    await expect(page.getByText("Electronics").first()).toBeVisible();
    await expect(page.getByText("Phones").first()).toBeVisible();
    await expect(page.getByText("Laptops").first()).toBeVisible();
    await expect(page.getByText("iPhone").first()).toBeVisible();
    await expect(page.getByText("Pixel").first()).toBeVisible();
  });

  test("hierarchy tree shows all nodes fully expanded", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });
    // Both trees render identical node labels; the hierarchy tree renders the same items
    await expect(page.getByText("Electronics").nth(1)).toBeVisible();
    await expect(page.getByText("Phones").nth(1)).toBeVisible();
    await expect(page.getByText("Laptops").nth(1)).toBeVisible();
    await expect(page.getByText("iPhone").nth(1)).toBeVisible();
    await expect(page.getByText("Pixel").nth(1)).toBeVisible();
  });
});
