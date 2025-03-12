import { expect, test } from "./fixtures";
import { getBoundingRect, initApp, initThemedApp } from "./component-test-helpers";

const PAGE_WIDTH = 1280;
const PAGE_HEIGHT = 720;

test("can render", async ({ page }) => {
  const entryPoint = `<ContentSeparator testId="separator" />`;

  await initApp(page, { entryPoint });

  await expect(page.getByTestId("separator")).toBeAttached();
});

// orientation is applied and the dimensions reflect this in a vacuum
test(`orientation: horizontal in VStack with width`, async ({ page }) => {
  const expectedWidthPx = 300;

  await initApp(page, {
    entryPoint: `
      <VStack width="${expectedWidthPx}px">
        <ContentSeparator testId="separator" orientation="horizontal" />
      </VStack>`,
  });

  const separator = page.getByTestId("separator");
  const { width } = await getBoundingRect(separator);

  expect(width).toEqualWithTolerance(expectedWidthPx);
});

test(`orientation: horizontal in VStack`, async ({ page }) => {
  const expectedWidthPx = PAGE_WIDTH;
  page.setViewportSize({ width: expectedWidthPx, height: PAGE_HEIGHT });

  await initApp(page, {
    entryPoint: `
      <VStack>
        <ContentSeparator testId="separator" orientation="horizontal" />
      </VStack>`,
  });

  const separator = page.getByTestId("separator");
  const { width } = await getBoundingRect(separator);

  expect(width).toEqualWithTolerance(expectedWidthPx);
});

test(`orientation: vertical in HStack with height`, async ({ page }) => {
  const expectedHeightPx = 300;

  await initApp(page, {
    entryPoint: `
      <HStack height="${expectedHeightPx}px">
        <ContentSeparator testId="separator" orientation="vertical" />
      </HStack>`,
  });

  const separator = page.getByTestId("separator");
  const { height } = await getBoundingRect(separator);

  expect(height).toEqualWithTolerance(expectedHeightPx);
});

// Vertical ContentSeparator without a parent with explicit height has no height
test(`orientation: vertical in HStack`, async ({ page }) => {
  const expectedHeightPx = 0;

  await initApp(page, {
    entryPoint: `
      <HStack>
        <ContentSeparator testId="separator" orientation="vertical" />
      </HStack>`,
  });

  const separator = page.getByTestId("separator");
  const { height } = await getBoundingRect(separator);

  expect(height).toEqualWithTolerance(expectedHeightPx);
});

test(`size`, async ({ page }) => {
  const expectedSizePx = 10;

  await initApp(page, {
    entryPoint: `
      <VStack>
        <ContentSeparator testId="separator" orientation="horizontal" size="${expectedSizePx}px" />
      </VStack>`,
  });

  const separator = page.getByTestId("separator");
  const { height } = await getBoundingRect(separator);

  expect(height).toEqualWithTolerance(expectedSizePx);
});

test(`vertical orientation with siblings in HStack`, async ({ page }) => {
  const expectedWidthPx = 4;

  await initApp(page, {
    entryPoint: `
    <HStack gap="0.5rem" height="120">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      
      <ContentSeparator testId="separator" orientation="vertical" size="${expectedWidthPx}px" backgroundColor="red" />
      
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem
      accusantium doloremque laudantium, totam rem aperiam,
      eaque ipsa quae ab illo inventore veritatis et quasi architecto
      beatae vitae dicta sunt explicabo.
    </HStack>`,
  });

  const separator = page.getByTestId("separator");
  const { width } = await getBoundingRect(separator);

  expect(width).toEqualWithTolerance(expectedWidthPx);
});

// Vertical ContentSeparator in a FlowLayout issues:
// - If no width % is set for the items, the separator will not be displayed unless given an explicit height
// - If a width % is set for at least two items including the separator, it will occupy all of the space given to it in the width property
//   (makes it too wide)
test.fixme(`vertical in FlowLayout`, async ({ page }) => {
  const expectedSizePx = 10;

  await initApp(page, {
    entryPoint: `
      <FlowLayout>
        <Text width="30%">Hello There!</Text>
        <ContentSeparator testId="separator" orientation="vertical" size="${expectedSizePx}px" width="10%" />
        <Text width="30%">Something else here.</Text>
      </FlowLayout>`,
  });

  const separator = page.getByTestId("separator");
  const { height } = await getBoundingRect(separator);

  expect(height).toEqualWithTolerance(expectedSizePx);
});

// --- Theme variable tests ---

const COLOR_RED = "rgb(255, 0, 0)" as const;

test(`theme: backgroundColor`, async ({ page }) => {
  const expectedColor = COLOR_RED;

  await initThemedApp(
    page,
    `<Stack gap="0.5rem">
      <HStack>
        <ContentSeparator testId="separator1" size="8px" borderRadius="5px"/>
      </HStack>
      <HStack height="48px" horizontalAlignment="center">
        <ContentSeparator testId="separator2" orientation="vertical" size="8px"/>
      </HStack>
    </Stack>`,
    {
      themeVars: {
        "backgroundColor-ContentSeparator": expectedColor,
      }
    }
  );

  await expect(page.getByTestId("separator1")).toHaveCSS("background-color", expectedColor);
  await expect(page.getByTestId("separator2")).toHaveCSS("background-color", expectedColor);
});

test(`theme: size`, async ({ page }) => {
  const expectedSizePx = 4;

  await initThemedApp(
    page,
    `<Stack gap="0.5rem">
      <HStack>
        <ContentSeparator testId="separator1" />
      </HStack>
      <HStack height="48px" horizontalAlignment="center">
        <ContentSeparator testId="separator2" orientation="vertical" />
      </HStack>
    </Stack>`,
    {
      themeVars: {
        "size-ContentSeparator": expectedSizePx + "px",
      }
    }
  );

  const separator1 = page.getByTestId("separator1");
  const { height } = await getBoundingRect(separator1);

  const separator2 = page.getByTestId("separator2");
  const { width } = await getBoundingRect(separator2);

  expect(height).toEqualWithTolerance(expectedSizePx);
  expect(width).toEqualWithTolerance(expectedSizePx);
});

test(`theme: size overriden by prop`, async ({ page }) => {
  const intermediateSizePx = 4;
  const expectedSizePx = 8;

  await initThemedApp(
    page,
    `<Stack gap="0.5rem">
      <HStack>
        <ContentSeparator testId="separator1" size="${expectedSizePx}px" />
      </HStack>
      <HStack height="48px" horizontalAlignment="center">
        <ContentSeparator testId="separator2" orientation="vertical" size="${expectedSizePx}px" />
      </HStack>
    </Stack>`,
    {
      themeVars: {
        "size-ContentSeparator": intermediateSizePx + "px",
      }
    }
  );

  const separator1 = page.getByTestId("separator1");
  const { height } = await getBoundingRect(separator1);

  const separator2 = page.getByTestId("separator2");
  const { width } = await getBoundingRect(separator2);

  expect(height).toEqualWithTolerance(expectedSizePx);
  expect(width).toEqualWithTolerance(expectedSizePx);
});

//