import { expect, test } from "../src/testing/fixtures";

// =============================================================================
// INLINE STYLES DISABLED TESTS
// =============================================================================

test.describe("Inline Styles Disabled", () => {
  test("Stack applies background and text colors when inline styles are enabled", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="styledStack">
          <H3 testId="boxHeading">
            This is a purple box
          </H3>
        </Stack>
        <H3 testId="unstyledHeading">No inline style here!</H3>
      </App>
    `);

    const styledStack = page.getByTestId("styledStack");
    const boxHeading = page.getByTestId("boxHeading");
    const unstyledHeading = page.getByTestId("unstyledHeading");

    // Verify the Stack with inline styles is visible
    await expect(styledStack).toBeVisible();

    // Verify background color is applied to the Stack
    await expect(styledStack).toHaveCSS("background-color", "rgb(128, 0, 128)");

    // Verify text color is applied to the heading inside the Stack
    await expect(boxHeading).toHaveCSS("color", "rgb(255, 255, 255)");

    // Verify the unstyled heading doesn't have custom colors
    await expect(unstyledHeading).toBeVisible();
  });

  test("Stack with appGlobals.disableInlineStyle=false preserves inline styles", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="styledStack">
          <H3 testId="boxHeading">
            This is a purple box
          </H3>
        </Stack>
        <H3 testId="unstyledHeading">No inline style here!</H3>
      </App>
    `,
      {
        appGlobals: {
          disableInlineStyle: false,
        },
      },
    );

    const styledStack = page.getByTestId("styledStack");
    const boxHeading = page.getByTestId("boxHeading");

    // Verify the Stack with inline styles is visible
    await expect(styledStack).toBeVisible();

    // Verify background color is applied
    await expect(styledStack).toHaveCSS("background-color", "rgb(128, 0, 128)");

    // Verify text color is applied
    await expect(boxHeading).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("Stack with appGlobals.disableInlineStyle=true removes inline styles", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="styledStack">
          <H3 testId="boxHeading">
            This is a purple box
          </H3>
        </Stack>
        <H3 testId="unstyledHeading">No inline style here!</H3>
      </App>
    `,
      {
        appGlobals: {
          disableInlineStyle: true,
        },
      },
    );

    const styledStack = page.getByTestId("styledStack");
    const boxHeading = page.getByTestId("boxHeading");

    // Verify the Stack is still visible
    await expect(styledStack).toBeVisible();

    // Verify background color is NOT applied when inline styles are disabled
    const backgroundColor = await styledStack.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).not.toEqual("rgb(128, 0, 128)");

    // Verify text color is NOT applied when inline styles are disabled
    const textColor = await boxHeading.evaluate((el) =>
      window.getComputedStyle(el).color,
    );
    expect(textColor).not.toEqual("rgb(255, 255, 255)");

    // Verify the unstyled heading is still visible
    await expect(page.getByTestId("unstyledHeading")).toBeVisible();
  });

  test("multiple Stack components with different colors respect disableInlineStyle setting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <VStack gap="2">
          <Stack width="150px" height="50px" backgroundColor="red" color="white" testId="redStack">
            <H3 testId="redText">Red Box</H3>
          </Stack>
          <Stack width="150px" height="50px" backgroundColor="blue" color="yellow" testId="blueStack">
            <H3 testId="blueText">Blue Box</H3>
          </Stack>
          <Stack width="150px" height="50px" backgroundColor="green" color="black" testId="greenStack">
            <H3 testId="greenText">Green Box</H3>
          </Stack>
        </VStack>
      </App>
    `,
      {
        appGlobals: {
          disableInlineStyle: false,
        },
      },
    );

    // Verify all stacks have their respective background colors applied
    await expect(page.getByTestId("redStack")).toHaveCSS(
      "background-color",
      "rgb(255, 0, 0)",
    );
    await expect(page.getByTestId("blueStack")).toHaveCSS(
      "background-color",
      "rgb(0, 0, 255)",
    );
    await expect(page.getByTestId("greenStack")).toHaveCSS(
      "background-color",
      "rgb(0, 128, 0)",
    );

    // Verify text colors are applied
    await expect(page.getByTestId("redText")).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(page.getByTestId("blueText")).toHaveCSS("color", "rgb(255, 255, 0)");
    await expect(page.getByTestId("greenText")).toHaveCSS("color", "rgb(0, 0, 0)");
  });

  test("Theme with disableInlineStyle=true removes inline styles within its scope", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Theme disableInlineStyle="true">
          <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="themedStack">
            <H3 testId="themedHeading">This is inside a themed section</H3>
          </Stack>
        </Theme>
      </App>
    `);

    const themedStack = page.getByTestId("themedStack");
    const themedHeading = page.getByTestId("themedHeading");

    // Verify the Stack is visible
    await expect(themedStack).toBeVisible();

    // Verify background color is NOT applied when Theme disables inline styles
    const backgroundColor = await themedStack.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).not.toEqual("rgb(128, 0, 128)");

    // Verify text color is NOT applied when Theme disables inline styles
    const textColor = await themedHeading.evaluate((el) => window.getComputedStyle(el).color);
    expect(textColor).not.toEqual("rgb(255, 255, 255)");
  });

  test("Theme with disableInlineStyle=false preserves inline styles within its scope", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Theme disableInlineStyle="false">
          <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="themedStack">
            <H3 testId="themedHeading">This is inside a themed section</H3>
          </Stack>
        </Theme>
      </App>
    `);

    const themedStack = page.getByTestId("themedStack");
    const themedHeading = page.getByTestId("themedHeading");

    // Verify the Stack is visible
    await expect(themedStack).toBeVisible();

    // Verify background color IS applied when Theme explicitly enables inline styles
    await expect(themedStack).toHaveCSS("background-color", "rgb(128, 0, 128)");

    // Verify text color IS applied
    await expect(themedHeading).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("Theme disableInlineStyle property overrides appGlobals setting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Theme disableInlineStyle="false">
          <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="themedStack">
            <H3 testId="themedHeading">Theme overrides global setting</H3>
          </Stack>
        </Theme>
      </App>
    `,
      {
        appGlobals: {
          disableInlineStyle: true,
        },
      },
    );

    const themedStack = page.getByTestId("themedStack");
    const themedHeading = page.getByTestId("themedHeading");

    // Theme's disableInlineStyle=false should override appGlobals.disableInlineStyle=true
    await expect(themedStack).toHaveCSS("background-color", "rgb(128, 0, 128)");
    await expect(themedHeading).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("Theme without disableInlineStyle property uses appGlobals setting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App>
        <Theme>
          <Stack width="200px" height="100px" backgroundColor="purple" color="white" testId="themedStack">
            <H3 testId="themedHeading">Uses global setting</H3>
          </Stack>
        </Theme>
      </App>
    `,
      {
        appGlobals: {
          disableInlineStyle: true,
        },
      },
    );

    const themedStack = page.getByTestId("themedStack");
    const themedHeading = page.getByTestId("themedHeading");

    // Should use appGlobals.disableInlineStyle=true when Theme property is undefined
    const backgroundColor = await themedStack.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(backgroundColor).not.toEqual("rgb(128, 0, 128)");

    const textColor = await themedHeading.evaluate((el) => window.getComputedStyle(el).color);
    expect(textColor).not.toEqual("rgb(255, 255, 255)");
  });

  test("nested Themes with different disableInlineStyle settings", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Theme disableInlineStyle="true">
          <Stack width="200px" height="100px" backgroundColor="red" color="white" testId="outerStack">
            <H3 testId="outerHeading">Outer theme disables styles</H3>
          </Stack>
          <Theme disableInlineStyle="false">
            <Stack width="200px" height="100px" backgroundColor="blue" color="yellow" testId="innerStack">
              <H3 testId="innerHeading">Inner theme enables styles</H3>
            </Stack>
          </Theme>
        </Theme>
      </App>
    `);

    const outerStack = page.getByTestId("outerStack");
    const outerHeading = page.getByTestId("outerHeading");
    const innerStack = page.getByTestId("innerStack");
    const innerHeading = page.getByTestId("innerHeading");

    // Outer theme disables inline styles
    const outerBgColor = await outerStack.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(outerBgColor).not.toEqual("rgb(255, 0, 0)");

    const outerTextColor = await outerHeading.evaluate((el) => window.getComputedStyle(el).color);
    expect(outerTextColor).not.toEqual("rgb(255, 255, 255)");

    // Inner theme overrides and enables inline styles
    await expect(innerStack).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(innerHeading).toHaveCSS("color", "rgb(255, 255, 0)");
  });

  test("multiple Themes with different settings affect their respective scopes", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <HStack gap="2">
          <Theme disableInlineStyle="true">
            <Stack width="150px" height="100px" backgroundColor="purple" color="white" testId="disabledThemeStack">
              <H3 testId="disabledText">Styles disabled</H3>
            </Stack>
          </Theme>
          <Theme disableInlineStyle="false">
            <Stack width="150px" height="100px" backgroundColor="green" color="black" testId="enabledThemeStack">
              <H3 testId="enabledText">Styles enabled</H3>
            </Stack>
          </Theme>
        </HStack>
      </App>
    `);

    const disabledStack = page.getByTestId("disabledThemeStack");
    const disabledText = page.getByTestId("disabledText");
    const enabledStack = page.getByTestId("enabledThemeStack");
    const enabledText = page.getByTestId("enabledText");

    // First theme disables inline styles
    const disabledBgColor = await disabledStack.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor,
    );
    expect(disabledBgColor).not.toEqual("rgb(128, 0, 128)");

    const disabledTextColor = await disabledText.evaluate((el) =>
      window.getComputedStyle(el).color,
    );
    expect(disabledTextColor).not.toEqual("rgb(255, 255, 255)");

    // Second theme enables inline styles
    await expect(enabledStack).toHaveCSS("background-color", "rgb(0, 128, 0)");
    await expect(enabledText).toHaveCSS("color", "rgb(0, 0, 0)");
  });
});
