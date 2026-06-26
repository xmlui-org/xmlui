import { expect, test } from "../../testing/fixtures";

function dayCell(page: any, day: number) {
  return page.locator('[data-part="table-cell-trigger"]').filter({ hasText: new RegExp(`^${day}$`) });
}

test.describe("DatePicker foundation", () => {
  test("renders input with initial value", async ({ initTestBed, page }) => {
    await initTestBed(`<DatePicker testId="picker" initialValue="05/25/2024" />`);

    await expect(page.getByTestId("picker")).toBeVisible();
    await expect(page.getByLabel("Date")).toHaveValue("05/25/2024");
  });

  test("opens calendar and selects a date", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker
        testId="picker"
        initialValue="05/25/2024"
        onDidChange="(value) => testState = value" />
    `);

    await page.getByTestId("picker").locator("input").first().focus();
    await page.getByRole("button", { name: "10" }).first().click();

    await expect(page.getByLabel("Date")).toHaveValue("05/10/2024");
    await expect.poll(testStateDriver.testState).toEqual("05/10/2024");
  });

  test("supports range selection", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <DatePicker
        testId="picker"
        mode="range"
        initialValue="{{ from: '05/10/2024', to: '05/12/2024' }}"
        onDidChange="(value) => testState = value" />
    `);

    const inputs = page.getByTestId("picker").locator("input");
    await expect(inputs.nth(0)).toHaveValue("05/10/2024");
    await expect(inputs.nth(1)).toHaveValue("05/12/2024");

    await inputs.nth(0).focus();
    await page.getByRole("button", { name: "14" }).first().click();
    await page.getByRole("button", { name: "18" }).first().click();

    await expect(inputs.nth(0)).toHaveValue("05/14/2024");
    await expect(inputs.nth(1)).toHaveValue("05/18/2024");
    await expect.poll(testStateDriver.testState).toEqual({ from: "05/14/2024", to: "05/18/2024" });
  });

  test("setValue and value APIs work", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="picker" testId="picker" initialValue="05/25/2024" />
        <Button testId="set" onClick="picker.setValue('2024-06-07')" />
        <Text testId="value">{picker.value}</Text>
      </Fragment>
    `);

    await expect(page.getByTestId("value")).toHaveText("05/25/2024");
    await page.getByTestId("set").click();
    await expect(page.getByLabel("Date")).toHaveValue("06/07/2024");
    await expect(page.getByTestId("value")).toHaveText("06/07/2024");
  });

  test("respects disabled date matchers and min/max bounds", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DatePicker
        testId="picker"
        inline="true"
        initialValue="05/10/2024"
        minValue="05/05/2024"
        maxValue="05/20/2024"
        disabledDates="{['05/12/2024', { dayOfWeek: [0, 6] }]}" />
    `);

    await expect(page.getByRole("button", { name: "4" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "12" }).first()).toBeDisabled();
    await expect(page.getByRole("button", { name: "21" }).first()).toBeDisabled();
  });

  test("applies validation and theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`<DatePicker testId="picker" validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-DatePicker--error": "rgb(255, 0, 0)",
        "borderRadius-DatePicker": "12px",
      },
    });

    const control = page.getByTestId("picker").locator("[data-part-id='input']");
    await expect(control).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(control).toHaveCSS("border-radius", "12px");
  });

  test("inline mode renders the calendar without the input", async ({ initTestBed, page }) => {
    await initTestBed(`<DatePicker testId="picker" inline="true" initialValue="05/25/2024" />`);

    await expect(page.getByTestId("picker").locator("input")).toHaveCount(0);
    await expect(page.getByTestId("picker").locator("[data-part-id='calendar']")).toBeVisible();
    await expect(page.getByText("May 2024")).toBeVisible();
  });

  test("inline calendar selection updates the value API", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <DatePicker id="picker" testId="picker" inline="true" initialValue="05/25/2024" />
        <Text testId="value">{picker.value}</Text>
      </Fragment>
    `);

    await dayCell(page, 26).first().click();

    await expect(page.getByTestId("value")).toHaveText("05/26/2024");
  });

  test("confirmRangeSelection waits for Proceed before committing a range", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DatePicker
        testId="picker"
        mode="range"
        confirmRangeSelection="true"
        initialValue="{{ from: '05/10/2024', to: '05/12/2024' }}" />
    `);

    const inputs = page.getByTestId("picker").locator("input");
    await inputs.nth(0).focus();
    await dayCell(page, 14).first().click();
    await dayCell(page, 18).first().click();

    await expect(inputs.nth(0)).toHaveValue("05/10/2024");
    await expect(inputs.nth(1)).toHaveValue("05/12/2024");
    await page.getByRole("button", { name: "Proceed" }).click();
    await expect(inputs.nth(0)).toHaveValue("05/14/2024");
    await expect(inputs.nth(1)).toHaveValue("05/18/2024");
  });

  test("Cancel discards a pending confirmed range", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DatePicker
        testId="picker"
        mode="range"
        confirmRangeSelection="true"
        initialValue="{{ from: '05/10/2024', to: '05/12/2024' }}" />
    `);

    const inputs = page.getByTestId("picker").locator("input");
    await inputs.nth(0).focus();
    await dayCell(page, 14).first().click();
    await dayCell(page, 18).first().click();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(inputs.nth(0)).toHaveValue("05/10/2024");
    await expect(inputs.nth(1)).toHaveValue("05/12/2024");
  });

  test("custom range preset renders and applies its range", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DatePicker
        testId="picker"
        mode="range"
        presets="{[{ label: 'Q1 2024', from: '01/01/2024', to: '03/31/2024' }]}" />
    `);

    await page.getByTestId("picker").locator("input").first().focus();
    await page.getByText("Q1 2024").click();

    const inputs = page.getByTestId("picker").locator("input");
    await expect(inputs.nth(0)).toHaveValue("01/01/2024");
    await expect(inputs.nth(1)).toHaveValue("03/31/2024");
  });

  test("clearable shows the clear button and resets the value", async ({ initTestBed, page }) => {
    await initTestBed(`<DatePicker testId="picker" clearable="true" initialValue="05/25/2024" />`);

    const input = page.getByTestId("picker").locator("input").first();
    await expect(input).toHaveValue("05/25/2024");
    await page.getByRole("button", { name: "Clear date" }).click();

    await expect(input).toHaveValue("");
  });

  test("concise validation feedback shows when verbose feedback is disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DatePicker
        testId="picker"
        validationStatus="error"
        verboseValidationFeedback="false"
        invalidMessages="{['Invalid date']}" />
    `);

    await expect(page.getByTestId("picker").locator("[data-part-id='conciseValidationFeedback']")).toBeVisible();
    await expect(page.getByTestId("picker").locator("[data-part-id='conciseValidationFeedback']")).toHaveAttribute("title", "Invalid date");
  });

  test("bindTo syncs form data and the value API", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <DatePicker id="bound" bindTo="dateValue" dateFormat="MM/dd/yyyy" />
        <Button testId="set" onClick="bound.setValue('06/01/2024')" />
        <Text testId="dataValue">{$data.dateValue}</Text>
        <Text testId="compValue">{bound.value}</Text>
      </Form>
    `);

    await page.getByTestId("set").click();

    await expect(page.getByTestId("dataValue")).toHaveText("06/01/2024");
    await expect(page.getByTestId("compValue")).toHaveText("06/01/2024");
  });

  test("bindTo seeds form data from initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <DatePicker bindTo="dateValue" initialValue="05/25/2024" />
        <Text testId="dataValue">{$data.dateValue}</Text>
      </Form>
    `);

    await expect(page.getByTestId("dataValue")).toHaveText("05/25/2024");
  });

  test("FormItem type=datePicker renders a DatePicker and updates form data", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form hideButtonRow="true">
        <FormItem type="datePicker" bindTo="dateValue" initialValue="05/25/2024" />
        <Text testId="dataValue">{$data.dateValue}</Text>
      </Form>
    `);

    await page.getByLabel("Date").focus();
    await dayCell(page, 26).first().click();

    await expect(page.getByTestId("dataValue")).toHaveText("05/26/2024");
  });

  test.fixme("mobile drawer and Ark month/year view switching remain deferred until the DatePicker shell matches the original Ark UI structure", async () => {});
});
