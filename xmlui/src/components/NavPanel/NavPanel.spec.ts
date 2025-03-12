import { test, expect } from "../../testing/fixtures";
import { initThemedApp } from "../../testing/themed-app-test-helpers";

const NAVPANEL_CODE = `<NavPanel testId="navpanel"><NavLink to="/">Hello</NavLink></NavPanel>`;

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderLeft-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderRight-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderHorizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal and borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderHorizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", "double");
});

test("borderHorizontal and borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderHorizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderTop-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderBottom-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderVertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderVertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderVertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-NavPanel": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderColor-NavPanel": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderHorizontalColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderLeftColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderRightColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderVerticalColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderTopColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderBottomColor-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderStyle-NavPanel": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderHorizontalStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderLeftStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderRightStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderVerticalStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderTopStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderBottomStyle-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderWidth-NavPanel": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderHorizontalWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderLeftWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderRightWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderVerticalWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderTopWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "borderBottomWidth-NavPanel": UPDATED,
      "border-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navpanel")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
