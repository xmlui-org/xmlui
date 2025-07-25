import { expect, test } from "./fixtures";
import { getFullRectangle, initApp, initThemedApp } from "./component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("switch renders with default props", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeVisible();
  await expect(switchElement).not.toBeChecked();
});

test("switch renders with label", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Toggle feature" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  const label = page.getByText("Toggle feature");
  
  await expect(switchElement).toBeVisible();
  await expect(label).toBeVisible();
});

test("initialValue=true makes switch checked by default", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch initialValue="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeChecked();
});

test("initialValue=false makes switch unchecked by default", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch initialValue="false" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).not.toBeChecked();
});

test("clicking switch toggles its state", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Initially unchecked
  await expect(switchElement).not.toBeChecked();
  
  // Click to check
  await switchElement.click();
  await expect(switchElement).toBeChecked();
  
  // Click to uncheck
  await switchElement.click();
  await expect(switchElement).not.toBeChecked();
});

test("enabled=false disables switch interaction", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch enabled="false" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeDisabled();
});

test("readOnly prevents state changes but keeps switch focusable", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch readOnly="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toHaveAttribute("readonly");
  await expect(switchElement).not.toBeDisabled();
  
  // Clicking readonly switch should not change state
  await switchElement.click();
  await expect(switchElement).not.toBeChecked();
});

test("required attribute is applied correctly", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch required="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toHaveAttribute("required");
});

test("autoFocus gives switch focus on load", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch autoFocus="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeFocused();
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("switch has correct accessibility attributes", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Feature toggle" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toHaveAttribute("role", "switch");
  await expect(switchElement).toHaveAttribute("aria-checked", "false");
  await expect(switchElement).toHaveAttribute("type", "checkbox");
});

test("aria-checked reflects switch state correctly", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Initially unchecked
  await expect(switchElement).toHaveAttribute("aria-checked", "false");
  
  // After clicking
  await switchElement.click();
  await expect(switchElement).toHaveAttribute("aria-checked", "true");
});

test("required switch has aria-required attribute", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch required="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toHaveAttribute("aria-required", "true");
});

test("switch is keyboard accessible", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Focus with Tab
  await page.keyboard.press("Tab");
  await expect(switchElement).toBeFocused();
  
  // Toggle with Space
  await page.keyboard.press("Space");
  await expect(switchElement).toBeChecked();
  
  // Toggle with Enter
  await page.keyboard.press("Enter");
  await expect(switchElement).not.toBeChecked();
});

test("disabled switch is not focusable", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch enabled="false" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await page.keyboard.press("Tab");
  await expect(switchElement).not.toBeFocused();
});

test("readonly switch is focusable but not toggleable via keyboard", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch readOnly="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await switchElement.focus();
  await expect(switchElement).toBeFocused();
  
  // Should not toggle with keyboard
  await page.keyboard.press("Space");
  await expect(switchElement).not.toBeChecked();
  
  await page.keyboard.press("Enter");
  await expect(switchElement).not.toBeChecked();
});

test("label is properly associated with switch", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Enable notifications" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  const label = page.getByText("Enable notifications");
  
  // Click label should toggle switch
  await label.click();
  await expect(switchElement).toBeChecked();
});

// =============================================================================
// LAYOUT TESTS
// =============================================================================

test("labelPosition=start positions label to the left", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Left label" labelPosition="start" testId="switch" />`,
  });

  const label = page.getByText("Left label");
  const switchElement = page.getByTestId("switch");
  
  const { right: labelRight } = await getFullRectangle(label);
  const { left: switchLeft } = await getFullRectangle(switchElement);
  
  expect(labelRight).toBeLessThan(switchLeft);
});

test("labelPosition=end positions label to the right", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Right label" labelPosition="end" testId="switch" />`,
  });

  const label = page.getByText("Right label");
  const switchElement = page.getByTestId("switch");
  
  const { right: switchRight } = await getFullRectangle(switchElement);
  const { left: labelLeft } = await getFullRectangle(label);
  
  expect(switchRight).toBeLessThan(labelLeft);
});

