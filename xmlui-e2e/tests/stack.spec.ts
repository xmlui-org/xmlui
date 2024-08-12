import { test, expect } from "./fixtures";
import { initApp, isElementOverflown, getBoundingRect, getFullRectangle } from "./component-test-helpers";

const PAGE_WIDTH = 1280;
const PAGE_HEIGHT = 720;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

test("can render empty", async ({ page }) => {
  const code = `<Stack testId="stack"></Stack>`;
  await initApp(page, { entryPoint: code });
  await expect(page.getByTestId("stack")).toBeAttached();
  await expect(page.getByTestId("stack")).toBeEmpty();
});

// "(horizontal) children with unspecified dimensions" -> width is content size, height is content size
test("(horizontal) children with unspecified dimensions", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan">Text #1</Text>
    <Text testId="item_1" backgroundColor="yellow">Text #2</Text>
    <Text testId="item_2" backgroundColor="lightgreen">Text #3</Text>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { width: stackWidth, height: stackHeight } = await getBoundingRect(page.getByTestId("stack"));

  const { width: itemWidth0, height: itemHeight0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { width: itemWidth1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { width: itemWidth2, right: itemRight2 } = await getBoundingRect(page.getByTestId("item_2"));
  const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;

  // ensure the elements are not overflowing and that the stack is not as wide as the width-sum of the elements
  // this can be stated, since we set the viewport size at the start,
  // which is bigger than the width-sum of the elements
  expect(itemWidthSum).toBeLessThan(stackWidth);

  //no gaps between elements
  // with tolerance, since we are comparing floating point number. The pixel values could be non-whole numbers
  // in which case adding up fractions could have a very small difference that would make the test fail
  expect(itemWidthSum).toEqualWithTolerance(itemRight2);

  // enusre that the stack is as tall as the tallest element (they all have the same height in this case)
  expect(stackHeight).toEqual(itemHeight0);
});

// "(vertical) children with unspecified dimensions" -> width fills available space, height is content size
test("(vertical) children with unspecified dimensions, orientation is implicit", async ({ page }) => {
  const code = `
  <Stack testId="stack" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan">Text #1</Text>
    <Text testId="item_1" backgroundColor="yellow">Text #2</Text>
    <Text testId="item_2" backgroundColor="lightgreen">Text #3</Text>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { height: stackHeight, width: stackWidth } = await getBoundingRect(page.getByTestId("stack"));
  const itemDims0 = await getBoundingRect(page.getByTestId("item_0"));
  const itemDims1 = await getBoundingRect(page.getByTestId("item_1"));
  const itemDims2 = await getBoundingRect(page.getByTestId("item_2"));

  const itemHeightSum = itemDims0.height + itemDims1.height + itemDims2.height;

  expect(itemHeightSum).toEqualWithTolerance(stackHeight);

  expect(itemDims0.width).toEqual(stackWidth);
  expect(itemDims1.width).toEqual(stackWidth);
  expect(itemDims2.width).toEqual(stackWidth);
});

// "(horizontal) block children with unspecified dimensions" -> width is content size, height is content size, block children are treated as inline elements
test("(horizontal) block children with unspecified dimensions", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan">Heading 3</Text>
    <Text testId="item_1" backgroundColor="yellow">Heading 2</Text>
    <Text testId="item_2" backgroundColor="lightgreen">Heading 4</Text>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { width: stackWidth, height: stackHeight } = await getFullRectangle(page.getByTestId("stack"));
  const { width: itemWidth0 } = await getFullRectangle(page.getByTestId("item_0"));
  await getFullRectangle(page.getByTestId("item_0"));
  const { width: itemWidth1, height: tallestItemHeight } = await getFullRectangle(page.getByTestId("item_1"));
  const { width: itemWidth2, right: itemRight2 } = await getFullRectangle(page.getByTestId("item_2"));

  const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;

  expect(itemWidthSum).toBeLessThan(stackWidth);
  expect(itemWidthSum).toEqualWithTolerance(itemRight2);
  expect(stackHeight).toEqual(tallestItemHeight);
});

// "(horizontal) children with fixed dimensions" -> Stack does not alter dimensions
test("(horizontal) children with fixed dimensions", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal">
    <Text testId="item_0" backgroundColor="cyan" width="72" height="36">72 x 36</Text>
    <Text testId="item_1" backgroundColor="yellow" width="144" height="72">144 x 72</Text>
    <Text testId="item_2" backgroundColor="lightgreen" width="64" height="48">64 x 48</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { height: stackHeight } = await getBoundingRect(page.getByTestId("stack"));
  const itemDims0 = await getBoundingRect(page.getByTestId("item_0"));
  const itemDims1 = await getBoundingRect(page.getByTestId("item_1"));
  const itemDims2 = await getBoundingRect(page.getByTestId("item_2"));

  const tallestItemHeight = 72;
  const itemWidthSum = 72 + 144 + 64;

  //no gaps between items
  expect(itemWidthSum).toEqualWithTolerance(itemDims2.right);

  expect(stackHeight).toEqual(tallestItemHeight);
  expect(itemDims0).toMatchObject({ width: 72, height: 36 });
  expect(itemDims1).toMatchObject({ width: 144, height: 72 });
  expect(itemDims2).toMatchObject({ width: 64, height: 48 });
});

// "(vertical) children with fixed dimensions" -> Stack does not alter dimensions
test("(vertical) children with fixed dimensions", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical">
    <Text testId="item_0" backgroundColor="cyan" width="72" height="36">72 x 36</Text>
    <Text testId="item_1" backgroundColor="yellow" width="144" height="72">144 x 72</Text>
    <Text testId="item_2" backgroundColor="lightgreen" width="64" height="48">64 x 48</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { width: stackWidth, height: stackHeight } = await getBoundingRect(page.getByTestId("stack"));
  const itemDims0 = await getBoundingRect(page.getByTestId("item_0"));
  const itemDims1 = await getBoundingRect(page.getByTestId("item_1"));
  const itemDims2 = await getBoundingRect(page.getByTestId("item_2"));

  const widestItemWidth = 144;
  const itemHeightSum = 36 + 72 + 48;

  expect(widestItemWidth).toBeLessThan(stackWidth);
  expect(itemHeightSum).toEqualWithTolerance(itemDims2.bottom);
  expect(itemHeightSum).toEqualWithTolerance(stackHeight);
  expect(itemDims0).toMatchObject({ width: 72, height: 36 });
  expect(itemDims1).toMatchObject({ width: 144, height: 72 });
  expect(itemDims2).toMatchObject({ width: 64, height: 48 });
});

// (horizontal) children with fixed width and unspecified height -> item height is the same as stack height
test("(horizontal) children with fixed width and unspecified height", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal">
    <Text testId="item_0" backgroundColor="cyan" width="72">W: 72</Text>
    <Text testId="item_1" backgroundColor="yellow" width="144">W: 144</Text>
    <Text testId="item_2" backgroundColor="lightgreen" width="48">W: 48 + long, long, long text</Text>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { height: stackHeight, width: stackWidth } = await getFullRectangle(page.getByTestId("stack"));
  const itemDims0 = await getFullRectangle(page.getByTestId("item_0"));
  const itemDims1 = await getFullRectangle(page.getByTestId("item_1"));
  const itemDims2 = await getFullRectangle(page.getByTestId("item_2"));

  const itemWidthSum = itemDims0.width + itemDims1.width + itemDims2.width;

  expect(itemWidthSum).toEqualWithTolerance(itemDims2.right);
  expect(itemWidthSum).toBeLessThan(stackWidth);

  expect(itemDims0.height).toEqual(stackHeight);
  expect(itemDims1.height).toEqual(stackHeight);
  expect(itemDims2.height).toEqual(stackHeight);

  expect(itemDims0.width).toEqual(72);
  expect(itemDims1.width).toEqual(144);
  expect(itemDims2.width).toEqual(48);
});

// (vertical) children with fixed height and unspecified width -> width fills available space
test("(vertical) children with fixed height and unspecified width ", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical">
    <Text testId="item_0" backgroundColor="cyan" height="36">H: 36</Text>
    <Text testId="item_1" backgroundColor="yellow" height="72">H: 72</Text>
    <Text testId="item_2" backgroundColor="lightgreen" height="48">H: 48 + long, long, long text</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { height: stackHeight, width: stackWidth } = await getFullRectangle(page.getByTestId("stack"));
  const itemDims0 = await getFullRectangle(page.getByTestId("item_0"));
  const itemDims1 = await getFullRectangle(page.getByTestId("item_1"));
  const itemDims2 = await getFullRectangle(page.getByTestId("item_2"));

  const itemHeightSum = 36 + 72 + 48;

  expect(itemHeightSum).toEqualWithTolerance(itemDims2.bottom);
  expect(itemHeightSum).toEqualWithTolerance(stackHeight);

  expect(itemDims0.width).toEqual(stackWidth);
  expect(itemDims1.width).toEqual(stackWidth);
  expect(itemDims2.width).toEqual(stackWidth);

  expect(itemDims0.height).toEqual(36);
  expect(itemDims1.height).toEqual(72);
  expect(itemDims2.height).toEqual(48);
});

// (horizontal) children with fixed height and unspecified width -> item widths are conent size, item heights are not altered
test("(horizontal) children with fixed height and unspecified width", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal">
    <Text testId="item_0" backgroundColor="cyan" height="36">H: 36</Text>
    <Text testId="item_1" backgroundColor="yellow" height="72">H: 72</Text>
    <Text testId="item_2" backgroundColor="lightgreen" height="48">H: 48</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { height: stackHeight, width: stackWidth } = await getFullRectangle(page.getByTestId("stack"));
  const itemDims0 = await getFullRectangle(page.getByTestId("item_0"));
  const itemDims1 = await getFullRectangle(page.getByTestId("item_1"));
  const itemDims2 = await getFullRectangle(page.getByTestId("item_2"));

  const itemWidthSum = itemDims0.width + itemDims1.width + itemDims2.width;
  const tallestItemHeight = 72;

  expect(itemWidthSum).toBeLessThan(stackWidth);
  expect(stackHeight).toEqual(tallestItemHeight);

  expect(itemDims0.height).toEqual(36);
  expect(itemDims1.height).toEqual(72);
  expect(itemDims2.height).toEqual(48);
});

// (vertical) children with fixed width and unspecified height -> item heights are content size, widths are not altered
test("(vertical) children with fixed width and unspecified height", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical">
    <Text testId="item_0" backgroundColor="cyan" width="72">W: 72</Text>
    <Text testId="item_1" backgroundColor="yellow" width="144">W: 144</Text>
    <Text testId="item_2" backgroundColor="lightgreen" width="48">W: 48 + long, long, long text</Text>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { height: stackHeight } = await getFullRectangle(page.getByTestId("stack"));
  const itemDims0 = await getFullRectangle(page.getByTestId("item_0"));
  const itemDims1 = await getFullRectangle(page.getByTestId("item_1"));
  const itemDims2 = await getFullRectangle(page.getByTestId("item_2"));

  const itemHeightSum = itemDims0.height + itemDims1.height + itemDims2.height;

  expect(itemHeightSum).toEqualWithTolerance(itemDims2.bottom);
  expect(itemHeightSum).toEqualWithTolerance(stackHeight);

  expect(itemDims0.width).toEqual(72);
  expect(itemDims1.width).toEqual(144);
  expect(itemDims2.width).toEqual(48);
});

test("(horizontal) percentage sizing", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" width="20%">W: 20%</Text>
    <H2 testId="item_1" backgroundColor="yellow" width="50%">W: 50%</H2>
    <H5 testId="item_2" backgroundColor="lightgreen" width="20%">W: 20% + long, long, long text</H5>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { width: stackWidth } = await getBoundingRect(page.getByTestId("stack"));
  const { width: itemWidth0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { width: itemWidth1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { width: itemWidth2, right: lastItemRight } = await getBoundingRect(page.getByTestId("item_2"));
  const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;

  expect(stackWidth).toEqual(PAGE_WIDTH);
  expect(itemWidthSum).toEqualWithTolerance(lastItemRight);
  expect(itemWidth0).toEqualWithTolerance(0.2 * stackWidth);
  expect(itemWidth1).toEqualWithTolerance(0.5 * stackWidth);
  expect(itemWidth2).toEqualWithTolerance(0.2 * stackWidth);
});

test("(vertical) percentage sizing", async ({ page }) => {
  const code = `
  <Stack testId="stack" height="180" orientation="vertical" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" height="20%">W: 20%</Text>
    <Text testId="item_1" backgroundColor="yellow" height="50%">W: 50%</Text>
    <Text testId="item_2" backgroundColor="lightgreen" height="20%">W: 20% + long, long, long text</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { height: stackHeight, width: stackWidth } = await getFullRectangle(page.getByTestId("stack"));
  const { height: itemHeight0, width: itemWidth0 } = await getFullRectangle(page.getByTestId("item_0"));
  const { height: itemHeight1 } = await getFullRectangle(page.getByTestId("item_1"));
  const { height: itemHeight2, bottom: lastItemBottom } = await getFullRectangle(page.getByTestId("item_2"));
  const itemHeightSum = itemHeight0 + itemHeight1 + itemHeight2;

  expect(itemWidth0).toEqual(stackWidth);
  expect(itemHeightSum).toEqualWithTolerance(lastItemBottom);
  expect(itemHeight0).toEqualWithTolerance(0.2 * stackHeight);
  expect(itemHeight1).toEqualWithTolerance(0.5 * stackHeight);
  expect(itemHeight2).toEqualWithTolerance(0.2 * stackHeight);
});

test("(horizontal) percentage sizing fully filled", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" width="20%">W: 20%</Text>
    <H2 testId="item_1" backgroundColor="yellow" width="50%">W: 50%</H2>
    <H5 testId="item_2" backgroundColor="lightgreen" width="30%">W: 30% + long, long, long text</H5>
  </Stack>
  `;
  await initApp(page, { entryPoint: code });

  const { width: stackWidth } = await getBoundingRect(page.getByTestId("stack"));
  const { right: lastItemRight } = await getBoundingRect(page.getByTestId("item_2"));

  expect(stackWidth).toEqualWithTolerance(lastItemRight);
});

test("(vertical) percentage sizing fully filled", async ({ page }) => {
  const code = `
  <Stack testId="stack" height="180" orientation="vertical" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" height="20%">W: 20%</Text>
    <Text testId="item_1" backgroundColor="yellow" height="50%">W: 50%</Text>
    <Text testId="item_2" backgroundColor="lightgreen" height="30%">W: 30% + long, long, long text</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { height: stackHeight } = await getFullRectangle(page.getByTestId("stack"));
  const { bottom: lastItemBottom } = await getFullRectangle(page.getByTestId("item_2"));

  expect(stackHeight).toEqualWithTolerance(lastItemBottom);
});
// (horizontal) percentage overflow X
test("(horizontal) percentage overflow X", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" width="30%">W: 30%</Text>
    <H2 testId="item_1" backgroundColor="yellow" width="50%">W: 50%</H2>
    <H5 testId="item_2" backgroundColor="lightgreen" width="40%">W: 40% + long, long, long text</H5>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const isOverflown = await isElementOverflown(page.getByTestId("stack"), "x");
  expect(isOverflown).toEqual(true);
});

