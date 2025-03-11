import { test, expect } from "../../testing/fixtures";
import {
  getBoundingRect,
  getElementStyle,
  initThemedApp,
  pixelStrToNum,
} from "../../testing/themed-app-test-helpers";
import { Locator } from "@playwright/test";

const BADGE_CODE_PILL = `<Badge variant="pill" testId="badge" value="test content"/>`;

test("badge: padding", async ({ page }) => {
  const EXPECTED_PADDING = "10px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED_PADDING,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding", EXPECTED_PADDING);
});

test("badge: paddingHorizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "5px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingHorizontal-Badge-pill": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("badge: paddingVertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "7px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingVertical-Badge-pill": EXPECTED_PADDING_VERTICAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
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

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderLeft-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderRight-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderHorizontal-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderHorizontal-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Badge-pill": "8px double rgb(0, 128, 0)",
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderHorizontal-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Badge-pill": "8px double rgb(0, 128, 0)",
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderTop-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderBottom-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderVertical-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderVertical-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Badge-pill": "8px double rgb(0, 128, 0)",
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderVertical-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Badge-pill": "8px double rgb(0, 128, 0)",
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "color-border-Badge-pill": EXPECTED_COLOR,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "color-border-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderHorizontalColor-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderLeftColor-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderRightColor-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderVerticalColor-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderTopColor-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderBottomColor-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "style-border-Badge-pill": EXPECTED_STYLE,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "style-border-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderHorizontalStyle-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderLeftStyle-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderRightStyle-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderVerticalStyle-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderTopStyle-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderBottomStyle-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "thickness-border-Badge-pill": EXPECTED_WIDTH,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "thickness-border-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderHorizontalWidth-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderLeftWidth-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderRightWidth-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderVerticalWidth-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderTopWidth-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "borderBottomWidth-Badge-pill": UPDATED,
      "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingHorizontal-Badge-pill": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingLeft-Badge-pill": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingRight-Badge-pill": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingVertical-Badge-pill": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingTop-Badge-pill": EXPECTED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("badge")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "paddingBottom-Badge-pill": EXPECTED,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
      "paddingHorizontal-Badge-pill": UPDATED,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
      "paddingLeft-Badge-pill": UPDATED,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
      "paddingRight-Badge-pill": UPDATED,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
      "paddingVertical-Badge-pill": UPDATED,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
      "paddingTop-Badge-pill": UPDATED,
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
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED,
      "paddingBottom-Badge-pill": UPDATED,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED);
});
