import { labelPositionValues, validationStatusValues } from "../abstractions";
import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { NUMBERBOX_MAX_VALUE } from "./numberbox-abstractions";

// --- Smoke

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("NumberBox is rendered", async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  // --- placeholder

  test("placeholder appears if input field is empty", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox2 placeholder="123" />`);
    const driver = await createNumberBoxDriver();

    expect(await driver.placeholder).toBe("123");
  });

  // --- initialValue

  // correct types: number, undefined, null, string that resolves to a VALID number
  [
    { label: "integer", value: "'{1}'", toExpect: "1" },
    { label: "float", value: "'{1.2}'", toExpect: "1.2" },
    { label: "undefined", value: "'{undefined}'", toExpect: "" },
    { label: "null", value: "'{null}'", toExpect: "" },
    { label: "empty string", value: "''", toExpect: "" },
    { label: "string that resolves to integer", value: "'1'", toExpect: "1" },
    { label: "string that resolves to float", value: "'1.2'", toExpect: "1.2" },
  ].forEach(({ label, value, toExpect }) => {
    test(`setting initialValue to ${label} sets value of field`, async ({
      initTestBed,
      createNumberBoxDriver,
    }) => {
      await initTestBed(`<NumberBox2 initialValue=${value} />`);
      const driver = await createNumberBoxDriver();

      await expect(driver.field).toHaveValue(toExpect);
    });
  });

  // --- label

  test("label is rendered if provided", async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 label="Input Field Label" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.label).toHaveText("Input Field Label");
  });

  // --- required

  test("empty required Numberbox shows visual indicator", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox2 label="test" required="{true}" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.label).toContainText("*");
    await expect(driver.field).toHaveAttribute("required");
  });

  // --- enabled

  test("disabled input field stops user interaction for field", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox2 enabled="false" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).toBeDisabled();
  });

  test("disabled input field stops user interaction for spinbox", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox2 enabled="false" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.spinnerUpButton).toBeDisabled();
    await expect(driver.spinnerDownButton).toBeDisabled();
  });

  // --- readOnly

  test("readOnly is not editable", async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 readOnly="{true}" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).not.toBeEditable();
  });

  test("readOnly disables the spinbox", async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 readOnly="{true}" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.spinnerUpButton).toBeDisabled();
    await expect(driver.spinnerDownButton).toBeDisabled();
  });

  // --- onDidChange

  test("onDidChange is called on input change", async ({ initTestBed, createNumberBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`<NumberBox2 onDidChange="testState = 'test'" />`);
    const driver = await createNumberBoxDriver();
    await driver.field.fill("1");

    await expect.poll(testStateDriver.testState).toBe("test");
  });

  // --- gotFocus

  test("gotFocus event fires on focusing the field", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`<NumberBox2 onGotFocus="testState = true" />`);
    const driver = await createNumberBoxDriver();

    await driver.focus();
    await expect(driver.field).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  // --- lostFocus

  test.skip(
    "lostFocus event fires when field is blured",
    SKIP_REASON.XMLUI_BUG(),
    async ({ initTestBed, createNumberBoxDriver }) => {
      const { testStateDriver } = await initTestBed(`<NumberBox2 onLostFocus="testState = true" />`);
      const driver = await createNumberBoxDriver();

      await driver.focus();
      await driver.blur();

      await expect(driver.field).not.toBeFocused();
      await expect.poll(testStateDriver.testState).toEqual(true);
    },
  );

  // --- value

  test("value returns current input value", async ({
    initTestBed,
    createNumberBoxDriver,
    createTextDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox2 id="numberbox" initialValue="123" />
        <Text testId="text" value="{numberbox.value}" />
      </Fragment>`);
    const textDriver = await createTextDriver("text");
    const numberboxDriver = await createNumberBoxDriver("numberbox");

    const value = await numberboxDriver.field.inputValue();
    await expect(textDriver.component).toHaveText(value);
  });

  // --- setValue

  test.skip(
    "setValue updates input value",
    SKIP_REASON.XMLUI_BUG(),
    async ({ initTestBed, createButtonDriver, createNumberBoxDriver }) => {
      await initTestBed(`
        <Fragment>
          <NumberBox2 id="numberbox" />
          <Button testId="button" onClick="numberbox.setValue('test')" />
        </Fragment>`);
      const buttonDriver = await createButtonDriver("button");
      const numberboxDriver = await createNumberBoxDriver("numberbox");

      await buttonDriver.click();
      await expect(numberboxDriver.component).toHaveText("test");
    },
  );

  // --- focus

  test("focus() focuses the field", async ({
    initTestBed,
    createButtonDriver,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox2 id="numberbox" />
        <Button testId="button" onClick="numberbox.focus()" />
      </Fragment>`);
    const buttonDriver = await createButtonDriver("button");
    const numberboxDriver = await createNumberBoxDriver("numberbox");

    await buttonDriver.click();
    await expect(numberboxDriver.field).toBeFocused();
  });

  // --- integersOnly

  test(
    "integersOnly accepts integers",
    async ({ initTestBed, createNumberBoxDriver }) => {
      await initTestBed(`<NumberBox2 integersOnly />`);
      const driver = await createNumberBoxDriver();

      await driver.field.fill("4");
      await expect(driver.field).toHaveValue("4");
    },
  );

  test(
    "integersOnly does not accept floats",
    async ({ initTestBed, createNumberBoxDriver }) => {
      await initTestBed(`<NumberBox2 integersOnly />`);
      const driver = await createNumberBoxDriver();

      await driver.field.fill("4.2");
      await expect(driver.field).toBeEmpty();
    },
  );

  test(
    "integersOnly can't enter floats",
    async ({ initTestBed, createNumberBoxDriver }) => {
      await initTestBed(`<NumberBox2 integersOnly initialValue="4" />`);
      const driver = await createNumberBoxDriver();

      await driver.field.fill(".2");
      await expect(driver.field).toHaveValue("4");
    },
  );

  // TODO: Talk this through?
  test(
    "integersOnly truncates float initialValue",
    async ({ initTestBed, createNumberBoxDriver }) => {
      await initTestBed(`<NumberBox2 integersOnly initialValue="4.2" />`);
      const driver = await createNumberBoxDriver();

      await expect(driver.field).toHaveValue("4");
    },
  );

  // --- zeroOrPositive

  test(
    "zeroOrPositive: accept positive numbers",
    async ({ initTestBed, createNumberBoxDriver }) => {
      const value: string = "1";
      await initTestBed(`<NumberBox2 zeroOrPositive initialValue="{${value}}" />`);
      const driver = await createNumberBoxDriver();

      await driver.field.fill(value);
      await expect(driver.field).toHaveValue(value);
    },
  );

  test(
    "zeroOrPositive: accept 0",
    async ({ initTestBed, createNumberBoxDriver }) => {
      const value: string = "0";
      await initTestBed(`<NumberBox2 zeroOrPositive initialValue="{${value}}" />`);
      const driver = await createNumberBoxDriver();

      await driver.field.fill(value);
      await expect(driver.field).toHaveValue(value);
    },
  );

  test(
    "zeroOrPositive: not accept negative numbers",
    SKIP_REASON.UNSURE("Need to discuss whether to clamp to 0 on initialValue or not accept input"),
    async ({ initTestBed, createNumberBoxDriver }) => {
      const value: string = "-1";
      const expected: string = "0";
      await initTestBed(`<NumberBox2 zeroOrPositive initialValue="{${value}}" />`);
      const driver = await createNumberBoxDriver();

      await driver.field.fill(value);
      await expect(driver.field).toHaveValue(expected);
    },
  );

  test.skip(
    "zeroOrPositive: copy a positive number",
    SKIP_REASON.UNSURE("Related to clipboard tests not running in CI E2E"),
    async ({ initTestBed, createNumberBoxDriver }) => {
      const { clipboard } = await initTestBed(`<NumberBox2 zeroOrPositive />`);
      const driver = await createNumberBoxDriver();

      await clipboard.write("123");
      const clipboardContent = await clipboard.read();

      //await clipboard.pasteTo(driver);
      await expect(driver.field).toHaveValue(clipboardContent);
    },
  );

  test.skip(
    "zeroOrPositive: copy 0",
    SKIP_REASON.UNSURE("Related to clipboard tests not running in CI E2E"),
    async ({ initTestBed, createNumberBoxDriver }) => {
      const { clipboard } = await initTestBed(`<NumberBox2 zeroOrPositive />`);
      const driver = await createNumberBoxDriver();

      await clipboard.write("0");
      const clipboardContent = await clipboard.read();

      //await clipboard.pasteTo(driver);
      await expect(driver.field).toHaveValue(clipboardContent);
    },
  );

  test.skip(
    "zeroOrPositive: cannot copy a negative number",
    SKIP_REASON.UNSURE("Related to clipboard tests not running in CI E2E"),
    async ({ initTestBed, createNumberBoxDriver }) => {
      const { clipboard } = await initTestBed(`<NumberBox2 zeroOrPositive />`);
      const driver = await createNumberBoxDriver();

      await clipboard.write("-123");

      //await clipboard.pasteTo(driver);
      await expect(driver.field).toBeEmpty();
    },
  );

  // --- input tests

  test.skip("copying from clipboard to field pastes correct content", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    const { clipboard } = await initTestBed(`<NumberBox2 />`);
    const driver = await createNumberBoxDriver();

    await clipboard.write("123");
    const clipboardContent = await clipboard.read();

    //await clipboard.pasteTo(driver);
    await expect(driver.field).toHaveValue(clipboardContent);
  });
});

// --- E2E

// --- Props

// --- placeholder

test("placeholder is hidden if input field is filled", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox2 placeholder="123" />`);
  const driver = await createNumberBoxDriver();

  await driver.field.fill("456");
  expect(await driver.placeholder).toBe("123");
  await expect(driver.field).toHaveValue("456");
});

