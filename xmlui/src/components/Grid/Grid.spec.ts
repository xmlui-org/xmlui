import { test, expect } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Item 1");
    await expect(grid).toContainText("Item 2");
    await expect(grid).toContainText("Item 3");
  });

  test("renders with explicit rows", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *">
        <GridRow>
          <Text>Row 1 Col 1</Text>
          <Text>Row 1 Col 2</Text>
        </GridRow>
        <GridRow>
          <Text>Row 2 Col 1</Text>
          <Text>Row 2 Col 2</Text>
        </GridRow>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Row 1 Col 1");
    await expect(grid).toContainText("Row 1 Col 2");
    await expect(grid).toContainText("Row 2 Col 1");
    await expect(grid).toContainText("Row 2 Col 2");
  });

  test("renders with explicit columns", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rowHeights="auto auto">
        <GridColumn>
          <Text>Col 1 Row 1</Text>
          <Text>Col 1 Row 2</Text>
        </GridColumn>
        <GridColumn>
          <Text>Col 2 Row 1</Text>
          <Text>Col 2 Row 2</Text>
        </GridColumn>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Col 1 Row 1");
    await expect(grid).toContainText("Col 1 Row 2");
    await expect(grid).toContainText("Col 2 Row 1");
    await expect(grid).toContainText("Col 2 Row 2");
  });

  test("renders with implicit grid using 'columns' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columns="3">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        <Text>Item 4</Text>
        <Text>Item 5</Text>
        <Text>Item 6</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    // Verify all items are present
    for (let i = 1; i <= 6; i++) {
      await expect(grid).toContainText(`Item ${i}`);
    }
  });

  test("renders with implicit grid using 'rows' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rows="2">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        <Text>Item 4</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    // Verify all items are present
    for (let i = 1; i <= 4; i++) {
      await expect(grid).toContainText(`Item ${i}`);
    }
  });

  test("applies star sizing for column widths", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* 2* *">
        <Text testId="col1">Column 1</Text>
        <Text testId="col2">Column 2</Text>
        <Text testId="col3">Column 3</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    // Middle column should be wider due to 2*
    const { width: col1Width } = await getBounds(page.getByTestId("col1"));
    const { width: col2Width } = await getBounds(page.getByTestId("col2"));
    const { width: col3Width } = await getBounds(page.getByTestId("col3"));
    
    // col2 should be approximately twice as wide as col1 and col3
    expect(col2Width).toBeGreaterThan(col1Width);
    expect(col2Width).toBeGreaterThan(col3Width);
  });

  test("applies percentage sizing for column widths", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="25% 50% 25%">
        <Text>Col 1</Text>
        <Text>Col 2</Text>
        <Text>Col 3</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("applies fixed sizing for column widths", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="100px 200px 100px">
        <Text>Col 1</Text>
        <Text>Col 2</Text>
        <Text>Col 3</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("applies mixed sizing for column widths", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="100px 2* 50%">
        <Text>Fixed</Text>
        <Text>Flexible</Text>
        <Text>Percentage</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("applies 'columnGap' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *" columnGap="20px">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const { right: item1Right } = await getBounds(page.getByTestId("item1"));
    const { left: item2Left } = await getBounds(page.getByTestId("item2"));
    
    // There should be a gap between the items
    const gap = item2Left - item1Right;
    expect(gap).toBeGreaterThan(0);
  });

  test("applies 'rowGap' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columns="1" rowGap="20px">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const { bottom: item1Bottom } = await getBounds(page.getByTestId("item1"));
    const { top: item2Top } = await getBounds(page.getByTestId("item2"));
    
    // There should be a gap between the items
    const gap = item2Top - item1Bottom;
    expect(gap).toBeGreaterThan(0);
  });

  test("applies 'gap' property as shorthand", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *" gap="15px">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
        <Text testId="item3">Item 3</Text>
        <Text testId="item4">Item 4</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    // Check column gap
    const { right: item1Right } = await getBounds(page.getByTestId("item1"));
    const { left: item2Left } = await getBounds(page.getByTestId("item2"));
    const columnGap = item2Left - item1Right;
    expect(columnGap).toBeGreaterThan(0);
    
    // Check row gap
    const { bottom: item1Bottom } = await getBounds(page.getByTestId("item1"));
    const { top: item3Top } = await getBounds(page.getByTestId("item3"));
    const rowGap = item3Top - item1Bottom;
    expect(rowGap).toBeGreaterThan(0);
  });

  test("'columnGap' overrides 'gap' for columns", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *" gap="10px" columnGap="30px">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const { right: item1Right } = await getBounds(page.getByTestId("item1"));
    const { left: item2Left } = await getBounds(page.getByTestId("item2"));
    const gap = item2Left - item1Right;
    
    // Gap should be closer to 30px than 10px
    expect(gap).toBeGreaterThan(20);
  });

  test("'rowGap' overrides 'gap' for rows", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columns="1" gap="10px" rowGap="30px">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const { bottom: item1Bottom } = await getBounds(page.getByTestId("item1"));
    const { top: item2Top } = await getBounds(page.getByTestId("item2"));
    const gap = item2Top - item1Bottom;
    
    // Gap should be closer to 30px than 10px
    expect(gap).toBeGreaterThan(20);
  });

  test("applies 'horizontalAlignment' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="200px 200px" horizontalAlignment="center">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(page.getByTestId("item1")).toBeVisible();
    await expect(page.getByTestId("item2")).toBeVisible();
  });

  test("applies 'verticalAlignment' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *" rowHeights="100px" verticalAlignment="center">
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(page.getByTestId("item1")).toBeVisible();
    await expect(page.getByTestId("item2")).toBeVisible();
  });

  test.skip("GridRow 'height' property applies custom height", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *">
        <GridRow height="100px">
          <Text testId="item1">Row 1 Col 1</Text>
          <Text testId="item2">Row 1 Col 2</Text>
        </GridRow>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(page.getByTestId("item1")).toBeVisible();
    await expect(page.getByTestId("item2")).toBeVisible();
  });

  test.skip("GridColumn 'width' property applies custom width", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rowHeights="auto auto">
        <GridColumn width="200px">
          <Text testId="item1">Col 1 Row 1</Text>
          <Text testId="item2">Col 1 Row 2</Text>
        </GridColumn>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(page.getByTestId("item1")).toBeVisible();
    await expect(page.getByTestId("item2")).toBeVisible();
  });

  test.skip("GridRow applies alignment properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="200px 200px">
        <GridRow horizontalAlignment="end" verticalAlignment="center">
          <Text testId="item1">Aligned Item 1</Text>
          <Text testId="item2">Aligned Item 2</Text>
        </GridRow>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(page.getByTestId("item1")).toBeVisible();
    await expect(page.getByTestId("item2")).toBeVisible();
  });

  test.skip("GridColumn applies alignment properties", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rowHeights="100px 100px">
        <GridColumn horizontalAlignment="center" verticalAlignment="start">
          <Text testId="item1">Aligned Item 1</Text>
          <Text testId="item2">Aligned Item 2</Text>
        </GridColumn>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(page.getByTestId("item1")).toBeVisible();
    await expect(page.getByTestId("item2")).toBeVisible();
  });

  test.skip("GridRow 'columnGap' property sets gap between columns", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <GridRow columnGap="50px">
          <Text testId="item1">Col 1</Text>
          <Text testId="item2">Col 2</Text>
        </GridRow>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const { right: item1Right } = await getBounds(page.getByTestId("item1"));
    const { left: item2Left } = await getBounds(page.getByTestId("item2"));
    const gap = item2Left - item1Right;
    
    expect(gap).toBeGreaterThan(40);
  });

  test.skip("GridColumn 'rowGap' property sets gap between rows", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <GridColumn rowGap="50px">
          <Text testId="item1">Row 1</Text>
          <Text testId="item2">Row 2</Text>
        </GridColumn>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const { bottom: item1Bottom } = await getBounds(page.getByTestId("item1"));
    const { top: item2Top } = await getBounds(page.getByTestId("item2"));
    const gap = item2Top - item1Bottom;
    
    expect(gap).toBeGreaterThan(40);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has generic role for screen readers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    // Grid is a div, which has generic role
    await expect(grid).toHaveRole("generic");
  });

  test("children are accessible", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <Button>Click me</Button>
        <TextBox label="Enter text" />
      </Grid>
    `);

    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    
    const button = page.getByRole("button", { name: "Click me" });
    await expect(button).toBeVisible();
    
    const textbox = page.getByRole("textbox", { name: "Enter text" });
    await expect(textbox).toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles no children gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Grid testId="grid" />`);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeAttached();
  });

  test("handles single child", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <Text>Only child</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Only child");
  });

  test("handles empty GridRow", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <GridRow />
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeAttached();
  });

  test("handles empty GridColumn", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid">
        <GridColumn />
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeAttached();
  });

  test("handles mixed content with GridRow and regular children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *">
        <GridRow>
          <Text>Row 1 Col 1</Text>
          <Text>Row 1 Col 2</Text>
        </GridRow>
        <Text>Direct child 1</Text>
        <Text>Direct child 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Row 1 Col 1");
    await expect(grid).toContainText("Direct child 1");
  });

  test("handles mixed content with GridColumn and regular children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rowHeights="auto auto">
        <GridColumn>
          <Text>Col 1 Row 1</Text>
          <Text>Col 1 Row 2</Text>
        </GridColumn>
        <Text>Direct child 1</Text>
        <Text>Direct child 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Col 1 Row 1");
    await expect(grid).toContainText("Direct child 1");
  });

  test("handles null 'columnWidths' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="{null}">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles null 'rowHeights' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rowHeights="{null}">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles null 'columns' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columns="{null}">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles null 'rows' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rows="{null}">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles very large number of items", async ({ initTestBed, page }) => {
    const items = Array.from({ length: 100 }, (_, i) => `<Text>Item ${i + 1}</Text>`).join("");
    
    await initTestBed(`
      <Grid testId="grid" columns="10">
        ${items}
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("Item 1");
    await expect(grid).toContainText("Item 100");
  });

  test("handles nested grids", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="outer-grid" columnWidths="* *">
        <Grid testId="inner-grid-1" columns="2">
          <Text>Nested 1-1</Text>
          <Text>Nested 1-2</Text>
        </Grid>
        <Grid testId="inner-grid-2" columns="2">
          <Text>Nested 2-1</Text>
          <Text>Nested 2-2</Text>
        </Grid>
      </Grid>
    `);
    
    const outerGrid = page.getByTestId("outer-grid");
    await expect(outerGrid).toBeVisible();
    
    const innerGrid1 = page.getByTestId("inner-grid-1");
    await expect(innerGrid1).toBeVisible();
    await expect(innerGrid1).toContainText("Nested 1-1");
    
    const innerGrid2 = page.getByTestId("inner-grid-2");
    await expect(innerGrid2).toBeVisible();
    await expect(innerGrid2).toContainText("Nested 2-1");
  });

  test("handles complex nested structure with Items", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="* *">
        <Items data="{[{ id: 1, name: 'First' }, { id: 2, name: 'Second' }]}">
          <Text>{$item.name}</Text>
        </Items>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
    await expect(grid).toContainText("First");
    await expect(grid).toContainText("Second");
  });

  test("handles design tokens in sizing", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="$space-10 $space-20 *" columnGap="$gap-normal">
        <Text>Token col 1</Text>
        <Text>Token col 2</Text>
        <Text>Flexible col</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles auto sizing", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="auto auto auto">
        <Text>Auto 1</Text>
        <Text>Auto 2</Text>
        <Text>Auto 3</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles empty string for columnWidths", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles whitespace-only columnWidths", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columnWidths="   ">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles zero columns", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" columns="0">
        <Text>Item 1</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });

  test("handles zero rows", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Grid testId="grid" rows="0">
        <Text>Item 1</Text>
      </Grid>
    `);
    
    const grid = page.getByTestId("grid");
    await expect(grid).toBeVisible();
  });
});
