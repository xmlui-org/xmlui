import { labelPositionValues } from "@components/abstractions";
import { FormDriver } from "@components/Form/Form.spec";
import { SKIP_REASON } from "@testing/component-test-helpers";
import { expect, ComponentDriver, createTestWithDriver, createTestWithDrivers } from "@testing/fixtures";

class FormItemDriver extends ComponentDriver {
  // Need to check for input type
  async fillField(value: any) {
    await this.locator.getByRole("textbox").fill(value);
  }
}

const test = createTestWithDriver(FormItemDriver);

// TEMP: Assess whether the new testing infrastructure is sufficient
const test2 = createTestWithDrivers();

const types = [
  "checkbox",
  "datePicker",
  "file",
  "integer",
  "number",
  "radioGroup",
  "select",
  "switch",
  "text",
  "textarea",
];

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test.skip("label show for formItem", () => {});
  test.skip("enabled=false is disabled", () => {});
  test.skip("can check type=checkbox formItem", () => {});
  test.skip("maxValue invalidates oversized input for number", async ({ createDriver }) => {});
});

/* types
'checkbox'
'datePicker'
'file'
'integer'
'number'
'radioGroup'
'select'
'switch'
'text'
'textarea'
*/

test.skip("type 'checkbox' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("checkbox");
});

test.skip("type 'datePicker' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("application");
});

test.skip("type 'file' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("button");
});

test.skip("type 'integer' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  // expect(driver.component).toHaveRole("spinbutton")
});

test.skip("type 'number' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  // expect(driver.component).toHaveRole("spinbutton")
});

test.skip("type 'radioGroup' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("radiogroup");
});

test.skip("type 'select' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("combobox");
});

test.skip("type 'switch' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("switch");
});

test.skip("type 'text' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("textbox");
});

test.skip("type 'textarea' renders right aria role", async ({ createDriver }) => {
  const driver = await createDriver(`future markup here`);
  //expect(driver.component).toHaveRole("textbox");
});

// NOTE: Shouldn't we show validation messages for fields without a label?
test.skip(
  "not setting label does not show validation messages when invalid",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ createDriver }) => {}
);

test.skip(
  "validation message shows when field is invalid",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ createDriver }) => {}
);

test2("only run other validations if required field is filled", async ({ initTestBed, createDriver }) => {
  await initTestBed(`
    <Form testId="testForm" data="{{ name: '' }}" onSubmit="testState = true">
      <FormItem
        testId="testField"
        label="x"
        bindTo="name"
        minLength="3"
        lengthInvalidMessage="Name is too short!"
        required="true"
        requiredInvalidMessage="This field is required" />
    </Form>`
  );
  const formDriver = await createDriver(FormDriver, "testForm");
  const formItemDriver = await createDriver(FormItemDriver, "testField");

  // Step 1: Submit form without filling in required field to trigger validation display
  await formDriver.submitForm();

  await expect(formItemDriver.component).toHaveText(/This field is required/);
  await expect(formItemDriver.component).not.toHaveText(/Name is too short!/);

  // Step 2: Fill input field with less than 3 chars to trigger minLength validation
  await formItemDriver.fillField("Bo");

  await expect(formItemDriver.component).not.toHaveText(/This field is required/);
  await expect(formItemDriver.component).toHaveText(/Name is too short!/);
});

test2("other validations run if field is not required", async ({ initTestBed, createDriver }) => {
  await initTestBed(`
    <Form testId="testForm" data="{{ name: '' }}" onSubmit="testState = true">
      <FormItem
        testId="testField"
        label="x"
        bindTo="name"
        minLength="3"
        lengthInvalidMessage="Name is too short!"
        required="false"
        requiredInvalidMessage="This field is required" />
    </Form>`
  );
  const formDriver = await createDriver(FormDriver, "testForm");
  const formItemDriver = await createDriver(FormItemDriver, "testField");

  await formDriver.submitForm();

  await expect(formItemDriver.component).not.toHaveText(/This field is required/);
  await expect(formItemDriver.component).toHaveText(/Name is too short!/);
});

