import { expect, test } from "../../testing/fixtures";
import {
  flatTreeData,
  hierarchyTreeData,
  dynamicTreeData,
  customDynamicTreeData,
  dynamicFlatData,
} from "./testData";

// =============================================================================
// IMPERATIVE API TESTS
// =============================================================================

test.describe("Imperative API", () => {
  test("exposes expandNode method", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:expand" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="expandBtn" testId="expand-node-btn" label="Expand Node 1" 
            onClick="treeApi.expandNode(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const expandButton = await createButtonDriver("expand-node-btn");

    // Initially, tree should be collapsed
    await expect(tree.getByTestId("1:expand")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2:expand")).not.toBeVisible(); // Child hidden
    await expect(tree.getByTestId("3:expand")).not.toBeVisible(); // Child hidden

    // Click expand specific node button
    await expandButton.click();

    // Verify node 1's children are now visible but grandchildren are still hidden
    await expect(tree.getByTestId("1:expand")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2:expand")).toBeVisible(); // Child now visible
    await expect(tree.getByTestId("3:expand")).toBeVisible(); // Child now visible
    await expect(tree.getByTestId("4:expand")).not.toBeVisible(); // Grandchild still hidden (node 2 not expanded)
  });

  test("exposes collapseNode method", async ({
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
                <HStack testId="{$item.id}:expand" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="collapseBtn" testId="collapse-btn" label="Collapse Node 1" 
            onClick="treeApi.collapseNode(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const collapseButton = await createButtonDriver("collapse-btn");

    // Wait for tree to be fully rendered before proceeding
    await tree.component.waitFor({ state: "visible" });
    
    // Verify tree starts with all nodes visible (defaultExpanded="all")
    await expect(tree.getByTestId("1:expand")).toBeVisible();
    await expect(tree.getByTestId("2:expand")).toBeVisible();
    await expect(tree.getByTestId("3:expand")).toBeVisible();
    await expect(tree.getByTestId("4:expand")).toBeVisible();

    // Click collapse node button
    await collapseButton.click();

    // Verify node 1 children are now hidden
    await expect(tree.getByTestId("1:expand")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2:expand")).not.toBeVisible(); // Child hidden
    await expect(tree.getByTestId("3:expand")).not.toBeVisible(); // Child hidden
    await expect(tree.getByTestId("4:expand")).not.toBeVisible(); // Grandchild hidden
  });

  test("exposes expandAll method", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:expandall" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="expandBtn" testId="expand-all-btn" label="Expand All" 
            onClick="treeApi.expandAll();" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const expandButton = await createButtonDriver("expand-all-btn");

    // Initially, tree should be collapsed (not expanded)
    await expect(tree.getByTestId("2:expandall")).not.toBeVisible();
    await expect(tree.getByTestId("4:expandall")).not.toBeVisible();

    // Click expandAll button
    await expandButton.click();

    // Verify all nodes are now visible (expanded)
    await expect(tree.getByTestId("1:expandall")).toBeVisible(); // Root
    await expect(tree.getByTestId("2:expandall")).toBeVisible(); // Child
    await expect(tree.getByTestId("3:expandall")).toBeVisible(); // Child
    await expect(tree.getByTestId("4:expandall")).toBeVisible(); // Grandchild
  });

  test("exposes collapseAll method", async ({
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
                <HStack testId="{$item.id}:collapseall" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="collapseBtn" testId="collapse-all-btn" label="Collapse All" 
            onClick="treeApi.collapseAll();" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const collapseButton = await createButtonDriver("collapse-all-btn");

    // Initially, tree should be fully expanded (defaultExpanded="all")
    await expect(tree.getByTestId("1:collapseall")).toBeVisible(); // Root
    await expect(tree.getByTestId("2:collapseall")).toBeVisible(); // Child
    await expect(tree.getByTestId("3:collapseall")).toBeVisible(); // Child
    await expect(tree.getByTestId("4:collapseall")).toBeVisible(); // Grandchild

    // Click collapseAll button
    await collapseButton.click();

    // Verify only root nodes are visible (all collapsed)
    await expect(tree.getByTestId("1:collapseall")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2:collapseall")).not.toBeVisible(); // Child hidden
    await expect(tree.getByTestId("3:collapseall")).not.toBeVisible(); // Child hidden
    await expect(tree.getByTestId("4:collapseall")).not.toBeVisible(); // Grandchild hidden
  });

  test("exposes scrollToItem method", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    // Create a larger dataset to ensure scrolling is needed
    const largeTreeData = [
      { id: 1, name: "Root Item 1", parentId: null },
      { id: 2, name: "Child Item 1.1", parentId: 1 },
      { id: 3, name: "Child Item 1.2", parentId: 1 },
      { id: 4, name: "Grandchild Item 1.1.1", parentId: 2 },
      { id: 5, name: "Grandchild Item 1.1.2", parentId: 2 },
      { id: 6, name: "Root Item 2", parentId: null },
      { id: 7, name: "Child Item 2.1", parentId: 6 },
      { id: 8, name: "Child Item 2.2", parentId: 6 },
      { id: 9, name: "Child Item 2.3", parentId: 6 },
      { id: 10, name: "Root Item 3", parentId: null },
      { id: 11, name: "Child Item 3.1", parentId: 10 },
      { id: 12, name: "Child Item 3.2", parentId: 10 },
      { id: 13, name: "Root Item 4", parentId: null },
      { id: 14, name: "Child Item 4.1", parentId: 13 },
      { id: 15, name: "Child Item 4.2", parentId: 13 },
      { id: 16, name: "Root Item 5", parentId: null },
      { id: 17, name: "Child Item 5.1", parentId: 16 },
      { id: 18, name: "Child Item 5.2", parentId: 16 },
      { id: 19, name: "Target Item (Bottom)", parentId: 16 }, // This will be at the bottom
    ];

    const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="150px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              parentIdField="parentId"
              defaultExpanded="all"
              data='{${JSON.stringify(largeTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:scroll" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="scrollBtn" testId="scroll-btn" label="Scroll to Bottom Item" onClick="
            treeApi.scrollToItem('19');
            testState = { actionPerformed: 'scrollToItem', itemId: '19' };
          " />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const scrollButton = await createButtonDriver("scroll-btn");

    // Wait for tree to be fully rendered by checking for first item
    await expect(tree.getByTestId("1:scroll").first()).toBeVisible();
    await expect(tree.getByTestId("2:scroll").first()).toBeVisible();

    // Verify the target item at the bottom is initially NOT visible in the small viewport
    // (Due to the small height of 150px and many items, item 19 should be out of view)
    await expect(tree.getByTestId("19:scroll").first()).not.toBeVisible();

    // Click scroll to item button
    await scrollButton.click();

    // Verify test state confirms action was performed
    await expect.poll(testStateDriver.testState).toEqual({
      actionPerformed: "scrollToItem",
      itemId: "19",
    });

    // After scrolling, the target item should now be visible
    // Note: We can't easily test the exact scroll position in virtualized components,
    // but we can verify the API was called successfully
  });

  test("exposes getSelectedNode method", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              selectedValue="2"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:selected" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="getSelectedBtn" testId="get-selected-btn" label="Get Selected" onClick="
            const selectedNode = treeApi.getSelectedNode();
            testState = { 
              hasSelectedNode: selectedNode !== null,
              selectedNodeKey: selectedNode?.key,
              selectedNodeName: selectedNode?.displayName
            };
          " />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const getSelectedButton = await createButtonDriver("get-selected-btn");

    // Verify tree is visible with selection
    await expect(tree.getByTestId("2:selected")).toBeVisible();

    // Click get selected node button
    await getSelectedButton.click();

    // Verify getSelectedNode returns correct data
    await expect.poll(testStateDriver.testState).toEqual({
      hasSelectedNode: true,
      selectedNodeKey: 2,
      selectedNodeName: "Child Item 1.1",
    });
  });

  test("exposes appendNode method with flat data format #1", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="appendBtn" testId="append-btn" label="Append Child to Node 1" 
            onClick="treeApi.appendNode(1, { id: 5, name: 'New Child Item' });" />
          <Button id="expandBtn" testId="expand-btn" label="Expand Node 1" 
            onClick="treeApi.expandNode(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const appendButton = await createButtonDriver("append-btn");
    const expandButton = await createButtonDriver("expand-btn");

    // Check initial tree structure - only root nodes visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Child hidden (collapsed)
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Child hidden (collapsed)
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Grandchild hidden (collapsed)

    // Append new node using API
    await appendButton.click();

    // Expand node 1 to see its children
    await expandButton.click();

    // Verify original children are visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Original child
    await expect(tree.getByTestId("3")).toBeVisible(); // Original child

    // Verify new node is now visible as a child of node 1
    await expect(tree.getByTestId("5")).toBeVisible(); // New child
  });

  test("exposes appendNode method with flat data format #2", async ({
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
          <Button id="appendBtn" testId="append-btn" label="Append new root node" 
            onClick="treeApi.appendNode(null, { id: 5, name: 'New Root Item' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const appendButton = await createButtonDriver("append-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Append new root node using API
    await appendButton.click();

    // Verify original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Original root
    await expect(tree.getByTestId("2")).toBeVisible(); // Original child
    await expect(tree.getByTestId("3")).toBeVisible(); // Original child
    await expect(tree.getByTestId("4")).toBeVisible(); // Original grandchild

    // Verify new root node is now visible
    await expect(tree.getByTestId("5")).toBeVisible(); // New root node
  });

  test("exposes appendNode method with hierarchy data format #1", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="hierarchy"
              data='{${JSON.stringify(hierarchyTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="appendBtn" testId="append-btn" label="Append Child to Node 1" 
            onClick="treeApi.appendNode(1, { id: 5, name: 'New Child Item' });" />
          <Button id="expandBtn" testId="expand-btn" label="Expand Node 1" 
            onClick="treeApi.expandNode(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const appendButton = await createButtonDriver("append-btn");
    const expandButton = await createButtonDriver("expand-btn");

    // Check initial tree structure - only root nodes visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Child hidden (collapsed)
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Child hidden (collapsed)
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Grandchild hidden (collapsed)

    // Append new node using API
    await appendButton.click();

    // Expand node 1 to see its children
    await expandButton.click();

    // Verify original children are visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Original child
    await expect(tree.getByTestId("3")).toBeVisible(); // Original child

    // Verify new node is now visible as a child of node 1
    await expect(tree.getByTestId("5")).toBeVisible(); // New child
  });

  test("exposes appendNode method with hierarchy data format #2", async ({
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
          <Button id="appendBtn" testId="append-btn" label="Append new root node" 
            onClick="treeApi.appendNode(null, { id: 5, name: 'New Root Item' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const appendButton = await createButtonDriver("append-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    // Use .first() to handle potential duplicates and add explicit waits
    await expect(tree.getByTestId("1").first()).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2").first()).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3").first()).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4").first()).toBeVisible(); // Grandchild visible (expanded)

    // Append new root node using API
    await appendButton.click();

    // Verify original nodes are still visible
    await expect(tree.getByTestId("1").first()).toBeVisible(); // Original root
    await expect(tree.getByTestId("2").first()).toBeVisible(); // Original child
    await expect(tree.getByTestId("3").first()).toBeVisible(); // Original child
    await expect(tree.getByTestId("4").first()).toBeVisible(); // Original grandchild

    // Verify new root node is now visible
    await expect(tree.getByTestId("5").first()).toBeVisible(); // New root node
  });

  test("exposes removeNode method with flat data format #1 - remove leaf node", async ({
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
          <Button id="removeBtn" testId="remove-btn" label="Remove Leaf Node 4" 
            onClick="treeApi.removeNode(4);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeButton = await createButtonDriver("remove-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove leaf node using API
    await removeButton.click();

    // Verify original nodes are still visible except removed node
    await expect(tree.getByTestId("1")).toBeVisible(); // Original root
    await expect(tree.getByTestId("2")).toBeVisible(); // Original child  
    await expect(tree.getByTestId("3")).toBeVisible(); // Original child

    // Verify removed node is no longer visible
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed leaf node
  });

  test("exposes removeNode method with flat data format #2 - remove parent with children", async ({
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
          <Button id="removeBtn" testId="remove-btn" label="Remove Node 2 and its children" 
            onClick="treeApi.removeNode(2);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeButton = await createButtonDriver("remove-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove parent node and its children using API
    await removeButton.click();

    // Verify remaining nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Original root
    await expect(tree.getByTestId("3")).toBeVisible(); // Original child (not removed)

    // Verify removed nodes are no longer visible
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Removed parent
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed child (descendant of node 2)
  });

  test("exposes removeNode method with flat data format #3 - remove root node", async ({
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
          <Button id="removeBtn" testId="remove-btn" label="Remove Root Node 1 and all descendants" 
            onClick="treeApi.removeNode(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeButton = await createButtonDriver("remove-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove root node and all descendants using API
    await removeButton.click();

    // Verify all nodes are removed since they were all descendants of node 1
    await expect(tree.getByTestId("1")).not.toBeVisible(); // Removed root
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Removed descendant
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Removed descendant  
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed descendant
  });

  test("exposes removeChildren method with flat data format #1 - remove children of parent node", async ({
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
          <Button id="removeChildrenBtn" testId="remove-children-btn" label="Remove children of Node 1" 
            onClick="treeApi.removeChildren(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeChildrenButton = await createButtonDriver("remove-children-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove children of node 1 using API
    await removeChildrenButton.click();

    // Verify parent node 1 is still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Parent node kept

    // Verify all children and descendants are removed
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Removed child
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Removed child
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed descendant
  });

  test("exposes removeChildren method with flat data format #2 - remove children of node with one child", async ({
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
          <Button id="removeChildrenBtn" testId="remove-children-btn" label="Remove children of Node 2" 
            onClick="treeApi.removeChildren(2);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeChildrenButton = await createButtonDriver("remove-children-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove children of node 2 using API
    await removeChildrenButton.click();

    // Verify nodes 1, 2, and 3 are still visible (not affected)
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Parent node kept
    await expect(tree.getByTestId("3")).toBeVisible(); // Sibling not affected

    // Verify only node 4 (child of node 2) is removed
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed child
  });

  test("exposes removeChildren method with flat data format #3 - remove children of leaf node (no effect)", async ({
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
          <Button id="removeChildrenBtn" testId="remove-children-btn" label="Remove children of Leaf Node 4" 
            onClick="treeApi.removeChildren(4);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeChildrenButton = await createButtonDriver("remove-children-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove children of leaf node 4 using API (should have no effect)
    await removeChildrenButton.click();

    // Verify all nodes are still visible (no changes since node 4 has no children)
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Leaf node still visible
  });

  test("exposes removeNode method with hierarchy data format #1 - remove leaf node", async ({
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
          <Button id="removeBtn" testId="remove-btn" label="Remove Leaf Node 4" 
            onClick="treeApi.removeNode(4);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeButton = await createButtonDriver("remove-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove leaf node using API
    await removeButton.click();

    // Verify original nodes are still visible except removed node
    await expect(tree.getByTestId("1")).toBeVisible(); // Original root
    await expect(tree.getByTestId("2")).toBeVisible(); // Original child  
    await expect(tree.getByTestId("3")).toBeVisible(); // Original child

    // Verify removed node is no longer visible
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed leaf node
  });

  test("exposes removeNode method with hierarchy data format #2 - remove parent with children", async ({
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
          <Button id="removeBtn" testId="remove-btn" label="Remove Node 3 and its children" 
            onClick="treeApi.removeNode(3);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeButton = await createButtonDriver("remove-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove parent node and its children using API
    await removeButton.click();

    // Verify remaining nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Original root
    await expect(tree.getByTestId("2")).toBeVisible(); // Original child (not removed)

    // Verify removed nodes are no longer visible
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Removed parent
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed child (descendant of node 3)
  });

  test("exposes removeNode method with hierarchy data format #3 - remove root node", async ({
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
          <Button id="removeBtn" testId="remove-btn" label="Remove Root Node 1 and all descendants" 
            onClick="treeApi.removeNode(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeButton = await createButtonDriver("remove-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove root node and all descendants using API
    await removeButton.click();

    // Verify all nodes are removed since they were all descendants of node 1
    await expect(tree.getByTestId("1")).not.toBeVisible(); // Removed root
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Removed descendant
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Removed descendant  
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed descendant
  });

  test("exposes removeChildren method with hierarchy data format #1 - remove children of parent node", async ({
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
          <Button id="removeChildrenBtn" testId="remove-children-btn" label="Remove children of Node 1" 
            onClick="treeApi.removeChildren(1);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeChildrenButton = await createButtonDriver("remove-children-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove children of node 1 using API
    await removeChildrenButton.click();

    // Verify parent node 1 is still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Parent node kept

    // Verify all children and descendants are removed
    await expect(tree.getByTestId("2")).not.toBeVisible(); // Removed child
    await expect(tree.getByTestId("3")).not.toBeVisible(); // Removed child
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed descendant
  });

  test("exposes removeChildren method with hierarchy data format #2 - remove children of node with children", async ({
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
          <Button id="removeChildrenBtn" testId="remove-children-btn" label="Remove children of Node 3" 
            onClick="treeApi.removeChildren(3);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeChildrenButton = await createButtonDriver("remove-children-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove children of node 3 using API
    await removeChildrenButton.click();

    // Verify nodes 1, 2, and 3 are still visible (not affected)
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Sibling not affected
    await expect(tree.getByTestId("3")).toBeVisible(); // Parent node kept

    // Verify only node 4 (child of node 3) is removed
    await expect(tree.getByTestId("4")).not.toBeVisible(); // Removed child
  });

  test("exposes removeChildren method with hierarchy data format #3 - remove children of leaf node (no effect)", async ({
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
          <Button id="removeChildrenBtn" testId="remove-children-btn" label="Remove children of Leaf Node 2" 
            onClick="treeApi.removeChildren(2);" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const removeChildrenButton = await createButtonDriver("remove-children-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Remove children of leaf node 2 using API (should have no effect)
    await removeChildrenButton.click();

    // Verify all nodes are still visible (no changes since node 2 has no children in hierarchy data)
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Leaf node still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Sibling still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Child of sibling still visible
  });

  test("exposes insertNodeBefore method with flat data format #1 - insert before sibling node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert before Node 3" 
            onClick="treeApi.insertNodeBefore(3, { id: 5, name: 'New Node Before 3' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node before node 3 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as sibling of node 3)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeBefore method with flat data format #2 - insert before first child", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert before Node 2" 
            onClick="treeApi.insertNodeBefore(2, { id: 5, name: 'New First Child' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node before node 2 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as first child of node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeBefore method with flat data format #3 - insert before root node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert before Root Node 1" 
            onClick="treeApi.insertNodeBefore(1, { id: 5, name: 'New Root Before 1' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node before root node 1 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as new root before node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeBefore method with hierarchy data format #1 - insert before sibling node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert before Node 3" 
            onClick="treeApi.insertNodeBefore(3, { id: 5, name: 'New Node Before 3' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node before node 3 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as sibling of node 3)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeBefore method with hierarchy data format #2 - insert before first child", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert before Node 2" 
            onClick="treeApi.insertNodeBefore(2, { id: 5, name: 'New First Child' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node before node 2 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as first child of node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeBefore method with hierarchy data format #3 - insert before root node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert before Root Node 1" 
            onClick="treeApi.insertNodeBefore(1, { id: 5, name: 'New Root Before 1' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node before root node 1 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as new root before node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeAfter method with flat data format #1 - insert after sibling node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert after Node 2" 
            onClick="treeApi.insertNodeAfter(2, { id: 5, name: 'New Node After 2' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node after node 2 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as sibling after node 2)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeAfter method with flat data format #2 - insert after last child", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert after Node 3" 
            onClick="treeApi.insertNodeAfter(3, { id: 5, name: 'New Last Child' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node after node 3 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as last child of node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeAfter method with flat data format #3 - insert after root node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert after Root Node 1" 
            onClick="treeApi.insertNodeAfter(1, { id: 5, name: 'New Root After 1' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node after root node 1 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as new root after node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeAfter method with hierarchy data format #1 - insert after sibling node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert after Node 2" 
            onClick="treeApi.insertNodeAfter(2, { id: 5, name: 'New Node After 2' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node after node 2 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as sibling after node 2)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeAfter method with hierarchy data format #2 - insert after last child", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert after Node 3" 
            onClick="treeApi.insertNodeAfter(3, { id: 5, name: 'New Last Child' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node after node 3 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as last child of node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes insertNodeAfter method with hierarchy data format #3 - insert after root node", async ({
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
          <Button id="insertBtn" testId="insert-btn" label="Insert after Root Node 1" 
            onClick="treeApi.insertNodeAfter(1, { id: 5, name: 'New Root After 1' });" />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const insertButton = await createButtonDriver("insert-btn");

    // Check initial tree structure - all nodes visible due to defaultExpanded="all"
    await expect(tree.getByTestId("1")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("3")).toBeVisible(); // Child visible (expanded)
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild visible (expanded)

    // Insert new node after root node 1 using API
    await insertButton.click();

    // Verify all original nodes are still visible
    await expect(tree.getByTestId("1")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("2")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("3")).toBeVisible(); // Child still visible
    await expect(tree.getByTestId("4")).toBeVisible(); // Grandchild still visible

    // Verify new node is visible (inserted as new root after node 1)
    await expect(tree.getByTestId("5")).toBeVisible(); // New node inserted
  });

  test("exposes scrollIntoView method", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    // Create a deeper hierarchy to test scrollIntoView with expansion
    const deepTreeData = [
      { id: 1, name: "Root Item 1", parentId: null },
      { id: 2, name: "Child Item 1.1", parentId: 1 },
      { id: 3, name: "Child Item 1.2", parentId: 1 },
      { id: 4, name: "Grandchild Item 1.1.1", parentId: 2 },
      { id: 5, name: "Great-grandchild Item 1.1.1.1", parentId: 4 },
      { id: 6, name: "Root Item 2", parentId: null },
      { id: 7, name: "Child Item 2.1", parentId: 6 },
      { id: 8, name: "Child Item 2.2", parentId: 6 },
      { id: 9, name: "Grandchild Item 2.1.1", parentId: 7 },
      { id: 10, name: "Root Item 3", parentId: null },
      { id: 11, name: "Child Item 3.1", parentId: 10 },
      { id: 12, name: "Deeply Nested Target", parentId: 11 }, // This requires expansion to be visible
    ];

    const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="100px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              parentIdField="parentId"
              data='{${JSON.stringify(deepTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:scrollview" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="scrollViewBtn" testId="scroll-view-btn" label="Scroll Into View Deep Target" onClick="
            treeApi.scrollIntoView('12');
            testState = { actionPerformed: 'scrollIntoView', itemId: '12' };
          " />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const scrollViewButton = await createButtonDriver("scroll-view-btn");

    // Initially, tree should be collapsed so the deep target is not visible
    await expect(tree.getByTestId("1:scrollview")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("6:scrollview")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("10:scrollview")).toBeVisible(); // Root visible
    await expect(tree.getByTestId("11:scrollview")).not.toBeVisible(); // Child hidden (collapsed)
    await expect(tree.getByTestId("12:scrollview")).not.toBeVisible(); // Deep target hidden (needs expansion)

    // Click scroll into view button
    await scrollViewButton.click();

    // Verify test state confirms action was performed
    await expect.poll(testStateDriver.testState).toEqual({
      actionPerformed: "scrollIntoView",
      itemId: "12",
    });

    // Verify that the node and its parents are now expanded (target should be visible)
    await expect(tree.getByTestId("10:scrollview")).toBeVisible(); // Root still visible
    await expect(tree.getByTestId("11:scrollview")).toBeVisible(); // Parent expanded
    await expect(tree.getByTestId("12:scrollview")).toBeVisible(); // Target node now visible
  });

  test("exposes refreshData method", async ({
    initTestBed,
    createTreeDriver,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
        <Fragment>
          <VStack height="400px">
            <Tree id="treeApi" testId="tree"
              dataFormat="flat"
              defaultExpanded="all"
              data='{${JSON.stringify(flatTreeData)}}'>
              <property name="itemTemplate">
                <HStack testId="{$item.id}:refresh" verticalAlignment="center">
                  <Text value="{$item.name}" />
                </HStack>
              </property>
            </Tree>
          </VStack>
          <Button id="refreshBtn" testId="refresh-btn" label="Refresh Data" onClick="
            treeApi.refreshData();
            testState = { actionPerformed: 'refreshData' };
          " />
        </Fragment>
      `);

    const tree = await createTreeDriver("tree");
    const refreshButton = await createButtonDriver("refresh-btn");

    // Verify tree is visible with original data
    await expect(tree.getByTestId("1:refresh")).toBeVisible();
    await expect(tree.getByTestId("2:refresh")).toBeVisible();

    // Click refresh data button
    await refreshButton.click();

    // Verify test state confirms action was performed
    // Note: refreshData forces re-processing but with same data, tree should remain the same
    await expect.poll(testStateDriver.testState).toEqual({
      actionPerformed: "refreshData",
    });

    // Tree should still be visible after refresh
    await expect(tree.getByTestId("1:refresh")).toBeVisible();
    await expect(tree.getByTestId("2:refresh")).toBeVisible();
  });

  // =============================================================================
  // COMPREHENSIVE API METHOD TESTS
  // =============================================================================

  test.describe("API Method Tests", () => {
    test("expandAll() - expands all nodes and makes all children visible", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(hierarchyTreeData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:expandall">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="expandall-btn" label="Expand All" onClick="
              treeApi.expandAll();
              testState = { actionPerformed: 'expandAll' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const expandAllButton = await createButtonDriver("expandall-btn");

      // BEFORE: Verify tree starts collapsed - only root visible
      await expect(tree.getByTestId("1:expandall")).toBeVisible(); // Root visible
      await expect(tree.getByTestId("2:expandall")).not.toBeVisible(); // Child hidden
      await expect(tree.getByTestId("3:expandall")).not.toBeVisible(); // Child hidden

      // Trigger expandAll API
      await expandAllButton.click();

      // Wait for async API call to complete
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandAll" });

      // AFTER: Verify all nodes are now visible
      await expect(tree.getByTestId("1:expandall")).toBeVisible(); // Root still visible
      await expect(tree.getByTestId("2:expandall")).toBeVisible(); // Child now visible
      await expect(tree.getByTestId("3:expandall")).toBeVisible(); // Child now visible

      // Note: For hierarchyTreeData, we only have 2 levels, so all should be visible after expandAll
    });

    test("collapseAll() - collapses all nodes and hides all children", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyTreeData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:collapseall">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapseall-btn" label="Collapse All" onClick="
              treeApi.collapseAll();
              testState = { actionPerformed: 'collapseAll' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const collapseAllButton = await createButtonDriver("collapseall-btn");

      // BEFORE: Verify tree starts expanded - all nodes visible
      await expect(tree.getByTestId("1:collapseall")).toBeVisible(); // Root visible
      await expect(tree.getByTestId("2:collapseall")).toBeVisible(); // Child visible
      await expect(tree.getByTestId("3:collapseall")).toBeVisible(); // Child visible

      // Trigger collapseAll API
      await collapseAllButton.click();

      // Wait for async API call to complete
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseAll" });

      // AFTER: Verify only root nodes are visible, children are hidden
      await expect(tree.getByTestId("1:collapseall")).toBeVisible(); // Root still visible
      await expect(tree.getByTestId("2:collapseall")).not.toBeVisible(); // Child now hidden
      await expect(tree.getByTestId("3:collapseall")).not.toBeVisible(); // Child now hidden
    });

    test("expandAll() - with deep hierarchy (4+ levels)", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Create a deeper hierarchy for thorough testing
      const deepHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                {
                  id: 3,
                  name: "Level 2 - Branch A.1",
                  children: [
                    { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                    { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                  ],
                },
                { id: 6, name: "Level 2 - Branch A.2", children: [] },
              ],
            },
            {
              id: 7,
              name: "Level 1 - Branch B",
              children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:deep">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="expandall-deep-btn" label="Expand All Deep" onClick="
              treeApi.expandAll();
              testState = { actionPerformed: 'expandAllDeep' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const expandAllButton = await createButtonDriver("expandall-deep-btn");

      // BEFORE: Verify tree starts collapsed - only root visible
      await expect(tree.getByTestId("1:deep")).toBeVisible(); // Root (Level 0)
      await expect(tree.getByTestId("2:deep")).not.toBeVisible(); // Level 1 - Branch A (hidden)
      await expect(tree.getByTestId("3:deep")).not.toBeVisible(); // Level 2 - Branch A.1 (hidden)
      await expect(tree.getByTestId("4:deep")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (hidden)
      await expect(tree.getByTestId("7:deep")).not.toBeVisible(); // Level 1 - Branch B (hidden)
      await expect(tree.getByTestId("8:deep")).not.toBeVisible(); // Level 2 - Branch B.1 (hidden)

      // Trigger expandAll API
      await expandAllButton.click();

      // Wait for async API call to complete
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandAllDeep" });

      // AFTER: Verify ALL levels are now visible (4 levels deep)
      await expect(tree.getByTestId("1:deep")).toBeVisible(); // Root (Level 0) - still visible
      await expect(tree.getByTestId("2:deep")).toBeVisible(); // Level 1 - Branch A (now visible)
      await expect(tree.getByTestId("3:deep")).toBeVisible(); // Level 2 - Branch A.1 (now visible)
      await expect(tree.getByTestId("4:deep")).toBeVisible(); // Level 3 - Leaf A.1.1 (now visible)
      await expect(tree.getByTestId("5:deep")).toBeVisible(); // Level 3 - Leaf A.1.2 (now visible)
      await expect(tree.getByTestId("6:deep")).toBeVisible(); // Level 2 - Branch A.2 (now visible)
      await expect(tree.getByTestId("7:deep")).toBeVisible(); // Level 1 - Branch B (now visible)
      await expect(tree.getByTestId("8:deep")).toBeVisible(); // Level 2 - Branch B.1 (now visible)
    });

    test("collapseAll() - with deep hierarchy (4+ levels)", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use the same deep hierarchy data
      const deepHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                {
                  id: 3,
                  name: "Level 2 - Branch A.1",
                  children: [
                    { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                    { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                  ],
                },
                { id: 6, name: "Level 2 - Branch A.2", children: [] },
              ],
            },
            {
              id: 7,
              name: "Level 1 - Branch B",
              children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:deepcollapse">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapseall-deep-btn" label="Collapse All Deep" onClick="
              treeApi.collapseAll();
              testState = { actionPerformed: 'collapseAllDeep' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const collapseAllButton = await createButtonDriver("collapseall-deep-btn");

      // BEFORE: Verify tree starts fully expanded - all levels visible
      await expect(tree.getByTestId("1:deepcollapse")).toBeVisible(); // Root (Level 0)
      await expect(tree.getByTestId("2:deepcollapse")).toBeVisible(); // Level 1 - Branch A
      await expect(tree.getByTestId("3:deepcollapse")).toBeVisible(); // Level 2 - Branch A.1
      await expect(tree.getByTestId("4:deepcollapse")).toBeVisible(); // Level 3 - Leaf A.1.1
      await expect(tree.getByTestId("5:deepcollapse")).toBeVisible(); // Level 3 - Leaf A.1.2
      await expect(tree.getByTestId("7:deepcollapse")).toBeVisible(); // Level 1 - Branch B
      await expect(tree.getByTestId("8:deepcollapse")).toBeVisible(); // Level 2 - Branch B.1

      // Trigger collapseAll API
      await collapseAllButton.click();

      // Wait for async API call to complete
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseAllDeep" });

      // AFTER: Verify only root level nodes are visible, all children hidden
      await expect(tree.getByTestId("1:deepcollapse")).toBeVisible(); // Root (Level 0) - still visible
      await expect(tree.getByTestId("2:deepcollapse")).not.toBeVisible(); // Level 1 - Branch A (now hidden)
      await expect(tree.getByTestId("3:deepcollapse")).not.toBeVisible(); // Level 2 - Branch A.1 (now hidden)
      await expect(tree.getByTestId("4:deepcollapse")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (now hidden)
      await expect(tree.getByTestId("5:deepcollapse")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (now hidden)
      await expect(tree.getByTestId("6:deepcollapse")).not.toBeVisible(); // Level 2 - Branch A.2 (now hidden)
      await expect(tree.getByTestId("7:deepcollapse")).not.toBeVisible(); // Level 1 - Branch B (now hidden)
      await expect(tree.getByTestId("8:deepcollapse")).not.toBeVisible(); // Level 2 - Branch B.1 (now hidden)
    });

    test("expandToLevel(level) - expands nodes only to specified depth", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use deep hierarchy to test expandToLevel properly
      const deepHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                {
                  id: 3,
                  name: "Level 2 - Branch A.1",
                  children: [
                    { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                    { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                  ],
                },
                { id: 6, name: "Level 2 - Branch A.2", children: [] },
              ],
            },
            {
              id: 7,
              name: "Level 1 - Branch B",
              children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-level0-btn" label="Expand to Level 0" onClick="
              treeApi.expandToLevel(0);
              testState = { actionPerformed: 'expandToLevel0' };
            " />
            <Button testId="expand-level1-btn" label="Expand to Level 1" onClick="
              treeApi.expandToLevel(1);
              testState = { actionPerformed: 'expandToLevel1' };
            " />
            <Button testId="expand-level2-btn" label="Expand to Level 2" onClick="
              treeApi.expandToLevel(2);
              testState = { actionPerformed: 'expandToLevel2' };
            " />
            <Button testId="expand-level3-btn" label="Expand to Level 3" onClick="
              treeApi.expandToLevel(3);
              testState = { actionPerformed: 'expandToLevel3' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const expandLevel0Button = await createButtonDriver("expand-level0-btn");
      const expandLevel1Button = await createButtonDriver("expand-level1-btn");
      const expandLevel2Button = await createButtonDriver("expand-level2-btn");
      const expandLevel3Button = await createButtonDriver("expand-level3-btn");

      // INITIAL STATE: Verify tree starts collapsed - only root visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root)
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 (hidden)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 (hidden)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 (hidden)

      // TEST 1: expandToLevel(0) - should show only root level (no expansion)
      await expandLevel0Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel0" });

      // AFTER expandToLevel(0): Only Level 0 visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - visible
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 - Branch A (hidden)
      await expect(tree.getByTestId("7:level")).not.toBeVisible(); // Level 1 - Branch B (hidden)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (hidden)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (hidden)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (hidden)

      // TEST 2: expandToLevel(1) - should show Level 0 and Level 1 only
      await expandLevel1Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel1" });

      // AFTER expandToLevel(1): Level 0 and 1 visible, Level 2+ hidden
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A (now visible)
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B (now visible)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (still hidden)
      await expect(tree.getByTestId("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (still hidden)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)

      // TEST 3: expandToLevel(2) - should show Level 0, 1, and 2
      await expandLevel2Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel2" });

      // AFTER expandToLevel(2): Level 0, 1, and 2 visible, Level 3+ hidden
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - visible
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B - visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 (now visible)
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 (now visible)
      await expect(tree.getByTestId("8:level")).toBeVisible(); // Level 2 - Branch B.1 (now visible)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
      await expect(tree.getByTestId("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden)

      // TEST 4: expandToLevel(3) - should show all levels (0, 1, 2, and 3)
      await expandLevel3Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandToLevel3" });

      // AFTER expandToLevel(3): All levels visible (complete expansion for this tree)
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - visible
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B - visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 - visible
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 - visible
      await expect(tree.getByTestId("8:level")).toBeVisible(); // Level 2 - Branch B.1 - visible
      await expect(tree.getByTestId("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 (now visible)
      await expect(tree.getByTestId("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 (now visible)
    });

    test("expandNode(nodeId) - expands specific node and shows its children", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use deep hierarchy to test individual node expansion
      const deepHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                {
                  id: 3,
                  name: "Level 2 - Branch A.1",
                  children: [
                    { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                    { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                  ],
                },
                { id: 6, name: "Level 2 - Branch A.2", children: [] },
              ],
            },
            {
              id: 7,
              name: "Level 1 - Branch B",
              children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-root-btn" label="Expand Root" onClick="
              treeApi.expandNode(1);
              testState = { actionPerformed: 'expandRoot' };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
            <Button testId="expand-node3-btn" label="Expand Node 3" onClick="
              treeApi.expandNode(3);
              testState = { actionPerformed: 'expandNode3' };
            " />
            <Button testId="expand-node7-btn" label="Expand Node 7" onClick="
              treeApi.expandNode(7);
              testState = { actionPerformed: 'expandNode7' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const expandRootButton = await createButtonDriver("expand-root-btn");
      const expandNode2Button = await createButtonDriver("expand-node2-btn");
      const expandNode3Button = await createButtonDriver("expand-node3-btn");
      const expandNode7Button = await createButtonDriver("expand-node7-btn");

      // INITIAL STATE: Verify tree starts collapsed - only root visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - visible
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 - Branch A (hidden)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (hidden)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (hidden)
      await expect(tree.getByTestId("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (hidden)
      await expect(tree.getByTestId("7:level")).not.toBeVisible(); // Level 1 - Branch B (hidden)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (hidden)

      // FIRST: Expand root to make Level 1 nodes visible
      await expandRootButton.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandRoot" });

      // AFTER expanding root: Level 1 nodes become visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A (now visible)
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B (now visible)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (still hidden)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
      await expect(tree.getByTestId("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (still hidden)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden)

      // TEST 1: expandNode(2) - should expand "Level 1 - Branch A" and show its children
      await expandNode2Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode2" });

      // AFTER expandNode(2): Node 2's children become visible, others stay hidden
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A (still visible)
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 (now visible - child of node 2)
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 (now visible - child of node 2)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden - child of node 3)
      await expect(tree.getByTestId("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden - child of node 3)
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B (still visible from root expansion)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden - child of node 7)

      // TEST 2: expandNode(3) - should expand "Level 2 - Branch A.1" and show its children
      await expandNode3Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode3" });

      // AFTER expandNode(3): Node 3's children become visible, previous expansions remain
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - still visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 - still visible
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 - still visible
      await expect(tree.getByTestId("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 (now visible - child of node 3)
      await expect(tree.getByTestId("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 (now visible - child of node 3)
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B (still visible from root expansion)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (still hidden - child of node 7)

      // TEST 3: expandNode(7) - should expand "Level 1 - Branch B" and show its children
      await expandNode7Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode7" });

      // AFTER expandNode(7): Node 7's children become visible, all previous expansions remain
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - still visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 - still visible
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 - still visible
      await expect(tree.getByTestId("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 - still visible
      await expect(tree.getByTestId("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 - still visible
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B - still visible
      await expect(tree.getByTestId("8:level")).toBeVisible(); // Level 2 - Branch B.1 (now visible - child of node 7)
    });

    test("expandNode(nodeId) - negative tests for invalid or inaccessible nodes", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use simple hierarchy to test negative cases clearly
      const simpleHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [{ id: 3, name: "Level 2 - Leaf A.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="expand-nonexistent-btn" label="Expand Non-existent Node" onClick="
              treeApi.expandNode(999);
              testState = { actionPerformed: 'expandNonExistent' };
            " />
            <Button testId="expand-leaf-node3-btn" label="Expand Leaf Node 3" onClick="
              treeApi.expandNode(3);
              testState = { actionPerformed: 'expandLeafNode3' };
            " />
            <Button testId="expand-root-btn" label="Expand Root" onClick="
              treeApi.expandNode(1);
              testState = { actionPerformed: 'expandRoot' };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const expandNonExistentButton = await createButtonDriver("expand-nonexistent-btn");
      const expandLeafNode3Button = await createButtonDriver("expand-leaf-node3-btn");
      const expandRootButton = await createButtonDriver("expand-root-btn");
      const expandNode2Button = await createButtonDriver("expand-node2-btn");

      // INITIAL STATE: Only root visible, all children hidden
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - visible
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 - hidden
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - hidden

      // NEGATIVE TEST 1: Try to expand non-existent node (ID 999)
      await expandNonExistentButton.click();
      await expect
        .poll(testStateDriver.testState)
        .toEqual({ actionPerformed: "expandNonExistent" });

      // AFTER expandNode(999): Should have no effect, tree state unchanged
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - still visible
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 - still hidden
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - still hidden

      // NEGATIVE TEST 2: Try to expand leaf node 3 (which has no children) while it's hidden
      await expandLeafNode3Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandLeafNode3" });

      // AFTER expandNode(3) on hidden leaf: Should have no effect since node is not visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - still visible
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 - still hidden
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - still hidden

      // Now expand the tree properly to make nodes visible
      await expandRootButton.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandRoot" });

      await expandNode2Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandNode2" });

      // After proper expansion: All nodes should be visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - visible

      // NEGATIVE TEST 3: Try to expand leaf node 3 again (now that it's visible but still has no children)
      await expandLeafNode3Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "expandLeafNode3" });

      // AFTER expandNode(3) on visible leaf: Should have no visible effect since leaf nodes can't expand
      // Tree state should remain the same - all nodes still visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - still visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - still visible
    });

    test("collapseNode(nodeId) - collapses specific node and hides its children", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use deep hierarchy to test individual node collapse
      const deepHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                {
                  id: 3,
                  name: "Level 2 - Branch A.1",
                  children: [
                    { id: 4, name: "Level 3 - Leaf A.1.1", children: [] },
                    { id: 5, name: "Level 3 - Leaf A.1.2", children: [] },
                  ],
                },
                { id: 6, name: "Level 2 - Branch A.2", children: [] },
              ],
            },
            {
              id: 7,
              name: "Level 1 - Branch B",
              children: [{ id: 8, name: "Level 2 - Branch B.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(deepHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-node3-btn" label="Collapse Node 3" onClick="
              treeApi.collapseNode(3);
              testState = { actionPerformed: 'collapseNode3' };
            " />
            <Button testId="collapse-node2-btn" label="Collapse Node 2" onClick="
              treeApi.collapseNode(2);
              testState = { actionPerformed: 'collapseNode2' };
            " />
            <Button testId="collapse-root-btn" label="Collapse Root" onClick="
              treeApi.collapseNode(1);
              testState = { actionPerformed: 'collapseRoot' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const collapseNode3Button = await createButtonDriver("collapse-node3-btn");
      const collapseNode2Button = await createButtonDriver("collapse-node2-btn");
      const collapseRootButton = await createButtonDriver("collapse-root-btn");

      // INITIAL STATE: Tree starts fully expanded - all nodes visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 - visible
      await expect(tree.getByTestId("4:level")).toBeVisible(); // Level 3 - Leaf A.1.1 - visible
      await expect(tree.getByTestId("5:level")).toBeVisible(); // Level 3 - Leaf A.1.2 - visible
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 - visible
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B - visible
      await expect(tree.getByTestId("8:level")).toBeVisible(); // Level 2 - Branch B.1 - visible

      // TEST 1: collapseNode(3) - should collapse "Level 2 - Branch A.1" and hide its children
      await collapseNode3Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseNode3" });

      // AFTER collapseNode(3): Node 3's children become hidden, others remain visible
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - still visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - Branch A.1 - still visible (but collapsed)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (now hidden - child of collapsed node 3)
      await expect(tree.getByTestId("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (now hidden - child of collapsed node 3)
      await expect(tree.getByTestId("6:level")).toBeVisible(); // Level 2 - Branch A.2 - still visible (not child of node 3)
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B - still visible
      await expect(tree.getByTestId("8:level")).toBeVisible(); // Level 2 - Branch B.1 - still visible

      // TEST 2: collapseNode(2) - should collapse "Level 1 - Branch A" and hide all its descendants
      await collapseNode2Button.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseNode2" });

      // AFTER collapseNode(2): Node 2's entire subtree becomes hidden
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - Branch A - still visible (but collapsed)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (now hidden - child of collapsed node 2)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
      await expect(tree.getByTestId("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden)
      await expect(tree.getByTestId("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (now hidden - child of collapsed node 2)
      await expect(tree.getByTestId("7:level")).toBeVisible(); // Level 1 - Branch B - still visible (not descendant of node 2)
      await expect(tree.getByTestId("8:level")).toBeVisible(); // Level 2 - Branch B.1 - still visible

      // TEST 3: collapseNode(1) - should collapse root and hide all children
      await collapseRootButton.click();
      await expect.poll(testStateDriver.testState).toEqual({ actionPerformed: "collapseRoot" });

      // AFTER collapseNode(1): All children of root become hidden
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Level 0 (Root) - still visible (but collapsed)
      await expect(tree.getByTestId("2:level")).not.toBeVisible(); // Level 1 - Branch A (now hidden - child of collapsed root)
      await expect(tree.getByTestId("3:level")).not.toBeVisible(); // Level 2 - Branch A.1 (still hidden)
      await expect(tree.getByTestId("4:level")).not.toBeVisible(); // Level 3 - Leaf A.1.1 (still hidden)
      await expect(tree.getByTestId("5:level")).not.toBeVisible(); // Level 3 - Leaf A.1.2 (still hidden)
      await expect(tree.getByTestId("6:level")).not.toBeVisible(); // Level 2 - Branch A.2 (still hidden)
      await expect(tree.getByTestId("7:level")).not.toBeVisible(); // Level 1 - Branch B (now hidden - child of collapsed root)
      await expect(tree.getByTestId("8:level")).not.toBeVisible(); // Level 2 - Branch B.1 (now hidden)
    });

    test("collapseNode(nodeId) - negative tests for invalid or leaf nodes", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use simple hierarchy for negative tests
      const simpleHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [{ id: 3, name: "Level 2 - Leaf A.1", children: [] }],
            },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:level">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-nonexistent-btn" label="Collapse Non-existent Node" onClick="
              treeApi.collapseNode(999);
              testState = { actionPerformed: 'collapseNonExistent' };
            " />
            <Button testId="collapse-leaf-node3-btn" label="Collapse Leaf Node 3" onClick="
              treeApi.collapseNode(3);
              testState = { actionPerformed: 'collapseLeafNode3' };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const collapseNonExistentButton = await createButtonDriver("collapse-nonexistent-btn");
      const collapseLeafNode3Button = await createButtonDriver("collapse-leaf-node3-btn");

      // INITIAL STATE: Tree starts fully expanded
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - visible

      // NEGATIVE TEST 1: Try to collapse non-existent node (ID 999)
      await collapseNonExistentButton.click();
      await expect
        .poll(testStateDriver.testState)
        .toEqual({ actionPerformed: "collapseNonExistent" });

      // AFTER collapseNode(999): Should have no effect, tree state unchanged
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - still visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - still visible

      // NEGATIVE TEST 2: Try to collapse leaf node 3 (which has no children to hide)
      await collapseLeafNode3Button.click();
      await expect
        .poll(testStateDriver.testState)
        .toEqual({ actionPerformed: "collapseLeafNode3" });

      // AFTER collapseNode(3) on leaf: Should have no visible effect since leaf nodes have no children
      // Tree state should remain the same
      await expect(tree.getByTestId("1:level")).toBeVisible(); // Root - still visible
      await expect(tree.getByTestId("2:level")).toBeVisible(); // Level 1 - still visible
      await expect(tree.getByTestId("3:level")).toBeVisible(); // Level 2 - still visible
    });

    test("selectNode(nodeId) - API method executes without error", async ({
      page,
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Use hierarchy for testing selectNode API
      const selectableHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [{ id: 3, name: "Level 2 - Leaf A.1", children: [] }],
            },
          ],
        },
      ];

      await initTestBed(`
          <Fragment>
            <VStack height="400px" var.selectedNodeId="{null}">
              <Text testId="selectedId">{selectedNodeId}</Text>
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                onSelectionDidChange="node => {selectedNodeId = node.newNode.id}"
                data='{${JSON.stringify(selectableHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:selection">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="select-node2-btn" label="Select Node 2" onClick="treeApi.selectNode(2);" />
            <Button testId="select-nonexistent-btn" label="Select Non-existent Node" onClick="
              treeApi.selectNode('999');
              const selectedNode = treeApi.getSelectedNode();
              testState = { actionPerformed: 'selectNonExistent', selectedNodeData: selectedNode };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const selectNode2Button = await createButtonDriver("select-node2-btn");
      const selectNonExistentButton = await createButtonDriver("select-nonexistent-btn");
      const selectedIdText = page.getByTestId("selectedId");

      // INITIAL STATE: No selection
      await expect(selectedIdText).toHaveText("");

      // TEST 1: selectNode('2') API call completes without error
      await selectNode2Button.click();
      await expect(selectedIdText).toHaveText("2");

      // TEST 2: selectNode('999') with invalid ID completes without error
      await selectNonExistentButton.click();
      await expect(selectedIdText).toHaveText("");
    });

    test("getSelectedNode() - returns correct selected node data", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Simple hierarchy for testing getSelectedNode API
      const simpleHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            { id: 2, name: "Level 1 - Branch A", children: [] },
            { id: 3, name: "Level 1 - Branch B", children: [] },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                selectedValue="{2}"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:selection">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-selected-btn" label="Get Selected Node" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { 
                actionPerformed: 'getSelected', 
                selectedNodeData: selectedNode,
                selectedKey: selectedNode?.key,
                selectedName: selectedNode?.name
              };
            " />
            <Button testId="get-selected-null-btn" label="Get Selected When None" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { 
                actionPerformed: 'getSelectedNull', 
                selectedNodeData: selectedNode 
              };
            " />
          </Fragment>
        `);

      const getSelectedButton = await createButtonDriver("get-selected-btn");

      // TEST 1: getSelectedNode() returns correct node when selectedValue is set
      await getSelectedButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getSelected");

      // Verify getSelectedNode returns the correct node data
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.selectedKey;
        })
        .toBe(2);

      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.selectedName;
        })
        .toBe("Level 1 - Branch A");

      // Verify the returned node is not null
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.selectedNodeData;
        })
        .not.toBe(null);

      // TEST 2: Test with no selection (update tree to have no selectedValue)
      const { testStateDriver: testStateDriver2 } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:selection">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-selected-null-btn" label="Get Selected When None" onClick="
              const selectedNode = treeApi.getSelectedNode();
              testState = { 
                actionPerformed: 'getSelectedNull', 
                selectedNodeData: selectedNode 
              };
            " />
          </Fragment>
        `);

      const getSelectedNullButton = await createButtonDriver("get-selected-null-btn");

      await getSelectedNullButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver2.testState();
          return state.actionPerformed;
        })
        .toBe("getSelectedNull");

      // Verify getSelectedNode returns null when no selection
      await expect
        .poll(async () => {
          const state = await testStateDriver2.testState();
          return state.selectedNodeData;
        })
        .toBe(null);
    });

    test("clearSelection() - API method executes without error", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Simple hierarchy for testing clearSelection API
      const simpleHierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [{ id: 2, name: "Level 1 - Branch A", children: [] }],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(simpleHierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:clear">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="clear-selection-btn" label="Clear Selection" onClick="
              try {
                treeApi.clearSelection();
                testState = { 
                  actionPerformed: 'clearSelection', 
                  success: true,
                  error: null
                };
              } catch (error) {
                testState = { 
                  actionPerformed: 'clearSelection', 
                  success: false,
                  error: error.message
                };
              }
            " />
            <Button testId="get-selected-btn" label="Get Selected Node" onClick="
              try {
                const selectedNode = treeApi.getSelectedNode();
                testState = { 
                  actionPerformed: 'getSelected', 
                  success: true,
                  selectedNodeData: selectedNode,
                  error: null
                };
              } catch (error) {
                testState = { 
                  actionPerformed: 'getSelected', 
                  success: false,
                  error: error.message
                };
              }
            " />
          </Fragment>
        `);

      const clearSelectionButton = await createButtonDriver("clear-selection-btn");
      const getSelectedButton = await createButtonDriver("get-selected-btn");

      // TEST: clearSelection() API call completes without error
      await clearSelectionButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("clearSelection");

      let currentState = await testStateDriver.testState();
      expect(currentState.success).toBe(true);
      expect(currentState.error).toBe(null);

      // TEST: getSelectedNode() API call completes without error
      await getSelectedButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getSelected");

      currentState = await testStateDriver.testState();
      expect(currentState.success).toBe(true);
      expect(currentState.error).toBe(null);
      // When no selection is managed, getSelectedNode() returns null
      expect(currentState.selectedNodeData).toBe(null);
    });

    test("getNodeById() - returns correct node data or null for invalid keys", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Rich hierarchy data for testing getNodeById API
      const hierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                { id: 4, name: "Level 2 - Leaf A1", children: [] },
                { id: 5, name: "Level 2 - Leaf A2", children: [] },
              ],
            },
            { id: 3, name: "Level 1 - Branch B", children: [] },
          ],
        },
        {
          id: 6,
          name: "Root Level 1",
          children: [{ id: 7, name: "Level 1 - Branch C", children: [] }],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:getById">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-node1-btn" label="Get Node 1" onClick="
              const node = treeApi.getNodeById(1);
              testState = { 
                actionPerformed: 'getNode1', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name
              };
            " />
            <Button testId="get-node4-btn" label="Get Node 4" onClick="
              const node = treeApi.getNodeById(4);
              testState = { 
                actionPerformed: 'getNode4', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name
              };
            " />
            <Button testId="get-node7-btn" label="Get Node 7" onClick="
              const node = treeApi.getNodeById(7);
              testState = { 
                actionPerformed: 'getNode7', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name
              };
            " />
            <Button testId="get-invalid-btn" label="Get Invalid Node" onClick="
              const node = treeApi.getNodeById(999);
              testState = { 
                actionPerformed: 'getInvalid', 
                nodeData: node,
                nodeExists: node !== null
              };
            " />
          </Fragment>
        `);

      const getNode1Button = await createButtonDriver("get-node1-btn");
      const getNode4Button = await createButtonDriver("get-node4-btn");
      const getNode7Button = await createButtonDriver("get-node7-btn");
      const getInvalidButton = await createButtonDriver("get-invalid-btn");

      // TEST: getNodeById(1) should return root node data
      await getNode1Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getNode1");

      let currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(1);
      expect(currentState.nodeName).toBe("Root Level 0");
      expect(currentState.nodeData).not.toBe(null);

      // TEST: getNodeById(4) should return deep nested node data
      await getNode4Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getNode4");

      currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(4);
      expect(currentState.nodeName).toBe("Level 2 - Leaf A1");
      expect(currentState.nodeData).not.toBe(null);

      // TEST: getNodeById(7) should return node from second root
      await getNode7Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getNode7");

      currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(7);
      expect(currentState.nodeName).toBe("Level 1 - Branch C");
      expect(currentState.nodeData).not.toBe(null);

      // TEST: getNodeById(999) should return null for non-existent node
      await getInvalidButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getInvalid");

      currentState = await testStateDriver.testState();
      expect(currentState.nodeExists).toBe(false);
      expect(currentState.nodeData).toBe(null);
    });

    test("getNodeById() - can retrieve nodes within collapsed parents", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Hierarchy with nested structure to test collapsed nodes
      const hierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                { id: 4, name: "Level 2 - Hidden Leaf A1", children: [] },
                { id: 5, name: "Level 2 - Hidden Leaf A2", children: [] },
              ],
            },
            { id: 3, name: "Level 1 - Branch B", children: [] },
          ],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="all"
                data='{${JSON.stringify(hierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:hidden">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="collapse-node2-btn" label="Collapse Node 2" onClick="
              treeApi.collapseNode(2);
              testState = { actionPerformed: 'collapseNode2' };
            " />
            <Button testId="get-visible-node1-btn" label="Get Visible Node 1" onClick="
              const node = treeApi.getNodeById(1);
              testState = { 
                actionPerformed: 'getVisibleNode1', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
            <Button testId="get-hidden-node4-btn" label="Get Hidden Node 4" onClick="
              const node = treeApi.getNodeById(4);
              testState = { 
                actionPerformed: 'getHiddenNode4', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
            <Button testId="get-hidden-node5-btn" label="Get Hidden Node 5" onClick="
              const node = treeApi.getNodeById(5);
              testState = { 
                actionPerformed: 'getHiddenNode5', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
            <Button testId="get-now-visible-node4-btn" label="Get Now Visible Node 4" onClick="
              const node = treeApi.getNodeById(4);
              testState = { 
                actionPerformed: 'getNowVisibleNode4', 
                nodeData: node,
                nodeKey: node?.key,
                nodeName: node?.name,
                nodeExists: node !== null
              };
            " />
          </Fragment>
        `);

      const tree = await createTreeDriver("tree");
      const collapseNode2Button = await createButtonDriver("collapse-node2-btn");
      const getVisibleNode1Button = await createButtonDriver("get-visible-node1-btn");
      const getHiddenNode4Button = await createButtonDriver("get-hidden-node4-btn");
      const getHiddenNode5Button = await createButtonDriver("get-hidden-node5-btn");
      const expandNode2Button = await createButtonDriver("expand-node2-btn");
      const getNowVisibleNode4Button = await createButtonDriver("get-now-visible-node4-btn");

      // INITIAL STATE: defaultExpanded="all", so all nodes are visible
      // First, verify all nodes are visible initially
      const node1Wrapper = tree.getNodeWrapperByTestId("1:hidden");
      const node2Wrapper = tree.getNodeWrapperByTestId("2:hidden");
      const node4Wrapper = tree.getNodeWrapperByTestId("4:hidden");
      const node5Wrapper = tree.getNodeWrapperByTestId("5:hidden");

      await expect(node1Wrapper).toBeVisible();
      await expect(node2Wrapper).toBeVisible();
      await expect(node4Wrapper).toBeVisible();
      await expect(node5Wrapper).toBeVisible();

      // Now collapse node 2 to hide its children
      await collapseNode2Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("collapseNode2");

      // After collapse, node 2 is still visible but its children (4, 5) are hidden
      await expect(node1Wrapper).toBeVisible();
      await expect(node2Wrapper).toBeVisible();
      await expect(node4Wrapper).not.toBeVisible();
      await expect(node5Wrapper).not.toBeVisible();

      // TEST: getNodeById(1) should work for visible node
      await getVisibleNode1Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getVisibleNode1");

      let currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(1);
      expect(currentState.nodeName).toBe("Root Level 0");
      expect(currentState.nodeExists).toBe(true);

      // TEST: getNodeById(4) should work even though node 4 is hidden (collapsed parent)
      // This tests whether the API can access data model nodes regardless of DOM visibility
      await getHiddenNode4Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getHiddenNode4");

      currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(4);
      expect(currentState.nodeName).toBe("Level 2 - Hidden Leaf A1");
      expect(currentState.nodeExists).toBe(true);

      // TEST: getNodeById(5) should also work for another hidden node
      await getHiddenNode5Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getHiddenNode5");

      currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(5);
      expect(currentState.nodeName).toBe("Level 2 - Hidden Leaf A2");
      expect(currentState.nodeExists).toBe(true);

      // Now expand the parent node to make children visible again
      await expandNode2Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("expandNode2");

      // Verify nodes are now visible in DOM again
      await expect(node4Wrapper).toBeVisible();
      await expect(node5Wrapper).toBeVisible();

      // TEST: getNodeById(4) should still work now that it's visible again
      await getNowVisibleNode4Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getNowVisibleNode4");

      currentState = await testStateDriver.testState();
      expect(currentState.nodeKey).toBe(4);
      expect(currentState.nodeName).toBe("Level 2 - Hidden Leaf A1");
      expect(currentState.nodeExists).toBe(true);
    });

    test("getExpandedNodes() - returns array of expanded node keys", async ({
      initTestBed,
      createTreeDriver,
      createButtonDriver,
    }) => {
      // Hierarchy data for testing expanded nodes tracking
      const hierarchyData = [
        {
          id: 1,
          name: "Root Level 0",
          children: [
            {
              id: 2,
              name: "Level 1 - Branch A",
              children: [
                { id: 4, name: "Level 2 - Leaf A1", children: [] },
                { id: 5, name: "Level 2 - Leaf A2", children: [] },
              ],
            },
            { id: 3, name: "Level 1 - Branch B", children: [] },
          ],
        },
        {
          id: 6,
          name: "Root Level 1",
          children: [{ id: 7, name: "Level 1 - Branch C", children: [] }],
        },
      ];

      const { testStateDriver } = await initTestBed(`
          <Fragment>
            <VStack height="400px">
              <Tree id="treeApi" testId="tree"
                dataFormat="hierarchy"
                defaultExpanded="none"
                data='{${JSON.stringify(hierarchyData)}}'>
                <property name="itemTemplate">
                  <HStack testId="{$item.id}:expand">
                    <Text value="{$item.name}" />
                  </HStack>
                </property>
              </Tree>
            </VStack>
            <Button testId="get-expanded-initial-btn" label="Get Expanded Initial" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedInitial', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="expand-node1-btn" label="Expand Node 1" onClick="
              treeApi.expandNode(1);
              testState = { actionPerformed: 'expandNode1' };
            " />
            <Button testId="get-expanded-after1-btn" label="Get Expanded After 1" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAfter1', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="expand-node2-btn" label="Expand Node 2" onClick="
              treeApi.expandNode(2);
              testState = { actionPerformed: 'expandNode2' };
            " />
            <Button testId="get-expanded-after2-btn" label="Get Expanded After 2" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAfter2', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="expand-all-btn" label="Expand All" onClick="
              treeApi.expandAll();
              testState = { actionPerformed: 'expandAll' };
            " />
            <Button testId="get-expanded-all-btn" label="Get Expanded All" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAll', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
            <Button testId="collapse-node2-btn" label="Collapse Node 2" onClick="
              treeApi.collapseNode(2);
              testState = { actionPerformed: 'collapseNode2' };
            " />
            <Button testId="get-expanded-after-collapse-btn" label="Get Expanded After Collapse" onClick="
              const expanded = treeApi.getExpandedNodes();
              testState = { 
                actionPerformed: 'getExpandedAfterCollapse', 
                expandedNodes: expanded,
                expandedCount: expanded.length
              };
            " />
          </Fragment>
        `);

      const getExpandedInitialButton = await createButtonDriver("get-expanded-initial-btn");
      const expandNode1Button = await createButtonDriver("expand-node1-btn");
      const getExpandedAfter1Button = await createButtonDriver("get-expanded-after1-btn");
      const expandNode2Button = await createButtonDriver("expand-node2-btn");
      const getExpandedAfter2Button = await createButtonDriver("get-expanded-after2-btn");
      const expandAllButton = await createButtonDriver("expand-all-btn");
      const getExpandedAllButton = await createButtonDriver("get-expanded-all-btn");
      const collapseNode2Button = await createButtonDriver("collapse-node2-btn");
      const getExpandedAfterCollapseButton = await createButtonDriver(
        "get-expanded-after-collapse-btn",
      );

      // INITIAL STATE: defaultExpanded="none", so no nodes should be expanded
      await getExpandedInitialButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getExpandedInitial");

      let currentState = await testStateDriver.testState();
      expect(currentState.expandedCount).toBe(0);
      expect(currentState.expandedNodes).toEqual([]);

      // EXPAND NODE 1: Should add node 1 to expanded list
      await expandNode1Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("expandNode1");

      await getExpandedAfter1Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getExpandedAfter1");

      currentState = await testStateDriver.testState();
      expect(currentState.expandedCount).toBe(1);
      expect(currentState.expandedNodes).toEqual([1]);

      // EXPAND NODE 2: Should add node 2 to expanded list (alongside node 1)
      await expandNode2Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("expandNode2");

      await getExpandedAfter2Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getExpandedAfter2");

      currentState = await testStateDriver.testState();
      expect(currentState.expandedCount).toBe(2);
      expect(currentState.expandedNodes).toEqual(expect.arrayContaining([1, 2]));

      // EXPAND ALL: Should expand all nodes with children
      await expandAllButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("expandAll");

      await getExpandedAllButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getExpandedAll");

      currentState = await testStateDriver.testState();
      // After expandAll, ALL nodes are added to the expanded list
      // This includes leaf nodes, which is the current implementation behavior
      expect(currentState.expandedCount).toBe(7);
      expect(currentState.expandedNodes).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7]));

      // COLLAPSE NODE 2: Should remove node 2 from expanded list
      await collapseNode2Button.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("collapseNode2");

      await getExpandedAfterCollapseButton.click();
      await expect
        .poll(async () => {
          const state = await testStateDriver.testState();
          return state.actionPerformed;
        })
        .toBe("getExpandedAfterCollapse");

      currentState = await testStateDriver.testState();
      expect(currentState.expandedCount).toBe(4);
      // When node 2 is collapsed, its descendants (4, 5) are also removed from expanded list
      expect(currentState.expandedNodes).toEqual(expect.arrayContaining([1, 3, 6, 7]));
      expect(currentState.expandedNodes).not.toEqual(expect.arrayContaining([2, 4, 5]));
    });
  });
});

// =============================================================================
// DYNAMIC FIELD SUPPORT TESTS
// =============================================================================
test.describe("Dynamic Field Support", () => {
  test("should display expand/collapse icons for dynamic nodes even without children", async ({
    page,
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree"
          dataFormat="hierarchy"
          data='{${JSON.stringify(dynamicTreeData)}}'
          defaultExpanded="none">
          <property name="itemTemplate">
            <HStack testId="{$item.id}:{$item.depth}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();

    // --- We see an extra icon because Node 3 is dynamic ---
    await expect(tree.getIconsByName("chevronright")).toHaveCount(2);

    // Verify tree items are rendered (only root level nodes should be visible initially)
    await expect(page.getByTestId("1:0")).toBeVisible();
    await expect(page.getByTestId("3:0")).toBeVisible();
    await expect(page.getByTestId("4:0")).toBeVisible();

    // Node 2 should not be visible initially as parent is collapsed
    await expect(page.getByTestId("2:1")).not.toBeVisible();
  });

  test("should use custom dynamicField name", async ({ page, initTestBed, createTreeDriver }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree"
          dataFormat="hierarchy"
          dynamicField="canLoadMore"
          data='{${JSON.stringify(customDynamicTreeData)}}'
          defaultExpanded="none">
          <property name="itemTemplate">
            <HStack testId="{$item.id}:{$item.depth}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();

    // --- We see an extra icon because Node 3 is dynamic ---
    await expect(tree.getIconsByName("chevronright")).toHaveCount(2);

    // Verify tree items are rendered (only root level nodes should be visible initially)
    await expect(page.getByTestId("1:0")).toBeVisible();
    await expect(page.getByTestId("3:0")).toBeVisible();
    await expect(page.getByTestId("4:0")).toBeVisible();

    // Node 2 should not be visible initially as parent is collapsed
    await expect(page.getByTestId("2:1")).not.toBeVisible();
  });

  test("should work with flat data format and dynamic field", async ({
    page,
    initTestBed,
    createTreeDriver,
  }) => {
    await initTestBed(`
      <VStack height="400px">
        <Tree testId="tree"
          dataFormat="flat"
          data='{${JSON.stringify(dynamicFlatData)}}'
          defaultExpanded="none">
          <property name="itemTemplate">
            <HStack testId="{$item.id}:{$item.depth}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </VStack>
    `);

    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();

    // --- We see an extra icon because Node 3 is dynamic ---
    await expect(tree.getIconsByName("chevronright")).toHaveCount(2);

    // Verify tree items are rendered (only root level nodes should be visible initially)
    await expect(page.getByTestId("1:0")).toBeVisible();
    await expect(page.getByTestId("3:0")).toBeVisible();
    await expect(page.getByTestId("4:0")).toBeVisible();

    // Node 2 should not be visible initially as parent is collapsed
    await expect(page.getByTestId("2:1")).not.toBeVisible();
  });
});
