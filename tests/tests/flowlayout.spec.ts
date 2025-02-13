import { expect, test } from "./fixtures";
import {
  getFullRectangle,
  initApp,
  isElementOverflown,
  scalePercentBy,
} from "./component-test-helpers";

const PAGE_WIDTH = 1280;
const PAGE_HEIGHT = 720;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

test("can render empty", async ({ page }) => {
  const entryPoint = `
  <FlowLayout testId="layout">
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("layout")).toBeAttached();
  await expect(page.getByTestId("layout")).toBeEmpty();
});

// width should be exactly what the user sets
test("1 item 25% width", async ({ page }) => {
  const itemHeight = "64px";
  const itemWidthPercent = "25%";
  const entryPoint = `
  <FlowLayout width="${PAGE_WIDTH}">
    <Stack testId="item" backgroundColor="red" height="${itemHeight}" width="${itemWidthPercent}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const expectedWidth = scalePercentBy(PAGE_WIDTH, itemWidthPercent);
  const { width: itemWidth } = await getFullRectangle(page.getByTestId("item"));

  expect(itemWidth).toEqual(expectedWidth);
});

// gap should be ignored because of 1 item
test("1 item 25% width + gap", async ({ page }) => {
  const itemHeight = "64px";
  const itemWidthPercent = "25%";
  const gap = "26px";

  const entryPoint = `
  <FlowLayout gap="${gap}" width="${PAGE_WIDTH}">
    <Stack testId="item" backgroundColor="red" height="${itemHeight}" width="${itemWidthPercent}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { right: itemRight } = await getFullRectangle(page.getByTestId("item"));
  const expectedWidth = scalePercentBy(PAGE_WIDTH, itemWidthPercent);

  expect(itemRight).toEqual(expectedWidth);
});

// gap should be ignored because of 1 item
test("1 item 100% width + gap", async ({ page }) => {
  const itemHeight = "64px";
  const itemWidthPercent = "100%";
  const gap = "26px";
  const entryPoint = `
  <FlowLayout gap="${gap}" width="${PAGE_WIDTH}">
    <Stack testId="item" backgroundColor="red" height="${itemHeight}" width="${itemWidthPercent}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { width: itemWidth } = await getFullRectangle(page.getByTestId("item"));
  const expectedWidth = PAGE_WIDTH;

  expect(itemWidth).toEqual(expectedWidth);
});

test("4 item 25% width", async ({ page }) => {
  const layoutWidth = "400px";
  const itemWidthPercent = "25%";
  const itemHeight = 64;
  const entryPoint = `
  <FlowLayout testId="layout" width="${layoutWidth}" backgroundColor="cyan">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercent}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });
  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));

  expect(layoutHeight).toEqual(itemHeight);
});

test("3 item 25% width, 1 item 25.1% wraps", async ({ page }) => {
  const itemHeight = 64;
  const itemWidthPercent = "25%";
  const itemWidthPercentBigger = "25.1%";

  const entryPoint = `
  <FlowLayout testId="layout" width="${PAGE_WIDTH}" gap="0">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercentBigger}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const expectedHeight = itemHeight * 2;

  expect(layoutHeight).toEqual(expectedHeight);
});