// --- initialValue

[
  { label: "boolean", value: "'{true}'" },
  { label: "non-number string", value: "'asdasd'" },
  { label: "empty array", value: [] },
  { label: "array", value: [1, 2, 3] },
  { label: "empty object", value: {} },
  { label: "object", value: { a: 1, b: "hi" } },
  { label: "function", value: () => {} },
  { label: "NaN", value: NaN },
].forEach(({ label, value }) => {
  test.skip(
    `setting initialValue to ${label} throws error`,
    SKIP_REASON.UNSURE("Some input case handlings need to be discussed, such as NaN"),
    async ({ initTestBed, createNumberBoxDriver }) => {
      await initTestBed(`<NumberBox2 initialValue=${value} />`);
      const driver = await createNumberBoxDriver();

      await expect(driver.field).toHaveValue("");
    },
  );
});

test.skip(
  "if initialValue is too large, cap actual value to NUMBERBOX_MAX_VALUE constant",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 initialValue="100000000000000000000000000000000000" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).toHaveValue(NUMBERBOX_MAX_VALUE.toString());
  },
);

test.skip(
  "if initialValue is too small, cap actual value to -NUMBERBOX_MAX_VALUE constant",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 initialValue="-100000000000000000000000000000000000" />`);
    const driver = await createNumberBoxDriver();

    await expect(driver.field).toHaveValue(NUMBERBOX_MAX_VALUE.toString());
  },
);

// --- label

test("empty string label is not rendered", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox2 label="" initialValue="" />`);
  const driver = await createNumberBoxDriver();

  await expect(driver.label).not.toBeAttached();
});

