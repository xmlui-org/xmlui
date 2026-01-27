import { test, expect } from "../../testing/fixtures";

// =============================================================================
// DYNAMIC FIELD BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Dynamic Field - Basic Functionality", () => {
  test("reads dynamic field from source data (flat format)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Static Node', dynamic: false },
            { id: 2, name: 'Dynamic Node', dynamic: true }
          ]}"
          dynamicField="dynamic"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = {
          node1Dynamic: tree.getDynamic(1),
          node2Dynamic: tree.getDynamic(2)
        }" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.node1Dynamic).toBe(false);
    expect(result.node2Dynamic).toBe(true);
  });

  test("reads dynamic field from source data (hierarchy format)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="hierarchy"
          data="{[
            { 
              id: 1, 
              name: 'Parent', 
              dynamic: true,
              children: [
                { id: 2, name: 'Static Child', dynamic: false }
              ]
            }
          ]}"
          dynamicField="dynamic"
          defaultExpanded="all"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = {
          node1Dynamic: tree.getDynamic(1),
          node2Dynamic: tree.getDynamic(2)
        }" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.node1Dynamic).toBe(true);
    expect(result.node2Dynamic).toBe(false);
  });

  test("uses component-level dynamic default when field not in data", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node Without Dynamic Field' }
          ]}"
          dynamic
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getDynamic(1)" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result).toBe(true);
  });

  test("defaults dynamic to false when not specified", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node Without Dynamic' }
          ]}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getDynamic(1)" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result).toBe(false);
  });

  test("data field value overrides component-level default", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Static Override', dynamic: false },
            { id: 2, name: 'Uses Default' }
          ]}"
          dynamic
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = {
          node1: tree.getDynamic(1),
          node2: tree.getDynamic(2)
        }" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.node1).toBe(false); // Overridden by data
    expect(result.node2).toBe(true); // Uses component default
  });

  test("uses custom dynamicField property name", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node', isDynamic: true }
          ]}"
          dynamicField="isDynamic"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getDynamic(1)" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result).toBe(true);
  });
});

// =============================================================================
// DYNAMIC FIELD API METHODS TESTS
// =============================================================================

test.describe("Dynamic Field - API Methods", () => {
  test("getDynamic returns correct value from data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Dynamic Node', dynamic: true },
            { id: 2, name: 'Static Node', dynamic: false }
          ]}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = {
          result1: tree.getDynamic(1),
          result2: tree.getDynamic(2)
        }" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.result1).toBe(true);
    expect(result.result2).toBe(false);
  });

  test("setDynamic overrides value from data", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node', dynamic: false }
          ]}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBeforeBtn" onClick="testState = tree.getDynamic(1)" />
        <Button testId="setBtn" onClick="tree.setDynamic(1, true)" />
        <Button testId="checkAfterBtn" onClick="testState = tree.getDynamic(1)" />
      </Fragment>
    `);

    // Check initial value
    await page.getByTestId("checkBeforeBtn").click();
    let result = await testStateDriver.testState();
    expect(result).toBe(false);

    // Set new value
    await page.getByTestId("setBtn").click();

    // Check updated value
    await page.getByTestId("checkAfterBtn").click();
    result = await testStateDriver.testState();
    expect(result).toBe(true);
  });

  test("setDynamic with undefined clears override", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node', dynamic: false }
          ]}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="setTrueBtn" onClick="tree.setDynamic(1, true)" />
        <Button testId="clearBtn" onClick="tree.setDynamic(1, undefined)" />
        <Button testId="checkBtn" onClick="testState = tree.getDynamic(1)" />
      </Fragment>
    `);

    // Set override
    await page.getByTestId("setTrueBtn").click();
    await page.getByTestId("checkBtn").click();
    let result = await testStateDriver.testState();
    expect(result).toBe(true);

    // Clear override
    await page.getByTestId("clearBtn").click();
    await page.getByTestId("checkBtn").click();
    result = await testStateDriver.testState();
    expect(result).toBe(false); // Back to data value
  });

  test("getDynamic returns false for non-existent node", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node' }
          ]}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="checkBtn" onClick="testState = tree.getDynamic(999)" />
      </Fragment>
    `);

    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result).toBe(false);
  });

  test("setDynamic and getDynamic work together", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Node 1' },
            { id: 2, name: 'Node 2' }
          ]}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="setNode1Btn" onClick="tree.setDynamic(1, true)" />
        <Button testId="setNode2Btn" onClick="tree.setDynamic(2, false)" />
        <Button testId="checkBtn" onClick="testState = {
          node1: tree.getDynamic(1),
          node2: tree.getDynamic(2)
        }" />
      </Fragment>
    `);

    await page.getByTestId("setNode1Btn").click();
    await page.getByTestId("setNode2Btn").click();
    await page.getByTestId("checkBtn").click();
    
    const result = await testStateDriver.testState();
    expect(result.node1).toBe(true);
    expect(result.node2).toBe(false);
  });
});

// =============================================================================
// DYNAMIC FIELD PRIORITY TESTS
// =============================================================================

test.describe("Dynamic Field - Value Priority", () => {
  test("priority: setDynamic > data field > component default", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Tree
          id="tree"
          testId="tree"
          dataFormat="flat"
          data="{[
            { id: 1, name: 'Explicit Set' },
            { id: 2, name: 'From Data', dynamic: true },
            { id: 3, name: 'Component Default' }
          ]}"
          dynamic="{false}"
        >
          <property name="itemTemplate">
            <HStack testId="{$item.id}">
              <Text>{$item.name}</Text>
            </HStack>
          </property>
        </Tree>
        <Button testId="setBtn" onClick="tree.setDynamic(1, true)" />
        <Button testId="checkBtn" onClick="testState = {
          node1: tree.getDynamic(1),
          node2: tree.getDynamic(2),
          node3: tree.getDynamic(3)
        }" />
      </Fragment>
    `);

    await page.getByTestId("setBtn").click();
    await page.getByTestId("checkBtn").click();
    const result = await testStateDriver.testState();

    expect(result.node1).toBe(true); // From setDynamic
    expect(result.node2).toBe(true); // From data field
    expect(result.node3).toBe(false); // From component default
  });
});