types.forEach((testCase) => {
  test.skip(`autofocus for type '${testCase}' works`, async ({ createDriver }) => {});
});

test.skip(`customValidationsDebounce delays validation`, async ({ createDriver }) => {});

// Enabled should be tested inside each input component

// forEach
test.skip(`initialValue is recognisable without bindTo`, async ({ createDriver }) => {});

// forEach
test.skip(`initialValue is recognisable with undefined bindTo value`, async ({
  createDriver,
}) => {});

// forEach
test.skip(`initialValue is recognisable with null bindTo value`, async ({ createDriver }) => {});

// forEach
test.skip(`initialValue is NOT recognisable with valid bindTo value`, async ({
  createDriver,
}) => {});

// forEach
test.skip("form's data value is updated when bound to FormItem", async ({ createDriver }) => {});

types.forEach((testCase) => {
  test.skip(`label displayed for type '${testCase}'`, async ({ createDriver }) => {});
});

// discuss if the thing we are testing here is even good
// test.skip("long label spans multiple lines with labelBreak=true ", async ({createDriver}) =>{ })
// test.skip("long label spans 1 lines with labelBreak=false ", async ({createDriver}) =>{ })

// test.skip("labelWidth can be greater than FormItem width", async ({createDriver}) =>{ })
// test.skip("labelWidth sets width precisely", async ({createDriver}) =>{ })

test.skip("label position bottom is below formItem", async ({ createDriver }) => {});
test.skip("label position left is left of formItem", async ({ createDriver }) => {});
test.skip("label position right is right of formItem", async ({ createDriver }) => {});
test.skip("label position top is above formItem", async ({ createDriver }) => {});

// forEach
test.skip("lengthInvalidMessage displayed when min value not met", async ({ createDriver }) => {});
test.skip("lengthInvalidMessage displayed when max value not met", async ({ createDriver }) => {});

test.skip("lenghtInvalidSeverity shows error severity level", async ({ createDriver }) => {});
test.skip("lenghtInvalidSeverity shows warning severity level", async ({ createDriver }) => {});
test.skip("lenghtInvalidSeverity shows valid severity level", async ({ createDriver }) => {});
// check all the different severity shown once

test.skip("pattern validation 'email' recognises bad input", async ({ createDriver }) => {});
test.skip("pattern validation 'email' leaves good input", async ({ createDriver }) => {});
test.skip("pattern validation 'phone' recognises bad input", async ({ createDriver }) => {});
test.skip("pattern validation 'phone' leaves good input", async ({ createDriver }) => {});
test.skip("pattern validation 'url' recognises bad input", async ({ createDriver }) => {});
test.skip("pattern validation 'url' leaves good input", async ({ createDriver }) => {});

// BELOW
test.skip("patternInvalidMessage is displayed when email validation fails", async ({
  createDriver,
}) => {});

// forEach
test.skip("patternInvalidSeverity shows error severity level", async ({ createDriver }) => {});
test.skip("patternInvalidSeverity shows valid severity level", async ({ createDriver }) => {});
test.skip("patternInvalidSeverity shows warning severity level", async ({ createDriver }) => {});

// TODO: how is this different than maxLength?
test.skip("maxTextLength", async ({ createDriver }) => {});

