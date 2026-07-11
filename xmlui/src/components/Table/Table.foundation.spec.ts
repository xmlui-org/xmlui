import { expect, test } from "../../testing/fixtures";

test.describe("Table foundation", () => {
  test("renders data through Column definitions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Table
        testId="table"
        data="{[
          { id: 1, name: 'Ada', role: 'Compiler' },
          { id: 2, name: 'Grace', role: 'Runtime' }
        ]}">
        <Column bindTo="name" header="Name" />
        <Column bindTo="role" header="Role" />
      </Table>
    `);

    await expect(page.getByTestId("table")).toContainText("Name");
    await expect(page.getByTestId("table")).toContainText("Ada");
    await expect(page.getByTestId("table")).toContainText("Runtime");
  });

  test("sorts a column and updates selected row state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.selected="{0}">
        <Table
          testId="table"
          rowsSelectable="true"
          onSelectionDidChange="items => selected = items.length"
          data="{[
            { id: 1, name: 'Beta' },
            { id: 2, name: 'Alpha' }
          ]}">
          <Column bindTo="name" header="Name" />
        </Table>
        <Text testId="selected">Selected: {selected}</Text>
      </App>
    `);

    await page.getByRole("columnheader", { name: "Name" }).click();
    await expect(page.getByRole("row").nth(1)).toContainText("Alpha");

    await page.getByRole("row").nth(1).hover();
    await page.locator("tbody input[type='checkbox']").first().check();
    await expect(page.getByTestId("selected")).toHaveText("Selected: 1");
  });

  test("preserves selectable table header and checkbox hover styling", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
        <App>
          <Table
            testId="table"
            data="{[
              { id: 0, name: 'Apples', quantity: 5, unit: 'pieces', category: 'fruits', key: 5 },
              { id: 1, name: 'Bananas', quantity: 6, unit: 'pieces', category: 'fruits', key: 4 },
              { id: 2, name: 'Carrots', quantity: 100, unit: 'grams', category: 'vegetables', key: 3 },
              { id: 3, name: 'Spinach', quantity: 1, unit: 'bunch', category: 'vegetables', key: 2 },
              { id: 4, name: 'Milk', quantity: 10, unit: 'liter', category: 'dairy', key: 1 },
              { id: 5, name: 'Cheese', quantity: 200, unit: 'grams', category: 'dairy', key: 0 }
            ]}"
            rowsSelectable="true"
            checkboxTolerance="comfortable">
            <Column bindTo="name"/>
            <Column bindTo="quantity"/>
            <Column bindTo="unit"/>
          </Table>
        </App>
      `);

    const headerRow = page.getByRole("row").first();
    const firstDataRow = page.getByRole("row").nth(1);
    const firstSelectionCell = page.locator('tbody [data-column-id="select"]').first();
    const firstSelectionToggle = page.locator('tbody input[type="checkbox"]').first();

    const headerBox = await headerRow.boundingBox();
    expect(headerBox?.height).toBe(34);

    const selectionBox = await firstSelectionCell.boundingBox();
    expect(selectionBox?.width).toBeGreaterThanOrEqual(35);
    expect(selectionBox?.width).toBeLessThanOrEqual(50);

    await expect(headerRow).toHaveCSS("background-color", "rgb(238, 243, 246)");
    await expect(firstSelectionCell).toHaveCSS("background-color", "rgb(248, 250, 251)");
    const rowBorder = await firstDataRow.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.borderBottomColor,
        style: style.borderBottomStyle,
        width: style.borderBottomWidth,
      };
    });
    const selectionBoxShadow = await firstSelectionCell.evaluate(
      (element) => getComputedStyle(element).boxShadow,
    );
    const rowDivider = await firstDataRow.evaluate((element) => {
      const style = getComputedStyle(element, "::after");
      return {
        borderColor: style.borderBottomColor,
        borderStyle: style.borderBottomStyle,
        borderWidth: style.borderBottomWidth,
        bottom: style.bottom,
        height: style.height,
      };
    });
    expect(rowBorder.style).toBe("none");
    expect(rowBorder.width).toBe("0px");
    expect(rowDivider).toEqual({
      borderColor: rowDivider.borderColor,
      borderStyle: "solid",
      borderWidth: "1px",
      bottom: "0px",
      height: "1px",
    });
    expect(selectionBoxShadow).toBe("none");

    await page.getByRole("row").nth(1).hover();
    await expect(firstSelectionCell).toHaveCSS("background-color", "rgb(231, 240, 251)");

    await firstSelectionToggle.hover();
    await expect(firstSelectionToggle).toHaveCSS("border-color", "rgb(71, 108, 133)");
  });

  test("accepts headerHeight and applies it to the table header", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Table
          testId="table"
          data="{[
            { id: 0, name: 'Apples', quantity: 5, unit: 'pieces' },
            { id: 1, name: 'Bananas', quantity: 6, unit: 'pieces' }
          ]}"
          headerHeight="60px">
          <Column bindTo="name"/>
          <Column bindTo="quantity"/>
          <Column bindTo="unit"/>
        </Table>
      </App>
    `);

    await expect(page.getByTestId("table").locator("thead")).toHaveCSS("height", "60px");
  });

  test("materializes empty syncWithVar selection through component instances", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App global.selState="{{}}">
        <MyTable />
        <Text testId="selection">Selection: {JSON.stringify(selState)}</Text>
        <MyTable />
      </App>
    `,
      {
        components: [
          `
          <Component name="MyTable">
            <Table
              syncWithVar="selState"
              rowsSelectable="true"
              data="{[
                { id: 0, name: 'Apples', quantity: 5, unit: 'pieces' },
                { id: 1, name: 'Bananas', quantity: 6 },
                { id: 2, name: 'Carrots', quantity: 100, unit: 'grams' }
              ]}">
              <Column bindTo="name" />
              <Column bindTo="quantity" />
              <Column bindTo="unit" />
            </Table>
          </Component>
          `,
        ],
      },
    );

    await expect(page.getByTestId("selection")).toHaveText('Selection: {"selectedIds":[]}');
  });

  test("accepts sortingDidChange and passes column and direction", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.sortedBy="">
        <Heading
          testId="sorted"
          level="h4"
          value="Table is sorted by: {sortedBy || ''}"
          paddingLeft="1rem" />
        <Table
          data="{[
            { id: 0, name: 'Apples', quantity: 5, unit: 'pieces' },
            { id: 1, name: 'Bananas', quantity: 6, unit: 'pieces' },
            { id: 2, name: 'Carrots', quantity: 100, unit: 'grams' }
          ]}"
          onSortingDidChange="(by, dir) => sortedBy = (by && dir) ? by + ' | ' + dir : ''">
          <Column bindTo="name" canSort="true"/>
          <Column bindTo="quantity" canSort="true"/>
          <Column bindTo="unit" canSort="true"/>
        </Table>
      </App>
    `);

    await expect(page.getByTestId("sorted")).toHaveText("Table is sorted by:");

    await page.getByRole("columnheader", { name: "NAME" }).click();

    await expect(page.getByTestId("sorted")).toHaveText("Table is sorted by: name | ascending");
  });
});
