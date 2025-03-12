import { test, expect, type ColorChannelCombinations } from "./fixtures";
import { getStyle, getElementStyle, initApp, initThemedApp } from "./component-test-helpers";
import type { Page } from "@playwright/test";

const BTN_MATRIX_CODE = `
<Stack gap="1rem">
  <HStack gap="1rem">
    <Button testId="btnSolPri" label="solid/primary" variant="solid" themeColor="primary" />
    <Button testId="btnOutPri" label="outlined/primary" variant="outlined" themeColor="primary" />
    <Button testId="btnGhoPri" label="ghost/primary" variant="ghost" themeColor="primary" />
  </HStack>
  <HStack gap="1rem">
    <Button testId="btnSolSec" label="solid/secondary" variant="solid" themeColor="secondary" />
    <Button testId="btnOutSec" label="outlined/secondary" variant="outlined" themeColor="secondary" />
    <Button testId="btnGhoSec" label="ghost/secondary" variant="ghost" themeColor="secondary" />
  </HStack>
  <HStack gap="1rem">
    <Button testId="btnSolAtt" label="solid/attention" variant="solid" themeColor="attention" />
    <Button testId="btnOutAtt" label="outlined/attention" variant="outlined" themeColor="attention" />
    <Button testId="btnGhoAtt" label="ghost/attention" variant="ghost" themeColor="attention" />
  </HStack>
</Stack>
`;
const HOVER_DURATION = 30;

const COLORS: Record<ColorChannelCombinations, string> = {
  red: "rgb(255, 0, 0)",
  green: "rgb(0, 255, 0)",
  blue: "rgb(0, 0, 255)",
  grey: "rgb(128,128,128)",
};
const THEME_COLORS = [
  { name: "primary", testIdFragment2: "Pri" },
  { name: "secondary", testIdFragment2: "Sec" },
  { name: "attention", testIdFragment2: "Att" },
] as const;
const VARIANTS = [
  { name: "solid", testIdFragment1: "Sol" },
  { name: "outlined", testIdFragment1: "Out" },
  { name: "ghost", testIdFragment1: "Gho" },
] as const;

const BORDER_STYLES = ["solid", "dotted", "dashed", "double", "none", "hidden", "groove", "ridge", "inset", "outset"];

// dimensions are set just so that the button is well visible in the visual tests
// no particular importance to 480p
const PAGE_WIDTH = 640;
const PAGE_HEIGHT = 480;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

// --- backgroundColor-Button applied to all button combinations. For outlined and ghost, applied after hover
test("backgroundColor-Button to all", async ({
  page,
}) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.red);
  expect(btnSolSecBg).toBe(COLORS.red);
  expect(btnSolAttBg).toBe(COLORS.red);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("red");
  expect(btnOutSecBgPostHover).toBeShadeOf("red");
  expect(btnOutAttBgPostHover).toBeShadeOf("red");
  expect(btnGhoPriBgPostHover).toBeShadeOf("red");
  expect(btnGhoSecBgPostHover).toBeShadeOf("red");
  expect(btnGhoAttBgPostHover).toBeShadeOf("red");
});

// --- backgroundColor-Button-solid applied to all solid buttons. Outlined and ghost default to backgroundColor-Button after hover
test("backgroundColor-Button-solid and hover", async ({ page }) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
      "backgroundColor-Button-solid": COLORS.green,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.green);
  expect(btnSolSecBg).toBe(COLORS.green);
  expect(btnSolAttBg).toBe(COLORS.green);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("red");
  expect(btnOutSecBgPostHover).toBeShadeOf("red");
  expect(btnOutAttBgPostHover).toBeShadeOf("red");
  expect(btnGhoPriBgPostHover).toBeShadeOf("red");
  expect(btnGhoSecBgPostHover).toBeShadeOf("red");
  expect(btnGhoAttBgPostHover).toBeShadeOf("red");
});

