/**
 * Testing Notes: the Driver needs to account for the correct positioning of the indicators on the slider
 */

import { validationStatusValues } from "../abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

test.skip(
  "component renders",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ initTestBed, createSliderDriver }) => {
    await initTestBed(`<Slider />`);
    await expect((await createSliderDriver()).component).toBeVisible();
  },
);

// --- initialValue

test.skip(
  "providing initialValue sets value of field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

[
  { label: "int", value: 1 },
  { label: "float", value: 1.1 },
  { label: "string that resolves to int", value: "1" },
  { label: "string that resolves to float", value: "1.1" },
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
].forEach(({ label, value }) => {
  test.skip(
    `reject value type: ${label}`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

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
    // set value to higher than maxValue
    // test that value is automatically set to minValue
  },
);

// --- rangeHighlight

test.skip(
  "rangeHighlight=none disables highlighting on the range",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "rangeHighlight=lower sets highlighting from minValue to value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "rangeHighlight=upper sets highlighting from value to maxValue",
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
  "gotFocus is not called if field is disabled",
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
  async ({ initTestBed }) => {},
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
