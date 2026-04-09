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
      { testThemeVars: { "backgroundColor-item-TileGrid": "rgb(255, 0, 0)" } },
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
      { testThemeVars: { "borderRadius-item-TileGrid": "12px" } },
    );
    const tile = page.getByRole("gridcell").first();
    await expect(tile).toBeVisible();
    await expect(tile).toHaveCSS("border-radius", "12px");
  });

  test("applies fontSize-checkbox-TileGrid theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
        <TileGrid
          data="{[{id: 1}]}"
          itemWidth="100px"
          itemHeight="100px"
          itemsSelectable="true"
        >
          <Text>tile</Text>
        </TileGrid>
      `,
      { testThemeVars: { "fontSize-checkbox-TileGrid": "24px" } },
    );
    const checkbox = page.getByRole("checkbox").first();
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toHaveCSS("font-size", "24px");
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

// =============================================================================
// hideSelectionCheckboxes property
// =============================================================================

test.describe("hideSelectionCheckboxes property", () => {
  test("hides checkboxes when true", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
        hideSelectionCheckboxes="true"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes).toHaveCount(0);
  });

  test("selection still works via click when checkboxes are hidden", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
        hideSelectionCheckboxes="true"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
  });

  test("Ctrl+click multi-selection works when checkboxes are hidden", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
        hideSelectionCheckboxes="true"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await cells.nth(1).click({ modifiers: ["Meta"] });
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("checkboxes are visible when hideSelectionCheckboxes is false (default)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    const checkboxes = page.getByRole("checkbox");
    await expect(checkboxes.first()).toBeVisible();
  });
});

// =============================================================================
// STEP 6: Keyboard Shortcuts + Double-click
// =============================================================================

test.describe("Keyboard Shortcuts", () => {
  const selectableMarkup = `
    <TileGrid
      data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
      itemWidth="120px"
      itemHeight="80px"
      itemsSelectable="true"
    >
      <Text>{$item.name}</Text>
    </TileGrid>
  `;

  test("Ctrl+A selects all tiles", async ({ initTestBed, page }) => {
    await initTestBed(selectableMarkup);
    // Click first tile to give the grid focus
    await page.getByRole("gridcell").nth(0).click();
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+A" : "Control+A");
    const cells = page.getByRole("gridcell");
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(2)).toHaveAttribute("aria-selected", "true");
  });

  test("selectAllAction event fires on Ctrl+A", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
        onSelectAllAction="testState = 'fired'"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await page.getByRole("gridcell").nth(0).click();
    const isMac = process.platform === "darwin";
    await page.keyboard.press(isMac ? "Meta+A" : "Control+A");
    await expect.poll(testStateDriver.testState).toEqual("fired");
  });

  test("Delete key fires deleteAction with selected items", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
        onDeleteAction="testState = 'deleted'"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await page.getByRole("gridcell").nth(0).click();
    await page.keyboard.press("Delete");
    await expect.poll(testStateDriver.testState).toEqual("deleted");
  });

  test("double-click fires itemDoubleClick event with item", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'Alpha'},{id:2,name:'Beta'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
        onItemDoubleClick="testState = 'dblclicked'"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    await page.getByRole("gridcell").nth(0).dblclick();
    await expect.poll(testStateDriver.testState).toEqual("dblclicked");
  });
});

// =============================================================================
// STEP 7: syncWithVar
// =============================================================================

test.describe("syncWithVar property", () => {
  const syncData = `[{id: 1, name: 'Apple'},{id: 2, name: 'Banana'},{id: 3, name: 'Carrot'}]`;

  const tileTemplate = `<Text>{$item.name}</Text>`;

  test("tile selection updates the synced global variable's selectedIds", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{}}">
        <TileGrid
          syncWithVar="syncState"
          itemsSelectable="true"
          data="{${syncData}}"
          itemWidth="120px"
          itemHeight="80px"
        >
          ${tileTemplate}
        </TileGrid>
        <Text testId="sync-display">{JSON.stringify(syncState)}</Text>
      </Fragment>
    `);

    await expect(page.getByRole("grid")).toBeVisible();
    await page.getByRole("gridcell").nth(0).click();

    const display = page.getByTestId("sync-display");
    await expect(display).toContainText('"selectedIds"');
    await expect(display).toContainText("1");
  });

  test("initial selectedIds in the variable pre-selects the matching tiles on load", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{selectedIds: [1]}}">
        <TileGrid
          syncWithVar="syncState"
          itemsSelectable="true"
          data="{${syncData}}"
          itemWidth="120px"
          itemHeight="80px"
        >
          ${tileTemplate}
        </TileGrid>
      </Fragment>
    `);

    await expect(page.getByRole("grid")).toBeVisible();
    const cells = page.getByRole("gridcell");
    // Tile with id=1 should be pre-selected
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    // Others should not be selected
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "false");
    await expect(cells.nth(2)).toHaveAttribute("aria-selected", "false");
  });

  test("deselecting a tile clears selectedIds in the variable", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment var.syncState="{{}}">
        <TileGrid
          syncWithVar="syncState"
          itemsSelectable="true"
          data="{${syncData}}"
          itemWidth="120px"
          itemHeight="80px"
        >
          ${tileTemplate}
        </TileGrid>
        <Text testId="sync-display">{JSON.stringify(syncState)}</Text>
      </Fragment>
    `);

    await expect(page.getByRole("grid")).toBeVisible();
    // Select, then deselect the first tile via its checkbox
    const firstCheckbox = page.getByRole("checkbox").first();
    await firstCheckbox.click();
    await expect(firstCheckbox).toBeChecked();
    await firstCheckbox.click();
    await expect(firstCheckbox).not.toBeChecked();

    await expect(page.getByTestId("sync-display")).toContainText('"selectedIds":[]');
  });

  test("invalid variable name does not crash the grid and it still renders", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TileGrid
        syncWithVar="123invalid"
        itemsSelectable="true"
        data="{${syncData}}"
        itemWidth="120px"
        itemHeight="80px"
      >
        ${tileTemplate}
      </TileGrid>
    `);

    await expect(page.getByRole("grid")).toBeVisible();
    await expect(page.getByRole("gridcell")).toHaveCount(3);
  });

  test("non-existent variable name renders grid with local-only selection", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <TileGrid
        syncWithVar="noSuchVar"
        itemsSelectable="true"
        data="{${syncData}}"
        itemWidth="120px"
        itemHeight="80px"
      >
        ${tileTemplate}
      </TileGrid>
    `);

    await expect(page.getByRole("grid")).toBeVisible();
    // Selection should still work locally
    await page.getByRole("gridcell").nth(0).click();
    await expect(page.getByRole("gridcell").nth(0)).toHaveAttribute("aria-selected", "true");
  });
});