// --- backgroundColor-Button-outlined applied to all outlined buttons after hover. Solid defaults to backgroundColor-Button.
// --- Ghost defaults to backgroundColor-Button after hover
test("backgroundColor-Button-outlined and hover", async ({ page }) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
      "backgroundColor-Button-outlined": COLORS.green,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.red);
  expect(btnSolSecBg).toBe(COLORS.red);
  expect(btnSolAttBg).toBe(COLORS.red);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("green");
  expect(btnOutSecBgPostHover).toBeShadeOf("green");
  expect(btnOutAttBgPostHover).toBeShadeOf("green");
  expect(btnGhoPriBgPostHover).toBeShadeOf("red");
  expect(btnGhoSecBgPostHover).toBeShadeOf("red");
  expect(btnGhoAttBgPostHover).toBeShadeOf("red");
});

// --- backgroundColor-Button-ghost applied to all ghost buttons after hover. Solid defaults to backgroundColor-Button.
// --- Outlined defaults to backgroundColor-Button after hover
test("backgroundColor-Button-ghost and hover", async ({ page }) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
      "backgroundColor-Button-ghost": COLORS.green,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.red);
  expect(btnSolSecBg).toBe(COLORS.red);
  expect(btnSolAttBg).toBe(COLORS.red);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("red");
  expect(btnOutSecBgPostHover).toBeShadeOf("red");
  expect(btnOutAttBgPostHover).toBeShadeOf("red");
  expect(btnGhoPriBgPostHover).toBeShadeOf("green");
  expect(btnGhoSecBgPostHover).toBeShadeOf("green");
  expect(btnGhoAttBgPostHover).toBeShadeOf("green");
});

// --- backgroundColor-Button-primary applied to primary buttons. Immediately for solid variant,
// --- after hover for outlined, ghost
test("backgroundColor-Button-primary and hover", async ({ page }) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
      "backgroundColor-Button-primary": COLORS.green,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.green);
  expect(btnSolSecBg).toBe(COLORS.red);
  expect(btnSolAttBg).toBe(COLORS.red);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("green");
  expect(btnOutSecBgPostHover).toBeShadeOf("red");
  expect(btnOutAttBgPostHover).toBeShadeOf("red");
  expect(btnGhoPriBgPostHover).toBeShadeOf("green");
  expect(btnGhoSecBgPostHover).toBeShadeOf("red");
  expect(btnGhoAttBgPostHover).toBeShadeOf("red");
});

// --- backgroundColor-Button-secondary applied to secondary buttons. Immediately for solid variant,
// --- after hover for outlined, ghost
test("backgroundColor-Button-secondary and hover", async ({ page }) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
      "backgroundColor-Button-secondary": COLORS.green,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.red);
  expect(btnSolSecBg).toBe(COLORS.green);
  expect(btnSolAttBg).toBe(COLORS.red);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("red");
  expect(btnOutSecBgPostHover).toBeShadeOf("green");
  expect(btnOutAttBgPostHover).toBeShadeOf("red");
  expect(btnGhoPriBgPostHover).toBeShadeOf("red");
  expect(btnGhoSecBgPostHover).toBeShadeOf("green");
  expect(btnGhoAttBgPostHover).toBeShadeOf("red");
});

