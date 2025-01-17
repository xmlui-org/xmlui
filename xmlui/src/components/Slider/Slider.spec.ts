/**
 * Testing Notes: the Driver needs to account for the correct positioning of the indicators on the slider
 */

import { orderingValues, scrollAnchoringValues, validationStatusValues } from "@components/abstractions";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures";

class SliderDriver extends ComponentDriver {}

const test = createTestWithDriver(SliderDriver);

test.skip(
  "component renders & is visible",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ createDriver }) => {
    const driver = await createDriver(`<Slider />`);
    await expect(driver.component).toBeVisible();
  },
);

// --- initialValue

test.skip(
  "providing initialValue sets value of field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
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
    async ({ createDriver }) => {},
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
    async ({ createDriver }) => {},
  );
});


// --- minValue

test.skip(
  "minValue sets the lower bound",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "minValue cannot be larger than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "value cannot be lower than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    // set value to lower than minValue
    // test that value is automatically set to minValue
  },
);

// --- maxValue

test.skip(
  "maxValue sets the upper bound",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "maxValue cannot be smaller than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "value cannot be larger than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    // set value to higher than maxValue
    // test that value is automatically set to minValue
  },
);

// --- rangeHighlight

test.skip(
  "rangeHighlight=none disables highlighting on the range",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "rangeHighlight=lower sets highlighting from minValue to value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "rangeHighlight=upper sets highlighting from value to maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- enabled

test.skip(
  "enabled=true enables the control",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "enabled=false disables the control",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- required

test.skip(
  "making field required shows a visual indicator",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- readOnly

test.skip(
  "readOnly disables setting the range slider",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- validationStatus

const validationStatuses = validationStatusValues.filter((v) => v !== "none");
validationStatuses.forEach((status) => {
  test.skip(
    `validation status ${status} is applied correctly`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {
      // indicator color matches the one specified in current theme
    },
  );
});

// --- onDidChange

test.skip(
  "onDidChange is called on input change",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "onDidChange is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- gotFocus

test.skip(
  "gotFocus event fires on focusing the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "gotFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- lostFocus

test.skip(
  "lostFocus event fires on blurring the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "lostFocus is not called if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- focus (api)

test.skip(
  "focus() focuses the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "focus() does nothing if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- value (api)

test.skip(
  "value returns current input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// --- setValue (api)

test.skip(
  "setValue updates input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "setValue does not update input if field is disabled",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "setValue does not update input if value is invalid",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
