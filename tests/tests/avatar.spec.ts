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
  // Skip Reason we are evaluating the usage of border-style
  /* { themeVar: "style-border-Avatar", themeVarAsCSS: "border-style", expected: "dotted" },
  { themeVar: "thickness-border-Avatar", themeVarAsCSS: "border-width", expected: "5px"}, */
];

THEME_TESTS.forEach((testCase) => {
  test(testCase.themeVar, async ({ page }) => {
    const entryPoint = `<Avatar testId="avatar" name="Tim Alan" />`;

    const themeVars = {};
    themeVars[testCase.themeVar] = testCase.expected

    await initThemedApp(page, entryPoint, { themeVars });

    await expect(page.getByTestId("avatar")).toHaveCSS(testCase.themeVarAsCSS, testCase.expected);
  });
});
