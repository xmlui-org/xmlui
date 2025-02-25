import { test, expect } from "../../testing/fixtures";
import {
  getBoundingRect,
  getElementStyle,
  initThemedApp,
  pixelStrToNum,
} from "../../../../tests/tests/component-test-helpers";
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

test("badge: padding-horizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "5px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-horizontal-Badge": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("badge: padding-vertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "7px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-vertical-Badge": EXPECTED_PADDING_VERTICAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
});

test("pill: font-size", async ({ page }) => {
  const EXPECTED_FONT_SIZE = "18px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "font-size-Badge-pill": EXPECTED_FONT_SIZE,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-size", EXPECTED_FONT_SIZE);
});

test("pill: font-weight", async ({ page }) => {
  // bold font weight
  const EXPECTED_FONT_WEIGHT = "700";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "font-weight-Badge-pill": EXPECTED_FONT_WEIGHT,
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

test("pill: padding-horizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "6px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-horizontal-Badge-pill": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("pill: padding-vertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "8px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-vertical-Badge-pill": EXPECTED_PADDING_VERTICAL,
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

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-left-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-right-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-horizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-horizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-Badge": "8px double rgb(0, 128, 0)",
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

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-horizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-Badge": "8px double rgb(0, 128, 0)",
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

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-top-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-bottom-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-vertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-vertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-Badge": "8px double rgb(0, 128, 0)",
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

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "border-vertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-Badge": "8px double rgb(0, 128, 0)",
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
      "color-border-horizontal-Badge": UPDATED,
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
      "color-border-left-Badge": UPDATED,
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
      "color-border-right-Badge": UPDATED,
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
      "color-border-vertical-Badge": UPDATED,
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
      "color-border-top-Badge": UPDATED,
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
      "color-border-bottom-Badge": UPDATED,
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
      "style-border-horizontal-Badge": UPDATED,
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
      "style-border-left-Badge": UPDATED,
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
      "style-border-right-Badge": UPDATED,
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
      "style-border-vertical-Badge": UPDATED,
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
      "style-border-top-Badge": UPDATED,
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
      "style-border-bottom-Badge": UPDATED,
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
      "thickness-border-horizontal-Badge": UPDATED,
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
      "thickness-border-left-Badge": UPDATED,
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
      "thickness-border-right-Badge": UPDATED,
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
      "thickness-border-vertical-Badge": UPDATED,
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
      "thickness-border-top-Badge": UPDATED,
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
      "thickness-border-bottom-Badge": UPDATED,
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
