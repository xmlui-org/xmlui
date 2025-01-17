import { FormDriver } from "@components/Form/FormDriver";
import { SKIP_REASON } from "@testing/component-test-helpers";
import {
  expect,
  ComponentDriver,
  createTestWithDriver,
  createTestWithDrivers,
} from "@testing/fixtures";
import { check } from "yargs";

class FormItemDriver extends ComponentDriver {
  // Need to check for input type
  async fillField(value: any) {
    await this.locator.getByRole("textbox").fill(value);
  }

  get input() {
    return this.locator.locator("input", {});
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
  // NOTE: This throws an error when running `npm run test:e2e`:
  // "Error: Can't call test() inside a describe() suite of a different test type."
  //
  /* test2("label show for formItem", async ({ initTestBed, createDriver }) => {
    const source = `
        <Form >
          <FormItem testId="form-item" label="test-label" />
        </Form>`;

    await initTestBed(source);
    const driver = await createDriver(FormItemDriver, "form-item");
    await expect(driver.component).toHaveText("test-label");
  });

  // using a label breaks the testId. Could use a locator insted.
  test2(
    "WITH DRIVER can check type=checkbox formItem",
    async ({ page, initTestBed, createDriver }) => {
      // const source = `
      // <Form>
      //   <FormItem type=checkbox testId="form-item" label="hello" />
      // </Form>`;
      const source = `
      <Form>
        <FormItem type=checkbox testId="form-item" />
      </Form>`;

      await initTestBed(source);
      const driver = await createDriver(FormItemDriver, "form-item");
      // const driver = await createDriver(FormItemDriver, page.getByRole("checkbox"));
      await expect(driver.component).not.toBeChecked();
      await driver.component.check();
      await expect(driver.component).toBeChecked();
    },
  );

  // or could allow ourselves not to use drivers where they aren't necesary.
  test2("can check type=checkbox formItem", async ({ page, initTestBed, createDriver }) => {
    const source = `
        <Form>
          <FormItem type=checkbox testId="form-item" label=hithere/>
        </Form>`;

    await initTestBed(source);
    const checkbox = page.getByRole("checkbox");

    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }); */

  test.skip(
    "maxValue invalidates oversized input for number",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
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

test.skip(
  "type 'checkbox' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("checkbox");
  },
);

test.skip(
  "type 'datePicker' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("application");
  },
);

test.skip(
  "type 'file' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("button");
  },
);

test.skip(
  "type 'integer' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    // expect(driver.component).toHaveRole("spinbutton")
  },
);

test.skip(
  "type 'number' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    // expect(driver.component).toHaveRole("spinbutton")
  },
);

test.skip(
  "type 'radioGroup' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("radiogroup");
  },
);

test.skip(
  "type 'select' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("combobox");
  },
);

test.skip(
  "type 'switch' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("switch");
  },
);

test.skip(
  "type 'text' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("textbox");
  },
);

test.skip(
  "type 'textarea' renders right aria role",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {
    const driver = await createDriver(`future markup here`);
    //expect(driver.component).toHaveRole("textbox");
  },
);

test.skip(
  "not setting label should show validation messages when invalid",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ createDriver }) => {},
);

test.skip(
  "validation message shows when field is invalid",
  SKIP_REASON.NOT_IMPLEMENTED_XMLUI(),
  async ({ createDriver }) => {},
);

test2(
  "only run other validations if required field is filled",
  async ({ initTestBed, createDriver }) => {
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
    </Form>`);
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
  },
);

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
    </Form>`);
  const formDriver = await createDriver(FormDriver, "testForm");
  const formItemDriver = await createDriver(FormItemDriver, "testField");

  await formDriver.submitForm();

  await expect(formItemDriver.component).not.toHaveText(/This field is required/);
  await expect(formItemDriver.component).toHaveText(/Name is too short!/);
});

