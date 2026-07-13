import type { Locator } from "@playwright/test";

import { expect, test } from "../../src/testing/fixtures";

test.describe("styles-and-themes docs compatibility", () => {
  test("theme variable docs examples resolve color, font, and spacing values", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Theme
        color-primary="#ff00ff"
        color-surface-100="#f0f9ff"
        fontSize="20px"
        fontFamily-Text="'Courier New', monospace"
        fontWeight-Text="700"
        lineHeight-Text="30px"
        space-5="20px">
        <VStack
          testId="docs-theme-root"
          gap="$space-5"
          padding="$space-5"
          backgroundColor="$color-surface-100">
          <Text
            testId="docs-theme-text"
            color="$color-primary"
            fontSize="$fontSize">
            Themed docs text
          </Text>
        </VStack>
      </Theme>
    `);

    const root = page.getByTestId("docs-theme-root");
    await expect(root).toHaveCSS("gap", "20px");
    await expect(root).toHaveCSS("padding", "20px");
    await expect(root).toHaveCSS("background-color", "rgb(240, 249, 255)");

    const text = page.getByTestId("docs-theme-text");
    await expect(text).toHaveCSS("color", "rgb(255, 0, 255)");
    await expect(text).toHaveCSS("font-size", "20px");
    await expect(text).toHaveCSS("font-weight", "700");
    await expect(text).toHaveCSS("line-height", "30px");
    await expect.poll(() => cssValue(text, "font-family")).toContain("Courier New");
  });

  test("common units docs examples apply old style prop surface", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <VStack gap="16px">
        <Stack
          testId="docs-unit-card"
          width="240px"
          height="80px"
          backgroundColor="#ff00ff"
          border="3px dashed #ff00ff"
          borderRadius="20px"
          boxShadow="12px 12px 5px 0px orangered"
          cursor="auto" />
        <Text
          testId="docs-unit-text"
          textDecorationLine="underline"
          textDecorationColor="#ff00ff"
          textDecorationStyle="wavy"
          textDecorationThickness="3px"
          textUnderlineOffset="4px"
          fontVariant="small-caps"
          textShadow="2px 2px 1px #00ff00"
          textIndent="24px"
          wordBreak="break-all"
          wordSpacing="8px"
          wordWrap="break-word"
          writingMode="vertical-rl"
          zoom="1.25">
          Unit text
        </Text>
      </VStack>
    `);

    const card = page.getByTestId("docs-unit-card");
    await expect(card).toHaveCSS("width", "240px");
    await expect(card).toHaveCSS("height", "80px");
    await expect(card).toHaveCSS("background-color", "rgb(255, 0, 255)");
    await expect(card).toHaveCSS("border-top-style", "dashed");
    await expect(card).toHaveCSS("border-top-width", "3px");
    await expect(card).toHaveCSS("border-radius", "20px");
    await expect(card).toHaveCSS("cursor", "auto");
    await expect.poll(() => cssValue(card, "box-shadow")).toContain("rgb(255, 69, 0) 12px 12px 5px");

    const text = page.getByTestId("docs-unit-text");
    await expect(text).toHaveCSS("text-decoration-line", "underline");
    await expect(text).toHaveCSS("text-decoration-color", "rgb(255, 0, 255)");
    await expect(text).toHaveCSS("text-decoration-style", "wavy");
    await expect(text).toHaveCSS("text-decoration-thickness", "3px");
    await expect(text).toHaveCSS("text-underline-offset", "4px");
    await expect(text).toHaveCSS("font-variant", "small-caps");
    await expect(text).toHaveCSS("text-indent", "24px");
    await expect(text).toHaveCSS("word-break", "break-all");
    await expect(text).toHaveCSS("word-spacing", "8px");
    await expect(text).toHaveCSS("overflow-wrap", "break-word");
    await expect(text).toHaveCSS("writing-mode", "vertical-rl");
    await expect(text).toHaveCSS("zoom", "1.25");
    await expect.poll(() => cssValue(text, "text-shadow")).toContain("rgb(0, 255, 0) 2px 2px 1px");
  });

  test("docs style props update rendered CSS after state mutation", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App var.compact="{false}">
        <VStack gap="{compact ? '4px' : '18px'}" padding="12px">
          <Stack
            testId="docs-mutable-card"
            width="{compact ? '180px' : '260px'}"
            height="64px"
            backgroundColor="{compact ? '#008000' : '#ff00ff'}"
            border="{compact ? '4px dotted #008000' : '3px dashed #ff00ff'}"
            borderRadius="{compact ? '4px' : '20px'}" />
          <Text testId="docs-mutable-mode">
            Mode: {compact ? 'compact' : 'comfortable'}
          </Text>
          <Button testId="docs-mutable-toggle" onClick="compact = !compact">
            Toggle docs styles
          </Button>
        </VStack>
      </App>
    `);

    const card = page.getByTestId("docs-mutable-card");
    await expect(page.getByTestId("docs-mutable-mode")).toHaveText("Mode: comfortable");
    await expect(card).toHaveCSS("width", "260px");
    await expect(card).toHaveCSS("background-color", "rgb(255, 0, 255)");
    await expect(card).toHaveCSS("border-top-style", "dashed");
    await expect(card).toHaveCSS("border-radius", "20px");

    await page.getByTestId("docs-mutable-toggle").click();

    await expect(page.getByTestId("docs-mutable-mode")).toHaveText("Mode: compact");
    await expect(card).toHaveCSS("width", "180px");
    await expect(card).toHaveCSS("background-color", "rgb(0, 128, 0)");
    await expect(card).toHaveCSS("border-top-style", "dotted");
    await expect(card).toHaveCSS("border-top-width", "4px");
    await expect(card).toHaveCSS("border-radius", "4px");
  });
});

async function cssValue(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((element, cssProperty) =>
    getComputedStyle(element).getPropertyValue(cssProperty),
  property);
}
