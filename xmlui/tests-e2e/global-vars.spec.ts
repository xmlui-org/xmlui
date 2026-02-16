import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// GLOBAL VARIABLES
// =============================================================================

test.describe("Global variables", () => {
  test("Initial sample", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="getCountText">getCount: {getCount()}</Text>
        <IncButton label="First Button" />
        <IncButton label="Second Button" />
        <Button
          label="3rd button: {count}"
          onClick="count++" />
        <Button
          var.count="{0}"
          label="4th button (local): {count}"
          onClick="count++" />
      </App>
    `,
      {
        components: [
          `
      <Component name="IncButton">
        <Button
          label="{($props.label ?? 'Click me to increment') + ': ' + count}"
          onClick="count++" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 6*7;

      function getCount() {
        return count;
      }
    `,
      },
    );
    const countText = page.getByTestId("countText");
    await expect (page.getByTestId("countText")).toHaveText("Count: 42");
    await expect (page.getByTestId("getCountText")).toHaveText("getCount: 42");

    await page.getByRole("button", { name: "First Button: 42" }).click();
    await expect (page.getByTestId("countText")).toHaveText("Count: 43");
    await expect (page.getByTestId("getCountText")).toHaveText("getCount: 43");
  });

  test("getCount() in custom component", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <DisplayButton />
      </App>
    `,
      {
        components: [
          `
      <Component name="DisplayButton">
        <Button
          label="Button shows: {getCount()}"
          onClick="count++" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 10;

      function getCount() {
        return count;
      }
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 10");
    await expect(page.getByRole("button", { name: "Button shows: 10" })).toBeVisible();
    
    await page.getByRole("button", { name: "Button shows: 10" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 11");
  });

  test("getCount() with multiple calls in same component", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="text1">First: {getCount()}</Text>
        <Text testId="text2">Second: {getCount()}</Text>
        <Text testId="text3">Third: {getCount()}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 5;

      function getCount() {
        return count;
      }
    `,
      },
    );

    await expect(page.getByTestId("text1")).toHaveText("First: 5");
    await expect(page.getByTestId("text2")).toHaveText("Second: 5");
    await expect(page.getByTestId("text3")).toHaveText("Third: 5");
    
    await page.getByRole("button", { name: "Increment" }).click();
    
    await expect(page.getByTestId("text1")).toHaveText("First: 6");
    await expect(page.getByTestId("text2")).toHaveText("Second: 6");
    await expect(page.getByTestId("text3")).toHaveText("Third: 6");
  });

  test("getCount() in button onClick", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App var.result="{0}">
        <Text testId="countText">Count: {count}</Text>
        <Text testId="resultText">Result: {result}</Text>
        <Button 
          label="Copy count to result" 
          onClick="result = getCount()" />
      </App>
    `,
      {
        mainXs: `
      var count = 42;

      function getCount() {
        return count;
      }
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await expect(page.getByTestId("resultText")).toHaveText("Result: 0");
    
    await page.getByRole("button", { name: "Copy count to result" }).click();
    
    await expect(page.getByTestId("resultText")).toHaveText("Result: 42");
  });

  test("getCount() with arithmetic operations", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="doubleText">Double: {getCount() * 2}</Text>
        <Text testId="plusTenText">Plus ten: {getCount() + 10}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 20;

      function getCount() {
        return count;
      }
    `,
      },
    );

    await expect(page.getByTestId("doubleText")).toHaveText("Double: 40");
    await expect(page.getByTestId("plusTenText")).toHaveText("Plus ten: 30");
    
    await page.getByRole("button", { name: "Increment" }).click();
    
    await expect(page.getByTestId("doubleText")).toHaveText("Double: 42");
    await expect(page.getByTestId("plusTenText")).toHaveText("Plus ten: 31");
  });

  test("getCount() called from another global function", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="doubleText">Double: {getDoubleCount()}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 7;

      function getCount() {
        return count;
      }

      function getDoubleCount() {
        return getCount() * 2;
      }
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 7");
    await expect(page.getByTestId("doubleText")).toHaveText("Double: 14");
    
    await page.getByRole("button", { name: "Increment" }).click();
    
    await expect(page.getByTestId("countText")).toHaveText("Count: 8");
    await expect(page.getByTestId("doubleText")).toHaveText("Double: 16");
  });

  test("dependent global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="dummyText">Dummy: {dummy}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 6*7;
      var dummy = 3*count;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 126");
    
    await page.getByRole("button", { name: "Increment" }).click();
    
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
    // dummy is reactive - it updates when count changes
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 129");
  });

  test("multiple variables modified in one onClick", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="incbGlobalText">incbGlobal: {incbGlobal}</Text>
        <IncButton label="Multi-update" />
      </App>
    `,
      {
        components: [
          `
      <Component name="IncButton">
        <Button
          label="{$props.label + ': ' + count + '/' + incbGlobal}"
          onClick="count++; incbGlobal += 2" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 10;
      var incbGlobal = 73;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 10");
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 73");
    
    await page.getByRole("button", { name: "Multi-update: 10/73" }).click();
    
    await expect(page.getByTestId("countText")).toHaveText("Count: 11");
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 75");
  });

  test("complete sample from requirements", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="dummyText">Dummy: {dummy}</Text>
        <Text testId="getCountText">GetCount: {getCount()}</Text>
        <Text testId="incbGlobalText">incbGlobal: {incbGlobal}</Text>
        <IncButton label="1st button" />
        <Button
          label="3rd button: {count}"
          onClick="count++" />
      </App>
    `,
      {
        components: [
          `
      <Component name="IncButton">
        <H3 testId="helloText">Hello: {incbGlobal}</H3>
        <Button
          label="{($props.label ?? 'Click me to increment') + ': ' + count}"
          onClick="count++; incbGlobal += 2" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 6*7;
      var dummy = 3*count;
      var incbGlobal = 73;

      function getCount() {
        return count;
      }
    `,
      },
    );

    // Initial values
    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 126");
    await expect(page.getByTestId("getCountText")).toHaveText("GetCount: 42");
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 73");
    await expect(page.getByTestId("helloText")).toHaveText("Hello: 73");
    
    // Click 1st button (IncButton) - increments both count and incbGlobal
    await page.getByRole("button", { name: "1st button: 42" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
    await expect(page.getByTestId("getCountText")).toHaveText("GetCount: 43");
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 75");
    await expect(page.getByTestId("helloText")).toHaveText("Hello: 75");
    
    // Click 3rd button - only increments count
    await page.getByRole("button", { name: "3rd button: 43" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 44");
    await expect(page.getByTestId("getCountText")).toHaveText("GetCount: 44");
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 75");
    
    // Click 1st button again
    await page.getByRole("button", { name: "1st button: 44" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 45");
    await expect(page.getByTestId("getCountText")).toHaveText("GetCount: 45");
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 77");
    await expect(page.getByTestId("helloText")).toHaveText("Hello: 77");
  });
});
