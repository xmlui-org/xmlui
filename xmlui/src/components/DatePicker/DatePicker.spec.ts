import { expect, test } from "../../testing/fixtures";
import { format } from "date-fns";
import { getBounds } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" />`);
  await expect(page.getByTestId("datePicker")).toBeVisible();
});

test("component renders inline", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker inline testId="datePicker" />`);
  await expect(page.getByTestId("datePicker")).toBeVisible();
});

test("component handles correct date format", async ({ page, initTestBed }) => {
  await initTestBed(
    `<DatePicker testId="datePicker" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />`,
  );
  await expect(page.getByTestId("datePicker")).toHaveText("05/25/2024");
});

test("component displays initialValue correctly (single)", async ({ page, initTestBed }) => {
  await initTestBed(`
    <DatePicker
      initialValue="05/25/2024"
      dateFormat="MM/dd/yyyy"
      testId="datePicker"
      mode="single"
    />`);
  await expect(page.getByText("05/25/2024")).toBeVisible();
});

test("component displays initialValue correctly (range)", async ({ page, initTestBed }) => {
  await initTestBed(`
    <DatePicker
      initialValue="{{ from: '05/25/2024', to: '05/26/2024' }}"
      dateFormat="MM/dd/yyyy"
      mode="range"
      testId="datePicker"
    />`);
  await expect(page.getByText("05/25/2024 - 05/26/2024")).toBeVisible();
});

test("component opens calendar when clicked", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" />`);
  await expect(page.getByTestId("datePicker")).toBeVisible();
  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("menu")).toBeVisible();
});

test("component formats input to provided date format", async ({ page, initTestBed }) => {
  await initTestBed(
    `<DatePicker testId="datePicker" dateFormat="dd-MM-yyyy" initialValue="05/25/2024" />`,
  );
  await expect(page.getByTestId("datePicker")).toHaveText("25-05-2024");
});

test("component allows date selection in single mode", async ({ page, initTestBed }) => {
  await initTestBed(`
    <DatePicker testId="datePicker" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
  `);
  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.getByRole("grid", { name: "May" }).getByLabel("26").click();
  await expect(page.getByTestId("datePicker")).toHaveText("05/26/2024");
});

test("date changes when selecting a new date in single mode", async ({ page, initTestBed }) => {
  await initTestBed(`
    <DatePicker testId="datePicker" mode="single" dateFormat="MM/dd/yyyy" initialValue="05/25/2024" />
  `);
  const datePicker = page.getByTestId("datePicker");
  await datePicker.click();
  await page.getByRole("grid", { name: "May" }).getByLabel("26").click();
  await expect(page.getByTestId("datePicker")).toHaveText("05/26/2024");
  await datePicker.click();
  await page.getByRole("grid", { name: "May" }).getByLabel("27").click();
  await expect(page.getByTestId("datePicker")).toHaveText("05/27/2024");
});

test("component allows date range selection", async ({ page, initTestBed }) => {
  await initTestBed(
    `<DatePicker testId="datePicker" mode="range" dateFormat="MM/dd/yyyy" initialValue="{{ from: '05/25/2024', to: '05/26/2024' }}" />`,
  );
  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("menu")).toBeVisible();

  await page.getByRole("grid", { name: "May" }).getByLabel("26").click();
  await page.getByRole("grid", { name: "May" }).getByLabel("27").click();
  // Range mode defers commit until Proceed is pressed.
  await page.getByRole("button", { name: "Proceed" }).click();
  await expect(page.getByTestId("datePicker")).toHaveText("05/26/2024 - 05/27/2024");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has correct accessibility attributes", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" />`);
  await expect(page.getByTestId("datePicker")).toHaveAttribute("aria-haspopup", "true");
  await expect(page.getByTestId("datePicker")).toHaveAttribute("aria-expanded", "false");
});

test("component is focusable via label", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" label="Birth Date" />`);
  await expect(page.getByText("Birth Date")).toBeVisible();
  await page.getByText("Birth Date").click();
  // --- clicking the label to focus the input opens up the dialog
  await expect(
    page.getByRole("menu").getByRole("button", { name: "Go to the Previous Month" }),
  ).toBeFocused();
});

test("component respects autoFocus property", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" autoFocus="true" />`);
  await expect(page.getByTestId("datePicker")).toBeFocused();
});