// --- backgroundColor-Button-attention applied to attention buttons. Immediately for solid variant,
// --- after hover for outlined, ghost
test("backgroundColor-Button-attention and hover", async ({ page }) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button": COLORS.red,
      "backgroundColor-Button-attention": COLORS.green,
    },
  });
  const btnSolPriBg = await getBgColor(page, "btnSolPri");
  const btnSolSecBg = await getBgColor(page, "btnSolSec");
  const btnSolAttBg = await getBgColor(page, "btnSolAtt");

  const btnOutPriBgPreHover = await getBgColor(page, "btnOutPri");
  const btnOutSecBgPreHover = await getBgColor(page, "btnOutSec");
  const btnOutAttBgPreHover = await getBgColor(page, "btnOutAtt");
  const btnGhoPriBgPreHover = await getBgColor(page, "btnGhoPri");
  const btnGhoSecBgPreHover = await getBgColor(page, "btnGhoSec");
  const btnGhoAttBgPreHover = await getBgColor(page, "btnGhoAtt");

  const btnOutPriBgPostHover = await getBgColorAfterHover(page, "btnOutPri");
  const btnOutSecBgPostHover = await getBgColorAfterHover(page, "btnOutSec");
  const btnOutAttBgPostHover = await getBgColorAfterHover(page, "btnOutAtt");
  const btnGhoPriBgPostHover = await getBgColorAfterHover(page, "btnGhoPri");
  const btnGhoSecBgPostHover = await getBgColorAfterHover(page, "btnGhoSec");
  const btnGhoAttBgPostHover = await getBgColorAfterHover(page, "btnGhoAtt");

  expect(btnSolPriBg).toBe(COLORS.red);
  expect(btnSolSecBg).toBe(COLORS.red);
  expect(btnSolAttBg).toBe(COLORS.green);

  expect(btnOutPriBgPreHover).toBeTransparent();
  expect(btnOutSecBgPreHover).toBeTransparent();
  expect(btnOutAttBgPreHover).toBeTransparent();
  expect(btnGhoPriBgPreHover).toBeTransparent();
  expect(btnGhoSecBgPreHover).toBeTransparent();
  expect(btnGhoAttBgPreHover).toBeTransparent();

  expect(btnOutPriBgPostHover).toBeShadeOf("red");
  expect(btnOutSecBgPostHover).toBeShadeOf("red");
  expect(btnOutAttBgPostHover).toBeShadeOf("green");
  expect(btnGhoPriBgPostHover).toBeShadeOf("red");
  expect(btnGhoSecBgPostHover).toBeShadeOf("red");
  expect(btnGhoAttBgPostHover).toBeShadeOf("green");
});

// backgroundColor solid applied to different themeVariables
THEME_COLORS.forEach((themeColor) => {
  test(`backgroundColor-Button-${themeColor.name}-solid`, async ({ page }) => {
    const EXPECTED = COLORS.green;
    const themeVars = {
      "backgroundColor-Button": COLORS.red,
    };
    themeVars[`backgroundColor-Button-${themeColor.name}-solid`] = EXPECTED;
    await initThemedApp(page, BTN_MATRIX_CODE, { themeVars });

    const testId = "btnSol" + themeColor.testIdFragment2;
    const btnBg = await getBgColor(page, testId);
    expect(btnBg).toBe(EXPECTED);
  });
});

// backgroundColor applied to every button combination where the background color
// is only shown when hovered over
VARIANTS.filter((variant) => variant.name !== "solid").forEach((variant) => {
  THEME_COLORS.forEach((themeColor) => {
    test(`backgroundColor-Button-${themeColor.name}-${variant.name} on hover`, async ({ page }) => {
      const themeVars = {
        "backgroundColor-Button": COLORS.red,
      };
      themeVars[`backgroundColor-Button-${themeColor.name}-${variant.name}`] = COLORS.green;
      await initThemedApp(page, BTN_MATRIX_CODE, { themeVars });

      const testId = "btn" + variant.testIdFragment1 + themeColor.testIdFragment2;
      const btnBgPreHover = await getBgColor(page, testId);
      const btnBgPostHover = await getBgColorAfterHover(page, testId);

      expect(btnBgPreHover).toBeTransparent();
      expect(btnBgPostHover).toBeShadeOf("green");
    });
  });
});

// color-text theme variable applied to every button combination
VARIANTS.forEach((variant) => {
  THEME_COLORS.forEach((themeColor) => {
    test(`color-text-Button-${themeColor.name}-${variant.name}`, async ({ page }) => {
      const EXPECTED = COLORS.green;
      const themeVars = {
        "color-text-Button": COLORS.red,
      };
      themeVars[`color-text-Button-${themeColor.name}-${variant.name}`] = EXPECTED;
      await initThemedApp(page, BTN_MATRIX_CODE, { themeVars });

      const testId = "btn" + variant.testIdFragment1 + themeColor.testIdFragment2;
      const btnColorText = await getStyle(page, testId, "color");

      expect(btnColorText).toBe(EXPECTED);
    });
  });
});

