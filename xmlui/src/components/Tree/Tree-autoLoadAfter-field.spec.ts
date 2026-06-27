import { ApiInterceptorDefinition } from "../..";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// MOCK BACKENDS FOR AUTO-LOAD TESTING
// =============================================================================

const countingLoadMock: ApiInterceptorDefinition = {
  initialize: "$state.loadCount = {};",
  operations: {
    loadChildren: {
      url: "/api/tree/autoload/:nodeId",
      method: "get",
      handler: `
        $state.loadCount = $state.loadCount || {};
        const count = ($state.loadCount[$pathParams.nodeId] || 0) + 1;
        $state.loadCount[$pathParams.nodeId] = count;
        
        return [
          { 
            id: $pathParams.nodeId + '-child' + count, 
            name: 'Child ' + count, 
            parentId: $pathParams.nodeId,
            dynamic: false,
            loaded: true
          }
        ];
      `,
    },
  },
};

// =============================================================================
// AUTOLOADAFTER FIELD TESTS
// =============================================================================

test.describe("AutoLoadAfter Field Integration", () => {
  test("should use per-node autoLoadAfter from data field (hier archy format)", async ({
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
          dataFormat="hierarchy"
          data="{[
            { 
              id: 'fast', 
              name: 'Fast Reload Node', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: 0
            },
            { 
              id: 'slow', 
              name: 'Slow Reload Node', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: 99999
            }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState[node.id] = (testState[node.id] || 0) + 1;
            return Actions.callApi({ url: '/api/tree/autoload/' + node.id });
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
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand fast node
    await tree.getByTestId("fast").click();
    await page.waitForTimeout(100);
    await expect(page.getByText("Child 1")).toBeVisible();

    // Collapse and immediately re-expand
    await tree.getByTestId("fast").click();
    await page.waitForTimeout(50);
    await expect(page.getByText("Child 1")).not.toBeVisible();

    await tree.getByTestId("fast").click();
    await page.waitForTimeout(100);

    // Should reload because autoLoadAfter=0 - Child 2 appears (new load)
    await expect(page.getByText("Child 2")).toBeVisible();

    // Expand slow node
    await tree.getByTestId("slow").click();
    await page.waitForTimeout(100);
    // Wait for slow node's child to load
    await expect(tree.getByTestId("slow-child1")).toBeVisible();
    // Should see Child 1 (from slow) and Child 2 (from fast)
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();

    // Collapse and immediately re-expand
    await tree.getByTestId("slow").click();
    await page.waitForTimeout(50);
    await tree.getByTestId("slow").click();
    await page.waitForTimeout(100);

    // Should NOT reload because autoLoadAfter=99999 - still showing first Child 1
    await expect(page.getByText("Child 1")).toBeVisible(); // From slow
    await expect(page.getByText("Child 2")).toBeVisible(); // From fast - only 1 because slow didn't reload
  });

  test("should use per-node autoLoadAfter from data field (flat format)", async ({
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
          data="{[
            { 
              id: 'parent1', 
              name: 'Parent 1', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: 100 
            },
            { 
              id: 'parent2', 
              name: 'Parent 2', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: 5000 
            }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState.lastLoadedId = node.id;
            testState.loadTimestamp = Date.now();
            return Actions.callApi({ url: '/api/tree/autoload/' + node.id });
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
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Test parent1 (short threshold)
    await tree.getByTestId("parent1").click();
    await page.waitForTimeout(100);
    let state = await testStateDriver.testState();
    expect(state?.lastLoadedId).toBe("parent1");

    await tree.getByTestId("parent1").click();
    await page.waitForTimeout(150);

    await tree.getByTestId("parent1").click();
    await page.waitForTimeout(100);
    state = await testStateDriver.testState();
    expect(state?.lastLoadedId).toBe("parent1"); // Reloaded

    // Test parent2 (long threshold)
    await tree.getByTestId("parent2").click();
    await page.waitForTimeout(100);
    const loadTime = (await testStateDriver.testState())?.loadTimestamp;

    await tree.getByTestId("parent2").click();
    await page.waitForTimeout(150);

    await tree.getByTestId("parent2").click();
    await page.waitForTimeout(100);
    state = await testStateDriver.testState();
    expect(state?.loadTimestamp).toBe(loadTime); // Not reloaded
  });

  test("should respect custom field name for autoLoadAfter", async ({
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
          dataFormat="hierarchy"
          autoLoadAfterField="reloadInterval"
          data="{[
            { 
              id: 'node1', 
              name: 'Node 1', 
              dynamic: true, 
              loaded: false, 
              reloadInterval: 0
            }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState.loadCount = (testState.loadCount || 0) + 1;
            return Actions.callApi({ url: '/api/tree/autoload/' + node.id });
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
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Initial load
    await tree.getByTestId("node1").click();
    await page.waitForTimeout(100);
    await expect(page.getByText("Child 1")).toBeVisible();

    // Collapse and immediately re-expand
    await tree.getByTestId("node1").click();
    await page.waitForTimeout(50);
    await expect(page.getByText("Child 1")).not.toBeVisible();

    await tree.getByTestId("node1").click();
    await page.waitForTimeout(100);

    // Should reload using custom field - Child 2 appears
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("should prioritize node data field over component-level autoLoadAfter", async ({
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
          dataFormat="hierarchy"
          autoLoadAfter="{99999}"
          data="{[
            { 
              id: 'override', 
              name: 'Override Node', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: 0
            },
            { 
              id: 'default', 
              name: 'Default Node', 
              dynamic: true, 
              loaded: false 
            }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState[node.id] = (testState[node.id] || 0) + 1;
            return Actions.callApi({ url: '/api/tree/autoload/' + node.id });
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
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Test node with override (0ms)
    await tree.getByTestId("override").click();
    await page.waitForTimeout(100);
    await expect(page.getByText("Child 1")).toBeVisible();

    await tree.getByTestId("override").click();
    await page.waitForTimeout(50);
    await expect(page.getByText("Child 1")).not.toBeVisible();

    await tree.getByTestId("override").click();
    await page.waitForTimeout(100);
    // Reloaded with node-level 0ms - Child 2 appears
    await expect(page.getByText("Child 2")).toBeVisible();

    // Test node without override (component-level 99999ms)
    await tree.getByTestId("default").click();
    await page.waitForTimeout(100);
    // Wait for default node's child to load
    await expect(tree.getByTestId("default-child1")).toBeVisible();
    // Should see Child 1 (from default) and Child 2 (from override)
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();

    await tree.getByTestId("default").click();
    await page.waitForTimeout(50);
    await tree.getByTestId("default").click();
    await page.waitForTimeout(100);
    // Not reloaded (long threshold) - still showing first Child 1
    await expect(page.getByText("Child 1")).toBeVisible(); // From default
    await expect(page.getByText("Child 2")).toBeVisible(); // From override - only 1 because default didn't reload
  });

  test("should allow setting autoLoadAfter to null to disable reload at node level", async ({
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
          dataFormat="hierarchy"
          autoLoadAfter="{100}"
          data="{[
            { 
              id: 'disabled', 
              name: 'Disabled Node', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: null 
            }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState.loadCount = (testState.loadCount || 0) + 1;
            return Actions.callApi({ url: '/api/tree/autoload/' + node.id });
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
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Initial load
    await tree.getByTestId("disabled").click();
    await page.waitForTimeout(100);
    let state = await testStateDriver.testState();
    expect(state?.loadCount).toBe(1);

    // Collapse and wait
    await tree.getByTestId("disabled").click();
    await page.waitForTimeout(150);

    // Re-expand - should NOT reload (autoLoadAfter=null)
    await tree.getByTestId("disabled").click();
    await page.waitForTimeout(100);
    state = await testStateDriver.testState();
    expect(state?.loadCount).toBe(1); // Still 1, not reloaded
  });

  test("should work with setAutoLoadAfter() API taking precedence over data field", async ({
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
          dataFormat="hierarchy"
          data="{[
            { 
              id: 'node1', 
              name: 'Node 1', 
              dynamic: true, 
              loaded: false, 
              autoLoadAfter: 5000 
            }
          ]}"
          itemClickExpands
          onLoadChildren="node => {
            testState = testState || {};
            testState.loadCount = (testState.loadCount || 0) + 1;
            return Actions.callApi({ url: '/api/tree/autoload/' + node.id });
          }"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}" verticalAlignment="center">
              <Text value="{$item.name}" />
            </HStack>
          </property>
        </Tree>
        <Button testId="setAutoLoad" onClick="tree.setAutoLoadAfter('node1', 100)" />
      </Fragment>
    `,
      {
        apiInterceptor: countingLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Override with setAutoLoadAfter
    await page.getByTestId("setAutoLoad").click();

    // Initial load
    await tree.getByTestId("node1").click();
    await page.waitForTimeout(100);
    await expect(page.getByText("Child 1")).toBeVisible();

    // Collapse and wait
    await tree.getByTestId("node1").click();
    await page.waitForTimeout(150);
    await expect(page.getByText("Child 1")).not.toBeVisible();

    // Re-expand - should reload using API value (100ms), not data field (5000ms)
    await tree.getByTestId("node1").click();
    await page.waitForTimeout(100);
    // Child 2 appears because of reload
    await expect(page.getByText("Child 2")).toBeVisible();
  });
});
