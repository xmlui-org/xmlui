import { expect, test } from "../../testing/fixtures";

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

    await page.getByLabel("Date").focus();
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

  test.fixme("mobile drawer, Ark view switching, and Form/FormItem binding are deferred to the full DatePicker parity slice", async () => {});
});
