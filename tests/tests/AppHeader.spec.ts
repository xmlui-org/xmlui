import { test, expect } from "./fixtures";
import { initThemedApp } from "./component-test-helpers";

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
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-left-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-right-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-horizontal-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-horizontal-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-AppHeader": "8px double rgb(0, 128, 0)",
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

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-horizontal-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-AppHeader": "8px double rgb(0, 128, 0)",
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

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-top-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-bottom-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-vertical-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-vertical-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-AppHeader": "8px double rgb(0, 128, 0)",
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

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "border-vertical-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-AppHeader": "8px double rgb(0, 128, 0)",
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
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "color-border-horizontal-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "color-border-left-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "color-border-right-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "color-border-vertical-AppHeader": UPDATED,
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
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "color-border-top-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
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

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "color-border-bottom-AppHeader": UPDATED,
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
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
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
      "style-border-horizontal-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "style-border-left-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "style-border-right-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "style-border-vertical-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
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
      "style-border-top-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", UPDATED);
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

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "style-border-bottom-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
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
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "thickness-border-horizontal-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "thickness-border-left-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "thickness-border-right-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "thickness-border-vertical-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
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
      "thickness-border-top-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
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

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, APPHEADER_CODE, {
    themeVars: {
      "thickness-border-bottom-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("appHeader")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("appHeader")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
