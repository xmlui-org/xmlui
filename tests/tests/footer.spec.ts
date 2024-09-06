import { expect, test } from "./fixtures";
import { getFullRectangle, initThemedApp } from "./component-test-helpers";

const FOOTER_ID = "footer";
const FOOTER_CODE = `<Footer testId="${FOOTER_ID}">"This is a footer."</Footer>`;

test(`theme: height`, async ({ page }) => {
  const expectedHeightPx = 100;

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "height-Footer": expectedHeightPx + "px",
    },
  });

  const { height } = await getFullRectangle(page.getByTestId(FOOTER_ID));
  expect(height).toEqualWithTolerance(expectedHeightPx);
});

test(`theme: padding`, async ({ page }) => {
  const expectedPadding = "10px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "padding-Footer": expectedPadding,
    },
  });

  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding", expectedPadding);
});

test("theme: padding-horizontal", async ({ page }) => {
  const expectedPadding = "10px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "padding-horizontal-Footer": expectedPadding,
    },
  });
  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding-left", expectedPadding);
  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding-right", expectedPadding);
});

test("theme: padding-vertical", async ({ page }) => {
  const expectedPadding = "10px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "padding-vertical-Footer": expectedPadding,
    },
  });
  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding-top", expectedPadding);
  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding-bottom", expectedPadding);
});

test(`theme: bg-color`, async ({ page }) => {
  const expectedBackgroundColor = "rgb(255, 0, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-bg-Footer": expectedBackgroundColor,
    },
  });

  await expect(page.getByTestId(FOOTER_ID)).toHaveCSS("background-color", expectedBackgroundColor);
});

test(`theme: font-size`, async ({ page }) => {
  const expectedFontSizePx = "20px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "font-size-Footer": expectedFontSizePx,
    },
  });

  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("font-size", expectedFontSizePx);
});

test(`theme: vertical-alignment`, async ({ page }) => {
  const expectedAlignment = "center";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "vertical-alignment-Footer": expectedAlignment,
    },
  });

  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("align-items", expectedAlignment);
});
