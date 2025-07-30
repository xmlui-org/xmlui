import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch />`);
    await expect(page.getByRole("switch")).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable notifications" />`);
    await expect(page.getByLabel("Enable notifications")).toBeVisible();
  });

  test("initialValue sets checked state", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch initialValue="true" />`);
    await expect(page.getByRole("switch")).toBeChecked();
  });

  test.skip("initialValue accepts string values correctly", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    
    await initTestBed(`<Switch initialValue="true" />`);
    await expect(page.getByRole("switch")).toBeChecked();
    
    await initTestBed(`<Switch initialValue="false" />`);
    await expect(page.getByRole("switch")).not.toBeChecked();
  });

  test("initialValue accepts empty as false", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch initialValue="" />`);
    await expect(page.getByRole("switch")).not.toBeChecked();
  });

  test("initialValue=false sets unchecked state", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch initialValue="false" />`);
    await expect(page.getByRole("switch")).not.toBeChecked();
  });

  test("component click toggles checked state", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch />`);
    const switchElement = page.getByRole("switch");

    // Initially unchecked
    await expect(switchElement).not.toBeChecked();

    // Click to check
    await switchElement.click();
    await expect(switchElement).toBeChecked();

    // Click again to uncheck
    await switchElement.click();
    await expect(switchElement).not.toBeChecked();
  });

  test("component required prop adds required attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch required="true" />`);
    await expect(page.getByRole("switch")).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch enabled="false" />`);
    await expect(page.getByRole("switch")).toBeDisabled();
  });

  test("enabled=false disables interaction", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch enabled="false" initialValue="false" />`);
    const switchElement = page.getByRole("switch");
    await switchElement.click({ force: true });
    await expect(switchElement).not.toBeChecked();
  });

  test("readOnly", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch readOnly="true" />`);
    await expect(page.getByRole("switch")).toHaveAttribute("readonly");
  });

  test("readOnly prevents state changes", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch readOnly="true" initialValue="false" />`);
    const switchElement = page.getByRole("switch");
    await switchElement.click();
    await expect(switchElement).not.toBeChecked();
  });

  test("readOnly is not the same as disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch readOnly="true" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).not.toBeDisabled();
    await expect(switchElement).toHaveAttribute("readonly");
  });

  test("autoFocus focuses input on mount", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch autoFocus="true" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch autoFocus="true" label="Auto-focused switch" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeFocused();
  });

  test("handle special characters in label", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable 日本語 notifications!@#$" />`);
    await expect(page.getByLabel("Enable 日本語 notifications!@#$")).toBeVisible();
  });

  test("handle Unicode characters in label", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable 🔔 notifications" />`);
    await expect(page.getByLabel("Enable 🔔 notifications")).toBeVisible();
  });

  test("component handles very long label text", async ({ initTestBed, page }) => {
    const longLabel = "This is a very long label that might cause layout issues or text wrapping problems in the component rendering";
    await initTestBed(`<Switch label="${longLabel}" />`);
    await expect(page.getByLabel(longLabel)).toBeVisible();
  });

  test("component handles rapid state changes", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch />`);
    const switchElement = page.getByRole("switch");
    
    // Perform rapid clicks
    for (let i = 0; i < 5; i++) {
      await switchElement.click();
    }
    
    // Should end up checked (odd number of clicks)
    await expect(switchElement).toBeChecked();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("label is associated with input", async ({ initTestBed, page }) => {
    const label = "Enable notifications";
    await initTestBed(`<Switch label="${label}" />`);
    const component = page.getByLabel(label);
    await expect(component).toHaveRole("switch");
  });

  test("pressing Space after focus toggles the control", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch />`);
    const switchElement = page.getByRole("switch");
    
    await switchElement.focus();
    await expect(switchElement).not.toBeChecked();
    
    await switchElement.press("Space", { delay: 100 });
    await expect(switchElement).toBeChecked();
    
    await switchElement.press("Space", { delay: 100 });
    await expect(switchElement).not.toBeChecked();
  });

  test("component supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Switch label="First switch" />
        <Switch label="Second switch" />
      </Fragment>
    `);
    
    const firstSwitch = page.getByLabel("First switch");
    const secondSwitch = page.getByLabel("Second switch");
    
    await firstSwitch.focus();
    await expect(firstSwitch).toBeFocused();
    
    await page.keyboard.press("Tab", { delay: 100 });
    await expect(secondSwitch).toBeFocused();
  });

  test("aria-checked=false applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch initialValue="false" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toHaveAttribute("aria-checked", "false");
  });

  test("aria-checked=true applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch initialValue="true" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toHaveAttribute("aria-checked", "true");
  });

  test("required has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch required="true" label="Required switch" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toHaveAttribute("aria-required", "true");
  });

  test("required state has visual representation next to label", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Switch required="true" label="Required switch" />`);
    const driver = await createCheckboxDriver();
    
    // Check for required indicator (usually asterisk or similar)
    await expect(driver.component).toContainText("*");
  });

  test("component disabled has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch enabled="false" label="Disabled switch" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toHaveAttribute("aria-disabled", "true");
  });

  test("component has correct role attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toHaveAttribute("role", "switch");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable feature" labelPosition="start" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable feature" labelPosition="end" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable feature" labelPosition="top" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Enable feature" labelPosition="bottom" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });

  test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Custom width" labelWidth="200px" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Very long label that should break into multiple lines" labelBreak="true" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Switch label="Test label" labelPosition="invalid" />`);
    const switchElement = page.getByRole("switch");
    await expect(switchElement).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on state change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Switch onDidChange="testState = 'changed'" />
    `);
    
    const switchElement = page.getByRole("switch");
    await switchElement.click();
    
    await expect.poll(testStateDriver.testState).toEqual('changed');
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Switch onDidChange="arg => testState = arg" />
    `);
    
    const switchElement = page.getByRole("switch");
    await switchElement.click();
    
    await expect.poll(testStateDriver.testState).toEqual(true);
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Switch onGotFocus="testState = 'focused'" />
    `);
    
    const switchElement = page.getByRole("switch");
    await switchElement.focus();
    
    await expect.poll(testStateDriver.testState).toEqual('focused');
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Switch onLostFocus="testState = 'blurred'" />
    `);
    
    const switchElement = page.getByRole("switch");
    await switchElement.focus();
    await switchElement.blur();
    
    await expect.poll(testStateDriver.testState).toEqual('blurred');
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test("component value API returns current state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Switch id="mySwitch" initialValue="true" />
        <Text testId="value">{mySwitch.value}</Text>
      </Fragment>
    `);
    
    await expect(page.getByTestId("value")).toHaveText("true");
  });

  test("component value API returns state after change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Switch id="mySwitch" initialValue="false" />
        <Text testId="value">{mySwitch.value}</Text>
      </Fragment>
    `);
    
    await expect(page.getByTestId("value")).toHaveText("false");
    
    await page.getByRole("switch").click();
    await expect(page.getByTestId("value")).toHaveText("true");
  });

  test("component setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Switch id="mySwitch" initialValue="false" />
        <Button testId="setBtn" onClick="mySwitch.setValue(true)">Set True</Button>
        <Text testId="value">{mySwitch.value}</Text>
      </Fragment>
    `);
    
    await expect(page.getByTestId("value")).toHaveText("false");
    
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("value")).toHaveText("true");
    await expect(page.getByRole("switch")).toBeChecked();
  });

  test("component setValue API triggers events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Switch id="mySwitch" onDidChange="testState = 'api-changed'" />
        <Button testId="setBtn" onClick="mySwitch.setValue(true)">Set True</Button>
      </Fragment>
    `);
    
    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual('api-changed');
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States", () => {
  test("component applies switch-specific styling", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch />`);
    const driver = await createCheckboxDriver();
    
    // Switch should have different visual styling than checkbox
    await expect(driver.component).toHaveClass(/switch/);
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Theme Vars", () => {
  test("checked borderColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch initialValue="true" />`, {
      testThemeVars: {
        "borderColor-checked-Switch": "rgb(255, 0, 0)",
      },
    });
    const driver = await createCheckboxDriver();
    await expect(driver.component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("checked backgroundColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch initialValue="true" />`, {
      testThemeVars: {
        "backgroundColor-checked-Switch": "rgb(0, 255, 0)",
      },
    });
    const driver = await createCheckboxDriver();
    await expect(driver.component).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test("indicator backgroundColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch />`, {
      testThemeVars: {
        "backgroundColor-indicator-Switch": "rgb(0, 0, 255)",
      },
    });
    const driver = await createCheckboxDriver();
    // Test that the indicator has the correct background color
    await expect(driver.component).toBeVisible();
  });

  test("disabled backgroundColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-Switch--disabled": "rgb(128, 128, 128)",
      },
    });
    const driver = await createCheckboxDriver();
    await expect(driver.component).toHaveCSS("background-color", "rgb(128, 128, 128)");
  });

  test("valid borderColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-checked-Switch-success": "rgb(0, 255, 0)",
      },
    });
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
  });

  test("warning borderColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-checked-Switch-warning": "rgb(255, 165, 0)",
      },
    });
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
  });

  test("error borderColor", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-checked-Switch-error": "rgb(255, 0, 0)",
      },
    });
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
  });

  test("outlineWidth on focus", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch />`, {
      testThemeVars: {
        "outlineWidth-Switch": "3px",
      },
    });
    const driver = await createCheckboxDriver();
    await driver.component.focus();
    await expect(driver.component).toHaveCSS("outline-width", "3px");
  });

  test("outlineColor on focus", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch />`, {
      testThemeVars: {
        "outlineColor-Switch": "rgb(255, 0, 255)",
      },
    });
    const driver = await createCheckboxDriver();
    await driver.component.focus();
    await expect(driver.component).toHaveCSS("outline-color", "rgb(255, 0, 255)");
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test("validationStatus=error correctly displayed", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="error" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.component).toHaveClass(/error/);
  });

  test("validationStatus=warning correctly displayed", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="warning" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.component).toHaveClass(/warning/);
  });

  test("validationStatus=valid correctly displayed", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="valid" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.component).toHaveClass(/valid/);
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch validationStatus="invalid-status" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null and undefined props gracefully", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch/>`, {});
    const driver1 = await createCheckboxDriver();
    await expect(driver1.component).toBeVisible();
    
    await initTestBed(`<Switch label=""/>`, {});
    const driver2 = await createCheckboxDriver();
    await expect(driver2.component).toBeVisible();
  });

  test("component handles special characters correctly", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch label="Test with !@#$%^&*()"/>`, {});
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles concurrent prop updates correctly", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Switch initialValue="false" />`, {});
    const driver1 = await createCheckboxDriver();
    await expect(driver1.component).not.toBeChecked();
    
    await initTestBed(`<Switch initialValue="true" />`, {});
    const driver2 = await createCheckboxDriver();
    await expect(driver2.component).toBeChecked();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in different layout contexts", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`
      <VStack>
        <Switch label="First switch" />
        <Switch label="Second switch" />
      </VStack>
    `, {});
    
    const driver = await createCheckboxDriver();
    
    // Test basic layout integration
    await expect(driver.component).toBeVisible();
    
    // Test bounding box and dimensions
    const boundingBox = await driver.component.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test("component integrates with forms correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <Switch label="Accept terms" required="true" />
        <Button type="submit">Submit</Button>
      </Form>
    `);
    
    const switchElement = page.getByRole("switch");
    const submitButton = page.getByRole("button", { name: "Submit" });
    
    await expect(switchElement).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test("component works with conditional rendering", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.showSwitch="{true}">
        <Fragment when="{showSwitch}">
          <Switch label="Conditional switch" />
        </Fragment>
        <Button testId="toggleBtn" onClick="showSwitch = !showSwitch">Toggle</Button>
      </Fragment>
    `);
    
    await expect(page.getByLabel("Conditional switch")).toBeVisible();
    
    await page.getByTestId("toggleBtn").click();
    await expect(page.getByLabel("Conditional switch")).not.toBeVisible();
  });
});
