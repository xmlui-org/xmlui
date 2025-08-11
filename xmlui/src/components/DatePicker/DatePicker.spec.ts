import { expect, test } from "../../testing/fixtures";
import { format } from "date-fns";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.skip("component renders with default properties", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker />`, {});
  
  // Check that the component is visible
  await expect(page.locator("button")).toBeVisible();
});

test.skip("component displays initial value correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const initialDate = "05/25/2024";
  await initTestBed(`<DatePicker initialValue="${initialDate}" />`, {});

  await expect(page.getByText(initialDate)).toBeVisible();
});

test.skip("component opens calendar when clicked", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker />`, {});
  
  // Click the input to open calendar
  await page.locator("button").click();
  
  // Check that calendar is visible
  await expect(page.getByRole("menu")).toBeVisible();
});

test.skip("component allows date selection in single mode", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" mode="single" dateFormat="MM/dd/yyyy" />
      <Text id="text">Selected date: {datePicker.value}</Text>
    </Fragment>
  `, {});
  
  // Click to open calendar
  await page.locator("#datePicker").click();
  
  // Select the 15th day of the current month
  await page.locator(".rdp-day").filter({ hasText: "15" }).click();
  
  // Calendar should close after selection in single mode
  await expect(page.getByRole("menu")).not.toBeVisible();
  
  // Get the current month and year to verify the selected date
  const currentDate = new Date();
  const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
  const formattedDate = format(expectedDate, "MM/dd/yyyy");
  
  await expect(page.getByTestId("text")).toContainText(`Selected date: ${formattedDate}`);
});

test.skip("component allows date range selection", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" mode="range" dateFormat="MM/dd/yyyy" />
    </Fragment>
  `, {});
  
  // Click to open calendar
  await page.locator("#datePicker").click();
  
  // Select start date (1st of current month)
  await page.locator(".rdp-day").filter({ hasText: "1" }).click();
  
  // Select end date (10th of current month)
  await page.locator(".rdp-day").filter({ hasText: "10" }).click();
  
  // Get the current month and year to verify the selected date range
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10);
  const formattedStartDate = format(startDate, "MM/dd/yyyy");
  const formattedEndDate = format(endDate, "MM/dd/yyyy");
  
  await expect(page.getByText(`${formattedStartDate} - ${formattedEndDate}`)).toBeVisible();
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("component has correct accessibility attributes", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker label="Birth Date" />`, {});
  
  // Check for proper ARIA attributes
  await expect(page.locator("button")).toHaveAttribute("aria-haspopup", "dialog");
});

test.skip("component respects autoFocus property", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker autoFocus={true} />`, {});
  
  // Check that the input is automatically focused
  await expect(page.locator("button")).toBeFocused();
});

test.skip("component is keyboard navigable", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker />`, {});
  
  // Focus the button
  await page.locator("button").focus();
  await expect(page.locator("button")).toBeFocused();
  
  // Press Enter to open calendar
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  
  // Press Escape to close
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test.skip("component fires proper focus events", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'DatePicker focused' : 'DatePicker lost focus'}</Text>
      <DatePicker
        id="datePicker"
        gotFocus="isFocused = true"
        lostFocus="isFocused = false"
      />
    </App>
  `, {});
  
  // Focus the datepicker
  await page.locator("#datePicker").focus();
  await expect(page.getByTestId("focusText")).toHaveText("DatePicker focused");
  
  // Blur the datepicker
  await page.locator("body").click(); // Click outside to blur
  await expect(page.getByTestId("focusText")).toHaveText("DatePicker lost focus");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.skip("component shows different validation states", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  // Error state
  await initTestBed(`<DatePicker validationStatus="error" />`, {});
  await expect(page.locator("button")).toHaveClass(/error/);
  
  // Warning state
  await initTestBed(`<DatePicker validationStatus="warning" />`, {});
  await expect(page.locator("button")).toHaveClass(/warning/);
  
  // Valid state
  await initTestBed(`<DatePicker validationStatus="valid" />`, {});
  await expect(page.locator("button")).toHaveClass(/valid/);
});