// When gap is specified and wrapping, a horizontal gap is applied
test("wrap with gaps", async ({ page }) => {
  const layoutWidth = 400;
  const itemWidthPercent = "25%";
  const itemWidthPercentBigger = "25.1%";
  const itemHeight = 64;
  const gap = 20;
  const entryPoint = `
  <FlowLayout testId="layout" width="${layoutWidth}px" backgroundColor="cyan" gap="${gap}px">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercentBigger}"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercent}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const expectedHeight = gap + itemHeight * 2;

  expect(layoutHeight).toEqual(expectedHeight);
});

test("item with * width fills row", async ({ page }) => {
  const itemHeight = 64;
  const itemWidth = "*";
  const entryPoint = `
  <FlowLayout testId="layout">
    <Stack backgroundColor="red" height="${itemHeight}px" width="50"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="50"/>
    <Stack testId="item2" backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}"/>
  </FlowLayout>
  `;
  await initApp(page, {
    entryPoint,
  });

  const { height: layoutHeight, right: layoutRight } = await getFullRectangle(page.getByTestId("layout"));
  const { right: starItemRight } = await getFullRectangle(page.getByTestId("item2"));

  expect(layoutHeight).toEqual(itemHeight);
  expect(layoutRight).toEqual(starItemRight);
});

// rowGap applies when wrapping
test("wrap with rowGap", async ({ page }) => {
  const itemHeight = 64;
  const itemWidthPercent = "50%";
  const rowGap = 24;

  const entryPoint = `
  <FlowLayout testId="layout" rowGap="${rowGap}px">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidthPercent}"/>
    <Stack backgroundColor="yellow" height="${itemHeight}px" width="${itemWidthPercent}"/>
  </FlowLayout>
  `;
  await initApp(page, {
    entryPoint,
  });

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const expectedHeight = itemHeight * 2 + rowGap;

  expect(layoutHeight).toEqual(expectedHeight);
});

// columnGap applies when wrapping
test("wrap with columnGap", async ({ page }) => {
  const itemWidth = 200;
  const columnGap = 24;
  const layoutWidth = itemWidth + columnGap + itemWidth;
  const itemHeight = 64;

  const entryPoint = `
  <FlowLayout testId="layout" width="${layoutWidth}px" columnGap="${columnGap}px">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack backgroundColor="yellow" testId="item3" height="${itemHeight}px" width="${itemWidth}px"/>
  </FlowLayout>
  `;
  await initApp(page, {
    entryPoint,
  });

  const { left: item3Left } = await getFullRectangle(page.getByTestId("item3"));
  const expectedItem3Left = itemWidth + columnGap;

  expect(item3Left).toEqual(expectedItem3Left);
});

// wrapping: columnGap & rowGap overrules gap prop
test("columnGap & rowGap overrules gap", async ({ page }) => {
  const itemWidth = 200;
  const columnGap = 24;
  const layoutWidth = itemWidth + columnGap + itemWidth;
  const itemHeight = 64;
  const rowGap = 24;
  const gap = 5;

  const entryPoint = `
  <FlowLayout testId="layout" width="${layoutWidth}px" gap="${gap}px" columnGap="${columnGap}px" rowGap="${rowGap}px">
    <Stack testId="item0" backgroundColor="red" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack testId="item1" backgroundColor="green" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack testId="item2" backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}px"/>
    <Stack testId="item3" backgroundColor="yellow" height="${itemHeight}px" width="${itemWidth}px"/>
  </FlowLayout>
  `;
  await initApp(page, {
    entryPoint,
  });

  const { left: item3Left } = await getFullRectangle(page.getByTestId("item3"));
  const expectedItem3Left = itemWidth + columnGap;

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const expectedLayoutHeight = itemHeight + rowGap + itemHeight;

  expect(item3Left).toEqual(expectedItem3Left);
  expect(layoutHeight).toEqual(expectedLayoutHeight);
});

// 4 items with 25% each perfectly fit in one row
// gaps, borders, margins don't count when breaking into new lines
test("no wrap from gap, border, margin", async ({ page }) => {
  const itemHeight = 64;
  const width = "25%";
  const marginInline = 100;

  const entryPoint = `
  <FlowLayout testId="layout" gap="26px" >
    <Stack testId="item0" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="red" height="${itemHeight}px" width="${width}px"/>
    <Stack testId="item1" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="green" height="${itemHeight}px" width="${width}px"/>
    <Stack testId="item2" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="blue" height="${itemHeight}px" width="${width}px"/>
    <Stack testId="item3" border="solid 6px black" marginRight="${marginInline}px" marginLeft="${marginInline}px" backgroundColor="yellow" height="${itemHeight}px" width="${width}px"/>
  </FlowLayout>
  `;
  await initApp(page, {
    entryPoint,
  });
  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));

  expect(layoutHeight).toEqual(itemHeight);
});

// Elements will cap at 100% width
test("no horizontal overflow", async ({ page }) => {
  const itemHeight = 64;
  const bigWidths = { percent: "120%", px: "1000000000px", em: "1000000000em" };
  const entryPoint = `
  <FlowLayout testId="layout" gap="0">
    <Stack testId="item0" border="solid 6px black" backgroundColor="red" height="${itemHeight}px" width="${bigWidths.percent}"/>
    <Stack testId="item1" border="solid 6px black" backgroundColor="green" height="${itemHeight}px" width="${bigWidths.px}"/>
    <Stack testId="item2" border="solid 6px black" backgroundColor="blue" height="${itemHeight}px" width="${bigWidths.em}"/>
  </FlowLayout>
  `;
  await initApp(page, {
    entryPoint,
  });

  const isOverflownItem0 = await isElementOverflown(page.getByTestId("item0"), "x");
  const isOverflownItem1 = await isElementOverflown(page.getByTestId("item1"), "x");
  const isOverflownItem2 = await isElementOverflown(page.getByTestId("item2"), "x");
  const {height: layoutHeight} = await getFullRectangle(page.getByTestId("layout"));
  const expectedLayoutHeight = itemHeight * 3

  expect(isOverflownItem0).toStrictEqual(false);
  expect(isOverflownItem1).toStrictEqual(false);
  expect(isOverflownItem2).toStrictEqual(false);
  expect(layoutHeight).toEqual(expectedLayoutHeight);
});

// SpaceFillers can be used to break into new lines
test("SpaceFiller adds line break", async ({ page }) => {
  const itemHeight = 64;
  const itemWidth = "20%";

  const entryPoint = `
  <FlowLayout testId="layout" gap="0">
    <Stack backgroundColor="red" height="${itemHeight}px" width="${itemWidth}"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" width="${itemWidth}"/>
    <SpaceFiller/>
    <Stack backgroundColor="green" height="${itemHeight}px" width="${itemWidth}"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const expectedHeight = 2* itemHeight;
  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));

  expect(layoutHeight).toEqual(expectedHeight);
});