test("labelWidth sets label container width", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Fixed width" labelWidth="200px" testId="switch" />`,
  });

  const labelContainer = page.locator(".label-container").first();
  await expect(labelContainer).toHaveCSS("width", "200px");
});

// =============================================================================
// VALIDATION STATE TESTS
// =============================================================================

test("validationStatus=error shows error styling", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch validationStatus="error" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toHaveClass(/error/);
});

test("validationStatus=warning shows warning styling", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch validationStatus="warning" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toHaveClass(/warning/);
});

test("validationStatus=success shows success styling", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch validationStatus="success" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toHaveClass(/success/);
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test("didChange event fires when switch is toggled", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" onDidChange="testState = 'changed'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await switchElement.click();
  await expect(page.getByTestId("testState")).toContainText("changed");
});

test("didChange event provides correct value", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" onDidChange="testState = args[0]" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Toggle to true
  await switchElement.click();
  await expect(page.getByTestId("testState")).toContainText("true");
  
  // Toggle to false
  await switchElement.click();
  await expect(page.getByTestId("testState")).toContainText("false");
});

test("gotFocus event fires when switch receives focus", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" onGotFocus="testState = 'focused'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await switchElement.focus();
  await expect(page.getByTestId("testState")).toContainText("focused");
});

test("lostFocus event fires when switch loses focus", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" onLostFocus="testState = 'blurred'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await switchElement.focus();
  await switchElement.blur();
  await expect(page.getByTestId("testState")).toContainText("blurred");
});

test("events do not fire when disabled", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch enabled="false" testId="switch" onDidChange="testState = 'should-not-fire'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await switchElement.click({ force: true });
  // testState should remain empty
  await expect(page.getByTestId("testState")).toBeEmpty();
});

test("didChange event does not fire when readOnly", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch readOnly="true" testId="switch" onDidChange="testState = 'should-not-fire'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await switchElement.click();
  // testState should remain empty
  await expect(page.getByTestId("testState")).toBeEmpty();
});

// =============================================================================
// API TESTS
// =============================================================================

test("value API returns current switch state", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch apiId="mySwitch" testId="switch" onGotFocus="testState = api('mySwitch').value" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Test initial value (false)
  await switchElement.focus();
  await expect(page.getByTestId("testState")).toContainText("false");
  
  // Toggle and test again
  await switchElement.click();
  await switchElement.blur();
  await switchElement.focus();
  await expect(page.getByTestId("testState")).toContainText("true");
});

test("setValue API programmatically changes switch state", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch apiId="mySwitch" testId="switch" onGotFocus="api('mySwitch').setValue(true); testState = 'set'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Initially unchecked
  await expect(switchElement).not.toBeChecked();
  
  // Focus triggers setValue(true)
  await switchElement.focus();
  await expect(page.getByTestId("testState")).toContainText("set");
  await expect(switchElement).toBeChecked();
});

test("setValue API with false unchecks switch", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch initialValue="true" apiId="mySwitch" testId="switch" onGotFocus="api('mySwitch').setValue(false); testState = 'unset'" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Initially checked
  await expect(switchElement).toBeChecked();
  
  // Focus triggers setValue(false)
  await switchElement.focus();
  await expect(page.getByTestId("testState")).toContainText("unset");
  await expect(switchElement).not.toBeChecked();
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("switch handles null and undefined props gracefully", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeVisible();
  await expect(switchElement).not.toBeChecked();
});

test("switch handles empty string label", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeVisible();
});

test("switch handles special characters in label", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Enable &amp; Save &lt;Settings&gt;" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  const label = page.getByText("Enable & Save <Settings>");
  
  await expect(switchElement).toBeVisible();
  await expect(label).toBeVisible();
});

test("switch handles Unicode characters in label", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="启用功能 ✓" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  const label = page.getByText("启用功能 ✓");
  
  await expect(switchElement).toBeVisible();
  await expect(label).toBeVisible();
});

