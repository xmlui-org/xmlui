import { getBounds, getStyles } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 500;
test.use({ viewport: { width: PAGE_WIDTH, height: PAGE_HEIGHT } });

test("Themed NavPanel", async ({ page, initTestBed }) => {
  const EXPECTED_COLOR = "rgb(23, 35, 43)";
  await initTestBed(
    `
    <App layout="vertical">
      <Theme tone="dark">
        <NavPanel testId="nav-panel">
          <NavLink to="/something">Something</NavLink>
        </NavPanel>
      </Theme>
    </App>
  `,
    {
      themes: [
        {
          id: "test",
          extends: "light",
          tones: {
            dark: {
              themeVars: {
                "background-color": EXPECTED_COLOR,
              },
            },
          },
        },
      ],
      defaultTheme: "test",
    },
  );
  const { backgroundColor } = await getStyles(page.getByTestId("nav-panel"), "background-color");
  const boundingRect = await getBounds(page.getByTestId("nav-panel"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.height).toBe(PAGE_HEIGHT);
  expect(boundingRect.bottom).toBe(PAGE_HEIGHT);
  expect(backgroundColor).toBe(EXPECTED_COLOR);
});

test("Themed AppHeader", async ({ page, initTestBed }) => {
  const EXPECTED_COLOR = "rgb(28, 43, 53)";
  await initTestBed(
    `
    <App layout="vertical" scrollWholePage="false">
      <Theme tone="dark">
        <AppHeader testId="app-header"/>
      </Theme>
    </App>
  `,
    {
      themes: [
        {
          id: "test",
          extends: "light",
          tones: {
            dark: {
              themeVars: {
                "background-color": EXPECTED_COLOR,
              },
            },
          },
        },
      ],
      defaultTheme: "test",
    },
  );
  const { backgroundColor } = await getStyles(page.getByTestId("app-header"), "background-color");
  const boundingRect = await getBounds(page.getByTestId("app-header"));

  expect(boundingRect.top).toBe(0);
  expect(boundingRect.width).toBe(PAGE_WIDTH);
  expect(backgroundColor).toBe(EXPECTED_COLOR);
});

test("Themed Footer", async ({ page, initTestBed }) => {
  const EXPECTED_COLOR = "rgb(28, 43, 53)";
  await initTestBed(
    `
    <App scrollWholePage="false">
      <Theme tone="dark">
        <Footer testId="app-footer"/>
      </Theme>
    </App>
  `,
    {
      themes: [
        {
          id: "test",
          extends: "light",
          tones: {
            dark: {
              themeVars: {
                "background-color": EXPECTED_COLOR,
              },
            },
          },
        },
      ],
      defaultTheme: "test",
    },
  );

  const { backgroundColor } = await getStyles(page.getByTestId("app-footer"), "background-color");
  const boundingRect = await getBounds(page.getByTestId("app-footer"));

  expect(boundingRect.left).toBe(0);
  expect(boundingRect.bottom).toEqualWithTolerance(PAGE_HEIGHT, 0.01);
  expect(boundingRect.width).toEqualWithTolerance(PAGE_WIDTH, 0.01);
  expect(backgroundColor).toBe(EXPECTED_COLOR);
});

test("Themed H1 regression", async ({ page, initTestBed }) => {
  await initTestBed(`
    <App>
      <Theme textColor-H1="rgb(255, 0, 0)" textColor-H2="rgb(0, 255, 0)">
          <H1 testId="red">Should be red</H1>
          <H2 testId="green">Should be green</H2>
      </Theme>
    </App>
  `);

  const { color: h1Color } = await getStyles(page.getByTestId("red"), "color");
  const { color: h2Color } = await getStyles(page.getByTestId("green"), "color");

  expect(h1Color).toBe("rgb(255, 0, 0)");
  expect(h2Color).toBe("rgb(0, 255, 0)");
});

// =============================================================================
// APPLYIF PROPERTY TESTS
// =============================================================================

test.describe("applyIf Property", () => {
  test("applies theme when applyIf is true (default)", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`
      <App>
        <Theme backgroundColor-Button="${EXPECTED_COLOR}" applyIf="true">
          <Button testId="themed-button">Themed Button</Button>
        </Theme>
      </App>
    `);

    const { backgroundColor } = await getStyles(
      page.getByTestId("themed-button"),
      "background-color",
    );
    expect(backgroundColor).toBe(EXPECTED_COLOR);
  });

  test("applies theme when applyIf is omitted (defaults to true)", async ({
    page,
    initTestBed,
  }) => {
    const EXPECTED_COLOR = "rgb(0, 255, 0)";
    await initTestBed(`
      <App>
        <Theme backgroundColor-Button="${EXPECTED_COLOR}">
          <Button testId="themed-button">Themed Button</Button>
        </Theme>
      </App>
    `);

    const { backgroundColor } = await getStyles(
      page.getByTestId("themed-button"),
      "background-color",
    );
    expect(backgroundColor).toBe(EXPECTED_COLOR);
  });

  test("does not apply theme when applyIf is false", async ({ page, initTestBed }) => {
    const THEME_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`
      <App>
        <Theme backgroundColor-Button="${THEME_COLOR}" applyIf="false">
          <Button testId="unthemed-button">Unthemed Button</Button>
        </Theme>
      </App>
    `);

    const { backgroundColor } = await getStyles(
      page.getByTestId("unthemed-button"),
      "background-color",
    );
    // Should not have the theme color when applyIf is false
    expect(backgroundColor).not.toBe(THEME_COLOR);
  });

  test("renders children without theme wrapper when applyIf is false", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <App>
        <Theme tone="dark" applyIf="false">
          <Button testId="button">Button Text</Button>
          <H1 testId="header">Header Text</H1>
        </Theme>
      </App>
    `);

    // Children should still be rendered and visible
    await expect(page.getByTestId("button")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("button")).toHaveText("Button Text");
    await expect(page.getByTestId("header")).toHaveText("Header Text");
  });

  test("supports dynamic applyIf with binding expressions", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <App>
        <Theme backgroundColor-Button="rgb(255, 0, 0)" applyIf="{testState === true}">
          <Button testId="conditional-button" onClick="testState = testState === true ? false : true">Toggle Theme</Button>
        </Theme>
      </App>
    `);

    // Initially testState is null, expression evaluates to false
    const initialBackground = await getStyles(
      page.getByTestId("conditional-button"),
      "background-color",
    );
    expect(initialBackground.backgroundColor).not.toBe("rgb(255, 0, 0)");

    // Click to make testState true, theme should be applied
    await page.getByTestId("conditional-button").click();
    await expect.poll(testStateDriver.testState).toBe(true);

    const appliedBackground = await getStyles(
      page.getByTestId("conditional-button"),
      "background-color",
    );
    expect(appliedBackground.backgroundColor).toBe("rgb(255, 0, 0)");

    // Click again to make testState false, theme should not be applied
    await page.getByTestId("conditional-button").click();
    await expect.poll(testStateDriver.testState).toBe(false);

    const removedBackground = await getStyles(
      page.getByTestId("conditional-button"),
      "background-color",
    );
    expect(removedBackground.backgroundColor).not.toBe("rgb(255, 0, 0)");
  });

  test("handles nested themes with different applyIf values", async ({ page, initTestBed }) => {
    const OUTER_COLOR = "rgb(255, 0, 0)";
    const INNER_COLOR = "rgb(0, 255, 0)";

    await initTestBed(`
      <App>
        <Theme backgroundColor-Button="${OUTER_COLOR}" applyIf="true">
          <Button testId="outer-themed">Outer Themed</Button>
          <Theme backgroundColor-Button="${INNER_COLOR}" applyIf="false">
            <Button testId="inner-unthemed">Inner Unthemed</Button>
          </Theme>
        </Theme>
      </App>
    `);

    // Outer button should have outer theme applied
    const { backgroundColor: outerBg } = await getStyles(
      page.getByTestId("outer-themed"),
      "background-color",
    );
    expect(outerBg).toBe(OUTER_COLOR);

    // Inner button should inherit outer theme (inner theme not applied due to applyIf=false)
    const { backgroundColor: innerBg } = await getStyles(
      page.getByTestId("inner-unthemed"),
      "background-color",
    );
    expect(innerBg).toBe(OUTER_COLOR); // Should inherit from outer theme
  });

  test("applies multiple theme variables when applyIf is true", async ({ page, initTestBed }) => {
    const BG_COLOR = "rgb(255, 0, 0)";
    const TEXT_COLOR = "rgb(0, 255, 0)";

    await initTestBed(`
      <App>
        <Theme
          backgroundColor-Button="${BG_COLOR}"
          textColor-Button="${TEXT_COLOR}"
          applyIf="true"
        >
          <Button testId="multi-themed">Multi Themed</Button>
        </Theme>
      </App>
    `);

    const { backgroundColor } = await getStyles(
      page.getByTestId("multi-themed"),
      "background-color",
    );
    const { color } = await getStyles(page.getByTestId("multi-themed"), "color");
    expect(backgroundColor).toBe(BG_COLOR);
    expect(color).toBe(TEXT_COLOR);
  });

  test("does not apply any theme variables when applyIf is false", async ({
    page,
    initTestBed,
  }) => {
    const BG_COLOR = "rgb(255, 0, 0)";
    const TEXT_COLOR = "rgb(0, 255, 0)";

    await initTestBed(`
      <App>
        <Theme
          backgroundColor-Button="${BG_COLOR}"
          textColor-Button="${TEXT_COLOR}"
          applyIf="false"
        >
          <Button testId="no-theme">No Theme</Button>
        </Theme>
      </App>
    `);

    const { backgroundColor } = await getStyles(page.getByTestId("no-theme"), "background-color");
    const { color } = await getStyles(page.getByTestId("no-theme"), "color");
    expect(backgroundColor).not.toBe(BG_COLOR);
    expect(color).not.toBe(TEXT_COLOR);
  });
});

