import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { TextVariantElement } from "../abstractions";

// These are the html elements that are rendered using Text in their respective HtmlTag components
const textVariantElements = [
  "abbr",
  "cite",
  "code",
  "del",
  "em",
  "ins",
  "kbd",
  "mark",
  "p",
  "pre",
  "samp",
  "small",
  "strong",
  "sub",
  "sup",
  "var",
] as const;

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text />`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  Array.from(new Set(Object.values(TextVariantElement)))
    .filter((variant) => !["h6", "span"].includes(variant))
    .forEach((htmlElement) => {
      test(`HtmlTags '${htmlElement}' with Text is rendered`, async ({
        initTestBed,
        createTextDriver,
      }) => {
        await initTestBed(`<${htmlElement} />`);
        const driver = await createTextDriver();

        await expect(driver.component).toBeAttached();
      });
    });

  // --- value

  // correct types: string, undefined, null, number, boolean -> everything will be coerced to strings
  [
    { label: "undefined", value: "'{undefined}'", toExpect: "" },
    { label: "null", value: "'{null}'", toExpect: "" },
    { label: "empty string", value: "''", toExpect: "" },
    { label: "string", value: "'test'", toExpect: "test" },
    { label: "integer", value: "'{1}'", toExpect: "1" },
    { label: "float", value: "'{1.2}'", toExpect: "1.2" },
    { label: "boolean", value: "'{true}'", toExpect: "true" },
    { label: "empty object", value: "'{{}}'", toExpect: {}.toString() },
    { label: "object", value: "\"{{ a: 1, b: 'hi' }}\"", toExpect: { a: 1, b: "hi" }.toString() },
    { label: "empty array", value: "'{[]}'", toExpect: "" },
    { label: "array", value: "'{[1, 2, 3]}'", toExpect: [1, 2, 3].toString() },
  ].forEach(({ label, value, toExpect }) => {
    test(`setting value to ${label} sets value of field`, async ({
      initTestBed,
      createTextDriver,
    }) => {
      await initTestBed(`<Text value=${value} />`);
      const driver = await createTextDriver();

      await expect(driver.component).toHaveText(toExpect);
    });
  });

  test("setting value prop has no whitespace collapsing", async ({
    initTestBed,
    createTextDriver,
  }) => {
    const expected = "test        content";
    await initTestBed(`<Text value="${expected}" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText(expected);
  });

  test("child overrides value", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "this test text is the value of the heading";
    await initTestBed(`
      <Text value="${EXPECTED}">
        This is a child
      </Text>
    `);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText(EXPECTED);
  });

  // --- maxLines

  test('maxLines="2" cuts off long text', async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <Fragment>
        <Text testId="textShort" width="200px">Short</Text>
        <Text testId="textLong" width="200px" maxLines="2">
          Though this long text does not fit into a single line, please do not break it!
        </Text>
      </Fragment>
    `);
    const shortText = await createTextDriver("textShort");
    const longText = await createTextDriver("textLong");

    const { height: heightTextShort } = await getBounds(shortText);
    const { height: heightTextLong } = await getBounds(longText);

    expect(heightTextLong).toEqual(heightTextShort * 2);
  });

  // --- preserveLinebreaks

  test("preserve line breaks", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
    <Fragment>
      <Text testId="textShort">Short</Text>
      <Text testId="textLong" preserveLinebreaks="true"
        value="Though this long
text does not fit into a single line,
please do not break it!"
      />
    </Fragment>
    `);
    const { height: heightTextShort } = await getBounds(
      await createTextDriver("textShort")
    );
    const { height: heightTextLong } = await getBounds(
      await createTextDriver("textLong")
    );

    expect(heightTextLong).toEqualWithTolerance(heightTextShort * 3, 0.01);
  });

  // --- ellipses

  test("ellipses in long text", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <Fragment>
        <Text testId="textShort" width="200">Short</Text>
        <Text testId="textLong" width="200" maxLines="1">
          Though this long text does not fit into a single line, please do not break it!
        </Text>
      </Fragment>
    `);
    const shortTextDriver = await createTextDriver("textShort");
    const longTextDriver = await createTextDriver("textLong");

    const { height: heightTextShort } = await getBounds(shortTextDriver);
    const { height: heightTextLong } = await getBounds(longTextDriver);

    expect(heightTextShort).toEqual(heightTextLong);
    await expect(longTextDriver.component).toHaveCSS("text-overflow", "ellipsis");
  });

  test("no ellipses long text", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <Fragment>
        <Text testId="textShort" width="200">Short</Text>
        <Text testId="textLong" width="200" maxLines="1" ellipses="false">
          Though this long text does not fit into a single line, please do not break it!
        </Text>
      </Fragment>
    `);
    const shortTextDriver = await createTextDriver("textShort");
    const longTextDriver = await createTextDriver("textLong");

    const { height: heightTextShort } = await getBounds(shortTextDriver);
    const { height: heightTextLong } = await getBounds(longTextDriver);

    expect(heightTextShort).toEqual(heightTextLong);
    await expect(longTextDriver.component).not.toHaveCSS("text-overflow", "ellipsis");
  });

  // --- implicit text

  test("XMLUI renders implicit text in components", async ({ initTestBed, createStackDriver }) => {
    const expected = "test content";
    await initTestBed(`<Stack>${expected}</Stack>`);
    const driver = await createStackDriver();

    await expect(driver.component).toHaveText(expected);
  });

  test("nested text whitespace collapsing", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <Text>
      test      content
          here
      </Text>
    `);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText("test content here");
  });
});

// --- Props

// --- variant

Object.entries(TextVariantElement).forEach(([variant, htmlElement]) => {
  test(`variant=${variant} renders the HTML element: ${htmlElement}`, async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`<Text variant="${variant}" />`);
    const driver = await createTextDriver();

    const tagName = await driver.getComponentTagName();
    expect(tagName).toEqual(htmlElement);
  });
});

// --- Other Tests

// --- formatting

test("non-breaking space", async ({ initTestBed, createTextDriver }) => {
  const content = "4 spaces here [&nbsp;&nbsp;&nbsp;&nbsp;], &amp;nbsp; written out.";
  const expected = "4 spaces here [    ], &nbsp; written out.";

  await initTestBed(`<Text>${content}</Text>`);
  const driver = await createTextDriver();

  await expect(driver.component).toHaveText(expected);
});

test("break long text", async ({ initTestBed, createTextDriver }) => {
  await initTestBed(`
    <Fragment>
      <Text testId="textShort" width="200px">Short</Text>
      <Text testId="textLong" width="200px">
        This long text does not fit into a viewport with a 200-pixel width.
      </Text>
    </Fragment>
  `);
  const shortText = await createTextDriver("textShort");
  const longText = await createTextDriver("textLong");

  await expect(longText.component).toBeVisible();

  const { height: heightTextShort } = await getBounds(shortText);
  const { height: heightTextLong } = await getBounds(longText);

  expect(heightTextShort).toBeLessThan(heightTextLong);
});

// --- inside layout

test("Text is inline in HStack", async ({ initTestBed, createTextDriver, createIconDriver }) => {
  await initTestBed(`
    <HStack>
      <Text testId="text0" >Show me a trash</Text>
      <Icon testId="icon0"  name="trash"/>
      <Text testId="text1" >icon!</Text>
    </HStack>
  `);
  const { top: topText0 } = await getBounds(await createTextDriver("text0"));
  const { top: topIcon0 } = await getBounds(await createIconDriver("icon0"));
  const { top: topText1 } = await getBounds(await createTextDriver("text1"));

  expect(topText0).toEqual(topIcon0);
  expect(topIcon0).toEqual(topText1);
});

test("Text is block in VStack", async ({ initTestBed, createTextDriver, createIconDriver }) => {
  await initTestBed(`
    <VStack>
      <Text testId="text0" >Show me a trash</Text>
      <Icon testId="icon0"  name="trash"/>
      <Text testId="text1" >icon!</Text>
    </VStack>
  `);
  const { top: topText0 } = await getBounds(await createTextDriver("text0"));
  const { top: topIcon0 } = await getBounds(await createIconDriver("icon0"));
  const { top: topText1 } = await getBounds(await createTextDriver("text1"));

  expect(topText0).toBeLessThan(topIcon0);
  expect(topIcon0).toBeLessThan(topText1);
});

test("Text overflows container dimensions", async ({
  initTestBed,
  createVStackDriver,
  createTextDriver,
}) => {
  const widthLayoutExpected = 300;
  const widthTextExpected = 400;
  await initTestBed(`
    <VStack height="40px" width="${widthLayoutExpected}px" border="1px solid red">
      <Text testId="text" width="${widthTextExpected}px">
        This text sets its size explicitly bigger than its container.
        As it does not fit into the container's viewport, it overflows.
      </Text>
    </VStack>
  `);
  const { width: widthLayout } = await getBounds(await createVStackDriver());
  const { width: widthText } = await getBounds(await createTextDriver("text"));

  expect(widthText).toEqual(widthTextExpected);
  expect(widthLayout).toEqual(widthLayoutExpected);
});

textVariantElements.forEach((htmlElement) => {
  test(`HtmlTag '${htmlElement}' accepts custom props`, async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`<${htmlElement} custom="test" boolean>Test</${htmlElement}>`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveAttribute("custom", "test");
    await expect(driver.component).toHaveAttribute("boolean", "true");
  });
});

// --- Text theme vars
test("textColor", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "rgb(255, 0, 0)";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textColor-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("color", EXPECTED);
});

test("fontFamily", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "sans-serif";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "fontFamily-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("font-family", EXPECTED);
});

test("fontSize", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "48px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "fontSize-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("font-size", EXPECTED);
});

test("fontStyle", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "italic";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "fontStyle-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("font-style", EXPECTED);
});

test("fontWeight", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "900";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "fontWeight-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("font-weight", EXPECTED);
});

test("fontStretch", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "125%";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "fontStretch-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("font-stretch", EXPECTED);
});

test("textDecorationLine", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "underline";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textDecorationLine-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("text-decoration-line", EXPECTED);
});

test("textDecorationColor", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "rgb(255, 0, 0)";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textDecorationColor-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("text-decoration-color", EXPECTED);
});

test("textDecorationStyle", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "dotted";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textDecorationStyle-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("text-decoration-style", EXPECTED);
});

test("textDecorationThickness", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "12px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textDecorationThickness-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("text-decoration-thickness", EXPECTED);
});

test("textUnderlineOffset", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "12px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textUnderlineOffset-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("text-underline-offset", EXPECTED);
});

test("lineHeight", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "24px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "lineHeight-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("line-height", EXPECTED);
});

test("backgroundColor", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "rgb(255, 0, 0)";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "backgroundColor-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;

  await expect(component).toHaveCSS("background-color", EXPECTED);
});

test("textTransform", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "uppercase";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textTransform-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("text-transform", EXPECTED);
});

test("letterSpacing", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "12px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "letterSpacing-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("letter-spacing", EXPECTED);
});

test("wordSpacing", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "12px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "wordSpacing-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("word-spacing", EXPECTED);
});

test("textShadow", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "rgba(0, 0, 0, 0.5) 2px 2px 2px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textShadow-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("text-shadow", EXPECTED);
});

test("textIndent", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "12px";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textIndent-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("text-indent", EXPECTED);
});

test("textAlign", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "center";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textAlign-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("text-align", EXPECTED);
});

test("textAlignLast", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "center";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "textAlignLast-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("text-align-last", EXPECTED);
});

test("wordBreak", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "break-all";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "wordBreak-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("word-break", EXPECTED);
});

test("direction", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "rtl";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "direction-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("direction", EXPECTED);
});

test("writingMode", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "vertical-rl";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "writingMode-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("writing-mode", EXPECTED);
});

test("LineBreak", async ({ initTestBed, createTextDriver }) => {
  const EXPECTED = "normal";
  await initTestBed('<Text value="Hello, World" />', {
    testThemeVars: {
      "lineBreak-Text": EXPECTED,
    },
  });
  const component = (await createTextDriver()).component;
  await expect(component).toHaveCSS("line-break", EXPECTED);
});
