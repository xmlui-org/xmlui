import { labelPositionValues, validationStatusValues } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, test } from "@testing/fixtures";

test("TextBox is rendered", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox />`);
  const driver = await createTextBoxDriver();

  await expect(driver.component).toBeVisible();
});


// --- --- placeholder

test("placeholder appears if input field is empty", async ({
  initTestBed,
  createTextBoxDriver,
}) => {
  await initTestBed(`<TextBox placeholder="test" />`);
  const driver = await createTextBoxDriver();

  expect(await driver.placeholder).toBe("test");
});

test("placeholder is hidden if input field is filled", async ({
  initTestBed,
  createTextBoxDriver,
}) => {
  await initTestBed(`<TextBox placeholder="test" />`);
  const driver = await createTextBoxDriver();

  await driver.field.fill("hello world");
  expect(await driver.placeholder).toBe("test");
  await expect(driver.field).toHaveValue("hello world");
});

// --- --- initialValue

// correct types: string, undefined, null, number, boolean -> everything will be coerced to strings
[
  { label: "undefined", value: "'{undefined}'", toExpect: "" },
  { label: "null", value: "'{null}'", toExpect: "" },
  { label: "empty string", value: "''", toExpect: "" },
  { label: "string", value: "'test'", toExpect: "'test'" },
  { label: "integer", value: "'{1}'", toExpect: "1" },
  { label: "float", value: "'{1.2}'", toExpect: "1.2" },
  { label: "string that resolves to integer", value: "'1'", toExpect: "1" },
  { label: "string that resolves to float", value: "'1.2'", toExpect: "1.2" },
].forEach(({ label, value, toExpect }) => {
  test.skip(`setting initialValue to ${label} sets value of field`, async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`<TextBox initialValue=${value} />`);
    const driver = await createTextBoxDriver();

    await expect(driver.field).toHaveValue(toExpect);
  });
});

// what to do with these types? array, object, function
[
  { label: "empty array", value: "'{[]}'", toExpect: "" },
  { label: "array", value: "'{[1, 2, 3]}'", toExpect: "" },
  { label: "empty object", value: "'{{}}'", toExpect: "" },
  { label: "object", value: "'{{ a: 1, b: 'hi' }}'", toExpect: "" },
  { label: "function", value: "'{() => {}}'", toExpect: "" },
].forEach(({ label, value, toExpect }) => {
  test.skip(`setting initialValue to ${label} sets value of field`, async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`<TextBox initialValue=${value} />`);
    const driver = await createTextBoxDriver();

    await expect(driver.field).toHaveValue(toExpect);
  });
});

// --- --- label

test("label is rendered if provided", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox label="Input Field Label" />`);
  const driver = await createTextBoxDriver();

  await expect(driver.label).toHaveText("Input Field Label");
});

test("empty string label is not rendered", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox label="" initialValue="" />`);
  const driver = await createTextBoxDriver();

  await expect(driver.label).not.toBeAttached();
});

test("clicking on the label focuses input field", async ({
  initTestBed,
  createTextBoxDriver,
}) => {
  await initTestBed(`<TextBox label="Input Field Label" />`);
  const driver = await createTextBoxDriver();

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

test("focuses component if autoFocus is set", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox autoFocus="{true}" />`);
  await expect((await createTextBoxDriver()).field).toBeFocused();
});

// --- --- required

test("empty required TextBox shows visual indicator", async ({
  initTestBed,
  createTextBoxDriver,
}) => {
  await initTestBed(`<TextBox label="test" required="{true}" />`);
  const driver = await createTextBoxDriver();

  await expect(driver.label).toContainText("*");
  await expect(driver.field).toHaveAttribute("required");
});

// --- --- readOnly

test("readOnly is not editable", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox readOnly="{true}" />`);
  const driver = await createTextBoxDriver();

  await expect(driver.field).not.toBeEditable();
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
  createTextBoxDriver,
}) => {
  await initTestBed(`<TextBox enabled="false" />`);
  const driver = await createTextBoxDriver();

  await expect(driver.field).toBeDisabled();
});

// --- --- startText

test.skip(
  "startText is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<TextBox startText="start" />`);
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
