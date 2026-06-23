import { expect, test } from "../../testing/fixtures";

test.describe("Tree foundation", () => {
  test("renders hierarchy data and expands children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tree
        testId="tree"
        dataFormat="hierarchy"
        defaultExpanded="first-level"
        data="{[
          { id: 'root', name: 'Root', children: [
            { id: 'child', name: 'Child' }
          ] }
        ]}" />
    `);

    await expect(page.getByTestId("tree")).toContainText("Root");
    await expect(page.getByTestId("tree")).toContainText("Child");
  });

  test("selection updates app state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.selected="{'none'}">
        <Tree
          testId="tree"
          defaultExpanded="all"
          onSelectionDidChange="item => selected = item.name"
          data="{[
            { id: 'root', name: 'Root' },
            { id: 'child', parentId: 'root', name: 'Child' }
          ]}" />
        <Text testId="selected">Selected: {selected}</Text>
      </App>
    `);

    await page.getByRole("treeitem", { name: /Child/ }).click();
    await expect(page.getByTestId("selected")).toHaveText("Selected: Child");
  });
});
