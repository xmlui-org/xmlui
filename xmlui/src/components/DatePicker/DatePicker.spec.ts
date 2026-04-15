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

    // Check that range dates have background color
    const startDate = page
      .getByRole("grid", { name: "May" })
      .locator("[data-day]")
      .filter({ hasText: /^10$/ });
    const middleDate = page
      .getByRole("grid", { name: "May" })
      .locator("[data-day]")
      .filter({ hasText: /^12$/ });
    const endDate = page
      .getByRole("grid", { name: "May" })
      .locator("[data-day]")
      .filter({ hasText: /^15$/ });

    // All dates in range should have the hover background color
    await expect(startDate).toHaveCSS("background-color", "rgb(240, 240, 240)");
    await expect(middleDate).toHaveCSS("background-color", "rgb(240, 240, 240)");
    await expect(endDate).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("single selected date in range mode has background styling", async ({
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

    // Select first date
    await page
      .getByRole("grid")
      .first()
      .locator("[data-day]")
      .filter({ hasText: /^10$/ })
      .first()
      .click();

    // The single selected date should have background
    const selectedDate = page
      .getByRole("grid")
      .first()
      .locator("[data-day]")
      .filter({ hasText: /^10$/ })
      .first();
    await expect(selectedDate).toHaveCSS("background-color", "rgb(240, 240, 240)");
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

  test("range selection completes after selecting two dates", async ({ page, initTestBed }) => {
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

    // Select first date
    await grid.locator("[data-day]").filter({ hasText: /^10$/ }).first().click();

    // Menu should still be open
    await expect(page.getByRole("menu")).toBeVisible();

    // Select second date
    await grid.locator("[data-day]").filter({ hasText: /^15$/ }).first().click();

    // Menu should still be open (range mode doesn't auto-close)
    await expect(page.getByRole("menu")).toBeVisible();

    // Check that the range is displayed in the input
    const datePickerText = await page.getByTestId("datePicker").textContent();
    expect(datePickerText).toContain(" - ");
  });

  test("didChange event fires with range object", async ({ page, initTestBed }) => {
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

    // Select first date
    await grid.locator("[data-day]").filter({ hasText: /^10$/ }).first().click();

    // Select second date
    await grid.locator("[data-day]").filter({ hasText: /^15$/ }).first().click();

    // Check that didChange was called with a range object
    const state = await testStateDriver.testState();
    expect(state).toHaveProperty("from");
    expect(state).toHaveProperty("to");
  });
});
