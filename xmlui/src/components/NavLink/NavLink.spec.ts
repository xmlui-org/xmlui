import { test, expect } from "../../testing/fixtures";
import { initThemedApp } from "../../../../tests/tests/component-test-helpers";

const NAVLINK_CODE = `<NavLink testId="navlink" to="/">Hello</NavLink>`;

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-left-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-right-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-horizontal-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-horizontal-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-NavLink": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", "double");
});

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-horizontal-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-NavLink": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-top-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-bottom-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-vertical-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-vertical-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-NavLink": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "border-vertical-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-NavLink": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-NavLink": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-horizontal-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-left-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-right-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-vertical-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-top-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "color-border-bottom-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-NavLink": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-horizontal-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-left-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-right-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-vertical-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-top-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "style-border-bottom-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-NavLink": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-horizontal-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-left-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-right-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-vertical-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-top-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NAVLINK_CODE, {
    themeVars: {
      "thickness-border-bottom-NavLink": UPDATED,
      "border-NavLink": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("navlink")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
