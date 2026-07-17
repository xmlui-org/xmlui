import type { Locator } from "@playwright/test";

import { expect, test } from "../../src/testing/fixtures";
import { websiteThemes } from "./website-theme-fixtures";

test.describe("website theme parity", () => {
  test("website default theme drives root App, header, nav, and text styling", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
        <App layout="vertical" scrollWholePage="false">
          <AppHeader testId="site-header">
            <Text>XMLUI</Text>
          </AppHeader>
          <NavPanel testId="site-nav">
            <NavLink to="/">Home</NavLink>
          </NavPanel>
          <Text testId="site-copy">Website copy</Text>
        </App>
      `,
      {
        themes: websiteThemes,
        defaultTheme: "xmlui-website-theme",
      },
    );

    await expect(page.getByTestId("site-header")).toBeVisible();
    await expect(page.getByTestId("site-nav")).toBeVisible();
    await expect(page.getByTestId("site-copy")).toBeVisible();

    await expect(page.getByTestId("site-header")).toHaveCSS("height", "44px");
    await expect(page.getByTestId("site-nav")).toHaveCSS("width", "280px");
    await expect(page.getByTestId("site-copy")).toHaveCSS("font-size", "15px");
    await expectRgbClose(page.getByTestId("site-copy"), "color", "rgb(99, 98, 106)", 8);
  });

  test("hero and landing themes can be scoped over website content", async ({ initTestBed, page }) => {
    await initTestBed(
      `
        <App>
          <VStack gap="16px">
            <Theme themeId="xmlui-hero-theme">
              <CodeBlock testId="hero-code">
                <Text variant="codefence">const hero = true;</Text>
              </CodeBlock>
            </Theme>
            <Theme themeId="xmlui-landing-theme">
              <CodeBlock testId="landing-code">
                <Text variant="codefence">const landing = true;</Text>
              </CodeBlock>
            </Theme>
            <Theme themeId="xmlui-green-on-default">
              <Button testId="green-button" label="Green default" variant="solid" themeColor="primary" />
            </Theme>
          </VStack>
        </App>
      `,
      {
        themes: websiteThemes,
        defaultTheme: "xmlui-website-theme",
      },
    );

    await expect(page.getByTestId("hero-code")).toBeVisible();
    await expect(page.getByTestId("landing-code")).toBeVisible();
    await expect(page.getByTestId("green-button")).toBeVisible();

    await expect(page.getByTestId("hero-code")).toHaveCSS("margin-top", "0px");
    await expect(page.getByTestId("hero-code")).toHaveCSS("margin-bottom", "0px");
    await expect(page.getByTestId("hero-code")).toHaveCSS("border-radius", "0px");
    await expect(page.getByTestId("landing-code")).toHaveCSS("margin-top", "0px");
    await expect(page.getByTestId("landing-code")).toHaveCSS("margin-bottom", "0px");

    const websiteButtonColor = await cssValue(page.getByTestId("green-button"), "background-color");
    expect(websiteButtonColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});

async function cssValue(locator: Locator, property: string) {
  return locator.evaluate((element, propertyName) => getComputedStyle(element).getPropertyValue(propertyName), property);
}

async function expectRgbClose(locator: Locator, property: string, expected: string, tolerance = 2) {
  const actual = parseRgb(await cssValue(locator, property));
  const target = parseRgb(expected);
  expect(actual).not.toBeNull();
  expect(target).not.toBeNull();
  for (let index = 0; index < 3; index++) {
    expect(Math.abs(actual![index] - target![index])).toBeLessThanOrEqual(tolerance);
  }
}

function parseRgb(value: string) {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) {
    return null;
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