test("switch handles very long label", async ({ page }) => {
  const longLabel = "This is a very long label that might cause layout issues if not handled properly by the component";
  await initApp(page, {
    entryPoint: `<Switch label="${longLabel}" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  const label = page.getByText(longLabel);
  
  await expect(switchElement).toBeVisible();
  await expect(label).toBeVisible();
});

test("switch handles rapid state changes", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  // Rapid clicking
  for (let i = 0; i < 5; i++) {
    await switchElement.click();
  }
  
  // Should end up checked (odd number of clicks)
  await expect(switchElement).toBeChecked();
});

test("switch handles prop combinations: required + disabled", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch required="true" enabled="false" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toBeDisabled();
  await expect(switchElement).toHaveAttribute("required");
});

test("switch handles prop combinations: readOnly + required", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch readOnly="true" required="true" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toHaveAttribute("readonly");
  await expect(switchElement).toHaveAttribute("required");
  await expect(switchElement).not.toBeDisabled();
});

test("switch handles extreme labelWidth values", async ({ page }) => {
  await initApp(page, {
    entryPoint: `<Switch label="Test" labelWidth="0px" testId="switch" />`,
  });

  const switchElement = page.getByTestId("switch");
  await expect(switchElement).toBeVisible();
  
  await initApp(page, {
    entryPoint: `<Switch label="Test" labelWidth="9999px" testId="switch2" />`,
  });

  const switchElement2 = page.getByTestId("switch2");
  await expect(switchElement2).toBeVisible();
});

// =============================================================================
// TEMPLATE TESTS
// =============================================================================

test("switch works within Fragment", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <Switch label="First switch" testId="first" />
        <Switch label="Second switch" testId="second" />
      </Fragment>
    `,
  });
  
  const firstSwitch = page.getByTestId("first");
  const secondSwitch = page.getByTestId("second");
  
  await expect(firstSwitch).toBeVisible();
  await expect(secondSwitch).toBeVisible();
  
  // Test independent operation
  await firstSwitch.click();
  await expect(firstSwitch).toBeChecked();
  await expect(secondSwitch).not.toBeChecked();
});

test("multiple switches maintain independent state", async ({ page }) => {
  await initApp(page, {
    entryPoint: `
      <Fragment>
        <Switch testId="switch1" />
        <Switch testId="switch2" initialValue="true" />
        <Switch testId="switch3" />
      </Fragment>
    `,
  });
  
  const switch1 = page.getByTestId("switch1");
  const switch2 = page.getByTestId("switch2");
  const switch3 = page.getByTestId("switch3");
  
  // Verify initial states
  await expect(switch1).not.toBeChecked();
  await expect(switch2).toBeChecked();
  await expect(switch3).not.toBeChecked();
  
  // Toggle switch1
  await switch1.click();
  await expect(switch1).toBeChecked();
  await expect(switch2).toBeChecked(); // Should remain unchanged
  await expect(switch3).not.toBeChecked(); // Should remain unchanged
});

// =============================================================================
// THEME TESTS
// =============================================================================

test("switch applies custom theme variables", async ({ page }) => {
  await initThemedApp(page, `<Switch label="Themed switch" testId="switch" />`, {
    themeVars: {
      "backgroundColor-Switch": "rgb(255, 0, 0)",
      "borderColor-Switch": "rgb(0, 255, 0)",
    },
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(switchElement).toHaveCSS("border-color", "rgb(0, 255, 0)");
});

test("checked switch applies checked theme variables", async ({ page }) => {
  await initThemedApp(page, `<Switch initialValue="true" testId="switch" />`, {
    themeVars: {
      "backgroundColor-checked-Switch": "rgb(0, 0, 255)",
      "borderColor-checked-Switch": "rgb(255, 255, 0)",
    },
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toHaveCSS("background-color", "rgb(0, 0, 255)");
  await expect(switchElement).toHaveCSS("border-color", "rgb(255, 255, 0)");
});

test("validation state theme variables apply correctly", async ({ page }) => {
  await initThemedApp(page, `<Switch validationStatus="error" testId="switch" />`, {
    themeVars: {
      "borderColor-Switch-error": "rgb(255, 0, 0)",
    },
  });

  const switchElement = page.getByTestId("switch");
  
  await expect(switchElement).toHaveCSS("border-color", "rgb(255, 0, 0)");
});