test("component is keyboard navigable: open/close calendar menu", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" />`);

  // Focus the button
  await page.getByTestId("datePicker").focus();
  await expect(page.getByTestId("datePicker")).toBeFocused();

  // Press Enter to open calendar
  await expect(page.getByTestId("datePicker")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();

  // Press Escape to close
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("component is keyboard navigable: navigate controls inside calendar menu", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<DatePicker testId="datePicker" initialValue="05/25/2024" dateFormat="MM/dd/yyyy" />`,
  );

  // Focus the button
  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("menu")).toBeVisible();
  await expect(
    page.getByRole("menu").getByRole("button", { name: "Go to the Previous Month" }),
  ).toBeFocused();
  // Tab to the calendar grid
  await expect(
    page.getByRole("menu").getByRole("button", { name: "Go to the Previous Month" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("menu").getByRole("button", { name: "Go to the Next Month" }),
  ).toBeFocused();

  await expect(
    page.getByRole("menu").getByRole("button", { name: "Go to the Next Month" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu").getByLabel("Choose the Month")).toBeFocused();

  await expect(page.getByRole("menu").getByLabel("Choose the Month")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu").getByLabel("Choose the Year")).toBeFocused();

  await expect(page.getByRole("menu").getByLabel("Choose the Year")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("25")).toBeFocused();
});

test("component is keyboard navigable: navigate days inside calendar menu", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<DatePicker testId="datePicker" initialValue="05/15/2024" dateFormat="MM/dd/yyyy" />`,
  );

  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("menu")).toBeVisible();

  // The back navigation button is focused first

  // Tab to next nav button
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Tab");
  // Tab to month select
  await page.keyboard.press("Tab");
  // Tab to year select
  await page.keyboard.press("Tab");
  // Tab to the calendar grid
  await page.keyboard.press("Tab");

  await expect(page.getByRole("grid", { name: "May" }).getByLabel("15")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 14th")).toBeFocused();
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 14th")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 7th")).toBeFocused();
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 7th")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 8th")).toBeFocused();
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 8th")).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 15th")).toBeFocused();
});

test("component is keyboard navigable: enter new date", async ({ page, initTestBed }) => {
  await initTestBed(
    `<DatePicker testId="datePicker" initialValue="05/15/2024" dateFormat="MM/dd/yyyy"/>`,
  );

  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("menu")).toBeVisible();

  // The back navigation button is focused first

  // Tab to next nav button
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Tab");
  // Tab to month select
  await page.keyboard.press("Tab");
  // Tab to year select
  await page.keyboard.press("Tab");
  // Tab to the calendar grid
  await page.keyboard.press("Tab");

  await expect(page.getByRole("grid", { name: "May" }).getByLabel("15")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 14th")).toBeFocused();
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 14th")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("datePicker")).toHaveText("05/14/2024");
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("component fires proper focus event on gotFocus", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <DatePicker testId="datePicker" onGotFocus="testState = 'focused'" />
  `);
  await page.getByTestId("datePicker").focus();
  await expect.poll(testStateDriver.testState).toBe("focused");
});

test("component fires proper focus event on label focus", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <DatePicker testId="datePicker" onGotFocus="testState = 'focused'" label="test" />
  `);
  await page.getByText("test").click();
  await expect.poll(testStateDriver.testState).toBe("focused");
});

test("component fires proper blur event on lostFocus", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <DatePicker testId="datePicker" onLostFocus="testState = 'blurred'" />
  `);
  await page.getByTestId("datePicker").focus();
  await page.getByTestId("datePicker").blur();
  await expect.poll(testStateDriver.testState).toBe("blurred");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component shows error validation states", async ({ page, initTestBed }) => {
  // Error state
  await initTestBed(`<DatePicker testId="datePicker" validationStatus="error" />`, {
    testThemeVars: {
      "borderColor-DatePicker--error": "rgb(220, 38, 38)",
      "backgroundColor-DatePicker--error": "rgb(254, 202, 202)",
      "textColor-DatePicker--error": "rgb(127, 29, 29)",
    },
  });
  await expect(page.getByTestId("datePicker")).toHaveCSS("border-color", "rgb(220, 38, 38)");
  await expect(page.getByTestId("datePicker")).toHaveCSS("background-color", "rgb(254, 202, 202)");
  await expect(page.getByTestId("datePicker")).toHaveCSS("color", "rgb(127, 29, 29)");
});

test("component shows warning validation states", async ({ page, initTestBed }) => {
  // Warning state
  await initTestBed(`<DatePicker testId="datePicker" validationStatus="warning" />`, {
    testThemeVars: {
      "borderColor-DatePicker--warning": "rgb(255, 165, 0)",
      "backgroundColor-DatePicker--warning": "rgb(255, 235, 156)",
      "textColor-DatePicker--warning": "rgb(127, 29, 29)",
    },
  });
  await expect(page.getByTestId("datePicker")).toHaveCSS("border-color", "rgb(255, 165, 0)");
  await expect(page.getByTestId("datePicker")).toHaveCSS("background-color", "rgb(255, 235, 156)");
  await expect(page.getByTestId("datePicker")).toHaveCSS("color", "rgb(127, 29, 29)");
});

test("component shows valid validation states", async ({ page, initTestBed }) => {
  // Valid state
  await initTestBed(`<DatePicker testId="datePicker" validationStatus="valid" />`, {
    testThemeVars: {
      "borderColor-DatePicker--success": "rgb(0, 128, 0)",
      "backgroundColor-DatePicker--success": "rgb(220, 255, 220)",
      "textColor-DatePicker--success": "rgb(0, 100, 0)",
    },
  });
  await expect(page.getByTestId("datePicker")).toHaveCSS("border-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("datePicker")).toHaveCSS("background-color", "rgb(220, 255, 220)");
  await expect(page.getByTestId("datePicker")).toHaveCSS("color", "rgb(0, 100, 0)");
});

test("component displays placeholder text", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" placeholder="Select a date" />`);
  await expect(page.getByTestId("datePicker")).toContainText("Select a date");
});