// (vertical) percentage overflow Y
test("(vertical) percentage overflow X", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical" height="180" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" height="30%">H: 30%</Text>
    <H2 testId="item_1" backgroundColor="yellow" height="60%">H: 60%</H2>
    <H5 testId="item_2" backgroundColor="lightgreen" height="20%">H: 20% + long, long, long text</H5>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const isOverflown = await isElementOverflown(page.getByTestId("stack"), "y");
  expect(isOverflown).toEqual(true);
});

// No reason to implement: we gain little just to test px and %
// (horizontal) mixed percentage and specific unit sizes
// (vertical) mixed percentage and specific unit sizes

test("(horizontal) star sizing", async ({ page }) => {
  const code = `
  <Stack testId="stack" width="100%" orientation="horizontal" backgroundColor="lightgray">
    <Text testId="item_0" backgroundColor="cyan" width="100">W: 100</Text>
    <Text testId="item_1" backgroundColor="yellow" width="3*">W: 3*</Text>
    <Text testId="item_2" backgroundColor="lightgreen" width="*">W: *</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { width: stackWidth } = await getBoundingRect(page.getByTestId("stack"));
  const { width: itemWidth0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { width: itemWidth1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { width: itemWidth2, right: lastItemRight } = await getBoundingRect(page.getByTestId("item_2"));
  const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;

  const expectedItemWidth0 = 100;
  const expectedItemWidth1 = (stackWidth - 100) * (3 / 4);
  const expectedItemWidth2 = (stackWidth - 100) * (1 / 4);

  expect(itemWidthSum).toEqualWithTolerance(lastItemRight);
  expect(itemWidth0).toEqual(expectedItemWidth0);
  expect(itemWidth1).toEqualWithTolerance(expectedItemWidth1);
  expect(itemWidth2).toEqualWithTolerance(expectedItemWidth2);
});

// (horizontal) star sizing comparison -> Larger Stack have larger star sized children, px sizes are same
test("(horizontal) star sizing comparison", async ({ page }) => {
  const code = `
  <Fragment>
    <Stack testId="stack_0" orientation="horizontal" width="600px">
      <Text testId="ref_item_0" backgroundColor="cyan" width="100">W: 100</Text>
      <Text testId="ref_item_1" backgroundColor="yellow" width="3*">W: 3*</Text>
      <Text testId="ref_item_2" backgroundColor="lightgreen" width="*">W: *</Text>
    </Stack>
    <Stack testId="stack_1" orientation="horizontal" width="300px">
      <Text testId="item_0" backgroundColor="cyan" width="100">W: 100</Text>
      <Text testId="item_1" backgroundColor="yellow" width="3*">W: 3*</Text>
      <Text testId="item_2" backgroundColor="lightgreen" width="*">W: *</Text>
    </Stack>
  </Fragment>
  `;
  await initApp(page, { entryPoint: code });

  const { width: refItemWidth0 } = await getBoundingRect(page.getByTestId("ref_item_0"));
  const { width: refItemWidth1 } = await getBoundingRect(page.getByTestId("ref_item_1"));
  const { width: refItemWidth2 } = await getBoundingRect(page.getByTestId("ref_item_2"));
  const { width: itemWidth0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { width: itemWidth1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { width: itemWidth2 } = await getBoundingRect(page.getByTestId("item_2"));

  expect(refItemWidth0).toEqual(itemWidth0);
  expect(refItemWidth1).toBeGreaterThan(itemWidth1);
  expect(refItemWidth2).toBeGreaterThan(itemWidth2);
});

// (vertical) star sizing comparison -> Larger Stack have larger star sized children, px sizes are same
test("(vertical) star sizing comparison", async ({ page }) => {
  const code = `
  <Fragment>
    <Stack testId="stack_0" orientation="vertical" height="600px">
      <Text testId="ref_item_0" backgroundColor="cyan" height="100">W: 100</Text>
      <Text testId="ref_item_1" backgroundColor="yellow" height="3*">W: 3*</Text>
      <Text testId="ref_item_2" backgroundColor="lightgreen" height="*">W: *</Text>
    </Stack>
    <Stack testId="stack_1" orientation="vertical" height="300px">
      <Text testId="item_0" backgroundColor="cyan" height="100">W: 100</Text>
      <Text testId="item_1" backgroundColor="yellow" height="3*">W: 3*</Text>
      <Text testId="item_2" backgroundColor="lightgreen" height="*">W: *</Text>
    </Stack>
  </Fragment>
  `;
  await initApp(page, { entryPoint: code });

  const { height: refItemHeight0 } = await getBoundingRect(page.getByTestId("ref_item_0"));
  const { height: refItemHeight1 } = await getBoundingRect(page.getByTestId("ref_item_1"));
  const { height: refItemHeight2 } = await getBoundingRect(page.getByTestId("ref_item_2"));
  const { height: itemHeight0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { height: itemHeight1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { height: itemHeight2 } = await getBoundingRect(page.getByTestId("item_2"));

  expect(refItemHeight0).toEqual(itemHeight0);
  expect(refItemHeight1).toBeGreaterThan(itemHeight1);
  expect(refItemHeight2).toBeGreaterThan(itemHeight2);
});

// (horizontal) gaps + percentage -> children use available space
test("(horizontal) paddings + percentage", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray"
    horizontalPadding="50" verticalPadding="50">
    <Text testId="item_0" backgroundColor="cyan" width="25%">W: 25%</Text>
    <Text testId="item_1" backgroundColor="yellow" width="50%">W: 50%</Text>
    <Text testId="item_2" backgroundColor="lightgreen" width="25%">W: 25%</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });
  const { width: stackWidth } = await getBoundingRect(page.getByTestId("stack"));
  const { width: itemWidth0, left: firstItemLeft } = await getBoundingRect(page.getByTestId("item_0"));
  const { width: itemWidth1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { width: itemWidth2, right: lastItemRight } = await getBoundingRect(page.getByTestId("item_2"));

  const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;
  expect(firstItemLeft).toEqual(50);
  expect(lastItemRight).toEqual(stackWidth - 50);
  expect(itemWidthSum).toEqualWithTolerance(stackWidth - 2 * 50);
});

// (vertical) gaps + percentage -> children use available space
test("(vertical) paddings + percentage", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical" backgroundColor="lightgray"
    height="240" horizontalPadding="50" verticalPadding="50">
    <Text testId="item_0" backgroundColor="cyan" height="25%">H: 25%</Text>
    <Text testId="item_1" backgroundColor="yellow" height="50%">H: 50%</Text>
    <Text testId="item_2" backgroundColor="lightgreen" height="25%">H: 25%</Text>
  </Stack>
  `;

  await initApp(page, { entryPoint: code });
  const { height: stackHeight } = await getBoundingRect(page.getByTestId("stack"));
  const { top: firstItemTop } = await getBoundingRect(page.getByTestId("item_0"));
  const { bottom: lastItemBottom } = await getBoundingRect(page.getByTestId("item_2"));

  expect(firstItemTop).toEqual(50);
  expect(lastItemBottom).toEqual(stackHeight - 50);
});

