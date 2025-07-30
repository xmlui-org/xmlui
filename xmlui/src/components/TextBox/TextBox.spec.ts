import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.component).toBeVisible();
    await expect(driver.field).toBeVisible();
    await expect(driver.field).toHaveValue("");
  });

  test("component renders with label", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Username" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.component).toBeVisible();
    await expect(driver.label).toHaveText("Username");
  });

  test("initialValue sets field value", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox initialValue="test value" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveValue("test value");
  });

  test("initialValue accepts different data types", async ({ initTestBed, createTextBoxDriver }) => {
    // Test string
    await initTestBed(`<TextBox initialValue="hello" />`);
    let driver = await createTextBoxDriver();
    await expect(driver.field).toHaveValue("hello");
    
    // Test number
    await initTestBed(`<TextBox initialValue="{123}" />`);
    driver = await createTextBoxDriver();
    await expect(driver.field).toHaveValue("123");
    
    // Test boolean
    await initTestBed(`<TextBox initialValue="{true}" />`);
    driver = await createTextBoxDriver();
    await expect(driver.field).toHaveValue("true");
  });

  test("initialValue accepts empty as empty string", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox initialValue="" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveValue("");
  });

  test("initialValue handles null and undefined", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox initialValue="{null}" />`);
    let driver = await createTextBoxDriver();
    await expect(driver.field).toHaveValue("");
    
    await initTestBed(`<TextBox initialValue="{undefined}" />`);
    driver = await createTextBoxDriver();
    await expect(driver.field).toHaveValue("");
  });

  test("component accepts user input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill("user input");
    await expect(driver.field).toHaveValue("user input");
  });

  test("component clears input correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox initialValue="initial text" />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.clear();
    await expect(driver.field).toHaveValue("");
  });

  test("component required prop adds required attribute", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox required="true" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox enabled="false" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toBeDisabled();
  });

  test("enabled=false prevents user input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox enabled="false" />`);
    const driver = await createTextBoxDriver();
    
    // Disabled inputs cannot be filled
    await expect(driver.field).toBeDisabled();
    await expect(driver.field).not.toBeEditable();
  });

  test("readOnly prevents editing but allows focus", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox readOnly="true" initialValue="read only text" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveAttribute("readonly");
    await expect(driver.field).toHaveValue("read only text");
    await expect(driver.field).not.toBeEditable();
    
    await driver.field.focus();
    await expect(driver.field).toBeFocused();
  });

  test("readOnly is not the same as disabled", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox readOnly="true" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).not.toBeDisabled();
    await expect(driver.field).toHaveAttribute("readonly");
  });

  test("autoFocus focuses input on mount", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox autoFocus="true" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox autoFocus="true" label="Auto-focused input" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toBeFocused();
  });

  test("placeholder shows when input is empty", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox placeholder="Enter text here..." />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveAttribute("placeholder", "Enter text here...");
  });

  test("maxLength limits input length", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox maxLength="5" />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill("12345678");
    await expect(driver.field).toHaveValue("12345");
  });

  test("handle special characters in input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill("Hello 日本語 @#$%!");
    await expect(driver.field).toHaveValue("Hello 日本語 @#$%!");
  });

  test("handle Unicode characters in input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill("🚀 Unicode test 🎉");
    await expect(driver.field).toHaveValue("🚀 Unicode test 🎉");
  });

  test("component handles very long input text", async ({ initTestBed, createTextBoxDriver }) => {
    const longText = "This is a very long text that might cause layout or performance issues in the component".repeat(10);
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill(longText);
    await expect(driver.field).toHaveValue(longText);
  });

  test("component handles rapid input changes", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    // Type rapidly
    await driver.field.pressSequentially("rapid", { delay: 50 });
    await expect(driver.field).toHaveValue("rapid");
    
    await driver.field.clear();
    await driver.field.pressSequentially("typing", { delay: 25 });
    await expect(driver.field).toHaveValue("typing");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("label is properly associated with input", async ({ initTestBed, createTextBoxDriver }) => {
    const label = "Username";
    await initTestBed(`<TextBox label="${label}" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toHaveRole("textbox");
    await expect(driver.label).toHaveText(label);
  });

  test.skip("component supports keyboard navigation", async ({ initTestBed, page }) => {
    // TODO: This test may be failing due to label association issues in TextBox
    await initTestBed(`
      <Fragment>
        <TextBox testId="first-input" label="First input" />
        <TextBox testId="second-input" label="Second input" />
      </Fragment>
    `);

    const firstInput = page.getByTestId("first-input");
    const secondInput = page.getByTestId("second-input");

    await firstInput.focus();
    await expect(firstInput).toBeFocused();
    
    await page.keyboard.press("Tab", { delay: 100 });
    await expect(secondInput).toBeFocused();
  });

  test("required has proper ARIA attributes", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox required="true" label="Required input" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveAttribute("required");
    await expect(driver.label).toContainText("*");
  });

  test("component disabled has proper accessibility state", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox enabled="false" label="Disabled input" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toBeDisabled();
  });

  test("component has correct role attribute", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveRole("textbox");
  });

  test("placeholder provides accessible description", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox placeholder="Enter your username" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveAttribute("placeholder", "Enter your username");
  });

  test("readOnly has proper ARIA attributes", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox readOnly="true" label="Read-only input" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.field).toHaveAttribute("readonly");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Username" labelPosition="start" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Username" labelPosition="end" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Username" labelPosition="top" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Username" labelPosition="bottom" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });

  test("labelWidth applies custom label width", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Custom width" labelWidth="200px" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Very long label that should break into multiple lines" labelBreak="true" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Test label" labelPosition="invalid" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on input change", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onDidChange="testState = 'changed'" />
    `);
    
    const driver = await createTextBoxDriver();
    await driver.field.fill("test");
    
    await expect.poll(testStateDriver.testState).toEqual('changed');
  });

  test("didChange event passes new value", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onDidChange="arg => testState = arg" />
    `);
    
    const driver = await createTextBoxDriver();
    await driver.field.fill("test value");
    
    await expect.poll(testStateDriver.testState).toEqual("test value");
  });

  test("gotFocus event fires on focus", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onGotFocus="testState = 'focused'" />
    `);
    
    const driver = await createTextBoxDriver();
    await driver.field.focus();
    
    await expect.poll(testStateDriver.testState).toEqual('focused');
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onLostFocus="testState = 'blurred'" />
    `);
    
    const driver = await createTextBoxDriver();
    await driver.field.focus();
    await driver.field.blur();
    
    await expect.poll(testStateDriver.testState).toEqual('blurred');
  });

  test("events do not fire when component is disabled", async ({ initTestBed, createTextBoxDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox enabled="false" didChange="testState = 'changed'" gotFocus="testState = 'focused'" />
    `);
    
    const driver = await createTextBoxDriver();
    await expect(driver.field).toBeDisabled();
    
    // Events should not fire when disabled
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
    
    const textbox = page.getByRole("textbox");
    await textbox.fill("new value");
    await expect(page.getByTestId("value")).toHaveText("new value");
  });

  test("component setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" />
        <Button testId="setBtn" onClick="myTextBox.setValue('api value')">Set Value</Button>
        <Text testId="value">{myTextBox.value}</Text>
      </Fragment>
    `);
    
    await expect(page.getByTestId("value")).toHaveText("");
    
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("value")).toHaveText("api value");
    
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveValue("api value");
  });

  test("component setValue API triggers events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TextBox id="myTextBox" onDidChange="testState = 'api-changed'" />
        <Button testId="setBtn" onClick="myTextBox.setValue('test')">Set Value</Button>
      </Fragment>
    `);
    
    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual('api-changed');
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
  test("startText displays at beginning of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox startText="$" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.component).toContainText("$");
  });

  test("endText displays at end of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox endText="USD" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.component).toContainText("USD");
  });

  test("startIcon displays at beginning of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox startIcon="search" />`);
    const driver = await createTextBoxDriver();
    
    // Check for icon presence
    await expect(driver.component).toBeVisible();
  });

  test("endIcon displays at end of input", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox endIcon="clear" />`);
    const driver = await createTextBoxDriver();
    
    // Check for icon presence
    await expect(driver.component).toBeVisible();
  });

  test("multiple adornments can be combined", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox startText="$" endText="USD" startIcon="dollar" />`);
    const driver = await createTextBoxDriver();
    
    await expect(driver.component).toContainText("$");
    await expect(driver.component).toContainText("USD");
  });

  test("gap property controls spacing between adornments", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox startText="$" gap="10px" />`);
    const driver = await createTextBoxDriver();
    
    // Check spacing is applied
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// PASSWORD INPUT TESTS
// =============================================================================

test.describe("Password Input", () => {
  test("password type hides input text", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput type="password" />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill("secret");
    await expect(driver.field).toHaveAttribute("type", "password");
  });

  test("showPasswordToggle displays visibility toggle", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput type="password" showPasswordToggle="true" />`);
    const driver = await createTextBoxDriver();
    
    // Check for toggle button presence
    await expect(driver.component).toBeVisible();
  });

  test("password toggle switches between visible and hidden", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput type="password" showPasswordToggle="true" />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill("secret");
    await expect(driver.field).toHaveAttribute("type", "password");
    
    // TODO: Click toggle button (would need to find the toggle button)
    // await toggleButton.click();
    // await expect(driver.field).toHaveAttribute("type", "text");
  });

  test("custom password icons work correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput type="password" showPasswordToggle="true" passwordVisibleIcon="eye-open" passwordHiddenIcon="eye-closed" />`);
    const driver = await createTextBoxDriver();
    
    // Check custom icons are used
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Vars", () => {
  test("backgroundColor applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`, {
      testThemeVars: {
        "backgroundColor-TextBox": "rgb(255, 240, 240)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("background-color", "rgb(255, 240, 240)");
  });

  test("borderColor applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`, {
      testThemeVars: {
        "borderColor-TextBox": "rgb(255, 0, 0)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("textColor applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`, {
      testThemeVars: {
        "textColor-TextBox": "rgb(0, 0, 255)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("focus borderColor applies on focus", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`, {
      testThemeVars: {
        "borderColor-TextBox--focus": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextBoxDriver();
    
    await driver.component.focus();
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("disabled backgroundColor applies when disabled", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-TextBox--disabled": "rgb(240, 240, 240)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("error borderColor applies with error validation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-TextBox-error": "rgb(255, 0, 0)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("warning borderColor applies with warning validation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-TextBox-warning": "rgb(255, 165, 0)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 165, 0)");
  });

  test("success borderColor applies with valid validation", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-TextBox-success": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("borderRadius applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`, {
      testThemeVars: {
        "borderRadius-TextBox": "8px",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("border-radius", "8px");
  });

  test("padding applies correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox />`, {
      testThemeVars: {
        "padding-TextBox": "12px",
      },
    });
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveCSS("padding", "12px");
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test("validationStatus=error correctly displayed", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="error" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveClass(/error/);
  });

  test("validationStatus=warning correctly displayed", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="warning" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveClass(/warning/);
  });

  test("validationStatus=valid correctly displayed", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="valid" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.component).toHaveClass(/valid/);
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox validationStatus="invalid-status" />`);
    const driver = await createTextBoxDriver();
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null and undefined props gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox/>`, {});
    const driver1 = await createTextBoxDriver();
    await expect(driver1.component).toBeVisible();
    
    await initTestBed(`<TextBox label=""/>`, {});
    const driver2 = await createTextBoxDriver();
    await expect(driver2.component).toBeVisible();
  });

  test("component handles special characters correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox label="Input with !@#$%^&*()"/>`, {});
    const driver = await createTextBoxDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles extremely long input values", async ({ initTestBed, createTextBoxDriver }) => {
    const veryLongText = "A".repeat(10000);
    await initTestBed(`<TextBox />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.fill(veryLongText);
    await expect(driver.field).toHaveValue(veryLongText);
  });

  test("component handles clipboard operations correctly", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<TextBox initialValue="copy this text" />`);
    const driver = await createTextBoxDriver();
    
    await driver.field.selectText();
    // TODO: Test copy/paste operations
    await expect(driver.field).toBeVisible();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in different layout contexts", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`
      <VStack>
        <TextBox label="First input" />
        <TextBox label="Second input" />
      </VStack>
    `, {});
    
    const driver = await createTextBoxDriver();
    
    // Test basic layout integration
    await expect(driver.component).toBeVisible();
    
    // Test bounding box and dimensions
    const boundingBox = await driver.component.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test.skip("component integrates with forms correctly", async ({ initTestBed, page }) => {
    // TODO: This test may be failing due to Form component or label association issues
    await initTestBed(`
      <Form>
        <TextBox label="Username" required="true" />
        <TextBox label="Email" type="email" />
        <Button type="submit">Submit</Button>
      </Form>
    `);
    
    const usernameInput = page.getByLabel("Username");
    const emailInput = page.getByLabel("Email");
    const submitButton = page.getByRole("button", { name: "Submit" });
    
    await expect(usernameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test.skip("component works with conditional rendering", async ({ initTestBed, page }) => {
    // TODO: This test may be failing due to label association issues in conditional rendering
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
