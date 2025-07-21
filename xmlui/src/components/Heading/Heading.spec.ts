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
      await initTestBed(`<h1 />`);
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
      await createHeadingDriver("headingShort")
    );
    const { height: heightHeadingLong } = await getBounds(
      await createHeadingDriver("headingLong")
    );

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
  const { top: topIcon0 } = await getBounds(await createIconDriver("icon0"));
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

test("Heading accepts custom props", async ({
  initTestBed,
  createHeadingDriver,
}) => {
  await initTestBed(`<Heading custom="test" boolean>Test Heading</Heading>`);
  const headingDriver = await createHeadingDriver();

  await expect(headingDriver.component).toHaveAttribute("custom", "test");
  await expect(headingDriver.component).toHaveAttribute("boolean", "true");
});

headingLevels.forEach((level) => {
  test(`HtmlTag '${level}' accepts custom props`, async ({
    initTestBed,
    createHeadingDriver,
  }) => {
    await initTestBed(`<${level.toLowerCase()} custom="test" boolean>Test Heading</${level.toLowerCase()}>`);
    const headingDriver = await createHeadingDriver();

    await expect(headingDriver.component).toHaveAttribute("custom", "test");
    await expect(headingDriver.component).toHaveAttribute("boolean", "true");
  });
});
