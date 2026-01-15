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
    <VStack>
      <Text testId="textShort">Short</Text>
      <Text testId="textLong" preserveLinebreaks="true"
        value="Though this long
text does not fit into a single line,
please do not break it!"
      />
    </VStack>
    `);
    const { height: heightTextShort } = await getBounds(
      (await createTextDriver("textShort")).component,
    );
    const { height: heightTextLong } = await getBounds(
      (await createTextDriver("textLong")).component,
    );

    expect(heightTextLong).toEqualWithTolerance(heightTextShort * 3, 0.01);
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("API", () => {
  test("hasOverflow returns true when text overflows horizontally", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="200px">
          <Text id="overflowText" maxLines="{1}"
            value="This is a very long text that should definitely overflow when constrained to a small width"
          />
          <Button onClick="testState = overflowText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow returns true when text overflows with maxLines constraint", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="200px">
          <Text id="overflowText" maxLines="{2}" value="This is a very long text that will wrap to multiple lines and should overflow beyond the maxLines constraint when the container is wide enough to allow wrapping" />
          <Button onClick="testState = overflowText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow returns false when text fits within container", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="300px" height="100px">
          <Text id="normalText" value="Short text" />
          <Button onClick="testState = normalText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow returns false for empty text", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px" height="50px">
          <Text id="emptyText" value="" />
          <Button onClick="testState = emptyText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow returns false for text with no size constraints", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Text id="unconstrainedText" value="This text has no width or height constraints so it should not overflow" />
        <Button onClick="testState = unconstrainedText.hasOverflow()" />
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow works with different overflow modes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <Text id="ellipsisText" overflowMode="ellipsis" maxLines="{1}" value="This is a very long text that should overflow" />
          <Button onClick="testState = { ellipsis: ellipsisText.hasOverflow() }" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    const result = await testStateDriver.testState();
    expect(result.ellipsis).toBe(true);
  });

  test("hasOverflow works with scroll overflow mode", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <Text id="scrollText" overflowMode="scroll" value="This is a very long text that should create horizontal scroll" />
          <Button onClick="testState = scrollText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow returns correct result after content changes", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.text="short">
        <Stack width="100px">
          <Text id="dynamicText" value="{text}" maxLines="{1}" />
          <Button testId="checkBtn" onClick="testState = dynamicText.hasOverflow()" />
          <Button testId="changeBtn" onClick="text = 'This is a very long text that will definitely overflow the container'" />
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
          <Text id="nullText" value="{null}" />
          <Button onClick="testState = nullText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(false);
  });

  test("hasOverflow works with unicode characters", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <Text id="unicodeText" maxLines="{1}" value="👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦👨‍👩‍👧‍👦" />
          <Button onClick="testState = unicodeText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow works with Chinese characters", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="100px">
          <Text id="chineseText" maxLines="{1}" value="这是一个非常长的中文文本，应该会在小容器中溢出显示区域超出边界限制" />
          <Button onClick="testState = chineseText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toBe(true);
  });

  test("hasOverflow API can be called multiple times", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Stack width="200px">
          <Text id="multiCallText" value="Test content" />
          <Button onClick="testState = testState == null ? 1 : testState + 1; multiCallText.hasOverflow()" />
        </Stack>
      </Fragment>
    `);

    // Call API multiple times
    await page.getByRole("button").click();
    await page.getByRole("button").click();
    await page.getByRole("button").click();

    // Should have been called 3 times without errors
    await expect.poll(testStateDriver.testState).toBe(3);
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

    const { height: heightTextShort } = await getBounds(shortTextDriver.component);
    const { height: heightTextLong } = await getBounds(longTextDriver.component);

    // Heights should be similar (within reasonable tolerance for inline-block rendering)
    expect(Math.abs(heightTextShort - heightTextLong)).toBeLessThan(10);
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

    const { height: heightTextShort } = await getBounds(shortTextDriver.component);
    const { height: heightTextLong } = await getBounds(longTextDriver.component);

    // Heights should be similar (within reasonable tolerance for inline-block rendering)
    expect(Math.abs(heightTextShort - heightTextLong)).toBeLessThan(10);
    await expect(longTextDriver.component).not.toHaveCSS("text-overflow", "ellipsis");
  });

  test("constrains text to maxLines", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <VStack>
        <Text testId="textShort" width="200px">Short</Text>
        <Text testId="textLong" width="200px" maxLines="2">
          Though this long text does not fit into a single line, please do not break it!
        </Text>
      </VStack>
    `);
    const shortText = await createTextDriver("textShort");
    const longText = await createTextDriver("textLong");

    const { height: heightTextShort } = await getBounds(shortText.component);
    const { height: heightTextLong } = await getBounds(longText.component);

    expect(heightTextLong).toEqual(heightTextShort * 2);
  });

  test("breaks long text when constrained by width", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <VStack>
        <Text testId="textShort" width="200px">Short</Text>
        <Text testId="textLong" width="200px">
          This long text does not fit into a viewport with a 200-pixel width.
        </Text>
      </VStack>
    `);
    const shortText = await createTextDriver("textShort");
    const longText = await createTextDriver("textLong");

    await expect(longText.component).toBeVisible();

    const { height: heightTextShort } = await getBounds(shortText.component);
    const { height: heightTextLong } = await getBounds(longText.component);

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
    const { width: widthLayout } = await getBounds((await createVStackDriver()).component);
    const { width: widthText } = await getBounds((await createTextDriver("text")).component);

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

  test("maintains consistent vertical alignment in FlowLayout with and without ellipsis", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <VStack gap="20px">
        <Card>
          <FlowLayout verticalAlignment="center">
            <Text testId="text1-ellipsis" overflowMode="ellipsis" width="470px">
              lorem ipsum dolor sit amet eiusmod tempor incididunt
            </Text>
            <Text testId="text2-ellipsis" width="130px">
              Jan 01, 2024 10:00
            </Text>
          </FlowLayout>
        </Card>

        <Card>
          <FlowLayout verticalAlignment="center">
            <Text testId="text1-no-ellipsis" width="470px">
              lorem ipsum dolor sit amet eiusmod tempor incididunt
            </Text>
            <Text testId="text2-no-ellipsis" width="130px">
              Jan 01, 2024 10:00
            </Text>
          </FlowLayout>
        </Card>
      </VStack>
    `);

    // Get vertical positions of both text pairs
    const { top: text1EllipsisTop } = await getBounds(page.getByTestId("text1-ellipsis"));
    const { top: text2EllipsisTop } = await getBounds(page.getByTestId("text2-ellipsis"));
    const { top: text1NoEllipsisTop } = await getBounds(page.getByTestId("text1-no-ellipsis"));
    const { top: text2NoEllipsisTop } = await getBounds(page.getByTestId("text2-no-ellipsis"));

    // Calculate vertical alignment difference within each row
    const alignmentDiffEllipsis = Math.abs(text1EllipsisTop - text2EllipsisTop);
    const alignmentDiffNoEllipsis = Math.abs(text1NoEllipsisTop - text2NoEllipsisTop);

    // Both rows should have similar vertical alignment (within 2px tolerance for sub-pixel rendering)
    expect(Math.abs(alignmentDiffEllipsis - alignmentDiffNoEllipsis)).toBeLessThan(2);
  });

  test("aligns inline elements (like strong) properly when mixed with text content", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <HStack testId="container" gap="10px">
        <Text testId="text-with-strong">
          <strong>From:</strong>
          My Name [email@email.com]
        </Text>
        <Text testId="text-plain">Jan 01, 2024 10:00</Text>
      </HStack>
    `);

    // Get vertical positions of both text elements
    const textWithStrong = page.getByTestId("text-with-strong");
    const textPlain = page.getByTestId("text-plain");

    const { top: strongTop, left: strongLeft } = await getBounds(textWithStrong);
    const { top: plainTop, left: plainLeft } = await getBounds(textPlain);

    // Both texts should be aligned at approximately the same vertical position
    // (within 2px tolerance for sub-pixel rendering and font rendering differences)
    const verticalAlignmentDiff = Math.abs(strongTop - plainTop);
    expect(verticalAlignmentDiff).toBeLessThan(2);

    // Verify that texts are positioned side-by-side (not overlapping)
    expect(plainLeft).toBeGreaterThan(strongLeft);
  });
});