// =============================================================================
// APPLYIF EDGE CASES
// =============================================================================

test.describe("applyIf Edge Cases", () => {
  test("handles null applyIf value gracefully", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <App>
        <Theme backgroundColor-Button="rgb(255, 0, 0)" applyIf="{testState === 'apply'}">
          <Button testId="null-apply" onClick="testState = testState === 'apply' ? null : 'apply'">Button</Button>
        </Theme>
      </App>
    `);

    // Initially testState is null, expression evaluates to false
    const initialBg = await getStyles(page.getByTestId("null-apply"), "background-color");
    expect(initialBg.backgroundColor).not.toBe("rgb(255, 0, 0)");

    // Button should still be visible
    await expect(page.getByTestId("null-apply")).toBeVisible();

    // Click to set testState to 'apply', theme should be applied
    await page.getByTestId("null-apply").click();
    await expect.poll(testStateDriver.testState).toBe("apply");

    const appliedBg = await getStyles(page.getByTestId("null-apply"), "background-color");
    expect(appliedBg.backgroundColor).toBe("rgb(255, 0, 0)");

    // Click again to set testState to null, theme should not be applied
    await page.getByTestId("null-apply").click();
    await expect.poll(testStateDriver.testState).toBe(null);

    const removedBg = await getStyles(page.getByTestId("null-apply"), "background-color");
    expect(removedBg.backgroundColor).not.toBe("rgb(255, 0, 0)");
  });

  test("handles undefined applyIf value (defaults to true)", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <App>
        <Theme backgroundColor-Button="rgb(255, 0, 0)" applyIf="{testState > 10 ? true : undefined}">
          <Button testId="undefined-apply" onClick="testState = testState == null ? 5 : testState + 10">Button</Button>
        </Theme>
      </App>
    `);

    // Initially testState is null, expression evaluates to undefined (should use default true)
    const initialBg = await getStyles(page.getByTestId("undefined-apply"), "background-color");
    expect(initialBg.backgroundColor).toBe("rgb(255, 0, 0)"); // undefined should default to true

    // Button should still be visible
    await expect(page.getByTestId("undefined-apply")).toBeVisible();

    // Click to set testState to 5, expression evaluates to undefined (should use default true)
    await page.getByTestId("undefined-apply").click();
    await expect.poll(testStateDriver.testState).toBe(5);

    const afterFirstClickBg = await getStyles(
      page.getByTestId("undefined-apply"),
      "background-color",
    );
    expect(afterFirstClickBg.backgroundColor).toBe("rgb(255, 0, 0)"); // undefined should default to true

    // Click again to set testState to 15, expression evaluates to true (explicit true)
    await page.getByTestId("undefined-apply").click();
    await expect.poll(testStateDriver.testState).toBe(15);

    const afterSecondClickBg = await getStyles(
      page.getByTestId("undefined-apply"),
      "background-color",
    );
    expect(afterSecondClickBg.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  test("handles string 'false' as truthy value", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Theme backgroundColor-Button="rgb(255, 0, 0)" applyIf="false">
          <Button testId="string-false">Button</Button>
        </Theme>
      </App>
    `);

    // String "false" should be treated as boolean false, so theme should not be applied
    const { backgroundColor } = await getStyles(
      page.getByTestId("string-false"),
      "background-color",
    );
    expect(backgroundColor).not.toBe("rgb(255, 0, 0)");
  });

  test("handles numeric values correctly", async ({ page, initTestBed }) => {
    const THEME_COLOR = "rgb(255, 0, 0)";

    // Test with 0 (falsy)
    await initTestBed(`
      <App>
        <Theme backgroundColor-Button="${THEME_COLOR}" applyIf="{0}">
          <Button testId="zero-apply">Button Zero</Button>
        </Theme>
      </App>
    `);

    const { backgroundColor: zeroBg } = await getStyles(
      page.getByTestId("zero-apply"),
      "background-color",
    );
    expect(zeroBg).not.toBe(THEME_COLOR);
  });

  test("works with complex conditional expressions", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <App>
        <Theme backgroundColor-Button="rgb(255, 0, 0)" applyIf="{testState > 5}">
          <Button testId="complex-condition" onClick="testState = testState == null ? 1 : testState + 3">
            Increment by 3
          </Button>
        </Theme>
      </App>
    `);

    // Initially testState is null, condition should be false
    const initialBg = await getStyles(page.getByTestId("complex-condition"), "background-color");
    expect(initialBg.backgroundColor).not.toBe("rgb(255, 0, 0)");

    // Click once: testState becomes 1 (1 > 5 is false)
    await page.getByTestId("complex-condition").click();
    await expect.poll(testStateDriver.testState).toBe(1);

    const firstClickBg = await getStyles(page.getByTestId("complex-condition"), "background-color");
    expect(firstClickBg.backgroundColor).not.toBe("rgb(255, 0, 0)");

    // Click again: testState becomes 4 (4 > 5 is false)
    await page.getByTestId("complex-condition").click();
    await expect.poll(testStateDriver.testState).toBe(4);

    const secondClickBg = await getStyles(
      page.getByTestId("complex-condition"),
      "background-color",
    );
    expect(secondClickBg.backgroundColor).not.toBe("rgb(255, 0, 0)");

    // Click again: testState becomes 7 (7 > 5 is true, theme should apply)
    await page.getByTestId("complex-condition").click();
    await expect.poll(testStateDriver.testState).toBe(7);

    const thirdClickBg = await getStyles(page.getByTestId("complex-condition"), "background-color");
    expect(thirdClickBg.backgroundColor).toBe("rgb(255, 0, 0)");
  });

  test("preserves children structure when applyIf is false", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Theme applyIf="false">
          <VStack testId="container">
            <Button testId="first-button">First</Button>
            <H1 testId="header">Header</H1>
            <Button testId="second-button">Second</Button>
          </VStack>
        </Theme>
      </App>
    `);

    // All children should be present and in correct order
    await expect(page.getByTestId("container")).toBeVisible();
    await expect(page.getByTestId("first-button")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("second-button")).toBeVisible();

    // Check text content is preserved
    await expect(page.getByTestId("first-button")).toHaveText("First");
    await expect(page.getByTestId("header")).toHaveText("Header");
    await expect(page.getByTestId("second-button")).toHaveText("Second");
  });

  test("empty Theme tag without attributes does not create wrapper", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Theme>
          <VStack testId="container" gap="20px">
            <Button testId="first-button">First</Button>
            <H1 testId="header">Header</H1>
          </VStack>
        </Theme>
      </App>
    `);

    // Content should render normally
    await expect(page.getByTestId("container")).toBeVisible();
    await expect(page.getByTestId("first-button")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();

    // Get the container element's parent - should not be a theme wrapper div
    const container = page.getByTestId("container");
    const parentClass = await container.evaluate(el => el.parentElement?.className || '');
    
    // The parent should NOT have themeWrapper class since the Theme is empty
    expect(parentClass).not.toContain('themeWrapper');
  });

  test("Theme with tone creates wrapper even without other props", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Theme tone="dark">
          <VStack testId="container">
            <Button testId="button">Test</Button>
          </VStack>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("container")).toBeVisible();
    
    // Get the container element's parent - should be a theme wrapper div
    const container = page.getByTestId("container");
    const parentClass = await container.evaluate(el => el.parentElement?.className || '');
    
    // The parent SHOULD have themeWrapper class since tone is specified
    expect(parentClass).toContain('themeWrapper');
  });

  test("Theme with themeVars creates wrapper even without other props", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Theme backgroundColor-App="rgb(255, 0, 0)">
          <VStack testId="container">
            <Button testId="button">Test</Button>
          </VStack>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("container")).toBeVisible();
    
    // Get the container element's parent - should be a theme wrapper div
    const container = page.getByTestId("container");
    const parentClass = await container.evaluate(el => el.parentElement?.className || '');
    
    // The parent SHOULD have themeWrapper class since theme vars are specified
    expect(parentClass).toContain('themeWrapper');
  });

  test("explicit applyIf=true creates wrapper even without meaningful props", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Theme applyIf="true">
          <VStack testId="container">
            <Button testId="button">Test</Button>
          </VStack>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("container")).toBeVisible();
    
    // Get the container element's parent - should be a theme wrapper div
    const container = page.getByTestId("container");
    const parentClass = await container.evaluate(el => el.parentElement?.className || '');
    
    // The parent SHOULD have themeWrapper class because applyIf is explicitly true
    expect(parentClass).toContain('themeWrapper');
  });
});
