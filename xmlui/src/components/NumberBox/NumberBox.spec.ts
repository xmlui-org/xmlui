import { labelPositionValues, validationStatusValues } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, test } from "@testing/fixtures";
import { NUMBERBOX_MAX_VALUE } from "./numberbox-abstractions";

// --- props

test("NumberBox is rendered", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.component).toBeVisible();
});

// --- --- placeholder

test("placeholder appears if input field is empty", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox placeholder="123" />`);
  const driver = await createNumberBoxDriver();

  expect(await driver.placeholder).toBe("123");
});

test("placeholder is hidden if input field is filled", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox placeholder="123" />`);
  const driver = await createNumberBoxDriver();

  await driver.field.fill("456");
  expect(await driver.placeholder).toBe("123");
  await expect(driver.field).toHaveValue("456");
});

// --- --- initialValue

// correct types: number, undefined, null, string that resolves to a VALID number
[
  { label: "integer", value: "'{1}'", toExpect: "1" },
  { label: "float", value: "'{1.2}'", toExpect: "1.2" },
  { label: "undefined", value: "'{undefined}'", toExpect: "" },
  { label: "null", value: "'{null}'", toExpect: "" },
  { label: "empty string", value: "''", toExpect: "" },
  { label: "string that resolves to integer", value: "'1'", toExpect: "1" },
  { label: "string that resolves to float", value: "'1.2'", toExpect: "1.2" },
].forEach(({ label, value, toExpect }) => {
  test(`setting initialValue to ${label} sets value of field`, async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox initialValue=${value} />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).toHaveValue(toExpect);
  });
});

[
  { label: "boolean", value: "'{true}'" },
  { label: "non-number string", value: "'asdasd'" },
  { label: "empty array", value: [] },
  { label: "array", value: [1, 2, 3] },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "function", value: () => {} },
  { label: "NaN", value: NaN }, // <- Not sure about this one
].forEach(({ label, value }) => {
  test.skip(
    `setting initialValue to ${label} throws error`,
    SKIP_REASON.XMLUI_BUG(),
    async ({ initTestBed, createNumberBoxDriver }) => {
      await initTestBed(`<NumberBox initialValue=${value} />`);
      const driver = await createNumberBoxDriver();

      await expect(driver.field).toHaveValue("");
    },
  );
});

test.skip(
  "if initialValue is too large, cap actual value to NUMBERBOX_MAX_VALUE constant",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox initialValue="100000000000000000000000000000000000" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).toHaveValue(NUMBERBOX_MAX_VALUE.toString());
  },
);

test.skip(
  "if initialValue is too small, cap actual value to -NUMBERBOX_MAX_VALUE constant",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox initialValue="-100000000000000000000000000000000000" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).toHaveValue(NUMBERBOX_MAX_VALUE.toString());
  },
);

// --- --- label

test("label is rendered if provided", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox label="Input Field Label" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.label).toHaveText("Input Field Label");
});

test("empty string label is not rendered", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox label="" initialValue="" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.label).not.toBeAttached();
});

test("clicking on the label focuses input field", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox label="Input Field Label" />`);
  const driver = await createNumberBoxDriver();

  await driver.label.click();
  await expect(driver.field).toBeFocused();
});

// --- --- labelPosition

labelPositionValues.forEach((pos) => {
  test.skip(
    `label position ${pos} is applied for the input field and associated label`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- --- labelWidth TODO?

// --- --- labelBreak TODO?

// --- --- autoFocus

test("focuses component if autoFocus is set", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox autoFocus="{true}" />`);
  await expect((await createNumberBoxDriver()).field).toBeFocused();
});

// --- --- required

test("empty required Numberbox shows visual indicator", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox label="test" required="{true}" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.label).toContainText("*");
  await expect(driver.field).toHaveAttribute("required");
});

// --- --- readOnly

test("readOnly is not editable", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox readOnly="{true}" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.field).not.toBeEditable();
});

test("readOnly disables the spinbox", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox readOnly="{true}" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.spinnerUpButton).toBeDisabled();
  await expect(driver.spinnerDownButton).toBeDisabled();
});

test.skip(
  "readOnly lets user copy from input field",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(
    "Need to implement permission grants in initTestBed for the current browser context",
  ),
  async ({ initTestBed }) => {},
);