test("(horizontal) gaps", async ({ page }) => {
  const code = `
  <Stack orientation="horizontal" backgroundColor="lightgray" gap="50">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
`;

  await initApp(page, { entryPoint: code });

  const itemDims0 = await getBoundingRect(page.getByTestId("item_0"));
  const itemDims1 = await getBoundingRect(page.getByTestId("item_1"));
  const itemDims2 = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemDims0.left).toEqual(0);
  expect(itemDims1.left).toEqual(itemDims0.right + 50);
  expect(itemDims2.left).toEqual(2 * (itemDims0.right + 50));
});

test("(vertical) gaps", async ({ page }) => {
  const code = `
  <Stack orientation="vertical" backgroundColor="lightgray" gap="50">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
`;

  await initApp(page, { entryPoint: code });

  const itemDims0 = await getBoundingRect(page.getByTestId("item_0"));
  const itemDims1 = await getBoundingRect(page.getByTestId("item_1"));
  const itemDims2 = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemDims0.top).toEqual(0);
  expect(itemDims1.top).toEqual(itemDims0.bottom + 50);
  expect(itemDims2.top).toEqual(2 * (itemDims0.bottom + 50));
});

// (horizontal) gaps + percentage -> gaps push the content out of the container
test("(horizontal) gaps + percentage", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" padding="1rem" gap="2rem">
    <Stack backgroundColor="red" height="36" width="25%" />
    <Stack backgroundColor="green" height="36" width="50%" />
    <Stack backgroundColor="blue" height="36" width="25%" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const isOverflown = await isElementOverflown(page.getByTestId("stack"), "x");
  expect(isOverflown).toEqual(true);
});

