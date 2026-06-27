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

  test("api returns visible items and expands individual nodes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.visibleCount="{0}">
        <Tree
          id="treeApi"
          testId="tree"
          data="{[
            { id: 'root', name: 'Root' },
            { id: 'child', parentId: 'root', name: 'Child' }
          ]}" />
        <Button testId="countBefore" onClick="visibleCount = treeApi.getVisibleItems().length" />
        <Button testId="expand" onClick="treeApi.expandNode('root')" />
        <Button testId="countAfter" onClick="visibleCount = treeApi.getVisibleItems().length" />
        <Text testId="visibleCount">{visibleCount}</Text>
      </App>
    `);

    await page.getByTestId("countBefore").click();
    await expect(page.getByTestId("visibleCount")).toHaveText("1");
    await page.getByTestId("expand").click();
    await page.getByTestId("countAfter").click();
    await expect(page.getByTestId("visibleCount")).toHaveText("2");
  });

  test("replace APIs update flat tree data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App
        var.patch="{{ name: 'Renamed Child' }}"
        var.children="{[
          { id: 'new-a', name: 'New A' },
          { id: 'new-b', name: 'New B' }
        ]}">
        <Tree
          id="treeApi"
          testId="tree"
          defaultExpanded="all"
          data="{[
            { id: 'root', name: 'Root' },
            { id: 'child', parentId: 'root', name: 'Child' }
          ]}" />
        <Button testId="replaceNode" onClick="treeApi.replaceNode('child', patch)" />
        <Button testId="replaceChildren" onClick="treeApi.replaceChildren('root', children)" />
      </App>
    `);

    await page.getByTestId("replaceNode").click();
    await expect(page.getByRole("treeitem", { name: /Renamed Child/ })).toBeVisible();

    await page.getByTestId("replaceChildren").click();
    await expect(page.getByRole("treeitem", { name: /New A/ })).toBeVisible();
    await expect(page.getByRole("treeitem", { name: /New B/ })).toBeVisible();
    await expect(page.getByRole("treeitem", { name: /Renamed Child/ })).not.toBeVisible();
  });
});
