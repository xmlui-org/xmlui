import { test, expect } from "../../testing/fixtures";
import {
  getBoundingRect,
  getElementStyle,
  initThemedApp,
  pixelStrToNum,
} from "../../testing/themed-app-test-helpers";
import { Locator } from "@playwright/test";

const BADGE_CODE = `<Badge variant="badge" testId="badge" value="test content"/>`;
const BADGE_CODE_PILL = `<Badge variant="pill" testId="badge" value="test content"/>`;

test("badge: padding", async ({ page }) => {
  const EXPECTED_PADDING = "10px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED_PADDING,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding", EXPECTED_PADDING);
});

test("badge: paddingHorizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "5px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingHorizontal-Badge": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("badge: paddingVertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "7px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingVertical-Badge": EXPECTED_PADDING_VERTICAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
});

test("pill: fontSize", async ({ page }) => {
  const EXPECTED_FONT_SIZE = "18px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "fontSize-Badge-pill": EXPECTED_FONT_SIZE,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-size", EXPECTED_FONT_SIZE);
});

test("pill: fontWeight", async ({ page }) => {
  // bold font weight
  const EXPECTED_FONT_WEIGHT = "700";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "fontWeight-Badge-pill": EXPECTED_FONT_WEIGHT,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-weight", EXPECTED_FONT_WEIGHT);
});

test("pill: padding", async ({ page }) => {
  const EXPECTED_PADDING = "12px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED_PADDING,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding", EXPECTED_PADDING);
});

test("pill: paddingHorizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "6px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingHorizontal-Badge-pill": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("pill: paddingVertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "8px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingVertical-Badge-pill": EXPECTED_PADDING_VERTICAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
});

async function isPillShaped(elem: Locator) {
  const { width, height } = await getBoundingRect(elem);
  const smaller = Math.min(width, height);
  const minRadius = smaller / 2;

  const radiusPx = await getElementStyle(elem, "border-radius");
  const radius = pixelStrToNum(radiusPx);

  expect(radius).toBeGreaterThanOrEqual(minRadius);
}

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderLeft-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderRight-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderHorizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal and borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderHorizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Badge": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", "double");
});

test("borderHorizontal and borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderHorizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Badge": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderTop-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderBottom-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderVertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderVertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Badge": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderVertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Badge": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "color-border-Badge": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "color-border-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderHorizontalColor-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderLeftColor-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderRightColor-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderVerticalColor-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderTopColor-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderBottomColor-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "style-border-Badge": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "style-border-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderHorizontalStyle-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderLeftStyle-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderRightStyle-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderVerticalStyle-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderTopStyle-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderBottomStyle-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "thickness-border-Badge": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "thickness-border-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderHorizontalWidth-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderLeftWidth-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderRightWidth-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderVerticalWidth-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderTopWidth-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "borderBottomWidth-Badge": UPDATED,
      "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("badge")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("badge")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("padding", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingHorizontal-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingLeft-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingRight-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingVertical-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingTop-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "paddingBottom-Badge": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
      "paddingHorizontal-Badge": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
      "paddingLeft-Badge": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
      "paddingRight-Badge": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
      "paddingVertical-Badge": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
      "paddingTop-Badge": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED,
      "paddingBottom-Badge": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});
