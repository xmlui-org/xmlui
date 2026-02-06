import { expect, test } from "../../testing/fixtures";

// Test data for flat format
const flatTreeData = [
  { id: 1, name: "Root", parentId: null, icon: "folder" },
  { id: 2, name: "Child 1", parentId: 1, icon: "file" },
  { id: 3, name: "Child 2", parentId: 1, icon: "file" },
  { id: 4, name: "Grandchild 1", parentId: 2, icon: "file" },
];

// Test data for hierarchy format
const hierarchyTreeData = [
  {
    id: 1,
    name: "Root",
    icon: "folder",
    children: [
      {
        id: 2,
        name: "Child 1",
        icon: "file",
        children: [
          { id: 4, name: "Grandchild 1", icon: "file", children: [] },
        ],
      },
      { id: 3, name: "Child 2", icon: "file", children: [] },
    ],
  },
];

// =============================================================================
// REPLACENODE API TESTS
// =============================================================================

test.describe("replaceNode API", () => {
  test.describe("Flat Data Format", () => {
    test("replaces node properties with merge semantics", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:icon:{$item.icon}" verticalAlignment="center">
                  <Icon name="{$item.icon}" />
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { name: 'Updated Child 1', icon: 'star' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, node should have original name and icon
      await expect(tree.getByTestId("2:icon:file")).toContainText("Child 1");

      // Replace node properties
      await replaceButton.click();

      // Node should have updated name and icon
      await expect(tree.getByTestId("2:icon:star")).toContainText("Updated Child 1");
    });

    test("preserves properties not specified in nodeData", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const dataWithCustomProps = [
        { id: 1, name: "Root", parentId: null, icon: "folder", customProp: "value1" },
        { id: 2, name: "Child 1", parentId: 1, icon: "file", customProp: "value2" },
      ];

      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(dataWithCustomProps)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                  <Text testId="custom-{$item.id}" value="{$item.customProp}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { name: 'Updated Child 1' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, node should have original custom property
      await expect(tree.getByTestId("custom-2")).toContainText("value2");

      // Replace node name only
      await replaceButton.click();

      // Node should have updated name but preserved custom property
      await expect(tree.getByTestId("2")).toContainText("Updated Child 1");
      await expect(tree.getByTestId("custom-2")).toContainText("value2");
    });

    test("preserves children when not specified in nodeData", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { name: 'Updated Child 1' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, parent and its child should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("4")).toBeVisible();

      // Replace parent node name
      await replaceButton.click();

      // Parent should have updated name and child should still be visible
      await expect(tree.getByTestId("2")).toContainText("Updated Child 1");
      await expect(tree.getByTestId("4")).toBeVisible();
    });

    test("preserves node ID", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { id: 999, name: 'Updated Child 1' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Replace node with different ID in nodeData
      await replaceButton.click();

      // Node should still have original ID (2), not the one from nodeData (999)
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("2")).toContainText("Updated Child 1");
      await expect(tree.getByTestId("999")).not.toBeVisible();
    });

    test("handles updating root node", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(1, { name: 'Updated Root' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Replace root node
      await replaceButton.click();

      // Root should have updated name
      await expect(tree.getByTestId("1")).toContainText("Updated Root");
      // Children should still be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("3")).toBeVisible();
    });
  });

  test.describe("Hierarchy Data Format", () => {
    test("replaces node properties with merge semantics", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:icon:{$item.icon}" verticalAlignment="center">
                  <Icon name="{$item.icon}" />
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { name: 'Updated Child 1', icon: 'star' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, node should have original name and icon
      await expect(tree.getByTestId("2:icon:file")).toContainText("Child 1");

      // Replace node properties
      await replaceButton.click();

      // Node should have updated name and icon
      await expect(tree.getByTestId("2:icon:star")).toContainText("Updated Child 1");
    });

    test("preserves children when not specified in nodeData", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { name: 'Updated Child 1' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, parent and its child should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("4")).toBeVisible();

      // Replace parent node name
      await replaceButton.click();

      // Parent should have updated name and child should still be visible
      await expect(tree.getByTestId("2")).toContainText("Updated Child 1");
      await expect(tree.getByTestId("4")).toBeVisible();
    });

    test("replaces children when specified in nodeData", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(2, { 
              name: 'Updated Child 1', 
              children: [
                { id: 5, name: 'New Grandchild', children: [] }
              ]
            });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, parent and original grandchild should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("4")).toBeVisible();

      // Replace parent node with new children
      await replaceButton.click();

      // Parent should have updated name
      await expect(tree.getByTestId("2")).toContainText("Updated Child 1");
      // Old grandchild should be gone
      await expect(tree.getByTestId("4")).not.toBeVisible();
      // New grandchild should be visible
      await expect(tree.getByTestId("5")).toBeVisible();
      await expect(tree.getByTestId("5")).toContainText("New Grandchild");
    });

    test("handles updating nested nodes", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceNode(4, { name: 'Updated Grandchild 1' });
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Replace deeply nested node
      await replaceButton.click();

      // Node should have updated name
      await expect(tree.getByTestId("4")).toContainText("Updated Grandchild 1");
      // Parent nodes should still be visible
      await expect(tree.getByTestId("1")).toBeVisible();
      await expect(tree.getByTestId("2")).toBeVisible();
    });
  });
});

// =============================================================================
// REPLACECHILDREN API TESTS
// =============================================================================

