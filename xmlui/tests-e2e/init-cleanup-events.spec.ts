import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// INIT AND CLEANUP EVENTS TESTS
// =============================================================================

test.describe("Init Event", () => {
  test("fires on first render when no 'when' property", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button 
        testId="button" 
        var.counter="{0}"
        label="Counter: {counter}"
        onInit="counter = 5"
      />
    `);

    // Init should have fired, setting counter to 5
    await expect(page.getByTestId("button")).toHaveText("Counter: 5");
  });

  test("fires on first render when 'when' is true", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button 
        testId="button" 
        when="{true}"
        var.message="{'not set'}"
        label="{message}"
        onInit="message = 'initialized'"
      />
    `);

    await expect(page.getByTestId("button")).toHaveText("initialized");
  });

  test("fires when 'when' transitions from false to true", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.showButton="{false}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          var.initCount="{0}"
          label="Init Count: {initCount}"
          onInit="initCount = initCount + 1"
        />
      </App>
    `);

    const toggleDriver = await createButtonDriver("toggle");

    // Button is not visible initially
    await expect(page.getByTestId("button")).not.toBeVisible();

    // Toggle to show the button - init should fire
    await toggleDriver.click();
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("Init Count: 1");

    // Toggle to hide the button
    await toggleDriver.click();
    await expect(page.getByTestId("button")).not.toBeVisible();

    // Toggle to show again - init should fire again
    await toggleDriver.click();
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("Init Count: 2");
  });

  test("can access parent variables", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App var.parentValue="{10}">
        <Button 
          testId="button" 
          var.childValue="{0}"
          label="Child: {childValue}"
          onInit="childValue = parentValue * 2"
        />
      </App>
    `);

    await expect(page.getByTestId("button")).toHaveText("Child: 20");
  });

  test("works with multiple components", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Button 
        testId="button1" 
        var.value="{0}"
        label="Button 1: {value}"
        onInit="value = 1"
      />
      <Button 
        testId="button2" 
        var.value="{0}"
        label="Button 2: {value}"
        onInit="value = 2"
      />
      <Button 
        testId="button3" 
        var.value="{0}"
        label="Button 3: {value}"
        onInit="value = 3"
      />
    `);

    await expect(page.getByTestId("button1")).toHaveText("Button 1: 1");
    await expect(page.getByTestId("button2")).toHaveText("Button 2: 2");
    await expect(page.getByTestId("button3")).toHaveText("Button 3: 3");
  });

  test("can update AppState", async ({ page, initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Button 
        testId="button" 
        label="Click to read state"
        onInit="AppState.define('initialized', true)"
        onClick="testState = AppState.get('initialized')"
      />
    `);

    await (await createButtonDriver("button")).click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("in nested components", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App var.parentInit="{0}" onInit="parentInit = 1">
        <Stack var.stackInit="{0}" onInit="stackInit = 2">
          <Button 
            testId="button" 
            var.buttonInit="{0}"
            label="P:{parentInit} S:{stackInit} B:{buttonInit}"
            onInit="buttonInit = 3"
          />
        </Stack>
      </App>
    `);

    await expect(page.getByTestId("button")).toHaveText("P:1 S:2 B:3");
  });
});

test.describe("Cleanup Event", () => {
  test("fires when 'when' transitions from true to false", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.showButton="{true}" var.cleanupCount="{0}">
        <Button 
          testId="toggle"
          label="Toggle: {cleanupCount}"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          label="Visible"
          onCleanup="cleanupCount = cleanupCount + 1"
        />
      </App>
    `);

    const toggleDriver = await createButtonDriver("toggle");

    // Button is visible initially
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(toggleDriver.component).toHaveText("Toggle: 0");

    // Toggle to hide - cleanup should fire
    await toggleDriver.click();
    await expect(page.getByTestId("button")).not.toBeVisible();
    await expect(toggleDriver.component).toHaveText("Toggle: 1");

    // Toggle to show - cleanup should NOT fire
    await toggleDriver.click();
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(toggleDriver.component).toHaveText("Toggle: 1");

    // Toggle to hide again - cleanup should fire again
    await toggleDriver.click();
    await expect(page.getByTestId("button")).not.toBeVisible();
    await expect(toggleDriver.component).toHaveText("Toggle: 2");
  });

  test("can access and modify parent state", async ({ page, initTestBed, createButtonDriver }) => {
    await initTestBed(`
      <App var.showButton="{true}" var.message="{'not set'}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="status"
          label="Status: {message}"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          label="Visible"
          onCleanup="message = 'cleaned up'"
        />
      </App>
    `);

    await expect(page.getByTestId("status")).toHaveText("Status: not set");

    // Hide button - cleanup should update parent message
    await (await createButtonDriver("toggle")).click();
    await expect(page.getByTestId("status")).toHaveText("Status: cleaned up");
  });

  test("can update AppState", async ({ page, initTestBed, createButtonDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.showButton="{true}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="check"
          label="Check"
          onClick="testState = AppState.get('cleanedUp')"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          label="Visible"
          onCleanup="AppState.define('cleanedUp', true)"
        />
      </App>
    `);

    // Hide button to trigger cleanup
    await (await createButtonDriver("toggle")).click();

    // Check that AppState was updated
    await (await createButtonDriver("check")).click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });
});

test.describe("Init and Cleanup Combined", () => {
  test("both events fire in correct sequence", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App var.showButton="{true}" var.events="{[]}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="check"
          label="Events: {events.length}"
          onClick="testState = events"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          label="Visible"
          onInit="events = [...events, 'init']"
          onCleanup="events = [...events, 'cleanup']"
        />
      </App>
    `);

    const toggleDriver = await createButtonDriver("toggle");
    const checkDriver = await createButtonDriver("check");

    // Initial state: init should have fired
    await checkDriver.click();
    await expect.poll(testStateDriver.testState).toEqual(["init"]);

    // Hide button: cleanup should fire
    await toggleDriver.click();
    await expect(checkDriver.component).toHaveText("Events: 2");
    await checkDriver.click();
    await expect.poll(testStateDriver.testState).toEqual(["init", "cleanup"]);

    // Show button: init should fire again
    await toggleDriver.click();
    await expect(checkDriver.component).toHaveText("Events: 3");
    await checkDriver.click();
    await expect.poll(testStateDriver.testState).toEqual(["init", "cleanup", "init"]);

    // Hide button: cleanup should fire again
    await toggleDriver.click();
    await expect(checkDriver.component).toHaveText("Events: 4");
    await checkDriver.click();
    await expect.poll(testStateDriver.testState).toEqual([
      "init",
      "cleanup",
      "init",
      "cleanup",
    ]);
  });

  test("cleanup can access state set by init", async ({ page, initTestBed, createButtonDriver }) => {
    await initTestBed(`
      <App var.showButton="{true}" var.result="{'not set'}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="status"
          label="Result: {result}"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          var.localValue="{'empty'}"
          label="Visible"
          onInit="localValue = 'initialized value'"
          onCleanup="result = localValue + ' was cleaned up'"
        />
      </App>
    `);

    await expect(page.getByTestId("status")).toHaveText("Result: not set");

    // Hide button - cleanup should access the value set by init
    await (await createButtonDriver("toggle")).click();
    await expect(page.getByTestId("status")).toHaveText("Result: initialized value was cleaned up");
  });

  test("init resets state on re-mount after cleanup", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.showButton="{true}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          var.counter="{0}"
          label="Counter: {counter}"
          onInit="counter = 5"
          onClick="counter = counter + 1"
          onCleanup="counter = 999"
        />
      </App>
    `);

    const toggleDriver = await createButtonDriver("toggle");
    const buttonDriver = await createButtonDriver("button");

    // Initial state
    await expect(buttonDriver.component).toHaveText("Counter: 5");

    // Increment counter
    await buttonDriver.click();
    await expect(buttonDriver.component).toHaveText("Counter: 6");

    // Hide button (cleanup sets to 999, but we won't see it)
    await toggleDriver.click();
    await expect(page.getByTestId("button")).not.toBeVisible();

    // Show button again - init should reset to 5
    await toggleDriver.click();
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("Counter: 5");
  });
});

test.describe("Edge Cases", () => {
  test("init does not fire when 'when' is initially false", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.showButton="{false}" var.initCount="{0}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="status"
          label="Init Count: {initCount}"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          label="Visible"
          onInit="initCount = initCount + 1"
        />
      </App>
    `);

    // Init should not have fired
    await expect(page.getByTestId("status")).toHaveText("Init Count: 0");

    // Show button - init should fire
    await (await createButtonDriver("toggle")).click();
    await expect(page.getByTestId("status")).toHaveText("Init Count: 1");
  });

  test("cleanup does not fire when 'when' is initially false", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.showButton="{false}" var.cleanupCount="{0}">
        <Button 
          testId="toggle"
          label="Toggle"
          onClick="showButton = !showButton"
        />
        <Button 
          testId="status"
          label="Cleanup Count: {cleanupCount}"
        />
        <Button 
          testId="button" 
          when="{showButton}"
          label="Visible"
          onCleanup="cleanupCount = cleanupCount + 1"
        />
      </App>
    `);

    const toggleDriver = await createButtonDriver("toggle");

    // Cleanup should not have fired
    await expect(page.getByTestId("status")).toHaveText("Cleanup Count: 0");

    // Show button
    await toggleDriver.click();
    await expect(page.getByTestId("status")).toHaveText("Cleanup Count: 0");

    // Hide button - cleanup should fire
    await toggleDriver.click();
    await expect(page.getByTestId("status")).toHaveText("Cleanup Count: 1");
  });

  test("events work with complex expressions in 'when'", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.count="{0}">
        <Button 
          testId="increment"
          label="Increment"
          onClick="count = count + 1"
        />
        <Button 
          testId="status"
          label="Count: {count}"
        />
        <Button 
          testId="button" 
          when="{count > 0 && count < 3}"
          var.message="{'not set'}"
          label="{message}"
          onInit="message = 'visible'"
          onCleanup="message = 'hidden'"
        />
      </App>
    `);

    const incrementDriver = await createButtonDriver("increment");

    // Button not visible when count is 0
    await expect(page.getByTestId("button")).not.toBeVisible();

    // Increment to 1 - button becomes visible, init fires
    await incrementDriver.click();
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("visible");

    // Increment to 2 - button still visible
    await incrementDriver.click();
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("visible");

    // Increment to 3 - button becomes hidden, cleanup fires
    await incrementDriver.click();
    await expect(page.getByTestId("button")).not.toBeVisible();
  });
});
