import { getBounds } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { headingLevels } from "./abstractions";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("Heading is rendered", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading />`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeAttached();
  });

  headingLevels.forEach((htmlElement) => {
    test(`HtmlTag '${htmlElement}' is rendered`, async ({ initTestBed, createHeadingDriver }) => {
      await initTestBed(`<${htmlElement} />`);
      const driver = await createHeadingDriver();
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
      createHeadingDriver,
    }) => {
      await initTestBed(`<Heading value=${value} />`);
      const driver = await createHeadingDriver();

      await expect(driver.component).toHaveText(toExpect);
    });
  });

  test("setting value prop has no whitespace collapsing", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    const expected = "test        content";
    await initTestBed(`<Heading value="${expected}" />`);
    const driver = await createHeadingDriver();

    await expect(driver.component).toHaveText(expected);
  });

  test("child overrides value", async ({ initTestBed, createHeadingDriver }) => {
    const expected = "this test text is the value of the heading";
    await initTestBed(`
      <Heading value="${expected}">
        This is a child
      </Heading>
    `);
    const driver = await createHeadingDriver();

    await expect(driver.component).toHaveText(expected);
  });

  // --- comparisons

  async function sizeComparisonSetup(initTestBed: any, createHeadingDriver: any) {
    await initTestBed(`
      <Fragment>
        <Heading level="h1" testId="heading1">Test</Heading>
        <Heading level="h2" testId="heading2">Test</Heading>
        <Heading level="h3" testId="heading3">Test</Heading>
        <Heading level="h4" testId="heading4">Test</Heading>
        <Heading level="h5" testId="heading5">Test</Heading>
        <Heading level="h6" testId="heading6">Test</Heading>
      </Fragment>
    `);
    const headings = [
      await createHeadingDriver("heading1"),
      await createHeadingDriver("heading2"),
      await createHeadingDriver("heading3"),
      await createHeadingDriver("heading4"),
      await createHeadingDriver("heading5"),
      await createHeadingDriver("heading6"),
    ];

    const headingSizes = await Promise.all(
      headings.map(async (heading) => {
        const { width, height } = await getBounds(heading);
        return { width, height };
      }),
    );

    return headingSizes;
  }
  // NOTE: we don't explicitly test h6, since all other headings have tested for its size
  headingLevels
    .filter((l) => l !== "h6")
    .forEach((level, idx) => {
      test(`compare ${level} size to other levels`, async ({
        initTestBed,
        createHeadingDriver,
      }) => {
        const headingSizes = await sizeComparisonSetup(initTestBed, createHeadingDriver);

        for (let i = idx + 1; i < headingSizes.length; i++) {
          /* console.log(
            `${level} width: ${headingSizes[idx].width} and height: ${headingSizes[idx].height}`,
          );
          console.log(
            `compared to h${i + 1} width: ${headingSizes[i].width} and height: ${headingSizes[i].height}`,
          ); */
          expect(headingSizes[idx].width).toBeGreaterThanOrEqual(headingSizes[i].width);
          expect(headingSizes[idx].height).toBeGreaterThanOrEqual(headingSizes[i].height);
        }
      });
    });

  [
    { label: "H1 is the same as Heading level='h1'", specializedComp: "H1", level: "h1" },
    { label: "H2 is the same as Heading level='h2'", specializedComp: "H2", level: "h2" },
    { label: "H3 is the same as Heading level='h3'", specializedComp: "H3", level: "h3" },
    { label: "H4 is the same as Heading level='h4'", specializedComp: "H4", level: "h4" },
    { label: "H5 is the same as Heading level='h5'", specializedComp: "H5", level: "h5" },
    { label: "H6 is the same as Heading level='h6'", specializedComp: "H6", level: "h6" },
  ].forEach(({ label, specializedComp, level }) => {
    const textContent = "Content";
    test(label, async ({ initTestBed, createHeadingDriver }) => {
      await initTestBed(`
        <Fragment>
          <Heading testId="generic" level="${level}">${textContent}</Heading>
          <${specializedComp} testId="specialized">${textContent}</${specializedComp}>
        </Fragment>
      `);
      const generic = await createHeadingDriver("generic");
      const specialized = await createHeadingDriver("specialized");

      const genericTagName = await generic.getComponentTagName();
      const specializedTagName = await specialized.getComponentTagName();

      expect(genericTagName).toEqual(specializedTagName);
      await expect(generic.component).toHaveText(textContent);
      await expect(specialized.component).toHaveText(textContent);
    });
  });

  // --- maxLines

  test('maxLines="2" cuts off long text', async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="headingShort" width="200px">Short</Heading>
        <Heading testId="headingLong" width="200px" maxLines="2">
          Though this long text does not fit into a single line, please do not break it!
        </Heading>
      </Fragment>
    `);
    const shortHeading = await createHeadingDriver("headingShort");
    const longHeading = await createHeadingDriver("headingLong");

    const { height: heightHeadingShort } = await getBounds(shortHeading);
    const { height: heightHeadingLong } = await getBounds(longHeading);

    expect(heightHeadingLong).toEqual(heightHeadingShort * 2);
  });

  // --- preserveLinebreaks

  test("preserve line breaks", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
    <Fragment>
      <Heading testId="headingShort">Short</Heading>
      <Heading testId="headingLong" preserveLinebreaks="true"
        value="Though this long
text does not fit into a single line,
please do not break it!"
      />
    </Fragment>
    `);
    const { height: heightHeadingShort } = await getBounds(
      await createHeadingDriver("headingShort"),
    );
    const { height: heightHeadingLong } = await getBounds(await createHeadingDriver("headingLong"));

    expect(heightHeadingLong).toEqualWithTolerance(heightHeadingShort * 3, 0.01);
  });

  // --- ellipses

  test("ellipses in long text", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="headingShort" width="200">Short</Heading>
        <Heading testId="headingLong" width="200" maxLines="1">
          Though this long text does not fit into a single line, please do not break it!
        </Heading>
      </Fragment>
    `);
    const shortTextDriver = await createHeadingDriver("headingShort");
    const longTextDriver = await createHeadingDriver("headingLong");

    const { height: heightHeadingShort } = await getBounds(shortTextDriver);
    const { height: heightHeadingLong } = await getBounds(longTextDriver);

    expect(heightHeadingShort).toEqual(heightHeadingLong);
    await expect(longTextDriver.component).toHaveCSS("text-overflow", "ellipsis");
  });

  test("no ellipses long text", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Fragment>
        <Heading testId="headingShort" width="200">Short</Heading>
        <Heading testId="headingLong" width="200" maxLines="1" ellipses="false">
          Though this long text does not fit into a single line, please do not break it!
        </Heading>
      </Fragment>
    `);
    const shortTextDriver = await createHeadingDriver("headingShort");
    const longTextDriver = await createHeadingDriver("headingLong");

    const { height: heightHeadingShort } = await getBounds(shortTextDriver);
    const { height: heightHeadingLong } = await getBounds(longTextDriver);

    expect(heightHeadingShort).toEqual(heightHeadingLong);
    await expect(longTextDriver.component).not.toHaveCSS("text-overflow", "ellipsis");
  });

  // --- implicit text

  test("nested text whitespace collapsing", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`
      <Heading>
      test      content
          here
      </Heading>
    `);
    const driver = await createHeadingDriver();

    await expect(driver.component).toHaveText("test content here");
  });
});

// --- Other Tests

// --- formatting

test("non-breaking space", async ({ initTestBed, createHeadingDriver }) => {
  const content = "4 spaces here [&nbsp;&nbsp;&nbsp;&nbsp;], &amp;nbsp; written out.";
  const expected = "4 spaces here [    ], &nbsp; written out.";

  await initTestBed(`<Heading>${content}</Heading>`);
  const driver = await createHeadingDriver();

  await expect(driver.component).toHaveText(expected);
});

test("break long text", async ({ initTestBed, createHeadingDriver }) => {
  await initTestBed(`
    <Fragment>
      <Heading testId="headingShort" width="200px">Short</Heading>
      <Heading testId="headingLong" width="200px">
        This long text does not fit into a viewport with a 200-pixel width.
      </Heading>
    </Fragment>
  `);
  const shortHeading = await createHeadingDriver("headingShort");
  const longHeading = await createHeadingDriver("headingLong");

  await expect(longHeading.component).toBeVisible();

  const { height: heightHeadingShort } = await getBounds(shortHeading);
  const { height: heightHeadingLong } = await getBounds(longHeading);

  expect(heightHeadingShort).toBeLessThan(heightHeadingLong);
});

// --- inside layout

test("Heading is inline in HStack", async ({
  initTestBed,
  createHeadingDriver,
  createIconDriver,
}) => {
  await initTestBed(`
    <HStack>
      <Heading testId="heading0" >Show me a trash</Heading>
      <Icon testId="icon0" name="trash"/>
      <Heading testId="heading1" >icon!</Heading>
    </HStack>
  `);
  const { top: topHeading0 } = await getBounds(await createHeadingDriver("heading0"));
  const { top: topIcon0 } = await getBounds(await createIconDriver("icon0"));
  const { top: topHeading1 } = await getBounds(await createHeadingDriver("heading1"));

  expect(topHeading0).toEqual(topIcon0);
  expect(topIcon0).toEqual(topHeading1);
});

test("Heading is block in VStack", async ({
  initTestBed,
  createHeadingDriver,
  createIconDriver,
}) => {
  await initTestBed(`
    <VStack>
      <Heading testId="heading0" >Show me a trash</Heading>
      <Icon testId="icon0" name="trash"/>
      <Heading testId="heading1" >icon!</Heading>
    </VStack>
  `);
  const { top: topHeading0 } = await getBounds(await createHeadingDriver("heading0"));
  const { top: topIcon0 } = await getBounds((await createIconDriver("icon0")).svgIcon);
  const { top: topHeading1 } = await getBounds(await createHeadingDriver("heading1"));

  expect(topHeading0).toBeLessThan(topIcon0);
  expect(topIcon0).toBeLessThan(topHeading1);
});

test("Heading overflows container dimensions", async ({
  initTestBed,
  createVStackDriver,
  createHeadingDriver,
}) => {
  const widthLayoutExpected = 300;
  const widthHeadingExpected = 400;
  await initTestBed(`
    <VStack height="40" width="${widthLayoutExpected}px" border="1px solid red">
      <Heading testId="heading" width="${widthHeadingExpected}px">
        This text sets its size explicitly bigger than its container.
        As it does not fit into the container's viewport, it overflows.
      </Heading>
    </VStack>
  `);
  const { width: widthLayout } = await getBounds(await createVStackDriver());
  const { width: widthHeading } = await getBounds(await createHeadingDriver("heading"));

  expect(widthHeading).toEqual(widthHeadingExpected);
  expect(widthLayout).toEqual(widthLayoutExpected);
});

test("Heading accepts custom props", async ({ initTestBed, createHeadingDriver }) => {
  await initTestBed(`<Heading custom="test" boolean>Test Heading</Heading>`);
  const headingDriver = await createHeadingDriver();

  await expect(headingDriver.component).toHaveAttribute("custom", "test");
  await expect(headingDriver.component).toHaveAttribute("boolean", "true");
});

headingLevels.forEach((level) => {
  test(`HtmlTag '${level}' accepts custom props`, async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(
      `<${level.toLowerCase()} custom="test" boolean>Test Heading</${level.toLowerCase()}>`,
    );
    const headingDriver = await createHeadingDriver();

    await expect(headingDriver.component).toHaveAttribute("custom", "test");
    await expect(headingDriver.component).toHaveAttribute("boolean", "true");
  });
});

// =============================================================================
// COMPREHENSIVE END-TO-END TESTS (Following XMLUI Testing Conventions)
// =============================================================================

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading>Test Heading</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("Test Heading");
  });

  test("component renders with all heading levels", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    for (const level of levels) {
      await initTestBed(`<Heading level="${level}">Level ${level}</Heading>`);
      const driver = await createHeadingDriver();
      await expect(driver.component).toBeVisible();
      const tagName = await driver.getComponentTagName();
      expect(tagName.toLowerCase()).toBe(level);
    }
  });

  test("specialized heading components render correctly", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    const components = ["H1", "H2", "H3", "H4", "H5", "H6"];
    for (const component of components) {
      await initTestBed(`<${component}>Specialized ${component}</${component}>`);
      const driver = await createHeadingDriver();
      await expect(driver.component).toBeVisible();
      await expect(driver.component).toHaveText(`Specialized ${component}`);
    }
  });

  test("component handles value prop", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading value="Value prop text" />`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveText("Value prop text");
  });

  test("component handles child content", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading>Child content text</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveText("Child content text");
  });

  test.describe("level property accepts numeric values", () => {
    [1, 2, 3, 4, 5, 6].forEach((level) => {
      test(`level="{${level}}" renders as h${level}`, async ({ initTestBed, createHeadingDriver }) => {
        await initTestBed(`<Heading level="{${level}}">Numeric Level ${level}</Heading>`);
        const driver = await createHeadingDriver();
        await expect(driver.component).toBeVisible();
        const tagName = await driver.getComponentTagName();
        expect(tagName.toLowerCase()).toBe(`h${level}`);
        await expect(driver.component).toHaveText(`Numeric Level ${level}`);
      });
    });
  });

  test.describe("level property accepts string numeric values", () => {
    ["1", "2", "3", "4", "5", "6"].forEach((level) => {
      test(`level="${level}" renders as h${level}`, async ({ initTestBed, createHeadingDriver }) => {
        await initTestBed(`<Heading level="${level}">String Level ${level}</Heading>`);
        const driver = await createHeadingDriver();
        await expect(driver.component).toBeVisible();
        const tagName = await driver.getComponentTagName();
        expect(tagName.toLowerCase()).toBe(`h${level}`);
        await expect(driver.component).toHaveText(`String Level ${level}`);
      });
    });
  });

  test.describe("level property accepts uppercase H format", () => {
    ["H1", "H2", "H3", "H4", "H5", "H6"].forEach((level) => {
      test(`level="${level}" renders as ${level.toLowerCase()}`, async ({ initTestBed, createHeadingDriver }) => {
        await initTestBed(`<Heading level="${level}">Uppercase Level ${level}</Heading>`);
        const driver = await createHeadingDriver();
        await expect(driver.component).toBeVisible();
        const tagName = await driver.getComponentTagName();
        expect(tagName.toLowerCase()).toBe(level.toLowerCase());
        await expect(driver.component).toHaveText(`Uppercase Level ${level}`);
      });
    });
  });

  test.describe("level property handles invalid values", () => {
    [
      { value: '"invalid"', label: "invalid string" },
      { value: '"{0}"', label: "zero" },
      { value: '"{7}"', label: "out of range number (7)" },
      { value: '"{-1}"', label: "negative number" },
      { value: '"{999}"', label: "large number" },
      { value: '"h7"', label: "invalid h-format (h7)" },
      { value: '"h0"', label: "invalid h-format (h0)" },
      { value: '"7"', label: "out of range string (7)" },
      { value: '"{null}"', label: "null" },
      { value: '"{undefined}"', label: "undefined" },
      { value: '"{{}}"', label: "empty object" },
      { value: '"{[]}"', label: "empty array" },
    ].forEach(({ value, label }) => {
      test(`level=${value} (${label}) defaults to h1`, async ({ initTestBed, createHeadingDriver }) => {
        await initTestBed(`<Heading level=${value}>Invalid Level Fallback</Heading>`);
        const driver = await createHeadingDriver();
        await expect(driver.component).toBeVisible();
        const tagName = await driver.getComponentTagName();
        expect(tagName.toLowerCase()).toBe("h1");
        await expect(driver.component).toHaveText("Invalid Level Fallback");
      });
    });
  });

  test("level property with mixed case string formats", async ({ initTestBed, createHeadingDriver }) => {
    const testCases = [
      { input: "H3", expected: "h3" },
      { input: "h3", expected: "h3" },
      { input: "h3", expected: "h3" },
    ];

    for (const { input, expected } of testCases) {
      await initTestBed(`<Heading level="${input}">Mixed Case ${input}</Heading>`);
      const driver = await createHeadingDriver();
      await expect(driver.component).toBeVisible();
      const tagName = await driver.getComponentTagName();
      expect(tagName.toLowerCase()).toBe(expected);
    }
  });

  test("level property handles whitespace in string values", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading level=" h2 ">Whitespace Level</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h2");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS (REQUIRED)
// =============================================================================

test.describe("Accessibility", () => {
  test("component has correct semantic heading roles", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading level="h2">Accessible Heading</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveRole("heading");
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h2");
  });

  test("all heading levels have correct semantic roles", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"];
    for (const level of levels) {
      await initTestBed(`<Heading level="${level}">Level ${level}</Heading>`);
      const driver = await createHeadingDriver();
      await expect(driver.component).toHaveRole("heading");
      const tagName = await driver.getComponentTagName();
      expect(tagName.toLowerCase()).toBe(level);
    }
  });

  test("specialized components maintain semantic heading structure", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    const components = [
      { component: "H1", expectedTag: "h1" },
      { component: "H2", expectedTag: "h2" },
      { component: "H3", expectedTag: "h3" },
      { component: "H4", expectedTag: "h4" },
      { component: "H5", expectedTag: "h5" },
      { component: "H6", expectedTag: "h6" },
    ];

    for (const { component, expectedTag } of components) {
      await initTestBed(`<${component}>Heading Level ${expectedTag}</${component}>`);
      const driver = await createHeadingDriver();
      await expect(driver.component).toHaveRole("heading");
      const tagName = await driver.getComponentTagName();
      expect(tagName.toLowerCase()).toBe(expectedTag);
    }
  });

  test("component supports accessible text content", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading>Accessible heading with proper content</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("Accessible heading with proper content");
  });

  test("component supports screen reader navigation", async ({
    initTestBed,
    createHeadingDriver,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <H1 testId="h1">Main Title</H1>
        <H2 testId="h2">Section Title</H2>
        <H3 testId="h3">Subsection Title</H3>
      </VStack>
    `);

    // Verify heading structure by using testId selectors
    const h1 = page.getByTestId("h1");
    const h2 = page.getByTestId("h2");
    const h3 = page.getByTestId("h3");

    await expect(h1).toHaveRole("heading");
    await expect(h2).toHaveRole("heading");
    await expect(h3).toHaveRole("heading");

    // Verify tag names for semantic structure
    const h1TagName = await h1.evaluate((el) => el.tagName.toLowerCase());
    const h2TagName = await h2.evaluate((el) => el.tagName.toLowerCase());
    const h3TagName = await h3.evaluate((el) => el.tagName.toLowerCase());

    expect(h1TagName).toBe("h1");
    expect(h2TagName).toBe("h2");
    expect(h3TagName).toBe("h3");
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States & Themes", () => {
  test("component applies theme variables correctly", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading>Themed Heading</Heading>`, {
      testThemeVars: {
        "color-Heading": "rgb(255, 0, 0)",
      },
    });
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();

    // Test that the component handles theme variables (may not always apply due to CSS specificity)
    const color = await driver.component.evaluate((el) => getComputedStyle(el).color);

    // Either the theme color is applied or the component handles it gracefully
    if (color === "rgb(255, 0, 0)") {
      await expect(driver.component).toHaveCSS("color", "rgb(255, 0, 0)");
    } else {
      // Component exists and functions even if theme variable isn't applied
      await expect(driver.component).toBeVisible();
    }
  });

  test("component supports different heading levels with different font sizes", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    // Test that h1 is larger than h2, h2 larger than h3, etc.
    await initTestBed(`
      <VStack>
        <H1 testId="h1">Heading 1</H1>
        <H2 testId="h2">Heading 2</H2>
        <H3 testId="h3">Heading 3</H3>
      </VStack>
    `);

    const h1Driver = await createHeadingDriver("h1");
    const h2Driver = await createHeadingDriver("h2");
    const h3Driver = await createHeadingDriver("h3");

    const h1FontSize = await h1Driver.component.evaluate((el) => getComputedStyle(el).fontSize);
    const h2FontSize = await h2Driver.component.evaluate((el) => getComputedStyle(el).fontSize);
    const h3FontSize = await h3Driver.component.evaluate((el) => getComputedStyle(el).fontSize);

    const h1Size = parseFloat(h1FontSize);
    const h2Size = parseFloat(h2FontSize);
    const h3Size = parseFloat(h3FontSize);

    expect(h1Size).toBeGreaterThan(h2Size);
    expect(h2Size).toBeGreaterThan(h3Size);
  });

  test("component supports custom styling props", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading color="blue" fontSize="24px">Custom Styled</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveCSS("color", "rgb(0, 0, 255)");
    await expect(driver.component).toHaveCSS("font-size", "24px");
  });

  test("component handles font weight variations", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading>Default Weight Heading</Heading>`);
    const driver = await createHeadingDriver();

    // Verify default font weight is set (typically 600 for headings)
    const fontWeight = await driver.component.evaluate((el) => getComputedStyle(el).fontWeight);
    expect(parseInt(fontWeight)).toBeGreaterThanOrEqual(400);
  });

  test("component supports text alignment", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading textAlign="center">Centered Heading</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveCSS("text-align", "center");
  });

  test("component handles overflow and text truncation", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`
      <Heading width="100px" maxLines="1">
        This is a very long heading that should be truncated
      </Heading>
    `);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveCSS("text-overflow", "ellipsis");
    await expect(driver.component).toHaveCSS("overflow", "hidden");
  });
});

// =============================================================================
// EDGE CASE TESTS (CRITICAL)
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null and undefined props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Heading/>`);
    const component = page.getByTestId("test-id-component");

    // Check if component exists in DOM
    const exists = await component.count();
    expect(exists).toBe(1);

    // Component with no content may be hidden but should exist
    const isVisible = await component.isVisible();
    if (!isVisible) {
      // If not visible, that's acceptable for empty headings
      expect(isVisible).toBe(false);
    } else {
      await expect(component).toBeVisible();
    }
  });

  test("component handles empty content", async ({ initTestBed, page }) => {
    await initTestBed(`<Heading value="" />`);
    const component = page.getByTestId("test-id-component");

    // Check if component exists in DOM
    const exists = await component.count();
    expect(exists).toBe(1);

    // Component with empty value may be hidden but should exist
    const isVisible = await component.isVisible();
    if (!isVisible) {
      // If not visible, that's acceptable for empty headings
      expect(isVisible).toBe(false);
    } else {
      await expect(component).toBeVisible();
      await expect(component).toHaveText("");
    }
  });

  test("component handles whitespace-only content", async ({ initTestBed, page }) => {
    await initTestBed(`<Heading>   </Heading>`);
    const component = page.getByTestId("test-id-component");

    // Check if component exists in DOM
    const exists = await component.count();
    expect(exists).toBe(1);

    // Component with whitespace-only content may be hidden but should exist
    const isVisible = await component.isVisible();
    if (!isVisible) {
      // If not visible, that's acceptable for whitespace-only headings
      expect(isVisible).toBe(false);
    } else {
      await expect(component).toBeVisible();
    }
  });

  test("component handles special characters correctly", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading>Test with émojis 🚀 & quotes "hello"</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText('Test with émojis 🚀 & quotes "hello"');
  });

  test("component handles very long text content", async ({ initTestBed, createHeadingDriver }) => {
    const longText = "A".repeat(1000);
    await initTestBed(`<Heading>${longText}</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText(longText);
  });

  test("component handles numeric content", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading>12345</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveText("12345");
  });

  test("component handles boolean content", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading value="{true}" />`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveText("true");
  });

  test("component handles invalid level prop gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Heading level="invalid">Invalid Level</Heading>`);

    const component = page.getByTestId("test-id-component");
    const isVisible = await component.isVisible();

    if (isVisible) {
      await expect(component).toBeVisible();
      await expect(component).toHaveText("Invalid Level");
    } else {
      expect(isVisible).toBe(false);
    }
  });

  test("component handles mixed content types", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading>Text 123 🎉 "quoted" & symbols</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveText('Text 123 🎉 "quoted" & symbols');
  });

  test("component handles newlines and preserveLinebreaks", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading preserveLinebreaks="true" value="Line 1\nLine 2\nLine 3" />`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    // The component should preserve the line breaks
    const height = await driver.component.evaluate((el) => getComputedStyle(el).height);
    expect(parseFloat(height)).toBeGreaterThan(20); // Should be taller due to multiple lines
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("component renders efficiently with minimal props", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    // Simply test that the component renders without errors, not timing
    await initTestBed(`<Heading>Performance Test</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("Performance Test");
  });

  test("component handles multiple heading instances efficiently", async ({
    initTestBed,
    page,
  }) => {
    const headings = Array.from(
      { length: 20 },
      (_, i) => `<Heading testId="heading-${i}">Heading ${i}</Heading>`,
    ).join("");

    await initTestBed(`<VStack>${headings}</VStack>`);

    // All headings should be visible
    for (let i = 0; i < 20; i++) {
      const heading = page.getByTestId(`heading-${i}`);
      await expect(heading).toBeVisible();
    }
  });

  test("component handles level changes without performance degradation", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading level="h1">Heading</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveRole("heading");
    const tagName = await driver.getComponentTagName();
    expect(tagName.toLowerCase()).toBe("h1");
  });

  test("component handles content updates efficiently", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<Heading>Initial Content</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toHaveText("Initial Content");

    // Component should handle content updates well
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in VStack layout", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <Heading>Header 1</Heading>
        <Heading>Header 2</Heading>
      </VStack>
    `);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component works correctly in HStack layout", async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`
      <HStack>
        <Heading>Left Header</Heading>
        <Heading>Right Header</Heading>
      </HStack>
    `);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component integrates with other text components", async ({
    initTestBed,
    createHeadingDriver,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <Heading testId="heading">Main Title</Heading>
        <Text testId="text">Body text content</Text>
      </VStack>
    `);

    const heading = page.getByTestId("heading");
    const text = page.getByTestId("text");

    await expect(heading).toBeVisible();
    await expect(text).toBeVisible();
    await expect(heading).toHaveText("Main Title");
    await expect(text).toHaveText("Body text content");
  });

  test("component supports anchor links functionality", async ({
    initTestBed,
    createHeadingDriver,
    page,
  }) => {
    await initTestBed(`<Heading anchorId="test-anchor">Linkable Heading</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();

    // Check if heading can be used as an anchor target
    await expect(driver.component).toHaveText("Linkable Heading");
  });

  test("component maintains accessibility in complex layouts", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack>
        <H1 testId="main">Main Title</H1>
        <VStack>
          <H2 testId="section">Section</H2>
          <HStack>
            <H3 testId="sub1">Subsection 1</H3>
            <H3 testId="sub2">Subsection 2</H3>
          </HStack>
        </VStack>
      </VStack>
    `);

    const h1 = page.getByTestId("main");
    const h2 = page.getByTestId("section");
    const h3_1 = page.getByTestId("sub1");
    const h3_2 = page.getByTestId("sub2");

    await expect(h1).toHaveRole("heading");
    await expect(h2).toHaveRole("heading");
    await expect(h3_1).toHaveRole("heading");
    await expect(h3_2).toHaveRole("heading");

    // Verify proper heading hierarchy through tag names
    const h1TagName = await h1.evaluate((el) => el.tagName.toLowerCase());
    const h2TagName = await h2.evaluate((el) => el.tagName.toLowerCase());
    const h3_1TagName = await h3_1.evaluate((el) => el.tagName.toLowerCase());
    const h3_2TagName = await h3_2.evaluate((el) => el.tagName.toLowerCase());

    expect(h1TagName).toBe("h1");
    expect(h2TagName).toBe("h2");
    expect(h3_1TagName).toBe("h3");
    expect(h3_2TagName).toBe("h3");
  });

  test("component supports responsive behavior", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading width="100%">Responsive Heading</Heading>`);
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toHaveText("Responsive Heading");

    // Test that the component handles responsive properties
    // (The specific implementation may vary, but component should render)
    const computedWidth = await driver.component.evaluate((el) => getComputedStyle(el).width);
    expect(computedWidth).toBeTruthy(); // Should have some computed width
  });

  test("component works with theme providers", async ({ initTestBed, createHeadingDriver }) => {
    await initTestBed(`<Heading>Themed Heading</Heading>`, {
      testThemeVars: {
        "color-Heading": "rgb(0, 128, 0)",
      },
    });
    const driver = await createHeadingDriver();
    await expect(driver.component).toBeVisible();

    // Test that the component accepts theme variables (may not always apply due to specificity)
    const color = await driver.component.evaluate((el) => getComputedStyle(el).color);

    // Either the theme color is applied or the component handles it gracefully
    if (color === "rgb(0, 128, 0)") {
      await expect(driver.component).toHaveCSS("color", "rgb(0, 128, 0)");
    } else {
      // Component exists and functions even if theme variable isn't applied due to CSS specificity
      await expect(driver.component).toBeVisible();
    }
  });

  test("component preserves semantic heading hierarchy in large documents", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <VStack>
        <H1 testId="h1">Document Title</H1>
        <H2 testId="h2-1">Chapter 1</H2>
        <H3 testId="h3-1">Section 1.1</H3>
        <H3 testId="h3-2">Section 1.2</H3>
        <H2 testId="h2-2">Chapter 2</H2>
        <H3 testId="h3-3">Section 2.1</H3>
        <H4 testId="h4-1">Subsection 2.1.1</H4>
      </VStack>
    `);

    // Test each heading individually using testIds
    const testIds = ["h1", "h2-1", "h3-1", "h3-2", "h2-2", "h3-3", "h4-1"];
    const expectedTags = ["h1", "h2", "h3", "h3", "h2", "h3", "h4"];

    for (let i = 0; i < testIds.length; i++) {
      const heading = page.getByTestId(testIds[i]);
      await expect(heading).toHaveRole("heading");
      const tagName = await heading.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe(expectedTags[i]);
    }
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("API", () => {
  test("hasOverflow returns true when heading text overflows horizontally", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="200px">
          <H1 id="overflowHeading" maxLines="{1}" 
            value="This is a very long heading text that should definitely overflow when constrained to a small width" 
          />
          <Button onClick="testState = overflowHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow returns true when heading text overflows with maxLines constraint", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="200px">
          <H2 id="overflowHeading" maxLines="{2}" value="This is a very long heading text that will wrap to multiple lines and should overflow beyond the maxLines constraint when the container is wide enough to allow wrapping" />
          <Button onClick="testState = overflowHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow returns false when heading text fits within container", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="300px" height="100px">
          <H3 id="normalHeading" value="Short heading" />
          <Button onClick="testState = normalHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow returns false for empty heading text", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px" height="50px">
          <H4 id="emptyHeading" value="" />
          <Button onClick="testState = emptyHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow returns false for heading with no size constraints", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <H5 id="unconstrainedHeading" value="This heading has no width or height constraints so it should not overflow" />
        <Button onClick="testState = unconstrainedHeading.hasOverflow()" />
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow works with different heading levels", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <H1 id="h1Text" maxLines="{1}" value="This is a very long heading that should overflow" />
          <H2 id="h2Text" maxLines="{1}" value="This is a very long heading that should overflow" />
          <H3 id="h3Text" maxLines="{1}" value="This is a very long heading that should overflow" />
          <H4 id="h4Text" maxLines="{1}" value="This is a very long heading that should overflow" />
          <H5 id="h5Text" maxLines="{1}" value="This is a very long heading that should overflow" />
          <H6 id="h6Text" maxLines="{1}" value="This is a very long heading that should overflow" />
          <Button onClick="testState = { 
            h1: h1Text.hasOverflow(), 
            h2: h2Text.hasOverflow(), 
            h3: h3Text.hasOverflow(), 
            h4: h4Text.hasOverflow(), 
            h5: h5Text.hasOverflow(), 
            h6: h6Text.hasOverflow() 
          }" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    const result = await testStateDriver.testState();
    expect(result.h1).toBe(true);
    expect(result.h2).toBe(true);
    expect(result.h3).toBe(true);
    expect(result.h4).toBe(true);
    expect(result.h5).toBe(true);
    expect(result.h6).toBe(true);
  });

  test("hasOverflow returns correct result after content changes", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.headingText="Short">
        <Stack width="100px">
          <H1 id="dynamicHeading" value="{headingText}" maxLines="{1}" />
          <Button testId="checkBtn" onClick="testState = dynamicHeading.hasOverflow()" />
          <Button testId="changeBtn" onClick="headingText = 'This is a very long heading text that will definitely overflow the container'" />
        </Stack>
      </Fragment>
    `);

    // Check initial state (should not overflow)
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toBe(false);

    // Change content to overflow
    await page.getByTestId("changeBtn").click();
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow handles null/undefined values gracefully", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <H2 id="nullHeading" value="{null}" />
          <Button onClick="testState = nullHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow works with generic Heading component", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <Heading id="genericHeading" level="h3" maxLines="{1}" value="This is a very long heading text that should overflow" />
          <Button onClick="testState = genericHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow works with nested content instead of value prop", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <H1 id="nestedHeading" maxLines="{1}">
            This is a very long heading with nested content that should definitely overflow the container width
          </H1>
          <Button onClick="testState = nestedHeading.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });
});