test("component shows week numbers when enabled", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" showWeekNumber="true" />`);
  await expect(page.getByTestId("datePicker")).toBeVisible();
  await page.getByTestId("datePicker").click();
  await expect(page.locator("[role='rowheader']").first()).toBeVisible();
});

test("component renders with adornments", async ({ page, initTestBed }) => {
  const startText = "From";
  const endText = "Select";
  await initTestBed(
    `
    <DatePicker
      testId="datePicker"
      startText="${startText}"
      endText="${endText}"
      startIcon="test"
      endIcon="test"
    />
  `,
    {
      resources: {
        "icon.test": "resources/bell.svg",
      },
    },
  );
  await expect(page.getByText(startText)).toBeVisible();
  await expect(page.getByText(endText)).toBeVisible();
  await expect(page.getByTestId("datePicker").locator("svg")).toHaveCount(2);
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles disabled state correctly", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" enabled="false" />`);
  await expect(page.getByTestId("datePicker")).toBeDisabled();
});

test("disabled component does not react to user interactions", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" enabled="false" />`);
  await page.getByTestId("datePicker").click({ force: true });
  await expect(page.getByRole("menu")).not.toBeVisible();
});

test("component handles readOnly mode correctly", async ({ page, initTestBed }) => {
  const initialDate = "05/25/2024";
  await initTestBed(
    `<DatePicker testId="datePicker" readOnly="true" initialValue="${initialDate}" dateFormat="MM/dd/yyyy" />`,
  );
  await page.getByTestId("datePicker").click();
  await page.getByRole("grid", { name: "May" }).getByLabel("26").click();

  // The date should not change
  await expect(page.getByTestId("datePicker")).toHaveText(initialDate);
});

test("component handles startDate restrictions", async ({ page, initTestBed }) => {
  await initTestBed(
    `<DatePicker
        testId="datePicker"
        mode="range"
        startDate="05/01/2024"
        dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '05/26/2024', to: '05/27/2024' }}"
      />`,
  );
  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("button", { name: "Go to the Previous Month" })).toBeDisabled();
});

test("component handles endDate restrictions", async ({ page, initTestBed }) => {
  await initTestBed(
    `<DatePicker
        testId="datePicker"
        mode="range"
        endDate="06/01/2024"
        initialValue="{{ from: '05/26/2024', to: '05/27/2024' }}"
        dateFormat="MM/dd/yyyy"
      />`,
  );
  await page.getByTestId("datePicker").click();
  await expect(page.getByRole("button", { name: "Go to the Next Month" })).toBeDisabled();
});

test("component handles disabledDates correctly", async ({ page, initTestBed }) => {
  const testDay = 15;
  const today = new Date();
  const testDayFormatted = format(
    new Date(today.getFullYear(), today.getMonth(), testDay),
    "MM/dd/yyyy",
  );
  const testMonthName = format(today, "LLLL");

  await initTestBed(
    `<DatePicker testId="datePicker" disabledDates="{['${testDayFormatted}']}" />`,
    {},
  );
  await expect(page.getByTestId("datePicker")).toBeVisible();
  await page.getByTestId("datePicker").click();

  const testDayCell = page
    .getByRole("grid", { name: testMonthName })
    .getByLabel(testDay.toString());
  await expect(testDayCell).toBeDisabled();
});

test("disabled day is visually distinct from enabled day", async ({ page, initTestBed }) => {
  const today = new Date();
  const disabledDay = 15;
  const enabledDay = 16;
  const testMonthName = format(today, "LLLL");
  const disabledDateStr = format(new Date(today.getFullYear(), today.getMonth(), disabledDay), "MM/dd/yyyy");
  const monthStr = String(today.getMonth() + 1).padStart(2, "0");

  await initTestBed(
    `<DatePicker testId="datePicker" inline disabledDates="{['${disabledDateStr}']}" />`,
  );

  const grid = page.getByRole("grid", { name: testMonthName });
  const disabledButton = grid
    .locator(`td[data-day="${today.getFullYear()}-${monthStr}-${String(disabledDay).padStart(2, "0")}"] button`);
  const enabledButton = grid
    .locator(`td[data-day="${today.getFullYear()}-${monthStr}-${String(enabledDay).padStart(2, "0")}"] button`);

  const disabledBg = await disabledButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const enabledBg = await enabledButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  // Disabled day buttons now render as a red filled circle, so their
  // background colour must differ from regular day buttons.
  expect(disabledBg).not.toBe(enabledBg);
});