// (horizontal) gaps + star sizing -> gaps don't push the content out of the container
test("(horizontal) gaps + star sizing", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" padding="1rem" gap="2rem">
    <Stack backgroundColor="red" height="36" width="*" />
    <Stack backgroundColor="green" height="36" width="*" />
    <Stack backgroundColor="blue" height="36" width="*" />
    <Stack backgroundColor="purple" height="36" width="*" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const isOverflown = await isElementOverflown(page.getByTestId("stack"), "x");
  expect(isOverflown).toEqual(false);
});

test("(horizontal) rtl rendering direction", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" gap="1rem" direction="rtl">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { right: stackRight } = await getBoundingRect(page.getByTestId("stack"));
  const { right: itemRight0, left: itemLeft0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { left: itemLeft1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { left: itemLeft2 } = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemLeft2).toBeLessThan(itemLeft1);
  expect(itemLeft1).toBeLessThan(itemLeft0);
  expect(itemRight0).toEqual(stackRight);
});

test("(horizontal) reverse rendering direction", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" gap="1rem" reverse="true">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { right: stackRight } = await getBoundingRect(page.getByTestId("stack"));
  const { right: itemRight0, left: itemLeft0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { left: itemLeft1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { left: itemLeft2 } = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemLeft2).toBeLessThan(itemLeft1);
  expect(itemLeft1).toBeLessThan(itemLeft0);
  expect(itemRight0).toEqual(stackRight);
});