// --- --- enabled

test("disabled input field stops user interaction for field", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox enabled="false" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.field).toBeDisabled();
});

test("disabled input field stops user interaction for spinbox", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox enabled="false" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.spinnerUpButton).toBeDisabled();
  await expect(driver.spinnerDownButton).toBeDisabled();
});

// --- --- startText

test.skip(
  "startText is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox startText="start" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.component).toContainText("start");
  },
);

// --- --- startIcon

test.skip(
  "startIcon is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // check rendered icon (similar to Icon test with loading resource) and position
  },
);

// --- --- endText

test.skip(
  "endText is rendered at the end of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // check text content and position
  },
);

// --- --- endIcon

test.skip(
  "endIcon is rendered at the end of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // check rendered icon (similar to Icon test with loading resource) and position
  },
);

// --- --- validationStatus

const validationStatuses = validationStatusValues.filter((v) => v !== "none");
validationStatuses.forEach((status) => {
  test.skip(
    `validation status ${status} is applied correctly`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // border color matches the one specified in current theme
    },
  );
});

// --- --- maxLength

test.skip(
  "maxLength caps the length of the input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- hasSpinBox

test.skip(
  "renders spinbox if set to true",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "does not render spinbox if set to false",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox up-arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing up arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox down-arrow subtracts default step value from input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing down arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox up-arrow that would overflow max value does not add value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing the up arrow that would overflow max value does not add value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox down-arrow that would underflow min value does not subtract value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing the down arrow that would underflow min value does not subtract value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- step

test.skip(
  "setting valid integer step adds that value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

[
  { label: "boolean", value: true },
  { label: "non-number string", value: "asdasd" },
  { label: "empty array", value: [] },
  { label: "array", value: [1, 2, 3] },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "function", value: () => {} },
  { label: "NaN", value: NaN },
  { label: "null", value: null },
  { label: "undefined", value: undefined },
  { label: "empty string", value: "" },
  { label: "string resolves to number", value: "1" },
  { label: "too large string number", value: "1000000000000000000000000000" },
  { label: "too small string number", value: "-1000000000000000000000000000" },
  { label: "float", value: 1.2 },
  { label: "negative float", value: -1.2 },
  { label: "string resolves to float", value: "1.2" },
  { label: "string resolves to negative float", value: "-1.2" },
  { label: "string resolves to number with e", value: "1e10" },
].forEach(({ label, value }) => {
  test.skip(
    `${label} is ignored and default step value is used`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- --- integersOnly

test.skip(
  "integersOnly limits input to integers",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- zeroOrPositive

test.skip(
  "zeroOrPositive limits input to non-negative numbers and zero",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "user cannot copy a negative number",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "down button on spinbox does nothing when result would be negative",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- minValue

test.skip(
  "minValue limits input to numbers greater than or equal to minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "user cannot copy a number less than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- maxValue

test.skip(
  "maxValue limits input to numbers less than or equal to maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "user cannot copy a number greater than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- events

// --- --- onDidChange

test.skip(
  "onDidChange is called on input change",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "onDidChange is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- gotFocus

test.skip(
  "gotFocus event fires on focusing the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "onFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- lostFocus

test.skip(
  "lostFocus event fires on blurring the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "lostFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- api

// --- --- focus

test.skip(
  "focus() focuses the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "focus() does nothing if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- value

test.skip(
  "value returns current input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- --- setValue

test.skip(
  "setValue updates input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "setValue does not update input if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "setValue does not update input if value is invalid",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- testing for input types

test.skip("field accepts empty input", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {
  // value is assigned undefined or null if this is the case
});

test.skip(
  "entering multiple 0s only results in one 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "copying multiple 0s only results in one 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "entering: no leading 0s are allowed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "copying: no leading 0s are allowed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is rendered at the start of the field if prompt is at the start",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is rendered at the start of the field if prompt is at any point in input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is removed if user inputs a second minus sign",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is removed if user copies a second minus sign",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to an integer results in a float",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to a float replaces the last point",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the beginning of an integer adds a leading 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the end of an integer adds a trailing 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the beginning of 0 does adds a leading 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the end of 0 adds a trailing 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
