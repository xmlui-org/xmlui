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
      "backgroundColor-Footer": expectedBackgroundColor,
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

test("borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderLeft-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderRight-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderHorizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderHorizontal and borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderHorizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Footer": "8px double rgb(0, 128, 0)",
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

test("borderHorizontal and borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderHorizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Footer": "8px double rgb(0, 128, 0)",
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

test("borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderTop-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderBottom-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderVertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderVertical and borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderVertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Footer": "8px double rgb(0, 128, 0)",
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

test("borderVertical and borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderVertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Footer": "8px double rgb(0, 128, 0)",
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
      "borderColor-Footer": EXPECTED_COLOR,
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
      "borderColor-Footer": UPDATED,
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
      "borderHorizontalColor-Footer": UPDATED,
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
      "borderLeftColor-Footer": UPDATED,
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
      "borderRightColor-Footer": UPDATED,
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
      "borderVerticalColor-Footer": UPDATED,
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
      "borderTopColor-Footer": UPDATED,
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
      "borderBottomColor-Footer": UPDATED,
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
      "borderStyle-Footer": EXPECTED_STYLE,
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
      "borderStyle-Footer": UPDATED,
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
      "borderHorizontalStyle-Footer": UPDATED,
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
      "borderLeftStyle-Footer": UPDATED,
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
      "borderRightStyle-Footer": UPDATED,
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
      "borderVerticalStyle-Footer": UPDATED,
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
      "borderTopStyle-Footer": UPDATED,
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
      "borderBottomStyle-Footer": UPDATED,
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
  const EXPECTED_WIDTH = "8px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderWidth-Footer": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  // await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  // await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  // await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, FOOTER_CODE, {
    themeVars: {
      "borderWidth-Footer": UPDATED,
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
      "borderHorizontalWidth-Footer": UPDATED,
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
      "borderLeftWidth-Footer": UPDATED,
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
      "borderRightWidth-Footer": UPDATED,
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
      "borderVerticalWidth-Footer": UPDATED,
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
      "borderTopWidth-Footer": UPDATED,
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
      "borderBottomWidth-Footer": UPDATED,
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
