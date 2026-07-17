import { expect, test } from "../../testing/fixtures";

test.describe("Items compatibility", () => {
  test("treats a string data property as an API-bound DataSource URL", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Items data="/api/drinks">
        <Text testId="drink-{$itemIndex}">{$item.title}</Text>
      </Items>
    `,
      {
        apiInterceptor: {
          operations: {
            "get-drinks": {
              url: "/api/drinks",
              method: "get",
              handler: `return [
                { title: "Latte" },
                { title: "Cappuccino" }
              ];`,
            },
          },
        },
      },
    );

    await expect(page.getByTestId("drink-0")).toContainText("Latte");
    await expect(page.getByTestId("drink-1")).toContainText("Cappuccino");
  });

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
