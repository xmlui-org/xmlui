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

  test.skip("getCount() in custom component", async ({ page, initTestBed }) => {
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

  test("component-declared global accessible from parent", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="incbGlobalText">incbGlobal: {incbGlobal}</Text>
        <IncButton label="First Button" />
      </App>
    `,
      {
        components: [
          `
      <Component name="IncButton" global.incbGlobal="{73}">
        <H3 testId="incbInComponent">Hello: {incbGlobal}</H3>
        <Button
          label="{($props.label ?? 'Click me') + ': ' + incbGlobal}"
          onClick="incbGlobal += 2" />
      </Component>
    `,
        ],
      },
    );

    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 73");
    await expect(page.getByTestId("incbInComponent")).toHaveText("Hello: 73");
    
    await page.getByRole("button", { name: "First Button: 73" }).click();
    
    await expect(page.getByTestId("incbGlobalText")).toHaveText("incbGlobal: 75");
    await expect(page.getByTestId("incbInComponent")).toHaveText("Hello: 75");
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
      <Component name="IncButton" global.incbGlobal="{73}">
        <Button
          label="{$props.label + ': ' + count + '/' + incbGlobal}"
          onClick="count++; incbGlobal += 2" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 10;
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
      <Component name="IncButton" global.incbGlobal="{73}">
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

  test("multiple component instances share component-declared global", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="sharedGlobalText">Shared: {sharedGlobal}</Text>
        <SharedButton label="Button 1" />
        <SharedButton label="Button 2" />
        <SharedButton label="Button 3" />
      </App>
    `,
      {
        components: [
          `
      <Component name="SharedButton" global.sharedGlobal="{100}">
        <Button
          label="{$props.label + ': ' + sharedGlobal}"
          onClick="sharedGlobal += 10" />
      </Component>
    `,
        ],
      },
    );

    await expect(page.getByTestId("sharedGlobalText")).toHaveText("Shared: 100");
    
    await page.getByRole("button", { name: "Button 1: 100" }).click();
    await expect(page.getByTestId("sharedGlobalText")).toHaveText("Shared: 110");
    
    await page.getByRole("button", { name: "Button 2: 110" }).click();
    await expect(page.getByTestId("sharedGlobalText")).toHaveText("Shared: 120");
    
    await page.getByRole("button", { name: "Button 3: 120" }).click();
    await expect(page.getByTestId("sharedGlobalText")).toHaveText("Shared: 130");
  });

  test("component globals and Globals.xs variables coexist", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="xsCountText">XS Count: {xsCount}</Text>
        <Text testId="compGlobalText">Comp Global: {compGlobal}</Text>
        <GlobalComponent />
        <Button label="Increment XS" onClick="xsCount++" />
      </App>
    `,
      {
        components: [
          `
      <Component name="GlobalComponent" global.compGlobal="{50}">
        <Button
          label="Increment Comp: {compGlobal}"
          onClick="compGlobal += 5" />
      </Component>
    `,
        ],
        mainXs: `
      var xsCount = 20;
    `,
      },
    );

    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 20");
    await expect(page.getByTestId("compGlobalText")).toHaveText("Comp Global: 50");
    
    await page.getByRole("button", { name: "Increment XS" }).click();
    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 21");
    await expect(page.getByTestId("compGlobalText")).toHaveText("Comp Global: 50");
    
    await page.getByRole("button", { name: "Increment Comp: 50" }).click();
    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 21");
    await expect(page.getByTestId("compGlobalText")).toHaveText("Comp Global: 55");
  });

  test("component can access both its own global and parent globals", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="compVarText">Comp Var: {compVar}</Text>
        <MixedComponent />
      </App>
    `,
      {
        components: [
          `
      <Component name="MixedComponent" global.compVar="{200}">
        <Text testId="mixedCountText">Inside Count: {count}</Text>
        <Text testId="mixedCompVarText">Inside Comp Var: {compVar}</Text>
        <Button
          label="Update Both"
          onClick="count += 5; compVar += 10" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 100;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 100");
    await expect(page.getByTestId("compVarText")).toHaveText("Comp Var: 200");
    await expect(page.getByTestId("mixedCountText")).toHaveText("Inside Count: 100");
    await expect(page.getByTestId("mixedCompVarText")).toHaveText("Inside Comp Var: 200");
    
    await page.getByRole("button", { name: "Update Both" }).click();
    
    await expect(page.getByTestId("countText")).toHaveText("Count: 105");
    await expect(page.getByTestId("compVarText")).toHaveText("Comp Var: 210");
    await expect(page.getByTestId("mixedCountText")).toHaveText("Inside Count: 105");
    await expect(page.getByTestId("mixedCompVarText")).toHaveText("Inside Comp Var: 210");
  });
});
