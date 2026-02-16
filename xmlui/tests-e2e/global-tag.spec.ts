import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// GLOBAL TAG E2E TESTS
// =============================================================================
// These tests verify the <global> tag functionality in end-to-end scenarios,
// complementing the unit and integration tests with real browser rendering.
// Using noFragmentWrapper: true to allow App as root element for global.* attributes.

test.describe("Global Tag - Basic Functionality", () => {
  test("displays global variable declared with <global> element", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App>
        <global name="count" value="{6*7}"/>
        <Text testId="countText">Count: {count}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
  });

  test("displays global variable declared with global.* attribute", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.count="{6*7}">
        <Text testId="countText">Count: {count}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
  });

  test("modifies global variable via button click", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.count="{42}">
        <Text testId="countText">Count: {count}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
  });

  test("multiple components share same global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.count="{100}">
        <Text testId="text1">Text 1: {count}</Text>
        <Text testId="text2">Text 2: {count}</Text>
        <Button label="Increment: {count}" onClick="count++" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("text1")).toHaveText("Text 1: 100");
    await expect(page.getByTestId("text2")).toHaveText("Text 2: 100");

    await page.getByRole("button", { name: "Increment: 100" }).click();

    await expect(page.getByTestId("text1")).toHaveText("Text 1: 101");
    await expect(page.getByTestId("text2")).toHaveText("Text 2: 101");
  });

  test("global variable with complex expression", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.result="{6 * 7}">
        <Text testId="resultText">Result: {result}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("resultText")).toHaveText("Result: 42");
  });

  test("multiple globals declared with mixed syntax", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.count="{0}" global.title="{'Counter App'}">
        <global name="version" value="{'1.0.0'}"/>
        <Text testId="titleText">{title}</Text>
        <Text testId="countText">Count: {count}</Text>
        <Text testId="versionText">v{version}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("titleText")).toHaveText("Counter App");
    await expect(page.getByTestId("countText")).toHaveText("Count: 0");
    await expect(page.getByTestId("versionText")).toHaveText("v1.0.0");

    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 1");
  });
});

