import { expect, test } from "../../testing/fixtures";
import type { ApiInterceptorDefinition } from "../../components-core/interception/abstractions";

// =============================================================================
// TEST DATA
// =============================================================================

const treeDataWithUnloadedNodes = [
  { id: "1", name: "Unloaded Parent 1", parentId: null, dynamic: true },
  { id: "2", name: "Unloaded Parent 2", parentId: null, dynamic: true },
];

// =============================================================================
// MOCK BACKENDS FOR ASYNC LOADING TESTS
// =============================================================================

// Mock backend with 500ms delay to test spinner visibility
const slowLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:id",
      method: "get",
      handler: `
        delay(500);
        return [
          { id: 'child-1', name: 'Child 1', parentId: $pathParams.id, loaded: true },
          { id: 'child-2', name: 'Child 2', parentId: $pathParams.id, loaded: true }
        ];
      `,
    },
  },
};

// Mock backend with 100ms delay for quick loading tests
const quickLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:id",
      method: "get",
      handler: `
        delay(100);
        return [
          { id: 'child-1', name: 'Child 1', parentId: $pathParams.id },
          { id: 'child-2', name: 'Child 2', parentId: $pathParams.id }
        ];
      `,
    },
  },
};

// Mock backend with 800ms delay for longer loading tests
const verySlowLoadMock: ApiInterceptorDefinition = {
  operations: {
    loadChildren: {
      url: "/api/tree/children/:id",
      method: "get",
      handler: `
        delay(800);
        return [
          { id: 'child-1', name: 'Child 1', parentId: $pathParams.id, loaded: true },
          { id: 'child-2', name: 'Child 2', parentId: $pathParams.id, loaded: true }
        ];
      `,
    },
  },
};

// =============================================================================
// SPINNER DELAY TESTS
// =============================================================================

test.describe("spinnerDelay Property", () => {
  test("spinner appears immediately when spinnerDelay is 0 (default)", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="0"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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

    // Expand the first node
    await tree.getByTestId("1").click();
    // Spinner should appear almost immediately with no delay
    const spinner = page.locator("[data-tree-node-spinner]").first();
    await expect(spinner).toBeVisible();

    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("expand icon shows during delay period with spinnerDelay=300", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="300"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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

    // Expand the first node
    await tree.getByTestId("1").click();

    // During delay period, expand icon should still be visible, spinner should not
    const expandIcon = page.locator("[data-tree-expand-icon]").first();
    const spinner = page.locator("[data-tree-node-spinner]").first();

    await page.waitForTimeout(100);
    await expect(expandIcon).toBeVisible();
    await expect(spinner).not.toBeVisible();

    // After delay expires, spinner should appear
    await page.waitForTimeout(250); // Total 350ms, past the 300ms delay
    await expect(spinner).toBeVisible({ timeout: 1000 });

    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("spinner appears after delay expires with spinnerDelay=400", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="400"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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
        apiInterceptor: verySlowLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the first node
    await tree.getByTestId("1").click();

    const spinner = page.locator("[data-tree-node-spinner]").first();

    // Spinner should not be visible immediately
    await page.waitForTimeout(100);
    await expect(spinner).not.toBeVisible();

    // After delay expires, spinner should be visible
    await page.waitForTimeout(150); // Total 250ms, past the 200ms delay
    await expect(spinner).toBeVisible({ timeout: 500 });

    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("spinner does not appear if loading completes before delay expires", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="500"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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
        apiInterceptor: quickLoadMock, // 100ms delay, faster than spinner delay
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the first node
    await tree.getByTestId("1").click();

    const spinner = page.locator("[data-tree-node-spinner]").first();

    // Wait for loading to complete (100ms) plus a bit more
    await page.waitForTimeout(200);

    // Spinner should never have appeared because loading finished before delay expired
    await expect(spinner).not.toBeVisible();

    // Children should be visible
    await expect(page.getByText("Child 1")).toBeVisible();
    await expect(page.getByText("Child 2")).toBeVisible();
  });

  test("expand icon remains clickable during delay period", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="300"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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

    // Click the expand icon
    const expandIcon = page.locator("[data-tree-expand-icon]").first();
    await expandIcon.click();

    // During delay period, expand icon should still be visible
    await page.waitForTimeout(100);
    await expect(expandIcon).toBeVisible();

    // Try clicking again during loading - should not toggle
    await expandIcon.click();

    // Wait for loading to complete
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("spinnerDelay works with hierarchy data format", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="hierarchy"
        testId="tree"
        spinnerDelay="250"
        data='{[
          { id: "1", name: "Unloaded Parent", loaded: false, children: [] }
        ]}'
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
        apiInterceptor: slowLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the node
    await tree.getByTestId("1").click();

    const spinner = page.locator("[data-tree-node-spinner]").first();

    // Spinner should not be visible immediately
    await page.waitForTimeout(100);
    await expect(spinner).not.toBeVisible();

    // After delay expires, spinner should be visible
    await page.waitForTimeout(200); // Total 300ms, past the 250ms delay
    await expect(spinner).toBeVisible({ timeout: 500 });

    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("spinner state resets correctly after loading completes", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="200"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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

    const expandIcon = page.locator("[data-tree-expand-icon]").first();
    const spinner = page.locator("[data-tree-node-spinner]").first();

    // Expand the first node
    await expandIcon.click();

    // Wait for loading to complete
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });

    // Spinner should be hidden after loading completes
    await expect(spinner).not.toBeVisible();

    // Expand icon should be visible again
    await expect(expandIcon).toBeVisible();
  });
});

