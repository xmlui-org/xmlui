import { labelPositionValues, validationStatusValues } from "../abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// --- Smoke

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("TextArea is rendered", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  // --- initialValue

  // correct types: string, undefined, null, number, boolean -> everything will be coerced to strings
  [
    { label: "undefined", value: "'{undefined}'", toExpect: "" },
    { label: "null", value: "'{null}'", toExpect: "" },
    { label: "empty string", value: "''", toExpect: "" },
    { label: "string", value: "'test'", toExpect: "test" },
    { label: "integer", value: "'{1}'", toExpect: "1" },
    { label: "float", value: "'{1.2}'", toExpect: "1.2" },
    { label: "boolean", value: "'{true}'", toExpect: "true" },
  ].forEach(({ label, value, toExpect }) => {
    test(`setting initialValue to ${label} sets value of field`, async ({
      initTestBed,
      createTextAreaDriver,
    }) => {
      await initTestBed(`<TextArea initialValue=${value} />`);
      const driver = await createTextAreaDriver();

      await expect(driver.field).toHaveValue(toExpect);
    });
  });

  // --- placeholder

  test("placeholder appears if input field is empty", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea placeholder="test" />`);
    const driver = await createTextAreaDriver();

    expect(await driver.placeholder).toBe("test");
  });

  // --- label

  test("label is rendered if provided", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea label="Input Field Label" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.label).toHaveText("Input Field Label");
  });

  // --- required

  test("empty required TextArea shows visual indicator", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea label="test" required="{true}" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.label).toContainText("*");
    await expect(driver.field).toHaveAttribute("required");
  });

  // --- readOnly

  test("readOnly is not editable", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea readOnly="{true}" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).not.toBeEditable();
  });

  // --- enabled

  test("enabled input field supports user interaction", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea enabled="true" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toBeEditable();
  });

  test("disabled input field prevents user interaction", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea enabled="false" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).not.toBeEditable();
  });

  // --- onDidChange

  test("onDidChange is called on input change", async ({ initTestBed, createTextAreaDriver }) => {
    const { testStateDriver } = await initTestBed(`<TextArea onDidChange="testState = 'test'" />`);
    const driver = await createTextAreaDriver();
    await driver.field.fill("a");

    await expect.poll(testStateDriver.testState).toBe("test");
  });

  // --- gotFocus

  test("gotFocus event fires on focusing the field", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`<TextArea onGotFocus="testState = true" />`);
    const driver = await createTextAreaDriver();

    await driver.focus();
    await expect(driver.field).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  // --- lostFocus

  test("lostFocus event fires when field is blured", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`<TextArea onLostFocus="testState = true" />`);
    const driver = await createTextAreaDriver();

    await driver.focus();
    await driver.blur();

    await expect(driver.field).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  // --- value

  test("value returns current input value", async ({
    initTestBed,
    createTextAreaDriver,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="textarea" initialValue="hello world" />
        <Text testId="text" value="{textarea.value}" />
      </Fragment>`);
    const textDriver = await createTextDriver("text");
    const textareaDriver = await createTextAreaDriver("textarea");

    const value = await textareaDriver.field.inputValue();
    await expect(textDriver.component).toHaveText(value);
  });

  // --- setValue

  test("setValue updates input value", async ({
    initTestBed,
    createButtonDriver,
    createTextAreaDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="textarea" />
        <Button testId="button" onClick="textarea.setValue('test')" />
      </Fragment>`);
    const buttonDriver = await createButtonDriver("button");
    const textareaDriver = await createTextAreaDriver("textarea");

    await buttonDriver.click();
    await expect(textareaDriver.field).toHaveText("test");
  });

  // --- focus

  test("focus() focuses the field", async ({
    initTestBed,
    createButtonDriver,
    createTextAreaDriver,
  }) => {
    await initTestBed(`
    <Fragment>
      <TextArea id="textarea" />
      <Button testId="button" onClick="textarea.focus()" />
    </Fragment>`);
    const buttonDriver = await createButtonDriver("button");
    const textareaDriver = await createTextAreaDriver("textarea");

    await buttonDriver.click();
    await expect(textareaDriver.field).toBeFocused();
  });

  // --- input tests

  test.skip("copying from clipboard to field pastes correct content", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const { clipboard } = await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    await clipboard.write("test");
    const clipboardContent = await clipboard.getContent();

    await clipboard.pasteTo(driver);
    await expect(driver.field).toHaveValue(clipboardContent);
  });
});

// --- E2E

// --- props

// --- placeholder

test("placeholder is hidden if input field is filled", async ({
  initTestBed,
  createTextAreaDriver,
}) => {
  await initTestBed(`<TextArea placeholder="test" />`);
  const driver = await createTextAreaDriver();

  await driver.field.fill("hello world");
  expect(await driver.placeholder).toBe("test");
  await expect(driver.field).toHaveValue("hello world");
});

// --- initialValue

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
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea initialValue=${value} />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveValue(toExpect);
  });
});

// --- label

test("empty string label is not rendered", async ({ initTestBed, createTextAreaDriver }) => {
  await initTestBed(`<TextArea label="" initialValue="" />`);
  const driver = await createTextAreaDriver();

  await expect(driver.label).not.toBeAttached();
});

test("clicking on the label focuses input field", async ({ initTestBed, createTextAreaDriver }) => {
  await initTestBed(`<TextArea label="Input Field Label" />`);
  const driver = await createTextAreaDriver();

  //await driver.label.click();
  await driver.field.fill("hello world");
  await expect(driver.field).toBeFocused();
});

// --- labelPosition

labelPositionValues.forEach((pos) => {
  test.skip(
    `label position ${pos} is applied for the input field and associated label`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- labelWidth TODO?

// --- labelBreak TODO?

// --- autoFocus

test("focuses component if autoFocus is set", async ({ initTestBed, createTextAreaDriver }) => {
  await initTestBed(`<TextArea autoFocus="{true}" />`);
  await expect((await createTextAreaDriver()).field).toBeFocused();
});

// --- readOnly

test.skip("readOnly lets user copy from input field", async ({ initTestBed, createTextAreaDriver }) => {
  const { clipboard } = await initTestBed(`<TextArea initialValue="test" readOnly="{true}" />`);
  const driver = await createTextAreaDriver();

  await clipboard.copyFrom(driver);
  const clipboardContent = await clipboard.getContent();

  await expect(driver.field).toHaveValue(clipboardContent);
});

// --- startText

test.skip(
  "startText is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<TextArea startText="start" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.component).toContainText("start");
  },
);

// --- startIcon

test.skip(
  "startIcon is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // check rendered icon (similar to Icon test with loading resource) and position
  },
);

// --- endText

test.skip(
  "endText is rendered at the end of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // check text content and position
  },
);

// --- endIcon

test.skip(
  "endIcon is rendered at the end of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {
    // check rendered icon (similar to Icon test with loading resource) and position
  },
);

// --- validationStatus

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

// --- maxLength

test.skip(
  "maxLength caps the length of the input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- events

// --- onDidChange

test("onDidChange function changes are properly reflected", async ({
  initTestBed,
  createTextAreaDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<TextArea onDidChange="(value) => testState = value" />`,
  );
  const driver = await createTextAreaDriver();
  // delay: 100 is approx as fast as a human can type
  await driver.field.pressSequentially("test", { delay: 100 });

  const value = await driver.field.inputValue();
  await expect.poll(testStateDriver.testState).toBe(value);
});