test.skip("maxLength fires beyond limit for type 'text'", async ({ createDriver }) => {});
test.skip("maxLength fires beyond limit for type 'textarea'", async ({ createDriver }) => {});
test.skip("maxLength fires beyond limit for type 'integer'", async ({ createDriver }) => {});
test.skip("maxLength fires beyond limit for type 'number'", async ({ createDriver }) => {});
test.skip("maxLength does not affect validation for type 'checkbox'", async ({
  createDriver,
}) => {});
test.skip("maxLength does not affect validation for type 'datePicker'", async ({
  createDriver,
}) => {});
test.skip("maxLength does not affect validation for type 'file'", async ({ createDriver }) => {});
test.skip("maxLength does not affect validation for type 'radioGroup'", async ({
  createDriver,
}) => {});
test.skip("maxLength does not affect validation for type 'select'", async ({ createDriver }) => {});
test.skip("maxLength does not affect validation for type 'switch'", async ({ createDriver }) => {});

test.skip("maxValue invalidates oversized input for integer", async ({ createDriver }) => {});
test.skip("maxValue invalidates oversized input for number", async ({ createDriver }) => {});
//todo later, not yet implemented
test.fixme(
  "maxValue invalidates oversized date for type 'datePicker'",
  async ({ createDriver }) => {},
);

test.skip("maxValue does not affect validation for type 'checkbox'", async ({
  createDriver,
}) => {});
test.skip("maxValue does not affect validation for type 'file'", async ({ createDriver }) => {});
test.skip("maxValue does not affect validation for type 'radioGroup'", async ({
  createDriver,
}) => {});
test.skip("maxValue does not affect validation for type 'select'", async ({ createDriver }) => {});
test.skip("maxValue does not affect validation for type 'switch'", async ({ createDriver }) => {});
test.skip("maxValue does not affect validation for type 'text'", async ({ createDriver }) => {});
test.skip("maxValue does not affect validation for type 'textarea'", async ({
  createDriver,
}) => {});

test.skip("minValue invalidates undersized input for integer", async ({ createDriver }) => {});
test.skip("minValue invalidates undersized input for number", async ({ createDriver }) => {});
//todo later, not yet implemented
test.fixme(
  "minValue invalidates undersized date for type 'datePicker'",
  async ({ createDriver }) => {},
);

test.skip("minValue does not affect validation for type 'checkbox'", async ({
  createDriver,
}) => {});
test.skip("minValue does not affect validation for type 'file'", async ({ createDriver }) => {});
test.skip("minValue does not affect validation for type 'radioGroup'", async ({
  createDriver,
}) => {});
test.skip("minValue does not affect validation for type 'select'", async ({ createDriver }) => {});
test.skip("minValue does not affect validation for type 'switch'", async ({ createDriver }) => {});
test.skip("minValue does not affect validation for type 'text'", async ({ createDriver }) => {});
test.skip("minValue does not affect validation for type 'textarea'", async ({
  createDriver,
}) => {});

test.skip("always invalidates when maxValue < minValue", async ({ createDriver }) => {});

test.skip("rangeInvalidMessage shows for undersized input", async ({ createDriver }) => {});
test.skip("rangeInvalidMessage shows for oversized input", async ({ createDriver }) => {});

test.skip("rangeInvalidSeverity shows error severity level", async ({ createDriver }) => {});
test.skip("rangeInvalidSeverity shows warning severity level", async ({ createDriver }) => {});
test.skip("rangeInvalidSeverity shows valid severity level", async ({ createDriver }) => {});

test.skip("regex validation finds invalid input for type 'text'", async ({ createDriver }) => {});
test.skip("regex validation leaves valid input for type 'text'", async ({ createDriver }) => {});
test.skip("regex validation finds invalid input for type 'textarea'", async ({
  createDriver,
}) => {});
test.skip("regex validation leaves valid input for type 'textarea'", async ({
  createDriver,
}) => {});

test.skip("regex doesn't validate each line of textarea separately", async ({
  createDriver,
}) => {});

test.skip("regex validation does not affect type 'integer'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'number'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'checkbox'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'datePicker'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'file'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'radioGroup'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'select'", async ({ createDriver }) => {});
test.skip("regex validation does not affect type 'switch'", async ({ createDriver }) => {});

test.skip("regexInvalidMessage displays on regex validation failure", async ({
  createDriver,
}) => {});

