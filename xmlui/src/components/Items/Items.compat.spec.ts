import { expect, test } from "../../testing/fixtures";

test.describe("Items compatibility", () => {
  test("uses an anonymous DataSource as the data property value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Items>
        <property name="data">
          <DataSource mockData="{[
            { title: 'Latte' },
            { title: 'Cappuccino' }
          ]}" />
        </property>
        <Text testId="drink-{$itemIndex}">{$item.title}</Text>
      </Items>
    `);

    await expect(page.getByTestId("drink-0")).toContainText("Latte");
    await expect(page.getByTestId("drink-1")).toContainText("Cappuccino");
  });
});
