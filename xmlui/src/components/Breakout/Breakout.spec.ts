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

test.fixme(
  "Breakout has viewport width inside fixed-width Stack",
  SKIP_REASON.XMLUI_BUG(),
  async ({ page, initTestBed }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    await initTestBed(`
    <Stack width="400px">
      <Text>Content before breakout</Text>
      <Breakout testId="bo" >Breakout content</Breakout>
      <Text>Content after breakout</Text>
    </Stack>`);

    const bo = page.getByTestId("bo");
    const { width: boWidth } = await getBoundingRect(bo);

    expect(boWidth).toBeCloseTo(800);
    await expect(bo).toHaveText("Breakout content", {});
    await expect(bo).toBeInViewport({ ratio: 1 });
  },
);

test.fixme(
  "Breakout has viewport width inside 50% width Stack",
  SKIP_REASON.XMLUI_BUG(),
  async ({ page, initTestBed }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    await initTestBed(`
    <Stack width="50%">
      <Text>Content before breakout</Text>
      <Breakout testId="bo" >Breakout content</Breakout>
      <Text>Content after breakout</Text>
    </Stack>`);

    const bo = page.getByTestId("bo");
    const { width: boWidth } = await getBoundingRect(bo);

    expect(boWidth).toBeCloseTo(800);
    await expect(bo).toHaveText("Breakout content", {});
    await expect(bo).toBeInViewport({ ratio: 1 });
  },
);

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

test.fixme(
  "contents of nested Breakouts visible",
  SKIP_REASON.XMLUI_BUG(),
  async ({ page, initTestBed }) => {
    await initTestBed(`
    <Stack width="500px">
      <Breakout testId="outer">
        <Text>Outer breakout</Text>
        <Breakout testId="inner">
          <Text>Inner breakout</Text>
        </Breakout>
      </Breakout>
    </Stack>`);

    const outer = page.getByTestId("outer");
    const inner = page.getByTestId("inner");

    await expect(outer).toBeInViewport({ ratio: 1 });
    await expect(inner).toBeInViewport({ ratio: 1 });
    await expect(outer).toContainText("Outer breakout");
    await expect(inner).toHaveText("Inner breakout");
  },
);

test.skip(
  "not overflowing inside <App noScrollbarGutters='true'>",
  SKIP_REASON.XMLUI_BUG(
    "The tests can't break, it's more for a developer to look at the rendered page and see that with noScrollbarGutters='true' and Breakout, on a viewport that's short enough to make a vertical scrollbar appear (hence the page.setViewportSize), the layout overflows, making a horizontal scrollbar appear.",
  ),
  async ({ page, initTestBed }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    await initTestBed(`
    <App testId="app" noScrollbarGutters="true">
      <Stack testId="stack" backgroundColor="lightblue" height="580px"/>
      <Breakout testId="bo">
        Breakout text
      </Breakout>
    </App>`);
  },
);

test.fixme(
  "Breaks out of stack inside Breakout",
  SKIP_REASON.XMLUI_BUG(),
  async ({ page, initTestBed }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await initTestBed(`
    <Stack width="50%">
      <Breakout testId="outer">
        <Stack width="50%">
          <Breakout testId="inner">
            <Text>Inner breakout</Text>
          </Breakout>
        </Stack>
      </Breakout>
    </Stack>`);

    const outer = page.getByTestId("outer");
    const inner = page.getByTestId("inner");

    const { width: outerWidth } = await getBoundingRect(outer);
    const { width: innerWidth } = await getBoundingRect(inner);

    expect(outerWidth).toBeCloseTo(800);
    expect(innerWidth).toBeCloseTo(800);

    await expect(outer).toBeInViewport({ ratio: 1 });
    await expect(inner).toBeInViewport({ ratio: 1 });
    await expect(inner).toHaveText("Inner breakout");
  },
);