test.describe("Global Tag - Compound Components", () => {
  test("compound component accesses global variable from root", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.count="{10}">
        <Text testId="countText">Count: {count}</Text>
        <IncButton label="Custom Button" />
      </App>
    `,
      {
        noFragmentWrapper: true,
        components: [
          `
      <Component name="IncButton">
        <Button
          label="{$props.label + ': ' + count}"
          onClick="count++" />
      </Component>
    `,
        ],
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 10");
    await page.getByRole("button", { name: "Custom Button: 10" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 11");
  });

  test("multiple compound components share global state", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.count="{5}">
        <Text testId="countText">Count: {count}</Text>
        <IncButton label="Button 1" />
        <IncButton label="Button 2" />
        <IncButton label="Button 3" />
      </App>
    `,
      {
        noFragmentWrapper: true,
        components: [
          `
      <Component name="IncButton">
        <Button
          label="{($props.label ?? 'Click') + ': ' + count}"
          onClick="count++" />
      </Component>
    `,
        ],
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
});

test.describe("Global Tag - Variable Shadowing", () => {
  test("local variable shadows global variable", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.count="{42}">
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
      { noFragmentWrapper: true },
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

  test("nested component with local variable shadows global", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.value="{100}">
        <Text testId="outerText">Outer: {value}</Text>
        <Stack var.value="{50}">
          <Text testId="innerText">Inner: {value}</Text>
          <Button
            testId="innerButton"
            label="Inner Button"
            onClick="value++" />
        </Stack>
        <Button
          testId="outerButton"
          label="Outer Button"
          onClick="value++" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("outerText")).toHaveText("Outer: 100");
    await expect(page.getByTestId("innerText")).toHaveText("Inner: 50");

    // Click inner button - affects local only
    await page.getByTestId("innerButton").click();
    await expect(page.getByTestId("outerText")).toHaveText("Outer: 100");
    await expect(page.getByTestId("innerText")).toHaveText("Inner: 51");

    // Click outer button - affects global
    await page.getByTestId("outerButton").click();
    await expect(page.getByTestId("outerText")).toHaveText("Outer: 101");
    await expect(page.getByTestId("innerText")).toHaveText("Inner: 51");
  });
});

test.describe("Global Tag - Integration with Globals.xs", () => {
  test("global tag coexists with Globals.xs variables", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.tagCount="{10}">
        <Text testId="tagCountText">Tag Count: {tagCount}</Text>
        <Text testId="xsCountText">XS Count: {xsCount}</Text>
        <Button
          label="Increment Tag"
          onClick="tagCount++" />
        <Button
          label="Increment XS"
          onClick="xsCount++" />
      </App>
    `,
      {
        noFragmentWrapper: true,
        mainXs: `
      var xsCount = 20;
    `,
      },
    );

    await expect(page.getByTestId("tagCountText")).toHaveText("Tag Count: 10");
    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 20");

    await page.getByRole("button", { name: "Increment Tag" }).click();
    await expect(page.getByTestId("tagCountText")).toHaveText("Tag Count: 11");

    await page.getByRole("button", { name: "Increment XS" }).click();
    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 21");
  });

  test("Globals.xs functions can access global tag variables", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.count="{5}">
        <Text testId="countText">Count: {count}</Text>
        <Text testId="doubleText">Double: {getDouble()}</Text>
        <Button
          label="Increment"
          onClick="count++" />
      </App>
    `,
      {
        noFragmentWrapper: true,
        mainXs: `
      function getDouble() {
        return count * 2;
      }
    `,
      },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 5");
    await expect(page.getByTestId("doubleText")).toHaveText("Double: 10");

    await page.getByRole("button", { name: "Increment" }).click();

    await expect(page.getByTestId("countText")).toHaveText("Count: 6");
    await expect(page.getByTestId("doubleText")).toHaveText("Double: 12");
  });

  test("Globals.xs takes precedence over global tag with same name", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.count="{100}">
        <Text testId="countText">Count: {count}</Text>
        <Button
          label="Increment"
          onClick="count++" />
      </App>
    `,
      {
        noFragmentWrapper: true,
        mainXs: `
      var count = 42;
    `,
      },
    );

    // Globals.xs value should win
    await expect(page.getByTestId("countText")).toHaveText("Count: 42");

    await page.getByRole("button", { name: "Increment" }).click();
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
  });
});

test.describe("Global Tag - Complex Scenarios", () => {
  test("complete app with mixed global sources", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.tagCount="{0}" global.appName="{'Counter'}">
        <Text testId="appNameText">{appName}</Text>
        <Text testId="tagCountText">Tag Count: {tagCount}</Text>
        <Text testId="xsCountText">XS Count: {xsCount}</Text>
        <Text testId="totalText">Total: {tagCount + xsCount}</Text>
        <IncButton label="Increment Tag" target="tagCount" />
        <IncButton label="Increment XS" target="xsCount" />
        <Button
          var.tagCount="{0}"
          testId="localButton"
          label="Local (shadowed): {tagCount}"
          onClick="tagCount++" />
      </App>
    `,
      {
        noFragmentWrapper: true,
        components: [
          `
      <Component name="IncButton">
        <Button
          onClick="
            if ($props.target === 'tagCount') {
              tagCount++;
            } else {
              xsCount++;
            }
          "
          label="{$props.label}" />
      </Component>
    `,
        ],
        mainXs: `
      var xsCount = 0;
    `,
      },
    );

    // Initial state
    await expect(page.getByTestId("appNameText")).toHaveText("Counter");
    await expect(page.getByTestId("tagCountText")).toHaveText("Tag Count: 0");
    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 0");
    await expect(page.getByTestId("totalText")).toHaveText("Total: 0");
    await expect(page.getByTestId("localButton")).toHaveText("Local (shadowed): 0");

    // Increment tag count
    await page.getByRole("button", { name: "Increment Tag" }).click();
    await expect(page.getByTestId("tagCountText")).toHaveText("Tag Count: 1");
    await expect(page.getByTestId("totalText")).toHaveText("Total: 1");
    await expect(page.getByTestId("localButton")).toHaveText("Local (shadowed): 0");

    // Increment XS count
    await page.getByRole("button", { name: "Increment XS" }).click();
    await expect(page.getByTestId("xsCountText")).toHaveText("XS Count: 1");
    await expect(page.getByTestId("totalText")).toHaveText("Total: 2");

    // Increment local (shadowed) count
    await page.getByTestId("localButton").click();
    await expect(page.getByTestId("localButton")).toHaveText("Local (shadowed): 1");
    await expect(page.getByTestId("totalText")).toHaveText("Total: 2"); // Global unchanged
  });

  test("global variables with object and array values", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.config="{{ api: 'https://api.example.com', timeout: 5000 }}" global.items="{[1, 2, 3]}">
        <Text testId="apiText">API: {config.api}</Text>
        <Text testId="timeoutText">Timeout: {config.timeout}</Text>
        <Text testId="itemsText">Items: {items.length}</Text>
        <Button
          label="Add Item"
          onClick="items.push(items.length + 1)" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("apiText")).toHaveText("API: https://api.example.com");
    await expect(page.getByTestId("timeoutText")).toHaveText("Timeout: 5000");
    await expect(page.getByTestId("itemsText")).toHaveText("Items: 3");

    await page.getByRole("button", { name: "Add Item" }).click();
    await expect(page.getByTestId("itemsText")).toHaveText("Items: 4");
  });

  test("global variables in conditional rendering", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.showContent="{false}">
        <Button
          testId="toggleButton"
          label="Toggle"
          onClick="showContent = !showContent" />
        <Text testId="visibleText" when="{showContent}">Content is visible</Text>
        <Text testId="hiddenText" when="{!showContent}">Content is hidden</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("hiddenText")).toBeVisible();
    await expect(page.getByTestId("visibleText")).not.toBeVisible();

    await page.getByTestId("toggleButton").click();

    await expect(page.getByTestId("hiddenText")).not.toBeVisible();
    await expect(page.getByTestId("visibleText")).toBeVisible();
  });
});

