import { expect, test } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();
  });

  test("component renders with delay prop", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner delay="0" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();
  });

  test("component renders with fullScreen prop", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="true" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();
  });
});

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toHaveAttribute("aria-label", "loading", { ignoreCase: true });
  });

  test("component maintains accessibility with fullScreen", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="true" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toHaveAttribute("aria-label", "loading", { ignoreCase: true });
  });
});

test.describe("Theme Variables", () => {
  test("component applies theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner delay="0" />`, {
      testThemeVars: {
        "size-Spinner": "60px",
        "thickness-Spinner": "6px",
        "borderColor-Spinner": "rgb(255, 0, 0)",
      },
    });

    const spinnerRing = page.locator("[data-part-id='ring']").first();

    await expect(spinnerRing).toHaveCSS("border-top-color", "rgb(255, 0, 0)");
  });
});

test.describe("Delay Behavior", () => {
  test("component respects delay prop", { tag: "@smoke" }, async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="500" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    await expect(spinner).toBeVisible();
  });

  test("component shows immediately with zero delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="0" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component shows immediately with null delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="{null}" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component shows immediately with undefined delay", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="{undefined}" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component handles negative delay values", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="-100" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible({ timeout: 0 });
  });

  test("component respects numeric delay prop", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner delay="{ 500 }" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    await expect(spinner).toBeVisible();
  });
});

test.describe("Full Screen Mode", () => {
  test("component renders in fullScreen mode", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="true" />`);
    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();

    const { width } = await getBounds(spinner);
    expect(width).toEqual(page.viewportSize().width);
  });

  test("component renders normally without fullScreen", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner fullScreen="false" />`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();

    const { width } = await getBounds(spinner);
    expect(width).not.toEqual(page.viewportSize().width);
  });
});