BORDER_STYLES.forEach((borderStyle) => {
  test(`borderStyle-Button: "${borderStyle}" to solid, outlined`, async ({ page }) => {
    await initThemedApp(page, BTN_MATRIX_CODE, {
      themeVars: {
        "borderStyle-Button": borderStyle,
      },
    });

    const btnSolPriStyleBorder = await getStyle(page, "btnSolPri", "border-style");
    const btnSolSecStyleBorder = await getStyle(page, "btnSolSec", "border-style");
    const btnSolAttStyleBorder = await getStyle(page, "btnSolAtt", "border-style");
    const btnOutPriStyleBorder = await getStyle(page, "btnOutPri", "border-style");
    const btnOutSecStyleBorder = await getStyle(page, "btnOutSec", "border-style");
    const btnOutAttStyleBorder = await getStyle(page, "btnOutAtt", "border-style");

    expect(btnSolPriStyleBorder).toBe(borderStyle);
    expect(btnSolSecStyleBorder).toBe(borderStyle);
    expect(btnSolAttStyleBorder).toBe(borderStyle);
    expect(btnOutPriStyleBorder).toBe(borderStyle);
    expect(btnOutSecStyleBorder).toBe(borderStyle);
    expect(btnOutAttStyleBorder).toBe(borderStyle);
  });
});

test(`borderRadius-Button to solid, outlined`, async ({ page }) => {
  const EXPECTED = "5px";
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "borderRadius-Button": EXPECTED,
    },
  });
  const btnSolPriBorderRadius = await getStyle(page, "btnSolPri", "border-radius");
  const btnSolSecBorderRadius = await getStyle(page, "btnSolSec", "border-radius");
  const btnSolAttBorderRadius = await getStyle(page, "btnSolAtt", "border-radius");
  const btnOutPriBorderRadius = await getStyle(page, "btnOutPri", "border-radius");
  const btnOutSecBorderRadius = await getStyle(page, "btnOutSec", "border-radius");
  const btnOutAttBorderRadius = await getStyle(page, "btnOutAtt", "border-radius");

  expect(btnSolPriBorderRadius).toBe(EXPECTED);
  expect(btnSolSecBorderRadius).toBe(EXPECTED);
  expect(btnSolAttBorderRadius).toBe(EXPECTED);
  expect(btnOutPriBorderRadius).toBe(EXPECTED);
  expect(btnOutSecBorderRadius).toBe(EXPECTED);
  expect(btnOutAttBorderRadius).toBe(EXPECTED);
});

test.skip(`borderWidth-Button to solid, outlined`, async ({ page }) => {
  const EXPECTED = "5px";
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "borderWidth-Button": EXPECTED,
    },
  });
  const btnSolPriBorderWidth = await getStyle(page, "btnSolPri", "border-width");
  const btnSolSecBorderWidth = await getStyle(page, "btnSolSec", "border-width");
  const btnSolAttBorderWidth = await getStyle(page, "btnSolAtt", "border-width");
  const btnOutPriBorderWidth = await getStyle(page, "btnOutPri", "border-width");
  const btnOutSecBorderWidth = await getStyle(page, "btnOutSec", "border-width");
  const btnOutAttBorderWidth = await getStyle(page, "btnOutAtt", "border-width");

  expect(btnSolPriBorderWidth).toBe(EXPECTED);
  expect(btnSolSecBorderWidth).toBe(EXPECTED);
  expect(btnSolAttBorderWidth).toBe(EXPECTED);
  expect(btnOutPriBorderWidth).toBe(EXPECTED);
  expect(btnOutSecBorderWidth).toBe(EXPECTED);
  expect(btnOutAttBorderWidth).toBe(EXPECTED);
});

