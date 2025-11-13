import { getBounds, overflows } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic functionality", () => {
  test("component renders with default props", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout>
        <Text testId="item1">Item 1</Text>
        <Text testId="item2">Item 2</Text>
        <Text testId="item3">Item 3</Text>
      </FlowLayout>
    `);

    // Check that the component is visible
    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect1.width).toBeGreaterThan(0);
    expect(rect2.width).toBeGreaterThan(0);
    expect(rect3.width).toBeGreaterThan(0);
    expect(rect1.x).toBe(rect2.x);
    expect(rect2.x).toBe(rect3.x);
    expect(rect1.y).toBeLessThan(rect2.y);
    expect(rect2.y).toBeLessThan(rect3.y);
  });

  test("component renders when widths specified", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout>
        <Text testId="item1" width="80px">Item 1</Text>
        <Text testId="item2" width="80px">Item 2</Text>
        <Text testId="item3" width="80px">Item 3</Text>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect1.width).toBeLessThanOrEqual(80);
    expect(rect2.width).toBeLessThanOrEqual(80);
    expect(rect3.width).toBeLessThanOrEqual(80);
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.y).toBe(rect3.y);
    expect(rect1.x).toBeLessThan(rect2.x);
    expect(rect2.x).toBeLessThan(rect3.x);
  });

  test("component wraps items when they exceed container width", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout width="280px">
        <Text testId="item1" width="100px">Item 1</Text>
        <Text testId="item2" width="100px">Item 2</Text>
        <Text testId="item3" width="100px">Item 3</Text>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.y).toBeLessThan(rect3.y);
    expect(rect1.x).toBeLessThan(rect2.x);
    expect(rect1.x).toBe(rect3.x);
  });

  test("component applies gap correctly (#1)", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout gap="13px">
        <Stack testId="item1" width="100px">Item 1</Stack>
        <Stack testId="item2" width="100px">Item 2</Stack>
        <Stack testId="item3" width="100px">Item 3</Stack>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.y).toBe(rect3.y);
    expect(rect2.x - (rect1.x + rect1.width)).toBe(13);
    expect(rect3.x - (rect2.x + rect2.width)).toBe(13);
  });

  test("component applies gap correctly (#2)", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout gap="13px">
        <Stack testId="item1">Item 1</Stack>
        <Stack testId="item2">Item 2</Stack>
        <Stack testId="item3">Item 3</Stack>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect2.y - (rect1.y + rect1.height)).toBe(13);
    expect(rect3.y - (rect2.y + rect2.height)).toBe(13);
  });

  test("component applies columnGap correctly", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout columnGap="13px" gap="40px">
        <Stack testId="item1" width="100px">Item 1</Stack>
        <Stack testId="item2" width="100px">Item 2</Stack>
        <Stack testId="item3" width="100px">Item 3</Stack>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.y).toBe(rect3.y);
    expect(rect2.x - (rect1.x + rect1.width)).toBe(13);
    expect(rect3.x - (rect2.x + rect2.width)).toBe(13);
  });

  test("component applies rowGap correctly", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout rowGap="13px" gap="40px">
        <Stack testId="item1">Item 1</Stack>
        <Stack testId="item2">Item 2</Stack>
        <Stack testId="item3">Item 3</Stack>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect2.y - (rect1.y + rect1.height)).toBe(13);
    expect(rect3.y - (rect2.y + rect2.height)).toBe(13);
  });

  test("component applies rowGap and columnGap correctly", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout width="280px" columnGap="13px" rowGap="19px" gap="40px">
        <Stack testId="item1" width="100px">Item 1</Stack>
        <Stack testId="item2" width="100px">Item 2</Stack>
        <Stack testId="item3" width="100px">Item 3</Stack>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const item3 = page.getByTestId("item3");
    const rect3 = await item3.boundingBox();

    // Check that children are rendered
    expect(rect1.height).toBe(rect2.height);
    expect(rect2.height).toBe(rect3.height);
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.y).toBeLessThan(rect3.y);
    expect(rect1.x).toBeLessThan(rect2.x);
    expect(rect2.x - (rect1.x + rect1.width)).toBe(13);
    expect(rect3.x).toBe(rect1.x);
    expect(rect3.y - (rect2.y + rect2.height)).toBe(19);
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge cases", () => {
  test("component handles empty content gracefully", async ({ page, initTestBed }) => {
    await initTestBed(`<FlowLayout testId="flowLayout"></FlowLayout>`);

    const layout = page.getByTestId("flowLayout");
    await expect(layout).toBeAttached();
    await expect(layout).toBeEmpty();
  });

  test("component handles very long items correctly (#1)", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout width="200px">
        <Text testId="item1">This is a very long item that should wrap to the next line because it's too long</Text>
        <Text testId="item2">Short item</Text>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();

    expect(rect2.y).toBeGreaterThan(rect1.y + rect1.height);
  });

  test("component handles very long items correctly (#2)", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout width="200px">
        <Text testId="item1">Short item</Text>
        <Text testId="item2">This is a very long item that should wrap to the next line because it's too long</Text>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();

    expect(rect2.y).toBeGreaterThan(rect1.y + rect1.height);
  });

  const PAGE_WIDTH = 1280;

  test("1 item 25% width", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout width="${PAGE_WIDTH}">
        <Stack testId="item" backgroundColor="red" height="64px" width="25%"/>
      </FlowLayout>
    `);
    const expectedWidth = PAGE_WIDTH * 0.25;
    const { width: itemWidth } = await getBounds(page.getByTestId("item"));
    expect(itemWidth).toEqual(expectedWidth);
  });

  // gap should be ignored because of 1 item
  test("1 item 25% width + gap", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout gap="26px" width="${PAGE_WIDTH}">
        <Stack testId="item" backgroundColor="red" height="64px" width="25%"/>
      </FlowLayout>
    `);

    const { right } = await getBounds(page.getByTestId("item"));
    const expectedWidth = PAGE_WIDTH * 0.25;
    expect(right).toEqual(expectedWidth);
  });

  // gap should be ignored because of 1 item
  test("1 item 100% width + gap", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout gap="26px" width="${PAGE_WIDTH}">
        <Stack testId="item" backgroundColor="red" height="64px" width="100%"/>
      </FlowLayout>
    `);
    const { width } = await getBounds(page.getByTestId("item"));
    const expectedWidth = PAGE_WIDTH;
    expect(width).toEqual(expectedWidth);
  });

  test("4 item 25% width", async ({ page, initTestBed }) => {
    const layoutWidth = "400px";
    const itemWidthPercent = "25%";
    const itemHeight = 64;

    await initTestBed(`
      <FlowLayout testId="layout" width="${layoutWidth}" backgroundColor="cyan">
        <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercent}"/>
      </FlowLayout>
    `);
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    expect(layoutHeight).toEqual(itemHeight);
  });

  test("3 item 25% width, 1 item 25.1% wraps", async ({ page, initTestBed }) => {
    const itemHeight = 64;
    const itemWidthPercent = "25%";
    const itemWidthPercentBigger = "25.1%";
    await initTestBed(`
      <FlowLayout testId="layout" width="${PAGE_WIDTH}" gap="0">
        <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercentBigger}"/>
      </FlowLayout>
    `);

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const expectedHeight = itemHeight * 2;

    expect(layoutHeight).toEqual(expectedHeight);
  });

  // When gap is specified and wrapping, a horizontal gap is applied
  test("wrap with gaps", async ({ page, initTestBed }) => {
    const layoutWidth = 400;
    const itemWidthPercent = "25%";
    const itemWidthPercentBigger = "25.1%";
    const itemHeight = 64;
    const gap = 20;
    await initTestBed(`
      <FlowLayout testId="layout" width="${layoutWidth}px" backgroundColor="cyan" gap="${gap}px">
        <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercentBigger}"/>
        <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
        <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercent}"/>
      </FlowLayout>
    `);

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const expectedHeight = gap + itemHeight * 2;

    expect(layoutHeight).toEqual(expectedHeight);
  });

  test("item with * width fills row", async ({ page, initTestBed }) => {
    const itemHeight = 64;
    const itemWidth = "*";
    await initTestBed(`
      <FlowLayout testId="layout">
        <Stack backgroundColor="red" height="${itemHeight}px" width="50"/>
        <Stack backgroundColor="green" height="${itemHeight}px" width="50"/>
        <Stack testId="item2" backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}"/>
      </FlowLayout>
    `);

    const { height: layoutHeight, right: layoutRight } = await getBounds(
      page.getByTestId("layout"),
    );
    const { right: starItemRight } = await getBounds(page.getByTestId("item2"));

    expect(layoutHeight).toEqual(itemHeight);
    expect(layoutRight).toEqual(starItemRight);
  });

  // rowGap applies when wrapping
  test("wrap with rowGap", async ({ page, initTestBed }) => {
    const itemHeight = 64;
    const itemWidthPercent = "50%";
    const rowGap = 24;
    await initTestBed(`
  <FlowLayout testId="layout" rowGap="${rowGap}px">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercent}"/>
  </FlowLayout>
  `);

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const expectedHeight = itemHeight * 2 + rowGap;

    expect(layoutHeight).toEqual(expectedHeight);
  });

  test("wrap with columnGap", async ({ page, initTestBed }) => {
    const itemWidth = 200;
    const columnGap = 24;
    const layoutWidth = itemWidth + columnGap + itemWidth;
    const itemHeight = 64;
    await initTestBed(`
  <FlowLayout testId="layout" width="${layoutWidth}px" columnGap="${columnGap}px">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack backgroundColor="yellow" testId="item3" height="${itemHeight}px" width="${itemWidth}px"/>
  </FlowLayout>
  `);

    const { left: item3Left } = await getBounds(page.getByTestId("item3"));
    const expectedItem3Left = itemWidth + columnGap;

    expect(item3Left).toEqual(expectedItem3Left);
  });

  // wrapping: columnGap & rowGap overrules gap prop
  test("columnGap & rowGap overrules gap", async ({ page, initTestBed }) => {
    const itemWidth = 200;
    const columnGap = 24;
    const layoutWidth = itemWidth + columnGap + itemWidth;
    const itemHeight = 64;
    const rowGap = 24;
    const gap = 5;
    await initTestBed(`
  <FlowLayout testId="layout" width="${layoutWidth}px" gap="${gap}px" columnGap="${columnGap}px" rowGap="${rowGap}px">
    <Stack testId="item0" backgroundColor="red" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack testId="item1" backgroundColor="green" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack testId="item2" backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack testId="item3" backgroundColor="yellow" height="${itemHeight}px" width="${itemWidth}px"/>
  </FlowLayout>
  `);

    const { left: item3Left } = await getBounds(page.getByTestId("item3"));
    const expectedItem3Left = itemWidth + columnGap;

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const expectedLayoutHeight = itemHeight + rowGap + itemHeight;

    expect(item3Left).toEqual(expectedItem3Left);
    expect(layoutHeight).toEqual(expectedLayoutHeight);
  });

  // 4 items with 25% each perfectly fit in one row
  // gaps, borders, margins don't count when breaking into new lines
  test("no wrap from gap, border, margin", async ({ page, initTestBed }) => {
    const itemHeight = 64;
    const width = "25%";
    const marginInline = 100;
    await initTestBed(`
  <FlowLayout testId="layout" gap="26px" >
    <Stack testId="item0" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="red" height="${itemHeight}px" width="${width}px"/>
    <Stack testId="item1" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="green" height="${itemHeight}px" width="${width}px"/>
    <Stack testId="item2" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="blue" height="${itemHeight}px" width="${width}px"/>
    <Stack testId="item3" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="yellow" height="${itemHeight}px" width="${width}px"/>
  </FlowLayout>
  `);
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    expect(layoutHeight).toEqual(itemHeight);
  });

  // Elements will cap at 100% width
  test("no horizontal overflow", async ({ page, initTestBed }) => {
    const itemHeight = 64;
    const bigWidths = { percent: "120%", px: "1000000000px", em: "1000000000em" };
    await initTestBed(`
  <FlowLayout testId="layout" gap="0">
    <Stack testId="item0" height="${itemHeight}px" width="${bigWidths.percent}"/>
    <Stack testId="item1" height="${itemHeight}px" width="${bigWidths.px}"/>
    <Stack testId="item2" height="${itemHeight}px" width="${bigWidths.em}"/>
  </FlowLayout>
  `);

    const isOverflownItem0 = await overflows(page.getByTestId("item0"), "x");
    const isOverflownItem1 = await overflows(page.getByTestId("item1"), "x");
    const isOverflownItem2 = await overflows(page.getByTestId("item2"), "x");
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const expectedLayoutHeight = itemHeight * 3;

    expect(isOverflownItem0).toStrictEqual(false);
    expect(isOverflownItem1).toStrictEqual(false);
    expect(isOverflownItem2).toStrictEqual(false);
    expect(layoutHeight).toEqual(expectedLayoutHeight);
  });

  // SpaceFillers can be used to break into new lines
  test("SpaceFiller adds line break", async ({ page, initTestBed }) => {
    const itemHeight = 64;
    const itemWidth = "20%";
    await initTestBed(`
  <FlowLayout testId="layout" gap="0">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidth}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}"/>
    <SpaceFiller/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidth}"/>
  </FlowLayout>
  `);

    const expectedHeight = 2 * itemHeight;
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    expect(layoutHeight).toEqual(expectedHeight);
  });

  // The layout properly handles overflow on the Y axis
  // The scrollbar must not overlap the rightmost element
  test("scrollbar on overflow Y", async ({ page, initTestBed }) => {
    const itemHeight = 128;
    await initTestBed(`
  <FlowLayout testId="layout" height="100px" columnGap="10px" overflowY="auto">
    <Stack backgroundColor="red" height="${itemHeight}px" border="solid 8px black"/>
    <Stack backgroundColor="blue" height="${itemHeight}px"/>
    <Stack backgroundColor="green" height="${itemHeight}px"/>
  </FlowLayout>
  `);

    const result = await overflows(page.getByTestId("layout"), "y");
    expect(result).toEqual(true);
  });

  // The layout properly handles overflow on the Y axis
  // The scrollbar must not overlap the rightmost element
  test("scrollbar on overflow Y multi items", async ({ page, initTestBed }) => {
    const itemHeight = 128;
    await initTestBed(`
  <FlowLayout testId="layout" height="100px" overflowY="auto">
    <Stack backgroundColor="red" height="${itemHeight}px" border="solid 8px black" width="50%"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" border="solid 8px black" width="50%"/>
    <Stack backgroundColor="green" height="${itemHeight}px"/>
  </FlowLayout>
  `);

    const result = await overflows(page.getByTestId("layout"), "y");

    expect(result).toEqual(true);
  });

  test("multiple star sized next to each other doesn't break", async ({ page, initTestBed }) => {
    await initTestBed(`
    <FlowLayout testId="layout" width="100px" columnGap="10px">
      <Stack testId="red" backgroundColor="red" height="10px" width="20px"/>
      <Stack testId="green" backgroundColor="green" height="10px" width="*"/>
      <Stack testId="blue" backgroundColor="blue" height="10px" width="2*"/>
    </FlowLayout>`);

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const { width: redWidth } = await getBounds(page.getByTestId("red"));
    const { width: greenWidth } = await getBounds(page.getByTestId("green"));
    const { width: blueWidth } = await getBounds(page.getByTestId("blue"));

    // red: 20px | 10px gap | green: 20px | 10px gap | blue: 40px
    expect(layoutHeight).toEqual(10);
    expect(redWidth).toEqual(20);
    expect(greenWidth).toEqual(20);
    expect(blueWidth).toEqual(40);
  });

  test("SpaceFiller breaks star sized items", async ({ page, initTestBed }) => {
    await initTestBed(`
    <FlowLayout testId="layout" width="100px" gap="10px">
      <Stack testId="red" backgroundColor="red" height="10px" width="20px"/>
      <Stack testId="green" backgroundColor="green" height="10px" width="*"/>
      <SpaceFiller/>
      <Stack testId="blue" backgroundColor="blue" height="10px" width="2*"/>
    </FlowLayout>`);

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
    const { width: redWidth } = await getBounds(page.getByTestId("red"));
    const { width: greenWidth } = await getBounds(page.getByTestId("green"));
    const { width: blueWidth } = await getBounds(page.getByTestId("blue"));

    // red: 20px | 10px gap | green: 70px
    // gap 10px
    // blue: 100px
    expect(layoutHeight).toEqual(30);
    expect(redWidth).toEqual(20);
    expect(greenWidth).toEqual(70);
    expect(blueWidth).toEqual(100);
  });
});
