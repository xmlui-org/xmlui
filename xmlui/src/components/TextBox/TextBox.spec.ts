import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" label="Username" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.component).toBeVisible();
    await expect(driver.label).toBeVisible();
  });

  test("initialValue sets field value", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" initialValue="test value" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveValue("test value");
  });

  test("initialValue accepts empty as empty string", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" initialValue="" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveValue("");
  });

  test("initialValue accepts different data types", async ({ initTestBed, createTextBoxDriver }) => {
    // Test string
    await initTestBed(`<TextBox testId="test" initialValue="hello" />`);
    const driver1 = await createTextBoxDriver("test");
    await expect(driver1.input).toHaveValue("hello");

    // Test number
    await initTestBed(`<TextBox testId="test" initialValue="{123}" />`);
    const driver2 = await createTextBoxDriver("test");
    await expect(driver2.input).toHaveValue("123");

    // Test boolean
    await initTestBed(`<TextBox testId="test" initialValue="{true}" />`);
    const driver3 = await createTextBoxDriver("test");
    await expect(driver3.input).toHaveValue("true");
  });

  test("initialValue handles null", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" initialValue="{null}" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveValue("");
  });

  test("initialValue handles undefined", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" initialValue="{undefined}" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveValue("");
  });

  test("component accepts user input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" />`);
    const driver = await createTextBoxDriver("test");
    await driver.input.fill("user input");
    await expect(driver.input).toHaveValue("user input");
  });

  test("component clears input correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" initialValue="initial text" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveValue("initial text");
    await driver.input.clear();
    await expect(driver.input).toHaveValue("");
  });

  test("component required prop adds required attribute", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" required="true" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" enabled="false" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toBeDisabled();
  });

  test("enabled=false prevents user input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" enabled="false" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).not.toBeEditable();
  });

  test("readOnly prevents editing but allows focus", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" readOnly="true" initialValue="read only text" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveAttribute("readonly");
    await expect(driver.input).toHaveValue("read only text");
    await expect(driver.input).not.toBeEditable();

    await driver.input.focus();
    await expect(driver.input).toBeFocused();
  });

  test("autoFocus focuses input on mount", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" autoFocus="true" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" autoFocus="true" label="Auto-focused input" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toBeFocused();
  });

  test("placeholder shows when input is empty", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" placeholder="Enter text here..." />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveAttribute("placeholder", "Enter text here...");
  });

  test("maxLength limits input length", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" maxLength="5" />`);
    const driver = await createTextBoxDriver("test");
    await driver.input.fill("12345678");
    await expect(driver.input).toHaveValue("12345");
  });

  test("can render startIcon", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" startIcon="search" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.startAdornment).toBeVisible();
  });

  test("can render endIcon", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" endIcon="search" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.endAdornment).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("label is properly associated with input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" label="Username" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.label).toBeVisible();
  });

  test("component supports keyboard navigation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" label="Input" />`);
    const driver = await createTextBoxDriver("test");
    await driver.input.focus();
    await expect(driver.input).toBeFocused();
  });

  test("component supports keyboard navigation from other elements", async ({
    initTestBed,
    page,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <TextBox testId="first-input" label="First input" />
        <TextBox testId="second-input" label="Second input" />
      </Fragment>
    `);
    const firstInput = await createTextBoxDriver("first-input");
    const secondInput = await createTextBoxDriver("second-input");

    await firstInput.input.focus();
    await expect(firstInput.input).toBeFocused();

    await page.keyboard.press("Tab", { delay: 100 });
    await expect(secondInput.input).toBeFocused();
  });

  test("required has proper ARIA attributes", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" required="true" label="Required input" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveAttribute("required");
    await expect(driver.label).toContainText("*");
  });

  test("disabled component has proper attribute", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" enabled="false" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveAttribute("disabled");
  });

  test("readOnly has proper ARIA attributes", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" readOnly="true" label="Read-only input" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.input).toHaveAttribute("readonly");
    await expect(driver.label).toContainText("Read-only input");
    await expect(driver.input).not.toBeEditable();
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" direction="ltr" label="test" labelPosition="start" />`);

    const driver = await createTextBoxDriver("test");

    const { left: textboxLeft } = await getBounds(driver.input);
    const { right: labelRight } = await getBounds(driver.label);

    expect(labelRight).toBeLessThan(textboxLeft);
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" direction="ltr" label="test" labelPosition="end" />`);

    const driver = await createTextBoxDriver("test");

    const { right: textboxRight } = await getBounds(driver.input);
    const { left: labelLeft } = await getBounds(driver.label);

    expect(labelLeft).toBeGreaterThan(textboxRight);
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" label="test" labelPosition="top" />`);

    const driver = await createTextBoxDriver("test");

    const { top: textboxTop } = await getBounds(driver.input);
    const { bottom: labelBottom } = await getBounds(driver.label);

    expect(labelBottom).toBeLessThan(textboxTop);
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" label="test" labelPosition="bottom" />`);

    const driver = await createTextBoxDriver("test");

    const { bottom: textboxBottom } = await getBounds(driver.input);
    const { top: labelTop } = await getBounds(driver.label);

    expect(labelTop).toBeGreaterThan(textboxBottom);
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, createTextBoxDriver }) => {
    const labelText = "Very long label text that should break";
    const commonProps = `label="${labelText}" labelWidth="100px"`;
    await initTestBed(
      `<Fragment>
        <TextBox ${commonProps} testId="break" labelBreak="{true}" />
        <TextBox ${commonProps} testId="oneLine" labelBreak="{false}" />
      </Fragment>`,
    );
    const driverBreak = await createTextBoxDriver("break");
    const driverOneLine = await createTextBoxDriver("oneLine");
    const { height: heightBreak } = await getBounds(driverBreak.label);
    const { height: heightOneLine } = await getBounds(driverOneLine.label);

    expect(heightBreak).toBeGreaterThan(heightOneLine);
  });

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="test" labelPosition="invalid" label="test" />`);
    const driver = await createTextBoxDriver("test");
    await expect(driver.label).toBeVisible();
    await expect(driver.input).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on input change", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox testId="test" onDidChange="testState = 'changed'" />
    `);
    const driver = await createTextBoxDriver("test");
    await driver.input.fill("test");
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("didChange event passes new value", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox testId="test" onDidChange="arg => testState = arg" />
    `);
    const driver = await createTextBoxDriver("test");
    await driver.input.fill("test value");
    await expect.poll(testStateDriver.testState).toEqual("test value");
  });

  test("gotFocus event fires on focus", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox testId="test" onGotFocus="testState = 'focused'" />
    `);
    const driver = await createTextBoxDriver("test");
    await driver.input.focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("gotFocus event fires on label click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox label="Username" onGotFocus="testState = 'focused'" />
    `);
    await page.getByText("Username").click();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox testId="test" onLostFocus="testState = 'blurred'" />
    `);
    const driver = await createTextBoxDriver("test");
    await driver.input.focus();
    await driver.input.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("events do not fire when component is disabled", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox testId="test" enabled="false" didChange="testState = 'changed'" gotFocus="testState = 'focused'" />
    `);
    const driver = await createTextBoxDriver("test");
    await driver.input.focus();
    await driver.input.fill("test", { force: true });
    await expect.poll(testStateDriver.testState).toEqual(null);
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test("component value API returns current state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" initialValue="initial" />
        <Text testId="value">{myTextBox.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("initial");
  });

  test("component value API returns state after change", async ({ initTestBed, page, createTextBoxDriver }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" testId="myTextBox" />
        <Text testId="value">{myTextBox.value}</Text>
      </Fragment>
    `);
    const driver = await createTextBoxDriver("myTextBox");
    await expect(page.getByTestId("value")).toHaveText("");
    await driver.input.fill("new value");
    await expect(page.getByTestId("value")).toHaveText("new value");
  });

  test("component setValue API updates state", async ({ initTestBed, page, createTextBoxDriver }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" testId="myTextBox" />
        <Button testId="setBtn" onClick="myTextBox.setValue('api value')" />
      </Fragment>
    `);
    const driver = await createTextBoxDriver("myTextBox");
    await page.getByTestId("setBtn").click();
    await expect(driver.input).toHaveValue("api value");
  });

  test("component setValue API triggers events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" onDidChange="testState = 'api-changed'" />
        <Button testId="setBtn" onClick="myTextBox.setValue('test')">Set Value</Button>
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("api-changed");
  });

  test("focus API focuses the input", async ({ initTestBed, page, createTextBoxDriver }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" />
        <Button testId="focusBtn" onClick="myTextBox.focus()">Focus</Button>
      </Fragment>
    `);
    const driver = await createTextBoxDriver("myTextBox");
    await expect(driver.input).not.toBeFocused();

    await page.getByTestId("focusBtn").click();
    await expect(driver.input).toBeFocused();
  });

  test("focus API does nothing when component is disabled", async ({ initTestBed, page, createTextBoxDriver }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" enabled="false" />
        <Button testId="focusBtn" onClick="myTextBox.focus()">Focus</Button>
      </Fragment>
    `);
    const driver = await createTextBoxDriver("myTextBox");
    await page.getByTestId("focusBtn").click();
    await expect(driver.input).not.toBeFocused();
  });
});

// =============================================================================
// INPUT ADORNMENTS TESTS
// =============================================================================

test.describe("Input Adornments", () => {
  test("startText displays at beginning of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" startText="$" />`);
    const driver = await createTextBoxDriver("input");

    const { left: compLeft, right: compRight } = await getBounds(driver.input);
    const { left: textLeft, right: textRight } = await getBounds(driver.startAdornment);

    await expect(driver.startAdornment).toContainText("$");
    expect(textRight - compLeft).toBeLessThanOrEqual(compRight - textLeft);
  });

  test("endText displays at end of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" endText="USD" />`);
    const driver = await createTextBoxDriver("input");

    const { left: compLeft, right: compRight } = await getBounds(driver.input);
    const { left: textLeft, right: textRight } = await getBounds(driver.endAdornment);

    await expect(driver.endAdornment).toContainText("USD");
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
  });

  test("startIcon displays at beginning of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" startIcon="search" />`);
    const driver = await createTextBoxDriver("input");

    const { left: compLeft, right: compRight } = await getBounds(driver.input);
    const { left: iconLeft, right: iconRight } = await getBounds(driver.startAdornment);

    expect(iconRight - compLeft).toBeLessThanOrEqual(compRight - iconLeft);
  });

  test("endIcon displays at end of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" endIcon="search" />`);

    const driver = await createTextBoxDriver("input");
    const { left: compLeft, right: compRight } = await getBounds(driver.input);
    const { left: iconLeft, right: iconRight } = await getBounds(driver.endAdornment);

    expect(iconRight - compLeft).toBeGreaterThanOrEqual(compRight - iconLeft);
  });

  test("multiple adornments can be combined", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <TextBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" />`);
    const driver = await createTextBoxDriver("input");
    await expect(driver.startAdornment).toContainText("$");
    await expect(driver.endAdornment).toContainText("USD");
    await expect(driver.startAdornment).toBeVisible();
    await expect(driver.endAdornment).toBeVisible();
  });

  test("all adornments appear in the right place", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <TextBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" direction="ltr" />
    `);
    const driver = await createTextBoxDriver("input");
    const { left: compLeft, right: compRight } = await getBounds(driver.input);
    const { left: startTextLeft, right: startTextRight } = await getBounds(driver.startAdornment);
    const { left: endTextLeft, right: endTextRight } = await getBounds(driver.endAdornment);
    const { left: startIconLeft, right: startIconRight } = await getBounds(
      driver.startAdornment,
    );
    const { left: endIconLeft, right: endIconRight } = await getBounds(
      driver.endAdornment,
    );

    // Check order of adornments
    expect(startTextRight - compLeft).toBeLessThanOrEqual(compRight - startTextLeft);
    expect(startIconRight - compLeft).toBeLessThanOrEqual(compRight - startIconLeft);
    expect(endTextRight - compLeft).toBeGreaterThanOrEqual(compRight - endTextLeft);
    expect(endIconRight - compLeft).toBeGreaterThanOrEqual(compRight - endIconLeft);
  });
});

// =============================================================================
// PASSWORD INPUT TESTS
// =============================================================================

test.describe("Password Input", () => {
  test("component renders", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput testId="input" />`);
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toBeVisible();
  });

  test("component has password type", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput testId="input" />`);
    const driver = await createTextBoxDriver("input");
    await expect(driver.input).toHaveAttribute("type", "password");
  });

  test("component has initial value", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput testId="input" initialValue="secret" />`);
    const driver = await createTextBoxDriver("input");
    await expect(driver.input).toHaveValue("secret");
  });

  test("showPasswordToggle displays visibility toggle", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput testId="input" showPasswordToggle="true" />`);
    const driver = await createTextBoxDriver("input");
    await expect(driver.input).toBeVisible();
  });

  test("password toggle switches between visible and hidden", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput testId="input" showPasswordToggle="true" />`);
    const driver = await createTextBoxDriver("input");
    await expect(driver.input).toHaveAttribute("type", "password");
    await driver.button.click();
    await expect(driver.input).toHaveAttribute("type", "text");
  });

  test("custom password icons work correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(
      `
      <PasswordInput
        testId="input"
        showPasswordToggle="true"
        passwordVisibleIcon="test"
        passwordHiddenIcon="test"
      />`,
      {
        resources: {
          "icon.test": "resources/bell.svg",
        },
      },
    );
    const driver = await createTextBoxDriver("input");
    const icon = driver.button;
    await expect(icon).toBeVisible();
    await icon.click();
    await expect(icon).toBeVisible();
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Theme Vars", () => {
  test("backgroundColor applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "backgroundColor-TextBox": "rgb(255, 240, 240)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("background-color", "rgb(255, 240, 240)");
  });

  test("borderColor applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "borderColor-TextBox": "rgb(255, 0, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("textColor applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "textColor-TextBox": "rgb(0, 0, 255)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("focus borderColor applies on focus", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "borderColor-TextBox--focus": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await driver.input.focus();
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("disabled backgroundColor applies when disabled", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-TextBox--disabled": "rgb(240, 240, 240)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("error borderColor applies with error validation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-TextBox--error": "rgb(255, 0, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("warning borderColor applies with warning validation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-TextBox--warning": "rgb(255, 165, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 165, 0)");
  });

  test("success borderColor applies with valid validation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-TextBox--success": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("borderRadius applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "borderRadius-TextBox": "8px",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-radius", "8px");
  });

  test("padding applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "padding-TextBox": "12px",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("padding", "12px");
  });

  [
    { value: "--default", prop: "" },
    { value: "--warning", prop: 'validationStatus="warning"' },
    { value: "--error", prop: 'validationStatus="error"' },
    { value: "--success", prop: 'validationStatus="valid"' },
  ].forEach((variant) => {
    test(`applies correct borderRadius ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-TextBox${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-TextBox${variant.value}`]: "rgb(255, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-TextBox${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-TextBox${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct fontSize ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`fontSize-TextBox${variant.value}`]: "14px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("font-size", "14px");
    });

    test(`applies correct backgroundColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-TextBox${variant.value}`]: "rgb(240, 240, 240)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-TextBox${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-TextBox${variant.value}`]: "rgb(0, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-TextBox${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct backgroundColor on hover ${variant.value}`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-TextBox${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-TextBox${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-TextBox${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test("validationStatus=error correctly displayed", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-TextBox-error": "rgb(255, 0, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("validationStatus=warning correctly displayed", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-TextBox-warning": "rgb(255, 165, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 165, 0)");
  });

  test("validationStatus=valid correctly displayed", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-TextBox-success": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="invalid-status" />`, {
      testThemeVars: {
        "borderColor-TextBox": "rgb(0, 0, 0)",
        "borderColor-TextBox-error": "rgb(255, 0, 0)",
        "borderColor-TextBox-warning": "rgb(255, 165, 0)",
        "borderColor-TextBox-success": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextBoxDriver("input");
    await expect(driver.component).not.toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(driver.component).not.toHaveCSS("border-color", "rgb(255, 165, 0)");
    await expect(driver.component).not.toHaveCSS("border-color", "rgb(0, 255, 0)");
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 0, 0)");
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handle special characters in input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input"/>`);
    const driver = await createTextBoxDriver("input");
    await driver.input.fill("Hello 日本語 @#$%!");
    await expect(driver.input).toHaveValue("Hello 日本語 @#$%!");
  });

  test("handle Unicode characters in input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input"/>`);
    const driver = await createTextBoxDriver("input");
    await driver.input.fill("🚀 Unicode test 🎉");
    await expect(driver.input).toHaveValue("🚀 Unicode test 🎉");
  });

  test("component handles very long input text", async ({ initTestBed, createTextBoxDriver }) => {
    const longText =
      "This is a very long text that might cause layout or performance issues in the component".repeat(
        10,
      );
    await initTestBed(`<TextBox testId="input"/>`);
    const driver = await createTextBoxDriver("input");
    await driver.input.fill(longText);
    await expect(driver.input).toHaveValue(longText);
  });

  test("component handles special characters correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input" label="Input with !@#$%^&*()"/>`, {});
    const driver = await createTextBoxDriver("input");
    await expect(driver.label).toBeVisible();
  });

  test("component handles extremely long input values", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox testId="input"/>`);
    const driver = await createTextBoxDriver("input");
    const veryLongText = "A".repeat(10000);
    await driver.input.fill(veryLongText);
    await expect(driver.input).toHaveValue(veryLongText);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in Stack layout contexts", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<Stack><TextBox testId="input" /></Stack>`);
    const driver = await createTextBoxDriver("input");
    const { width, height } = await getBounds(driver.input);

    await expect(driver.input).toBeVisible();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("component works correctly in FlowLayout layout contexts", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<FlowLayout><TextBox testId="input" /></FlowLayout>`);
    const driver = await createTextBoxDriver("input");
    const { width, height } = await getBounds(driver.input);

    await expect(driver.input).toBeVisible();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("component integrates with forms correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<Form><TextBox testId="input" label="Username" /></Form>`);
    const driver = await createTextBoxDriver("input");
    const { width, height } = await getBounds(driver.input);

    await expect(driver.input).toBeVisible();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("component works with conditional rendering", async ({ initTestBed, page, createTextBoxDriver }) => {
    await initTestBed(`
      <Fragment var.showInput="{true}">
        <Fragment when="{showInput}">
          <TextBox testId="input" label="Conditional input" />
        </Fragment>
        <Button testId="toggleBtn" onClick="showInput = !showInput">Toggle</Button>
      </Fragment>
    `);

    const driver = await createTextBoxDriver("input");
    await expect(driver.label).toBeVisible();

    await page.getByTestId("toggleBtn").click();
    await expect(driver.label).not.toBeVisible();
  });
});


test("labelWidth applies custom label width", async ({ initTestBed, createTextBoxDriver }) => {
  const expected = 200;
  await initTestBed(`<TextBox testId="test" label="test test" labelWidth="${expected}px" />`);
  const driver = await createTextBoxDriver("test");
  const { width } = await getBounds(driver.label);
  expect(width).toEqual(expected);
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================


test("input has correct width", async ({ initTestBed, page }) => {
  await initTestBed(`
    <TextBox width="200px" testId="test"/>
  `);
  const { width } = await page.getByTestId("test").boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width", async ({ initTestBed, page }) => {
  await initTestBed(`
    <TextBox width="200px" label="test" testId="test"/>
  `);
  const { width } = await page.getByTestId("test").boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<TextBox width="50%" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<TextBox width="50%" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});