test(`boxShadow-Button to solid, outlined`, async ({ page }) => {
  const EXPECTED = "5px 10px";
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "boxShadow-Button": `${EXPECTED} red`,
    },
  });
  const btnSolPriBorderWidth = await getStyle(page, "btnSolPri", "box-shadow");
  const btnSolSecBorderWidth = await getStyle(page, "btnSolSec", "box-shadow");
  const btnSolAttBorderWidth = await getStyle(page, "btnSolAtt", "box-shadow");
  const btnOutPriBorderWidth = await getStyle(page, "btnOutPri", "box-shadow");
  const btnOutSecBorderWidth = await getStyle(page, "btnOutSec", "box-shadow");
  const btnOutAttBorderWidth = await getStyle(page, "btnOutAtt", "box-shadow");

  expect(btnSolPriBorderWidth).toContain(EXPECTED);
  expect(btnSolSecBorderWidth).toContain(EXPECTED);
  expect(btnSolAttBorderWidth).toContain(EXPECTED);
  expect(btnOutPriBorderWidth).toContain(EXPECTED);
  expect(btnOutSecBorderWidth).toContain(EXPECTED);
  expect(btnOutAttBorderWidth).toContain(EXPECTED);
});

test("borderColor to solid, outlined", async ({ page }) => {
  const EXPECTED = COLORS.green;
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "borderColor-Button": EXPECTED,
    },
  });

  const btnSolPriColorBorder = await getBorderColor(page, "btnSolPri");
  const btnSolSecColorBorder = await getBorderColor(page, "btnSolSec");
  const btnSolAttColorBorder = await getBorderColor(page, "btnSolAtt");
  const btnOutPriColorBorder = await getBorderColor(page, "btnOutPri");
  const btnOutSecColorBorder = await getBorderColor(page, "btnOutSec");
  const btnOutAttColorBorder = await getBorderColor(page, "btnOutAtt");

  expect(btnSolPriColorBorder).toBe(EXPECTED);
  expect(btnSolSecColorBorder).toBe(EXPECTED);
  expect(btnSolAttColorBorder).toBe(EXPECTED);
  expect(btnOutPriColorBorder).toBe(EXPECTED);
  expect(btnOutSecColorBorder).toBe(EXPECTED);
  expect(btnOutAttColorBorder).toBe(EXPECTED);
});

// color-Button for every button combination applies a border with the same color
// except for ghost, which does not have a border
VARIANTS.filter((variant) => variant.name !== "ghost").forEach((variant) => {
  THEME_COLORS.forEach((themeColor) => {
    test(`color-Button-${themeColor.name}-${variant.name} border color`, async ({ page }) => {
      const EXPECTED = COLORS.green;
      const themeVars = {};
      themeVars[`color-Button-${themeColor.name}-${variant.name}`] = EXPECTED;
      await initThemedApp(page, BTN_MATRIX_CODE, { themeVars });

      const testId = "btn" + variant.testIdFragment1 + themeColor.testIdFragment2;
      const btnBorderColor = await getBorderColor(page, testId);

      expect(btnBorderColor).toBe(EXPECTED);
    });
  });
});

// color-Button applies a background color immediately
// with the same shade to every solid button
THEME_COLORS.forEach((themeColor) => {
  test(`color-Button-${themeColor.name}-solid background color`, async ({ page }) => {
    const EXPECTED = COLORS.green;
    const themeVars = {};
    themeVars[`color-Button-${themeColor.name}-solid`] = COLORS.green;
    await initThemedApp(page, BTN_MATRIX_CODE, { themeVars });

    const testId = "btnSol" + themeColor.testIdFragment2;
    const btnBg = await getBgColor(page, testId);
    expect(btnBg).toBe(EXPECTED);
  });
});

// color-Button applies a background color with the same shade
// to every button combination after hover, where the background color
// is only shown when hovered over.
VARIANTS.filter((variant) => variant.name !== "solid").forEach((variant) => {
  THEME_COLORS.forEach((themeColor) => {
    test(`color-Button-${themeColor.name}-${variant.name} bg color on hover`, async ({ page }) => {
      const themeVars = {};
      themeVars[`color-Button-${themeColor.name}-${variant.name}`] = COLORS.green;
      await initThemedApp(page, BTN_MATRIX_CODE, { themeVars });

      const testId = "btn" + variant.testIdFragment1 + themeColor.testIdFragment2;
      const btnBgPreHover = await getBgColor(page, testId);
      const btnBgPostHover = await getBgColorAfterHover(page, testId);

      expect(btnBgPreHover).toBeTransparent();
      expect(btnBgPostHover).toBeShadeOf("green");
    });
  });
});

