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
    await expect(driver.bar).toBeVisible();
  });

  test("displays progress value correctly", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.7}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBeCloseTo(0.7, 2);
  });

  test("handles zero value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles maximum value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{1}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(1);
  });

  test("handles decimal values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.335}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBeCloseTo(0.335, 3);
  });

  test("handles string value prop", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="0.6" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBeCloseTo(0.6, 2);
  });

  test("component renders without value prop", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar />`);
    const driver = await createProgressBarDriver();

    await expect(driver.component).toBeVisible();
    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has proper accessibility roles", async ({ initTestBed, page }) => {
    await initTestBed(`<ProgressBar value="{0.6}" />`);

    const bar = page.getByRole("progressbar");
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
    await expect(bar).toHaveAttribute("aria-valuenow", "60");
  });

  test("maintains accessibility attributes with edge case values", async ({
    initTestBed,
    createProgressBarDriver,
  }) => {
    await initTestBed(`<ProgressBar value="{-5}" />`);
    const driver = await createProgressBarDriver();

    await expect(driver.component).toHaveAttribute("aria-valuenow", "0");
    await expect(driver.component).toHaveAttribute("aria-valuemin", "0");
    await expect(driver.component).toHaveAttribute("aria-valuemax", "100");
  });
});

// =============================================================================
// EDGE CASES TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles negative values by clamping to 0", async ({
    initTestBed,
    createProgressBarDriver,
  }) => {
    await initTestBed(`<ProgressBar value="{-0.5}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles values greater than 1 by clamping to 1", async ({
    initTestBed,
    createProgressBarDriver,
  }) => {
    await initTestBed(`<ProgressBar value="{1.5}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(1);
  });

  test("handles NaN values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{NaN}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles undefined value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{undefined}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles null value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{null}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles very small decimal values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{0.001}" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBeCloseTo(0.001, 3);
  });

  test("handles string values that are not numbers", async ({
    initTestBed,
    createProgressBarDriver,
  }) => {
    await initTestBed(`<ProgressBar value="invalid" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles empty string value", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="" />`);
    const driver = await createProgressBarDriver();

    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });

  test("handles boolean values", async ({ initTestBed, createProgressBarDriver }) => {
    const driver = await createProgressBarDriver();
    const value = await driver.getProgressRatio();
    expect(value).toBe(1);
  });

  test("handles boolean values", async ({ initTestBed, createProgressBarDriver }) => {
    await initTestBed(`<ProgressBar value="{false}" />`);
    const driver = await createProgressBarDriver();
    const value = await driver.getProgressRatio();
    expect(value).toBe(0);
  });
});