test.describe("replaceChildren API", () => {
  test.describe("Flat Data Format", () => {
    test("replaces all children of a node", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, [
              { id: 5, name: 'New Child 1', parentId: 1 },
              { id: 6, name: 'New Child 2', parentId: 1 }
            ]);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, original children should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("3")).toBeVisible();
      await expect(tree.getByTestId("4")).toBeVisible();

      // Replace children
      await replaceButton.click();

      // Old children should be gone
      await expect(tree.getByTestId("2")).not.toBeVisible();
      await expect(tree.getByTestId("3")).not.toBeVisible();
      await expect(tree.getByTestId("4")).not.toBeVisible();

      // New children should be visible
      await expect(tree.getByTestId("5")).toBeVisible();
      await expect(tree.getByTestId("6")).toBeVisible();
      await expect(tree.getByTestId("5")).toContainText("New Child 1");
      await expect(tree.getByTestId("6")).toContainText("New Child 2");
    });

    test("replaces children with empty array", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, []);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, children should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("3")).toBeVisible();

      // Replace with empty array
      await replaceButton.click();

      // All children should be gone
      await expect(tree.getByTestId("2")).not.toBeVisible();
      await expect(tree.getByTestId("3")).not.toBeVisible();
      await expect(tree.getByTestId("4")).not.toBeVisible();

      // Parent should still be visible
      await expect(tree.getByTestId("1")).toBeVisible();
    });

    test("removes all descendants including grandchildren", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, [
              { id: 5, name: 'New Child Only', parentId: 1 }
            ]);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, children and grandchildren should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("4")).toBeVisible();

      // Replace children
      await replaceButton.click();

      // All old children and grandchildren should be gone
      await expect(tree.getByTestId("2")).not.toBeVisible();
      await expect(tree.getByTestId("4")).not.toBeVisible();

      // New child should be visible
      await expect(tree.getByTestId("5")).toBeVisible();
    });

    test("preserves parent node properties", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Icon name="{$item.icon}" />
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, [
              { id: 5, name: 'New Child', icon: 'file', parentId: 1 }
            ]);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Replace children
      await replaceButton.click();

      // Parent should maintain its properties
      await expect(tree.getByTestId("1")).toContainText("Root");
      await expect(tree.getByTestId("1").locator('[data-icon-name="folder"]')).toBeVisible();
    });
  });

  test.describe("Hierarchy Data Format", () => {
    test("replaces all children of a node", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, [
              { id: 5, name: 'New Child 1', children: [] },
              { id: 6, name: 'New Child 2', children: [] }
            ]);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, original children should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("3")).toBeVisible();

      // Replace children
      await replaceButton.click();

      // Old children should be gone
      await expect(tree.getByTestId("2")).not.toBeVisible();
      await expect(tree.getByTestId("3")).not.toBeVisible();
      await expect(tree.getByTestId("4")).not.toBeVisible();

      // New children should be visible
      await expect(tree.getByTestId("5")).toBeVisible();
      await expect(tree.getByTestId("6")).toBeVisible();
      await expect(tree.getByTestId("5")).toContainText("New Child 1");
      await expect(tree.getByTestId("6")).toContainText("New Child 2");
    });

    test("replaces children with empty array", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, []);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, children should be visible
      await expect(tree.getByTestId("2")).toBeVisible();
      await expect(tree.getByTestId("3")).toBeVisible();

      // Replace with empty array
      await replaceButton.click();

      // All children should be gone
      await expect(tree.getByTestId("2")).not.toBeVisible();
      await expect(tree.getByTestId("3")).not.toBeVisible();

      // Parent should still be visible
      await expect(tree.getByTestId("1")).toBeVisible();
    });

    test("handles nested node children replacement", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(2, [
              { id: 7, name: 'New Grandchild 1', children: [] },
              { id: 8, name: 'New Grandchild 2', children: [] }
            ]);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Initially, original grandchild should be visible
      await expect(tree.getByTestId("4")).toBeVisible();

      // Replace children of nested node
      await replaceButton.click();

      // Old grandchild should be gone
      await expect(tree.getByTestId("4")).not.toBeVisible();

      // New grandchildren should be visible
      await expect(tree.getByTestId("7")).toBeVisible();
      await expect(tree.getByTestId("8")).toBeVisible();
      await expect(tree.getByTestId("7")).toContainText("New Grandchild 1");
      await expect(tree.getByTestId("8")).toContainText("New Grandchild 2");

      // Parent and grandparent should still be visible
      await expect(tree.getByTestId("1")).toBeVisible();
      await expect(tree.getByTestId("2")).toBeVisible();
    });

    test("new children can have their own children", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              defaultExpanded="all"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button testId="replace-btn" onClick="
            treeApi.replaceChildren(1, [
              { 
                id: 5, 
                name: 'New Child With Grandchildren', 
                children: [
                  { id: 7, name: 'New Grandchild', children: [] }
                ]
              }
            ]);
            treeApi.expandNode(5);
          " />
        </Fragment>
      `);

      const tree = await createTreeDriver("tree");
      const replaceButton = await createButtonDriver("replace-btn");

      // Replace children with nested structure
      await replaceButton.click();

      // New child and its child should both be visible
      await expect(tree.getByTestId("5")).toBeVisible();
      await expect(tree.getByTestId("7")).toBeVisible();
      await expect(tree.getByTestId("5")).toContainText("New Child With Grandchildren");
      await expect(tree.getByTestId("7")).toContainText("New Grandchild");
    });
  });
});
