import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("RadioGroup with Option elements as children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option value="1"></Option>
        <Option value="2"></Option>
        <Option value="3"></Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options).toHaveCount(3);
  });

  test("RadioGroup with Option elements with labels as children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
        <Option value="3">Option 3</Option>
      </RadioGroup>
    `);
    const optionLabels = page.getByRole("radiogroup").locator("label");
    await expect(optionLabels).toHaveCount(3);
    await expect(optionLabels.nth(0)).toHaveText("Option 1");
    await expect(optionLabels.nth(1)).toHaveText("Option 2");
    await expect(optionLabels.nth(2)).toHaveText("Option 3");
  });

  test("Providing non-Option elements as children still renders", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Text>Not an Option</Text>
      </RadioGroup>
    `);
    await expect(page.getByRole("radiogroup")).toBeVisible();
    await expect(page.getByText("Not an Option")).toBeVisible();
  });

  test("Mixing Option and non-Option elements as children renders all", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup>
        <Text>Not an Option</Text>
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    await expect(page.getByRole("radiogroup")).toBeVisible();
    await expect(page.getByText("Not an Option")).toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
  });

  test("autoFocus sets focus on the first Option on page load", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup autoFocus="true">
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    await expect(page.getByRole("radiogroup").getByRole("radio")).toBeFocused();
  });

  test("field is marked as required in the DOM when required=true", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup required="true">
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    await expect(page.getByRole("radiogroup")).toHaveAttribute("aria-required");
  });

  test("making field required shows a visual indicator", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup required="true" label="Radio Group Label">
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    await expect(page.getByText("*")).toBeVisible();
  });

  test("initialValue sets the initial selected option (string initialValue & options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="2">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
        <Option value="3">Option 3</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).toBeChecked();
    await expect(options.nth(2)).not.toBeChecked();
  });

  test("initialValue sets the initial selected option (number initialValue & options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="{2}">
        <Option value="{1}">Option 1</Option>
        <Option value="{2}">Option 2</Option>
        <Option value="{3}">Option 3</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).toBeChecked();
    await expect(options.nth(2)).not.toBeChecked();
  });

  test("initialValue does not set the initial selected option (number initialValue, string options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="{2}">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
        <Option value="3">Option 3</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();
    await expect(options.nth(2)).not.toBeChecked();
  });

  test("initialValue does not set the initial selected option (string initialValue, number options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="2">
        <Option value="{1}">Option 1</Option>
        <Option value="{2}">Option 2</Option>
        <Option value="{3}">Option 3</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();
    await expect(options.nth(2)).not.toBeChecked();
  });

  test("initialValue sets the initial selected option (boolean initialValue & options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="{true}">
        <Option value="{true}">Option 1</Option>
        <Option value="{false}">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();
  });

  test("initialValue does not set the initial selected option (boolean initialValue, string options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="{true}">
        <Option value="true">Option 1</Option>
        <Option value="false">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();
  });

  test("initialValue does not set the initial selected option (string initialValue, boolean options)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <RadioGroup initialValue="true">
        <Option value="{true}">Option 1</Option>
        <Option value="{false}">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();
  });

  test("undefined does not render Radio Option", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option value="1">Option 1</Option>
        <Option value="{undefined}">Option 2</Option>
      </RadioGroup>
    `);
    const optionLabels = page.getByRole("radiogroup").locator("label");
    await expect(optionLabels).toHaveCount(1);
    await expect(optionLabels.first()).toHaveText("Option 1");
  });

  test("null renders Radio Option", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option value="1">Option 1</Option>
        <Option value="{null}">Option 2</Option>
      </RadioGroup>
    `);
    const optionLabels = page.getByRole("radiogroup").locator("label");
    await expect(optionLabels).toHaveCount(2);
    await expect(optionLabels.first()).toHaveText("Option 1");
    await expect(optionLabels.nth(1)).toHaveText("Option 2");
  });

  [
    { label: "empty object", value: "{}" },
    { label: "object", value: "{ a: 1 }" },
    { label: "function", value: "() => {}" },
    { label: "NaN", value: "NaN" },
  ].forEach(({ label, value }) => {
    test(`initialValue=${label} falls back to default (empty string)`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`
      <RadioGroup initialValue="{${value}}">
        <Option value="{${value}}">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
      const options = page.getByRole("radiogroup").getByRole("radio");
      await expect(options.nth(0)).not.toBeChecked();
      await expect(options.nth(1)).not.toBeChecked();
    });
  });

  test("readOnly disables switching between options", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup initialValue="1" readOnly="true">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).toBeChecked();
    await options.nth(1).click();
    await expect(options.nth(0)).toBeChecked();
    await expect(options.nth(1)).not.toBeChecked();
  });

  test("enabled input field allows user interaction for field", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup initialValue="1" enabled="true">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
    const radios = await page.getByRole("radiogroup").getByRole("radio").all();
    for (const radio of radios) {
      await expect(radio).toBeEnabled();
    }
  });

  test("disabled input field stops user interaction for field", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup initialValue="1" enabled="false">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
    const radios = await page.getByRole("radiogroup").getByRole("radio").all();
    for (const radio of radios) {
      await expect(radio).toBeDisabled();
    }
  });

  test("disabled option does not disable field", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup initialValue="1">
        <Option value="1" enabled="false">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).toBeDisabled();
    await expect(options.nth(1)).toBeEnabled();
  });

  test("onDidChange is called on input change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RadioGroup initialValue="1" onDidChange="(value) => testState = value">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await options.nth(1).click();
    await expect.poll(testStateDriver.testState).toBe("2");
  });

  test("onDidChange is not called if field is disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RadioGroup enabled="false" initialValue="1" onDidChange="(value) => testState = value">
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");

    // Verify the radio buttons are disabled
    await expect(options.nth(1)).toBeDisabled();

    await options.nth(1).click({ force: true });

    // Verify the state hasn't changed (should still be null since no change handler was called)
    await expect.poll(testStateDriver.testState).toBe(null);
  });

  test("gotFocus event fires on focusing the field", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RadioGroup initialValue="1" onGotFocus="() => testState = 'focused'">
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await options.nth(0).focus();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });

  test("gotFocus event fires on label focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RadioGroup initialValue="1" onGotFocus="() => testState = 'focused'" label="test">
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    await page.getByText("test").click();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });

  test("lostFocus event fires on blurring the field", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RadioGroup initialValue="1" onLostFocus="() => testState = 'blurred'">
        <Option value="1">Option 1</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await options.nth(0).focus();
    await options.nth(0).blur();
    await expect.poll(testStateDriver.testState).toBe("blurred");
  });
});

test("correct borderColor applied on validationStatus 'default'", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <RadioGroup initialValue="1">
      <Option value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>`,
    {
      testThemeVars: {
        "borderColor-RadioGroupOption--default": "rgb(80, 80, 80)",
        "borderColor-checked-RadioGroupOption": "rgb(80, 80, 80)",
      },
    },
  );
  const options = page.getByRole("radiogroup").getByRole("radio");
  await expect(options.nth(0)).toHaveCSS("border-color", "rgb(80, 80, 80)");
  await expect(options.nth(1)).toHaveCSS("border-color", "rgb(80, 80, 80)");
});

