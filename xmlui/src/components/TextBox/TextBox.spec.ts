import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox label="Username" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByText("Username")).toBeVisible();
  });

  test("initialValue sets field value", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="test value" />`);
    await expect(page.getByRole("textbox")).toHaveValue("test value");
  });

  test("initialValue accepts empty as empty string", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("initialValue accepts different data types", async ({ initTestBed, page }) => {
    // Test string
    await initTestBed(`<TextBox initialValue="hello" />`);
    await expect(page.getByRole("textbox")).toHaveValue("hello");

    // Test number
    await initTestBed(`<TextBox initialValue="{123}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("123");

    // Test boolean
    await initTestBed(`<TextBox initialValue="{true}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("true");
  });

  test("initialValue handles null", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="{null}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("initialValue handles undefined", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="{undefined}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("component accepts user input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    await page.getByRole("textbox").fill("user input");
    await expect(page.getByRole("textbox")).toHaveValue("user input");
  });

  test("component clears input correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="initial text" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveValue("initial text");
    await textbox.clear();
    await expect(textbox).toHaveValue("");
  });

  test("component required prop adds required attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox required="true" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox enabled="false" />`);
    await expect(page.getByRole("textbox")).toBeDisabled();
  });

  test("enabled=false prevents user input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox enabled="false" />`);
    await expect(page.getByRole("textbox")).not.toBeEditable();
  });

  test("readOnly prevents editing but allows focus", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox readOnly="true" initialValue="read only text" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("readonly");
    await expect(page.getByRole("textbox")).toHaveValue("read only text");
    await expect(page.getByRole("textbox")).not.toBeEditable();

    await page.getByRole("textbox").focus();
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("autoFocus focuses input on mount", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox autoFocus="true" />`);
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox autoFocus="true" label="Auto-focused input" />`);
    await expect(page.getByLabel("Auto-focused input")).toBeFocused();
  });

  test("placeholder shows when input is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox placeholder="Enter text here..." />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("placeholder", "Enter text here...");
  });

  test("maxLength limits input length", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox maxLength="5" />`);
    await page.getByRole("textbox").fill("12345678");
    await expect(page.getByRole("textbox")).toHaveValue("12345");
  });

  test("can render startIcon", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox startIcon="search" />`);
    await expect(page.getByRole("img")).toBeVisible();
  });

  test("can render endIcon", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox endIcon="search" />`);
    await expect(page.getByRole("img")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("label is properly associated with input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox label="Username" />`);
    await expect(page.getByLabel("Username")).toBeVisible();
  });

  test("component supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox label="Input" />`);
    await page.keyboard.press("Tab", { delay: 100 });
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("component supports keyboard navigation from other elements", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment>
        <TextBox testId="first-input" label="First input" />
        <TextBox testId="second-input" label="Second input" />
      </Fragment>
    `);
    const firstInput = page.getByTestId("first-input").getByRole("textbox");
    const secondInput = page.getByTestId("second-input").getByRole("textbox");

    await firstInput.focus();
    await expect(firstInput).toBeFocused();

    await page.keyboard.press("Tab", { delay: 100 });
    await expect(secondInput).toBeFocused();
  });

  test("required has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox required="true" label="Required input" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
    await expect(page.getByText("Required input")).toContainText("*");
  });

  test("disabled component has proper attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox enabled="false" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("disabled");
  });

  test("readOnly has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox readOnly="true" label="Read-only input" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("readonly");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox direction="ltr" label="test" labelPosition="start" />`);

    const { left: textboxLeft } = await getBounds(page.getByLabel("test"));
    const { right: labelRight } = await getBounds(page.getByText("test"));

    expect(labelRight).toBeLessThan(textboxLeft);
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox direction="ltr" label="test" labelPosition="end" />`);

    const { right: textboxRight } = await getBounds(page.getByLabel("test"));
    const { left: labelLeft } = await getBounds(page.getByText("test"));

    expect(labelLeft).toBeGreaterThan(textboxRight);
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox label="test" labelPosition="top" />`);

    const { top: textboxTop } = await getBounds(page.getByLabel("test"));
    const { bottom: labelBottom } = await getBounds(page.getByText("test"));

    expect(labelBottom).toBeLessThan(textboxTop);
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox label="test" labelPosition="bottom" />`);

    const { bottom: textboxBottom } = await getBounds(page.getByLabel("test"));
    const { top: labelTop } = await getBounds(page.getByText("test"));

    expect(labelTop).toBeGreaterThan(textboxBottom);
  });

  test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    const expected = 200;
    await initTestBed(`<TextBox label="test test" labelWidth="${expected}px" />`);
    const { width } = await getBounds(page.getByText("test test"));
    expect(width).toEqual(expected);
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
    const labelText = "Very long label text that should break";
    const commonProps = `label="${labelText}" labelWidth="100px"`;
    await initTestBed(
      `<Fragment>
        <TextBox ${commonProps} testId="break" labelBreak="{true}" />
        <TextBox ${commonProps} testId="oneLine" labelBreak="{false}" />
      </Fragment>`,
    );
    const labelBreak = page.getByTestId("break").getByText(labelText);
    const labelOneLine = page.getByTestId("oneLine").getByText(labelText);
    const { height: heightBreak } = await getBounds(labelBreak);
    const { height: heightOneLine } = await getBounds(labelOneLine);

    expect(heightBreak).toBeGreaterThan(heightOneLine);
  });

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox labelPosition="invalid" label="test" />`);
    await expect(page.getByLabel("test")).toBeVisible();
    await expect(page.getByText("test")).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on input change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onDidChange="testState = 'changed'" />
    `);
    await page.getByRole("textbox").fill("test");
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onDidChange="arg => testState = arg" />
    `);
    await page.getByRole("textbox").fill("test value");
    await expect.poll(testStateDriver.testState).toEqual("test value");
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onGotFocus="testState = 'focused'" />
    `);
    await page.getByRole("textbox").focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onLostFocus="testState = 'blurred'" />
    `);
    await page.getByRole("textbox").focus();
    await page.getByRole("textbox").blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("events do not fire when component is disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox enabled="false" didChange="testState = 'changed'" gotFocus="testState = 'focused'" />
    `);
    await page.getByRole("textbox").focus();
    await page.getByRole("textbox").fill("test", { force: true });
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

  test("component value API returns state after change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" />
        <Text testId="value">{myTextBox.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("");
    await page.getByRole("textbox").fill("new value");
    await expect(page.getByTestId("value")).toHaveText("new value");
  });

  test("component setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" />
        <Button testId="setBtn" onClick="myTextBox.setValue('api value')" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByRole("textbox")).toHaveValue("api value");
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

  test("focus API focuses the input", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" />
        <Button testId="focusBtn" onClick="myTextBox.focus()">Focus</Button>
      </Fragment>
    `);
    const textbox = page.getByRole("textbox");
    await expect(textbox).not.toBeFocused();

    await page.getByTestId("focusBtn").click();
    await expect(textbox).toBeFocused();
  });

  test("focus API does nothing when component is disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" enabled="false" />
        <Button testId="focusBtn" onClick="myTextBox.focus()">Focus</Button>
      </Fragment>
    `);
    await page.getByTestId("focusBtn").click();
    const textbox = page.getByRole("textbox");
    await expect(textbox).not.toBeFocused();
  });
});

// =============================================================================
// INPUT ADORNMENTS TESTS
// =============================================================================

test.describe("Input Adornments", () => {
  test("startText displays at beginning of input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="ltr" startText="$" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

    await expect(page.getByTestId("input")).toContainText("$");
    expect(textRight - compLeft).toBeLessThanOrEqual(compRight - textLeft);
  });

  test("startText displays at beginning of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="rtl" startText="$" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

    await expect(page.getByTestId("input")).toContainText("$");
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
  });

  test("endText displays at end of input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="ltr" endText="USD" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("USD"));

    await expect(page.getByTestId("input")).toContainText("USD");
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
  });

  test("endText displays at end of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="rtl" endText="USD" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("USD"));

    await expect(page.getByTestId("input")).toContainText("USD");
    expect(textRight - compLeft).toBeLessThanOrEqual(compRight - textLeft);
  });

  test("startIcon displays at beginning of input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="ltr" startIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img"));

    expect(iconRight - compLeft).toBeLessThanOrEqual(compRight - iconLeft);
  });

  test("startIcon displays at beginning of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="rtl" startIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img"));

    expect(iconRight - compLeft).toBeGreaterThanOrEqual(compRight - iconLeft);
  });

  test("endIcon displays at end of input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" endIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img"));

    expect(iconRight - compLeft).toBeGreaterThanOrEqual(compRight - iconLeft);
  });

  test("endIcon displays at end of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" direction="rtl" endIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img"));

    expect(iconRight - compLeft).toBeLessThanOrEqual(compRight - iconLeft);
  });

  test("multiple adornments can be combined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TextBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" />`);
    await expect(page.getByTestId("input")).toContainText("$");
    await expect(page.getByTestId("input")).toContainText("USD");
    await expect(page.getByRole("img").first()).toBeVisible();
    await expect(page.getByRole("img").last()).toBeVisible();
  });

  test("all adornments appear in the right place", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TextBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" direction="ltr" />
    `);
    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: startTextLeft, right: startTextRight } = await getBounds(page.getByText("$"));
    const { left: endTextLeft, right: endTextRight } = await getBounds(page.getByText("USD"));
    const { left: startIconLeft, right: startIconRight } = await getBounds(
      page.getByRole("img").first(),
    );
    const { left: endIconLeft, right: endIconRight } = await getBounds(
      page.getByRole("img").last(),
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
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component has password type", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("type", "password");
  });

  test("component has initial value", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput initialValue="secret" />`);
    await expect(page.getByRole("textbox")).toHaveValue("secret");
  });

  test("showPasswordToggle displays visibility toggle", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput testId="input" showPasswordToggle="true" />`);
    await expect(page.getByTestId("input").getByRole("button")).toBeVisible();
  });

  test("password toggle switches between visible and hidden", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput testId="input" showPasswordToggle="true" />`);
    const toggleButton = page.getByTestId("input").getByRole("button");

    await expect(page.getByRole("textbox")).toHaveAttribute("type", "password");
    await toggleButton.click();
    await expect(page.getByRole("textbox")).toHaveAttribute("type", "text");
  });

  test("custom password icons work correctly", async ({ initTestBed, page }) => {
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
    const icon = page.getByTestId("input").getByRole("img");
    await expect(icon).toBeVisible();
    await page.getByTestId("input").getByRole("button").click();
    await expect(icon).toBeVisible();
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Theme Vars", () => {
  test("backgroundColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "backgroundColor-TextBox": "rgb(255, 240, 240)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(255, 240, 240)");
  });

  test("borderColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "borderColor-TextBox": "rgb(255, 0, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("textColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "textColor-TextBox": "rgb(0, 0, 255)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("focus borderColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "borderColor-TextBox--focus": "rgb(0, 255, 0)",
      },
    });
    const input = page.getByTestId("input");
    await input.focus();
    await expect(input).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("disabled backgroundColor applies when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-TextBox--disabled": "rgb(240, 240, 240)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("error borderColor applies with error validation", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-TextBox-error": "rgb(255, 0, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("warning borderColor applies with warning validation", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-TextBox-warning": "rgb(255, 165, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 165, 0)");
  });

  test("success borderColor applies with valid validation", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-TextBox-success": "rgb(0, 255, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("borderRadius applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "borderRadius-TextBox": "8px",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-radius", "8px");
  });

  test("padding applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" />`, {
      testThemeVars: {
        "padding-TextBox": "12px",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("padding", "12px");
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test("validationStatus=error correctly displayed", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-TextBox-error": "rgb(255, 0, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("validationStatus=warning correctly displayed", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-TextBox-warning": "rgb(255, 165, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 165, 0)");
  });

  test("validationStatus=valid correctly displayed", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-TextBox-success": "rgb(0, 255, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox testId="input" validationStatus="invalid-status" />`, {
      testThemeVars: {
        "borderColor-TextBox": "rgb(0, 0, 0)",
        "borderColor-TextBox-error": "rgb(255, 0, 0)",
        "borderColor-TextBox-warning": "rgb(255, 165, 0)",
        "borderColor-TextBox-success": "rgb(0, 255, 0)",
      },
    });
    await expect(page.getByTestId("input")).not.toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(page.getByTestId("input")).not.toHaveCSS("border-color", "rgb(255, 165, 0)");
    await expect(page.getByTestId("input")).not.toHaveCSS("border-color", "rgb(0, 255, 0)");
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 0, 0)");
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handle special characters in input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    await page.getByRole("textbox").fill("Hello 日本語 @#$%!");
    await expect(page.getByRole("textbox")).toHaveValue("Hello 日本語 @#$%!");
  });

  test("handle Unicode characters in input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    await page.getByRole("textbox").fill("🚀 Unicode test 🎉");
    await expect(page.getByRole("textbox")).toHaveValue("🚀 Unicode test 🎉");
  });

  test("component handles very long input text", async ({ initTestBed, page }) => {
    const longText =
      "This is a very long text that might cause layout or performance issues in the component".repeat(
        10,
      );
    await initTestBed(`<TextBox />`);
    await page.getByRole("textbox").fill(longText);
    await expect(page.getByRole("textbox")).toHaveValue(longText);
  });

  test("component handles special characters correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox label="Input with !@#$%^&*()"/>`, {});
    await expect(page.getByText("Input with !@#$%^&*()")).toBeVisible();
  });

  test("component handles extremely long input values", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);

    const veryLongText = "A".repeat(10000);
    await page.getByRole("textbox").fill(veryLongText);
    await expect(page.getByRole("textbox")).toHaveValue(veryLongText);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in Stack layout contexts", async ({ initTestBed, page }) => {
    await initTestBed(`<Stack><TextBox testId="input" /></Stack>`);
    const input = page.getByTestId("input");
    const { width, height } = await getBounds(input);

    await expect(input).toBeVisible();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("component works correctly in FlowLayout layout contexts", async ({ initTestBed, page }) => {
    await initTestBed(`<FlowLayout><TextBox testId="input" /></FlowLayout>`);
    const input = page.getByTestId("input");
    const { width, height } = await getBounds(input);

    await expect(input).toBeVisible();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("component integrates with forms correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Form><TextBox label="Username" /></Form>`);
    const input = page.getByLabel("Username");
    const { width, height } = await getBounds(input);

    await expect(input).toBeVisible();
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });

  test("component works with conditional rendering", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.showInput="{true}">
        <Fragment when="{showInput}">
          <TextBox label="Conditional input" />
        </Fragment>
        <Button testId="toggleBtn" onClick="showInput = !showInput">Toggle</Button>
      </Fragment>
    `);

    await expect(page.getByLabel("Conditional input")).toBeVisible();

    await page.getByTestId("toggleBtn").click();
    await expect(page.getByLabel("Conditional input")).not.toBeVisible();
  });
});
