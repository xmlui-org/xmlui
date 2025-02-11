/**
 * Testing Notes: the Driver needs to account for the correct positioning of the indicators on the slider
 */

import { validationStatusValues } from "../../components/abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// --- initialValue

test.skip(
  "providing initialValue sets value of field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

[
  { label: "int array", value: [1, 2] },
  { label: "string that resolves to int array", value: ["1", "2"] },
  { label: "array with [int, string that resolves to int]", value: [1, "2"] },
  { label: "array with [string that resolves to int, int]", value: ["1", 2] },

  { label: "float array", value: [1.1, 1.3] },
  { label: "string that resolves to float array", value: ["1.1", "1.3"] },
  { label: "array with [float, string that resolves to float]", value: [1.1, "1.3"] },
  { label: "array with [string that resolves to float, float]", value: ["1.1", 1.3] },
].forEach(({ label, value }) => {
  test.skip(
    `accept value type: ${label}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

[
  { label: "NaN", value: NaN },
  { label: "null", value: null },
  { label: "undefined", value: undefined },
  { label: "empty string", value: "" },
  { label: "string not resolving to number", value: "abc" },

  { label: "[accepted value, NaN]", value: [1, NaN] },
  { label: "[accepted value, null]", value: [1, null] },
  { label: "[accepted value, undefined]", value: [1, undefined] },
  { label: "[accepted value, empty string]", value: [1, ""] },
  { label: "[accepted value, string not resolving to number]", value: [1, "abc"] },
].forEach(({ label, value }) => {
  test.skip(
    `reject value type: ${label}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

test.skip(
  "longer array than 2 items only uses first and last items",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // input: [1, 2, 3, 4]
  },
);

test.skip(
  "lower value is correctly displayed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // lower value is smaller than upper value and in bounds
    // value is also correctly placed along the slider by looks
    // (i.e. it doesn't look out of proportions compared to the slider length and number indicators)
  },
);

test.skip(
  "upper value is correctly displayed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // upper value is larger than lower value and in bounds
    // value is also correctly placed along the slider by looks
    // (i.e. it doesn't look out of proportions compared to the slider length and number indicators)
  },
);

// --- minValue

test.skip(
  "minValue sets the lower bound",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minValue cannot be larger than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "value cannot be lower than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // set value to lower than minValue
    // test that value is automatically set to minValue
  },
);

// --- maxValue

test.skip(
  "maxValue sets the upper bound",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "maxValue cannot be smaller than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "value cannot be larger than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // set value to lower than minValue
    // test that value is automatically set to minValue
  },
);

// --- lowerInclusive

test.skip(
  "lowerInclusive=true sets the lower bound to be inclusive",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "lowerInclusive=false sets the lower bound to be exclusive",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- upperInclusive

test.skip(
  "upperInclusive=true sets the upper bound to be inclusive",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "upperInclusive=false sets the upper bound to be exclusive",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- complementary

test.skip(
  "complementary=false sets the range between the lower and upper values",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "complementary=true selects a complementary range: minValue to lower value and upper value to maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- enabled

test.skip(
  "enabled=true enables the control",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "enabled=false disables the control",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- required

test.skip(
  "making field required shows a visual indicator",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- readOnly

test.skip(
  "readOnly disables setting the range slider",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- validationStatus

const validationStatuses = validationStatusValues.filter((v) => v !== "none");
validationStatuses.forEach((status) => {
  test.skip(
    `validation status ${status} is applied correctly`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {
      // indicator color matches the one specified in current theme
    },
  );
});

// --- onDidChange

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

// --- gotFocus

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

// --- lostFocus

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

// --- focus (api)

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

// --- value (api)

test.skip(
  "value returns current input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // set value through initialValue: [1, 2, 3] -> get back [1, 2, 3]
    // set value through initialValue: [1, 3] -> get back [1, 2, 3]
  },
);

// --- setValue (api)

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
