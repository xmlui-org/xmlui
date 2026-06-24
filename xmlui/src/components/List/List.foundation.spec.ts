import { test, expect } from "../../testing/fixtures";

test.describe("List foundation", () => {
  test("renders array of objects with child item template", async ({ initTestBed, page }) => {
    await initTestBed(`
      <List data="{[
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' }
      ]}">
        <Text>{$item.name}</Text>
      </List>
    `);
    await expect(page.getByText("Alpha")).toBeVisible();
    await expect(page.getByText("Beta")).toBeVisible();
  });

  test("items prop takes priority over data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <List data="{[{ id: 'a', name: 'Data' }]}" items="{[{ id: 'b', name: 'Items' }]}">
        <Text>{$item.name}</Text>
      </List>
    `);
    await expect(page.getByText("Items")).toBeVisible();
    await expect(page.getByText("Data")).toHaveCount(0);
  });

  test("supports limit and item context variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <List limit="{2}" data="{[
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
        { id: 'c', name: 'Gamma' }
      ]}">
        <Text>{$itemIndex}:{$item.name}:{$isFirst}:{$isLast}</Text>
      </List>
    `);
    await expect(page.getByText("0:Alpha:true:false")).toBeVisible();
    await expect(page.getByText("1:Beta:false:true")).toBeVisible();
    await expect(page.getByText("Gamma")).toHaveCount(0);
  });

  test("selection fires selectionDidChange", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <List
        rowsSelectable="{true}"
        data="{[
          { id: 'a', name: 'Alpha' },
          { id: 'b', name: 'Beta' }
        ]}"
        onSelectionDidChange="items => testState = items.length">
        <Text>{$item.name}:{$isSelected}</Text>
      </List>
    `);
    await page.getByText("Alpha:false").click();
    await expect.poll(testStateDriver.testState).toBe(1);
  });
});
