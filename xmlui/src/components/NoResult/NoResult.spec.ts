import { test, expect } from "../../testing/fixtures";
import { initThemedApp } from "../../testing/themed-app-test-helpers";

const NORESULT_CODE = `<NoResult testId="noresult" />`;

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "border-left-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "border-right-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderHorizontal-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderHorizontal-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-NoResult": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", "double");
});

test("borderHorizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderHorizontal-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-NoResult": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "border-top-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderBottom-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderVertical-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderVertical-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-NoResult": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderVertical-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-NoResult": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "color-border-NoResult": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "color-border-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderHorizontalColor-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "color-border-left-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "color-border-right-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderVerticalColor-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "color-border-top-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderBottomColor-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "style-border-NoResult": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "style-border-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderHorizontalStyle-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "style-border-left-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "style-border-right-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderVerticalStyle-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "style-border-top-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderBottomStyle-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "thickness-border-NoResult": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "thickness-border-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderHorizontalWidth-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "thickness-border-left-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "thickness-border-right-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderVerticalWidth-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "thickness-border-top-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, NORESULT_CODE, {
    themeVars: {
      "borderBottomWidth-NoResult": UPDATED,
      "border-NoResult": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("noresult")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
