import { test, expect } from "../../testing/fixtures";
import { initThemedApp } from "../../testing/themed-app-test-helpers";

const APPHEADER_CODE = `
  <AppHeader testId="appHeader">
    Hello, World!
  </AppHeader>
`;

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderLeft-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderRight-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderHorizontal-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal and borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderHorizontal-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-AppHeader": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", "double");
});

test("borderHorizontal and borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderHorizontal-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-AppHeader": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderTop-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderBottom-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderVertical-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderVertical-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-AppHeader": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderVertical-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-AppHeader": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "color-border-AppHeader": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "color-border-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderHorizontalColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderLeftColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderRightColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderVerticalColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderTopColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderBottomColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "style-border-AppHeader": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "style-border-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderHorizontalStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderLeftStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderRightStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderVerticalStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderTopStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderBottomStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "thickness-border-AppHeader": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "thickness-border-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderHorizontalWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderLeftWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderRightWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderVerticalWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderTopWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "borderBottomWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