// =============================================================================
// stretchItems property
// =============================================================================

test.describe("stretchItems property", () => {
  test("default is false — tile width equals itemWidth", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1}]}"
        itemWidth="150px"
        itemHeight="80px"
      >
        <Text>{$item.id}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("gridcell").first()).toHaveCSS("width", "150px");
  });

  test("stretchItems true — tiles are stretched to fill the container evenly", async ({ initTestBed, page }) => {
    // Use a viewport where cols × itemWidth < containerWidth so stretch makes a measurable difference.
    // viewport=600px, itemWidth=110px, gap=0 → cols=5 (5×110=550 < 600), stretched=120px, unstretched=110px
    await page.setViewportSize({ width: 600, height: 600 });
    await initTestBed(`
      <TileGrid
        data="{[{id:1},{id:2},{id:3},{id:4},{id:5}]}"
        itemWidth="110px"
        itemHeight="80px"
        gap="0px"
        stretchItems="true"
      >
        <Text>{$item.id}</Text>
      </TileGrid>
    `);
    const tile = page.getByRole("gridcell").first();
    await expect(tile).toBeVisible();
    // Tile width should be stretched beyond itemWidth (110px)
    await expect(tile).not.toHaveCSS("width", "110px");
    // All tiles together should fill the grid width
    const gridBounds = await page.getByRole("grid").boundingBox();
    const tileBounds = await tile.boundingBox();
    const cols = await page.getByRole("gridcell").count();
    expect(tileBounds!.width * cols).toBeCloseTo(gridBounds!.width, 0);
  });

  test("stretchItems false — tile width stays at itemWidth", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1}]}"
        itemWidth="80px"
        itemHeight="80px"
        stretchItems="false"
      >
        <Text>{$item.id}</Text>
      </TileGrid>
    `);
    await expect(page.getByRole("gridcell").first()).toHaveCSS("width", "80px");
  });
});

// =============================================================================
// toggleSelectionOnClick property
// =============================================================================

test.describe("toggleSelectionOnClick property", () => {
  const toggleMarkup = `
    <TileGrid
      data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
      itemWidth="120px"
      itemHeight="80px"
      itemsSelectable="true"
      toggleSelectionOnClick="true"
    >
      <Text>{$item.name}</Text>
    </TileGrid>
  `;

  test("plain click selects unselected tile", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
  });

  test("plain click on selected tile deselects it (toggle)", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const cells = page.getByRole("gridcell");
    // First click — select
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    // Second click — deselect
    await cells.nth(0).click();
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "false");
  });

  test("plain click does not deselect other tiles", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await cells.nth(1).click();
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("Shift+Click still performs range selection", async ({ initTestBed, page }) => {
    await initTestBed(toggleMarkup);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await cells.nth(2).click({ modifiers: ["Shift"] });
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(cells.nth(2)).toHaveAttribute("aria-selected", "true");
  });

  test("without toggleSelectionOnClick plain click replaces selection", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TileGrid
        data="{[{id:1,name:'A'},{id:2,name:'B'},{id:3,name:'C'}]}"
        itemWidth="120px"
        itemHeight="80px"
        itemsSelectable="true"
      >
        <Text>{$item.name}</Text>
      </TileGrid>
    `);
    const cells = page.getByRole("gridcell");
    await cells.nth(0).click();
    await cells.nth(1).click();
    // First tile should be deselected (replaced), second selected
    await expect(cells.nth(0)).toHaveAttribute("aria-selected", "false");
    await expect(cells.nth(1)).toHaveAttribute("aria-selected", "true");
  });
});

