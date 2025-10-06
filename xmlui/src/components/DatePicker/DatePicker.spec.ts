import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { format } from "date-fns";

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
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();

  // Press Escape to close
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
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("menu").getByRole("button", { name: "Go to the Next Month" }),
  ).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("menu").getByLabel("Choose the Month")).toBeFocused();

  await page.keyboard.press("Tab");
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
  await page.keyboard.press("Tab");
  // Tab to month select
  await page.keyboard.press("Tab");
  // Tab to year select
  await page.keyboard.press("Tab");
  // Tab to the calendar grid
  await page.keyboard.press("Tab");

  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 14th")).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 7th")).toBeFocused();
  await page.keyboard.press("ArrowRight");
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
  await page.keyboard.press("Tab");
  // Tab to month select
  await page.keyboard.press("Tab");
  // Tab to year select
  await page.keyboard.press("Tab");
  // Tab to the calendar grid
  await page.keyboard.press("Tab");

  await page.keyboard.press("ArrowLeft");
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
      "borderColor-DatePicker-error": "rgb(220, 38, 38)",
      "backgroundColor-DatePicker-error": "rgb(254, 202, 202)",
      "textColor-DatePicker-error": "rgb(127, 29, 29)",
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
      "borderColor-DatePicker-warning": "rgb(255, 165, 0)",
      "backgroundColor-DatePicker-warning": "rgb(255, 235, 156)",
      "textColor-DatePicker-warning": "rgb(127, 29, 29)",
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
      "borderColor-DatePicker-success": "rgb(0, 128, 0)",
      "backgroundColor-DatePicker-success": "rgb(220, 255, 220)",
      "textColor-DatePicker-success": "rgb(0, 100, 0)",
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

test.fixme(
  "component handles minValue restrictions",
  SKIP_REASON.XMLUI_BUG("Prop does not work"),
  async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker
        testId="datePicker"
        mode="range"
        minValue="05/25/2024"
        dateFormat="MM/dd/yyyy"
        initialValue="{{ from: '05/26/2024', to: '05/27/2024' }}"
      />`,
    );
    await page.getByTestId("datePicker").click();
    await page.getByRole("grid", { name: "May" }).getByLabel("May 24th").click();
    await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 24th")).toBeDisabled();
  },
);

test.fixme(
  "component handles maxValue restrictions",
  SKIP_REASON.XMLUI_BUG("Prop does not work"),
  async ({ page, initTestBed }) => {
    await initTestBed(
      `<DatePicker
        testId="datePicker"
        mode="range"
        minValue="05/25/2024"
        initialValue="{{ from: '05/26/2024', to: '05/27/2024' }}"
        dateFormat="MM/dd/yyyy"
      />`,
    );
    await page.getByTestId("datePicker").click();
    await page.getByRole("grid", { name: "May" }).getByLabel("May 24th").click();
    await expect(page.getByRole("grid", { name: "May" }).getByLabel("May 24th")).toBeDisabled();
  },
);

test.fixme("component handles disabledDates correctly", async ({ page, initTestBed }) => {
  const today = new Date();
  const testDayFormatted = format(
    new Date(today.getFullYear(), today.getMonth(), 15),
    "MM/dd/yyyy",
  );

  await initTestBed(`<DatePicker disabledDates={['${testDayFormatted}']} />`, {});

  // Open the calendar
  await page.locator("button").click();

  // The 15th day should be disabled
  const testDay = "15";
  const testDayCell = page.locator(".rdp-day").filter({ hasText: testDay }).first();
  await expect(testDayCell).toHaveClass(/disabled/);
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
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<DatePicker width="50%" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<DatePicker width="50%" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});