// =============================================================================
// OVERFLOW MODE TESTS
// =============================================================================

test.describe("Overflow Mode", () => {
  test('overflowMode="none" allows wrapping with no overflow indicator', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px" overflowMode="none">
        This is a very long text that should wrap naturally and show no ellipsis.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("white-space", "nowrap");
    await expect(driver.component).toHaveCSS("text-overflow", "clip");
    await expect(driver.component).toHaveCSS("overflow", "hidden");
  });

  test('overflowMode="none" ignores maxLines and clips text cleanly', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px" overflowMode="none" maxLines="2">
        This is a long-long-long text that should be simply cut at the end without any ellipsis or other overflow indicator.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("white-space", "nowrap");
    await expect(driver.component).toHaveCSS("text-overflow", "clip");
    await expect(driver.component).toHaveCSS("overflow", "hidden");
    // Should NOT use webkit-line-clamp for "none" behavior - it ignores maxLines
    await expect(driver.component).toHaveCSS("-webkit-line-clamp", "none");
    // Should not apply maxLines styles since none mode ignores maxLines
    const maxHeight = await driver.component.evaluate((el) => getComputedStyle(el).maxHeight);
    expect(maxHeight).toBe("none"); // Should be "none" since maxLines is ignored

    // Verify the element is visible and has content
    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText("This is a long-long-long text");
  });

  test('overflowMode="ellipsis" shows ellipsis when text overflows (default)', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px" overflowMode="ellipsis" maxLines="1">
        This is a very long text that should show ellipsis when it overflows.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("text-overflow", "ellipsis");
    await expect(driver.component).toHaveCSS("overflow", "hidden");
  });

  test('overflowMode="scroll" enables horizontal scrolling', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px" overflowMode="scroll">
        This is a very long text that should enable horizontal scrolling when it overflows the container width.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("white-space", "nowrap");
    await expect(driver.component).toHaveCSS("overflow-x", "auto");
    await expect(driver.component).toHaveCSS("overflow-y", "hidden");
  });

  test('overflowMode="flow" allows multi-line wrapping with vertical scrolling', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px" height="60px" overflowMode="flow">
        This is a very long text that should wrap to multiple lines and show a vertical scrollbar when the content exceeds the container height.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("white-space", "normal");
    await expect(driver.component).toHaveCSS("overflow-x", "hidden");
    await expect(driver.component).toHaveCSS("overflow-y", "auto");
  });

  test('overflowMode="flow" ignores maxLines property', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px" overflowMode="flow" maxLines="3">
        This is a very long text that should wrap to multiple lines and completely ignore the maxLines property when using flow mode.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("white-space", "normal");
    await expect(driver.component).toHaveCSS("overflow-y", "auto");
    // Check that line-clamp is NOT applied when flow mode ignores maxLines
    await expect(driver.component).toHaveCSS("-webkit-line-clamp", "none");
    await expect(driver.component).not.toHaveCSS("display", "-webkit-box");
  });

  test("overflowMode works with maxLines", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <VStack>
        <Text testId="ellipsisText" width="200px" overflowMode="ellipsis" maxLines="2">
          This is a very long text that should be limited to 2 lines with line-clamp and show ellipsis.
        </Text>
      </VStack>
    `);
    const ellipsisDriver = await createTextDriver("ellipsisText");

    // Ellipsis should respect maxLines with line-clamp
    await expect(ellipsisDriver.component).toHaveCSS("-webkit-line-clamp", "2");

    // Should show ellipsis behavior
    await expect(ellipsisDriver.component).toHaveCSS("text-overflow", "ellipsis");
  });

  test("overflowMode='scroll' ignores maxLines", async ({ initTestBed, createTextDriver }) => {
    await initTestBed(`
      <VStack>
        <Text testId="scrollWithMaxLines" width="150px" overflowMode="scroll" maxLines="2">
          This is a very long text that should scroll horizontally and completely ignore the maxLines property.
        </Text>
        <Text testId="scrollWithoutMaxLines" width="150px" overflowMode="scroll">
          This is a very long text that should scroll horizontally without any maxLines property.
        </Text>
      </VStack>
    `);
    const scrollWithMaxLinesDriver = await createTextDriver("scrollWithMaxLines");
    const scrollWithoutMaxLinesDriver = await createTextDriver("scrollWithoutMaxLines");

    // Both should have the same behavior - no line-clamp applied
    await expect(scrollWithMaxLinesDriver.component).toHaveCSS("-webkit-line-clamp", "none");
    await expect(scrollWithoutMaxLinesDriver.component).toHaveCSS("-webkit-line-clamp", "none");

    // Both should have scroll behavior
    await expect(scrollWithMaxLinesDriver.component).toHaveCSS("overflow-x", "auto");
    await expect(scrollWithoutMaxLinesDriver.component).toHaveCSS("overflow-x", "auto");
    await expect(scrollWithMaxLinesDriver.component).toHaveCSS("white-space", "nowrap");
    await expect(scrollWithoutMaxLinesDriver.component).toHaveCSS("white-space", "nowrap");

    // Neither should use text-overflow ellipsis
    await expect(scrollWithMaxLinesDriver.component).toHaveCSS("text-overflow", "clip");
    await expect(scrollWithoutMaxLinesDriver.component).toHaveCSS("text-overflow", "clip");
  });

  test("overflowMode='flow' ignores maxLines for unrestricted wrapping", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <Text testId="flowWithMaxLines" width="150px" overflowMode="flow" maxLines="2">
          This is a very long text that should wrap to multiple lines and completely ignore the maxLines property when using flow mode.
        </Text>
        <Text testId="flowWithoutMaxLines" width="150px" overflowMode="flow">
          This is a very long text that should wrap to multiple lines without any line limit when using flow mode.
        </Text>
      </VStack>
    `);
    const flowWithMaxLinesDriver = await createTextDriver("flowWithMaxLines");
    const flowWithoutMaxLinesDriver = await createTextDriver("flowWithoutMaxLines");

    // Both should behave identically - flow mode ignores maxLines
    await expect(flowWithMaxLinesDriver.component).toHaveCSS("-webkit-line-clamp", "none");
    await expect(flowWithoutMaxLinesDriver.component).toHaveCSS("-webkit-line-clamp", "none");

    // Both should have flow behavior
    await expect(flowWithMaxLinesDriver.component).toHaveCSS("overflow-y", "auto");
    await expect(flowWithoutMaxLinesDriver.component).toHaveCSS("overflow-y", "auto");
    await expect(flowWithMaxLinesDriver.component).toHaveCSS("overflow-x", "hidden");
    await expect(flowWithoutMaxLinesDriver.component).toHaveCSS("overflow-x", "hidden");
    await expect(flowWithMaxLinesDriver.component).toHaveCSS("white-space", "normal");
    await expect(flowWithoutMaxLinesDriver.component).toHaveCSS("white-space", "normal");

    // Neither should use webkit-box display
    await expect(flowWithMaxLinesDriver.component).not.toHaveCSS("display", "-webkit-box");
    await expect(flowWithoutMaxLinesDriver.component).not.toHaveCSS("display", "-webkit-box");
  });

  test("overflowMode respects ellipses property for ellipsis behavior", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <Text testId="withEllipses" width="200px" overflowMode="ellipsis" ellipses="true" maxLines="1">
          This text should show ellipses.
        </Text>
        <Text testId="withoutEllipses" width="200px" overflowMode="ellipsis" ellipses="false" maxLines="1">
          This text should not show ellipses.
        </Text>
      </VStack>
    `);
    const withEllipsesDriver = await createTextDriver("withEllipses");
    const withoutEllipsesDriver = await createTextDriver("withoutEllipses");

    await expect(withEllipsesDriver.component).toHaveCSS("text-overflow", "ellipsis");
    await expect(withoutEllipsesDriver.component).toHaveCSS("text-overflow", "clip");
  });

  test('overflowMode="ellipsis" works with multi-line text (maxLines > 1)', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <Text testId="singleLine" width="150px" overflowMode="ellipsis" maxLines="1">
          This is a very long text that should be truncated to a single line with ellipsis.
        </Text>
        <Text testId="multiLine" width="150px" overflowMode="ellipsis" maxLines="2">
          This is a very long text that should wrap to exactly two lines and then be truncated with ellipsis if there's more content that doesn't fit.
        </Text>
      </VStack>
    `);
    const singleLineDriver = await createTextDriver("singleLine");
    const multiLineDriver = await createTextDriver("multiLine");

    // Both should have ellipsis behavior
    await expect(singleLineDriver.component).toHaveCSS("text-overflow", "ellipsis");
    await expect(multiLineDriver.component).toHaveCSS("text-overflow", "ellipsis");

    // Single line should use nowrap
    await expect(singleLineDriver.component).toHaveCSS("white-space", "nowrap");

    // Multi-line should have line-clamp applied
    await expect(multiLineDriver.component).toHaveCSS("-webkit-line-clamp", "2");

    // Verify heights: multi-line should be approximately 2x single line height
    const { height: heightSingle } = await getBounds(singleLineDriver.component);
    const { height: heightMulti } = await getBounds(multiLineDriver.component);

    // Multi-line should be taller than single line
    expect(heightMulti).toBeGreaterThan(heightSingle);
    // And should be roughly 2x the height (allowing for some tolerance)
    expect(heightMulti).toBeGreaterThan(heightSingle * 1.5);
    expect(heightMulti).toBeLessThan(heightSingle * 2.5);
  });
});

