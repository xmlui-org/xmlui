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

    await page.locator("tbody input[type='checkbox']").first().check();
    await expect(page.getByTestId("selected")).toHaveText("Selected: 1");
  });
});
