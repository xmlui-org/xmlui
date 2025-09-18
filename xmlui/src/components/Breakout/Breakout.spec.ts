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
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button")).toBeFocused();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("has the expected CSS attributes", async ({ page, initTestBed }) => {
  await initTestBed(`<Breakout testId="bo">Content inside breakout</Breakout>`);

  const breakout = page.getByTestId("bo");
  const windowWidth = await page.evaluate(() => { return window.innerWidth; });
  await expect(breakout).toHaveCSS("position", "relative");
  await expect(breakout).toHaveCSS("left", `${Math.floor(windowWidth / 2)}px`);
  await expect(breakout).toHaveCSS("right", `${Math.floor(windowWidth / 2)}px`);
  await expect(breakout).toHaveCSS("margin-left", `-${Math.floor(windowWidth / 2)}px`);
  await expect(breakout).toHaveCSS("margin-right", `-${Math.floor(windowWidth / 2)}px`);
  await expect(breakout).toHaveCSS("width", `${windowWidth}px`);
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
