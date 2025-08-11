import { getBounds, overflows, scaleByPercent } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic functionality", () => {
  test.skip("component renders with default props", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </FlowLayout>
  `,
      {},
    );

    // Check that the component is visible
    await expect(page.locator(".flow-layout")).toBeVisible();

    // Check that children are rendered
    await expect(page.locator("text=Item 1")).toBeVisible();
    await expect(page.locator("text=Item 2")).toBeVisible();
    await expect(page.locator("text=Item 3")).toBeVisible();
  });

  test.skip("component wraps items when they exceed container width", async ({
    page,
    initTestBed,
  }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout style="width: 200px">
      <Text style="width: 100px">Item 1</Text>
      <Text style="width: 100px">Item 2</Text>
      <Text style="width: 100px">Item 3</Text>
    </FlowLayout>
  `,
      {},
    );

    // Check that Item 1 and Item 2 are on the same row
    const item1Bounds = await page.locator("text=Item 1").boundingBox();
    const item2Bounds = await page.locator("text=Item 2").boundingBox();
    const item3Bounds = await page.locator("text=Item 3").boundingBox();

    expect(item1Bounds.y).toBeCloseTo(item2Bounds.y, 0);
    expect(item3Bounds.y).toBeGreaterThan(item1Bounds.y);
  });

  test.skip("component applies gap correctly", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout gap="20px">
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </FlowLayout>
  `,
      {},
    );

    // Get the bounding boxes of adjacent items
    const item1Bounds = await page.locator("text=Item 1").boundingBox();
    const item2Bounds = await page.locator("text=Item 2").boundingBox();

    // Check that the horizontal gap is approximately 20px
    const horizontalGap = item2Bounds.x - (item1Bounds.x + item1Bounds.width);
    expect(horizontalGap).toBeCloseTo(20, 0);
  });

  test.skip("component applies columnGap and rowGap correctly", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout columnGap="30px" rowGap="40px" style="width: 200px">
      <Text style="width: 100px">Item 1</Text>
      <Text style="width: 100px">Item 2</Text>
      <Text style="width: 100px">Item 3</Text>
    </FlowLayout>
  `,
      {},
    );

    // Get the bounding boxes
    const item1Bounds = await page.locator("text=Item 1").boundingBox();
    const item2Bounds = await page.locator("text=Item 2").boundingBox();
    const item3Bounds = await page.locator("text=Item 3").boundingBox();

    // Check that the horizontal gap is approximately 30px
    const horizontalGap = item2Bounds.x - (item1Bounds.x + item1Bounds.width);
    expect(horizontalGap).toBeCloseTo(30, 0);

    // Check that the vertical gap is approximately 40px
    const verticalGap = item3Bounds.y - (item1Bounds.y + item1Bounds.height);
    expect(verticalGap).toBeCloseTo(40, 0);
  });

  test.skip("component applies theme variables correctly", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </FlowLayout>
  `,
      {
        testThemeVars: {
          "backgroundColor-FlowLayout": "rgb(240, 240, 240)",
          "padding-FlowLayout": "20px",
        },
      },
    );

    // Check that theme variables are applied
    await expect(page.locator(".flow-layout")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    await expect(page.locator(".flow-layout")).toHaveCSS("padding", "20px");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility tests", () => {
  test.skip("component has correct accessibility attributes", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </FlowLayout>
  `,
      {},
    );

    // Check that the component has the correct role
    await expect(page.locator(".flow-layout")).toHaveAttribute("role", "group");
  });

  test.skip("component is not focusable", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </FlowLayout>
  `,
      {},
    );

    // Flow layout should not be focusable as it's a container
    const tabIndex = await page.locator(".flow-layout").getAttribute("tabindex");
    expect(tabIndex).not.toBe("0");

    await page.locator(".flow-layout").focus();
    await expect(page.locator(".flow-layout")).not.toBeFocused();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge cases", () => {
  test.skip("component handles empty content gracefully", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(`<FlowLayout></FlowLayout>`, {});

    // Component should still render even without children
    await expect(page.locator(".flow-layout")).toBeVisible();
  });

  test.skip("component handles FlowItemBreak component", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
      <FlowLayout>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <FlowItemBreak />
        <Text>Item 3</Text>
      </FlowLayout>
    `,
      {},
    );

    // Get the bounding boxes
    const item1Bounds = await page.locator("text=Item 1").boundingBox();
    const item2Bounds = await page.locator("text=Item 2").boundingBox();
    const item3Bounds = await page.locator("text=Item 3").boundingBox();

    // Items 1 and 2 should be on the same row
    expect(item1Bounds.y).toBeCloseTo(item2Bounds.y, 0);

    // Item 3 should be on a new row due to FlowItemBreak
    expect(item3Bounds.y).toBeGreaterThan(item1Bounds.y);
  });

  test.skip("component handles very long items correctly", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(`
      <FlowLayout style="width: 200px">
        <Text>This is a very long item that should wrap to the next line because it's too long</Text>
        <Text>Short item</Text>
      </FlowLayout>
    `);

    // The long item should be on its own line
    const longItemBounds = await page.locator("text=This is a very long item").boundingBox();
    const shortItemBounds = await page.locator("text=Short item").boundingBox();

    // Short item should be on a different row than long item
    expect(shortItemBounds.y).toBeGreaterThan(longItemBounds.y);
  });

  test.skip("can render empty", async ({ page, initTestBed }) => {
    await initTestBed(`<FlowLayout testId="layout"></FlowLayout>`);
    await expect(page.getByTestId("layout")).toBeAttached();
    await expect(page.getByTestId("layout")).toBeEmpty();
  });

  const PAGE_WIDTH = 1280;

  // width should be exactly what the user sets
  test.skip("1 item 25% width", async ({ page, initTestBed }) => {
    const itemHeight = "64px";
    const itemWidthPercent = "25%";
    await initTestBed(`
      <FlowLayout width="${PAGE_WIDTH}">
        <Stack testId="item" backgroundColor="red" height="${itemHeight}" width="${itemWidthPercent}"/>
      </FlowLayout>
    `);
    const expectedWidth = scaleByPercent(PAGE_WIDTH, itemWidthPercent);
    const { width: itemWidth } = await getBounds(page.getByTestId("item"));
    expect(itemWidth).toEqual(expectedWidth);
  });

  // gap should be ignored because of 1 item
  test.skip("1 item 25% width + gap", async ({ page, initTestBed }) => {
    const itemHeight = "64px";
    const itemWidthPercent = "25%";
    const gap = "26px";
    await initTestBed(`
      <FlowLayout gap="${gap}" width="${PAGE_WIDTH}">
        <Stack testId="item" backgroundColor="red" height="${itemHeight}" width="${itemWidthPercent}"/>
      </FlowLayout>
    `);

    const { right } = await getBounds(page.getByTestId("item"));
    const expectedWidth = scaleByPercent(PAGE_WIDTH, itemWidthPercent);
    expect(right).toEqual(expectedWidth);
  });

  // gap should be ignored because of 1 item
  test.skip("1 item 100% width + gap", async ({ page, initTestBed }) => {
    const itemHeight = "64px";
    const itemWidthPercent = "100%";
    const gap = "26px";

    await initTestBed(`
      <FlowLayout gap="${gap}" width="${PAGE_WIDTH}">
        <Stack testId="item" backgroundColor="red" height="${itemHeight}" width="${itemWidthPercent}"/>
      </FlowLayout>
    `);
    const { width } = await getBounds(page.getByTestId("item"));
    const expectedWidth = PAGE_WIDTH;
    expect(width).toEqual(expectedWidth);
  });

  test.skip("4 item 25% width", async ({ page, initTestBed }) => {
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

  test.skip("3 item 25% width, 1 item 25.1% wraps", async ({ page, initTestBed }) => {
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
  test.skip("wrap with gaps", async ({ page, initTestBed }) => {
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

  test.skip("item with * width fills row", async ({ page, initTestBed }) => {
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
  test.skip("wrap with rowGap", async ({ page, initTestBed }) => {
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

  // columnGap applies when wrapping
  test.skip("wrap with columnGap", async ({ page, initTestBed }) => {
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
  test.skip("columnGap & rowGap overrules gap", async ({ page, initTestBed }) => {
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
  test.skip("no wrap from gap, border, margin", async ({ page, initTestBed }) => {
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
  test.skip("no horizontal overflow", async ({ page, initTestBed }) => {
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
  test.skip("SpaceFiller adds line break", async ({ page, initTestBed }) => {
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
  test.skip("scrollbar on overflow Y", async ({ page, initTestBed }) => {
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
  test.skip("scrollbar on overflow Y multi items", async ({ page, initTestBed }) => {
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

  test.skip("multiple star sized next to each other doesn't break", async ({
    page,
    initTestBed,
  }) => {
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

  test.skip("SpaceFiller breaks star sized items", async ({ page, initTestBed }) => {
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

  test.skip("boxShadow is not clipped", async ({ page, initTestBed }) => {
    await initTestBed(`
    <CHStack height="300px">
      <FlowLayout testId="layout" width="500px" gap="10px">
        <Stack height="50px" boxShadow="orangered 0px 0px 0px 100px"/>
      </FlowLayout>
    </CHStack>
    `);
    await expect(page).toHaveScreenshot();
  });

  // TODO: Review how to handle compound components in tests
  // test("with compound components", async ({ page, initTestBed }) => {
  //   const itemHeight = 128;

  //   const itemWidth = PAGE_WIDTH / 4;
  //   const gap = 10;
  //   await initTestBed(`
  //     <FlowLayout gap="${gap}px" testId="layout" width="${PAGE_WIDTH}px">
  //       <InfoCard testId="item1" width="${itemWidth}px"/>
  //       <InfoCard testId="item2" width="${itemWidth}px"/>
  //       <InfoCard testId="item3" width="${itemWidth}px"/>
  //       <InfoCard testId="item4" width="${itemWidth}px"/>
  //     </FlowLayout>
  //   `, {
  //     components: [
  //       {
  //         `
  //           <Component name="InfoCard">
  //             <Stack backgroundColor="red" height="${itemHeight}px"/>
  //           </Component>
  //         `
  //       }
  //     ],
  //   });

  //   const { left: item2Left } = await getBounds(page.getByTestId("item2"));
  //   const expectedItem2Left = itemWidth + gap;

  //   const { height: layoutHeight } = await getBounds(page.getByTestId("layout"));
  //   const expectedLayoutHeight = itemHeight + gap + itemHeight;

  //   expect(item2Left).toEqual(expectedItem2Left);
  //   expect(layoutHeight).toEqual(expectedLayoutHeight);
  // });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance tests", () => {
  test.skip("component handles many items efficiently", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    // Create a FlowLayout with many items
    const manyItems = Array(50)
      .fill(0)
      .map((_, i) => `<Text>Item ${i}</Text>`)
      .join("");

    await initTestBed(
      `
    <FlowLayout>
      ${manyItems}
    </FlowLayout>
  `,
      {},
    );

    // Check that all items are rendered
    await expect(page.locator("text=Item 0")).toBeVisible();
    await expect(page.locator("text=Item 49")).toBeVisible();

    // Component should still be responsive
    await expect(page.locator(".flow-layout")).toBeVisible();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration tests", () => {
  test.skip("component works correctly with different child component types", async ({
    page,
    initTestBed,
  }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <FlowLayout>
      <Text>Text Item</Text>
      <Button>Button Item</Button>
      <Icon name="star" />
      <Image src="placeholder.png" alt="Placeholder" />
    </FlowLayout>
  `,
      {},
    );

    // Check that all different component types are rendered
    await expect(page.locator("text=Text Item")).toBeVisible();
    await expect(page.locator("button")).toBeVisible();
    await expect(page.locator("svg")).toBeVisible();
    await expect(page.locator("img")).toBeVisible();
  });

  test.skip("component works within a scroll container", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <ScrollView style="height: 100px; overflow: auto;">
      <FlowLayout>
        ${Array(20)
          .fill(0)
          .map((_, i) => `<Text>Item ${i}</Text>`)
          .join("")}
      </FlowLayout>
    </ScrollView>
  `,
      {},
    );

    // First items should be visible
    await expect(page.locator("text=Item 0")).toBeVisible();

    // Scroll to the bottom
    await page.locator(".scroll-view").evaluate((el) => (el.scrollTop = el.scrollHeight));

    // Last items should now be visible
    await expect(page.locator("text=Item 19")).toBeVisible();
  });
});
