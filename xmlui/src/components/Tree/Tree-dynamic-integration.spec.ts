import { ApiInterceptorDefinition } from "../..";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// MOCK BACKENDS FOR ASYNC LOADING TESTS
// =============================================================================

const dynamicLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/dynamic/:nodeId",
      method: "get",
      handler: `
        return [
          { id: $pathParams.nodeId + '-child1', name: 'Child 1', parentId: $pathParams.nodeId, dynamic: false },
          { id: $pathParams.nodeId + '-child2', name: 'Child 2', parentId: $pathParams.nodeId, dynamic: false }
        ];
      `,
    },
  },
};

const countingLoadMock: ApiInterceptorDefinition = {
  initialize: "$state.loadCount = 0;",
  operations: {
    loadChildren: {
      url: "/api/tree/counting/:nodeId",
      method: "get",
      handler: `
        const count = ($state.loadCount || 0) + 1;
        $state.loadCount = count;
        return [
          { id: $pathParams.nodeId + '-child' + count, name: 'Child ' + count, parentId: $pathParams.nodeId, loaded: true }
        ];
      `,
    },
  },
};

async function expectStateValueStable(
  testStateDriver: any,
  readValue: (state: any) => unknown,
  expectedValue: unknown,
  durationMs = 250,
) {
  const deadline = Date.now() + durationMs;
  do {
    expect(readValue(await testStateDriver.testState())).toEqual(expectedValue);
    await new Promise((resolve) => setTimeout(resolve, 25));
  } while (Date.now() < deadline);
}

// =============================================================================
// DYNAMIC FIELD INTEGRATION WITH ASYNC LOADING TESTS
// =============================================================================