// The layout properly handles overflow on the Y axis
// The scrollbar must not overlap the rightmost element
test("scrollbar on overflow Y", async ({ page }) => {
  const itemHeight = 128;
  const entryPoint = `
  <FlowLayout testId="layout" height="100px" columnGap="10px" verticalOverflow="auto">
    <Stack backgroundColor="red" height="${itemHeight}px" border="solid 8px black"/>
    <Stack backgroundColor="blue" height="${itemHeight}px"/>
    <Stack backgroundColor="green" height="${itemHeight}px"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const result = await isElementOverflown(page.getByTestId("layout"), "y");

  expect(result).toEqual(true);
});

// The layout properly handles overflow on the Y axis
// The scrollbar must not overlap the rightmost element
test("scrollbar on overflow Y multi items", async ({ page }) => {
  const itemHeight = 128;
  const entryPoint = `
  <FlowLayout testId="layout" height="100px" verticalOverflow="auto">
    <Stack backgroundColor="red" height="${itemHeight}px" border="solid 8px black" width="50%"/>
    <Stack backgroundColor="blue" height="${itemHeight}px" border="solid 8px black" width="50%"/>
    <Stack backgroundColor="green" height="${itemHeight}px"/>
  </FlowLayout>
  `;

  await initApp(page, {
    entryPoint,
  });

  const result = await isElementOverflown(page.getByTestId("layout"), "y");

  expect(result).toEqual(true);
});

test("multiple star sized next to each other doesn't break", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <FlowLayout testId="layout" width="100px" columnGap="10px">
      <Stack testId="red" backgroundColor="red" height="10px" width="20px"/>
      <Stack testId="green" backgroundColor="green" height="10px" width="*"/>
      <Stack testId="blue" backgroundColor="blue" height="10px" width="2*"/>
    </FlowLayout>`
  });

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const { width: redWidth } = await getFullRectangle(page.getByTestId("red"));
  const { width: greenWidth } = await getFullRectangle(page.getByTestId("green"));
  const { width: blueWidth } = await getFullRectangle(page.getByTestId("blue"));

  // red: 20px | 10px gap | green: 20px | 10px gap | blue: 40px
  expect(layoutHeight).toEqual(10);
  expect(redWidth).toEqual(20);
  expect(greenWidth).toEqual(20);
  expect(blueWidth).toEqual(40);
});

test("SpaceFiller breaks star sized items", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
    <FlowLayout testId="layout" width="100px" gap="10px">
      <Stack testId="red" backgroundColor="red" height="10px" width="20px"/>
      <Stack testId="green" backgroundColor="green" height="10px" width="*"/>
      <SpaceFiller/>
      <Stack testId="blue" backgroundColor="blue" height="10px" width="2*"/>
    </FlowLayout>`
  });

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const { width: redWidth } = await getFullRectangle(page.getByTestId("red"));
  const { width: greenWidth } = await getFullRectangle(page.getByTestId("green"));
  const { width: blueWidth } = await getFullRectangle(page.getByTestId("blue"));

  // red: 20px | 10px gap | green: 70px
  // gap 10px
  // blue: 100px
  expect(layoutHeight).toEqual(30);
  expect(redWidth).toEqual(20);
  expect(greenWidth).toEqual(70);
  expect(blueWidth).toEqual(100);
});

test("shadow is not clipped", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await initApp(page, {
    entryPoint: `
    <CHStack height="300px">
      <FlowLayout testId="layout" width="500px" gap="10px">
        <Stack height="50px" shadow="orangered 0px 0px 0px 100px"/>
      </FlowLayout>
    </CHStack>
    `
  });
  await expect(page).toHaveScreenshot();
});

test("with compound components", async ({ page }) => {
  const itemHeight = 128;

  const itemWidth = PAGE_WIDTH / 4;
  const gap = 10;
  await initApp(page, {
    entryPoint: `
      <FlowLayout gap="${gap}px" testId="layout" width="${PAGE_WIDTH}px">
        <InfoCard testId="item1" width="${itemWidth}px"/>
        <InfoCard testId="item2" width="${itemWidth}px"/>
        <InfoCard testId="item3" width="${itemWidth}px"/>
        <InfoCard testId="item4" width="${itemWidth}px"/>
      </FlowLayout>
    `,
    components: `
      <Component name="InfoCard">
        <Stack backgroundColor="red" height="${itemHeight}px"/>
      </Component>
    `
  });

  const { left: item2Left } = await getFullRectangle(page.getByTestId("item2"));
  const expectedItem2Left = itemWidth + gap;

  const { height: layoutHeight } = await getFullRectangle(page.getByTestId("layout"));
  const expectedLayoutHeight = itemHeight + gap + itemHeight;

  expect(item2Left).toEqual(expectedItem2Left);
  expect(layoutHeight).toEqual(expectedLayoutHeight);
});
