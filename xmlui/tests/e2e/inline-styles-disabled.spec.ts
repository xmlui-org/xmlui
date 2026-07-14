import { expect, test } from "../../src/testing/fixtures";

test.describe("inline styles disabled compatibility", () => {
  test("appGlobals.disableInlineStyle removes visual inline styles but keeps dimensions", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <App>
          <Stack
            testId="stack"
            width="200px"
            height="100px"
            padding="12px"
            border="3px solid red"
            backgroundColor="purple"
            color="white">
            <Text testId="heading" color="white">Inline styles disabled</Text>
          </Stack>
        </App>
      `,
      {
        appGlobals: {
          disableInlineStyle: true,
        },
      },
    );

    const stack = page.getByTestId("stack");
    await expect(stack).toHaveCSS("width", "200px");
    await expect(stack).toHaveCSS("height", "100px");
    await expect(stack).not.toHaveCSS("padding-top", "12px");
    await expect(stack).not.toHaveCSS("border-top-width", "3px");
    await expect(stack).not.toHaveCSS("background-color", "rgb(128, 0, 128)");
    await expect(page.getByTestId("heading")).not.toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("appGlobals.disableInlineStyle=false preserves inline visual styles", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <App>
          <Stack
            testId="stack"
            width="200px"
            height="100px"
            backgroundColor="purple"
            color="white">
            <Text testId="heading" color="white">Inline styles enabled</Text>
          </Stack>
        </App>
      `,
      {
        appGlobals: {
          disableInlineStyle: false,
        },
      },
    );

    await expect(page.getByTestId("stack")).toHaveCSS("background-color", "rgb(128, 0, 128)");
    await expect(page.getByTestId("heading")).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("Theme disableInlineStyle overrides appGlobals and scopes to children", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <App>
          <HStack gap="8px">
            <Stack testId="outside" width="150px" height="80px" backgroundColor="green" color="black">
              <Text testId="outsideText" color="black">Outside</Text>
            </Stack>
            <Theme disableInlineStyle="true">
              <Stack testId="disabled" width="150px" height="80px" backgroundColor="purple" color="white">
                <Text testId="disabledText" color="white">Disabled</Text>
              </Stack>
              <Theme disableInlineStyle="false">
                <Stack testId="enabled" width="150px" height="80px" backgroundColor="blue" color="yellow">
                  <Text testId="enabledText" color="yellow">Enabled</Text>
                </Stack>
              </Theme>
            </Theme>
          </HStack>
        </App>
      `,
      {
        appGlobals: {
          disableInlineStyle: false,
        },
      },
    );

    await expect(page.getByTestId("outside")).toHaveCSS("background-color", "rgb(0, 128, 0)");
    await expect(page.getByTestId("outsideText")).toHaveCSS("color", "rgb(0, 0, 0)");

    const disabled = page.getByTestId("disabled");
    await expect(disabled).toHaveCSS("width", "150px");
    await expect(disabled).toHaveCSS("height", "80px");
    await expect(disabled).not.toHaveCSS("background-color", "rgb(128, 0, 128)");
    await expect(page.getByTestId("disabledText")).not.toHaveCSS("color", "rgb(255, 255, 255)");

    await expect(page.getByTestId("enabled")).toHaveCSS("background-color", "rgb(0, 0, 255)");
    await expect(page.getByTestId("enabledText")).toHaveCSS("color", "rgb(255, 255, 0)");
  });

  test("Theme without disableInlineStyle uses appGlobals setting", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <App>
          <Theme>
            <Stack testId="stack" width="200px" height="100px" backgroundColor="purple" color="white">
              <Text testId="heading" color="white">Uses global setting</Text>
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

    await expect(page.getByTestId("stack")).toHaveCSS("width", "200px");
    await expect(page.getByTestId("stack")).not.toHaveCSS("background-color", "rgb(128, 0, 128)");
    await expect(page.getByTestId("heading")).not.toHaveCSS("color", "rgb(255, 255, 255)");
  });
});