test("(vertical) reverse rendering direction", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical" gap="1rem" reverse="true">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { bottom: stackBottom } = await getBoundingRect(page.getByTestId("stack"));
  const { bottom: itemBottom0, top: itemTop0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { top: itemTop1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { top: itemTop2 } = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemTop2).toBeLessThan(itemTop1);
  expect(itemTop1).toBeLessThan(itemTop0);
  expect(itemBottom0).toEqual(stackBottom);
});

test("(horizontal) content wrapping", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" gap="1rem" wrapContent="true">
    <Stack testId="item_0" backgroundColor="red" height="36" width="25%" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="40%" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="20%" />
    <Stack testId="item_3" backgroundColor="purple" height="36" width="30%" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { right: stackRight, bottom: stackBottom } = await getBoundingRect(page.getByTestId("stack"));

  const { left: itemLeft0, bottom: itemBottom0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { left: itemLeft1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { left: itemLeft2, right: itemRight2 } = await getBoundingRect(page.getByTestId("item_2"));
  const { left: itemLeft3, bottom: itemBottom3, top: itemTop3 } = await getBoundingRect(page.getByTestId("item_3"));

  expect(itemLeft0).toBeLessThan(itemLeft1);
  expect(itemLeft1).toBeLessThan(itemLeft2);
  expect(itemRight2).toBeLessThan(stackRight);

  expect(itemBottom0).toBeLessThan(itemTop3);
  expect(itemLeft3).toEqual(itemLeft0);
  expect(itemBottom3).toEqual(stackBottom);
});

test("(horizontal) horizontalAlignment center", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" horizontalAlignment="center">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { right: stackRight } = await getBoundingRect(page.getByTestId("stack"));

  const { left: itemLeft0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { right: itemRight2 } = await getBoundingRect(page.getByTestId("item_2"));
  const itemWidthSum = 3 * 36;

  expect(itemLeft0).toEqual(stackRight / 2 - itemWidthSum / 2);
  expect(itemRight2).toEqual(stackRight / 2 + itemWidthSum / 2);
});

test("(vertical) horizontal alignment end", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="vertical" horizontalAlignment="end">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="36" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="36" width="36" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const { right: stackRight } = await getBoundingRect(page.getByTestId("stack"));

  const { right: itemRight0 } = await getBoundingRect(page.getByTestId("item_0"));
  const { right: itemRight1 } = await getBoundingRect(page.getByTestId("item_1"));
  const { right: itemRight2 } = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemRight0).toEqual(stackRight);
  expect(itemRight1).toEqual(stackRight);
  expect(itemRight2).toEqual(stackRight);
});

