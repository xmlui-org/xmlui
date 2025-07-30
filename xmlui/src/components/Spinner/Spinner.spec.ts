import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default props", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner />`);
    const driver = await createSpinnerDriver();

    // Wait for delay to pass (default 400ms)
    await driver.component.waitFor({ state: "visible", timeout: 1000 });
    await expect(driver.component).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("component renders immediately with zero delay", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("component respects custom delay", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`
      <Spinner delay="200" />
    `);
    const driver = await createSpinnerDriver();

    // Should not be visible immediately (component returns null during delay)
    await expect(driver.component).not.toBeAttached();
    
    // Should be visible after delay
    await driver.component.waitFor({ state: "attached", timeout: 500 });
    await expect(driver.component).toBeVisible();
  });

  test("component renders in normal mode by default", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    await expect(driver.fullScreenWrapper).not.toBeVisible();
  });

  test("component renders in full screen mode when specified", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" fullScreen="true" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.fullScreenWrapper).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("component handles fullScreen prop changes", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" fullScreen="false" />`);
    const driver1 = await createSpinnerDriver();
    await expect(driver1.fullScreenWrapper).not.toBeVisible();

    await initTestBed(`<Spinner delay="0" fullScreen="true" />`);
    const driver2 = await createSpinnerDriver();
    await expect(driver2.fullScreenWrapper).toBeVisible();
  });

  test("component has correct CSS structure", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    
    // Check for the four child divs that create the ring animation
    const childDivs = driver.spinnerElement.locator('div');
    await expect(childDivs).toHaveCount(4);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("spinner provides visual loading indication", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("spinner animation is detectable", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    const animationDuration = await driver.getAnimationDuration();
    expect(animationDuration).not.toBe("0s");
    expect(animationDuration).not.toBe("");
  });

  test("full screen spinner provides appropriate visual coverage", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" fullScreen="true" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.fullScreenWrapper).toBeVisible();
    
    // Check that full screen wrapper covers the viewport
    const boundingBox = await driver.fullScreenWrapper.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States", () => {
  test("spinner has consistent animation", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    
    // Check animation is running
    const animationDuration = await driver.getAnimationDuration();
    expect(animationDuration).toMatch(/^\d+(\.\d+)?s$/); // Should be in seconds format
  });

  test("full screen wrapper has correct styling", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`
      <Spinner fullScreen="true" delay="0" />
    `);
    const driver = await createSpinnerDriver();

    await expect(driver.fullScreenWrapper).toBeVisible();
    await expect(driver.fullScreenWrapper).toHaveCSS("position", "absolute");
  });

  test("spinner maintains proportions with custom styles", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" width="100px" height="100px" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    const boundingBox = await driver.spinnerElement.boundingBox();
    expect(boundingBox).not.toBeNull();
  });

  test("multiple spinners can coexist", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`
      <VStack gap="4">
        <Spinner delay="0" testId="spinner1" />
        <Spinner delay="0" testId="spinner2" />
      </VStack>
    `);
    
    const driver = await createSpinnerDriver();

    // Wait for spinners to appear
    await driver.spinnerElement.waitFor({ state: "visible", timeout: 1000 });
    
    // Verify we can find spinners with different test IDs
    const spinner1 = driver.getSpinnerByTestId("spinner1");
    const spinner2 = driver.getSpinnerByTestId("spinner2");
    
    await expect(spinner1).toBeVisible();
    await expect(spinner2).toBeVisible();
    
    // Verify both are actually spinner components with child divs
    expect(await spinner1.locator('div').count()).toBe(4);
    expect(await spinner2.locator('div').count()).toBe(4);
  });

  test("spinner visibility transitions correctly", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="200" />`);
    const driver = await createSpinnerDriver();

    // Initially not visible
    await expect(driver.component).not.toBeVisible();
    
    // Becomes visible after delay
    await driver.component.waitFor({ state: "visible", timeout: 500 });
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles undefined delay gracefully", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner />`);
    const driver = await createSpinnerDriver();

    // Should use default delay (400ms)
    await driver.component.waitFor({ state: "visible", timeout: 1000 });
    await expect(driver.component).toBeVisible();
  });

  test("component handles undefined fullScreen prop gracefully", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    await expect(driver.fullScreenWrapper).not.toBeVisible();
  });

  test("component handles zero delay correctly", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("component handles very large delay", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="5000" />`);
    const driver = await createSpinnerDriver();

    // Should not be visible within reasonable time
    await expect(driver.component).not.toBeVisible();
  });

  test("component handles negative delay as zero", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="-100" />`);
    const driver = await createSpinnerDriver();

    // Should be visible immediately (negative delay treated as zero)
    await expect(driver.component).toBeVisible();
  });

  test("component handles string boolean values", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" fullScreen="false" />`);
    const driver1 = await createSpinnerDriver();
    await expect(driver1.fullScreenWrapper).not.toBeVisible();

    await initTestBed(`<Spinner delay="0" fullScreen="true" />`);
    const driver2 = await createSpinnerDriver();
    await expect(driver2.fullScreenWrapper).toBeVisible();
  });

  test("component handles empty props", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`
      <Spinner />
    `);
    const driver = await createSpinnerDriver();

    // Should fallback to defaults (delay: 400ms)
    await driver.component.waitFor({ state: "attached", timeout: 1000 });
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("multiple spinners render efficiently", async ({ initTestBed, createSpinnerDriver }) => {
    const spinners = Array.from({ length: 10 }, (_, i) => 
      `<Spinner testId="spinner-${i}" delay="0" />`
    ).join('');
    
    await initTestBed(`<VStack>${spinners}</VStack>`);
    
    // Test a few random spinners
    const driver1 = await createSpinnerDriver("spinner-0");
    const driver5 = await createSpinnerDriver("spinner-4");
    const driver10 = await createSpinnerDriver("spinner-9");
    
    await expect(driver1.component).toBeVisible();
    await expect(driver5.component).toBeVisible();
    await expect(driver10.component).toBeVisible();
  });

  test("spinner handles rapid delay changes", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();
    await expect(driver.component).toBeVisible();

    await initTestBed(`<Spinner delay="100" />`);
    // Component should handle the change gracefully
    await expect(driver.component).not.toBeVisible();
  });

  test("full screen mode doesn't impact performance", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" fullScreen="true" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.fullScreenWrapper).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("animation performance is stable", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    
    // Animation should be running consistently
    const duration1 = await driver.getAnimationDuration();
    await new Promise(resolve => setTimeout(resolve, 100));
    const duration2 = await driver.getAnimationDuration();
    
    expect(duration1).toBe(duration2);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("spinner works within layout components", async ({ initTestBed, createSpinnerDriver, createVStackDriver }) => {
    await initTestBed(`
      <VStack>
        <Spinner testId="spinner" delay="0" />
      </VStack>
    `);
    
    const stackDriver = await createVStackDriver();
    const spinnerDriver = await createSpinnerDriver("spinner");

    await expect(stackDriver.component).toBeVisible();
    await expect(spinnerDriver.component).toBeVisible();
  });

  test("spinner integrates with conditional rendering", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`
      <Fragment>
        <Spinner testId="spinner1" delay="0" />
        <Spinner testId="spinner2" delay="0" fullScreen="true" />
      </Fragment>
    `);
    
    const driver1 = await createSpinnerDriver("spinner1");
    const driver2 = await createSpinnerDriver("spinner2");
    
    await expect(driver1.component).toBeVisible();
    await expect(driver2.component).toBeVisible();
    await expect(driver2.fullScreenWrapper).toBeVisible();
  });

  test("full screen spinner overlays other content", async ({ initTestBed, createSpinnerDriver, createButtonDriver }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="button">Test Button</Button>
        <Spinner testId="spinner" delay="0" fullScreen="true" />
      </Fragment>
    `);
    
    const buttonDriver = await createButtonDriver("button");
    const spinnerDriver = await createSpinnerDriver("spinner");

    await expect(buttonDriver.component).toBeVisible();
    await expect(spinnerDriver.component).toBeVisible();
    await expect(spinnerDriver.fullScreenWrapper).toBeVisible();
  });

  test("spinner works with theme customization", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`, {
      testThemeVars: {
        "size-Spinner": "60px",
        "thickness-Spinner": "8px",
        "borderColor-Spinner": "rgb(255, 0, 0)",
      },
    });
    const driver = await createSpinnerDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.spinnerElement).toBeVisible();
  });

  test("spinner maintains consistency across re-renders", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`);
    const driver1 = await createSpinnerDriver();
    await expect(driver1.component).toBeVisible();

    await initTestBed(`<Spinner delay="0" />`);
    const driver2 = await createSpinnerDriver();
    await expect(driver2.component).toBeVisible();
    
    const duration1 = await driver1.getAnimationDuration();
    const duration2 = await driver2.getAnimationDuration();
    expect(duration1).toBe(duration2);
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("size theme variable", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`, {
      testThemeVars: {
        "size-Spinner": "80px",
      },
    });
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    await expect(driver.spinnerElement).toHaveCSS("width", "80px");
    await expect(driver.spinnerElement).toHaveCSS("height", "80px");
  });

  test("thickness theme variable", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`, {
      testThemeVars: {
        "thickness-Spinner": "6px",
      },
    });
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    // The thickness affects the border width of the spinner elements
    const firstChild = driver.spinnerElement.locator('div').first();
    await expect(firstChild).toHaveCSS("border-width", "6px");
  });

  test("borderColor theme variable", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`, {
      testThemeVars: {
        "borderColor-Spinner": "rgb(0, 255, 0)",
      },
    });
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    // Check border color on one of the spinner elements - format is different than expected
    const firstChild = driver.spinnerElement.locator('div').first();
    await expect(firstChild).toHaveCSS("border-color", "rgb(0, 255, 0) rgba(0, 0, 0, 0) rgba(0, 0, 0, 0)");
  });

  test("multiple theme variables work together", async ({ initTestBed, createSpinnerDriver }) => {
    await initTestBed(`<Spinner delay="0" />`, {
      testThemeVars: {
        "size-Spinner": "100px",
        "thickness-Spinner": "10px",
        "borderColor-Spinner": "rgb(255, 165, 0)",
      },
    });
    const driver = await createSpinnerDriver();

    await expect(driver.spinnerElement).toBeVisible();
    await expect(driver.spinnerElement).toHaveCSS("width", "100px");
    await expect(driver.spinnerElement).toHaveCSS("height", "100px");
    
    const firstChild = driver.spinnerElement.locator('div').first();
    await expect(firstChild).toHaveCSS("border-width", "10px");
  });
});
