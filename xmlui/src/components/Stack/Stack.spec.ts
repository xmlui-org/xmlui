import { test, expect } from "../../testing/fixtures";
import { overflows, getBounds } from "../../testing/component-test-helpers";

const PAGE_WIDTH = 1280;
const PAGE_HEIGHT = 720;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("can render empty", async ({ page, initTestBed }) => {
    await initTestBed(`<Stack testId="stack"></Stack>`);
    await expect(page.getByTestId("stack")).toBeAttached();
    await expect(page.getByTestId("stack")).toBeEmpty();
  });
});

// =============================================================================
// LAYOUT TESTS
// =============================================================================

test.describe("Layout", () => {
  // "(horizontal) children with unspecified dimensions" -> width is content size, height is content size
  test("(horizontal) children with unspecified dimensions", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan">Text #1</Text>
        <Text testId="item_1" backgroundColor="yellow">Text #2</Text>
        <Text testId="item_2" backgroundColor="lightgreen">Text #3</Text>
      </Stack>
    `);

    const { width: stackWidth, height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const { width: itemWidth0, height: itemHeight0 } = await getBounds(page.getByTestId("item_0"));
    const { width: itemWidth1 } = await getBounds(page.getByTestId("item_1"));
    const { width: itemWidth2, right: itemRight2 } = await getBounds(page.getByTestId("item_2"));
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
  test("(vertical) children with unspecified dimensions, orientation is implicit", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Stack testId="stack" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan">Text #1</Text>
        <Text testId="item_1" backgroundColor="yellow">Text #2</Text>
        <Text testId="item_2" backgroundColor="lightgreen">Text #3</Text>
      </Stack>
    `);

    const { height: stackHeight, width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

    const itemHeightSum = itemDims0.height + itemDims1.height + itemDims2.height;

    expect(itemHeightSum).toEqualWithTolerance(stackHeight);
    expect(itemDims0.width).toEqual(stackWidth);
    expect(itemDims1.width).toEqual(stackWidth);
    expect(itemDims2.width).toEqual(stackWidth);
  });

  // "(horizontal) block children with unspecified dimensions" -> width is content size,
  // height is content size, block children are treated as inline elements
  test("(horizontal) block children with unspecified dimensions", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" gap="0">
          <Text testId="item_0" backgroundColor="cyan">Heading 1</Text>
          <Text testId="item_1" backgroundColor="yellow">Heading 2</Text>
          <Text testId="item_2" backgroundColor="lightgreen">Heading 3</Text>
        </Stack>
        <Stack testId="stack2" orientation="horizontal" backgroundColor="lightgray">
          <Text testId="item_3" backgroundColor="coral">Heading 1Heading 2Heading 3</Text>
        </Stack>
      </Fragment>
    `);

    const { width: stackWidth, height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const { width: itemWidth0, height: itemHeight0 } = await getBounds(page.getByTestId("item_0"));
    const { width: itemWidth1, height: itemHeight1 } = await getBounds(page.getByTestId("item_1"));
    const { width: itemWidth2, height: itemHeight2 } = await getBounds(page.getByTestId("item_2"));
    const { width: itemWidth3 } = await getBounds(page.getByTestId("item_3"));

    const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;
    const tallestItemHeight = Math.max(itemHeight0, itemHeight1, itemHeight2);

    expect(itemWidthSum).toBeLessThan(stackWidth);
    expect(itemWidthSum).toEqualWithTolerance(itemWidth3);
    expect(stackHeight).toEqual(tallestItemHeight);
  });

  // "(horizontal) children with fixed dimensions" -> Stack does not alter dimensions
  test("(horizontal) children with fixed dimensions", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="72px" height="36px">72 x 36</Text>
        <Text testId="item_1" backgroundColor="yellow" width="144px" height="72px">144 x 72</Text>
        <Text testId="item_2" backgroundColor="lightgreen" width="64px" height="48px">64 x 48</Text>
      </Stack>
    `);

    const { height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

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
  test("(vertical) children with fixed dimensions", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="72px" height="36px">72 x 36</Text>
        <Text testId="item_1" backgroundColor="yellow" width="144px" height="72px">144 x 72</Text>
        <Text testId="item_2" backgroundColor="lightgreen" width="64px" height="48px">64 x 48</Text>
      </Stack>
    `);

    const { width: stackWidth, height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

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
  test("(horizontal) children with fixed width and unspecified height", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="72px">W: 72</Text>
        <Text testId="item_1" backgroundColor="yellow" width="144px">W: 144</Text>
        <Text testId="item_2" backgroundColor="lightgreen" width="48px">W: 48 + long, long, long text</Text>
      </Stack>
    `);

    const { height: stackHeight, width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

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
  test("(vertical) children with fixed height and unspecified width ", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" gap="0">
        <Text testId="item_0" backgroundColor="cyan" height="36px">H: 36</Text>
        <Text testId="item_1" backgroundColor="yellow" height="72px">H: 72</Text>
        <Text testId="item_2" backgroundColor="lightgreen" height="48px">H: 48 + long, long, long text</Text>
      </Stack>
    `);

    const { height: stackHeight, width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

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
  test("(horizontal) children with fixed height and unspecified width", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="0">
        <Text testId="item_0" backgroundColor="cyan" height="36px">H: 36</Text>
        <Text testId="item_1" backgroundColor="yellow" height="72px">H: 72</Text>
        <Text testId="item_2" backgroundColor="lightgreen" height="48px">H: 48</Text>
      </Stack>
    `);

    const { height: stackHeight, width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

    const itemWidthSum = itemDims0.width + itemDims1.width + itemDims2.width;
    const tallestItemHeight = 72;

    expect(itemWidthSum).toBeLessThan(stackWidth);
    expect(stackHeight).toEqual(tallestItemHeight);

    expect(itemDims0.height).toEqual(36);
    expect(itemDims1.height).toEqual(72);
    expect(itemDims2.height).toEqual(48);
  });

  // (vertical) children with fixed width and unspecified height -> item heights are content size, widths are not altered
  test("(vertical) children with fixed width and unspecified height", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="72px">W: 72</Text>
        <Text testId="item_1" backgroundColor="yellow" width="144px">W: 144</Text>
        <Text testId="item_2" backgroundColor="lightgreen" width="48px">W: 48 + long, long, long text</Text>
      </Stack>
    `);

    const { height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

    const itemHeightSum = itemDims0.height + itemDims1.height + itemDims2.height;

    expect(itemHeightSum).toEqualWithTolerance(itemDims2.bottom);
    expect(itemHeightSum).toEqualWithTolerance(stackHeight);

    expect(itemDims0.width).toEqual(72);
    expect(itemDims1.width).toEqual(144);
    expect(itemDims2.width).toEqual(48);
  });

  test("(horizontal) percentage sizing", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="20%">W: 20%</Text>
        <H2 testId="item_1" backgroundColor="yellow" width="50%">W: 50%</H2>
        <H5 testId="item_2" backgroundColor="lightgreen" width="20%">W: 20% + long, long, long text</H5>
      </Stack>
    `);

    const { width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const { width: itemWidth0 } = await getBounds(page.getByTestId("item_0"));
    const { width: itemWidth1 } = await getBounds(page.getByTestId("item_1"));
    const { width: itemWidth2, right: lastItemRight } = await getBounds(page.getByTestId("item_2"));
    const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;

    expect(stackWidth).toEqual(PAGE_WIDTH);
    expect(itemWidthSum).toEqualWithTolerance(lastItemRight);
    expect(itemWidth0).toEqualWithTolerance(0.2 * stackWidth);
    expect(itemWidth1).toEqualWithTolerance(0.5 * stackWidth);
    expect(itemWidth2).toEqualWithTolerance(0.2 * stackWidth);
  });

  test("(vertical) percentage sizing", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" height="180px" orientation="vertical" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" height="20%">W: 20%</Text>
        <Text testId="item_1" backgroundColor="yellow" height="50%">W: 50%</Text>
        <Text testId="item_2" backgroundColor="lightgreen" height="20%">W: 20% + long, long, long text</Text>
      </Stack>
    `);

    const { height: stackHeight, width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const { height: itemHeight0, width: itemWidth0 } = await getBounds(page.getByTestId("item_0"));
    const { height: itemHeight1 } = await getBounds(page.getByTestId("item_1"));
    const { height: itemHeight2, bottom: lastItemBottom } = await getBounds(
      page.getByTestId("item_2"),
    );
    const itemHeightSum = itemHeight0 + itemHeight1 + itemHeight2;

    expect(itemWidth0).toEqual(stackWidth);
    expect(itemHeightSum).toEqualWithTolerance(lastItemBottom);
    expect(itemHeight0).toEqualWithTolerance(0.2 * stackHeight);
    expect(itemHeight1).toEqualWithTolerance(0.5 * stackHeight);
    expect(itemHeight2).toEqualWithTolerance(0.2 * stackHeight);
  });

  test("(horizontal) percentage sizing fully filled", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="20%">W: 20%</Text>
        <H2 testId="item_1" backgroundColor="yellow" width="50%">W: 50%</H2>
        <H5 testId="item_2" backgroundColor="lightgreen" width="30%">W: 30% + long, long, long text</H5>
      </Stack>
    `);
    const { width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const { right: lastItemRight } = await getBounds(page.getByTestId("item_2"));
    expect(stackWidth).toEqualWithTolerance(lastItemRight);
  });

  test("(vertical) percentage sizing fully filled", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" height="180px" orientation="vertical" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" height="20%">W: 20%</Text>
        <Text testId="item_1" backgroundColor="yellow" height="50%">W: 50%</Text>
        <Text testId="item_2" backgroundColor="lightgreen" height="30%">W: 30% + long, long, long text</Text>
      </Stack>
    `);
    const { height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const { bottom: lastItemBottom } = await getBounds(page.getByTestId("item_2"));
    expect(stackHeight).toEqualWithTolerance(lastItemBottom);
  });

  // (horizontal) percentage overflow X
  test("(horizontal) percentage overflow X", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="30%">W: 30%</Text>
        <H2 testId="item_1" backgroundColor="yellow" width="50%">W: 50%</H2>
        <H5 testId="item_2" backgroundColor="lightgreen" width="40%">W: 40% + long, long, long text</H5>
      </Stack>
    `);
    const isOverflown = await overflows(page.getByTestId("stack"), "x");
    expect(isOverflown).toEqual(true);
  });

  // (vertical) percentage overflow Y
  test("(vertical) percentage overflow Y", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" height="180px" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" height="30%">H: 30%</Text>
        <H2 testId="item_1" backgroundColor="yellow" height="60%">H: 60%</H2>
        <H5 testId="item_2" backgroundColor="lightgreen" height="20%">H: 20% + long, long, long text</H5>
      </Stack>
    `);
    const isOverflown = await overflows(page.getByTestId("stack"), "y");
    expect(isOverflown).toEqual(true);
  });

  test("(horizontal) star sizing", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" width="100%" orientation="horizontal" backgroundColor="lightgray" gap="0">
        <Text testId="item_0" backgroundColor="cyan" width="100px">W: 100</Text>
        <Text testId="item_1" backgroundColor="yellow" width="3*">W: 3*</Text>
        <Text testId="item_2" backgroundColor="lightgreen" width="*">W: *</Text>
      </Stack>
    `);
    const { width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const { width: itemWidth0 } = await getBounds(page.getByTestId("item_0"));
    const { width: itemWidth1 } = await getBounds(page.getByTestId("item_1"));
    const { width: itemWidth2, right: lastItemRight } = await getBounds(page.getByTestId("item_2"));
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
  test("(horizontal) star sizing comparison", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Stack testId="stack_0" orientation="horizontal" width="600px" gap="0">
          <Text testId="ref_item_0" backgroundColor="cyan" width="100px">W: 100</Text>
          <Text testId="ref_item_1" backgroundColor="yellow" width="3*">W: 3*</Text>
          <Text testId="ref_item_2" backgroundColor="lightgreen" width="*">W: *</Text>
        </Stack>
        <Stack testId="stack_1" orientation="horizontal" width="300px" gap="0">
          <Text testId="item_0" backgroundColor="cyan" width="100px">W: 100</Text>
          <Text testId="item_1" backgroundColor="yellow" width="3*">W: 3*</Text>
          <Text testId="item_2" backgroundColor="lightgreen" width="*">W: *</Text>
        </Stack>
      </Fragment>
    `);
    const { width: refItemWidth0 } = await getBounds(page.getByTestId("ref_item_0"));
    const { width: refItemWidth1 } = await getBounds(page.getByTestId("ref_item_1"));
    const { width: refItemWidth2 } = await getBounds(page.getByTestId("ref_item_2"));
    const { width: itemWidth0 } = await getBounds(page.getByTestId("item_0"));
    const { width: itemWidth1 } = await getBounds(page.getByTestId("item_1"));
    const { width: itemWidth2 } = await getBounds(page.getByTestId("item_2"));

    expect(refItemWidth0).toEqual(itemWidth0);
    expect(refItemWidth1).toBeGreaterThan(itemWidth1);
    expect(refItemWidth2).toBeGreaterThan(itemWidth2);
  });

  // (vertical) star sizing comparison -> Larger Stack have larger star sized children, px sizes are same
  test("(vertical) star sizing comparison", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Stack testId="stack_0" orientation="vertical" height="600px" gap="0">
          <Text testId="ref_item_0" backgroundColor="cyan" height="100px">W: 100</Text>
          <Text testId="ref_item_1" backgroundColor="yellow" height="3*">W: 3*</Text>
          <Text testId="ref_item_2" backgroundColor="lightgreen" height="*">W: *</Text>
        </Stack>
        <Stack testId="stack_1" orientation="vertical" height="300px" gap="0">
          <Text testId="item_0" backgroundColor="cyan" height="100px">W: 100</Text>
          <Text testId="item_1" backgroundColor="yellow" height="3*">W: 3*</Text>
          <Text testId="item_2" backgroundColor="lightgreen" height="*">W: *</Text>
        </Stack>
      </Fragment>
    `);
    const { height: refItemHeight0 } = await getBounds(page.getByTestId("ref_item_0"));
    const { height: refItemHeight1 } = await getBounds(page.getByTestId("ref_item_1"));
    const { height: refItemHeight2 } = await getBounds(page.getByTestId("ref_item_2"));
    const { height: itemHeight0 } = await getBounds(page.getByTestId("item_0"));
    const { height: itemHeight1 } = await getBounds(page.getByTestId("item_1"));
    const { height: itemHeight2 } = await getBounds(page.getByTestId("item_2"));

    expect(refItemHeight0).toEqual(itemHeight0);
    expect(refItemHeight1).toBeGreaterThan(itemHeight1);
    expect(refItemHeight2).toBeGreaterThan(itemHeight2);
  });

  // (horizontal) gaps + percentage -> children use available space
  test("(horizontal) paddings + percentage", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" gap="0"
        paddingHorizontal="50px" paddingVertical="50px">
        <Text testId="item_0" backgroundColor="cyan" width="25%">W: 25%</Text>
        <Text testId="item_1" backgroundColor="yellow" width="50%">W: 50%</Text>
        <Text testId="item_2" backgroundColor="lightgreen" width="25%">W: 25%</Text>
      </Stack>
    `);
    const { width: stackWidth } = await getBounds(page.getByTestId("stack"));
    const { width: itemWidth0, left: firstItemLeft } = await getBounds(page.getByTestId("item_0"));
    const { width: itemWidth1 } = await getBounds(page.getByTestId("item_1"));
    const { width: itemWidth2, right: lastItemRight } = await getBounds(page.getByTestId("item_2"));

    const itemWidthSum = itemWidth0 + itemWidth1 + itemWidth2;
    expect(firstItemLeft).toEqual(50);
    expect(lastItemRight).toEqual(stackWidth - 50);
    expect(itemWidthSum).toEqualWithTolerance(stackWidth - 2 * 50);
  });

  // (vertical) gaps + percentage -> children use available space
  test("(vertical) paddings + percentage", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" backgroundColor="lightgray" gap="0"
        height="240px" paddingHorizontal="50px" paddingVertical="50px">
        <Text testId="item_0" backgroundColor="cyan" height="25%">H: 25%</Text>
        <Text testId="item_1" backgroundColor="yellow" height="50%">H: 50%</Text>
        <Text testId="item_2" backgroundColor="lightgreen" height="25%">H: 25%</Text>
      </Stack>
    `);
    const { height: stackHeight } = await getBounds(page.getByTestId("stack"));
    const { top: firstItemTop } = await getBounds(page.getByTestId("item_0"));
    const { bottom: lastItemBottom } = await getBounds(page.getByTestId("item_2"));

    expect(firstItemTop).toEqual(50);
    expect(lastItemBottom).toEqual(stackHeight - 50);
  });

  test("(horizontal) gaps", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack orientation="horizontal" backgroundColor="lightgray" gap="50px">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);

    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

    expect(itemDims0.left).toEqual(0);
    expect(itemDims1.left).toEqual(itemDims0.right + 50);
    expect(itemDims2.left).toEqual(2 * (itemDims0.right + 50));
  });

  test("(vertical) gaps", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack orientation="vertical" backgroundColor="lightgray" gap="50px">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);

    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

    expect(itemDims0.top).toEqual(0);
    expect(itemDims1.top).toEqual(itemDims0.bottom + 50);
    expect(itemDims2.top).toEqual(2 * (itemDims0.bottom + 50));
  });

  // (horizontal) gaps + percentage -> gaps push the content out of the container
  test("(horizontal) gaps + percentage", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" padding="1rem" gap="2rem">
        <Stack backgroundColor="red" height="36px" width="25%" />
        <Stack backgroundColor="green" height="36px" width="50%" />
        <Stack backgroundColor="blue" height="36px" width="25%" />
      </Stack>
    `);
    const isOverflown = await overflows(page.getByTestId("stack"), "x");
    expect(isOverflown).toEqual(true);
  });

  // (horizontal) gaps + star sizing -> gaps don't push the content out of the container
  test("(horizontal) gaps + star sizing", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" backgroundColor="lightgray" padding="1rem" gap="2rem">
        <Stack backgroundColor="red" height="36px" width="*" />
        <Stack backgroundColor="green" height="36px" width="*" />
        <Stack backgroundColor="blue" height="36px" width="*" />
        <Stack backgroundColor="purple" height="36px" width="*" />
      </Stack>
    `);
    const isOverflown = await overflows(page.getByTestId("stack"), "x");
    expect(isOverflown).toEqual(false);
  });

  test("(horizontal) rtl rendering direction", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="1rem" direction="rtl">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);

    const { right: stackRight } = await getBounds(page.getByTestId("stack"));
    const { right: itemRight0, left: itemLeft0 } = await getBounds(page.getByTestId("item_0"));
    const { left: itemLeft1 } = await getBounds(page.getByTestId("item_1"));
    const { left: itemLeft2 } = await getBounds(page.getByTestId("item_2"));

    expect(itemLeft2).toBeLessThan(itemLeft1);
    expect(itemLeft1).toBeLessThan(itemLeft0);
    expect(itemRight0).toEqual(stackRight);
  });

  test("(horizontal) reverse rendering direction", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="1rem" reverse="true">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);
    const { right: stackRight } = await getBounds(page.getByTestId("stack"));
    const { right: itemRight0, left: itemLeft0 } = await getBounds(page.getByTestId("item_0"));
    const { left: itemLeft1 } = await getBounds(page.getByTestId("item_1"));
    const { left: itemLeft2 } = await getBounds(page.getByTestId("item_2"));

    expect(itemLeft2).toBeLessThan(itemLeft1);
    expect(itemLeft1).toBeLessThan(itemLeft0);
    expect(itemRight0).toEqual(stackRight);
  });

  test("(vertical) reverse rendering direction", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" gap="1rem" reverse="true">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);
    const { bottom: stackBottom } = await getBounds(page.getByTestId("stack"));
    const { bottom: itemBottom0, top: itemTop0 } = await getBounds(page.getByTestId("item_0"));
    const { top: itemTop1 } = await getBounds(page.getByTestId("item_1"));
    const { top: itemTop2 } = await getBounds(page.getByTestId("item_2"));

    expect(itemTop2).toBeLessThan(itemTop1);
    expect(itemTop1).toBeLessThan(itemTop0);
    expect(itemBottom0).toEqual(stackBottom);
  });

  test("(horizontal) content wrapping", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="1rem" wrapContent="true">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="25%" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="40%" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="20%" />
        <Stack testId="item_3" backgroundColor="purple" height="36px" width="30%" />
      </Stack>
    `);
    const { right: stackRight, bottom: stackBottom } = await getBounds(page.getByTestId("stack"));
    const { left: itemLeft0, bottom: itemBottom0 } = await getBounds(page.getByTestId("item_0"));
    const { left: itemLeft1 } = await getBounds(page.getByTestId("item_1"));
    const { left: itemLeft2, right: itemRight2 } = await getBounds(page.getByTestId("item_2"));
    const {
      left: itemLeft3,
      bottom: itemBottom3,
      top: itemTop3,
    } = await getBounds(page.getByTestId("item_3"));

    expect(itemLeft0).toBeLessThan(itemLeft1);
    expect(itemLeft1).toBeLessThan(itemLeft2);
    expect(itemRight2).toBeLessThan(stackRight);

    expect(itemBottom0).toBeLessThan(itemTop3);
    expect(itemLeft3).toEqual(itemLeft0);
    expect(itemBottom3).toEqual(stackBottom);
  });

  test("(horizontal) horizontalAlignment center", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" horizontalAlignment="center" gap="0">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);
    const { right: stackRight } = await getBounds(page.getByTestId("stack"));
    const { left: itemLeft0 } = await getBounds(page.getByTestId("item_0"));
    const { right: itemRight2 } = await getBounds(page.getByTestId("item_2"));
    const itemWidthSum = 3 * 36;

    expect(itemLeft0).toEqual(stackRight / 2 - itemWidthSum / 2);
    expect(itemRight2).toEqual(stackRight / 2 + itemWidthSum / 2);
  });

  test("(vertical) horizontal alignment end", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="vertical" horizontalAlignment="end" gap="0">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="36px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="36px" width="36px" />
      </Stack>
    `);
    const { right: stackRight } = await getBounds(page.getByTestId("stack"));
    const { right: itemRight0 } = await getBounds(page.getByTestId("item_0"));
    const { right: itemRight1 } = await getBounds(page.getByTestId("item_1"));
    const { right: itemRight2 } = await getBounds(page.getByTestId("item_2"));

    expect(itemRight0).toEqual(stackRight);
    expect(itemRight1).toEqual(stackRight);
    expect(itemRight2).toEqual(stackRight);
  });

  test("(horizontal) verticalAlignment center", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Stack testId="stack" orientation="horizontal" gap="1rem" verticalAlignment="center">
        <Stack testId="item_0" backgroundColor="red" height="36px" width="36px" />
        <Stack testId="item_1" backgroundColor="green" height="72px" width="36px" />
        <Stack testId="item_2" backgroundColor="blue" height="48px" width="36px" />
      </Stack>
    `);
    const stackDims = await getBounds(page.getByTestId("stack"));
    const itemDims0 = await getBounds(page.getByTestId("item_0"));
    const itemDims1 = await getBounds(page.getByTestId("item_1"));
    const itemDims2 = await getBounds(page.getByTestId("item_2"));

    expect(itemDims0.top).toEqual(stackDims.height / 2 - itemDims0.height / 2);
    expect(itemDims0.bottom).toEqual(stackDims.height / 2 + itemDims0.height / 2);

    expect(itemDims1.top).toEqual(stackDims.top);
    expect(itemDims1.bottom).toEqual(stackDims.bottom);

    expect(itemDims2.top).toEqual(stackDims.height / 2 - itemDims2.height / 2);
    expect(itemDims2.bottom).toEqual(stackDims.height / 2 + itemDims2.height / 2);
  });

  test(`overflowY="scroll"`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack testId="stack" width="100px" height="60px" backgroundColor="cyan"
        overflowY="scroll">
        <Text testId="item0">
          As its container width and height are fixed, this long text does not
          fit into it; it will overflow.
        </Text>
      </VStack>
    `);
    const { scrollHeight, clientHeight } = await page
      .getByTestId("stack")
      .evaluate((elem) => ({ scrollHeight: elem.scrollHeight, clientHeight: elem.clientHeight }));

    expect(scrollHeight).toBeGreaterThan(clientHeight);
  });

  test(`overflowX="scroll"`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <HStack testId="stack" width="100px" height="60px" backgroundColor="cyan"
        overflowX="scroll">
        <Text testId="item0">
          As its container width and height are fixed, this long text does not
          fit into it; it will overflow.
        </Text>
      </HStack>
    `);
    const { scrollWidth, clientWidth } = await page
      .getByTestId("stack")
      .evaluate((elem) => ({ scrollWidth: elem.scrollWidth, clientWidth: elem.clientWidth }));

    expect(scrollWidth).toBeGreaterThan(clientWidth);
  });

  // When you set overflowX to scroll, it will automatically set overflowY to scroll if the text exceeds the viewport vertically
  test(`overflowX sets overflowY`, async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack testId="stack" height="50px" width="300px" backgroundColor="cyan"
        overflowX="scroll">
        <Text width="400px" backgroundColor="silver" opacity="0.8">
          This text sets its size explicitly bigger than its container.
          As it does not fit into the container's viewport, it overflows.
          However, its container supports horizontal scrolling so you can
          see its content.
        </Text>
      </VStack>
    `);
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
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test("scrollToTop scrolls to the top of a scrollable Stack", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToTop()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to bottom first
    await stack.evaluate((elem) => {
      elem.scrollTop = elem.scrollHeight;
    });

    // Verify we're scrolled down
    const scrollTopBefore = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTopBefore).toBeGreaterThan(0);

    // Click button to scroll to top
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the top
    const scrollTopAfter = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTopAfter).toBe(0);
  });

  test("scrollToBottom scrolls to the bottom of a scrollable Stack", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToBottom()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Verify we start at the top
    const scrollTopBefore = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTopBefore).toBe(0);

    // Click button to scroll to bottom
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the bottom
    const scrollTopAfter = await stack.evaluate((elem) => elem.scrollTop);
    const scrollHeight = await stack.evaluate((elem) => elem.scrollHeight);
    const clientHeight = await stack.evaluate((elem) => elem.clientHeight);
    
    expect(scrollTopAfter).toBeCloseTo(scrollHeight - clientHeight, 0);
  });

  test("scrollToTop with 'smooth' behavior parameter", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToTop('smooth')" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to bottom first
    await stack.evaluate((elem) => {
      elem.scrollTop = elem.scrollHeight;
    });

    // Click button to scroll to top with smooth behavior
    await page.getByTestId("scrollBtn").click();
    
    // Wait for smooth scroll to complete
    await page.waitForTimeout(500);

    // Verify we're at the top
    const scrollTopAfter = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTopAfter).toBe(0);
  });

  test("scrollToBottom with 'instant' behavior parameter", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToBottom('instant')" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");

    // Click button to scroll to bottom with instant behavior
    await page.getByTestId("scrollBtn").click();
    
    // Wait minimal time for instant scroll
    await page.waitForTimeout(50);

    // Verify we're at the bottom
    const scrollTopAfter = await stack.evaluate((elem) => elem.scrollTop);
    const scrollHeight = await stack.evaluate((elem) => elem.scrollHeight);
    const clientHeight = await stack.evaluate((elem) => elem.clientHeight);
    
    expect(scrollTopAfter).toBeCloseTo(scrollHeight - clientHeight, 0);
  });

  test("scrollToTop works on HStack with horizontal scroll", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <HStack id="myStack" width="200px" height="100px" overflowX="scroll" testId="stack">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </HStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToTop()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Note: scrollToTop affects vertical scroll even in HStack
    // This test verifies the API doesn't error on HStack
    await page.getByTestId("scrollBtn").click();
    await page.waitForTimeout(50);
    
    // Should complete without error
    await expect(stack).toBeVisible();
  });

  test("scrollToTop with default behavior uses instant", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToTop()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to bottom first
    await stack.evaluate((elem) => {
      elem.scrollTop = elem.scrollHeight;
    });

    // Click button to scroll to top (default behavior)
    await page.getByTestId("scrollBtn").click();
    
    // With instant behavior, should be immediate
    await page.waitForTimeout(50);

    // Verify we're at the top
    const scrollTopAfter = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTopAfter).toBe(0);
  });

  test("multiple scrollToTop calls work correctly", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToTop()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to bottom
    await stack.evaluate((elem) => {
      elem.scrollTop = elem.scrollHeight;
    });

    // Call scrollToTop multiple times
    await page.getByTestId("scrollBtn").click();
    await page.waitForTimeout(50);
    await page.getByTestId("scrollBtn").click();
    await page.waitForTimeout(50);
    await page.getByTestId("scrollBtn").click();
    await page.waitForTimeout(50);

    // Verify we're at the top
    const scrollTopAfter = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTopAfter).toBe(0);
  });

  test("scrollToBottom followed by scrollToTop", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <VStack id="myStack" height="200px" overflowY="scroll" testId="stack">
          <Stack height="300px" backgroundColor="lightblue"/>
          <Stack height="300px" backgroundColor="lightgreen"/>
          <Stack height="300px" backgroundColor="lightcoral"/>
        </VStack>
        <Button testId="scrollBottomBtn" onClick="myStack.scrollToBottom()" />
        <Button testId="scrollTopBtn" onClick="myStack.scrollToTop()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to bottom
    await page.getByTestId("scrollBottomBtn").click();
    await page.waitForTimeout(100);

    const scrollHeight = await stack.evaluate((elem) => elem.scrollHeight);
    const clientHeight = await stack.evaluate((elem) => elem.clientHeight);
    let scrollTop = await stack.evaluate((elem) => elem.scrollTop);
    
    expect(scrollTop).toBeCloseTo(scrollHeight - clientHeight, 0);

    // Now scroll back to top
    await page.getByTestId("scrollTopBtn").click();
    await page.waitForTimeout(100);

    scrollTop = await stack.evaluate((elem) => elem.scrollTop);
    expect(scrollTop).toBe(0);
  });

  test("scrollToStart scrolls to the start of a horizontally scrollable Stack", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <HStack id="myStack" width="200px" height="100px" overflowX="scroll" testId="stack">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </HStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToStart()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to end first
    await stack.evaluate((elem) => {
      elem.scrollLeft = elem.scrollWidth;
    });

    // Verify we're scrolled right
    const scrollLeftBefore = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftBefore).toBeGreaterThan(0);

    // Click button to scroll to start
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the start
    const scrollLeftAfter = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftAfter).toBe(0);
  });

  test("scrollToEnd scrolls to the end of a horizontally scrollable Stack", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <HStack id="myStack" width="200px" height="100px" overflowX="scroll" testId="stack">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </HStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToEnd()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Verify we start at the start
    const scrollLeftBefore = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftBefore).toBe(0);

    // Click button to scroll to end
    await page.getByTestId("scrollBtn").click();
    
    // Wait for scroll to complete
    await page.waitForTimeout(100);

    // Verify we're at the end
    const scrollLeftAfter = await stack.evaluate((elem) => elem.scrollLeft);
    const scrollWidth = await stack.evaluate((elem) => elem.scrollWidth);
    const clientWidth = await stack.evaluate((elem) => elem.clientWidth);
    
    expect(scrollLeftAfter).toBeCloseTo(scrollWidth - clientWidth, 0);
  });

  test("scrollToStart with 'smooth' behavior parameter", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <HStack id="myStack" width="200px" height="100px" overflowX="scroll" testId="stack">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </HStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToStart('smooth')" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to end first
    await stack.evaluate((elem) => {
      elem.scrollLeft = elem.scrollWidth;
    });

    // Click button to scroll to start with smooth behavior
    await page.getByTestId("scrollBtn").click();
    
    // Wait for smooth scroll to complete
    await page.waitForTimeout(500);

    // Verify we're at the start
    const scrollLeftAfter = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeftAfter).toBe(0);
  });

  test("scrollToEnd with 'instant' behavior parameter", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <HStack id="myStack" width="200px" height="100px" overflowX="scroll" testId="stack">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </HStack>
        <Button testId="scrollBtn" onClick="myStack.scrollToEnd('instant')" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");

    // Click button to scroll to end with instant behavior
    await page.getByTestId("scrollBtn").click();
    
    // Wait minimal time for instant scroll
    await page.waitForTimeout(50);

    // Verify we're at the end
    const scrollLeftAfter = await stack.evaluate((elem) => elem.scrollLeft);
    const scrollWidth = await stack.evaluate((elem) => elem.scrollWidth);
    const clientWidth = await stack.evaluate((elem) => elem.clientWidth);
    
    expect(scrollLeftAfter).toBeCloseTo(scrollWidth - clientWidth, 0);
  });

  test("scrollToEnd followed by scrollToStart", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <HStack id="myStack" width="200px" height="100px" overflowX="scroll" testId="stack">
          <Stack width="300px" height="50px" backgroundColor="lightblue"/>
          <Stack width="300px" height="50px" backgroundColor="lightgreen"/>
          <Stack width="300px" height="50px" backgroundColor="lightcoral"/>
        </HStack>
        <Button testId="scrollEndBtn" onClick="myStack.scrollToEnd()" />
        <Button testId="scrollStartBtn" onClick="myStack.scrollToStart()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to end
    await page.getByTestId("scrollEndBtn").click();
    await page.waitForTimeout(100);

    const scrollWidth = await stack.evaluate((elem) => elem.scrollWidth);
    const clientWidth = await stack.evaluate((elem) => elem.clientWidth);
    let scrollLeft = await stack.evaluate((elem) => elem.scrollLeft);
    
    expect(scrollLeft).toBeCloseTo(scrollWidth - clientWidth, 0);

    // Now scroll back to start
    await page.getByTestId("scrollStartBtn").click();
    await page.waitForTimeout(100);

    scrollLeft = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollLeft).toBe(0);
  });

  test("all scroll APIs work together", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Stack id="myStack" width="200px" height="200px" overflowX="scroll" overflowY="scroll" testId="stack">
          <HStack gap="0">
            <Stack width="300px" height="300px" backgroundColor="lightblue"/>
            <Stack width="300px" height="300px" backgroundColor="lightgreen"/>
            <Stack width="300px" height="300px" backgroundColor="lightcoral"/>
          </HStack>
        </Stack>
        <Button testId="scrollTopBtn" onClick="myStack.scrollToTop()" />
        <Button testId="scrollBottomBtn" onClick="myStack.scrollToBottom()" />
        <Button testId="scrollStartBtn" onClick="myStack.scrollToStart()" />
        <Button testId="scrollEndBtn" onClick="myStack.scrollToEnd()" />
      </Fragment>
    `);

    const stack = page.getByTestId("stack");
    
    // Scroll to bottom-end
    await page.getByTestId("scrollBottomBtn").click();
    await page.getByTestId("scrollEndBtn").click();
    await page.waitForTimeout(100);

    let scrollTop = await stack.evaluate((elem) => elem.scrollTop);
    let scrollLeft = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollTop).toBeGreaterThan(0);
    expect(scrollLeft).toBeGreaterThan(0);

    // Scroll to top-start
    await page.getByTestId("scrollTopBtn").click();
    await page.getByTestId("scrollStartBtn").click();
    await page.waitForTimeout(100);

    scrollTop = await stack.evaluate((elem) => elem.scrollTop);
    scrollLeft = await stack.evaluate((elem) => elem.scrollLeft);
    expect(scrollTop).toBe(0);
    expect(scrollLeft).toBe(0);
  });
});
