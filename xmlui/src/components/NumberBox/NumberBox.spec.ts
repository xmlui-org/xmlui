import { labelPositionValues, validationStatusValues } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { ComponentDriver, createTestWithDriver } from "@testing/fixtures";

// --- Setup

class NumberBoxDriver extends ComponentDriver {}

const test = createTestWithDriver(NumberBoxDriver);

// --- Testing

// --- props

// --- --- placeholder

test.skip("placeholder appears if input field is empty",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("placeholder is hidden if input field is filled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- initialValue

// correct types: number, undefined, null, string that resolves to a VALID number
[
  { label: "number", value: 1 },
  { label: "undefined", value: undefined },
  { label: "null", value: null },
  { label: "empty string", value: "" },
  { label: "string that resolves to number", value: "1" },
].forEach(({ label, value }) => {
  test.skip(`setting initialValue to ${label} sets value of field`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {});
});

[
  { label: "boolean", value: true },
  { label: "non-number string", value: "asdasd" },
  { label: "empty array", value: [] },
  { label: "array", value: [1, 2, 3] },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "function", value: () => {} },
  { label: "NaN", value: NaN },   // <- Not sure about this one
].forEach(({ label, value }) => {
  test.skip(`setting initialValue to ${label} throws error`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {});
})

test.skip("if initialValue is too large, cap actual value to MAX_VALUE constant",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // initialValue="100000000000000000000000000000000000"
});

test.skip("if initialValue is too small, cap actual value to -MAX_VALUE constant",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // initialValue="-100000000000000000000000000000000000"
});

// --- --- label

test.skip("label is rendered if provided",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("empty string label is not rendered",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("clicking on the label focuses input field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- labelPosition

labelPositionValues.forEach((pos) => {
  test.skip(`label position ${pos} is applied for the input field and associated label`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {});  
});

// --- --- labelWidth TODO?

// --- --- labelBreak TODO?

// --- --- maxLength

test.skip("maxLength caps the length of the input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- autoFocus

test.skip("autoFocus sets focus on the input field on page load",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- required

test.skip("making field required shows a visual indicator",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- readOnly

test.skip("readOnly disables writing in input field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("readOnly lets user copy from input field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- enabled

test.skip("disabled input field stops user interaction for field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // try to click input field
});

test.skip("disabled input field stops user interaction for spinbox",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // try to click spinbox
});

// --- --- validationStatus

const validationStatuses = validationStatusValues.filter((v) => v !== "none");
validationStatuses.forEach((status) => {
  test.skip(`validation status ${status} is applied correctly`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {
    // border color matches the one specified in current theme
  });
});

// --- --- startText

test.skip("startText is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // check text content and position
});

// --- --- startIcon

test.skip("startIcon is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // check rendered icon (similar to Icon test with loading resource) and position
});

// --- --- endText

test.skip("endText is rendered at the end of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // check text content and position
});

// --- --- endIcon

test.skip("endIcon is rendered at the end of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // check rendered icon (similar to Icon test with loading resource) and position
});

// --- --- hasSpinBox

test.skip("renders spinbox if set to true",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("does not render spinbox if set to false",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("clicking spinbox up-arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("pressing up arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("clicking spinbox down-arrow subtracts default step value from input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("pressing down arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("clicking spinbox up-arrow that would overflow max value does not add value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("pressing the up arrow that would overflow max value does not add value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("clicking spinbox down-arrow that would underflow min value does not subtract value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("pressing the down arrow that would underflow min value does not subtract value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- step

test.skip("setting valid integer step adds that value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

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
  test.skip(`${label} is ignored and default step value is used`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {});
});

// --- --- integersOnly

test.skip("integersOnly limits input to integers",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- zeroOrPositive

test.skip("zeroOrPositive limits input to non-negative numbers and zero",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("user cannot copy a negative number",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("down button on spinbox does nothing when result would be negative",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- minValue

test.skip("minValue limits input to numbers greater than or equal to minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("user cannot copy a number less than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- maxValue

test.skip("maxValue limits input to numbers less than or equal to maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("user cannot copy a number greater than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- events

// --- --- onDidChange

test.skip("onDidChange is called on input change",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("onDidChange is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- gotFocus

test.skip("gotFocus event fires on focusing the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("onFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- lostFocus

test.skip("lostFocus event fires on blurring the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("lostFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- api

// --- --- focus

test.skip("focus() focuses the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("focus() does nothing if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- value

test.skip("value returns current input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- setValue

test.skip("setValue updates input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("setValue does not update input if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("setValue does not update input if value is invalid",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- testing for input types

test.skip("field accepts empty input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // value is assigned undefined or null if this is the case
});

test.skip("entering multiple 0s only results in one 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("copying multiple 0s only results in one 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("entering: no leading 0s are allowed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("copying: no leading 0s are allowed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("minus sign is rendered at the start of the field if prompt is at the start",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("minus sign is rendered at the start of the field if prompt is at any point in input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("minus sign is removed if user inputs a second minus sign",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("minus sign is removed if user copies a second minus sign",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("adding floating point to an integer results in a float",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("adding floating point to a float replaces the last point",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("adding floating point to the beginning of an integer adds a leading 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("adding floating point to the end of an integer adds a trailing 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("adding floating point to the beginning of 0 does adds a leading 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("adding floating point to the end of 0 adds a trailing 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});
