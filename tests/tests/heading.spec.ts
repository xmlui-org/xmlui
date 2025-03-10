import { expect, test } from "./fixtures";
import {
  ThemeTestDesc,
  getBoundingRect,
  getElementStyle,
  initApp,
  initThemedApp,
  pixelStrToNum,
} from "./component-test-helpers";

const RED = "rgb(255, 0, 0)";

test("greater level smaller font size", async ({ page }) => {
  const entryPoint = `
  <VStack>
    <Heading level="h1" testId="h1" >This is a heading of level 1</Heading>
    <Heading level="h2" testId="h2" >This is a heading of level 2</Heading>
    <Heading level="h3" testId="h3" >This is a heading of level 3</Heading>
    <Heading level="h4" testId="h4" >This is a heading of level 4</Heading>
    <Heading level="h5" testId="h5" >This is a heading of level 5</Heading>
    <Heading level="h6" testId="h6" >This is a heading of level 6</Heading>
  </VStack>
  `;

  await initApp(page, {
    entryPoint,
  });

  const fontSizeH1 = pixelStrToNum(await getElementStyle(page.getByTestId("h1"), "font-size"));
  const fontSizeH2 = pixelStrToNum(await getElementStyle(page.getByTestId("h2"), "font-size"));
  const fontSizeH3 = pixelStrToNum(await getElementStyle(page.getByTestId("h3"), "font-size"));
  const fontSizeH4 = pixelStrToNum(await getElementStyle(page.getByTestId("h4"), "font-size"));
  const fontSizeH5 = pixelStrToNum(await getElementStyle(page.getByTestId("h5"), "font-size"));
  const fontSizeH6 = pixelStrToNum(await getElementStyle(page.getByTestId("h6"), "font-size"));

  expect(fontSizeH1).toBeGreaterThan(fontSizeH2);
  expect(fontSizeH2).toBeGreaterThan(fontSizeH3);
  expect(fontSizeH3).toBeGreaterThan(fontSizeH4);
  expect(fontSizeH4).toBeGreaterThan(fontSizeH5);
  expect(fontSizeH5).toBeGreaterThan(fontSizeH6);
});

test("Ellipses long heading", async ({ page }) => {
  const valueHeadingLong = "Though this long heading does not fit into a single line, please do not break it!";
  const entryPoint = `
  <Fragment>
    <Heading testId="headingShort" width="200" backgroundColor="yellow">
      Short
    </Heading>
    <Heading 
      testId="headingLong"
      width="200" 
      backgroundColor="cyan"
      maxLines="1">
      ${valueHeadingLong}
    </Heading>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightHeadingShort } = await getBoundingRect(page.getByTestId("headingShort"));
  const { height: heightHeadingLong } = await getBoundingRect(page.getByTestId("headingLong"));

  expect(heightHeadingShort).toEqual(heightHeadingLong);
  await expect(page.getByTestId("headingLong")).toHaveCSS("text-overflow", "ellipsis");
});

test("No Ellipses long heading", async ({ page }) => {
  const valueHeadingLong = "Though this long heading does not fit into a single line, please do not break it!";
  const entryPoint = `
  <Fragment>
    <Heading testId="headingShort" width="200" backgroundColor="yellow">
      Short
    </Heading>
    <Heading 
      testId="headingLong"
      width="200" 
      backgroundColor="cyan"
      maxLines="1"
      ellipses="false">
      ${valueHeadingLong}
    </Heading>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightHeadingShort } = await getBoundingRect(page.getByTestId("headingShort"));
  const { height: heightHeadingLong } = await getBoundingRect(page.getByTestId("headingLong"));

  expect(heightHeadingShort).toEqual(heightHeadingLong);
  await expect(page.getByTestId("headingLong")).not.toHaveCSS("text-overflow", "ellipsis");
});

test('MaxLines="2" long heading', async ({ page }) => {
  const valueHeadingLong = "Though this long heading does not fit into a single line, please do not break it!";
  const entryPoint = `
  <Fragment>
    <Heading testId="headingShort" width="200px" backgroundColor="yellow">
      Short
    </Heading>
    <Heading 
      testId="headingLong"
      width="200px" 
      backgroundColor="cyan"
      maxLines="2">
      ${valueHeadingLong}
    </Heading>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightHeadingShort } = await getBoundingRect(page.getByTestId("headingShort"));
  const { height: heightHeadingLong } = await getBoundingRect(page.getByTestId("headingLong"));

  expect(heightHeadingLong).toEqual(heightHeadingShort * 2);
});

test("Preserve linebreaks", async ({ page }) => {
  const entryPoint = `
  <Fragment>
    <Heading testId="headingShort" backgroundColor="yellow">
      Short
    </Heading>
    <Heading 
      testId="headingLong"
      backgroundColor="cyan"
      preserveLinebreaks="true"
      value="Though this long 
heading does not fit into a single line, 
please do not break it!"/>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightHeadingShort } = await getBoundingRect(page.getByTestId("headingShort"));
  const { height: heightHeadingLong } = await getBoundingRect(page.getByTestId("headingLong"));

  expect(heightHeadingLong).toEqual(heightHeadingShort * 3);
});

test("child overrides value", async ({ page }) => {
  const EXPECTED = "this test text is the value of the heading";
  const entryPoint = `
  <Fragment>
    <Heading testId="heading" value="${EXPECTED}">
      This is a child
    </Heading>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("heading")).toContainText(EXPECTED);
});

const THEME_TESTS: ThemeTestDesc[] = [
  { themeVar: "color-decoration-Heading", themeVarAsCSS: "text-decoration-color", expected: RED },
  { themeVar: "color-text-Heading", themeVarAsCSS: "color", expected: RED },
  { themeVar: "font-family-H1", themeVarAsCSS: "font-family", expected: "sans-serif" },
  { themeVar: "font-weight-Heading", themeVarAsCSS: "font-weight", expected: "700" },
  { themeVar: "font-size-H1", themeVarAsCSS: "font-size", expected: "20px" },
  { themeVar: "letter-spacing-Heading", themeVarAsCSS: "letter-spacing", expected: "2px" },
  { themeVar: "line-decoration-Heading", themeVarAsCSS: "text-decoration-line", expected: "underline" },
  { themeVar: "margin-top-H1", themeVarAsCSS: "margin-top", expected: "30px" },
  { themeVar: "margin-bottom-H1", themeVarAsCSS: "margin-bottom", expected: "30px" },
  { themeVar: "textUnderlineOffset-Heading", themeVarAsCSS: "text-underline-offset", expected: "10px" },
  { themeVar: "style-decoration-Heading", themeVarAsCSS: "text-decoration-style", expected: "dotted" },
  { themeVar: "thickness-decoration-Heading", themeVarAsCSS: "text-decoration-thickness", expected: "4px" },
];

THEME_TESTS.forEach((testCase) => {
  test(testCase.themeVar, async ({ page }) => {
    const entryPoint = `<Heading testId="heading" value="This is a test heading" />`;

    const themeVars = {};
    themeVars[testCase.themeVar] = testCase.expected;

    await initThemedApp(page, entryPoint, { themeVars });

    await expect(page.getByTestId("heading")).toHaveCSS(testCase.themeVarAsCSS, testCase.expected);
  });
});