test("clicking on the label focuses input field", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  await initTestBed(`<NumberBox2 label="Input Field Label" />`);
  const driver = await createNumberBoxDriver();

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

test("focuses component if autoFocus is set", async ({ initTestBed, createNumberBoxDriver }) => {
  await initTestBed(`<NumberBox2 autoFocus="{true}" />`);
  await expect((await createNumberBoxDriver()).field).toBeFocused();
});

// --- readOnly

test.skip("readOnly lets user copy from input field", async ({ initTestBed, createNumberBoxDriver }) => {
  const { clipboard } = await initTestBed(`<NumberBox2 initialValue="test" readOnly="{true}" />`);
  const driver = await createNumberBoxDriver();

  //await clipboard.copyFrom(driver);
  const clipboardContent = await clipboard.read();

  await expect(driver.field).toHaveValue(clipboardContent);
});

// --- startText

test.skip(
  "startText is rendered at the start of the field",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox2 startText="start" />`);
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

// --- hasSpinBox

test.skip(
  "renders spinbox if set to true",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "does not render spinbox if set to false",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox up-arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing up arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox down-arrow subtracts default step value from input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing down arrow adds default step value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox up-arrow that would overflow max value does not add value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing the up arrow that would overflow max value does not add value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "clicking spinbox down-arrow that would underflow min value does not subtract value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "pressing the down arrow that would underflow min value does not subtract value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- step

test.skip(
  "setting valid integer step adds that value to input",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

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
  test.skip(
    `${label} is ignored and default step value is used`,
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});

// --- zeroOrPositive

test.skip(
  "down button on spinbox does nothing when result would be negative",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- minValue

test.skip(
  "minValue limits input to numbers greater than or equal to minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "user cannot copy a number less than minValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- maxValue

test.skip(
  "maxValue limits input to numbers less than or equal to maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "user cannot copy a number greater than maxValue",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- events

// --- onDidChange

test("onDidChange function changes are reflected", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<NumberBox2 onDidChange="(value) => testState = String(value)" />`,
  );
  const driver = await createNumberBoxDriver();
  // delay: 100 is approx as fast as a human can type
  await driver.field.pressSequentially("123", { delay: 100 });

  await expect.poll(testStateDriver.testState).toBe(await driver.field.inputValue());
});

