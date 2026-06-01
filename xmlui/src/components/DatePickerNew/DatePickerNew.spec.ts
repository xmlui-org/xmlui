import { expect, test } from "../../testing/fixtures";

// Smoke coverage for the Ark UI backed DatePickerNew. The full interaction
// surface is exercised by the original component's app-level e2e suite; these
// tests lock in that the component mounts, honors its value props, and opens
// inside the xmlui runtime after being moved into core.
test.describe("DatePickerNew - smoke", () => {
  test("renders", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePickerNew testId="dp" />`);
    await expect(page.getByTestId("dp")).toBeVisible();
  });

  test("renders inline", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePickerNew inline testId="dp" />`);
    await expect(page.getByTestId("dp")).toBeVisible();
  });

  test("shows single initialValue in the input", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePickerNew testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );
    await expect(page.getByTestId("dp").locator("input").first()).toHaveValue("05/25/2024");
  });

  test("shows range initialValue in both inputs", async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePickerNew testId="dp" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/25/2024', to: '05/26/2024' }}" />`,
    );
    const inputs = page.getByTestId("dp").locator("input");
    await expect(inputs.nth(0)).toHaveValue("05/25/2024");
    await expect(inputs.nth(1)).toHaveValue("05/26/2024");
  });

  test("opens the calendar from the trigger", async ({ page, initTestBed }) => {
    await initTestBed(`<DatePickerNew testId="dp" />`);
    await expect(page.getByTestId("dp")).toBeVisible();
    await page.getByRole("button", { name: "Open calendar" }).click();
    await expect(page.getByTestId("dp")).toHaveAttribute("data-state", "open");
  });

  // The styling was migrated to the xmlui theme-variable system (createThemeVar +
  // defaultThemeVars), so the SCSS no longer carries inline fallbacks. These
  // checks lock in that the theme variables resolve to real values: an unset var
  // would compute to an empty / transparent value instead.
  test("theme variables resolve (Input inheritance + day defaults)", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `<DatePickerNew testId="dp" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
    );

    // Input-family inheritance: the trigger border resolves to a solid border.
    const borderStyle = await page
      .getByTestId("dp")
      .locator('[data-part="control"]')
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopStyle);
    expect(borderStyle).toBe("solid");

    // Day-cell default: the selected day paints a non-transparent background.
    await page.getByRole("button", { name: "Open calendar" }).click();
    const selectedBg = await page
      .locator('[data-selected]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(selectedBg).not.toBe("rgba(0, 0, 0, 0)");
    expect(selectedBg).not.toBe("transparent");
  });
});
