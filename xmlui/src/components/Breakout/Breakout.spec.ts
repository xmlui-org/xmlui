import { getBoundingRect, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic content", async ({ page, initTestBed }) => {
  await initTestBed(`<Breakout>Content inside breakout</Breakout>`);

  await expect(page.getByText("Content inside breakout")).toBeVisible();
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("children are focusable", async ({ page, initTestBed }) => {
  await initTestBed(`<Breakout><Button label="focusable button" /></Breakout>`);
  await expect(page.getByRole("button")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button")).toBeFocused();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("has the expected CSS attributes", async ({ page, initTestBed }) => {
  await initTestBed(`<Breakout testId="bo">Content inside breakout</Breakout>`);

  const breakout = page.getByTestId("bo");
  const windowWidth = await page.evaluate(() => {
    return window.innerWidth;
  });
  await expect(breakout).toHaveCSS("position", "relative");
  await expect(breakout).toHaveCSS("width", `${windowWidth}px`);

  // Verify the breakout actually spans the full viewport width
  const rect = await getBoundingRect(breakout);
  expect(rect.left).toBeCloseTo(0, 1);
  expect(rect.right).toBeCloseTo(windowWidth, 1);
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component maintains height based on its content", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Breakout testId="bo">
      <Stack height="150px" backgroundColor="red">
        <Text>Tall content</Text>
      </Stack>
    </Breakout>`);

  const breakout = page.getByTestId("bo");
  const { height: boHeight } = await getBoundingRect(breakout);

  expect(boHeight).toBeCloseTo(150);
});

test("works correctly with asymmetric layout (wider left nav)", async ({ page, initTestBed }) => {
  await initTestBed(`
    <HStack gap="0px">
      <Stack width="25%" backgroundColor="pink">Wider left nav</Stack>
      <Stack width="65%">
        <Stack width="100%" horizontalAlignment="center" backgroundColor="fuchsia">
          <Stack width="80%" backgroundColor="lightgreen">
            <Text>Lorem ipsum dolor sit amet</Text>
            <Breakout testId="bo">
              <Stack backgroundColor="lightgray">BREAKOUT TEXT</Stack>
            </Breakout>
            <Text>More text after breakout</Text>
          </Stack>
        </Stack>
      </Stack>
      <Stack width="10%" backgroundColor="pink">Narrow right nav</Stack>
    </HStack>`);

  const breakout = page.getByTestId("bo");
  const windowWidth = await page.evaluate(() => {
    return window.innerWidth;
  });

  // Verify the breakout spans the full viewport width despite asymmetric layout
  const rect = await getBoundingRect(breakout);
  expect(rect.left).toBeCloseTo(0, 1);
  expect(rect.right).toBeCloseTo(windowWidth, 1);
  expect(rect.width).toBeCloseTo(windowWidth, 1);
});
