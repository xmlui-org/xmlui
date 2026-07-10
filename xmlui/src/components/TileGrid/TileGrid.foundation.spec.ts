import { expect, test } from "../../testing/fixtures";

test.describe("TileGrid foundation", () => {
  test("renders data with item context and reacts to data mutation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.extra="{false}">
        <Button testId="add" onClick="extra = true">Add</Button>
        <TileGrid
          testId="grid"
          data="{extra ? [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' }
          ] : [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' }
          ]}"
          itemWidth="90px"
          itemHeight="40px"
          gap="6px">
          <Text>{$itemIndex}: {$item.label}</Text>
        </TileGrid>
      </App>
    `);

    await expect(page.getByText("0: Alpha")).toBeVisible();
    await expect(page.getByText("1: Beta")).toBeVisible();
    await page.getByTestId("add").click();
    await expect(page.getByText("2: Gamma")).toBeVisible();
    await expect(page.getByTestId("grid")).toHaveCSS("gap", "6px");
  });

  test("syncWithVar synchronizes selection across component instances", async ({ initTestBed, page }) => {
    await initTestBed(
      `
        <App global.selState="{{}}">
          <MyGrid />
          <Text testId="selection">Selection: {JSON.stringify(selState)}</Text>
          <MyGrid />
        </App>
      `,
      {
        components: [
          `
          <Component name="MyGrid">
            <TileGrid
              syncWithVar="selState"
              itemsSelectable="true"
              data="{[
                {id: 1, name: 'Apples'},
                {id: 2, name: 'Bananas'},
                {id: 3, name: 'Carrots'}
              ]}"
              itemWidth="120px"
              itemHeight="80px"
            >
              <VStack padding="8px" horizontalAlignment="center" verticalAlignment="center">
                <Text fontWeight="bold">{$item.name}</Text>
              </VStack>
            </TileGrid>
          </Component>
          `,
        ],
      },
    );

    const firstGrid = page.getByRole("grid").nth(0);
    const secondGrid = page.getByRole("grid").nth(1);

    await firstGrid.getByRole("checkbox", { name: "Select 1" }).click();
    await firstGrid.getByRole("checkbox", { name: "Select 2" }).click();

    await expect(page.getByTestId("selection")).toContainText('"selectedIds":[1,2]');
    await expect(firstGrid.getByRole("gridcell").nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(firstGrid.getByRole("gridcell").nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(secondGrid.getByRole("gridcell").nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(secondGrid.getByRole("gridcell").nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(secondGrid.getByRole("checkbox", { name: "Select 1" })).toBeChecked();
    await expect(secondGrid.getByRole("checkbox", { name: "Select 2" })).toBeChecked();
  });
});