test.describe("Dynamic Field Integration with Async Loading", () => {
  test("should NOT load children for static nodes (dynamic=false) when expanded", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          loadedField="loaded"
          data="{[
            { id: 'node1', name: 'Static Node', dynamic: false },
            { id: 'node2', name: 'Dynamic Node', dynamic: true, loaded: false }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState.loadedNodeId = node.id;
            return Actions.callApi({ url: '/api/tree/dynamic/' + node.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </Fragment>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the static node (dynamic=false) - should NOT call onLoadChildren
    await tree.getByTestId("node1").click();
    await expectStateValueStable(testStateDriver, (state) => state?.loadedNodeId, undefined);

    // Expand the dynamic node (dynamic=true) - should call onLoadChildren
    await tree.getByTestId("node2").click();

    await expect
      .poll(async () => (await testStateDriver.testState())?.loadedNodeId)
      .toBe("node2");

    // Verify children were loaded
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("should load children for dynamic nodes (dynamic=true) when expanded", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        testId="tree"
        dataFormat="flat"
        loadedField="loaded"
        data="{[
          { id: 'parent', name: 'Dynamic Parent', dynamic: true, loaded: false }
        ]}"
        itemClickExpands
        onLoadChildren=\"arg => Actions.callApi({ url: '/api/tree/dynamic/' + arg.id })\"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the dynamic node
    await tree.getByTestId("parent").click();

    // Wait for children to be loaded
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("should respect component-level dynamic default when node data doesn't specify", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        testId="tree"
        dataFormat="flat"
        loadedField="loaded"
        data="{[
          { id: 'node1', name: 'Node without dynamic field', loaded: false }
        ]}"
        dynamic="true"
        itemClickExpands
        onLoadChildren="arg => Actions.callApi({ url: '/api/tree/dynamic/' + arg.id })"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the node - should load since component dynamic=true
    await tree.getByTestId("node1").click();

    // Verify children were loaded
    await expect(page.getByText("Child 1")).toBeVisible();
  });

  test("should NOT load children when dynamic=false at component level", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          testId="tree"
          loadedField="loaded"
          dataFormat="flat"
          data="{[
            { id: 'node1', name: 'Node without dynamic field' }
          ]}"
          dynamic="false"
          itemClickExpands
          onLoadChildren="arg => {
            testState = testState || {};
            testState.loadCalled = true;
            return Actions.callApi({ url: '/api/tree/dynamic/' + arg.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </Fragment>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the node
    await tree.getByTestId("node1").click();

    // Verify loadChildren was NOT called
    await expectStateValueStable(testStateDriver, (state) => state?.loadCalled, undefined);
  });

  test("should use setDynamic() to override node dynamic state", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          loadedField="loaded"
          dataFormat="flat"
          data="{[
            { id: 'node1', name: 'Static Node', dynamic: false, loaded: false }
          ]}"
          itemClickExpands
          onLoadChildren="arg => {
            testState = testState || {};
            testState.loadCalled = true;
            return Actions.callApi({ url: '/api/tree/dynamic/' + arg.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="setDynamic" onClick="tree.setDynamic('node1', true)" />
      </Fragment>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Initially, the node is static (dynamic=false), so expanding should NOT load
    await tree.getByTestId("node1").click();

    await expectStateValueStable(testStateDriver, (state) => state?.loadCalled, undefined);

    // Collapse the node
    await tree.getByTestId("node1").click();
    await expect(page.getByText("Child 1")).not.toBeVisible();

    // Use setDynamic to override to true
    await page.getByTestId("setDynamic").click();

    // Now expand again - should load children
    await tree.getByTestId("node1").click();

    // Verify children were loaded
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect
      .poll(async () => (await testStateDriver.testState())?.loadCalled)
      .toBe(true);
  });

  test("should NOT apply autoLoadAfter to static nodes", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          testId="tree"
          loadedField="loaded"
          dataFormat="flat"
          data="{[
            { id: 'static', name: 'Static Node', dynamic: false, children: [
              { id: 'child1', parentId: 'static', name: 'Child 1' }
            ]},
            { id: 'dynamic', name: 'Dynamic Node', dynamic: true, loaded: false }
          ]}"
          autoLoadAfter="0"
          itemClickExpands
          onLoadChildren="arg => {
            testState = testState || {};
            testState.autoLoadCount = (testState.autoLoadCount || 0) + 1;
            testState.lastAutoLoadedNode = arg.id;
            return Actions.callApi({ url: '/api/tree/dynamic/' + arg.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </Fragment>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand static node (has children in data, dynamic=false)
    await tree.getByTestId("static").click();

    // Verify child is visible (from data, not loaded)
    await expect(page.getByText("Child 1")).toBeVisible();

    // Collapse static node
    await tree.getByTestId("static").click();
    await expect(page.getByText("Child 1")).not.toBeVisible();

    // Re-expand static node - should NOT trigger autoLoadAfter
    await tree.getByTestId("static").click();
    await expect(page.getByText("Child 1")).toBeVisible();

    // Check that autoLoad was NOT triggered for static node
    await expectStateValueStable(testStateDriver, (state) => state?.autoLoadCount || 0, 0);
  });

  test("should apply autoLoadAfter to dynamic nodes", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        loadedField="loaded"
        dynamicField="dynamic"
        testId="tree"
        dataFormat="flat"
        data="{[
          { id: 'dynamic', name: 'Dynamic Node', dynamic: true, loaded: false }
        ]}"
        autoLoadAfter="0"
        itemClickExpands
        onLoadChildren="arg => Actions.callApi({ url: '/api/tree/counting/' + arg.id })"
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
      {
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // First expansion - initial load
    await tree.getByTestId("dynamic").click();
    await expect(page.getByText("Child 1")).toBeVisible();

    // Collapse
    await tree.getByTestId("dynamic").click();
    await expect(page.getByText("Child 1")).not.toBeVisible();

    // Re-expand - should trigger autoLoadAfter (threshold is 0)
    await tree.getByTestId("dynamic").click();
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("should use custom dynamicField name", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          testId="tree"
          dataFormat="flat"
          loadedField="loaded"
          dynamicField="isAsync"
          data="{[
            { id: 'node1', name: 'Node 1', isAsync: false },
            { id: 'node2', name: 'Node 2', isAsync: true, loaded: false }
          ]}"
          itemClickExpands
          onLoadChildren="arg => {
            testState = testState || {};
            testState.loadedNodes = testState.loadedNodes || [];
            testState.loadedNodes.push(arg.id);
            return Actions.callApi({ url: '/api/tree/dynamic/' + arg.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </Fragment>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand node1 (isAsync=false) - should NOT load
    await tree.getByTestId("node1").click();

    await expectStateValueStable(testStateDriver, (state) => state?.loadedNodes || [], []);

    // Expand node2 (isAsync=true) - should load
    await tree.getByTestId("node2").click();

    await expect
      .poll(async () => (await testStateDriver.testState())?.loadedNodes)
      .toEqual(["node2"]);
  });

  test("should handle hierarchy data format with dynamic nodes", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
      <Fragment>
        <Tree
          loadedField="loaded"
          testId="tree"
          dataFormat="hierarchy"
          data="{[
            { id: 'static', name: 'Static Node', dynamic: false, children: [
              { id: 'child1', name: 'Child 1' }
            ]},
            { id: 'dynamic', name: 'Dynamic Node', dynamic: true, loaded: false, children: [] }
          ]}"
          itemClickExpands
          onLoadChildren="arg => {
            testState = testState || {};
            testState.loadedNodeKey = arg.id;
            return Actions.callApi({ url: '/api/tree/dynamic/' + arg.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
      </Fragment>
    `,
      {
        apiInterceptor: dynamicLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand static node - should NOT call onLoadChildren
    await tree.getByTestId("static").click();

    await expectStateValueStable(testStateDriver, (state) => state?.loadedNodeKey, undefined);

    // Expand dynamic node - should call onLoadChildren
    await tree.getByTestId("dynamic").click();

    await expect
      .poll(async () => (await testStateDriver.testState())?.loadedNodeKey)
      .toBe("dynamic");
  });
});