// =============================================================================
// BREAK MODE TESTS
// =============================================================================

test.describe("Break Mode", () => {
  test('breakMode="normal" uses standard word boundaries', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="150px" breakMode="normal">
        This is a verylongwordthatshouldbreakatwordboundaries normally.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("word-break", "normal");
    await expect(driver.component).toHaveCSS("overflow-wrap", "normal");
  });

  test('breakMode="word" breaks long words to prevent overflow', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="150px" breakMode="word">
        This is a verylongwordthatexceedsthecontainerwidthandshouldbreak.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("overflow-wrap", "break-word");
  });

  test('breakMode="anywhere" breaks at any character', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="100px" breakMode="anywhere">
        Verylongwordwithnobreaks
      </Text>
    `);
    const driver = await createTextDriver("text");

    // Should have word-break: break-all or overflow-wrap: anywhere
    const wordBreak = await driver.component.evaluate((el) => getComputedStyle(el).wordBreak);
    const overflowWrap = await driver.component.evaluate((el) => getComputedStyle(el).overflowWrap);

    expect(wordBreak === "break-all" || overflowWrap === "anywhere").toBe(true);
  });

  test('breakMode="keep" prevents breaking within words', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="100px" breakMode="keep">
        This text should keep words intact
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("word-break", "keep-all");
  });

  test('breakMode="hyphenate" uses automatic hyphenation', async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="150px" breakMode="hyphenate" lang="en">
        This is a supercalifragilisticexpialidocious word that should be hyphenated.
      </Text>
    `);
    const driver = await createTextDriver("text");

    await expect(driver.component).toHaveCSS("hyphens", "auto");
    await expect(driver.component).toHaveCSS("overflow-wrap", "break-word");
  });

  test("breakMode works with different overflow modes", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <VStack>
        <Text testId="ellipsisWord" width="150px" overflowMode="ellipsis" breakMode="word" maxLines="1">
          This superlongwordwithoutbreaks should be handled properly.
        </Text>
        <Text testId="scrollAnywhere" width="150px" overflowMode="scroll" breakMode="anywhere">
          This verylongwordwithoutanybreaks should break anywhere and scroll.
        </Text>
      </VStack>
    `);
    const ellipsisDriver = await createTextDriver("ellipsisWord");
    const scrollDriver = await createTextDriver("scrollAnywhere");

    // Check overflow mode styles
    await expect(ellipsisDriver.component).toHaveCSS("text-overflow", "ellipsis");
    await expect(scrollDriver.component).toHaveCSS("overflow-x", "auto");

    // Check break mode styles
    await expect(ellipsisDriver.component).toHaveCSS("overflow-wrap", "break-word");

    const scrollWordBreak = await scrollDriver.component.evaluate(
      (el) => getComputedStyle(el).wordBreak,
    );
    const scrollOverflowWrap = await scrollDriver.component.evaluate(
      (el) => getComputedStyle(el).overflowWrap,
    );
    expect(scrollWordBreak === "break-all" || scrollOverflowWrap === "anywhere").toBe(true);
  });

  test("default breakMode allows theme variables to work", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Text testId="text" width="200px">
        This text should use the default browser behavior and allow theme variables to override.
      </Text>
    `);
    const driver = await createTextDriver("text");

    // Should not have any break mode classes when no breakMode is specified
    const className = await driver.component.getAttribute("class");
    expect(className).not.toContain("breakWord");
    expect(className).not.toContain("breakAnywhere");
    expect(className).not.toContain("breakKeep");
    expect(className).not.toContain("breakHyphenate");
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

  test("nested Texts", async ({ initTestBed, page }) => {
    await initTestBed(`<Text>abc<Text>def</Text>ghi</Text>`);

    // Check if the page displays the combined text "abcdefghi"
    await expect(page.locator("body")).toContainText("abcdefghi");
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
    const { top: topText0 } = await getBounds((await createTextDriver("text0")).component);
    const { top: topIcon0 } = await getBounds((await createIconDriver("icon0")).component);
    const { top: topText1 } = await getBounds((await createTextDriver("text1")).component);

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
    const { top: topText0 } = await getBounds((await createTextDriver("text0")).component);
    const { top: topIcon0 } = await getBounds((await createIconDriver("icon0")).svgIcon);
    const { top: topText1 } = await getBounds((await createTextDriver("text1")).component);

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
    const EXPECTED = "normal";
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

  // =============================================================================
  // PREDEFINED VARIANT TESTS
  // =============================================================================

  test("variant='secondary' applies secondary theme variables", async ({
    initTestBed,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Theme fontSize-Text-secondary="14px" textColor-Text-secondary="rgb(100, 100, 100)">
        <Text variant="secondary" testId="text">Secondary text</Text>
      </Theme>
    `);

    const component = (await createTextDriver("text")).component;
    await expect(component).toHaveCSS("font-size", "14px");
    await expect(component).toHaveCSS("color", "rgb(100, 100, 100)");
  });

  test("variant='abbr' applies abbreviation theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontWeight-Text-abbr="700" textTransform-Text-abbr="uppercase">
        <Text variant="abbr" testId="text">HTML</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-weight", "700");
    await expect(component).toHaveCSS("text-transform", "uppercase");
  });

  test("variant='cite' applies citation theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontStyle-Text-cite="italic">
        <Text variant="cite" testId="text">Citation</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-style", "italic");
  });

  test("variant='code' applies inline code theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme
        fontFamily-Text-code="monospace"
        fontSize-Text-code="14px"
        borderWidth-Text-code="1px"
        borderStyle-Text-code="solid"
        borderRadius-Text-code="4px"
        paddingHorizontal-Text-code="4px"
        paddingBottom-Text-code="2px"
        backgroundColor-Text-code="rgb(240, 240, 240)"
        borderColor-Text-code="rgb(200, 200, 200)"
      >
        <Text variant="code" testId="text">code</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-family", "monospace");
    await expect(component).toHaveCSS("font-size", "14px");
    await expect(component).toHaveCSS("border-width", "1px");
    await expect(component).toHaveCSS("border-style", "solid");
    await expect(component).toHaveCSS("border-radius", "4px");
    await expect(component).toHaveCSS("padding-left", "4px");
    await expect(component).toHaveCSS("padding-right", "4px");
    await expect(component).toHaveCSS("padding-bottom", "2px");
    await expect(component).toHaveCSS("background-color", "rgb(240, 240, 240)");
    await expect(component).toHaveCSS("border-color", "rgb(200, 200, 200)");
  });

  test("variant='deleted' applies deleted text theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme textDecorationLine-Text-deleted="line-through">
        <Text variant="deleted" testId="text">Deleted text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("text-decoration-line", "line-through");
  });

  test("variant='inserted' applies inserted text theme variables", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Theme textDecorationLine-Text-inserted="underline">
        <Text variant="inserted" testId="text">Inserted text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("text-decoration-line", "underline");
  });

  test("variant='keyboard' applies keyboard theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme
        fontFamily-Text-keyboard="monospace"
        fontSize-Text-keyboard="14px"
        fontWeight-Text-keyboard="700"
        borderWidth-Text-keyboard="1px"
        paddingHorizontal-Text-keyboard="4px"
        backgroundColor-Text-keyboard="rgb(245, 245, 245)"
        borderColor-Text-keyboard="rgb(180, 180, 180)"
      >
        <Text variant="keyboard" testId="text">Ctrl+C</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-family", "monospace");
    await expect(component).toHaveCSS("font-size", "14px");
    await expect(component).toHaveCSS("font-weight", "700");
    await expect(component).toHaveCSS("border-width", "1px");
    await expect(component).toHaveCSS("padding-left", "4px");
    await expect(component).toHaveCSS("padding-right", "4px");
    await expect(component).toHaveCSS("background-color", "rgb(245, 245, 245)");
    await expect(component).toHaveCSS("border-color", "rgb(180, 180, 180)");
  });

  test("variant='sample' applies sample theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme
        fontFamily-Text-sample="monospace"
        fontSize-Text-sample="14px"
      >
        <Text variant="sample" testId="text">Sample output</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-family", "monospace");
    await expect(component).toHaveCSS("font-size", "14px");
  });

  test("variant='sup' applies superscript theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme
        fontSize-Text-sup="12px"
        verticalAlignment-Text-sup="super"
      >
        <Text variant="sup" testId="text">2</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "12px");
    await expect(component).toHaveCSS("vertical-align", "super");
  });

  test("variant='sub' applies subscript theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme
        fontSize-Text-sub="12px"
        verticalAlignment-Text-sub="sub"
      >
        <Text variant="sub" testId="text">2</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "12px");
    await expect(component).toHaveCSS("vertical-align", "sub");
  });

  test("variant='var' applies variable theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontStyle-Text-var="italic">
        <Text variant="var" testId="text">variable</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-style", "italic");
  });

  test("variant='em' applies emphasis theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontStyle-Text-em="italic">
        <Text variant="em" testId="text">Emphasized</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-style", "italic");
  });

  test("variant='mono' applies monospace theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontFamily-Text-mono="monospace">
        <Text variant="mono" testId="text">Monospace text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-family", "monospace");
  });

  test("variant='title' applies title theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontSize-Text-title="32px">
        <Text variant="title" testId="text">Main Title</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "32px");
  });

  test("variant='subtitle' applies subtitle theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontSize-Text-subtitle="24px">
        <Text variant="subtitle" testId="text">Subtitle</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "24px");
  });

  test("variant='small' applies small text theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontSize-Text-small="14px">
        <Text variant="small" testId="text">Small text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "14px");
  });

  test("variant='caption' applies caption theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme letterSpacing-Text-caption="0.8px">
        <Text variant="caption" testId="text">Caption text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("letter-spacing", "0.8px");
  });

  test("variant='placeholder' applies placeholder theme variables", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Theme
        fontSize-Text-placeholder="12px"
        textColor-Text-placeholder="rgb(150, 150, 150)"
      >
        <Text variant="placeholder" testId="text">Placeholder text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "12px");
    await expect(component).toHaveCSS("color", "rgb(150, 150, 150)");
  });

  test("variant='paragraph' applies paragraph theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme paddingVertical-Text-paragraph="4px">
        <Text variant="paragraph" testId="text">Paragraph text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("padding-top", "4px");
    await expect(component).toHaveCSS("padding-bottom", "4px");
  });

  test("variant='subheading' applies subheading theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme
        fontSize-Text-subheading="18px"
        fontWeight-Text-subheading="700"
        letterSpacing-Text-subheading="0.8px"
        textTransform-Text-subheading="uppercase"
        textColor-Text-subheading="rgb(80, 80, 80)"
      >
        <Text variant="subheading" testId="text">Subheading</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-size", "18px");
    await expect(component).toHaveCSS("font-weight", "700");
    await expect(component).toHaveCSS("letter-spacing", "0.8px");
    await expect(component).toHaveCSS("text-transform", "uppercase");
    await expect(component).toHaveCSS("color", "rgb(80, 80, 80)");
  });

  test("variant='tableheading' applies table heading theme variables", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Theme
        marginTop-Text-tableheading="4px"
        marginBottom-Text-tableheading="16px"
        paddingHorizontal-Text-tableheading="4px"
        fontSize-Text-tableheading="18px"
        fontWeight-Text-tableheading="700"
      >
        <Text variant="tableheading" testId="text">Table Header</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("margin-top", "4px");
    await expect(component).toHaveCSS("margin-bottom", "16px");
    await expect(component).toHaveCSS("padding-left", "4px");
    await expect(component).toHaveCSS("padding-right", "4px");
    await expect(component).toHaveCSS("font-size", "18px");
    await expect(component).toHaveCSS("font-weight", "700");
  });

  test("variant='strong' applies strong theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme fontWeight-Text-strong="700">
        <Text variant="strong" testId="text">Strong text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("font-weight", "700");
  });

  test("variant='marked' applies marked theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme backgroundColor-Text-marked="rgb(255, 255, 0)">
        <Text variant="marked" testId="text">Highlighted text</Text>
      </Theme>
    `);

    const component = page.getByTestId("text");
    await expect(component).toHaveCSS("background-color", "rgb(255, 255, 0)");
  });
});

