import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { TextVariantElement } from "../abstractions";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text />`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  test("component renders with value prop", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text value="test content" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText("test content");
  });

  test("component renders with text content", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text>test content</Text>`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText("test content");
  });

  test("text content overrides value prop", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "this test text is the value of the heading";
    await initTestBed(`
      <Text value="${EXPECTED}">
        This is a child
      </Text>
    `);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText(EXPECTED);
  });

  Object.entries(TextVariantElement).forEach(([variant, htmlElement]) => {
    test(`variant=${variant} renders correct HTML element: ${htmlElement}`, async ({
      initTestBed,
      createTextDriver,
    }) => {
      await initTestBed(`<Text variant="${variant}" />`);
      const driver = await createTextDriver();

      const tagName = await driver.getComponentTagName();
      expect(tagName).toEqual(htmlElement);
    });
  });

  Array.from(new Set(Object.values(TextVariantElement)))
    .filter((variant) => !["h6", "span"].includes(variant))
    .forEach((htmlElement) => {
      test(`HtmlTag component '${htmlElement}' renders correctly`, async ({
        initTestBed,
        createTextDriver,
      }) => {
        await initTestBed(`<${htmlElement} />`);
        const driver = await createTextDriver();

        await expect(driver.component).toBeAttached();
      });
    });

  [
    { label: "undefined", value: "'{undefined}'", toExpected: "" },
    { label: "undefined with string", value: "'abc{undefined}def'", toExpected: "abcdef" },
    { label: "null", value: "'{null}'", toExpected: "" },
    { label: "null with string", value: "'abc{null}def'", toExpected: "abcdef" },
    { label: "empty string", value: "''", toExpected: "" },
    { label: "string", value: "'test'", toExpected: "test" },
    { label: "integer", value: "'{1}'", toExpected: "1" },
    { label: "float", value: "'{1.2}'", toExpected: "1.2" },
    { label: "boolean", value: "'{true}'", toExpected: "true" },
    { label: "empty object", value: "'{{}}'", toExpected: {}.toString() },
    { label: "object", value: "\"{{ a: 1, b: 'hi' }}\"", toExpected: { a: 1, b: "hi" }.toString() },
    { label: "empty array", value: "'{[]}'", toExpected: "" },
    { label: "array", value: "'{[1, 2, 3]}'", toExpected: [1, 2, 3].toString() },
  ].forEach(({ label, value, toExpected }) => {
    test(`handles ${label} value prop correctly`, async ({ initTestBed, createTextDriver }) => {
      await initTestBed(`<Text value=${value} />`);
      const driver = await createTextDriver();

      await expect(driver.component).toHaveText(toExpected);
    });
  });

  test("removes leading whitespace", async ({ page, initTestBed }) => {
    await initTestBed(`<Text testId="text">   {123}</Text>`);
    await expect(page.getByTestId("text")).toHaveText("123");
  });

  test("removes trailing whitespace", async ({ page, initTestBed }) => {
    await initTestBed(`<Text testId="text">{123}  </Text>`);
    await expect(page.getByTestId("text")).toHaveText("123");
  });

  test("preserves whitespace when using value prop", async ({ initTestBed, createTextDriver }) => {
    const expected = "test        content";
    await initTestBed(`<Text value="${expected}" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText(expected);
  });

  test("supports preserveLinebreaks prop", async ({ initTestBed, createTextDriver }) => {
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
    const { height: heightTextShort } = await getBounds(await createTextDriver("textShort"));
    const { height: heightTextLong } = await getBounds(await createTextDriver("textLong"));

    expect(heightTextLong).toEqualWithTolerance(heightTextShort * 3, 0.01);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("non-breaking space entities are rendered correctly", async ({
    initTestBed,
    createTextDriver,
  }) => {
    const content = "4 spaces here [&nbsp;&nbsp;&nbsp;&nbsp;], &amp;nbsp; written out.";
    const expected = "4 spaces here [    ], &nbsp; written out.";

    await initTestBed(`<Text>${content}</Text>`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText(expected);
  });

  test("supports proper semantic HTML variants", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text variant="strong">Important text</Text>`);
    const driver = await createTextDriver();

    const tagName = await driver.getComponentTagName();
    expect(tagName).toEqual("strong");
    await expect(driver.component).toHaveText("Important text");
  });

  test("maintains text content readability", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text>This is readable text content</Text>`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("This is readable text content");
  });
});

// =============================================================================
// VISUAL STATES TESTS
// =============================================================================

test.describe("Visual States", () => {
  test("handles text overflow with ellipses", async ({ initTestBed, createTextDriver }) => {
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

  test("disables ellipses when specified", async ({ initTestBed, createTextDriver }) => {
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

  test("constrains text to maxLines", async ({ initTestBed, createTextDriver }) => {
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

  test("breaks long text when constrained by width", async ({ initTestBed, createTextDriver }) => {
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

  test("text overflows container when explicitly sized larger", async ({
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

  test("collapses nested text whitespace correctly", async ({ initTestBed, createTextDriver }) => {
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

// =============================================================================
// EDGE CASES TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  [
    { label: "empty object", value: "'{{}}'", toExpected: {}.toString() },
    { label: "object", value: "\"{{ a: 1, b: 'hi' }}\"", toExpected: { a: 1, b: "hi" }.toString() },
    { label: "empty array", value: "'{[]}'", toExpected: "" },
    { label: "array", value: "'{[1, 2, 3]}'", toExpected: [1, 2, 3].toString() },
  ].forEach(({ label, value, toExpected }) => {
    test(`handles ${label} value prop gracefully`, async ({ initTestBed, createTextDriver }) => {
      await initTestBed(`<Text value=${value} />`);
      const driver = await createTextDriver();

      await expect(driver.component).toHaveText(toExpected);
    });
  });

  test("handles extremely long text content", async ({ initTestBed, createTextDriver }) => {
    const longText = "Very long text content ".repeat(1000);
    await initTestBed(`<Text value="${longText}" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Very long text content");
  });

  test("handles special characters and symbols", async ({ initTestBed, createTextDriver }) => {
    const specialText = "Special chars: !@#$%^&*()[]|\\:;'<>?,./ αβγδε 中文 🚀✨";
    await initTestBed(`<Text value="${specialText}" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText(specialText);
  });

  test("handles mixed content types", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text>Mixed content: {123} {"string"} {true}</Text>`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("Mixed content:");
  });

  // TODO: create tests with multiple variants
  test.skip("nested Texts", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {
    await initTestBed(`<Text><Text></Text></Text>`);
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("renders multiple text components efficiently", async ({
    initTestBed,
    createTextDriver,
  }) => {
    const textElements = Array.from(
      { length: 100 },
      (_, i) => `<Text testId="text-${i}">Text content ${i}</Text>`,
    ).join("");

    await initTestBed(`<VStack>${textElements}</VStack>`);

    // Test a few random elements to ensure they render correctly
    const driver1 = await createTextDriver("text-0");
    const driver50 = await createTextDriver("text-49");
    const driver100 = await createTextDriver("text-99");

    await expect(driver1.component).toHaveText("Text content 0");
    await expect(driver50.component).toHaveText("Text content 49");
    await expect(driver100.component).toHaveText("Text content 99");
  });

  test("handles rapid text content changes", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text value="Initial content" />`);
    const driver = await createTextDriver();

    const textValues = ["Content 1", "Content 2", "Content 3", "Content 4", "Content 5"];

    for (const value of textValues) {
      await initTestBed(`<Text value="${value}" />`);
      await expect(driver.component).toHaveText(value);
    }
  });

  test("maintains performance with complex theme variables", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed('<Text value="Performance test" />', {
      testThemeVars: {
        "textColor-Text": "rgb(255, 0, 0)",
        "fontSize-Text": "16px",
        "fontWeight-Text": "bold",
        "lineHeight-Text": "1.5",
        "textShadow-Text": "1px 1px 2px rgba(0,0,0,0.5)",
      },
    });
    const driver = await createTextDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("Performance test");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("renders implicit text in other components", async ({ initTestBed, createStackDriver }) => {
    const expected = "test content";
    await initTestBed(`<Stack>${expected}</Stack>`);
    const driver = await createStackDriver();

    await expect(driver.component).toHaveText(expected);
  });

  test("maintains inline behavior in HStack layout", async ({
    initTestBed,
    createTextDriver,
    createIconDriver,
  }) => {
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

  test("maintains block behavior in VStack layout", async ({
    initTestBed,
    createTextDriver,
    createIconDriver,
  }) => {
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

  test("integrates with complex component hierarchies", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <HStack>
          <Text testId="header">Header Text</Text>
        </HStack>
        <Text testId="content">Main content text with longer description</Text>
        <HStack>
          <Text testId="footer1">Footer</Text>
          <Text testId="footer2">Text</Text>
        </HStack>
      </VStack>
    `);

    const headerDriver = await createTextDriver("header");
    const contentDriver = await createTextDriver("content");
    const footer1Driver = await createTextDriver("footer1");
    const footer2Driver = await createTextDriver("footer2");

    await expect(headerDriver.component).toHaveText("Header Text");
    await expect(contentDriver.component).toHaveText("Main content text with longer description");
    await expect(footer1Driver.component).toHaveText("Footer");
    await expect(footer2Driver.component).toHaveText("Text");
  });

  test("works correctly with dynamic content", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text value="{123 + 456}" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toHaveText("579");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("textColor theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "rgb(255, 0, 0)";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textColor-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("color", EXPECTED);
  });

  test("fontFamily theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "sans-serif";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "fontFamily-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("font-family", EXPECTED);
  });

  test("fontSize theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "48px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "fontSize-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("font-size", EXPECTED);
  });

  test("fontStyle theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "italic";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "fontStyle-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("font-style", EXPECTED);
  });

  test("fontWeight theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "900";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "fontWeight-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("font-weight", EXPECTED);
  });

  test("fontStretch theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "125%";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "fontStretch-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("font-stretch", EXPECTED);
  });

  test("textDecorationLine theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "underline";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textDecorationLine-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("text-decoration-line", EXPECTED);
  });

  test("textDecorationColor theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "rgb(255, 0, 0)";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textDecorationColor-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("text-decoration-color", EXPECTED);
  });

  test("textDecorationStyle theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "dotted";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textDecorationStyle-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("text-decoration-style", EXPECTED);
  });

  test("textDecorationThickness theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "12px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textDecorationThickness-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("text-decoration-thickness", EXPECTED);
  });

  test("textUnderlineOffset theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "12px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textUnderlineOffset-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("text-underline-offset", EXPECTED);
  });

  test("lineHeight theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "24px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "lineHeight-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("line-height", EXPECTED);
  });

  test("backgroundColor theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "rgb(255, 0, 0)";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "backgroundColor-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;

    await expect(component).toHaveCSS("background-color", EXPECTED);
  });

  test("textTransform theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "uppercase";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textTransform-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("text-transform", EXPECTED);
  });

  test("letterSpacing theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "12px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "letterSpacing-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("letter-spacing", EXPECTED);
  });

  test("wordSpacing theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "12px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "wordSpacing-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("word-spacing", EXPECTED);
  });

  test("textShadow theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "rgba(0, 0, 0, 0.5) 2px 2px 2px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textShadow-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("text-shadow", EXPECTED);
  });

  test("textIndent theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "12px";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textIndent-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("text-indent", EXPECTED);
  });

  test("textAlign theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "center";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textAlign-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("text-align", EXPECTED);
  });

  test("textAlignLast theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "center";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "textAlignLast-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("text-align-last", EXPECTED);
  });

  test("wordBreak theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "break-all";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "wordBreak-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("word-break", EXPECTED);
  });

  test("direction theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "rtl";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "direction-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("direction", EXPECTED);
  });

  test("writingMode theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "vertical-rl";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "writingMode-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("writing-mode", EXPECTED);
  });

  test("lineBreak theme variable", async ({ initTestBed, createTextDriver }) => {
    const EXPECTED = "normal";
    await initTestBed('<Text value="Hello, World" />', {
      testThemeVars: {
        "lineBreak-Text": EXPECTED,
      },
    });
    const component = (await createTextDriver()).component;
    await expect(component).toHaveCSS("line-break", EXPECTED);
  });
});

// =============================================================================
// SMOKE TESTS (kept for compatibility)
// =============================================================================

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("basic smoke test", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`<Text value="Smoke test" />`);
    const driver = await createTextDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("Smoke test");
  });
});
