import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// GLOBAL VARIABLES E2E TESTS
// =============================================================================

test.describe("Global variables", () => {
  test("displays global variable in Text component", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
      </App>
    `,
      {
        mainXs: `
      var count = 42;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
  });

  test("displays global variable from function call", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="resultText">Result: {getCount()}</Text>
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

    await expect(page.getByTestId("resultText")).toHaveText("Result: 42");
  });

  test("modifies global variable via button click", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 42;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
  });

  test("multiple components share same global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="text1">Text 1: {count}</Text>
        <Text testId="text2">Text 2: {count}</Text>
        <Button label="Increment: {count}" onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 100;
    `,
      },
    );

    await expect(page.getByTestId("text1")).toHaveText("Text 1: 100");
    await expect(page.getByTestId("text2")).toHaveText("Text 2: 100");
    
    await page.getByRole("button", { name: "Increment: 100" }).click();
    
    await expect(page.getByTestId("text1")).toHaveText("Text 1: 101");
    await expect(page.getByTestId("text2")).toHaveText("Text 2: 101");
  });

  test("custom component accesses global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <IncButton label="Custom Button" />
      </App>
    `,
      {
        components: [
          `
      <Component name="IncButton">
        <Button
          label="{$props.label + ': ' + count}"
          onClick="count++" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 10;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 10");
    await page.getByRole("button", { name: "Custom Button: 10" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 11");
  });

  test("local variable shadows global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="globalText">Global: {count}</Text>
        <Button
          label="Global Button: {count}"
          onClick="count++" />
        <Button
          var.count="{0}"
          testId="localButton"
          label="Local Button: {count}"
          onClick="count++" />
      </App>
    `,
      {
        mainXs: `
      var count = 42;
    `,
      },
    );

    await expect(page.getByTestId("globalText")).toHaveText("Global: 42");
    await expect(page.getByTestId("localButton")).toHaveText("Local Button: 0");
    
    // Click global button
    await page.getByRole("button", { name: "Global Button: 42" }).click();
    await expect(page.getByTestId("globalText")).toHaveText("Global: 43");
    await expect(page.getByTestId("localButton")).toHaveText("Local Button: 0");
    
    // Click local button
    await page.getByTestId("localButton").click();
    await expect(page.getByTestId("globalText")).toHaveText("Global: 43");
    await expect(page.getByTestId("localButton")).toHaveText("Local Button: 1");
  });

  test("multiple custom components share global state", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <IncButton label="Button 1" />
        <IncButton label="Button 2" />
        <IncButton label="Button 3" />
      </App>
    `,
      {
        components: [
          `
      <Component name="IncButton">
        <Button
          label="{($props.label ?? 'Click') + ': ' + count}"
          onClick="count++" />
      </Component>
    `,
        ],
        mainXs: `
      var count = 5;
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 5");
    
    await page.getByRole("button", { name: "Button 1: 5" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 6");
    
    await page.getByRole("button", { name: "Button 2: 6" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 7");
    
    await page.getByRole("button", { name: "Button 3: 7" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 8");
  });

  test("global variable with complex expression", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="resultText">Result: {result}</Text>
      </App>
    `,
      {
        mainXs: `
      var result = 6 * 7;
    `,
      },
    );

    await expect(page.getByTestId("resultText")).toHaveText("Result: 42");
  });

  test("global function modifying global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Text testId="countText">Count: {count}</Text>
        <Button label="Increment" onClick="incrementCount()" />
      </App>
    `,
      {
        mainXs: `
      var count = 0;

      function incrementCount() {
        count++;
      }
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 0");
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 1");
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 2");
  });

  test("complete prototype app from requirements", async ({ page, initTestBed }) => {
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
          testId="localButton"
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

    // Initial values
    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await expect(page.getByTestId("getCountText")).toHaveText("getCount: 42");
    
    // Click first button
    await page.getByRole("button", { name: "First Button: 42" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
    await expect(page.getByTestId("getCountText")).toHaveText("getCount: 43");
    
    // Click second button
    await page.getByRole("button", { name: "Second Button: 43" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 44");
    
    // Click third button
    await page.getByRole("button", { name: "3rd button: 44" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 45");
    
    // Local button should still show 0
    await expect(page.getByTestId("localButton")).toHaveText("4th button (local): 0");
    
    // Click local button
    await page.getByTestId("localButton").click();
    await expect(page.getByTestId("localButton")).toHaveText("4th button (local): 1");
    
    // Global count should be unchanged
    await expect(page.getByTestId("countText")).toHaveText("Count: 45");
  });

  test("raises T032 error when component declares global variable", async ({
    page,
    initTestBed,
  }) => {
    // Attempting to create a component with global variables should fail at parse time
    let didThrow = false;
    let errorDetails = "";
    
    try {
      await initTestBed(
        `
        <App>
          <Text>This should not render</Text>
        </App>
      `,
        {
          components: [
            `
        <Component name="BadComponent" global.badGlobal="42">
          <Text>{badGlobal}</Text>
        </Component>
      `,
          ],
        },
      );
    } catch (error) {
      didThrow = true;
      // Capture all error details
      errorDetails = JSON.stringify(error, null, 2);
      if (error instanceof Error) {
        if (error.message) errorDetails += "\nMessage: " + error.message;
        if (error.stack) errorDetails += "\nStack: " + error.stack;
      }
    }

    // Should have thrown an error
    expect(didThrow).toBe(true);
    
    // Error details should contain the T032 error code
    expect(errorDetails).toContain("T032");
  });
});
