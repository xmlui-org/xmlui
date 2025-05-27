import { expect, test } from "../../testing/fixtures";
import { format } from "date-fns";

test("renders with default props", async ({ initTestBed, page }) => {
  await initTestBed(`
    <DatePicker />
  `);

  await expect(page.locator("button")).toBeVisible();
});

test("displays placeholder text", async ({ initTestBed, page }) => {
  const placeholder = "This is a placeholder";
  await initTestBed(`
    <DatePicker placeholder="${placeholder}" />
  `);

  await expect(page.getByPlaceholder(placeholder)).toBeVisible();
});

test("initialValue sets the date", async ({ initTestBed, page }) => {
  const initialDate = "05/25/2024";
  await initTestBed(`
    <DatePicker initialValue="${initialDate}" />
  `);

  await expect(page.getByText(initialDate)).toBeVisible();
});

test("opens calendar when clicked", async ({ initTestBed, page, createDatePickerDriver }) => {
  await initTestBed(`
    <DatePicker />
  `);

  const driver = await createDatePickerDriver();

  await driver.click();

  await expect(page.getByRole("menu")).toBeVisible();
});

test("selects a date in single mode", async ({ initTestBed, page, createDatePickerDriver }) => {
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" mode="single" dateFormat="MM/dd/yyyy" />
      <Text id="text">Selected date: {datePicker.value}</Text>
    </Fragment>
  `);

  const driver = await createDatePickerDriver("datePicker");

  await driver.click();

  // Select the 15th day of the current month
  await driver.pickADay("15");

  // Calendar should close after selection in single mode
  await expect(page.getByRole("menu")).not.toBeVisible();

  // Get the current month and year to verify the selected date
  const currentDate = new Date();
  const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
  const formattedDate = format(expectedDate, "MM/dd/yyyy");

  await expect(page.getByTestId("text")).toContainText(`Selected date: ${formattedDate}`);
});

test("selects a date range in range mode", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" mode="range" dateFormat="MM/dd/yyyy" />
    </Fragment>
  `);

  const driver = await createDatePickerDriver("datePicker");

  await driver.click();

  // Select start date (1st of current month)
  await driver.pickADay("1");

  // Select end date (10th of current month)
  await driver.pickADay("10");

  await driver.toggleDropdownVisibility();

  // Get the current month and year to verify the selected date range
  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 10);
  const formattedStartDate = format(startDate, "MM/dd/yyyy");
  const formattedEndDate = format(endDate, "MM/dd/yyyy");

  await expect(page.getByText(`${formattedStartDate} - ${formattedEndDate}`)).toBeVisible();
});

test("disabled state prevents interaction", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  await initTestBed(`
    <DatePicker enabled="false" />
  `);

  const driver = await createDatePickerDriver();

  await driver.click({ force: true }); // Force click since it's disabled

  // Calendar should not open
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("inline mode shows calendar without clicking", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  await initTestBed(`
    <DatePicker inline="true" />
  `);

  const driver = await createDatePickerDriver();

  // Calendar should be visible immediately without clicking
  await expect(driver.component).toBeVisible();
});

test("shows week numbers when enabled", async ({ initTestBed, page, createDatePickerDriver }) => {
  await initTestBed(`
    <DatePicker showWeekNumber="true" inline="true" />
  `);

  const driver = await createDatePickerDriver();

  // Week numbers should be visible
  await expect(driver.component.getByRole("rowheader").first()).toBeVisible();
});

test("handles different date formats", async ({ initTestBed, page, createDatePickerDriver }) => {
  const dateFormat = "yyyy-MM-dd";
  const initialDate = "05/25/2024";
  await initTestBed(`
    <DatePicker dateFormat="${dateFormat}" initialValue="${initialDate}" />
  `);

  // The date should be displayed in the specified format
  const date = new Date(2024, 4, 25); // May 25, 2024
  const formattedDate = format(date, dateFormat);

  const driver = await createDatePickerDriver();
  await expect(driver.component).toContainText(formattedDate);
});

