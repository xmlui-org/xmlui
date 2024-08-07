import { expect, test } from "./fixtures";
import { getFullRectangle, initApp } from "./component-test-helpers";

// =================================================================
// The testes regarding overflow="scroll" are inside the stack tests
// =================================================================

test("Can render empty", async ({ page }) => {
  const entryPoint = `<Text testId="text0" />`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("text0")).toBeAttached();
  await expect(page.getByTestId("text0")).toBeEmpty();
});

test("Implicit text", async ({ page }) => {
  const EXPECTED = "test content";
  const entryPoint = `<Fragment>${EXPECTED}</Fragment>`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED, { exact: true })).toBeVisible();
});

test("Value prop no whitespace collapsing", async ({ page }) => {
  const EXPECTED = "test        content";
  const entryPoint = `<Text value="${EXPECTED}" />`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED, { exact: true })).toBeVisible();
});

test("Nested text whitespace collapsing", async ({ page }) => {
  const EXPECTED = "test content here";
  const entryPoint = `
  <Text>
   test      content
      here
  </Text>
  `;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED, { exact: true })).toBeVisible();
});

test("Text is inlined within HStack", async ({ page }) => {
  const entryPoint = `
  <HStack>
    <Text testId="text0" >Show me a trash</Text>
    <Icon testId="icon0"  name="trash"/>
    <Text testId="text1" >icon!</Text>
  </HStack>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { top: topText0 } = await getFullRectangle(page.getByTestId("text0"));
  const { top: topIcon0 } = await getFullRectangle(page.getByTestId("icon0"));
  const { top: topText1 } = await getFullRectangle(page.getByTestId("text1"));

  expect(topText0).toEqual(topIcon0);
  expect(topIcon0).toEqual(topText1);
});

test("Non breaking space", async ({ page }) => {
  const content  = "4 spaces here [&nbsp;&nbsp;&nbsp;&nbsp;], &amp;nbsp; written out."
  const expected  = "4 spaces here [    ], &nbsp; written out."
  const entryPoint = `<Text testId="text">${content}</Text>`;

  await initApp(page, {
    entryPoint,
  });
  
  await expect(page.getByTestId("text")).toHaveText(expected);
});

test("Text is in block within VStack", async ({ page }) => {
  const entryPoint = `
  <VStack>
    <Text testId="text0" >Show me a trash</Text>
    <Icon testId="icon0"  name="trash"/>
    <Text testId="text1" >icon!</Text>
  </VStack>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { top: topText0 } = await getFullRectangle(page.getByTestId("text0"));
  const { top: topIcon0 } = await getFullRectangle(page.getByTestId("icon0"));
  const { top: topText1 } = await getFullRectangle(page.getByTestId("text1"));

  expect(topText0).toBeLessThan(topIcon0);
  expect(topIcon0).toBeLessThan(topText1);
});

test("Break long text", async ({ page }) => {
  const valueTextLong = "This long text does not fit into a viewport with a 200-pixel width.";
  const entryPoint = `
  <Fragment>
    <Text testId="textShort" width="200" backgroundColor="yellow">
      Short
    </Text>
    <Text testId="textLong" width="200" backgroundColor="cyan">
      ${valueTextLong}
    </Text>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(valueTextLong, { exact: true })).toBeVisible();

  const { height: heightTextShort } = await getFullRectangle(page.getByTestId("textShort"));
  const { height: heightTextLong } = await getFullRectangle(page.getByTestId("textLong"));

  expect(heightTextShort).toBeLessThan(heightTextLong);
});

test("Ellipse long text", async ({ page }) => {
  const valueTextLong = "Though this long text does not fit into a single line, please do not break it!";
  const entryPoint = `
  <Fragment>
    <Text testId="textShort" width="200" backgroundColor="yellow">
      Short
    </Text>
    <Text 
      testId="textLong"
      width="200" 
      backgroundColor="cyan"
      maxLines="1">
      ${valueTextLong}
    </Text>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightTextShort } = await getFullRectangle(page.getByTestId("textShort"));
  const { height: heightTextLong } = await getFullRectangle(page.getByTestId("textLong"));

  expect(heightTextShort).toEqual(heightTextLong);
  await expect(page.getByTestId("textLong")).toHaveCSS("text-overflow", "ellipsis");
});

test("No Ellipsis long text", async ({ page }) => {
  const valueTextLong = "Though this long text does not fit into a single line, please do not break it!";
  const entryPoint = `
  <Fragment>
    <Text testId="textShort" width="200" backgroundColor="yellow">
      Short
    </Text>
    <Text 
      testId="textLong"
      width="200" 
      backgroundColor="cyan"
      maxLines="1"
      ellipses="false">
      ${valueTextLong}
    </Text>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightTextShort } = await getFullRectangle(page.getByTestId("textShort"));
  const { height: heightTextLong } = await getFullRectangle(page.getByTestId("textLong"));

  expect(heightTextShort).toEqual(heightTextLong);
  await expect(page.getByTestId("textLong")).not.toHaveCSS("text-overflow", "ellipsis");
});

test('MaxLines="2" long text', async ({ page }) => {
  const valueTextLong = "Though this long text does not fit into a single line, please do not break it!";
  const entryPoint = `
  <Fragment>
    <Text testId="textShort" width="200" backgroundColor="yellow">
      Short
    </Text>
    <Text 
      testId="textLong"
      width="200" 
      backgroundColor="cyan"
      maxLines="2">
      ${valueTextLong}
    </Text>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightTextShort } = await getFullRectangle(page.getByTestId("textShort"));
  const { height: heightTextLong } = await getFullRectangle(page.getByTestId("textLong"));

  expect(heightTextLong).toEqual(heightTextShort * 2);
});

test("Preserve linebreaks", async ({ page }) => {
  const entryPoint = `
  <Fragment>
    <Text testId="textShort" backgroundColor="yellow">
      Short
    </Text>
    <Text 
      testId="textLong"
      backgroundColor="cyan"
      preserveLinebreaks="true"
      value="Though this long 
text does not fit into a single line, 
please do not break it!"/>
  </Fragment>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: heightTextShort } = await getFullRectangle(page.getByTestId("textShort"));
  const { height: heightTextLong } = await getFullRectangle(page.getByTestId("textLong"));

  expect(heightTextLong).toEqual(heightTextShort * 3);
});

test("Overflow container dimensions", async ({ page }) => {
  const widthLayoutExpected = 300
  const widthTextExpected = 400;
  const entryPoint = `
  <VStack testId="layout" height="40" width="${widthLayoutExpected}" backgroundColor="cyan">
    <Text
      testId="text"
      width="${widthTextExpected}"
      backgroundColor="silver" opacity="0.8">
      This text sets its size explicitly bigger than its container.
      As it does not fit into the container's viewport, it overflows.
    </Text>
  </VStack>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { width: widthLayout } = await getFullRectangle(page.getByTestId("layout"));
  const { width: widthText } = await getFullRectangle(page.getByTestId("text"));

  expect(widthText).toEqual(widthTextExpected);
  expect(widthLayout).toEqual(widthLayoutExpected);
});

