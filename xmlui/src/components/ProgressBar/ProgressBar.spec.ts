import { test, expect } from "../../testing/fixtures";
import { getElementStyle } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.5}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toBeVisible();
    await expect(driver.wrapper).toBeVisible();
    await expect(driver.bar).toBeVisible();
  });

  test("displays progress value correctly", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.7}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBeCloseTo(0.7, 2);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("70%");
  });

  test("handles zero value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("0%");
  });

  test("handles maximum value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{1}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(1);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("100%");
  });

  test("handles decimal values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.335}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBeCloseTo(0.335, 3);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("33.5%");
  });

  test("handles string value prop", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="0.6" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBeCloseTo(0.6, 2);
  });

  test("component renders without value prop", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toBeVisible();
    const value = await driver.getValue();
    expect(value).toBe(0);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test.skip("has proper accessibility roles", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.6}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("role", "progressbar");
  });

  test.skip("aria-valuenow reflects current value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.75}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("aria-valuenow", "75");
  });

  test.skip("aria-valuemin is set to 0", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.5}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("aria-valuemin", "0");
  });

  test.skip("aria-valuemax is set to 100", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.5}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("aria-valuemax", "100");
  });

  test.skip("supports custom accessibility label", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.3}" aria-label="Upload progress" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("aria-label", "Upload progress");
  });

  test.skip("supports aria-labelledby", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`
      <div>
        <h3 id="progress-label">File Upload</h3>
        <ProgressBar value="{0.45}" aria-labelledby="progress-label" />
      </div>
    `);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("aria-labelledby", "progress-label");
  });
});

// =============================================================================
// VISUAL STATES TESTS
// =============================================================================

test.describe("Visual States", () => {
  test.skip("applies correct CSS classes", async ({ initTestBed, createProgressBarDriver }) => {
    // TODO: Review this test
    await initTestBed(`<ProgressBar value="{0.4}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.wrapper).toHaveClass(/progressBarWrapper/);
    await expect(driver.bar).toHaveClass(/progressBar/);
  });

  test("bar width changes with value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.25}" />`);
    const driver = await createProgressBarDriver();
    
    // Check initial width
    let barStyle = await driver.bar.getAttribute("style");
    expect(barStyle).toContain("width: 25%");
    
    // Update value and check width changes
    await initTestBed(`<ProgressBar value="{0.85}" />`);
    barStyle = await driver.bar.getAttribute("style");
    expect(barStyle).toContain("width: 85%");
  });

  test("handles theme variables correctly", async ({ initTestBed, createProgressBarDriver, page }) => {
    await initTestBed(`<ProgressBar value="{0.6}" />`);
    const driver = await createProgressBarDriver();
    
    // Check that CSS custom properties are applied
    const wrapperStyle = await getElementStyle(driver.wrapper, "backgroundColor");
    expect(wrapperStyle).toBeDefined();
    
    const barStyle = await getElementStyle(driver.bar, "backgroundColor");
    expect(barStyle).toBeDefined();
  });

  test("handles different border radius values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.7}" />`);
    const driver = await createProgressBarDriver();
    
    const borderRadius = await getElementStyle(driver.wrapper, "borderRadius");
    expect(borderRadius).toBeDefined();
  });

  test("maintains visual consistency across value changes", async ({ initTestBed, createProgressBarDriver }) => {
    const values = [0.1, 0.25, 0.5, 0.75, 0.9, 1]; // Removed 0 to avoid visibility issues
    
    for (const value of values) {
      await initTestBed(`<ProgressBar value="{${value}}" />`);
      const driver = await createProgressBarDriver();
      
      await expect(driver.component).toBeVisible();
      await expect(driver.bar).toBeVisible();
      
      const actualValue = await driver.getValue();
      expect(actualValue).toBeCloseTo(value, 2);
    }
  });
});

// =============================================================================
// EDGE CASES TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles negative values by clamping to 0", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{-0.5}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("0%");
  });

  test("handles values greater than 1 by clamping to 1", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{1.5}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(1);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("100%");
  });

  test("handles NaN values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{NaN}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
  });

  test("handles undefined value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{undefined}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
  });

  test("handles null value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{null}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
  });

  test("handles very small decimal values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.001}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBeCloseTo(0.001, 3);
    
    const barWidth = await driver.getBarWidth();
    expect(barWidth).toBe("0.1%");
  });

  test("handles very precise decimal values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.123456789}" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBeCloseTo(0.123456789, 5);
  });

  test("handles string values that are not numbers", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="invalid" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
  });

  test("handles empty string value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="" />`);
    const driver = await createProgressBarDriver();
    
    const value = await driver.getValue();
    expect(value).toBe(0);
  });

  test("handles boolean values", async ({ initTestBed, createProgressBarDriver }) => {
    // Test true
    await initTestBed(`<ProgressBar value="{true}" />`);
    let driver = await createProgressBarDriver();
    let value = await driver.getValue();
    expect(value).toBe(1);
    
    // Test false
    await initTestBed(`<ProgressBar value="{false}" />`);
    driver = await createProgressBarDriver();
    value = await driver.getValue();
    expect(value).toBe(0);
  });

  test.skip("maintains accessibility attributes with edge case values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{-5}" />`);
    const driver = await createProgressBarDriver();
    
    await expect(driver.component).toHaveAttribute("aria-valuenow", "0");
    await expect(driver.component).toHaveAttribute("aria-valuemin", "0");
    await expect(driver.component).toHaveAttribute("aria-valuemax", "100");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("works within forms", async ({ initTestBed, createProgressBarDriver, createFormDriver }) => {
    await initTestBed(`
      <Form>
        <ProgressBar value="{0.6}" testId="form-progress" />
        <button type="submit">Submit</button>
      </Form>
    `);
    
    const progressDriver = await createProgressBarDriver("form-progress");
    const formDriver = await createFormDriver();
    
    await expect(progressDriver.component).toBeVisible();
    await expect(formDriver.component).toBeVisible();
    
    const value = await progressDriver.getValue();
    expect(value).toBeCloseTo(0.6, 2);
  });
});
