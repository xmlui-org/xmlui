import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// INIT EVENT TESTS
// =============================================================================

test.describe("Init Event", () => {
  test("init event fires once when component mounts", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.counter="{0}"
          label="Counter: {counter}"
          onInit="counter++"
        />
      </Fragment>
    `);

    // Init should have fired, incrementing counter to 1
    await expect(page.getByTestId("button")).toHaveText("Counter: 1");
  });

  test("init event can set initial state", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.message="{''}"
          label="{message}"
          onInit="message = 'Initialized!'"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("button")).toHaveText("Initialized!");
  });

  test("init event can perform complex initialization", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.data="{{ items: [], total: 0 }}"
          label="Total: {data.total}"
          onInit="data = { items: [1, 2, 3], total: 6 }"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("button")).toHaveText("Total: 6");
  });

  test("init event fires before when condition is evaluated", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App var.canShow="{false}">
        <Button 
          testId="button" 
          when="{canShow}"
          label="Visible"
          onInit="canShow = true"
        />
      </App>
    `);

    // The button should be visible because init set canShow to true
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("Visible");
  });

  test("init event with when=false initially then true", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App var.count="{0}" var.canShow="{false}">
        <Button 
          testId="toggle"
          label="Show"
          onClick="canShow = true"
        />
        <Button 
          testId="button" 
          when="{canShow}"
          label="Counter: {count}"
          onInit="count = 23"
        />
      </App>
    `);

    // Button is not visible initially because canShow is false
    await expect(page.getByTestId("button")).not.toBeVisible();
    
    // Click toggle to show the button
    await page.getByTestId("toggle").click();

    // Now button should be visible with count initialized to 23 from init
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("Counter: 23");
  });

  test("init event fires only once, not on re-renders", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.initCount="{0}"
          var.clickCount="{0}"
          label="Init: {initCount}, Clicks: {clickCount}"
          onInit="initCount++"
          onClick="clickCount++"
        />
      </Fragment>
    `);

    // Init should have fired once
    await expect(page.getByTestId("button")).toHaveText("Init: 1, Clicks: 0");

    // Click multiple times
    await page.getByTestId("button").click();
    await expect(page.getByTestId("button")).toHaveText("Init: 1, Clicks: 1");

    await page.getByTestId("button").click();
    await expect(page.getByTestId("button")).toHaveText("Init: 1, Clicks: 2");

    await page.getByTestId("button").click();
    await expect(page.getByTestId("button")).toHaveText("Init: 1, Clicks: 3");

    // Init count should still be 1
  });

  test("init event can call functions defined in vars", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.value="{0}"
          var.initialize="{() => { value = 42 }}"
          label="Value: {value}"
          onInit="initialize()"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("button")).toHaveText("Value: 42");
  });

  test("init event can access parent variables", async ({ page, initTestBed }) => {
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

  test("init event works with multiple components", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
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
      </Fragment>
    `);

    await expect(page.getByTestId("button1")).toHaveText("Button 1: 1");
    await expect(page.getByTestId("button2")).toHaveText("Button 2: 2");
    await expect(page.getByTestId("button3")).toHaveText("Button 3: 3");
  });

  test("init event can use console.log", async ({ page, initTestBed }) => {
    let consoleMessages: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'log') {
        consoleMessages.push(msg.text());
      }
    });

    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.value="{42}"
          label="Value: {value}"
          onInit="console.log('Initialized with value:', value)"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("button")).toHaveText("Value: 42");
    
    // Wait a bit for console log to be captured
    await page.waitForTimeout(100);
    
    expect(consoleMessages.some(msg => msg.includes('Initialized with value:'))).toBe(true);
  });

  test("init event with async operations", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.message="{'Loading...'}"
          label="{message}"
          onInit="Actions.delay(100); message = 'Loaded!'"
        />
      </Fragment>
    `);

    // Should show loading initially
    await expect(page.getByTestId("button")).toHaveText("Loading...");
    
    // Wait for async operation
    await page.waitForTimeout(150);
    
    // Should show loaded message
    await expect(page.getByTestId("button")).toHaveText("Loaded!");
  });

  test("init event can update AppState", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          label="Click to read state"
          onInit="AppState.define('initialized', true)"
          onClick="testState = AppState.get('initialized')"
        />
      </Fragment>
    `);

    await page.getByTestId("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("init event with complex expressions", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Button 
          testId="button" 
          var.data="{{ numbers: [] }}"
          label="Sum: {data.numbers.reduce((a, b) => a + b, 0)}"
          onInit="data = { numbers: [1, 2, 3, 4, 5] }"
        />
      </Fragment>
    `);

    await expect(page.getByTestId("button")).toHaveText("Sum: 15");
  });

  test("init event in nested components", async ({ page, initTestBed }) => {
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
