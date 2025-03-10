import { test, expect } from "./fixtures";
import { initApp, initThemedApp } from "./component-test-helpers";

const CARD_HEIGHT = 400;
const CARD_WIDTH = 400;
const RED = "rgb(255, 0, 0)";
const TEXT_CONTENT = "just test text";

const CARD_CODE = `
  <Card testId="card">
    <HStack testId="item" backgroundColor="lightblue" width="${CARD_WIDTH}px" height="${CARD_HEIGHT}px">
      ${TEXT_CONTENT}
    </HStack>
  </Card>
`;

test("Can render empty", async ({ page }) => {
  const entryPoint = `<Card testId="card" />`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("card")).toBeAttached();
  await expect(page.getByTestId("card")).toBeEmpty();
});

test("Renders inner text", async ({ page }) => {
  await initApp(page, {
    entryPoint: CARD_CODE,
  });

  await expect(page.getByText(TEXT_CONTENT, { exact: true })).toBeVisible();
});

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-left-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-right-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-horizontal-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-horizontal-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-Card": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", "double");
});

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-horizontal-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-Card": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-top-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-bottom-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-vertical-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-vertical-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-Card": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-vertical-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-Card": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-Card": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-horizontal-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-left-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-right-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-vertical-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-top-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "color-border-bottom-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-Card": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-horizontal-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-left-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-right-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-vertical-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-top-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "style-border-bottom-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-Card": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-horizontal-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-left-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-right-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-vertical-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-top-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "thickness-border-bottom-Card": UPDATED,
      "border-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("padding", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding-horizontal", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-horizontal-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding-left", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-left-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding-right", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-right-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding-vertical", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-vertical-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding-top", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-top-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding-bottom", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-bottom-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding, padding-horizontal", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "padding-horizontal-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", UPDATED);
});

test("padding, padding-left", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "padding-left-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", UPDATED);
});

test("padding, padding-right", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "padding-right-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, padding-vertical", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "padding-vertical-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, padding-top", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "padding-top-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, padding-bottom", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "padding-bottom-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("radius", async ({ page }) => {
  const EXPECTED = "10px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "radius-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("border-radius", EXPECTED);
});

test("boxShadow", async ({ page }) => {
  const EXPECTED = RED + " 10px 5px 5px 0px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "boxShadow-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("box-shadow", EXPECTED);
});