test("onDidChange function changes are reflected (long number)", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<NumberBox2 onDidChange="(value) => testState = String(value)" />`,
  );
  const driver = await createNumberBoxDriver();
  // delay: 100 is approx as fast as a human can type
  await driver.field.pressSequentially("123123", { delay: 100 });

  await expect.poll(testStateDriver.testState).toBe(await driver.field.inputValue());
});

test("onDidChange is not called if field is disabled", async ({
  initTestBed,
  createNumberBoxDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<NumberBox2 enabled="false" onDidChange="testState = 'test'" />`,
  );
  const driver = await createNumberBoxDriver();

  // Note: we can't test directly to .fill because the field is disabled
  // and fill throws an error: can't find locator.
  await driver.field.pressSequentially("1");
  await expect.poll(testStateDriver.testState).toBe(null);
});

// --- gotFocus

test.skip(
  "gotFocus is not called if field is disabled",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox2 enabled="false" onGotFocus="testState = true" />`,
    );
    const driver = await createNumberBoxDriver();

    await driver.focus();
    await expect(driver.field).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(null);
  },
);

// --- lostFocus

test.skip(
  "lostFocus is called after gotFocus",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox2 onGotFocus="testState = false" onLostFocus="testState = true" />`,
    );
    const driver = await createNumberBoxDriver();

    await driver.focus();
    await driver.blur();

    await expect(driver.field).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
  },
);

test.skip(
  "lostFocus is not called before gotFocus",
  SKIP_REASON.XMLUI_BUG(),
  async ({ initTestBed, createNumberBoxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox2 onGotFocus="testState = false" onLostFocus="testState = true" />`,
    );
    const driver = await createNumberBoxDriver();

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

test("focus() does nothing if field is disabled", async ({
  initTestBed,
  createButtonDriver,
  createNumberBoxDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <NumberBox2 id="numberbox" enabled="false" />
      <Button testId="button" onClick="numberbox.focus()" />
    </Fragment>`);
  const buttonDriver = await createButtonDriver("button");
  const numberboxDriver = await createNumberBoxDriver("numberbox");

  await buttonDriver.click();
  await expect(numberboxDriver.field).not.toBeFocused();
});

// --- setValue

test.skip(
  "setValue does not update input if field is disabled",
  SKIP_REASON.UNSURE("We are not sure of the behaviour"),
  async ({ initTestBed, createButtonDriver, createNumberBoxDriver }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox2 id="numberbox" enabled="false" />
        <Button testId="button" onClick="numberbox.setValue('test')" />
      </Fragment>`);
    const buttonDriver = await createButtonDriver("button");
    const numberboxDriver = await createNumberBoxDriver("numberbox");

    await buttonDriver.click();
    // await expect(numberboxDriver.field).toBeEmpty();
    await expect(numberboxDriver.field).toHaveText("test");
  },
);

test.skip(
  "setValue does not update input if value is invalid",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

// --- testing for input types

test.skip("field accepts empty input", SKIP_REASON.TO_BE_IMPLEMENTED(), async ({ initTestBed }) => {
  // value is assigned undefined or null if this is the case
});

test.skip(
  "entering multiple 0s only results in one 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "copying multiple 0s only results in one 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "entering: no leading 0s are allowed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "copying: no leading 0s are allowed",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is rendered at the start of the field if prompt is at the start",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is rendered at the start of the field if prompt is at any point in input value",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is removed if user inputs a second minus sign",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "minus sign is removed if user copies a second minus sign",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to an integer results in a float",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to a float replaces the last point",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the beginning of an integer adds a leading 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the end of an integer adds a trailing 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the beginning of 0 does adds a leading 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);

test.skip(
  "adding floating point to the end of 0 adds a trailing 0",
  SKIP_REASON.TO_BE_IMPLEMENTED(),
  async ({ initTestBed }) => {},
);
