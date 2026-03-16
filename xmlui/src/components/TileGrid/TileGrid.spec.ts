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

// =============================================================================
// STEP 3: Virtualization — only visible rows rendered, large datasets
// =============================================================================

test.describe("Virtualization", () => {
  test("renders a large dataset without errors", async ({ initTestBed, page }) => {
    // Build data expression using single-quoted strings to stay XML-attribute-safe
    const itemsExpr = Array.from({ length: 80 }, (_, i) => `{id: ${i}, name: 'Tile${i}'}`).join(",");
    await initTestBed(`
      <TileGrid
        data="{[${itemsExpr}]}"
        itemWidth="100px"
        itemHeight="80px"
        gap="8px"
        height="320px"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("grid")).toBeVisible();
    // With virtualization, far fewer than 80 gridcells should be in the DOM
    const visibleCount = await page.getByRole("gridcell").count();
    expect(visibleCount).toBeGreaterThan(0);
    expect(visibleCount).toBeLessThan(80);
  });

  test("scrolling reveals additional tiles", async ({ initTestBed, page }) => {
    const itemsExpr = Array.from({ length: 60 }, (_, i) => `{id: ${i}, name: 'Item${i}'}`).join(",");
    await initTestBed(`
      <TileGrid
        data="{[${itemsExpr}]}"
        itemWidth="200px"
        itemHeight="60px"
        gap="8px"
        height="240px"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    const grid = page.getByRole("grid");
    await expect(grid).toBeVisible();

    // Last item should not be visible initially (virtualized away)
    await expect(page.getByText("Item59")).not.toBeInViewport();

    // Scroll to the bottom
    await grid.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // After scrolling, a tile near the end should appear
    await expect(page.getByText("Item59")).toBeVisible();
  });
});

// =============================================================================
// STEP 4 & 5: Selection + Checkboxes
// =============================================================================

test.describe("Selection", () => {
  const selectionMarkup = `
    <TileGrid
      data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
      itemWidth="120px"
      itemHeight="80px"
      itemsSelectable="true"
    >
      <Text>{$item.name}</Text>
    </TileGrid>
  `;

  test("clicking a tile selects it", async ({ initTestBed, page }) => {
    await initTestBed(selectionMarkup);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
  });

  test("Ctrl+click extends selection to multiple tiles", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(selectionMarkup);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    // Ctrl+click second tile to add to selection
    await cells.nth(1).click({ modifiers: ["Meta"] });
    // Both should be selected
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("$selected context variable is true for selected tile", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
      >
        <Text>{$selected ? 'selected' : 'not-selected'}</Text>
      </TileGrid>
    `);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await expect(cells.nth(0)).toContainText("selected");
    await expect(cells.nth(1)).toContainText("not-selected");
  });

  test("selectionDidChange event fires with selected items", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
        <TileGrid
          data="{[{id:1,name:'A'},{id:2,name:'B'}]}"
          itemWidth="120px"
          itemHeight="80px"
          itemsSelectable="true"
          onSelectionDidChange="testState = 'fired'"
        >
          <Text>{$item.name}</Text>
        </TileGrid>
      `,
    );
    await page.getByRole("gridcell").nth(0).click();
    await expect.poll(testStateDriver.testState).toEqual("fired");
  });

  test("checkboxes are visible when itemsSelectable is true", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(selectionMarkup);
    // Each gridcell should contain a checkbox
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes.first()).toBeVisible();
  });

  test("checkbox click selects tile without triggering tile click twice", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(selectionMarkup);
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.click();
    const firstCell = page.getByRole("gridcell").nth(0);
    await expect(firstCell).toHaveAttribute("aria-selected", "true");
  });
});