test.describe("Global Tag - Variable Dependencies", () => {
  test("global variable can reference other global variables", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.count="{6*8}" global.dummy="{count*3}">
        <Text testId="countText">Count: {count}</Text>
        <Text testId="dummyText">Dummy: {dummy}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("countText")).toHaveText("Count: 48");
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 144");
  });

  test("multiple global variables with chained dependencies", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App global.a="{2}" global.b="{a*3}" global.c="{b+10}">
        <Text testId="aText">A: {a}</Text>
        <Text testId="bText">B: {b}</Text>
        <Text testId="cText">C: {c}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("aText")).toHaveText("A: 2");
    await expect(page.getByTestId("bText")).toHaveText("B: 6");
    await expect(page.getByTestId("cText")).toHaveText("C: 16");
  });

  test("global variables with mixed element and attribute syntax and dependencies", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.x="{5}">
        <global name="y" value="{x*2}"/>
        <global name="z" value="{y+x}"/>
        <Text testId="xText">X: {x}</Text>
        <Text testId="yText">Y: {y}</Text>
        <Text testId="zText">Z: {z}</Text>
      </App>
    `,
      { noFragmentWrapper: true },
    );

    await expect(page.getByTestId("xText")).toHaveText("X: 5");
    await expect(page.getByTestId("yText")).toHaveText("Y: 10");
    await expect(page.getByTestId("zText")).toHaveText("Z: 15");
  });

  test("dependent global variables are reevaluated when dependencies change", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <App global.count="{6*7}" global.dummy="{count*3}">
        <Text testId="countText">Count: {count}</Text>
        <Text testId="dummyText">Dummy: {dummy}</Text>
        <Button label="Increment" onClick="count++" />
      </App>
    `,
      { noFragmentWrapper: true },
    );

    // Initial state
    await expect(page.getByTestId("countText")).toHaveText("Count: 42");
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 126");

    // Click button to increment count
    await page.getByRole("button", { name: "Increment" }).click();

    // Both count and dummy should be updated
    await expect(page.getByTestId("countText")).toHaveText("Count: 43");
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 129");

    // Click again
    await page.getByRole("button", { name: "Increment" }).click();

    // Verify both updated again
    await expect(page.getByTestId("countText")).toHaveText("Count: 44");
    await expect(page.getByTestId("dummyText")).toHaveText("Dummy: 132");
  });
});
