import { test, expect } from "./fixtures";
import {
  type ThemeTestDesc,
  getFullRectangle,
  initApp,
  initThemedApp,
} from "./component-test-helpers";

const RED = "rgb(255, 0, 0)";

test("Can render single initial", async ({ page }) => {
  const EXPECTED_INITIAL = "T";
  const entryPoint = `<Avatar testId="avatar" name="Tim"/>`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED_INITIAL)).toBeVisible();
});

test("Can render 2 initials", async ({ page }) => {
  const EXPECTED_INITIAL = "TA";
  const entryPoint = `<Avatar testId="avatar" name="Tim Alan"/>`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED_INITIAL)).toBeVisible();
});

test("Can render 3 initials", async ({ page }) => {
  const EXPECTED_INITIAL = "TAJ";
  const entryPoint = `<Avatar testId="avatar" name="Tim Alan James"/>`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED_INITIAL)).toBeVisible();
});

test("Limits the number of initials", async ({ page }) => {
  const name = "Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim Tim ";
  const entryPoint = `<Avatar testId="avatar" name="${name}"/>`;

  await initApp(page, {
    entryPoint,
  });
  const initials = (await page.getByTestId("avatar").textContent()) || "";

  const initialCountName = name.split("T").length - 1;
  const initialCountAvatar = initials.split("T").length - 1;

  expect(initialCountAvatar).toBeLessThan(initialCountName);
});

test("size", async ({ page }) => {
  const entryPoint = `
  <HStack gap="1rem" >
    <Avatar testId="df" name="Dorothy Ellen Fuller" />
    <Avatar testId="xs" size="xs" name="Xavier Schiller" />
    <Avatar testId="sm" size="sm" name="Sebastien Moore" />
    <Avatar testId="md" size="md" name="Molly Dough" />
    <Avatar testId="lg" size="lg" name="Lynn Gilbert" />
  </HStack>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { width: widthDf } = await getFullRectangle(page.getByTestId("df"));
  const { width: widthXs } = await getFullRectangle(page.getByTestId("xs"));
  const { width: widthSm } = await getFullRectangle(page.getByTestId("sm"));
  const { width: widthMd } = await getFullRectangle(page.getByTestId("md"));
  const { width: widthLg } = await getFullRectangle(page.getByTestId("lg"));

  expect(widthDf).toEqual(widthSm);
  expect(widthXs).toBeLessThan(widthSm);
  expect(widthSm).toBeLessThan(widthMd);
  expect(widthMd).toBeLessThan(widthLg);
});

test.skip("url", async ({ page }) => {
  const url = "https://example.com/testing/mockurl/image.jpg";
  const entryPoint = `<Avatar testId="avatar" url="${url}"/>`;

  await page.route(url, async (route) => {
    await route.fulfill({ path: "./tests/fixtures/test-image-100x100.jpg" });
  });

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("avatar")).toHaveScreenshot();
});

test("click", async ({ page }) => {
  const EXPECTED_TEXT = "this is a test text";
  const entryPoint = `
  <HStack gap="1rem" verticalAlignment="center">   
    <variable name="showTestText" value="{false}" />
    <Avatar testId="avatar" name="Molly Dough" onClick="showTestText = true" />
    <Text when="{showTestText}">${EXPECTED_TEXT}</Text>
  </HStack>
  `;

  await initApp(page, {
    entryPoint,
  });

  await page.getByTestId("avatar").click();
  await expect(page.getByText(EXPECTED_TEXT)).toBeVisible();
});

const THEME_TESTS: ThemeTestDesc[] = [
  { themeVar: "color-bg-Avatar", themeVarAsCSS: "background-color", expected: RED },
  { themeVar: "color-border-Avatar", themeVarAsCSS: "border-color", expected: RED },
  { themeVar: "color-text-Avatar", themeVarAsCSS: "color", expected: RED },
  { themeVar: "font-weight-Avatar", themeVarAsCSS: "font-weight", expected: "700" },
  { themeVar: "radius-Avatar", themeVarAsCSS: "border-radius", expected: "15px" },
  { themeVar: "shadow-Avatar", themeVarAsCSS: "box-shadow", expected: RED + " 5px 10px 0px 0px" },
];

THEME_TESTS.forEach((testCase) => {
  test(testCase.themeVar, async ({ page }) => {
    const entryPoint = `<Avatar testId="avatar" name="Tim Alan" />`;

    const themeVars = {};
    themeVars[testCase.themeVar] = testCase.expected;

    await initThemedApp(page, entryPoint, { themeVars });

    await expect(page.getByTestId("avatar")).toHaveCSS(testCase.themeVarAsCSS, testCase.expected);
  });
});

const AVATAR_CODE = '<Avatar testId="avatar" name="Tim"/>';

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-left-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-right-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-horizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-horizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", "double");
});

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-horizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-top-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-bottom-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-vertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-vertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-vertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-Avatar": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-horizontal-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-left-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-right-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-vertical-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-top-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-bottom-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-Avatar": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-horizontal-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-left-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-right-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-vertical-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-top-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-bottom-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-Avatar": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-horizontal-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-left-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-right-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-vertical-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-top-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-bottom-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});









