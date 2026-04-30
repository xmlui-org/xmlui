import * as path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "../src/testing/fixtures";
import { getExampleSource, extractXmluiExample } from "../src/testing/website-example-utils";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const markdown = getExampleSource(
  path.join(
    __dirname,
    "../../website/content/docs/pages/howto/theme-multi-level-navgroup-nesting.md",
  ),
);

test.describe("Vertical NavGroup defaults", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Vertical NavGroup defaults",
  );

  test("initial state shows the expanded nested navigation baseline", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByText("Products", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Catalog", { exact: true })).toBeVisible();
    await expect(page.getByText("Accessories", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chargers" })).toBeVisible();
  });

  test("clicking a vertical group collapses its child links", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByText("Products", { exact: true }).click();

    await expect(page.getByRole("link", { name: "Overview" })).not.toBeVisible();
    await expect(page.getByText("Catalog", { exact: true })).not.toBeVisible();
  });
});

test.describe("Vertical NavGroup with progressive padding", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Vertical NavGroup with progressive padding",
  );

  test("initial state shows all progressively nested navigation levels", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByText("Products", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(page.getByText("Catalog", { exact: true })).toBeVisible();
    await expect(page.getByText("Accessories", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adapters" })).toBeVisible();
  });

  test("deeper nav levels are positioned farther right than their parent", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    const productsBox = await page.getByText("Products", { exact: true }).boundingBox();
    const catalogBox = await page.getByText("Catalog", { exact: true }).boundingBox();
    const accessoriesBox = await page.getByText("Accessories", { exact: true }).boundingBox();

    expect(productsBox).not.toBeNull();
    expect(catalogBox).not.toBeNull();
    expect(accessoriesBox).not.toBeNull();
    expect(catalogBox!.x).toBeGreaterThan(productsBox!.x);
    expect(accessoriesBox!.x).toBeGreaterThan(catalogBox!.x);
  });
});

test.describe("Horizontal NavGroup dropdown theming", { tag: "@website" }, () => {
  const { app, components, apiInterceptor } = extractXmluiExample(
    markdown,
    "Horizontal NavGroup dropdown theming",
  );

  test("initial state shows the horizontal top-level navigation", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(app, { components, apiInterceptor });

    await expect(page.getByText("Home", { exact: true })).toBeVisible();
    await expect(page.getByText("Products", { exact: true })).toBeVisible();
    await expect(page.getByText("Reports", { exact: true })).toBeVisible();
    await expect(page.getByText("Overview", { exact: true })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Electronics" })).toBeVisible();
    await expect(page.getByText("Content area")).toBeVisible();
  });

  test("clicking a dropdown item navigates from the overlay", async ({ initTestBed, page }) => {
    await initTestBed(app, { components, apiInterceptor });

    await page.getByRole("menuitem", { name: "Accessories" }).click();

    await expect.poll(() => page.url()).toContain("#/products/accessories");
  });
});
