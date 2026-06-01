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
});