test("weekStartsOn changes first day of week", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <DatePicker weekStartsOn="1" inline="true" />
  `);

  // The first day in the week row should be Monday
  const weekDays = page.locator('[scope="col"]');
  await expect(weekDays.first()).toContainText("Mo");
});

test.fixme("fromDate restricts selectable dates", async ({ initTestBed, page }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fromDate = format(tomorrow, "MM/dd/yyyy");

  await initTestBed(`
    <DatePicker fromDate="${fromDate}" inline="true" />
  `);

  // Today should be disabled
  const today = new Date();
  const todayDay = today.getDate().toString();

  // Find today's date in the calendar and check if it's disabled
  const todayCell = page.locator(".day").filter({ hasText: todayDay }).first();
  await expect(todayCell).toHaveClass(/disabled/);
});

test.fixme("toDate restricts selectable dates", async ({ initTestBed, page }) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const toDate = format(yesterday, "MM/dd/yyyy");

  await initTestBed(`
    <DatePicker toDate="${toDate}" inline="true" />
  `);

  // Today should be disabled
  const today = new Date();
  const todayDay = today.getDate().toString();

  // Find today's date in the calendar and check if it's disabled
  const todayCell = page.locator(".day").filter({ hasText: todayDay }).first();
  await expect(todayCell).toHaveClass(/disabled/);
});

test.skip("disabledDates prevents selection of specific dates", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  const today = new Date();
  const todayFormatted = format(today, "MM/dd/yyyy");

  await initTestBed(`
    <DatePicker disabledDates="{['${todayFormatted}']}" />
  `);

  const driver = await createDatePickerDriver();
  await driver.toggleDropdownVisibility();

  // Today should be disabled
  const todayDay = today.getDate().toString();
  await driver.pickADay(todayDay);

  await expect(page.getByRole("menu")).toBeVisible();
});

test("didChange event fires when date is selected", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  await initTestBed(`
    <App var.selectedDate="">
      <DatePicker id="datePicker" onDidChange="(val) => selectedDate = val" />
      <Text testId="text">{selectedDate}</Text>
    </App>
  `);

  const driver = await createDatePickerDriver("datePicker");
  await driver.toggleDropdownVisibility();
  // Select the 15 day of the current month
  await driver.pickADay("15");

  // The selected date should be displayed in the text element
  const currentDate = new Date();
  const expectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
  const formattedDate = format(expectedDate, "MM/dd/yyyy");

  await expect(page.getByTestId("text")).toHaveText(formattedDate);
});

test("gotFocus and lostFocus events work correctly", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'DatePicker focused' : 'DatePicker lost focus'}</Text>
      <DatePicker
        id="datePicker"
        onGotFocus="isFocused = true"
        onLostFocus="isFocused = false"
      />
    </App>
  `);

  // Initial state
  await expect(page.getByTestId("focusText")).toHaveText("DatePicker lost focus");

  // Focus the datepicker
  const driver = await createDatePickerDriver("datePicker");
  await driver.click();
  await expect(page.getByTestId("focusText")).toHaveText("DatePicker focused");

  // Blur the datepicker
  await page.locator("body").click(); // Click outside to blur
  await expect(page.getByTestId("focusText")).toHaveText("DatePicker lost focus");
});

test("setValue API works correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <DatePicker id="picker" />
      <Button
        testId="setButton"
        label="Set Date"
        onClick="picker.setValue('05/25/2024')" />
      <Button
        testId="clearButton"
        label="Clear Date"
        onClick="picker.setValue('')" />
    </App>
  `);

  // Initially empty
  await expect(page.getByText("05/25/2024")).not.toBeVisible();

  // Set the date
  await page.getByTestId("setButton").click();
  await expect(page.getByText("05/25/2024")).toBeVisible();

  // Clear the date
  await page.getByTestId("clearButton").click();
  await expect(page.getByText("05/25/2024")).not.toBeVisible();
});

test("focus API brings focus to the component", async ({ initTestBed, page, createDatePickerDriver }) => {
  await initTestBed(`
    <App var.isFocused="false">
      <DatePicker id="picker" />
      <Button
        testId="focusButton"
        label="Focus DatePicker"
        onClick="picker.focus()"  
       />
    </App>
  `);
  const driver = await createDatePickerDriver("picker");

  // Focus the datepicker using the API
  await page.getByTestId("focusButton").click();

  // Check if the datepicker is focused
  await expect(driver.component).toBeFocused();
});

test("autoFocus brings focus to the component on load", async ({ initTestBed, createDatePickerDriver }) => {
    await initTestBed(`
      <DatePicker autoFocus="true" />
    `);

    const driver = await createDatePickerDriver();

    // Check if the datepicker is focused
    await expect(driver.component).toBeFocused();
  },);

test("readOnly prevents date selection but shows calendar", async ({
  initTestBed,
  page,
  createDatePickerDriver,
}) => {
  const initialDate = "05/25/2024";
  await initTestBed(`
    <DatePicker readOnly="true" initialValue="${initialDate}" />
  `);

  // Initial value should be displayed
  await expect(page.getByText(initialDate)).toBeVisible();

  // Click to open calendar
  const driver = await createDatePickerDriver();
  await driver.toggleDropdownVisibility();
  await expect(page.getByRole("menu")).toBeVisible();

  // Try to select a different date
  await driver.pickADay("1");

  // The date should not change
  await expect(driver.component.getByText(initialDate)).toBeVisible();
});

test("renders with adornments (startText, startIcon, endText, endIcon)", async ({
  initTestBed,
  page,
}) => {
  const startText = "From";
  const endText = "Select";
  await initTestBed(`
    <DatePicker
      startText="${startText}"
      endText="${endText}"
      startIcon="calendar"
      endIcon="calendar"
    />
  `);

  const adornments = page.getByRole("presentation");
  const numberOfAdornments = await adornments.count();
  expect(numberOfAdornments).toBe(2);
  await expect(page.getByText(startText)).toBeVisible();
  await expect(page.getByText(endText)).toBeVisible();
});
