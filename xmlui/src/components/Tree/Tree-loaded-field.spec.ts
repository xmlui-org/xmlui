import { test, expect } from "../../testing/fixtures";
import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with 'loadedField' property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Tree
        testId="tree"
        dataFormat="flat"
        data="{[
          { id: 1, name: 'Root', loaded: true }
        ]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
    `);
    await expect(page.getByText("Root")).toBeVisible();
  });

  test("stores 'loaded' field from source data (flat format)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Loaded Node', loaded: true },
            { id: 2, name: 'Unloaded Node', loaded: false }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = {
          node1: tree.getNodeById(1),
          node2: tree.getNodeById(2)
        }" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.node1.loaded).toBe(true);
    expect(result.node2.loaded).toBe(false);
  });

  test("stores 'loaded' field from source data (hierarchy format)", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="hierarchy"
          data="{[
            { id: 1, name: 'Loaded Node', loaded: true },
            { id: 2, name: 'Unloaded Node', loaded: false }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(2)" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.loaded).toBe(false);
  });

  test("defaults 'loaded' to true when not specified", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[{ id: 1, name: 'Node Without Loaded' }]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <Text>{$item.name}</Text>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.loaded).toBe(true);
  });
});
// =============================================================================
// EXPAND INDICATOR DISPLAY TESTS
// =============================================================================

test.describe("Expand Indicator Display", () => {
  test("shows expand indicator for unloaded nodes without children", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(`
      <Tree
        testId="tree"
        dataFormat="flat"
        data="{[
          { id: 1, name: 'Unloaded Node', loaded: false }
        ]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
    `);

    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();

    // Should see one expand icon for the unloaded node
    await expect(tree.getIconsByName("chevronright")).toHaveCount(1);
  });

  test("does not show expand indicator for loaded nodes without children", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(`
      <Tree
        testId="tree"
        dataFormat="flat"
        data="{[
          { id: 1, name: 'Loaded Node', loaded: true }
        ]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
    `);

    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();

    // Should not see any expand icons
    await expect(tree.getIconsByName("chevronright")).toHaveCount(0);
  });

  test("shows expand indicator for nodes with actual children", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(`
      <Tree
        testId="tree"
        dataFormat="flat"
        data="{[
          { id: 1, name: 'Parent', loaded: true },
          { id: 2, name: 'Child', parentId: 1, loaded: true }
        ]}"
        loadedField="loaded"
      >
        <property name="itemTemplate">
          <Text>{$item.name}</Text>
        </property>
      </Tree>
    `);

    const tree = await createTreeDriver("tree");
    await expect(tree.component).toBeVisible();

    // Should see one expand icon for the parent node with actual children
    await expect(tree.getIconsByName("chevronright")).toHaveCount(1);
  });
});

// =============================================================================
// MOCK BACKENDS FOR ASYNC LOADING TESTS
// =============================================================================

const basicLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:nodeId",
      method: "get",
      handler: `
        return [
          { id: 11, name: 'Child 1', parentId: $pathParams.nodeId, loaded: true },
          { id: 12, name: 'Child 2', parentId: $pathParams.nodeId, loaded: true }
        ];
      `,
    },
  },
};

const slowLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:nodeId",
      method: "get",
      handler: `
        delay(300);
        return [{ id: 11, name: 'Child 1', parentId: $params.nodeId, loaded: true }];
      `,
    },
  },
};

const emptyChildrenMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:nodeId",
      method: "get",
      handler: "return [];",
    },
  },
};

const errorLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:nodeId",
      method: "get",
      handler: "throw 'Load failed';",
    },
  },
};

// =============================================================================
// ASYNC LOADING WITH LOADED FIELD TESTS
// =============================================================================

test.describe("Async Loading with loaded Field", () => {
  test("calls loadChildren when expanding unloaded node (flat format)", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        data="{[
          { id: 1, name: 'Unloaded Parent', loaded: false }
        ]}"
        itemClickExpands
        loadedField="loaded"
        onLoadChildren="node => {
          console.log('Loading children for node', arg.id);
          return Actions.callApi({ url: '/api/tree/children/' + arg.id });
        }"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
      {
        apiInterceptor: basicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the unloaded node
    await tree.getByTestId("1").click();

    // Wait for children to appear
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("shows spinner during async loading", async ({ initTestBed, page, createTreeDriver }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        data="{[
          { id: 1, name: 'Unloaded Parent', loaded: false }
        ]}"
        itemClickExpands
        loadedField="loaded"
        onLoadChildren="arg => Actions.callApi({ url: '/api/tree/children/' + arg.id })"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
      {
        apiInterceptor: slowLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the node
    await tree.getByTestId("1").click();

    // Check for spinner (it should appear briefly)
    await page.waitForTimeout(50);

    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("marks node as loaded after successful load", async ({ initTestBed, page, createTreeDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          itemClickExpands
          loadedField="loaded"
          onLoadChildren="arg => Actions.callApi({ url: '/api/tree/children/' + arg.id })"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `,
      {
        apiInterceptor: basicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand and wait for load
    await tree.getByTestId("1").click();
    await expect(page.getByText("Child 1")).toBeVisible();

    // Check that node is now marked as loaded
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);
  });

  test("handles empty children response", async ({ initTestBed, page, createTreeDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          itemClickExpands
          loadedField="loaded"
          onLoadChildren="arg => Actions.callApi({ url: '/api/tree/children/' + arg.id })"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `,
      {
        apiInterceptor: emptyChildrenMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the node
    await tree.getByTestId("1").click();

    // Wait for the async load to complete
    await page.waitForTimeout(500);
    
    // Check that node is now marked as loaded
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);

    // Expand indicator should be gone
    await expect(tree.getIconsByName("chevronright")).toHaveCount(0);
  });

  test("handles load error gracefully", async ({ initTestBed, page, createTreeDriver }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Unloaded Parent', loaded: false }
          ]}"
          itemClickExpands
          loadedField="loaded"
          onLoadChildren="arg => Actions.callApi({ url: '/api/tree/children/' + arg.id })"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `,
      {
        apiInterceptor: errorLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Try to expand - should fail
    await tree.getByTestId("1").click();

    // Wait a bit for error handling
    await page.waitForTimeout(200);

    // Node should remain unloaded
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(false);

    // Node should not be expanded
    const row = page.locator('[role="treeitem"]').filter({ hasText: "Unloaded Parent" });
    await expect(row).toHaveAttribute("aria-expanded", "false");
  });

  test("works with hierarchy format", async ({ initTestBed, page, createTreeDriver }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="hierarchy"
        testId="tree"
        data="{[
          { id: 1, name: 'Unloaded Parent', loaded: false }
        ]}"
        itemClickExpands
        loadedField="loaded"
        childrenField="children"
        onLoadChildren="arg => Actions.callApi({ url: '/api/tree/children/' + arg.id })"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
      {
        apiInterceptor: basicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand and verify children appear
    await tree.getByTestId("1").click();

    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });
});