types.forEach((testCase) => {
  test.skip(
    `autofocus for type '${testCase}' works`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
});

test.skip(
  `customValidationsDebounce delays validation`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// Enabled should be tested inside each input component

// forEach
test.skip(
  `initialValue is recognisable without bindTo`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// forEach
test.skip(
  `initialValue is recognisable with undefined bindTo value`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// forEach
test.skip(
  `initialValue is recognisable with null bindTo value`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// forEach
test.skip(
  `initialValue is NOT recognisable with valid bindTo value`,
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// forEach
test.skip(
  "form's data value is updated when bound to FormItem",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

types.forEach((testCase) => {
  test.skip(
    `label displayed for type '${testCase}'`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
});

// discuss if the thing we are testing here is even good
// test.skip("long label spans multiple lines with labelBreak=true ", async ({createDriver}) =>{ })
// test.skip("long label spans 1 lines with labelBreak=false ", async ({createDriver}) =>{ })

// test.skip("labelWidth can be greater than FormItem width", async ({createDriver}) =>{ })
// test.skip("labelWidth sets width precisely", async ({createDriver}) =>{ })

test.skip(
  "label position bottom is below formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "label position start is left (ltr) of formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "label position end is right (ltr) of formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "label position top is above formItem",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

// forEach
test.skip(
  "lengthInvalidMessage displayed when min value not met",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "lengthInvalidMessage displayed when max value not met",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);

test.skip(
  "lenghtInvalidSeverity shows error severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "lenghtInvalidSeverity shows warning severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "lenghtInvalidSeverity shows valid severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
// check all the different severity shown once

test.skip(
  "pattern validation 'email' recognises bad input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "pattern validation 'email' leaves good input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "pattern validation 'phone' recognises bad input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "pattern validation 'phone' leaves good input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "pattern validation 'url' recognises bad input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);
test.skip(
  "pattern validation 'url' leaves good input",
  SKIP_REASON.TO_BE_IMPLEMENTED("needs some infra for validation as well"),
  async ({ createDriver }) => {},
);

test.skip("patternInvalidMessage is displayed when email validation fails", async ({
  createDriver,
}) => {});

// forEach
test.skip("patternInvalidSeverity shows error severity level", async ({ createDriver }) => {});
test.skip("patternInvalidSeverity shows valid severity level", async ({ createDriver }) => {});
test.skip("patternInvalidSeverity shows warning severity level", async ({ createDriver }) => {});

// TODO: how is this different than maxLength?
test.skip("maxTextLength", async ({ createDriver }) => {});

test.skip(
  "maxLength prevents typing beyond limit for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength prevents typing beyond limit for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength prevents typing beyond limit for type 'integer'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength prevents typing beyond limit for type 'number'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxLength does not affect validation for type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "maxValue invalidates oversized input for integer",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue invalidates oversized input for number",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
//todo later, not yet implemented
test.fixme(
  "maxValue invalidates oversized date for type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "maxValue does not affect validation for type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "maxValue does not affect validation for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "minValue invalidates undersized input for integer",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue invalidates undersized input for number",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
//todo later, not yet implemented
test.fixme(
  "minValue invalidates undersized date for type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "minValue does not affect validation for type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue does not affect validation for type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue does not affect validation for type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue does not affect validation for type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue does not affect validation for type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue does not affect validation for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "minValue does not affect validation for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "always invalidates when maxValue < minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "rangeInvalidMessage shows for undersized input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "rangeInvalidMessage shows for oversized input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "rangeInvalidSeverity shows error severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "rangeInvalidSeverity shows warning severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "rangeInvalidSeverity shows valid severity level",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "regex validation finds invalid input for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation leaves valid input for type 'text'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation finds invalid input for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation leaves valid input for type 'textarea'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "regex doesn't validate each line of textarea separately",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "regex validation does not affect type 'integer'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'number'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'checkbox'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'datePicker'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'file'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'radioGroup'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'select'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regex validation does not affect type 'switch'",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "regexInvalidMessage displays on regex validation failure",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "regexInvalidSeverity shows error severity level",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regexInvalidSeverity shows valid severity level",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "regexInvalidSeverity shows warning severity level",
  SKIP_REASON.TEST_INFRA_NOT_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

//TODO: can foreach this
test.describe("required field", () => {
  test.skip(
    "requiredInvalidMessage displayed when is empty",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when empty for type 'text'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'text'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when empty for type 'textarea'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'textarea'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when empty for type 'number'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'number'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when empty for type 'integer'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when not empty for type 'integer'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when unchecked for type 'checkbox'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when checked for type 'checkbox'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when empty for type 'datePicker'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when date selected for type 'datePicker'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when no file for type 'file'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when file uploaded for type 'file'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when none selected for type 'radioGroup'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when option selected for type 'radioGroup'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when none selected for type 'select'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when option selected for type 'select'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );

  test.skip(
    "required shows error when off for type 'switch'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
  test.skip(
    "required doesn't show error when on for type 'switch'",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ createDriver }) => {},
  );
});

// ValidationMode tests
test.skip(
  "validationMode 'errorLate' shows error after blur, not before",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "validationMode 'errorLate' shows error after re-focusing and changing invalid input to stay invalid",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "validationMode 'errorLate' immediately hides error after correcting error",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "validationMode 'onChanged' shows error after first keystroke",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "validationMode 'onChanged' hides error right after correcting input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "validationMode 'onLostFocus' shows errors on blur, but not before",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);
test.skip(
  "validationMode 'onLostFocus' keeps error message for corrected input until blured",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.skip(
  "onValidate fires on every change",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ createDriver }) => {},
);

test.describe("regression tests", () => {
  test.fixme(
    "two form item without bindTo are independent",
    SKIP_REASON.XMLUI_BUG(),
    async ({ createDriver }) => {},
  );
});