test("(horizontal) verticalAlignment center", async ({ page }) => {
  const code = `
  <Stack testId="stack" orientation="horizontal" gap="1rem" verticalAlignment="center">
    <Stack testId="item_0" backgroundColor="red" height="36" width="36" />
    <Stack testId="item_1" backgroundColor="green" height="72" width="36" />
    <Stack testId="item_2" backgroundColor="blue" height="48" width="36" />
  </Stack>
  `;

  await initApp(page, { entryPoint: code });

  const stackDims = await getBoundingRect(page.getByTestId("stack"));

  const itemDims0 = await getBoundingRect(page.getByTestId("item_0"));
  const itemDims1 = await getBoundingRect(page.getByTestId("item_1"));
  const itemDims2 = await getBoundingRect(page.getByTestId("item_2"));

  expect(itemDims0.top).toEqual(stackDims.height / 2 - itemDims0.height / 2);
  expect(itemDims0.bottom).toEqual(stackDims.height / 2 + itemDims0.height / 2);

  expect(itemDims1.top).toEqual(stackDims.top);
  expect(itemDims1.bottom).toEqual(stackDims.bottom);

  expect(itemDims2.top).toEqual(stackDims.height / 2 - itemDims2.height / 2);
  expect(itemDims2.bottom).toEqual(stackDims.height / 2 + itemDims2.height / 2);
});