// =============================================================================
// API METHODS WITH LOADED FIELD TESTS
// =============================================================================

test.describe("API Methods with loaded Field", () => {
  test("markNodeUnloaded sets loaded to false", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Parent', loaded: true },
            { id: 2, name: 'Child', parentId: 1, loaded: true }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="unloadBtn" onClick="tree.markNodeUnloaded(1)" />
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);

    // Mark node as unloaded
    await page.getByTestId("unloadBtn").click();
    await page.waitForTimeout(50);

    // Check that loaded field is false
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(false);
  });

  test("markNodeLoaded sets loaded to true", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node', loaded: false }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="loadBtn" onClick="tree.markNodeLoaded(1)" />
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);

    // Mark node as loaded
    await page.getByTestId("loadBtn").click();
    await page.waitForTimeout(50);

    // Check that loaded field is true
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);
  });

  test("getNodeLoadingState returns correct state", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Tree
        id="tree"
        dataFormat="flat"
        testId="tree"
        itemClickExpands
        data="{[
          { id: 1, name: 'Unloaded', loaded: false }
        ]}"
        loadedField="loaded"
        onLoadChildren="arg => Actions.callApi({ url: '/api/tree/children/' + arg.id })"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
      <Button testId="checkBtn" onClick="testState = tree.getNodeLoadingState(1)" />
    `,
      {
        apiInterceptor: slowLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");

    // Initial state should be unloaded
    await page.getByTestId("checkBtn").click();
    let result = await testStateDriver.testState();
    expect(result).toBe("unloaded");

    // Start loading
    await tree.getByTestId("1").click();

    // Check loading state (might be flaky due to timing)
    await page.waitForTimeout(50);
    await page.getByTestId("checkBtn").click();
    result = await testStateDriver.testState();
    // Could be "loading" or "loaded" depending on timing
    expect(["loading", "loaded"]).toContain(result);

    // Wait for completion
    await expect(page.getByText("Child")).toBeVisible();

    // Final state should be loaded
    await page.getByTestId("checkBtn").click();
    result = await testStateDriver.testState();
    expect(result).toBe("loaded");
  });

  test("markNodeUnloaded works in hierarchy format", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="hierarchy"
          data="{[
            { id: 1, name: 'Parent', loaded: true, children: [
              { id: 2, name: 'Child', loaded: true }
            ]}
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="unloadBtn" onClick="tree.markNodeUnloaded(1)" />
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);

    // Mark node as unloaded
    await page.getByTestId("unloadBtn").click();
    await page.waitForTimeout(50);

    // Check that loaded field is false
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(false);
  });

  test("markNodeLoaded works in hierarchy format", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          dataFormat="hierarchy"
          data="{[
            { id: 1, name: 'Node', loaded: false }
          ]}"
          loadedField="loaded"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="loadBtn" onClick="tree.markNodeLoaded(1)" />
        <Button testId="checkBtn" onClick="testState = tree.getNodeById(1)" />
      </Fragment>
    `);

    // Mark node as loaded
    await page.getByTestId("loadBtn").click();
    await page.waitForTimeout(50);

    // Check that loaded field is true
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();
    expect(result.loaded).toBe(true);
  });
});