// =============================================================================
// CUSTOM VARIANT TESTS
// =============================================================================

test.describe("Custom Variants", () => {
  test("custom variant textColor theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "rgb(255, 0, 0)";
    await initTestBed(`
      <App>
        <Theme textColor-Text-customRed="${EXPECTED}">
          <Text variant="customRed" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("color", EXPECTED);
  });

  test("custom variant fontFamily theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "monospace";
    await initTestBed(`
      <App>
        <Theme fontFamily-Text-customMono="${EXPECTED}">
          <Text variant="customMono" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("font-family", EXPECTED);
  });

  test("custom variant fontSize theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "24px";
    await initTestBed(`
      <App>
        <Theme fontSize-Text-customLarge="${EXPECTED}">
          <Text variant="customLarge" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("font-size", EXPECTED);
  });

  test("custom variant fontStyle theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "italic";
    await initTestBed(`
      <App>
        <Theme fontStyle-Text-customItalic="${EXPECTED}">
          <Text variant="customItalic" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("font-style", EXPECTED);
  });

  test("custom variant fontWeight theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "700";
    await initTestBed(`
      <App>
        <Theme fontWeight-Text-customBold="bold">
          <Text variant="customBold" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("font-weight", EXPECTED);
  });

  test("custom variant fontStretch theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "125%";
    await initTestBed(`
      <App>
        <Theme fontStretch-Text-customExpanded="expanded">
          <Text variant="customExpanded" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("font-stretch", EXPECTED);
  });

  test("custom variant textDecorationLine theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "underline";
    await initTestBed(`
      <App>
        <Theme textDecorationLine-Text-customUnderline="${EXPECTED}">
          <Text variant="customUnderline" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-decoration-line", EXPECTED);
  });

  test("custom variant textDecorationColor theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "rgb(255, 0, 0)";
    await initTestBed(`
      <App>
        <Theme
          textDecorationLine-Text-customDeco="underline"
          textDecorationColor-Text-customDeco="${EXPECTED}"
        >
          <Text variant="customDeco" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-decoration-color", EXPECTED);
  });

  test("custom variant textDecorationStyle theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "wavy";
    await initTestBed(`
      <App>
        <Theme
          textDecorationLine-Text-customWavy="underline"
          textDecorationStyle-Text-customWavy="${EXPECTED}"
        >
          <Text variant="customWavy" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-decoration-style", EXPECTED);
  });

  test("custom variant textDecorationThickness theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "3px";
    await initTestBed(`
      <App>
        <Theme
          textDecorationLine-Text-customThick="underline"
          textDecorationThickness-Text-customThick="${EXPECTED}"
        >
          <Text variant="customThick" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-decoration-thickness", EXPECTED);
  });

  test("custom variant textUnderlineOffset theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "5px";
    await initTestBed(`
      <App>
        <Theme
          textDecorationLine-Text-customOffset="underline"
          textUnderlineOffset-Text-customOffset="${EXPECTED}"
        >
          <Text variant="customOffset" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-underline-offset", EXPECTED);
  });

  test("custom variant lineHeight theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "32px";
    await initTestBed(`
      <App>
        <Theme lineHeight-Text-customLineHeight="${EXPECTED}">
          <Text variant="customLineHeight" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("line-height", EXPECTED);
  });

  test("custom variant backgroundColor theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "rgb(255, 255, 0)";
    await initTestBed(`
      <App>
        <Theme backgroundColor-Text-customBg="${EXPECTED}">
          <Text variant="customBg" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("background-color", EXPECTED);
  });

  test("custom variant textTransform theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "uppercase";
    await initTestBed(`
      <App>
        <Theme textTransform-Text-customUpper="${EXPECTED}">
          <Text variant="customUpper" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-transform", EXPECTED);
  });

  test("custom variant letterSpacing theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "5px";
    await initTestBed(`
      <App>
        <Theme letterSpacing-Text-customSpaced="${EXPECTED}">
          <Text variant="customSpaced" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("letter-spacing", EXPECTED);
  });

  test("custom variant wordSpacing theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "10px";
    await initTestBed(`
      <App>
        <Theme wordSpacing-Text-customWordSpace="${EXPECTED}">
          <Text variant="customWordSpace" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("word-spacing", EXPECTED);
  });

  test("custom variant textShadow theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "rgb(255, 0, 0) 2px 2px 4px";
    await initTestBed(`
      <App>
        <Theme textShadow-Text-customShadow="${EXPECTED}">
          <Text variant="customShadow" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-shadow", EXPECTED);
  });

  test("custom variant textIndent theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "20px";
    await initTestBed(`
      <App>
        <Theme textIndent-Text-customIndent="${EXPECTED}">
          <Text variant="customIndent" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-indent", EXPECTED);
  });

  test("custom variant textAlign theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "center";
    await initTestBed(`
      <App>
        <Theme textAlign-Text-customCenter="${EXPECTED}">
          <Text variant="customCenter" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-align", EXPECTED);
  });

  test("custom variant textAlignLast theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "right";
    await initTestBed(`
      <App>
        <Theme textAlignLast-Text-customAlignLast="${EXPECTED}">
          <Text variant="customAlignLast" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("text-align-last", EXPECTED);
  });

  test("custom variant wordBreak theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "break-all";
    await initTestBed(`
      <App>
        <Theme wordBreak-Text-customBreak="${EXPECTED}">
          <Text variant="customBreak" breakMode="'{undefined}'" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("word-break", EXPECTED);
  });

  test("custom variant wordWrap theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "break-word";
    await initTestBed(`
      <App>
        <Theme wordWrap-Text-customWrap="${EXPECTED}">
          <Text variant="customWrap" breakMode="'{undefined}'" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("word-wrap", EXPECTED);
  });

  test("custom variant direction theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "rtl";
    await initTestBed(`
      <App>
        <Theme direction-Text-customRtl="${EXPECTED}">
          <Text variant="customRtl" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("direction", EXPECTED);
  });

  test("custom variant writingMode theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "vertical-rl";
    await initTestBed(`
      <App>
        <Theme writingMode-Text-customVertical="${EXPECTED}">
          <Text variant="customVertical" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("writing-mode", EXPECTED);
  });

  test("custom variant lineBreak theme variable", async ({ initTestBed, page }) => {
    const EXPECTED = "strict";
    await initTestBed(`
      <App>
        <Theme lineBreak-Text-customLineBreak="${EXPECTED}">
          <Text variant="customLineBreak" testId="text">Hello Custom!</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("text")).toHaveCSS("line-break", EXPECTED);
  });

  test("custom variant with multiple theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Theme
          textColor-Text-pinkElephant="rgb(255, 192, 203)"
          fontWeight-Text-pinkElephant="bold"
          textColor-Text-greenDog="rgb(0, 128, 0)"
          fontStyle-Text-greenDog="italic"
        >
          <Text variant="pinkElephant" testId="pink">
            Hello Pink Elephant!
          </Text>
          <Text variant="greenDog" testId="green">
            Hello Green Dog!
          </Text>
        </Theme>
      </App>
    `);

    const pinkText = page.getByTestId("pink");
    const greenText = page.getByTestId("green");

    await expect(pinkText).toHaveCSS("color", "rgb(255, 192, 203)");
    await expect(pinkText).toHaveCSS("font-weight", "700");
    await expect(greenText).toHaveCSS("color", "rgb(0, 128, 0)");
    await expect(greenText).toHaveCSS("font-style", "italic");
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
