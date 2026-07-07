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

  test("keeps default item renderer with group header template only", async ({ initTestBed, page }) => {
    await initTestBed(`
      <List
        availableGroups="{['fruits', 'vegetables']}"
        groupBy="category"
        data="{[
          { id: 0, name: 'Apples', quantity: 5, category: 'fruits' },
          { id: 1, name: 'Carrots', quantity: 100, category: 'vegetables' },
          { id: 2, name: 'Milk', quantity: 10, category: 'dairy' }
        ]}">
        <property name="groupHeaderTemplate">
          <Stack>
            <Text variant="subtitle" value="{$group.key}" />
          </Stack>
        </property>
      </List>
    `);

    await expect(page.getByText("dairy")).toBeVisible();
    await expect(page.getByText("Milk")).toBeVisible();
    await expect(page.getByText("10", { exact: true })).toBeVisible();
    await expect(page.getByText("fruits")).toBeVisible();
    await expect(page.getByText("Apples")).toBeVisible();
    await expect(page.getByText("vegetables")).toBeVisible();
    await expect(page.getByText("Carrots")).toBeVisible();
  });

  test("hides empty default groups by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <List
        defaultGroups="{['dairy', 'meat', 'vegetables']}"
        groupBy="category"
        data="{[
          { id: 0, name: 'Apples', quantity: 5, category: 'fruits' },
          { id: 1, name: 'Carrots', quantity: 100, category: 'vegetables' },
          { id: 2, name: 'Milk', quantity: 10, category: 'dairy' }
        ]}">
        <property name="groupHeaderTemplate">
          <VStack>
            <Text variant="subtitle" value="{$group.key}" />
          </VStack>
        </property>
      </List>
    `);

    await expect(page.getByText("dairy")).toBeVisible();
    await expect(page.getByText("Milk")).toBeVisible();
    await expect(page.getByText("meat")).toHaveCount(0);
    await expect(page.getByText("vegetables")).toBeVisible();
    await expect(page.getByText("Carrots")).toBeVisible();
    await expect(page.getByText("fruits")).toBeVisible();
    await expect(page.getByText("Apples")).toBeVisible();
  });

  test("keeps overlay selection checkboxes inside card rows", async ({ initTestBed, page }) => {
    await initTestBed(`
      <List
        enableMultiRowSelection="true"
        data="{[
          { id: 0, name: 'Apples', category: 'fruits' },
          { id: 1, name: 'Bananas', category: 'fruits' },
          { id: 2, name: 'Carrots', category: 'vegetables' },
          { id: 3, name: 'Spinach', category: 'vegetables' }
        ]}"
        rowsSelectable="true"
        selectionCheckboxPosition="overlay"
        selectionCheckboxAnchor="bottom-left">
        <Card paddingLeft="36px" minHeight="50px">
          {$item.name}
        </Card>
      </List>
    `);

    const rows = page.locator("[data-list-item-type='ITEM']");
    await expect(rows).toHaveCount(4);
    await expect(page.locator("input[type='checkbox']")).toHaveCount(4);

    for (let index = 0; index < 4; index++) {
      const row = rows.nth(index);
      const checkbox = row.locator("input[type='checkbox']");
      await expect(checkbox).toBeVisible();
      const rowBox = await row.boundingBox();
      const checkboxBox = await checkbox.boundingBox();
      expect(rowBox).not.toBeNull();
      expect(checkboxBox).not.toBeNull();
      expect(checkboxBox!.x).toBeGreaterThanOrEqual(rowBox!.x);
      expect(checkboxBox!.y).toBeGreaterThanOrEqual(rowBox!.y);
      expect(checkboxBox!.x + checkboxBox!.width).toBeLessThanOrEqual(rowBox!.x + rowBox!.width);
      expect(checkboxBox!.y + checkboxBox!.height).toBeLessThanOrEqual(rowBox!.y + rowBox!.height);
    }
  });

  test("does not materialize empty syncWithVar selection on mount", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App global.selState="{{}}">
        <List
          syncWithVar="selState"
          rowsSelectable="true"
          enableMultiRowSelection="true"
          data="{[
            { id: 0, name: 'Apples', category: 'fruits' },
            { id: 1, name: 'Bananas', category: 'fruits' }
          ]}">
          <Text>{$item.name} - {$item.category}</Text>
        </List>
        <Text testId="selectionText">Selection: {JSON.stringify(selState)}</Text>
      </App>
    `);

    await expect(page.getByTestId("selectionText")).toHaveText("Selection: {}");
    await page.getByText("Apples - fruits").click();
    await expect(page.getByTestId("selectionText")).toContainText("selectedIds");
    await expect(page.getByTestId("selectionText")).toContainText("0");
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