test.skip("regexInvalidSeverity shows error severity level", async ({ createDriver }) => {});
test.skip("regexInvalidSeverity shows valid severity level", async ({ createDriver }) => {});
test.skip("regexInvalidSeverity shows warning severity level", async ({ createDriver }) => {});

//TODO: can foreach this
test.describe("required field", () => {
  test.skip("requiredInvalidMessage displayed when is empty", async ({ createDriver }) => {});

  test.skip("required shows error when empty for type 'text'", async ({ createDriver }) => {});
  test.skip("required doesn't show error when not empty for type 'text'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when empty for type 'textarea'", async ({ createDriver }) => {});
  test.skip("required doesn't show error when not empty for type 'textarea'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when empty for type 'number'", async ({ createDriver }) => {});
  test.skip("required doesn't show error when not empty for type 'number'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when empty for type 'integer'", async ({ createDriver }) => {});
  test.skip("required doesn't show error when not empty for type 'integer'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when unchecked for type 'checkbox'", async ({
    createDriver,
  }) => {});
  test.skip("required doesn't show error when checked for type 'checkbox'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when empty for type 'datePicker'", async ({
    createDriver,
  }) => {});
  test.skip("required doesn't show error when date selected for type 'datePicker'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when no file for type 'file'", async ({ createDriver }) => {});
  test.skip("required doesn't show error when file uploaded for type 'file'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when none selected for type 'radioGroup'", async ({
    createDriver,
  }) => {});
  test.skip("required doesn't show error when option selected for type 'radioGroup'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when none selected for type 'select'", async ({
    createDriver,
  }) => {});
  test.skip("required doesn't show error when option selected for type 'select'", async ({
    createDriver,
  }) => {});

  test.skip("required shows error when off for type 'switch'", async ({ createDriver }) => {});
  test.skip("required doesn't show error when on for type 'switch'", async ({
    createDriver,
  }) => {});
});

//todo: is this even a good property? using it can become confusing quickly
test.skip("syncToValidation overrides maxTextLength on Text", async ({ createDriver }) => {});
test.skip("syncToValidation overrides maxTextLength on TextArea", async ({ createDriver }) => {});
test.skip("syncToValidation overrides min value on NumberBox", async ({ createDriver }) => {});
test.skip("syncToValidation overrides max value on NumberBox", async ({ createDriver }) => {});
test.skip("syncToValidation=false doesn't override maxTextLength on Text", async ({
  createDriver,
}) => {});
test.skip("syncToValidation=false doesn't override maxTextLength on TextArea", async ({
  createDriver,
}) => {});
test.skip("syncToValidation=false doesn't override min value on NumberBox", async ({
  createDriver,
}) => {});
test.skip("syncToValidation=false doesn't override max value on NumberBox", async ({
  createDriver,
}) => {});

// ValidationMode tests
test.skip("validationMode 'errorLate' shows error after blur, not before", async ({
  createDriver,
}) => {});
test.skip("validationMode 'errorLate' shows error after re-focusing and changing invalid input to stay invalid", async ({
  createDriver,
}) => {});
test.skip("validationMode 'errorLate' immediately hides error after correcting error", async ({
  createDriver,
}) => {});
test.skip("validationMode 'onChanged' shows error after first keystroke", async ({
  createDriver,
}) => {});
test.skip("validationMode 'onChanged' hides error right after correcting input", async ({
  createDriver,
}) => {});
test.skip("validationMode 'onLostFocus' shows errors on blur, but not before", async ({
  createDriver,
}) => {});
test.skip("validationMode 'onLostFocus' keeps error message for corrected input until blured", async ({
  createDriver,
}) => {});

test.skip("onValidate fires on every change", async ({ createDriver }) => {});

test.describe("regression tests", () => {
  test.fixme("two form item without bindTo are independent", async ({ createDriver }) => {});
});
