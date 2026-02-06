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
        globalXs: `
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
        globalXs: `
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
        globalXs: `
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
        globalXs: `
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
        globalXs: `
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
        globalXs: `
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
});
