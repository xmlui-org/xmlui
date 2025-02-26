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

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-left-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-right-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-horizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-horizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-NavPanel": "8px double rgb(0, 128, 0)",
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

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-horizontal-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-NavPanel": "8px double rgb(0, 128, 0)",
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

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-top-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-bottom-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-vertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-vertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-NavPanel": "8px double rgb(0, 128, 0)",
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

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVPANEL_CODE, {
    themeVars: {
      "border-vertical-NavPanel": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-NavPanel": "8px double rgb(0, 128, 0)",
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
      "color-border-NavPanel": EXPECTED_COLOR,
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
      "color-border-NavPanel": UPDATED,
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
      "color-border-horizontal-NavPanel": UPDATED,
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
      "color-border-left-NavPanel": UPDATED,
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
      "color-border-right-NavPanel": UPDATED,
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
      "color-border-vertical-NavPanel": UPDATED,
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
      "color-border-top-NavPanel": UPDATED,
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
      "color-border-bottom-NavPanel": UPDATED,
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
      "style-border-NavPanel": EXPECTED_STYLE,
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
      "style-border-NavPanel": UPDATED,
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
      "style-border-horizontal-NavPanel": UPDATED,
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
      "style-border-left-NavPanel": UPDATED,
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
      "style-border-right-NavPanel": UPDATED,
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
      "style-border-vertical-NavPanel": UPDATED,
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
      "style-border-top-NavPanel": UPDATED,
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
      "style-border-bottom-NavPanel": UPDATED,
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
      "thickness-border-NavPanel": EXPECTED_WIDTH,
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
      "thickness-border-NavPanel": UPDATED,
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
      "thickness-border-horizontal-NavPanel": UPDATED,
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
      "thickness-border-left-NavPanel": UPDATED,
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
      "thickness-border-right-NavPanel": UPDATED,
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
      "thickness-border-vertical-NavPanel": UPDATED,
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
      "thickness-border-top-NavPanel": UPDATED,
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
      "thickness-border-bottom-NavPanel": UPDATED,
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