test("disabled day button has correct cursor style", async ({ page, initTestBed }) => {
  const today = new Date();
  const disabledDay = 15;
  const testMonthName = format(today, "LLLL");
  const disabledDateStr = format(new Date(today.getFullYear(), today.getMonth(), disabledDay), "MM/dd/yyyy");

  await initTestBed(
    `<DatePicker testId="datePicker" inline disabledDates="{['${disabledDateStr}']}" />`,
  );

  const grid = page.getByRole("grid", { name: testMonthName });
  const disabledButton = grid.getByText(disabledDay.toString(), { exact: true });

  const cursor = await disabledButton.evaluate((el) => window.getComputedStyle(el).cursor);
  expect(cursor).not.toBe("pointer");
});

test("disabled day should not show hover effect", async ({ page, initTestBed }) => {
  const today = new Date();
  const disabledDay = 15;
  const testMonthName = format(today, "LLLL");
  const disabledDateStr = format(new Date(today.getFullYear(), today.getMonth(), disabledDay), "MM/dd/yyyy");

  await initTestBed(
    `<DatePicker testId="datePicker" inline disabledDates="{['${disabledDateStr}']}" />`,
  );

  const grid = page.getByRole("grid", { name: testMonthName });
  const disabledButton = grid.getByText(disabledDay.toString(), { exact: true });

  const bgBefore = await disabledButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  await disabledButton.hover();
  const bgAfter = await disabledButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  expect(bgAfter, "Disabled day should not change background on hover").toBe(bgBefore);
});

test("clicking a disabled date does not select it", async ({ page, initTestBed }) => {
  const today = new Date();
  const disabledDay = 15;
  const disabledDateStr = format(new Date(today.getFullYear(), today.getMonth(), disabledDay), "MM/dd/yyyy");
  const testMonthName = format(today, "LLLL");

  await initTestBed(
    `<Fragment>
      <DatePicker id="dp" testId="datePicker" inline disabledDates="{['${disabledDateStr}']}" />
      <Text testId="value">{dp.value}</Text>
    </Fragment>`,
  );

  const grid = page.getByRole("grid", { name: testMonthName });
  const disabledButton = grid.getByText(disabledDay.toString(), { exact: true });

  await disabledButton.click({ force: true });
  await expect(page.getByTestId("value")).toHaveText("");
});

test("disabled date range has visual distinction", async ({ page, initTestBed }) => {
  const today = new Date();
  const testMonthName = format(today, "LLLL");
  const monthStr = String(today.getMonth() + 1).padStart(2, "0");
  const rangeStartStr = format(new Date(today.getFullYear(), today.getMonth(), 10), "MM/dd/yyyy");
  const rangeEndStr = format(new Date(today.getFullYear(), today.getMonth(), 20), "MM/dd/yyyy");

  await initTestBed(
    `<DatePicker testId="datePicker" inline disabledDates="{({from: '${rangeStartStr}', to: '${rangeEndStr}'})}" />`,
  );

  const grid = page.getByRole("grid", { name: testMonthName });
  const disabledButton = grid.locator(`td[data-day="${today.getFullYear()}-${monthStr}-15"] button`);
  const enabledButton = grid.locator(`td[data-day="${today.getFullYear()}-${monthStr}-08"] button`);

  const disabledBg = await disabledButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
  const enabledBg = await enabledButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);

  expect(disabledBg).not.toBe(enabledBg);
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component value API works", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" initialValue="05/25/2024" dateFormat="MM/dd/yyyy" />
      <Text testId="text">{datePicker.value}</Text>
    </Fragment>
  `);
  await expect(page.getByTestId("text")).toHaveText("05/25/2024");
});

test("component setValue API works", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" initialValue="05/25/2024" dateFormat="MM/dd/yyyy" />
      <Button testId="btn" onClick="datePicker.setValue('06/01/2024')" />
    </Fragment>
  `);
  await page.getByTestId("btn").click();
  await expect(page.getByTestId("datePicker")).toHaveText("06/01/2024");
});

test("bindTo syncs $data and value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Form hideButtonRow="true">
      <DatePicker id="boundDatePicker" bindTo="dateValue" dateFormat="MM/dd/yyyy" />
      <Button testId="setBtn" onClick="boundDatePicker.setValue('06/01/2024')" />
      <Text testId="dataValue">{$data.dateValue}</Text>
      <Text testId="compValue">{boundDatePicker.value}</Text>
    </Form>
  `);

  await page.getByTestId("setBtn").click();
  await expect(page.getByTestId("dataValue")).toHaveText("06/01/2024");
  await expect(page.getByTestId("compValue")).toHaveText("06/01/2024");
});

test("component focus API works", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <DatePicker id="datePicker" initialValue="05/25/2024" dateFormat="MM/dd/yyyy" />
      <Button testId="focusBtn" onClick="datePicker.focus()" />
    </Fragment>
  `);
  await page.getByTestId("focusBtn").click();
  await expect(page.getByTestId("datePicker")).toBeFocused();
});