test.skip("component displays placeholder text", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker placeholder="Select a date" />`, {});
  
  // Check that the placeholder is displayed
  await expect(page.locator("button")).toContainText("Select a date");
});

test.skip("component shows week numbers when enabled", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker showWeekNumber={true} />`, {});
  
  // Open the calendar
  await page.locator("button").click();
  
  // Week numbers should be visible
  await expect(page.locator("[role='rowheader']").first()).toBeVisible();
});

test.skip("component renders with adornments", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const startText = "From";
  const endText = "Select";
  await initTestBed(`
    <DatePicker
      startText="${startText}"
      endText="${endText}"
      startIcon="calendar"
      endIcon="calendar"
    />
  `, {});
  
  // Check that adornments are displayed
  await expect(page.getByText(startText)).toBeVisible();
  await expect(page.getByText(endText)).toBeVisible();
  await expect(page.locator("[data-icon-name='calendar']")).toBeVisible();
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.skip("component handles disabled state correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker enabled={false} />`, {});
  
  // Check that the button is disabled
  await expect(page.locator("button")).toBeDisabled();
  
  // Try to click the button
  await page.locator("button").click({ force: true });
  
  // Calendar should not open
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test.skip("component handles readOnly mode correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const initialDate = "05/25/2024";
  await initTestBed(`<DatePicker readOnly={true} initialValue="${initialDate}" />`, {});
  
  // Initial value should be displayed
  await expect(page.getByText(initialDate)).toBeVisible();
  
  // Click to open calendar
  await page.locator("button").click();
  
  // Try to select a different date
  await page.locator(".rdp-day").filter({ hasText: "1" }).click();
  
  // The date should not change
  await expect(page.getByText(initialDate)).toBeVisible();
});

test.skip("component handles minValue restrictions", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minValue = format(tomorrow, "MM/dd/yyyy");
  
  await initTestBed(`<DatePicker minValue="${minValue}" />`, {});
  
  // Open the calendar
  await page.locator("button").click();
  
  // Today should be disabled
  const today = new Date();
  const todayDay = today.getDate().toString();
  
  // Find today's date in the calendar and check if it's disabled
  const todayCell = page.locator(".rdp-day").filter({ hasText: todayDay }).first();
  await expect(todayCell).toHaveClass(/disabled/);
});

test.skip("component handles disabledDates correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const today = new Date();
  const testDayFormatted = format(new Date(today.getFullYear(), today.getMonth(), 15), "MM/dd/yyyy");
  
  await initTestBed(`<DatePicker disabledDates={['${testDayFormatted}']} />`, {});
  
  // Open the calendar
  await page.locator("button").click();
  
  // The 15th day should be disabled
  const testDay = "15";
  const testDayCell = page.locator(".rdp-day").filter({ hasText: testDay }).first();
  await expect(testDayCell).toHaveClass(/disabled/);
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.skip("component renders calendar efficiently", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`<DatePicker />`, {});
  
  // Open and close calendar multiple times
  const button = page.locator("button");
  
  // First open/close
  await button.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  
  // Second open/close
  await button.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  
  // Third open/close
  await button.click();
  await expect(page.getByRole("menu")).toBeVisible();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.skip("component works correctly within a form", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  const { testStateDriver } = await initTestBed(`
    <Form onSubmit="testState = 'submitted'">
      <DatePicker id="datePicker" required={true} />
      <Button type="submit">Submit</Button>
    </Form>
  `, {});
  
  // Open calendar and select a date
  await page.locator("#datePicker").click();
  await page.locator(".rdp-day").filter({ hasText: "15" }).click();
  
  // Submit the form
  await page.locator("button[type='submit']").click();
  
  // Check that form was submitted
  await expect.poll(() => testStateDriver.testState).toEqual("submitted");
});

test.skip("component API works correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests
  
  await initTestBed(`
    <App>
      <DatePicker id="picker" />
      <Button
        testId="setButton"
        onClick="picker.setValue('05/25/2024')"
      >Set Date</Button>
      <Button
        testId="focusButton"
        onClick="picker.focus()"
      >Focus DatePicker</Button>
    </App>
  `, {});
  
  // Test setValue API
  await page.getByTestId("setButton").click();
  await expect(page.getByText("05/25/2024")).toBeVisible();
  
  // Test focus API
  await page.getByTestId("focusButton").click();
  await expect(page.locator("#picker")).toBeFocused();
});