test.describe("Edge Cases", { tag: "@smoke" }, () => {
  test("delayed fullScreen spinner spans viewport width", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner fullScreen="true" delay="{ 500 }" />
      </Fragment>`);

    await page.getByText("control-text").waitFor({ state: "visible" });
    const spinner = page.getByRole("status");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    await expect(spinner).toBeVisible();

    const { width } = await getBounds(spinner);
    expect(width).toEqual(page.viewportSize().width);
  });

  test("button behind fullScreen spinner can't be clicked", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button label="Click Me" onClick="testState = clicked" />
        <Spinner fullScreen="true" />
      </Fragment>`);

    const spinner = page.getByRole("status");
    await expect(spinner).toBeVisible();

    await page.getByRole("button").click({ force: true });

    await expect.poll(testStateDriver.testState).not.toEqual("clicked");
  });
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" tooltip="Tooltip text" delay="{0}" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" tooltipMarkdown="**Bold text**" delay="{0}" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" variant="CustomVariant" delay="{0}" />`, {
      testThemeVars: {
        "borderColor-Spinner-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" variant="CustomVariant" delay="{0}" />`, {
      testThemeVars: {
        "borderColor-Spinner-CustomVariant": "rgb(0, 255, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" animation="fadeIn" delay="{0}" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
  });

  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" tooltip="Tooltip text" animation="fadeIn" delay="{0}" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
    
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("can select part: 'ring'", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" delay="{0}" />`);
    const ringPart = page.getByTestId("test").locator("[data-part-id='ring']");
    await expect(ringPart).toBeVisible();
  });

  test("parts are present when tooltip is added", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" tooltip="Tooltip text" delay="{0}" />`);
    
    const component = page.getByTestId("test");
    const ringPart = component.locator("[data-part-id='ring']");
    
    await expect(ringPart).toBeVisible();
    
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" variant="CustomVariant" delay="{0}" />`, {
      testThemeVars: {
        "borderColor-Spinner-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const ringPart = component.locator("[data-part-id='ring']");
    
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(ringPart).toBeVisible();
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Spinner 
        testId="test" 
        variant="CustomVariant"
        animation="fadeIn"
        tooltip="Tooltip text"
        delay="{0}"
      />
    `, {
      testThemeVars: {
        "borderColor-Spinner-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const ringPart = component.locator("[data-part-id='ring']");
    
    // Verify variant applied
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    
    // Verify parts are visible
    await expect(ringPart).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });
});

// =============================================================================
// RESPONSIVE LAYOUT PROPERTY TESTS
// Breakpoints (default theme):
//   xs:  width <  576px
//   sm:  576px ≤ width < 768px
//   md:  768px ≤ width < 992px
//   lg:  992px ≤ width < 1200px
//   xl: 1200px ≤ width < 1400px
//  xxl: width ≥ 1400px
// =============================================================================

test.describe("Responsive Layout Properties", () => {
  test("width-md applies at md viewport and above", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" delay="{0}" width-md="100px" />`);
    const spinner = page.getByTestId("test");

    // Below md — width should NOT be 100px
    await page.setViewportSize({ width: 767, height: 600 });
    await expect(spinner).not.toHaveCSS("width", "100px");

    // At md — width should be 100px
    await page.setViewportSize({ width: 768, height: 600 });
    await expect(spinner).toHaveCSS("width", "100px");

    // Well above md — width should still be 100px
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(spinner).toHaveCSS("width", "100px");
  });

  test("height-md applies at md viewport and above", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" delay="{0}" height-md="100px" />`);
    const spinner = page.getByTestId("test");

    // Below md — height should NOT be 100px
    await page.setViewportSize({ width: 767, height: 600 });
    await expect(spinner).not.toHaveCSS("height", "100px");

    // At md — height should be 100px
    await page.setViewportSize({ width: 768, height: 600 });
    await expect(spinner).toHaveCSS("height", "100px");
  });

  test("width-md and height-md together match user markup", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Spinner testId="test" delay="{0}" width-md="100px" height-md="100px" />
      </App>
    `);
    const spinner = page.getByTestId("test");

    // xs — neither dimension is overridden
    await page.setViewportSize({ width: 480, height: 600 });
    await expect(spinner).not.toHaveCSS("width", "100px");
    await expect(spinner).not.toHaveCSS("height", "100px");

    // md — both dimensions apply
    await page.setViewportSize({ width: 900, height: 600 });
    await expect(spinner).toHaveCSS("width", "100px");
    await expect(spinner).toHaveCSS("height", "100px");
  });

  test("base width prop applies at all viewport sizes", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" delay="{0}" width="80px" />`);
    const spinner = page.getByTestId("test");

    for (const width of [375, 576, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 600 });
      await expect(spinner).toHaveCSS("width", "80px");
    }
  });

  test("breakpoint-specific width overrides base width at that breakpoint", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`<Spinner testId="test" delay="{0}" width="50px" width-lg="200px" />`);
    const spinner = page.getByTestId("test");

    // Below lg — base 50px
    await page.setViewportSize({ width: 991, height: 600 });
    await expect(spinner).toHaveCSS("width", "50px");

    // At lg — 200px
    await page.setViewportSize({ width: 992, height: 600 });
    await expect(spinner).toHaveCSS("width", "200px");
  });

  test("multiple breakpoint widths stack correctly (mobile-first cascade)", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<Spinner testId="test" delay="{0}" width-sm="60px" width-md="120px" width-xl="200px" />`,
    );
    const spinner = page.getByTestId("test");

    // xs: no rule applies
    await page.setViewportSize({ width: 400, height: 600 });
    await expect(spinner).not.toHaveCSS("width", "60px");

    // sm: 60px rule
    await page.setViewportSize({ width: 600, height: 600 });
    await expect(spinner).toHaveCSS("width", "60px");

    // md: 120px overrides
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(spinner).toHaveCSS("width", "120px");

    // lg: md rule still applies (no lg rule defined)
    await page.setViewportSize({ width: 1100, height: 600 });
    await expect(spinner).toHaveCSS("width", "120px");

    // xl: 200px overrides
    await page.setViewportSize({ width: 1300, height: 600 });
    await expect(spinner).toHaveCSS("width", "200px");
  });

  test("opacity-sm applies from sm breakpoint upward", async ({ page, initTestBed }) => {
    await initTestBed(`<Spinner testId="test" delay="{0}" opacity-sm="0.5" />`);
    const spinner = page.getByTestId("test");

    // xs — no opacity override
    await page.setViewportSize({ width: 400, height: 600 });
    await expect(spinner).not.toHaveCSS("opacity", "0.5");

    // sm — opacity applies
    await page.setViewportSize({ width: 600, height: 600 });
    await expect(spinner).toHaveCSS("opacity", "0.5");
  });

  test("responsive props do not affect non-visual spinner state (delay still works)", async ({
    page,
    initTestBed,
  }) => {
    await page.setViewportSize({ width: 900, height: 600 });
    await initTestBed(`
      <Fragment>
        control-text
        <Spinner testId="test" delay="500" width-md="100px" />
      </Fragment>
    `);

    await page.getByText("control-text").waitFor({ state: "visible" });

    // Not yet visible due to delay
    const spinner = page.getByTestId("test");
    await expect(spinner).not.toBeVisible({ timeout: 0 });

    // Visible after delay, and width is applied
    await expect(spinner).toBeVisible();
    await expect(spinner).toHaveCSS("width", "100px");
  });
});
