import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { formControlTypes } from "../Form/FormContext";

const formControlTypeMap: Record<string, string> = {
  text: "TextBoxDriver",
  password: "TextBoxDriver",
  number: "NumberBoxDriver",
  textarea: "TextAreaDriver",
  checkbox: "CheckboxDriver",
  radio: "RadioGroupDriver",
  select: "SelectDriver",
};

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" />
      </Form>`);
    await expect((await createFormItemDriver("formItem")).component).toBeAttached();
  });

  // --- label

  test("label renders", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" label="test-label" />
      </Form>`);
    await expect((await createFormItemDriver("formItem")).label).toHaveText("test-label");
  });

  // --- type

  test(`type 'text' renders`, async ({
    initTestBed,
    createFormItemDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="text" />
      </Form>`);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createTextBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeAttached();
  });

  test(`type 'number' renders`, async ({
    initTestBed,
    createFormItemDriver,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="number" />
      </Form>`);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createNumberBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeAttached();
  });

  test(`type 'integer' renders`, async ({
    initTestBed,
    createFormItemDriver,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="integer" />
      </Form>`);
    const formItemDriver = await createFormItemDriver("formItem");
    const inputDriver = await createNumberBoxDriver(formItemDriver.input);
    await expect(inputDriver.field).toBeAttached();
  });

  // Filtering some cases, see following tests
  formControlTypes
    .filter((t) => t !== "autocomplete" && t !== "slider")
    .forEach((type) => {
      test(`label displayed for type '${type}'`, async ({ initTestBed, createFormItemDriver }) => {
        await initTestBed(`
      <Form>
        <FormItem testId="formItem" type="${type}" label="test" />
      </Form>`);
        const formItemDriver = await createFormItemDriver("formItem");
        await expect(formItemDriver.label).toHaveText("test");
      });
    });
  // Cases not working
  test.fixme(
    `label displayed for type 'autocomplete'`,
    SKIP_REASON.XMLUI_BUG(
      "There are two labels in Autocomplete: one is ours, the other comes from cmdk -> this results in an error",
    ),
    async ({ initTestBed, createFormItemDriver }) => {
      await initTestBed(`
  <Form>
    <FormItem testId="formItem" type="autocomplete" label="test" />
  </Form>`);
      const formItemDriver = await createFormItemDriver("formItem");
      await expect(formItemDriver.label).toHaveText("test");
    },
  );
  test.fixme(
    `label displayed for type 'slider'`,
    SKIP_REASON.XMLUI_BUG(
      `
  There are two labels in Slider: one is in FormItem, 
  the other is in the Slider but should not be displayed.
  The second one currently contains the selected value ->
  this should be moved to a separate element.
  `,
    ),
    async ({ initTestBed, createFormItemDriver }) => {
      await initTestBed(`
  <Form>
    <FormItem testId="formItem" type="autocomplete" label="test" />
  </Form>`);
      const formItemDriver = await createFormItemDriver("formItem");
      await expect(formItemDriver.label).toHaveText("test");
    },
  );
});

test.skip(
  "not setting label should show validation messages when invalid",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ initTestBed }) => {},
);

test.skip(
  "validation message shows when field is invalid",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ initTestBed }) => {},
);

test("only run other validations if required field is filled", async ({
  initTestBed,
  createFormDriver,
  createFormItemDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(`
    <Form data="{{ name: '' }}" onSubmit="testState = true">
      <FormItem
        testId="testField"
        label="x"
        bindTo="name"
        minLength="3"
        lengthInvalidMessage="Name is too short!"
        required="true"
        requiredInvalidMessage="This field is required" />
    </Form>`);
  const formDriver = await createFormDriver();
  const formItemDriver = await createFormItemDriver("testField");
  const textInputDriver = await createTextBoxDriver(formItemDriver.input);

  // Step 1: Submit form without filling in required field to trigger validation display
  await formDriver.submitForm();

  // TODO: Need to get validation messages via locators
  await expect(formItemDriver.component).toHaveText(/This field is required/);
  await expect(formItemDriver.component).not.toHaveText(/Name is too short!/);

  // Step 2: Fill input field with less than 3 chars to trigger minLength validation
  await textInputDriver.field.fill("Bo");

  await expect(formItemDriver.component).not.toHaveText(/This field is required/);
  await expect(formItemDriver.component).toHaveText(/Name is too short!/);
});

test("other validations run if field is not required", async ({
  initTestBed,
  createFormDriver,
  createFormItemDriver,
}) => {
  await initTestBed(`
    <Form data="{{ name: '' }}" onSubmit="testState = true">
      <FormItem
        testId="testField"
        label="x"
        bindTo="name"
        minLength="3"
        lengthInvalidMessage="Name is too short!"
        required="false"
        requiredInvalidMessage="This field is required" />
    </Form>`);
  const formDriver = await createFormDriver();
  const formItemDriver = await createFormItemDriver("testField");

  await formDriver.submitForm();

  // TODO: Need to get validation messages via locators
  await expect(formItemDriver.component).not.toHaveText(/This field is required/);
  await expect(formItemDriver.component).toHaveText(/Name is too short!/);
});

formControlTypes.forEach((testCase) => {
  test.skip(
    `autofocus for type '${testCase}' works`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

test.skip(
  `customValidationsDebounce delays validation`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// Enabled should be tested inside each input component

// forEach
test.skip(
  `initialValue is recognisable without bindTo`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// forEach
test.skip(
  `initialValue is recognisable with undefined bindTo value`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// forEach
test.skip(
  `initialValue is recognisable with null bindTo value`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// forEach
test.skip(
  `initialValue is NOT recognisable with valid bindTo value`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// forEach
test.skip(
  "form's data value is updated when bound to FormItem",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// discuss if the thing we are testing here is even good
// test.skip("long label spans multiple lines with labelBreak=true ", async ({initTestBed}) =>{ })
// test.skip("long label spans 1 lines with labelBreak=false ", async ({initTestBed}) =>{ })

// test.skip("labelWidth can be greater than FormItem width", async ({initTestBed}) =>{ })
// test.skip("labelWidth sets width precisely", async ({initTestBed}) =>{ })

test.skip(
  "label position bottom is below formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "label position start is left (ltr) of formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "label position end is right (ltr) of formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "label position top is above formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// forEach
test.skip(
  "lengthInvalidMessage displayed when min value not met",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "lengthInvalidMessage displayed when max value not met",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);

test.skip(
  "lenghtInvalidSeverity shows error severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "lenghtInvalidSeverity shows warning severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "lenghtInvalidSeverity shows valid severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
// check all the different severity shown once

test.skip(
  "pattern validation 'email' recognises bad input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "pattern validation 'email' leaves good input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "pattern validation 'phone' recognises bad input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "pattern validation 'phone' leaves good input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "pattern validation 'url' recognises bad input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);
test.skip(
  "pattern validation 'url' leaves good input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ initTestBed }) => {},
);

test.skip("patternInvalidMessage is displayed when email validation fails", async ({
  initTestBed,
}) => {});

// forEach
test.skip("patternInvalidSeverity shows error severity level", async ({ initTestBed }) => {});
test.skip("patternInvalidSeverity shows valid severity level", async ({ initTestBed }) => {});
test.skip("patternInvalidSeverity shows warning severity level", async ({ initTestBed }) => {});

// TODO: how is this different than maxLength?
test.skip("maxTextLength", async ({ initTestBed }) => {});

test.skip(
  "maxLength prevents typing beyond limit for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength prevents typing beyond limit for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength prevents typing beyond limit for type 'integer'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength prevents typing beyond limit for type 'number'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "maxValue invalidates oversized input for integer",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue invalidates oversized input for number",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
//todo later, not yet implemented
test.fixme(
  "maxValue invalidates oversized date for type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "maxValue does not affect validation for type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minValue invalidates undersized input for integer",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue invalidates undersized input for number",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
//todo later, not yet implemented
test.fixme(
  "minValue invalidates undersized date for type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minValue does not affect validation for type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue does not affect validation for type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue does not affect validation for type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue does not affect validation for type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue does not affect validation for type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue does not affect validation for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "minValue does not affect validation for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "always invalidates when maxValue < minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "rangeInvalidMessage shows for undersized input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "rangeInvalidMessage shows for oversized input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "rangeInvalidSeverity shows error severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "rangeInvalidSeverity shows warning severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "rangeInvalidSeverity shows valid severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "regex validation finds invalid input for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation leaves valid input for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation finds invalid input for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation leaves valid input for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "regex doesn't validate each line of textarea separately",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "regex validation does not affect type 'integer'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'number'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regex validation does not affect type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "regexInvalidMessage displays on regex validation failure",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "regexInvalidSeverity shows error severity level",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regexInvalidSeverity shows valid severity level",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "regexInvalidSeverity shows warning severity level",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

//TODO: can foreach this
test.describe("required field", () => {
  test.skip(
    "requiredInvalidMessage displayed when is empty",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when empty for type 'text'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'text'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when empty for type 'textarea'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'textarea'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when empty for type 'number'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'number'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when empty for type 'integer'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'integer'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when unchecked for type 'checkbox'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when checked for type 'checkbox'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when empty for type 'datePicker'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when date selected for type 'datePicker'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when no file for type 'file'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when file uploaded for type 'file'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when none selected for type 'radioGroup'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when option selected for type 'radioGroup'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when none selected for type 'select'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when option selected for type 'select'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "required shows error when off for type 'switch'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
  test.skip(
    "required doesn't show error when on for type 'switch'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// ValidationMode tests
test.skip(
  "validationMode 'errorLate' shows error after blur, not before",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "validationMode 'errorLate' shows error after re-focusing and changing invalid input to stay invalid",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "validationMode 'errorLate' immediately hides error after correcting error",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "validationMode 'onChanged' shows error after first keystroke",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "validationMode 'onChanged' hides error right after correcting input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "validationMode 'onLostFocus' shows errors on blur, but not before",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
test.skip(
  "validationMode 'onLostFocus' keeps error message for corrected input until blured",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "onValidate fires on every change",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.describe("regression tests", () => {
  test.fixme(
    "two form item without bindTo are independent",
    SKIP_REASON.XMLUI_BUG(),
    async ({ initTestBed }) => {},
  );
});
