import { labelPositionValues, validationStatusValues } from "../abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// --- Smoke

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("TextBox is rendered", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  // --- label

  test("label is rendered if provided", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Input Field Label" />`);
    const driver = await createTextBoxDriver();

    await expect(driver.label).toHaveText("Input Field Label");
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
      createTextBoxDriver,
    }) => {
      await initTestBed(`<TextBox initialValue=${value} />`);
      const driver = await createTextBoxDriver();

      await expect(driver.field).toHaveValue(toExpect);
    });
  });

  // --- required

  test("empty required TextBox shows visual indicator 1", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`<TextBox label="test" required="{true}" />`);
    const driver = await createTextBoxDriver();

    await expect(driver.label).toContainText("*");
    await expect(driver.field).toHaveAttribute("required");
  });

  // --- readOnly

  test("readOnly is not editable", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox readOnly="{true}" />`);
    const driver = await createTextBoxDriver();

    await expect(driver.field).not.toBeEditable();
  });

  // --- enabled

  test("enabled input field supports user interaction", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`<TextBox enabled="true" />`);
    const driver = await createTextBoxDriver();

    await expect(driver.field).toBeEditable();
  });

  test("disabled input field stops user interaction for field", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    await initTestBed(`<TextBox enabled="false" />`);
    const driver = await createTextBoxDriver();

    await expect(driver.field).toBeDisabled();
  });

  // --- onDidChange

  test("onDidChange is called on input change", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`<TextBox onDidChange="testState = 'test'" />`);
    const driver = await createTextBoxDriver();
    await driver.field.fill("a");

    await expect.poll(testStateDriver.testState).toBe("test");
  });

  // --- gotFocus

  test("gotFocus event fires on focusing the field", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`<TextBox onGotFocus="testState = true" />`);
    const driver = await createTextBoxDriver();

    await driver.focus();
    await expect(driver.field).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  // --- lostFocus

  test.skip(
    "lostFocus event fires when field is blured",
    SKIP_REASON.XMLUI_BUG(),
    async ({ initTestBed, createTextBoxDriver }) => {
      const { testStateDriver } = await initTestBed(`<TextBox onLostFocus="testState = true" />`);
      const driver = await createTextBoxDriver();

      await driver.focus();
      await driver.blur();

      await expect(driver.field).not.toBeFocused();
      await expect.poll(testStateDriver.testState).toEqual(true);
    },
  );

  // --- value

  test("value returns current input value", async ({
    initTestBed,
    createTextBoxDriver,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="textbox" initialValue="hello world" />
        <Text testId="text" value="{textbox.value}" />
      </Fragment>`);
    const textDriver = await createTextDriver("text");
    const textboxDriver = await createTextBoxDriver("textbox");

    const value = await textboxDriver.field.inputValue();
    await expect(textDriver.component).toHaveText(value);
  });

  // --- setValue

  test.skip(
    "setValue updates input value",
    SKIP_REASON.XMLUI_BUG(),
    async ({ initTestBed, createButtonDriver, createTextBoxDriver }) => {
      await initTestBed(`
    <Fragment>
      <TextBox id="textbox" />
      <Button testId="button" onClick="textbox.setValue('test')" />
    </Fragment>`);
      const buttonDriver = await createButtonDriver("button");
      const textboxDriver = await createTextBoxDriver("textbox");

      await buttonDriver.click();
      await expect(textboxDriver.component).toHaveText("test");
    },
  );
});

// --- E2E

// --- placeholder

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
    createTextBoxDriver,
  }) => {
    await initTestBed(`<TextBox initialValue=${value} />`);
    const driver = await createTextBoxDriver();

    await expect(driver.field).toHaveValue(toExpect);
  });
});

// --- label

test("empty string label is not rendered", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox label="" initialValue="" />`);
  const driver = await createTextBoxDriver();

  await expect(driver.label).not.toBeAttached();
});

test("clicking on the label focuses input field", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox label="Input Field Label" />`);
  const driver = await createTextBoxDriver();

  await driver.label.click();
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