// =============================================================================
// SPINNER DELAY EDGE CASES
// =============================================================================

test.describe("spinnerDelay Edge Cases", () => {
  test("handles negative spinnerDelay value (treated as 0)", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="-100"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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

    // Negative delay should behave like 0 - spinner appears immediately
    const spinner = page.locator("[data-tree-node-spinner]").first();
    await expect(spinner).toBeVisible();

    // Eventually children appear
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 2000 });
  });

  test("handles very large spinnerDelay value", async ({ initTestBed, page, createTreeDriver }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="999999"
        data='{${JSON.stringify(treeDataWithUnloadedNodes)}}'
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
        apiInterceptor: quickLoadMock,
      },
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand the node
    await tree.getByTestId("1").click();

    const spinner = page.locator("[data-tree-node-spinner]").first();

    // Wait for loading to complete
    await expect(page.getByText("Child 1")).toBeVisible({ timeout: 1000 });

    // Spinner should never appear because delay is extremely large
    await expect(spinner).not.toBeVisible();
  });

  test("spinnerDelay does not affect non-dynamic nodes", async ({
    initTestBed,
    page,
    createTreeDriver,
  }) => {
    await initTestBed(
      `
      <Tree
        dataFormat="flat"
        testId="tree"
        spinnerDelay="300"
        defaultExpanded="none"
        itemClickExpands
        data='{[
          { id: "1", name: "Parent", parentId: null },
          { id: "2", name: "Child 1", parentId: "1" },
          { id: "3", name: "Child 2", parentId: "1" }
        ]}'
      >
        <property name="itemTemplate">
          <HStack testId="{$item.id}" verticalAlignment="center">
            <Text value="{$item.name}" />
          </HStack>
        </property>
      </Tree>
    `,
    );

    const tree = await createTreeDriver("tree");
    await tree.component.focus();

    // Expand static node - no spinner should ever appear
    await tree.getByTestId("1").click();

    const spinner = page.locator("[data-tree-node-spinner]").first();

    // Wait a bit
    await page.waitForTimeout(400);

    // Spinner should not appear for static nodes
    await expect(spinner).not.toBeVisible();

    // Children should be immediately visible
    await expect(tree.getByTestId("2")).toBeVisible();
    await expect(tree.getByTestId("3")).toBeVisible();
  });
});