test("correct borderColor applied on validationStatus 'error'", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <RadioGroup validationStatus="error" initialValue="1">
      <Option value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `,
    {
      testThemeVars: {
        "borderColor-RadioGroupOption--error": "rgb(255, 32, 0)",
        "borderColor-RadioGroupOption--default": "rgb(80, 80, 80)",
        "borderColor-checked-RadioGroupOption": "rgb(80, 80, 80)",
      },
    },
  );
  const options = page.getByRole("radiogroup").getByRole("radio");
  await expect(options.nth(0)).toHaveCSS("border-color", "rgb(255, 32, 0)");
  await expect(options.nth(1)).toHaveCSS("border-color", "rgb(80, 80, 80)");
});

test("correct borderColor applied on validationStatus 'warning'", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <RadioGroup validationStatus="warning" initialValue="1">
      <Option value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `,
    {
      testThemeVars: {
        "borderColor-RadioGroupOption--warning": "rgb(255, 180, 0)",
        "borderColor-RadioGroupOption--default": "rgb(80, 80, 80)",
        "borderColor-checked-RadioGroupOption": "rgb(80, 80, 80)",
      },
    },
  );
  const options = page.getByRole("radiogroup").getByRole("radio");
  await expect(options.nth(0)).toHaveCSS("border-color", "rgb(255, 180, 0)");
  await expect(options.nth(1)).toHaveCSS("border-color", "rgb(80, 80, 80)");
});