test("component works correctly within a form", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <Form onSubmit="(data) => testState = data.testField" data="{{ testField: '05/25/2024' }}">
      <FormItem type="datePicker" label="Choose Date" bindTo="testField" />
    </Form>
  `);
  const formElement = page.locator("form");
  const dateInput = formElement.getByLabel("Choose Date");
  await expect(dateInput).toBeVisible();
  await expect(dateInput).toHaveText("05/25/2024");

  // Submit the form
  await page.locator("[type=submit]").click();

  // Check that the form was submitted
  await expect.poll(testStateDriver.testState).toEqual("05/25/2024");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker width="200px" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker width="200px" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test").locator('[data-part-id="labeledItem"]');
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<DatePicker width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<DatePicker width="50%" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test").locator('[data-part-id="labeledItem"]');
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

// Regression test for dropdown content clipping with a narrow trigger.
// Bug: the dynamic theme class that carries the trigger's width is also
// applied to the popover content (DatePicker.tsx passes the same className as
// contentClassName), so a narrow trigger like 150px would shrink the calendar
// dropdown and clip the day columns. The dropdown must stay at least as wide
// as its natural calendar content.
test("dropdown is not clipped by a narrow trigger width", async ({ page, initTestBed }) => {
  await initTestBed(`<DatePicker testId="datePicker" width="150px" />`);

  const trigger = page.getByTestId("datePicker");
  await trigger.click();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();

  const triggerBox = await trigger.boundingBox();
  const menuBox = await menu.boundingBox();

  expect(menuBox.width).toBeGreaterThan(triggerBox.width);

  const hasHorizontalOverflow = await menu.evaluate(
    (el) => el.scrollWidth > el.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
});

// Regression test for the dropdown overflowing the viewport on small screens.
// At narrow viewport widths the dropdown switches to a bottom-sheet layout
// (shadcn's responsive Date Picker pattern); it must stay within the viewport
// no matter how narrow the trigger is.
test("dropdown stays within the viewport on narrow screens", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await initTestBed(`<DatePicker testId="datePicker" width="150px" />`);

  const trigger = page.getByTestId("datePicker");
  await trigger.click();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();

  // Wait for the slide-up animation to settle before measuring position.
  await page.waitForFunction(() => {
    const el = document.querySelector('[role="menu"]') as HTMLElement | null;
    if (!el) return false;
    const transform = getComputedStyle(el).transform;
    return transform === "none" || transform.startsWith("matrix(1, 0, 0, 1, 0, 0)");
  });

  const menuBox = await menu.boundingBox();
  const viewportSize = page.viewportSize();

  // The dropdown must not extend past either edge of the viewport. Allow 1px
  // of subpixel tolerance.
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(viewportSize.width + 1);
  expect(menuBox.x).toBeGreaterThanOrEqual(-1);
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportSize.height + 1);
});

// Regression test for the dropdown overflowing the viewport vertically — most
// visible in range mode where two months stack vertically on narrow screens.
// At this viewport size the dropdown switches to a bottom-sheet (mobile)
// layout that must stay within the viewport and scroll its content
// internally instead of pushing past the screen edge.
test("dropdown height is capped by the viewport in range mode", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 375, height: 500 });
  await initTestBed(`<DatePicker testId="datePicker" mode="range" />`);

  const trigger = page.getByTestId("datePicker");
  await trigger.click();

  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();

  // Wait for the slide-up animation to settle before measuring position.
  await page.waitForFunction(() => {
    const el = document.querySelector('[role="menu"]') as HTMLElement | null;
    if (!el) return false;
    const transform = getComputedStyle(el).transform;
    return transform === "none" || transform.startsWith("matrix(1, 0, 0, 1, 0, 0)");
  });

  const menuBox = await menu.boundingBox();
  const viewportSize = page.viewportSize();

  // The dropdown must not extend past the bottom edge of the viewport. Allow
  // 1px of subpixel tolerance.
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(viewportSize.height + 1);
  expect(menuBox.y).toBeGreaterThanOrEqual(-1);

  // In range mode at 500px viewport height, two stacked months don't fit, so
  // the dropdown must scroll internally rather than overflow.
  const hasVerticalScroll = await menu.evaluate(
    (el) => el.scrollHeight > el.clientHeight,
  );
  expect(hasVerticalScroll).toBe(true);
});

// Regression test for height alignment with sibling input components.
// Bug: DatePicker rendered taller than TextBox/Select/NumberBox/AutoComplete
// because PR #3280 added `line-height: normal` to other inputs but missed
// DatePicker, letting its button trigger inherit the page's larger line-height
// and inflate beyond the shared 2.5rem min-height.
test("height matches sibling input components", async ({ page, initTestBed }) => {
  await initTestBed(`
    <Fragment>
      <DatePicker testId="datePicker" />
      <TextBox testId="textBox" />
      <Select testId="select" />
      <NumberBox testId="numberBox" />
      <AutoComplete testId="autoComplete" />
    </Fragment>
  `);

  await expect(page.getByTestId("datePicker")).toBeVisible();
  await expect(page.getByTestId("textBox")).toBeVisible();
  await expect(page.getByTestId("select")).toBeVisible();
  await expect(page.getByTestId("numberBox")).toBeVisible();
  await expect(page.getByTestId("autoComplete")).toBeVisible();

  const { height: datePickerHeight } = await getBounds(page.getByTestId("datePicker"));
  const { height: textBoxHeight } = await getBounds(page.getByTestId("textBox"));
  const { height: selectHeight } = await getBounds(page.getByTestId("select"));
  const { height: numberBoxHeight } = await getBounds(page.getByTestId("numberBox"));
  const { height: autoCompleteHeight } = await getBounds(page.getByTestId("autoComplete"));

  expect(datePickerHeight).toBe(textBoxHeight);
  expect(datePickerHeight).toBe(selectHeight);
  expect(datePickerHeight).toBe(numberBoxHeight);
  expect(datePickerHeight).toBe(autoCompleteHeight);
});

test("uses line-height normal to prevent height inflation", async ({ page, initTestBed }) => {
  // Render inside a parent with a larger inherited line-height to prove the
  // DatePicker resets it. Without `line-height: normal` on `.datePicker`, the
  // button trigger inherits 2 from the parent and grows past min-height.
  await initTestBed(`
    <Stack style="line-height: 2;">
      <DatePicker testId="datePicker" />
    </Stack>
  `);

  await expect(page.getByTestId("datePicker")).toHaveCSS("line-height", "normal");
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("requireLabelMode='markRequired' shows asterisk for required fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="test" label="Birth Date" required="true" requireLabelMode="markRequired" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markRequired' hides indicator for optional fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="test" label="Birth Date" required="false" requireLabelMode="markRequired" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markOptional' shows optional tag for optional fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="test" label="Birth Date" required="false" requireLabelMode="markOptional" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("requireLabelMode='markOptional' hides indicator for required fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="test" label="Birth Date" required="true" requireLabelMode="markOptional" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows asterisk for required fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="test" label="Birth Date" required="true" requireLabelMode="markBoth" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows optional tag for optional fields", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker testId="test" label="Birth Date" required="false" requireLabelMode="markBoth" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).not.toContainText("*");
    await expect(label).toContainText("(Optional)");
  });

  test("input requireLabelMode overrides Form itemRequireLabelMode", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markRequired">
        <DatePicker testId="test" label="Birth Date" required="false" requireLabelMode="markOptional" bindTo="birthDate" />
      </Form>
    `);

    const label = page.getByText("Birth Date");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("input inherits Form itemRequireLabelMode when not specified", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markBoth">
        <DatePicker testId="test1" label="Required Field" required="true" bindTo="field1" />
        <DatePicker testId="test2" label="Optional Field" required="false" bindTo="field2" />
      </Form>
    `);

    const requiredLabel = page.getByText("Required Field");
    const optionalLabel = page.getByText("Optional Field");

    await expect(requiredLabel).toContainText("*");
    await expect(requiredLabel).not.toContainText("(Optional)");
    await expect(optionalLabel).toContainText("(Optional)");
    await expect(optionalLabel).not.toContainText("*");
  });
});

// =============================================================================
// VALIDATION FEEDBACK TESTS
// =============================================================================

test.describe("Validation Feedback", () => {
  test("shows helper text and no icon when verboseValidationFeedback is true (default)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{true}">
        <DatePicker testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);

    // Trigger validation by submitting empty required field
    await page.getByTestId("submit").click();

    // Check for helper text
    await expect(page.getByText("This field is required")).toBeVisible();

    // Check absence of concise feedback icon
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).not.toBeVisible();
  });

  test("shows icon and no helper text when verboseValidationFeedback is false", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DatePicker testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);

    // Trigger validation
    await page.getByTestId("submit").click();

    // Check for helper text (should be hidden)
    await expect(page.getByText("This field is required")).not.toBeVisible();

    // Check for concise feedback icon
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).toBeVisible();

    // Check that it shows error icon
    await expect(conciseFeedback.locator("[data-icon-name='error']")).toBeVisible();
  });

  test("prop on component overrides form default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{true}">
        <DatePicker testId="input" bindTo="input" verboseValidationFeedback="{false}" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);

    await page.getByTestId("submit").click();

    // Helper text hidden
    await expect(page.getByText("This field is required")).not.toBeVisible();

    // Concise feedback visible
    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).toBeVisible();
  });

  test("shows valid icon in concise mode when valid", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DatePicker testId="input" bindTo="input" required="{true}" validationMode="onChanged" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);

    // First make it invalid
    await page.getByTestId("submit").click();

    // Now make it valid
    await page.getByTestId("input").click();
    // Select any enabled date (usually first available in current view)
    await page.locator("[role='gridcell']:not([aria-disabled='true'])").first().click();

    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    await expect(conciseFeedback).toBeVisible();
    await expect(conciseFeedback.locator("[data-icon-name='checkmark']")).toBeVisible();
  });

  test("concise mode tooltip shows error message on hover", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form verboseValidationFeedback="{false}">
        <DatePicker testId="input" bindTo="input" required="{true}" />
        <Button testId="submit" type="submit">Submit</Button>
      </Form>
    `);

    await page.getByTestId("submit").click();

    const conciseFeedback = page.locator("[data-part-id='conciseValidationFeedback']");
    // Hover over the icon
    await conciseFeedback.hover();

    // Check tooltip content
    const tooltip = page.locator("[data-tooltip-container]");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("This field is required");
  });

  test("does not duplicate label when inside Form with label prop", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Form>
        <DatePicker
          testId="test"
          label="Select date"
          labelPosition="top"
        />
      </Form>
    `);

    // Should only have one label with the text "Select date"
    const labels = page.getByText("Select date");
    await expect(labels).toHaveCount(1);
  });
});

// =============================================================================
// RANGE MODE SPECIFIC TESTS
// =============================================================================

test.describe("Range Mode Features", () => {
  test("range mode shows two months side by side", async ({ page, initTestBed }) => {
    await initTestBed(`
      <DatePicker testId="datePicker" mode="range" dateFormat="MM/dd/yyyy" />
    `);

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Should have two month grids visible
    const grids = page.getByRole("grid");
    await expect(grids).toHaveCount(2);
  });

  test("range mode does not show outside days from adjacent months", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <DatePicker 
        testId="datePicker" 
        mode="range" 
        dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '03/15/2024', to: '04/15/2024' }}"
      />
    `);

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    // In range mode with pagedNavigation, outside days should not be shown
    // This prevents overlap between the two displayed months
    const marchGrid = page.getByRole("grid", { name: "March" });
    const aprilGrid = page.getByRole("grid", { name: "April" });

    await expect(marchGrid).toBeVisible();
    await expect(aprilGrid).toBeVisible();
  });

  test("selected range dates have background styling", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <DatePicker
        testId="datePicker"
        mode="range"
        dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}"
      />
    `,
      {
        testThemeVars: {
          "backgroundColor-item-DatePicker--hover": "rgb(240, 240, 240)",
        },
      },
    );

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Range middle cells use a solid hover-colour background. Range start and
    // end render as clean circular day buttons; their cell uses a half-and-half
    // gradient (transparent on the outside, hover-colour on the inside) so the
    // grey middle bar flows into the inward side of the ball.
    const middleDate = page
      .getByRole("grid", { name: "May" })
      .locator("[data-day]")
      .filter({ hasText: /^12$/ });
    await expect(middleDate).toHaveCSS("background-color", "rgb(240, 240, 240)");

    const startDate = page
      .getByRole("grid", { name: "May" })
      .locator("[data-day]")
      .filter({ hasText: /^10$/ });
    const endDate = page
      .getByRole("grid", { name: "May" })
      .locator("[data-day]")
      .filter({ hasText: /^15$/ });
    await expect(startDate).toHaveCSS("background-image", /linear-gradient/);
    await expect(endDate).toHaveCSS("background-image", /linear-gradient/);
  });

  test("single selected date in range mode renders as a clean ball", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(
      `
      <DatePicker
        testId="datePicker"
        mode="range"
        dateFormat="MM/dd/yyyy"
      />
    `,
      {
        testThemeVars: {
          "backgroundColor-item-DatePicker--hover": "rgb(240, 240, 240)",
        },
      },
    );

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Select first date — in range mode this puts the picker into the
    // single-selected state (pending range with only `from`). The cell must
    // not paint any background behind the day_button — the ball stands alone.
    await page
      .getByRole("grid")
      .first()
      .locator("[data-day]")
      .filter({ hasText: /^10$/ })
      .first()
      .click();

    const selectedDate = page
      .getByRole("grid")
      .first()
      .locator("[data-day]")
      .filter({ hasText: /^10$/ })
      .first();
    await expect(selectedDate).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(selectedDate).toHaveCSS("background-image", "none");
  });

  test("hover preview shows background on intermediate dates", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <DatePicker 
        testId="datePicker" 
        mode="range" 
        dateFormat="MM/dd/yyyy"
      />
    `,
      {
        testThemeVars: {
          "backgroundColor-item-DatePicker--hover": "rgb(240, 240, 240)",
        },
      },
    );

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    const grid = page.getByRole("grid").first();

    // Select first date (day 10)
    await grid.locator("[data-day]").filter({ hasText: /^10$/ }).first().click();

    // Hover over a later date (day 15)
    const hoverTarget = grid.locator("[data-day]").filter({ hasText: /^15$/ }).first();
    await hoverTarget.hover();

    // Intermediate dates (11, 12, 13, 14) should have background during hover
    const intermediateDate = grid.locator("[data-day]").filter({ hasText: /^12$/ }).first();
    await expect(intermediateDate).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("background transitions smoothly on hover", async ({ page, initTestBed }) => {
    await initTestBed(`
      <DatePicker 
        testId="datePicker" 
        mode="range" 
        dateFormat="MM/dd/yyyy"
      />
    `);

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    const grid = page.getByRole("grid").first();
    const firstDay = grid.locator("[data-day]").first();

    // Check that transition property is set for smooth animation
    await expect(firstDay).toHaveCSS("transition", /background-color/);
  });

  test("range start and end dates maintain their styling during hover", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <DatePicker 
        testId="datePicker" 
        mode="range" 
        dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}"
      />
    `);

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    const grid = page.getByRole("grid", { name: "May" });

    // Hover over a date outside the range
    const hoverTarget = grid.locator("[data-day]").filter({ hasText: /^20$/ }).first();
    await hoverTarget.hover();

    // Start and end dates should still have their button styling (circular background)
    const startDateButton = grid
      .locator("[data-day]")
      .filter({ hasText: /^10$/ })
      .first()
      .locator("button");
    const endDateButton = grid
      .locator("[data-day]")
      .filter({ hasText: /^15$/ })
      .first()
      .locator("button");

    // These should have border radius (circular style)
    await expect(startDateButton).toHaveCSS("border-radius", "100%");
    await expect(endDateButton).toHaveCSS("border-radius", "100%");
  });

  test("range selection completes after selecting two dates and pressing Proceed", async ({
    page,
    initTestBed,
  }) => {
    await initTestBed(`
      <DatePicker
        testId="datePicker"
        mode="range"
        dateFormat="MM/dd/yyyy"
      />
    `);

    await page.getByTestId("datePicker").click();
    await expect(page.getByRole("menu")).toBeVisible();

    const grid = page.getByRole("grid").first();

    // Select first date — the dropdown defers the commit until the user
    // confirms via Proceed.
    await grid.locator("[data-day]").filter({ hasText: /^10$/ }).first().click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Select second date — still pending; the menu stays open.
    await grid.locator("[data-day]").filter({ hasText: /^15$/ }).first().click();
    await expect(page.getByRole("menu")).toBeVisible();

    // The trigger still shows the (empty) committed value until Proceed.
    await expect(page.getByTestId("datePicker")).not.toContainText(" - ");

    await page.getByRole("button", { name: "Proceed" }).click();

    const datePickerText = await page.getByTestId("datePicker").textContent();
    expect(datePickerText).toContain(" - ");
  });

  test("didChange event fires with range object after Proceed", async ({
    page,
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker
        testId="datePicker"
        mode="range"
        dateFormat="MM/dd/yyyy"
        onDidChange="(value) => testState = value"
      />
    `);

    await page.getByTestId("datePicker").click();
    const grid = page.getByRole("grid").first();

    // Two date clicks update the pending range; didChange should NOT fire yet.
    await grid.locator("[data-day]").filter({ hasText: /^10$/ }).first().click();
    await grid.locator("[data-day]").filter({ hasText: /^15$/ }).first().click();

    // Commit the selection.
    await page.getByRole("button", { name: "Proceed" }).click();

    const state = await testStateDriver.testState();
    expect(state).toHaveProperty("from");
    expect(state).toHaveProperty("to");
  });

  test("Cancel discards the pending range", async ({ page, initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker
        testId="datePicker"
        mode="range"
        dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '05/10/2024', to: '05/15/2024' }}"
        onDidChange="(value) => testState = value"
      />
    `);

    await page.getByTestId("datePicker").click();
    const grid = page.getByRole("grid", { name: "May" });

    // Change the range to 20-25 but cancel before committing.
    await grid.locator("[data-day]").filter({ hasText: /^20$/ }).first().click();
    await grid.locator("[data-day]").filter({ hasText: /^25$/ }).first().click();
    await page.getByRole("button", { name: "Cancel" }).click();

    // The committed value is unchanged and onDidChange did not fire.
    await expect(page.getByTestId("datePicker")).toContainText("05/10/2024 - 05/15/2024");
    const state = await testStateDriver.testState();
    expect(state).toBe(null);
  });
});