test("onDidChange is not called if field is disabled", async ({
  initTestBed,
  createTextAreaDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<TextArea enabled="false" onDidChange="testState = 'test'" />`,
  );
  const driver = await createTextAreaDriver();

  // Note: we can't test directly to .fill because the field is disabled
  // and fill throws an error: can't find locator.
  await driver.field.pressSequentially("a");
  await expect.poll(testStateDriver.testState).toBe(null);
});

// --- gotFocus

test("gotFocus is not called if field is disabled", async ({
  initTestBed,
  createTextAreaDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<TextArea enabled="false" onGotFocus="testState = true" />`,
  );
  const driver = await createTextAreaDriver();

  await driver.focus();
  await expect(driver.field).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(null);
});

// --- lostFocus

test("lostFocus is called after gotFocus", async ({ initTestBed, createTextAreaDriver }) => {
  const { testStateDriver } = await initTestBed(
    `<TextArea onGotFocus="testState = false" onLostFocus="testState = true" />`,
  );
  const driver = await createTextAreaDriver();

  await driver.focus();
  await driver.blur();

  await expect(driver.field).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("lostFocus is not called before gotFocus", async ({ initTestBed, createTextAreaDriver }) => {
  const { testStateDriver } = await initTestBed(
    `<TextArea onGotFocus="testState = false" onLostFocus="testState = true" />`,
  );
  const driver = await createTextAreaDriver();

  await driver.focus();
  await expect(driver.field).toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(false);

  await driver.blur();
  await expect(driver.field).not.toBeFocused();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

// --- focus

test("focus() does nothing if field is disabled", async ({
  initTestBed,
  createButtonDriver,
  createTextAreaDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <TextArea id="textarea" enabled="false" />
      <Button testId="button" onClick="textarea.focus()" />
    </Fragment>`);
  const buttonDriver = await createButtonDriver("button");
  const textareaDriver = await createTextAreaDriver("textarea");

  await buttonDriver.click();
  await expect(textareaDriver.field).not.toBeFocused();
});

// --- setValue

test("setValue does not update input if field is disabled", async ({
  // We are not sure of the behaviour - need to talk through with team
  initTestBed,
  createButtonDriver,
  createTextAreaDriver,
}) => {
  await initTestBed(`
      <Fragment>
        <TextArea id="textarea" enabled="false" />
        <Button testId="button" onClick="textarea.setValue('test')" />
      </Fragment>`);
  const buttonDriver = await createButtonDriver("button");
  const textareaDriver = await createTextAreaDriver("textarea");

  await buttonDriver.click();
  // await expect(textareaDriver.field).toBeEmpty();
  await expect(textareaDriver.field).toHaveText("test");
});
