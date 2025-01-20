import { labelPositionValues, validationStatusValues } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { ComponentDriver } from "@testing/ComponentDrivers";
import { createTestWithDriver } from "@testing/fixtures";

// --- Setup

class RadioGroupDriver extends ComponentDriver {}

const test = createTestWithDriver(RadioGroupDriver);

// --- Testing

// --- children

test.skip("Providing Option elements as children renders RadioGroup with correct children",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("Providing non-Option elements as children does not render RadioGroup",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("Mixing Option and non-Option elements as children only renders Option elements",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- props

// --- --- initialValue

// correct types: string[], { label: string, value: string }[], undefined, null
[
  { label: "empty array", value: [] },
  { label: "string array", value: ["a", "b", "c"] },
  { label: "number array", value: [1, 2, 3] },
  {
    label: "Option array",
    value: [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
      { label: "C", value: "c" },
    ],
  },
  { label: "undefined", value: undefined },
  { label: "null", value: null },
].forEach(({ label, value }) => {
  test.skip(`setting initialValue to ${label} sets value of field`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {});
});

[
  { label: "number", value: 1 },
  { label: "string", value: "hello" },
  { label: "boolean", value: true },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "function", value: () => {} },
  { label: "NaN", value: NaN },
].forEach(({ label, value }) => {
  test.skip(`setting initialValue to ${label} throws error`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {});
});

// --- --- autoFocus

test.skip("autoFocus sets focus on the first Option on page load",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- required

test.skip("making field required shows a visual indicator",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- readOnly

test.skip("readOnly disables switching between options",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- enabled

test.skip("disabled input field stops user interaction for field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
  // try to click any other Option than the one currently selected
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

test.skip("only one option should have validation status 'error' or 'warning",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- orientation: Not implemented yet

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

// --- events

// --- --- onDidChange

test.skip("onDidChange is called on input change",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("onDidChange is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- onGotFocus

test.skip("gotFocus event fires on focusing the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("onFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- --- onLostFocus

test.skip("lostFocus event fires on blurring the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

test.skip("lostFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {});

// --- api

// --- --- focus

test.skip("focus() focuses the first Option",
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
