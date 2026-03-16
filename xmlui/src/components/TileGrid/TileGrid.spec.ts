import { expect, test } from "../../testing/fixtures";

// =============================================================================
// STEP 1: Basic Functionality — scaffold, rendering, template context variables
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders without data", async ({ initTestBed, page }) => {
    await initTestBed(`<TileGrid />`);
    await expect(page.getByRole("grid")).toBeVisible();
  });

  test("component renders with data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[
          {id: 1, name: 'Tile A'},
          {id: 2, name: 'Tile B'},
          {id: 3, name: 'Tile C'}
        ]}"
        itemWidth="100px"
        itemHeight="100px"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("grid")).toBeVisible();
    await expect(page.getByRole("gridcell")).toHaveCount(3);
  });

  test("renders correct tile count", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[
          {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}
        ]}"
        itemWidth="120px"
        itemHeight="140px"
      >
        <Text>{$item.id}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("gridcell")).toHaveCount(5);
  });

  test("$item context variable is accessible in template", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[
          {id: 1, name: 'Alpha'},
          {id: 2, name: 'Beta'}
        ]}"
        itemWidth="120px"
        itemHeight="80px"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("grid")).toContainText("Alpha");
    await expect(page.getByRole("grid")).toContainText("Beta");
  });

  test("$itemIndex context variable is accessible in template", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id: 'a'}, {id: 'b'}, {id: 'c'}]}"
        itemWidth="100px"
        itemHeight="80px"
      >
        <Text>{$itemIndex}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("grid")).toContainText("0");
    await expect(page.getByRole("grid")).toContainText("1");
    await expect(page.getByRole("grid")).toContainText("2");
  });

  test("$isFirst and $isLast context variables are correct", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id: 1}, {id: 2}, {id: 3}]}"
        itemWidth="100px"
        itemHeight="80px"
      >
        <Text>{$isFirst ? 'first' : ($isLast ? 'last' : 'middle')}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("grid")).toContainText("first");
    await expect(page.getByRole("grid")).toContainText("middle");
    await expect(page.getByRole("grid")).toContainText("last");
  });

  test("handles empty data array gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TileGrid data="{[]}" itemWidth="100px" itemHeight="100px" />`);
    await expect(page.getByRole("grid")).toBeVisible();
    await expect(page.getByRole("gridcell")).toHaveCount(0);
  });

  test("loading prop hides tile content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id: 1, name: 'Hidden'}]}"
        itemWidth="120px"
        itemHeight="80px"
        loading="true"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("grid")).toBeVisible();
    await expect(page.getByRole("gridcell")).toHaveCount(0);
  });
});

// =============================================================================
// THEME VARIABLES
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies backgroundColor-TileGrid-item theme variable", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <TileGrid
          data="{[{id: 1}]}"
          itemWidth="100px"
          itemHeight="100px"
        >
          <Text>tile</Text>
        </TileGrid>
      `,
      { testThemeVars: { "backgroundColor-TileGrid-item": "rgb(255, 0, 0)" } },
    );
    const tile = page.getByRole("gridcell").first();
    await expect(tile).toBeVisible();
    await expect(tile).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("applies borderRadius-TileGrid-item theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
        <TileGrid
          data="{[{id: 1}]}"
          itemWidth="100px"
          itemHeight="100px"
        >
          <Text>tile</Text>
        </TileGrid>
      `,
      { testThemeVars: { "borderRadius-TileGrid-item": "12px" } },
    );
    const tile = page.getByRole("gridcell").first();
    await expect(tile).toBeVisible();
    await expect(tile).toHaveCSS("border-radius", "12px");
  });
});

// =============================================================================
// STEP 2: Grid Layout — rows, column calculation, context variables accuracy
// =============================================================================

test.describe("Grid Layout", () => {
  test("items are grouped into row elements", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1},{id:2},{id:3},{id:4},{id:5},{id:6}]}"
        itemWidth="100px"
        itemHeight="80px"
        gap="8px"
      >
        <Text>{$item.id}</Text>
      </TileGrid>
    `);
    // At least one row should be present
    await expect(page.getByRole("row").first()).toBeVisible();
    // All tiles are still accessible as gridcells
    await expect(page.getByRole("gridcell")).toHaveCount(6);
  });

  test("$itemIndex is globally consistent across rows", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:'a'},{id:'b'},{id:'c'},{id:'d'},{id:'e'}]}"
        itemWidth="100px"
        itemHeight="80px"
        gap="8px"
      >
        <Text>{$itemIndex}</Text>
      </TileGrid>
    `);
    // Indices 0–4 should all be rendered regardless of row layout
    for (const idx of ["0", "1", "2", "3", "4"]) {
      await expect(page.getByRole("grid")).toContainText(idx);
    }
  });

  test("$isFirst is true only for the first item", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1},{id:2},{id:3}]}"
        itemWidth="100px"
        itemHeight="80px"
      >
        <Text>{$isFirst ? 'yes' : 'no'}</Text>
      </TileGrid>
    `);
    const cells = page.getByRole("gridcell");
    await expect(cells.nth(0)).toContainText("yes");
    await expect(cells.nth(1)).toContainText("no");
    await expect(cells.nth(2)).toContainText("no");
  });

  test("$isLast is true only for the last item", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1},{id:2},{id:3}]}"
        itemWidth="100px"
        itemHeight="80px"
      >
        <Text>{$isLast ? 'yes' : 'no'}</Text>
      </TileGrid>
    `);
    const cells = page.getByRole("gridcell");
    await expect(cells.nth(0)).toContainText("no");
    await expect(cells.nth(1)).toContainText("no");
    await expect(cells.nth(2)).toContainText("yes");
  });

  test("tile dimensions match itemWidth and itemHeight props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1}]}"
        itemWidth="150px"
        itemHeight="90px"
        gap="8px"
      >
        <Text>{$item.id}</Text>
      </TileGrid>
    `);
    const tile = page.getByRole("gridcell").first();
    await expect(tile).toBeVisible();
    await expect(tile).toHaveCSS("width", "150px");
    await expect(tile).toHaveCSS("height", "90px");
  });
});
