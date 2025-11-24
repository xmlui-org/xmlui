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
});
