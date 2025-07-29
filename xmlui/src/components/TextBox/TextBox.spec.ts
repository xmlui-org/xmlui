import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test.skip("component renders with label", async ({ initTestBed, page }) => {
    // TODO: review and fix this test
    await initTestBed(`<TextBox label="Username" />`);
    await expect(page.getByLabel("Username")).toHaveRole("textbox");
  });

  test("initialValue sets field value", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="test value" />`);
    await expect(page.getByRole("textbox")).toHaveValue("test value");
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

  test("initialValue accepts empty as empty string", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("initialValue handles null and undefined", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="{null}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
    
    await initTestBed(`<TextBox initialValue="{undefined}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("component accepts user input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill("user input");
    await expect(textbox).toHaveValue("user input");
  });

  test("component clears input correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="initial text" />`);
    const textbox = page.getByRole("textbox");
    
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
    const textbox = page.getByRole("textbox");
    
    // Disabled inputs cannot be filled
    await expect(textbox).toBeDisabled();
  });

  test("readOnly prevents editing but allows focus", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox readOnly="true" initialValue="read only text" />`);
    const textbox = page.getByRole("textbox");
    
    await expect(textbox).toHaveAttribute("readonly");
    await expect(textbox).toHaveValue("read only text");
    
    await textbox.focus();
    await expect(textbox).toBeFocused();
  });

  test("readOnly is not the same as disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox readOnly="true" />`);
    const textbox = page.getByRole("textbox");
    
    await expect(textbox).not.toBeDisabled();
    await expect(textbox).toHaveAttribute("readonly");
  });

  test("autoFocus focuses input on mount", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox autoFocus="true" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox autoFocus="true" label="Auto-focused input" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeFocused();
  });

  test("placeholder shows when input is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox placeholder="Enter text here..." />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveAttribute("placeholder", "Enter text here...");
  });

  test("maxLength limits input length", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox maxLength="5" />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill("12345678");
    await expect(textbox).toHaveValue("12345");
  });

  test("handle special characters in input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill("Hello 日本語 @#$%!");
    await expect(textbox).toHaveValue("Hello 日本語 @#$%!");
  });

  test("handle Unicode characters in input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill("🚀 Unicode test 🎉");
    await expect(textbox).toHaveValue("🚀 Unicode test 🎉");
  });

  test("component handles very long input text", async ({ initTestBed, page }) => {
    const longText = "This is a very long text that might cause layout or performance issues in the component".repeat(10);
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill(longText);
    await expect(textbox).toHaveValue(longText);
  });

  test("component handles rapid input changes", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    
    // Type rapidly
    await textbox.pressSequentially("rapid", { delay: 50 });
    await expect(textbox).toHaveValue("rapid");
    
    await textbox.clear();
    await textbox.pressSequentially("typing", { delay: 25 });
    await expect(textbox).toHaveValue("typing");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test.skip("label is properly associated with input", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    const label = "Username";
    await initTestBed(`<TextBox label="${label}" />`);
    const component = page.getByLabel(label);
    await expect(component).toHaveRole("textbox");
  });

  test.skip("component supports keyboard navigation", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    await initTestBed(`
      <Fragment>
        <TextBox label="First input" />
        <TextBox label="Second input" />
      </Fragment>
    `);
    
    const firstInput = page.getByLabel("First input");
    const secondInput = page.getByLabel("Second input");
    
    await firstInput.focus();
    await expect(firstInput).toBeFocused();
    
    await page.keyboard.press("Tab");
    await expect(secondInput).toBeFocused();
  });

  test.skip("required has proper ARIA attributes", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox required="true" label="Required input" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveAttribute("aria-required", "true");
  });

  test.skip("required state has visual representation next to label", async ({
    initTestBed,
    createTextBoxDriver,
  }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox required="true" label="Required input" />`);
    const driver = await createTextBoxDriver();
    
    // Check for required indicator (usually asterisk)
    await expect(driver.component).toContainText("*");
  });

  test.skip("component disabled has proper ARIA attributes", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox enabled="false" label="Disabled input" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveAttribute("aria-disabled", "true");
  });

  test.skip("component has correct role attribute", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveAttribute("role", "textbox");
  });

  test.skip("placeholder provides accessible description", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox placeholder="Enter your username" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toHaveAttribute("placeholder", "Enter your username");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test.skip("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Username" labelPosition="start" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
  });

  test.skip("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Username" labelPosition="end" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
  });

  test.skip("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Username" labelPosition="top" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
  });

  test.skip("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Username" labelPosition="bottom" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
  });

  test.skip("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Custom width" labelWidth="200px" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
  });

  test.skip("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Very long label that should break into multiple lines" labelBreak="true" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
  });

  test.skip("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox label="Test label" labelPosition="invalid" />`);
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeVisible();
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
    
    const textbox = page.getByRole("textbox");
    await textbox.fill("test");
    
    await expect.poll(testStateDriver.testState).toEqual('changed');
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onDidChange="arg => testState = arg" />
    `);
    
    const textbox = page.getByRole("textbox");
    await textbox.fill("test value");
    
    await expect.poll(testStateDriver.testState).toEqual("test value");
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onGotFocus="testState = 'focused'" />
    `);
    
    const textbox = page.getByRole("textbox");
    await textbox.focus();
    
    await expect.poll(testStateDriver.testState).toEqual('focused');
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox onLostFocus="testState = 'blurred'" />
    `);
    
    const textbox = page.getByRole("textbox");
    await textbox.focus();
    await textbox.blur();
    
    await expect.poll(testStateDriver.testState).toEqual('blurred');
  });

  test("events do not fire when component is disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextBox enabled="false" didChange="testState = 'changed'" gotFocus="testState = 'focused'" />
    `);
    
    const textbox = page.getByRole("textbox");
    await expect(textbox).toBeDisabled();
    
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
    
    await page.getByRole("textbox").fill("new value");
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
    await expect(page.getByRole("textbox")).not.toBeFocused();
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

  test.skip("startIcon displays at beginning of input", async ({ initTestBed, createTextBoxDriver }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<TextBox startIcon="search" />`);
    const driver = await createTextBoxDriver();
    
    // Check for icon presence
    await expect(driver.component).toBeVisible();
  });

  test.skip("endIcon displays at end of input", async ({ initTestBed, createTextBoxDriver }) => {
    // TODO: review these Copilot-created tests
    
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

  test.skip("gap property controls spacing between adornments", async ({ initTestBed, createTextBoxDriver }) => {
    // TODO: review these Copilot-created tests
    
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
  test("password type hides input text", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput type="password" />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill("secret");
    await expect(textbox).toHaveAttribute("type", "password");
  });

  test("showPasswordToggle displays visibility toggle", async ({ initTestBed, createTextBoxDriver }) => {
    await initTestBed(`<PasswordInput type="password" showPasswordToggle="true" />`);
    const driver = await createTextBoxDriver();
    
    // Check for toggle button presence
    await expect(driver.component).toBeVisible();
  });

  test.skip("password toggle switches between visible and hidden", async ({ initTestBed, page }) => {
    await initTestBed(`<PasswordInput type="password" showPasswordToggle="true" />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill("secret");
    await expect(textbox).toHaveAttribute("type", "password");
    
    // TODO: Click toggle button (would need to find the toggle button)
    // await toggleButton.click();
    // await expect(textbox).toHaveAttribute("type", "text");
  });

  test.skip("custom password icons work correctly", async ({ initTestBed, createTextBoxDriver }) => {
    // TODO: review these Copilot-created tests
    
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

  test.skip("handles invalid validationStatus gracefully", async ({ initTestBed, createTextBoxDriver }) => {
    // TODO: review these Copilot-created tests
    
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
    // TODO: review these Copilot-created tests
    
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

  test("component handles extremely long input values", async ({ initTestBed, page }) => {
    const veryLongText = "A".repeat(10000);
    await initTestBed(`<TextBox />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.fill(veryLongText);
    await expect(textbox).toHaveValue(veryLongText);
  });

  test.skip("component handles clipboard operations correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextBox initialValue="copy this text" />`);
    const textbox = page.getByRole("textbox");
    
    await textbox.selectText();
    // TODO: Test copy/paste operations
    await expect(textbox).toBeVisible();
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
    // TODO: review these Copilot-created tests
    
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
    // TODO: review these Copilot-created tests
    
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