// Disabled buttons in the markup are actually disabled in the browser.
// Those that have a border should have a grey color
VARIANTS.filter((variant) => variant.name !== "ghost").forEach((variant) => {
  THEME_COLORS.forEach((themeColor) => {
    test(`disabled ${themeColor.name}-${variant.name}, grey border`, async ({ page }) => {
      const EXPECTED = "rgb(205, 219, 228)"
      const entryPoint = `
      <Button testId="btn" label="disabled button" variant="${variant.name}" themeColor="${themeColor.name}" enabled="{false}" />
      `;
      await initApp(page, { entryPoint });

      const btnBorderColor = await getBorderColor(page, "btn");

      await expect(page.getByTestId("btn")).toBeDisabled();
      expect(btnBorderColor).toBe(EXPECTED);
    });
  });
});

THEME_COLORS.forEach((themeColor) => {
  test(`disabled ${themeColor.name}-ghost`, async ({ page }) => {
    const entryPoint = `
      <Button testId="btn" label="disabled button" variant="ghost" themeColor="${themeColor.name}" enabled="{false}" />
      `;
    await initApp(page, { entryPoint });

    await expect(page.getByTestId("btn")).toBeDisabled();
  });
});

test("fontSize-Button-primary-solid", async ({ page }) => {
  const EXPECTED = "20px";
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "fontSize-Button": "10px",
      "fontSize-Button-primary-solid": EXPECTED,
    },
  });
  const btnSolPriFontSize = await getStyle(page, "btnSolPri", "font-size");
  expect(btnSolPriFontSize).toBe(EXPECTED);
});

// --- backgroundColor-Button-primary-solid--hover applied when hovered, falls back to backgroundColor-Button-primary-solid when not hovered
test("backgroundColor-Button-primary-solid--hover", async ({
  page,
}) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button-primary-solid": COLORS.grey,
      "backgroundColor-Button-primary-solid--hover": COLORS.green,
    },
  });
  const btnBgColorPreHover = await getBgColor(page, "btnSolPri");
  const btnBgColorPostHover = await getBgColorAfterHover(page, "btnSolPri");

  expect(btnBgColorPreHover).toBeShadeOf("grey");
  expect(btnBgColorPostHover).toBeShadeOf("green");
});

// --- backgroundColor-Button-primary-solid--active applied while pressed, falls back to backgroundColor-Button-primary-solid when not pressed
test("backgroundColor-Button-primary-solid--active", async ({
  page,
}) => {
  await initThemedApp(page, BTN_MATRIX_CODE, {
    themeVars: {
      "backgroundColor-Button-primary-solid": COLORS.grey,
      "backgroundColor-Button-primary-solid--active": COLORS.green,
    },
  });
  const btnBgColorPreActive = await getBgColor(page, "btnSolPri");
  const btnBgColorWhileActive = await getStyleWhilePressing(page, "btnSolPri", "background-color");

  expect(btnBgColorPreActive).toBeShadeOf("grey");
  expect(btnBgColorWhileActive).toBeShadeOf("green");
});

async function getStyleAfterHover(page: Page, testId: string, style: string) {
  const locator = page.getByTestId(testId);
  await locator.hover();
  await page.waitForTimeout(HOVER_DURATION);
  return await getElementStyle(locator, style);
}

async function getBgColorAfterHover(page: Page, testId: string) {
  return await getStyleAfterHover(page, testId, "background-color");
}

async function getBgColor(page: Page, testId: string) {
  return await getStyle(page, testId, "background-color");
}

async function getBorderColor(page: Page, testId: string) {
  return await getStyle(page, testId, "border-color");
}

async function getStyleWhilePressing(page: Page, testId: string, style: string) {
  const locator = page.getByTestId(testId);
  await locator.hover();
  await page.mouse.down();
  await page.waitForTimeout(HOVER_DURATION);
  const styleValue = await getElementStyle(locator, style);
  await page.mouse.up();
  return styleValue;
}
