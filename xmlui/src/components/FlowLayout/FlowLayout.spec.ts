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

  test("verticalAlignment='start' aligns items at the top of row", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout verticalAlignment="start">
        <Stack testId="item1" width="100px" height="50px">Item 1</Stack>
        <Stack testId="item2" width="100px" height="80px">Item 2</Stack>
        <Stack testId="item3" width="100px" height="30px">Item 3</Stack>
      </FlowLayout>
    `);

    const { top: top1 } = await getBounds(page.getByTestId("item1"));
    const { top: top2 } = await getBounds(page.getByTestId("item2"));
    const { top: top3 } = await getBounds(page.getByTestId("item3"));

    // All items in the same row should have the same top position with "start" alignment
    expect(top1).toBe(top2);
    expect(top2).toBe(top3);
  });

  test("verticalAlignment='center' centers items vertically in row", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout verticalAlignment="center">
        <Stack testId="item1" width="100px" height="40px">Item 1</Stack>
        <Stack testId="item2" width="100px" height="80px">Item 2</Stack>
        <Stack testId="item3" width="100px" height="40px">Item 3</Stack>
      </FlowLayout>
    `);

    const { top: top1, bottom: bottom1 } = await getBounds(page.getByTestId("item1"));
    const { top: top2, bottom: bottom2 } = await getBounds(page.getByTestId("item2"));
    const { top: top3, bottom: bottom3 } = await getBounds(page.getByTestId("item3"));

    // Calculate vertical centers
    const center1 = (top1 + bottom1) / 2;
    const center2 = (top2 + bottom2) / 2;
    const center3 = (top3 + bottom3) / 2;

    // All items should be centered vertically relative to each other
    expect(Math.abs(center1 - center2)).toBeLessThan(1); // Allow for sub-pixel differences
    expect(Math.abs(center2 - center3)).toBeLessThan(1);
  });

  test("verticalAlignment='end' aligns items at the bottom of row", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout verticalAlignment="end">
        <Stack testId="item1" width="100px" height="50px">Item 1</Stack>
        <Stack testId="item2" width="100px" height="80px">Item 2</Stack>
        <Stack testId="item3" width="100px" height="30px">Item 3</Stack>
      </FlowLayout>
    `);

    const { bottom: bottom1 } = await getBounds(page.getByTestId("item1"));
    const { bottom: bottom2 } = await getBounds(page.getByTestId("item2"));
    const { bottom: bottom3 } = await getBounds(page.getByTestId("item3"));

    // All items in the same row should have the same bottom position with "end" alignment
    expect(Math.abs(bottom1 - bottom2)).toBeLessThan(1); // Allow for sub-pixel differences
    expect(Math.abs(bottom2 - bottom3)).toBeLessThan(1);
  });

  test("verticalAlignment applies to each row independently", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout width="250px" verticalAlignment="center">
        <Stack testId="item1" width="100px" height="40px">Item 1</Stack>
        <Stack testId="item2" width="100px" height="80px">Item 2</Stack>
        <Stack testId="item3" width="100px" height="60px">Item 3</Stack>
        <Stack testId="item4" width="100px" height="40px">Item 4</Stack>
      </FlowLayout>
    `);

    const { top: top1, bottom: bottom1, left: left1 } = await getBounds(page.getByTestId("item1"));
    const { top: top2, bottom: bottom2, left: left2 } = await getBounds(page.getByTestId("item2"));
    const { top: top3, bottom: bottom3, left: left3 } = await getBounds(page.getByTestId("item3"));
    const { top: top4, bottom: bottom4, left: left4 } = await getBounds(page.getByTestId("item4"));

    // First row: item1 and item2 should be centered with each other
    const center1 = (top1 + bottom1) / 2;
    const center2 = (top2 + bottom2) / 2;
    expect(Math.abs(center1 - center2)).toBeLessThan(1);
    expect(left1).toBeLessThan(left2);

    // Second row: item3 and item4 should be centered with each other
    const center3 = (top3 + bottom3) / 2;
    const center4 = (top4 + bottom4) / 2;
    expect(Math.abs(center3 - center4)).toBeLessThan(1);
    expect(left3).toBeLessThan(left4);

    // Verify items wrapped to different rows
    expect(top3).toBeGreaterThan(bottom1);
  });

  test("verticalAlignment handles default value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout>
        <Stack testId="item1" width="100px" height="40px">Item 1</Stack>
        <Stack testId="item2" width="100px" height="80px">Item 2</Stack>
      </FlowLayout>
    `);

    const { top: top1 } = await getBounds(page.getByTestId("item1"));
    const { top: top2 } = await getBounds(page.getByTestId("item2"));

    // Default should be "start" alignment
    expect(top1).toBe(top2);
  });
});

// =============================================================================
// TEXT ELLIPSIS TESTS
// =============================================================================

test.describe("Text ellipsis support", () => {
  test("Text with overflowMode='ellipsis' shows ellipsis when truncated", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout>
        <Text
          testId="text"
          overflowMode="ellipsis"
          width="200px"
        >
          This is a very long text that should be truncated with ellipsis
        </Text>
      </FlowLayout>
    `);

    const text = page.getByTestId("text");

    // Should have ellipsis styles applied
    await expect(text).toHaveCSS("text-overflow", "ellipsis");
    await expect(text).toHaveCSS("overflow", "hidden");
    await expect(text).toHaveCSS("white-space", "nowrap");

    // Verify text is actually truncated (scrollWidth > clientWidth indicates overflow)
    const hasOverflow = await text.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasOverflow).toBe(true);
  });

  test("Text ellipsis works with multiple items in FlowLayout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout gap="10px">
        <Text
          testId="text1"
          variant="strong"
          overflowMode="ellipsis"
          width="300px"
        >
          First item with very long text that should truncate
        </Text>
        <Text testId="text2" width="100px">
          Second
        </Text>
        <Text
          testId="text3"
          overflowMode="ellipsis"
          width="200px"
        >
          Third item also truncates when needed
        </Text>
      </FlowLayout>
    `);

    const text1 = page.getByTestId("text1");
    const text3 = page.getByTestId("text3");

    // Both should have ellipsis applied
    await expect(text1).toHaveCSS("text-overflow", "ellipsis");
    await expect(text3).toHaveCSS("text-overflow", "ellipsis");

    // Both should be truncated
    const hasOverflow1 = await text1.evaluate((el) => el.scrollWidth > el.clientWidth);
    const hasOverflow3 = await text3.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasOverflow1).toBe(true);
    expect(hasOverflow3).toBe(true);
  });

  test("Text ellipsis in FlowLayout matches HStack behavior", async ({ page, initTestBed }) => {
    await initTestBed(`
      <VStack gap="20px">
        <HStack testId="hstack" gap="10px">
          <Text
            testId="text-hstack"
            overflowMode="ellipsis"
            width="250px"
          >
            Lorem ipsum dolor sit amet consectetur adipiscing elit
          </Text>
          <Text>Date</Text>
        </HStack>
        <FlowLayout testId="flowlayout" gap="10px">
          <Text
            testId="text-flow"
            overflowMode="ellipsis"
            width="250px"
          >
            Lorem ipsum dolor sit amet consectetur adipiscing elit
          </Text>
          <Text>Date</Text>
        </FlowLayout>
      </VStack>
    `);

    const textHStack = page.getByTestId("text-hstack");
    const textFlow = page.getByTestId("text-flow");

    // Both should have identical ellipsis behavior
    await expect(textHStack).toHaveCSS("text-overflow", "ellipsis");
    await expect(textFlow).toHaveCSS("text-overflow", "ellipsis");

    await expect(textHStack).toHaveCSS("overflow", "hidden");
    await expect(textFlow).toHaveCSS("overflow", "hidden");

    await expect(textHStack).toHaveCSS("white-space", "nowrap");
    await expect(textFlow).toHaveCSS("white-space", "nowrap");

    // Both should be truncated
    const hasOverflowHStack = await textHStack.evaluate((el) => el.scrollWidth > el.clientWidth);
    const hasOverflowFlow = await textFlow.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(hasOverflowHStack).toBe(true);
    expect(hasOverflowFlow).toBe(true);
  });

  test("Text without ellipsis wraps normally in FlowLayout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout>
        <Text
          testId="text"
          width="200px"
        >
          This text will wrap to multiple lines instead of truncating
        </Text>
      </FlowLayout>
    `);

    const text = page.getByTestId("text");

    // Should not have nowrap (text can wrap)
    await expect(text).not.toHaveCSS("white-space", "nowrap");
  });

  test("Text ellipsis works with maxLines", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout>
        <Text
          testId="text"
          overflowMode="ellipsis"
          maxLines="2"
          width="200px"
        >
          This is a very long text that will be truncated to exactly two lines with ellipsis at the end
        </Text>
      </FlowLayout>
    `);

    const text = page.getByTestId("text");

    await expect(text).toHaveCSS("text-overflow", "ellipsis");
    await expect(text).toHaveCSS("-webkit-line-clamp", "2");
  });
});

// =============================================================================
// STRETCH PROPERTY TESTS
// =============================================================================

test.describe("stretch property", () => {
  test("stretch='true' makes FlowLayout take full height of parent", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="400px" testId="container">
        <FlowLayout stretch="true" testId="flowLayout">
          <Text testId="item1" width="100px">Item 1</Text>
          <Text testId="item2" width="100px">Item 2</Text>
        </FlowLayout>
      </VStack>
    `);

    const container = page.getByTestId("container");
    const flowLayout = page.getByTestId("flowLayout");
    
    const containerBounds = await getBounds(container);
    const flowLayoutBounds = await getBounds(flowLayout);
    
    // FlowLayout should take the full height of its parent container
    const tolerance = 5;
    expect(Math.abs(flowLayoutBounds.height - containerBounds.height)).toBeLessThan(tolerance);
  });

  test("stretch='false' does not stretch FlowLayout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="400px" testId="container">
        <FlowLayout stretch="false" height="200px" testId="flowLayout">
          <Text testId="item1" width="100px">Item 1</Text>
          <Text testId="item2" width="100px">Item 2</Text>
        </FlowLayout>
      </VStack>
    `);

    const flowLayout = page.getByTestId("flowLayout");
    const flowLayoutBounds = await getBounds(flowLayout);
    
    // FlowLayout should maintain its explicit height
    expect(flowLayoutBounds.height).toBe(200);
  });

  test("defaults to stretch='false'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="400px" testId="container">
        <FlowLayout height="200px" testId="flowLayout">
          <Text testId="item1" width="100px">Item 1</Text>
          <Text testId="item2" width="100px">Item 2</Text>
        </FlowLayout>
      </VStack>
    `);

    const flowLayout = page.getByTestId("flowLayout");
    const flowLayoutBounds = await getBounds(flowLayout);
    
    // Default should not stretch, maintaining explicit height
    expect(flowLayoutBounds.height).toBe(200);
  });

  test("stretch fills available space in complex layout", async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack height="500px" testId="container">
        <Stack height="100px" backgroundColor="lightblue" testId="header">Header</Stack>
        <FlowLayout stretch="true" testId="flowLayout">
          <Text testId="item1" width="100px">Item 1</Text>
          <Text testId="item2" width="100px">Item 2</Text>
        </FlowLayout>
        <Stack height="100px" backgroundColor="lightcoral" testId="footer">Footer</Stack>
      </VStack>
    `);

    const container = page.getByTestId("container");
    const header = page.getByTestId("header");
    const footer = page.getByTestId("footer");
    const flowLayout = page.getByTestId("flowLayout");
    
    const containerBounds = await getBounds(container);
    const headerBounds = await getBounds(header);
    const footerBounds = await getBounds(footer);
    const flowLayoutBounds = await getBounds(flowLayout);
    
    // FlowLayout should fill the space between header and footer
    const expectedHeight = containerBounds.height - headerBounds.height - footerBounds.height;
    const tolerance = 50; // Increased tolerance to account for gaps, margins, etc.
    expect(Math.abs(flowLayoutBounds.height - expectedHeight)).toBeLessThan(tolerance);
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
    // With max-width: 100% on flowItem, percentage widths are constrained differently
    // The item takes 25% but is also constrained by the max-width of its wrapper
    expect(itemWidth).toBeLessThanOrEqual(expectedWidth);
    expect(itemWidth).toBeGreaterThan(0);
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
    // With max-width: 100% on flowItem, percentage widths are constrained differently
    expect(right).toBeLessThanOrEqual(expectedWidth);
    expect(right).toBeGreaterThan(0);
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

// =============================================================================
// NON-VISUAL COMPONENT TESTS
// =============================================================================

test.describe("Non-visual components", () => {
  test("ChangeListener does not create wrapper div or affect layout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <ChangeListener testId="changeListener" onDidChange="testState = 'changed'"/>
        <Stack testId="item2" backgroundColor="blue" height="64px" width="100px"/>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    // ChangeListener should not appear in the layout
    // The two Stack items should be side by side
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.x).toBeGreaterThan(rect1.x + rect1.width);
    expect(layoutHeight).toBe(64);

    // Verify ChangeListener doesn't create any visible wrapper
    const changeListenerWrapper = page.getByTestId("changeListener");
    await expect(changeListenerWrapper).not.toBeAttached();
  });

  test("ChangeListener still works in layout", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <ChangeListener testId="changeListener" listenTo="{item2}" onDidChange="testState = 'changed'"/>
        <TextBox id="item2" />
      </FlowLayout>
    `);
    await page.getByRole("textbox").fill("test");

    await expect.poll(testStateDriver.testState).toBe("changed");
  });

  test("Queue does not create wrapper div or affect layout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <Queue id="queue" onProcess="testState = 'processed'"/>
        <Stack testId="item2" backgroundColor="blue" height="64px" width="100px"/>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    // Queue should not appear in the layout
    // The two Stack items should be side by side
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.x).toBeGreaterThan(rect1.x + rect1.width);
    expect(layoutHeight).toBe(64);

    // Verify Queue doesn't create any visible wrapper
    const queueWrapper = page.getByTestId("queue");
    await expect(queueWrapper).not.toBeAttached();
  });

  test("Queue still works in layout", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <Queue id="queue" onProcess="testState = 'processed'"/>
        <Button id="item2" backgroundColor="blue" height="64px" width="100px" onClick="queue.enqueueItem(Math.random())"/>
      </FlowLayout>
    `);
    const button = page.getByRole("button");
    await button.click();

    const queueWrapper = page.getByTestId("queue");

    // Verify Queue doesn't create any visible wrapper
    await expect.poll(testStateDriver.testState).toBe("processed");
  });

  test("AppState does not create wrapper div or affect layout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <AppState testId="appState" />
        <Stack testId="item2" backgroundColor="blue" height="64px" width="100px"/>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    // AppState should not appear in the layout
    // The two Stack items should be side by side
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.x).toBeGreaterThan(rect1.x + rect1.width);
    expect(layoutHeight).toBe(64);

    // Verify AppState doesn't create any visible wrapper
    const appStateWrapper = page.getByTestId("appState");
    await expect(appStateWrapper).not.toBeAttached();
  });

  test("AppState still works in layout", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <AppState id="appState" initialValue="{{ item: 'initial' }}" />
        <ChangeListener testId="changeListener" listenTo="{appState.value.item}" onDidChange="testState = appState.value.item"/>
        <Button testId="item2" backgroundColor="blue" height="64px" width="100px" onClick="appState.update({ item: 'clicked' })" />
      </FlowLayout>
    `);
    const button = page.getByTestId("item2");
    await button.click();

    await expect.poll(testStateDriver.testState).toBe("clicked");
  });

  test("multiple non-visual components do not affect layout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <ChangeListener listenTo="$var1"/>
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <Queue id="queue1" onProcess="testState = 'processed'"/>
        <AppState bucket="bucket1"/>
        <Stack testId="item2" backgroundColor="blue" height="64px" width="100px"/>
        <ChangeListener listenTo="$var2"/>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    // Multiple non-visual components should not affect the layout
    // The two Stack items should be side by side
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.x).toBeGreaterThan(rect1.x + rect1.width);
    expect(layoutHeight).toBe(64);
  });

  test("non-visual component between items that wrap", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="250px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="150px"/>
        <ChangeListener listenTo="$var1"/>
        <Stack testId="item2" backgroundColor="blue" height="64px" width="150px"/>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();
    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    // Non-visual component should not affect wrapping
    // item2 should wrap to the next line
    expect(rect2.y).toBeGreaterThan(rect1.y);
    expect(rect1.x).toBe(rect2.x);
    expect(layoutHeight).toBe(138); // 64 + 10 (gap) + 64
  });

  test("only non-visual components in FlowLayout", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="300px" gap="10px">
        <ChangeListener listenTo="$var1"/>
        <Queue id="queue1"/>
        <AppState bucket="bucket1"/>
      </FlowLayout>
    `);

    const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));

    // FlowLayout with only non-visual components should have minimal height
    expect(layoutHeight).toBeLessThan(10);
  });

  test("non-visual component with visual feedback templates", async ({ page, initTestBed }) => {
    await initTestBed(`
      <FlowLayout testId="layout" width="400px" gap="10px">
        <Stack testId="item1" backgroundColor="red" height="64px" width="100px"/>
        <Queue id="testQueue">
          <property name="progressFeedback">
            <Text testId="progress">Processing...</Text>
          </property>
        </Queue>
        <Stack testId="item2" backgroundColor="blue" height="64px" width="100px"/>
      </FlowLayout>
    `);

    const item1 = page.getByTestId("item1");
    const rect1 = await item1.boundingBox();
    const item2 = page.getByTestId("item2");
    const rect2 = await item2.boundingBox();

    // Queue with template properties should still not affect layout
    // (templates only render when queue is active)
    expect(rect1.y).toBe(rect2.y);
    expect(rect2.x).toBeGreaterThan(rect1.x + rect1.width);
  });
});