// =============================================================================
// STEP 10: onContextMenu event
// =============================================================================

test.describe("onContextMenu event", () => {
  const sampleData = [
    { id: 1, name: "Apple", category: "Fruit" },
    { id: 2, name: "Banana", category: "Fruit" },
  ];

  test("fires onContextMenu event on right-click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TileGrid
        data='{${JSON.stringify(sampleData)}}'
        itemWidth="120px"
        itemHeight="80px"
        onContextMenu="testState = 'context-menu-fired'"
      >
        <VStack>
          <Text>{$item.name}</Text>
        </VStack>
      </TileGrid>
    `);

    const firstTile = page.getByRole("gridcell").first();
    await expect(firstTile).toBeVisible();
    await firstTile.click({ button: "right" });

    await expect.poll(testStateDriver.testState).toEqual("context-menu-fired");
  });

  test("provides $item context variable with tile data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TileGrid
        data='{${JSON.stringify(sampleData)}}'
        itemWidth="120px"
        itemHeight="80px"
        onContextMenu="testState = $item"
      >
        <VStack>
          <Text>{$item.name}</Text>
        </VStack>
      </TileGrid>
    `);

    const secondTile = page.getByRole("gridcell").nth(1);
    await secondTile.click({ button: "right" });

    const result = await testStateDriver.testState();
    expect(result.id).toEqual(2);
    expect(result.name).toEqual("Banana");
    expect(result.category).toEqual("Fruit");
  });

  test("provides $itemIndex context variable with tile index", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TileGrid
        data='{${JSON.stringify(sampleData)}}'
        itemWidth="120px"
        itemHeight="80px"
        onContextMenu="testState = $itemIndex"
      >
        <VStack>
          <Text>{$item.name}</Text>
        </VStack>
      </TileGrid>
    `);

    const secondTile = page.getByRole("gridcell").nth(1);
    await secondTile.click({ button: "right" });

    await expect.poll(testStateDriver.testState).toEqual(1);
  });
});


// =============================================================================
// refreshOn
// =============================================================================

test.describe("refreshOn Property", () => {
  test("updates event handler closures when refreshOn changes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.parentValue="1">
        <TileGrid
          data="{[{id: 1, name: 'Tile A' }]}"
          itemWidth="100px"
          itemHeight="100px"
          refreshOn="{parentValue}"
        >
          <Text onClick="testState = parentValue">{$item.name}</Text>
        </TileGrid>
        <Button onClick="parentValue = 2" id="btn" label="Change" />
      </VStack>
    `);

    const txt = page.getByText("Tile A");
    const btn = page.getByTestId("btn");

    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");

    await btn.click();
    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual(2);
  });

  test("does not update event handler closures when refreshOn is unchanged", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.parentValue="1" var.refreshWatch="1">
        <TileGrid
          data="{[{id: 1, name: 'Tile A' }]}"
          itemWidth="100px"
          itemHeight="100px"
          refreshOn="{refreshWatch}"
        >
          <Text onClick="testState = parentValue">{$item.name}</Text>
        </TileGrid>
        <Button onClick="parentValue = 2" id="btn" label="Change" />
      </VStack>
    `);

    const txt = page.getByText("Tile A");
    const btn = page.getByTestId("btn");

    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");

    await btn.click();
    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");
  });

  test("updates event handler closures if refreshOn is not provided (historic behavior)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <VStack var.parentValue="1">
        <TileGrid
          data="{[{id: 1, name: 'Tile A' }]}"
          itemWidth="100px"
          itemHeight="100px"
        >
          <Text onClick="testState = parentValue">{$item.name}</Text>
        </TileGrid>
        <Button onClick="parentValue = 2" id="btn" label="Change" />
      </VStack>
    `);

    const txt = page.getByText("Tile A");
    const btn = page.getByTestId("btn");

    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual("1");

    await btn.click();
    await txt.click();
    await expect.poll(testStateDriver.testState).toEqual(2);
  });
});