test("focuses component if autoFocus is set", async ({ initTestBed, createTextBoxDriver }) => {
  await initTestBed(`<TextBox autoFocus="{true}" />`);
  await expect((await createTextBoxDriver()).field).toBeFocused();
});

// --- readOnly

test.skip("readOnly lets user copy from input field", async ({ initTestBed, createTextBoxDriver }) => {
  const { clipboard } = await initTestBed(`<TextBox initialValue="test" readOnly="{true}" />`);
  const driver = await createTextBoxDriver();

  await clipboard.copyFrom(driver);
  const clipboardContent = await clipboard.getContent();

  await expect(driver.field).toHaveValue(clipboardContent);
});

// --- startText

test.skip(
  "startText is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<TextBox startText="start" />`);
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
  createTextBoxDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<TextBox onDidChange="(value) => testState = value" />`,
  );
  const driver = await createTextBoxDriver();
  // delay: 100 is approx as fast as a human can type
  await driver.field.pressSequentially("test", { delay: 100 });

  await expect.poll(testStateDriver.testState).toBe(await driver.field.inputValue());
});

test("onDidChange is not called if field is disabled", async ({
  initTestBed,
  createTextBoxDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<TextBox enabled="false" onDidChange="testState = 'test'" />`,
  );
  const driver = await createTextBoxDriver();

  // Note: we can't test directly to .fill because the field is disabled
  // and fill throws an error: can't find locator.
  await driver.field.pressSequentially("a");
  await expect.poll(testStateDriver.testState).toBe(null);
});

// --- gotFocus

test.skip(
  "gotFocus is not called if field is disabled",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<TextBox enabled="false" onGotFocus="testState = true" />`,
    );
    const driver = await createTextBoxDriver();

    await driver.focus();
    await expect(driver.field).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(null);
  },
);

// --- lostFocus

test.skip(
  "lostFocus is called after gotFocus",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<TextBox onGotFocus="testState = false" onLostFocus="testState = true" />`,
    );
    const driver = await createTextBoxDriver();

    await driver.focus();
    await driver.blur();

    await expect(driver.field).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  },
);

test.skip(
  "lostFocus is not called before gotFocus",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<TextBox onGotFocus="testState = false" onLostFocus="testState = true" />`,
    );
    const driver = await createTextBoxDriver();

    await driver.focus();
    await expect(driver.field).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(false);

    await driver.blur();
    await expect(driver.field).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  },
);

// --- api

// --- focus

test("focus() focuses the field", async ({
  initTestBed,
  createButtonDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <TextBox id="textbox" />
      <Button testId="button" onClick="textbox.focus()" />
    </Fragment>`);
  const buttonDriver = await createButtonDriver("button");
  const textboxDriver = await createTextBoxDriver("textbox");

  await buttonDriver.click();
  await expect(textboxDriver.field).toBeFocused();
});

test("focus() does nothing if field is disabled", async ({
  initTestBed,
  createButtonDriver,
  createTextBoxDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <TextBox id="textbox" enabled="false" />
      <Button testId="button" onClick="textbox.focus()" />
    </Fragment>`);
  const buttonDriver = await createButtonDriver("button");
  const textboxDriver = await createTextBoxDriver("textbox");

  await buttonDriver.click();
  await expect(textboxDriver.field).not.toBeFocused();
});

// --- setValue

test.skip(
  "setValue does not update input if field is disabled",
  SKIP_REASON.UNSURE("We are not sure of the behaviour"),
  async ({ initTestBed, createButtonDriver, createTextBoxDriver }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="textbox" enabled="false" />
        <Button testId="button" onClick="textbox.setValue('test')" />
      </Fragment>`);
    const buttonDriver = await createButtonDriver("button");
    const textboxDriver = await createTextBoxDriver("textbox");

    await buttonDriver.click();
    // await expect(textboxDriver.field).toBeEmpty();
    await expect(textboxDriver.field).toHaveText("test");
  },
);
