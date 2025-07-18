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

test("borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderLeft-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderRight-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderHorizontal-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderHorizontal and borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderHorizontal-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Card": "8px double rgb(0, 128, 0)",
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

test("borderHorizontal and borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderHorizontal-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Card": "8px double rgb(0, 128, 0)",
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

test("borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderTop-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderBottom-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderVertical-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
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

test("borderVertical and borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderVertical-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Card": "8px double rgb(0, 128, 0)",
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

test("borderVertical and borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderVertical-Card": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Card": "8px double rgb(0, 128, 0)",
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
      "borderColor-Card": EXPECTED_COLOR,
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
      "borderColor-Card": UPDATED,
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
      "borderHorizontalColor-Card": UPDATED,
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
      "borderLeftColor-Card": UPDATED,
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
      "borderRightColor-Card": UPDATED,
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
      "borderVerticalColor-Card": UPDATED,
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
      "borderTopColor-Card": UPDATED,
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
      "borderBottomColor-Card": UPDATED,
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
      "borderStyle-Card": EXPECTED_STYLE,
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
      "borderStyle-Card": UPDATED,
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
      "borderHorizontalStyle-Card": UPDATED,
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
      "borderLeftStyle-Card": UPDATED,
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
      "borderRightStyle-Card": UPDATED,
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
      "borderVerticalStyle-Card": UPDATED,
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
      "borderTopStyle-Card": UPDATED,
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
      "borderBottomStyle-Card": UPDATED,
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
      "borderWidth-Card": EXPECTED_WIDTH,
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
      "borderWidth-Card": UPDATED,
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
      "borderHorizontalWidth-Card": UPDATED,
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
      "borderLeftWidth-Card": UPDATED,
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
      "borderRightWidth-Card": UPDATED,
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
      "borderVerticalWidth-Card": UPDATED,
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
      "borderTopWidth-Card": UPDATED,
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
      "borderBottomWidth-Card": UPDATED,
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

test("paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "paddingHorizontal-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "paddingLeft-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "paddingRight-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "paddingVertical-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "paddingTop-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "paddingBottom-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "paddingHorizontal-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "paddingLeft-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "paddingRight-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "paddingVertical-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "paddingTop-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
      "paddingBottom-Card": UPDATED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
});

test("borderRadius", async ({ page }) => {
  const EXPECTED = "10px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "borderRadius-Card": EXPECTED,
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