test(`verticalOverflow="scroll"`, async ({ page }) => {
  const code = `
  <VStack testId="stack" width="100" height="60" backgroundColor="cyan"
    verticalOverflow="scroll">
    <Text testId="item0">
      As its container width and height are fixed, this long text does not
      fit into it; it will overflow.
    </Text>
  </VStack>
  `;

  await initApp(page, { entryPoint: code });

  const { scrollHeight, clientHeight } = await page
    .getByTestId("stack")
    .evaluate((elem) => ({ scrollHeight: elem.scrollHeight, clientHeight: elem.clientHeight }));
  expect(scrollHeight).toBeGreaterThan(clientHeight);
});

test(`horizontalOverflow="scroll"`, async ({ page }) => {
  const code = `
  <HStack testId="stack" width="100" height="60" backgroundColor="cyan"
    horizontalOverflow="scroll">
    <Text testId="item0">
      As its container width and height are fixed, this long text does not
      fit into it; it will overflow.
    </Text>
  </HStack>
  `;

  await initApp(page, { entryPoint: code });

  const { scrollWidth, clientWidth } = await page
    .getByTestId("stack")
    .evaluate((elem) => ({ scrollWidth: elem.scrollWidth, clientWidth: elem.clientWidth }));
  expect(scrollWidth).toBeGreaterThan(clientWidth);
});

// When you set horizontalOverflow to scroll, it will automatically set verticalOverflow to scroll if the text exceeds the viewport vertically
test(`horizontalOverflow sets verticalOverflow`, async ({ page }) => {
  const code = `
  <VStack testId="stack" height="50" width="300" backgroundColor="cyan"
    horizontalOverflow="scroll">
    <Text width="400" backgroundColor="silver" opacity="0.8">
      This text sets its size explicitly bigger than its container. 
      As it does not fit into the container's viewport, it overflows.
      However, its container supports horizontal scrolling so you can 
      see its content.
    </Text>
  </VStack>
  `;

  await initApp(page, { entryPoint: code });

  const { scrollHeight, clientHeight, scrollWidth, clientWidth } = await page
    .getByTestId("stack")
    .evaluate((elem) => ({
      scrollHeight: elem.scrollHeight,
      clientHeight: elem.clientHeight,
      scrollWidth: elem.scrollWidth,
      clientWidth: elem.clientWidth,
    }));
  expect(scrollWidth).toBeGreaterThan(clientWidth);
  expect(scrollHeight).toBeGreaterThan(clientHeight);
});