test("correct borderColor applied on validationStatus 'valid'", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <RadioGroup validationStatus="valid" initialValue="1">
      <Option value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `,
    {
      testThemeVars: {
        "borderColor-RadioGroupOption--success": "rgb(0, 180, 0)",
        "borderColor-RadioGroupOption--default": "rgb(80, 80, 80)",
        "borderColor-checked-RadioGroupOption": "rgb(80, 80, 80)",
      },
    },
  );
  const options = page.getByRole("radiogroup").getByRole("radio");
  await expect(options.nth(1)).toHaveCSS("border-color", "rgb(80, 80, 80)");
  await expect(options.nth(0)).toHaveCSS("border-color", "rgb(0, 180, 0)");
});

test("label is rendered if provided", async ({ initTestBed, page }) => {
  await initTestBed(`
    <RadioGroup label="Test Label" initialValue="1">
      <Option value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `);
  const labels = page.locator("label");
  await expect(labels).toHaveCount(3);
  await expect(labels.nth(0)).toHaveText("Test Label");
  await expect(labels.nth(1)).toHaveText("Option 1");
  await expect(labels.nth(2)).toHaveText("Option 2");
});

test("empty string label is not rendered", async ({ initTestBed, page }) => {
  await initTestBed(`
    <RadioGroup initialValue="1">
      <Option value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `);

  const labels = page.locator("label");
  await expect(labels).toHaveCount(2);
  await expect(labels.nth(0)).toHaveText("Option 1");
  await expect(labels.nth(1)).toHaveText("Option 2");
});

test("labelPosition=start positions label before input with ltr", async ({ initTestBed, page }) => {
  await initTestBed(`
    <RadioGroup direction="ltr" label="test" labelPosition="start" initialValue="1">
      <Option testId="option1" value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `);

  const labels = page.locator("label");
  await expect(labels).toHaveCount(3);
  const { left: optionLeft } = await getBounds(labels.nth(1));
  const { right: labelRight } = await getBounds(labels.nth(0));

  expect(labelRight).toBeLessThan(optionLeft);
});

test("labelPosition=start positions label after input with rtl", async ({ initTestBed, page }) => {
  await initTestBed(`
    <RadioGroup direction="rtl" label="test" labelPosition="start" initialValue="1">
      <Option testId="option1" value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `);

  const labels = page.locator("label");
  await expect(labels).toHaveCount(3);
  const { left: optionLeft } = await getBounds(labels.nth(0));
  const { right: labelRight } = await getBounds(labels.nth(2));

  expect(labelRight).toBeLessThan(optionLeft);
});

test("labelPosition=end positions label after input with ltr", async ({ initTestBed, page }) => {
  await initTestBed(`
    <RadioGroup direction="ltr" label="test" labelPosition="end" initialValue="1">
      <Option testId="option1" value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `);

  const labels = page.locator("label");
  await expect(labels).toHaveCount(3);
  const { left: optionLeft } = await getBounds(labels.nth(0));
  const { right: labelRight } = await getBounds(labels.nth(1));

  expect(labelRight).toBeLessThan(optionLeft);
});

test("labelPosition=end positions label after input with rtl", async ({ initTestBed, page }) => {
  await initTestBed(`
    <RadioGroup direction="rtl" label="test" labelPosition="end" initialValue="1">
      <Option testId="option1" value="1">Option 1</Option>
      <Option value="2">Option 2</Option>
    </RadioGroup>
  `);

  const labels = page.locator("label");
  await expect(labels).toHaveCount(3);
  await expect(labels.nth(2)).toHaveText("Option 2");
  const { left: optionLeft } = await getBounds(labels.nth(0));
  const { right: labelRight } = await getBounds(labels.nth(2));

  expect(optionLeft).toBeLessThan(labelRight);
});

test("value returns current input value", async ({ initTestBed, page }) => {
  await initTestBed(`
      <Fragment>
      <RadioGroup id="radioGroup" initialValue="2">
        <Option value="1"></Option>
        <Option value="2"></Option>
      </RadioGroup>
      <Text testId="valueDisplay">{radioGroup.value}</Text>
      </Fragment>
    `);

  const valueDisplay = page.getByTestId("valueDisplay");
  await expect(valueDisplay).toHaveText("2");
});

// --- --- setValue

test("setValue input value", async ({ initTestBed, page }) => {
  await initTestBed(`
      <Fragment>
      <RadioGroup id="radioGroup" initialValue="2">
        <Option value="1"></Option>
        <Option value="2"></Option>
      </RadioGroup>
      <Text testId="valueDisplay">{radioGroup.value}</Text>
      <Button onClick="() => radioGroup.setValue('1')" testId="setValueButton">Set Value</Button>
      </Fragment>
    `);

  const valueDisplay = page.getByTestId("valueDisplay");
  await expect(valueDisplay).toHaveText("2");
  await page.getByTestId("setValueButton").click();
  await expect(valueDisplay).toHaveText("1");
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("requireLabelMode='required' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <RadioGroup testId="test" label="Gender" required="true" requireLabelMode="required" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='required' hides indicator for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <RadioGroup testId="test" label="Gender" required="false" requireLabelMode="required" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='optional' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <RadioGroup testId="test" label="Gender" required="false" requireLabelMode="optional" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("requireLabelMode='optional' hides indicator for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <RadioGroup testId="test" label="Gender" required="true" requireLabelMode="optional" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='both' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <RadioGroup testId="test" label="Gender" required="true" requireLabelMode="both" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='both' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <RadioGroup testId="test" label="Gender" required="false" requireLabelMode="both" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).not.toContainText("*");
    await expect(label).toContainText("(Optional)");
  });

  test("input requireLabelMode overrides Form itemRequireLabelMode", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="required">
        <RadioGroup testId="test" label="Gender" required="false" requireLabelMode="optional" bindTo="gender">
          <Option value="male">Male</Option>
          <Option value="female">Female</Option>
        </RadioGroup>
      </Form>
    `);
    
    const label = page.getByText("Gender");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("input inherits Form itemRequireLabelMode when not specified", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="both">
        <RadioGroup testId="test1" label="Required Field" required="true" bindTo="field1">
          <Option value="1">Option 1</Option>
        </RadioGroup>
        <RadioGroup testId="test2" label="Optional Field" required="false" bindTo="field2">
          <Option value="1">Option 1</Option>
        </RadioGroup>
      </Form>
    `);
    
    const requiredLabel = page.getByText("Required Field");
    const optionalLabel = page.getByText("Optional Field");
    
    await expect(requiredLabel).toContainText("*");
    await expect(requiredLabel).not.toContainText("(Optional)");
    await expect(optionalLabel).toContainText("(Optional)");
    await expect(optionalLabel).not.toContainText("*");
  });
});
