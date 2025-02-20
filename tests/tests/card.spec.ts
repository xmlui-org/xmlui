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
  const borderProperties = `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`;

  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "border-Card": borderProperties,
    },
  });

  await expect(page.getByTestId("card")).toHaveCSS("border-color", EXPECTED_COLOR);
  await expect(page.getByTestId("card")).toHaveCSS("border-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("card")).toHaveCSS("border-style", EXPECTED_STYLE);
});

// =================================================
// these tests seem easily parameterisable,
// but doing so makes them flaky 
// in dev runs where they are run on multiple cores
// =================================================

test("padding-horizontal", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-horizontal-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-left", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-right", EXPECTED);
});

test("padding-vertical", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-vertical-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("card")).toHaveCSS("padding-bottom", EXPECTED);
});

test("padding", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "padding-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("padding", EXPECTED);
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

test("shadow", async ({ page }) => {
  const EXPECTED = RED + " 10px 5px 5px 0px";
  await initThemedApp(page, CARD_CODE, {
    themeVars: {
      "shadow-Card": EXPECTED,
    },
  });
  await expect(page.getByTestId("card")).toHaveCSS("box-shadow", EXPECTED);
});
