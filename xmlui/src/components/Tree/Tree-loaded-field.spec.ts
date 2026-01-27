import { test, expect } from "../../testing/fixtures";

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

  test("stores 'loaded' field from source data (hierarchy format)", async ({ initTestBed, page }) => {
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
