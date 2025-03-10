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

test("theme: paddingHorizontal", async ({ page }) => {
  const expectedPadding = "10px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "paddingHorizontal-Footer": expectedPadding,
    },
  });
  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding-left", expectedPadding);
  await expect(page.getByTestId(FOOTER_ID).locator('> div')).toHaveCSS("padding-right", expectedPadding);
});

test("theme: paddingVertical", async ({ page }) => {
  const expectedPadding = "10px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "paddingVertical-Footer": expectedPadding,
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

test(`theme: fontSize`, async ({ page }) => {
  const expectedFontSizePx = "20px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "fontSize-Footer": expectedFontSizePx,
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

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-left-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-right-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-horizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-horizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-Footer": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", "double");
});

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-horizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-Footer": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-top-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-bottom-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-vertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-vertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-Footer": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "border-vertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-Footer": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-Footer": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-horizontal-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-left-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-right-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-vertical-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-top-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "color-border-bottom-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-Footer": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-horizontal-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-left-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-right-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-vertical-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-top-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "style-border-bottom-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-Footer": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-horizontal-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-left-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-right-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-vertical-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-top-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "thickness-border-bottom-Footer": UPDATED,
      "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
