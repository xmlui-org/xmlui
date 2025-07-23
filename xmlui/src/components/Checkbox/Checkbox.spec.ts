import { expect, test } from "../../testing/fixtures";

test.describe("Basic Functionality Tests", () => {
  test("component renders with default props", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`<Checkbox />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.input).toBeVisible();
    await expect(driver.input).toHaveAttribute("type", "checkbox");
  });

  test("component renders with label", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.label).toBeVisible();
    await expect(driver.label).toContainText("Accept terms");
  });

  test("component initialValue sets checked state", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox initialValue="{true}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.input).toBeChecked();
  });

  test("component initialValue=false sets unchecked state", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox initialValue="{false}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.input).not.toBeChecked();
  });

  test("component indeterminate state displays correctly", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox indeterminate="{true}" />`, {});
    const driver = await createFormItemDriver();
    const isIndeterminate = await driver.input.evaluate((el: HTMLInputElement) => el.indeterminate);
    expect(isIndeterminate).toBe(true);
  });

  test("component click toggles checked state", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`<Checkbox />`, {});
    const driver = await createFormItemDriver();

    // Initially unchecked
    await expect(driver.input).not.toBeChecked();

    // Click to check
    await driver.input.click();
    await expect(driver.input).toBeChecked();

    // Click again to uncheck
    await driver.input.click();
    await expect(driver.input).not.toBeChecked();
  });

  test("component required prop adds required attribute", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox required="{true}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.input).toHaveAttribute("required");
  });

  test("component enabled=false disables interaction", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox enabled="{false}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.input).toBeDisabled();
  });

  test("component readOnly prevents state changes", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox readOnly="{true}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.input).toHaveAttribute("readonly");

    // Verify that clicking doesn't change the state
    const initialChecked = await driver.input.isChecked();
    await driver.input.click();
    const afterClickChecked = await driver.input.isChecked();
    expect(afterClickChecked).toBe(initialChecked);
  });

  test("component autoFocus focuses input on mount", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox autoFocus="{true}" />`, {});
    await expect((await createFormItemDriver()).input).toBeFocused();
  });
});

test.describe("Accessibility Tests", () => {
  test("component has correct accessibility attributes", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`, {});
    const driver = await createFormItemDriver();
    // Find the actual input element
    const inputElement = driver.checkbox;
    await expect(inputElement).toHaveAttribute("type", "checkbox");
    await expect(inputElement).toHaveAttribute("role", "checkbox");
  });

  test("component label is associated with input", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`, {});
    const driver = await createFormItemDriver();
    const inputElement = driver.checkbox;
    const inputId = await inputElement.getAttribute("id");
    await expect(driver.label).toHaveAttribute("for", inputId);
  });

  test("component is keyboard accessible", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`, {});
    const driver = await createFormItemDriver();
    const inputElement = driver.checkbox;
    await inputElement.focus();
    await expect(inputElement).toBeFocused();
    await inputElement.press("Space");
    await expect(inputElement).toBeChecked();
  });

  test("component supports keyboard navigation", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" onGotFocus="console.log('hello')" />`, {});
    const driver = await createCheckboxDriver();
    const inputElement = driver.component;
    await inputElement.press("Tab");
    await expect(inputElement).toBeFocused();
  });

  test("component has proper ARIA states", async ({ initTestBed, createFormItemDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`, {});
    const driver = await createFormItemDriver();
    const inputElement = driver.checkbox;
    await expect(inputElement).toHaveAttribute("aria-checked", "false");
    await inputElement.click();
    await expect(inputElement).toHaveAttribute("aria-checked", "true");
  });

  test("component indeterminate has correct ARIA state", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox indeterminate="{true}" />`, {});
    const driver = await createFormItemDriver();
    const inputElement = driver.input;
    await expect(inputElement).toHaveAttribute("aria-checked", "mixed");
  });

  test("component required has proper ARIA attributes", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox required="{true}" />`, {});
    const driver = await createFormItemDriver();
    const inputElement = driver.input;
    await expect(inputElement).toHaveAttribute("aria-required", "true");
  });

  test("component disabled has proper ARIA attributes", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox enabled="{false}" />`, {});
    const driver = await createFormItemDriver();
    const inputElement = driver.input;
    await expect(inputElement).toHaveAttribute("aria-disabled", "true");
  });

  // =============================================================================
  // LABEL POSITIONING TESTS
  // =============================================================================

  test("component labelPosition=start positions label before input", async ({
    initTestBed,
    createFormItemDriver,
    createCheckboxDriver,
    createLabelDriver,
  }) => {
    await initTestBed(`<Checkbox direction="ltr" label="Accept terms" labelPosition="start" />`);
    const driver = await createFormItemDriver();
    const labelDriver = await createLabelDriver(driver.label);
    const checkboxDriver = await createCheckboxDriver(driver.checkbox);
    const { left: checkboxLeft, right: checkboxRight } = await checkboxDriver.getComponentBounds();
    const { left: labelLeft, right: labelRight } = await labelDriver.getComponentBounds();

    // Verify the component renders successfully with start position
    await expect(driver.label).toBeVisible();
    await expect(driver.checkbox).toBeVisible();
    expect(labelLeft).toBeLessThan(checkboxLeft);
    expect(labelRight).toBeLessThan(checkboxRight);
  });

  test("component labelPosition=end positions label after input", async ({
    initTestBed,
    createFormItemDriver,
    createLabelDriver,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox direction="ltr" label="Accept terms" labelPosition="end" />`, {});
    const driver = await createFormItemDriver();
    const labelDriver = await createLabelDriver(driver.label);
    const checkboxDriver = await createCheckboxDriver(driver.checkbox);
    const { left: checkboxLeft, right: checkboxRight } = await checkboxDriver.getComponentBounds();
    const { left: labelLeft, right: labelRight } = await labelDriver.getComponentBounds();

    // Verify the component renders successfully with end position
    await expect(driver.label).toBeVisible();
    await expect(driver.input).toBeVisible();
    expect(labelLeft).toBeGreaterThan(checkboxLeft);
    expect(labelRight).toBeGreaterThan(checkboxRight);
  });

  test("component labelPosition=top positions label above input", async ({
    initTestBed,
    createFormItemDriver,
    createLabelDriver,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" labelPosition="top" />`, {});
    const driver = await createFormItemDriver();
    const labelDriver = await createLabelDriver(driver.label);
    const checkboxDriver = await createCheckboxDriver(driver.checkbox);
    const { top: checkboxTop, bottom: checkboxBottom } = await checkboxDriver.getComponentBounds();
    const { top: labelTop, bottom: labelBottom } = await labelDriver.getComponentBounds();

    // Verify the component renders successfully with top position
    await expect(driver.label).toBeVisible();
    await expect(driver.input).toBeVisible();
    expect(labelTop).toBeLessThan(checkboxTop);
    expect(labelBottom).toBeLessThan(checkboxBottom);
  });

  test("component labelPosition=bottom positions label below input", async ({
    initTestBed,
    createFormItemDriver,
    createLabelDriver,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" labelPosition="bottom" />`, {});
    const driver = await createFormItemDriver();
    const labelDriver = await createLabelDriver(driver.label);
    const checkboxDriver = await createCheckboxDriver(driver.checkbox);
    const { top: checkboxTop, bottom: checkboxBottom } = await checkboxDriver.getComponentBounds();
    const { top: labelTop, bottom: labelBottom } = await labelDriver.getComponentBounds();

    // Verify the component renders successfully with bottom position
    await expect(driver.label).toBeVisible();
    await expect(driver.input).toBeVisible();
    expect(labelTop).toBeGreaterThan(checkboxTop);
    expect(labelBottom).toBeGreaterThan(checkboxBottom);
  });

  test("component labelWidth applies custom label width", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" labelWidth="200px" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.label).toHaveCSS("width", "200px");
  });

  test("component labelBreak enables label line breaks", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(
      `<Checkbox label="Very long label text that should break" labelBreak="{true}" />`,
      {},
    );
    const driver = await createFormItemDriver();
    await expect(driver.label).toHaveCSS("white-space", "normal");
  });
});

test.describe("VALIDATION STATUS TESTS", () => {
  test("component validationStatus=error shows error styling", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox validationStatus="error" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toHaveClass(/error/);
  });

  test("component validationStatus=warning shows warning styling", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox validationStatus="warning" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toHaveClass(/warning/);
  });

  test("component validationStatus=valid shows valid styling", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox validationStatus="valid" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toHaveClass(/valid/);
  });

  test.skip("component validation status maintains functionality", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // TODO: Fix selector issue - driver.input is not finding the checkbox input correctly
    await initTestBed(`<Checkbox validationStatus="error" label="Error checkbox" />`, {});
    const driver = await createFormItemDriver();

    // Component should still be functional despite error status
    await expect(driver.component).toBeVisible();
    await expect(driver.input).not.toBeChecked();

    // Should still be clickable
    await driver.input.click();
    await expect(driver.input).toBeChecked();
  });

  test("component validation status with required state", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    await initTestBed(`<Checkbox validationStatus="error" required="{true}" />`, {});
    const driver = await createFormItemDriver();

    await expect(driver.component).toHaveClass(/error/);
    await expect(driver.input).toHaveAttribute("required");
  });
});
// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling Tests", () => {
  test("component didChange event fires on state change", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onDidChange="testState = 'changed'" />`,
      {},
    );
    const driver = await createFormItemDriver();

    await driver.input.click();
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("component didChange event passes new value", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onDidChange="(value) => testState = value" />`,
      {},
    );
    const driver = await createFormItemDriver();

    await driver.input.click();
    await expect.poll(testStateDriver.testState).toEqual(true);

    await driver.input.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("component gotFocus event fires on focus", async ({ initTestBed, createFormItemDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onGotFocus="testState = 'focused'" />`,
      {},
    );
    const driver = await createFormItemDriver();

    await driver.input.focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, createFormItemDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onLostFocus="testState = 'blurred'" />`,
      {},
    );
    const driver = await createFormItemDriver();

    await driver.input.focus();
    await driver.input.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("component events work with validation status", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `
    <Checkbox
      validationStatus="error"
      onDidChange="testState = 'error-changed'"
    />
  `,
      {},
    );
    const driver = await createFormItemDriver();

    await driver.input.click();
    await expect.poll(testStateDriver.testState).toEqual("error-changed");
    await expect(driver.component).toHaveClass(/error/);
  });
});

test.describe("CUSTOM INPUT TEMPLATE TESTS", () => {
  test("component inputTemplate renders custom input", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    // Test that inputTemplate prop renders custom input element
    await initTestBed(`
      <Checkbox>
        <Button id="custom-checkbox" />
      </Checkbox>
    `);
    const driver = await createCheckboxDriver();
    await expect(driver.component.getByTestId("custom-checkbox")).toBeVisible();
  });

  test.skip("component inputTemplate maintains functionality", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that custom input template maintains checkbox functionality
    // const { testStateDriver } = await initTestBed(`
    //   <Checkbox didChange="testState = 'custom-changed'">
    //     <input type="checkbox" class="custom-checkbox" />
    //   </Checkbox>
    // `, {});
    // const driver = await createFormItemDriver();
    // await driver.component.locator(".custom-checkbox").click();
    // await expect.poll(testStateDriver.testState).toEqual("custom-changed");
  });

  test.skip("component inputTemplate with complex markup", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that inputTemplate can contain complex markup
    // await initTestBed(`
    //   <Checkbox>
    //     <div class="custom-wrapper">
    //       <input type="checkbox" class="custom-checkbox" />
    //       <span class="custom-indicator"></span>
    //     </div>
    //   </Checkbox>
    // `, {});
    // const driver = await createFormItemDriver();
    // await expect(driver.component.locator(".custom-wrapper")).toBeVisible();
    // await expect(driver.component.locator(".custom-indicator")).toBeVisible();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("theme variables", () => {
  test.skip("component applies theme backgroundColor", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme backgroundColor applies to checkbox
    // await initTestBed(`<Checkbox />`, {
    //   testThemeVars: {
    //     "backgroundColor-Checkbox": "rgb(255, 0, 0)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test.skip("component applies theme borderColor", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme borderColor applies to checkbox
    // await initTestBed(`<Checkbox />`, {
    //   testThemeVars: {
    //     "borderColor-Checkbox": "rgb(0, 255, 0)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test.skip("component applies theme checked backgroundColor", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme checked backgroundColor applies
    // await initTestBed(`<Checkbox initialValue="true" />`, {
    //   testThemeVars: {
    //     "backgroundColor-checked-Checkbox": "rgb(0, 0, 255)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("background-color", "rgb(0, 0, 255)");
  });

  test.skip("component applies theme checked borderColor", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme checked borderColor applies
    // await initTestBed(`<Checkbox initialValue="true" />`, {
    //   testThemeVars: {
    //     "borderColor-checked-Checkbox": "rgb(255, 255, 0)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("border-color", "rgb(255, 255, 0)");
  });

  test.skip("component applies theme error validation colors", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme error validation colors apply
    // await initTestBed(`<Checkbox validationStatus="error" initialValue="true" />`, {
    //   testThemeVars: {
    //     "borderColor-checked-Checkbox-error": "rgb(255, 0, 0)",
    //     "backgroundColor-checked-Checkbox-error": "rgb(255, 0, 0)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("border-color", "rgb(255, 0, 0)");
    // await expect(driver.input).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test.skip("component applies theme warning validation colors", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme warning validation colors apply
    // await initTestBed(`<Checkbox validationStatus="warning" initialValue="true" />`, {
    //   testThemeVars: {
    //     "borderColor-checked-Checkbox-warning": "rgb(255, 165, 0)",
    //     "backgroundColor-checked-Checkbox-warning": "rgb(255, 165, 0)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("border-color", "rgb(255, 165, 0)");
    // await expect(driver.input).toHaveCSS("background-color", "rgb(255, 165, 0)");
  });

  test.skip("component applies theme success validation colors", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme success validation colors apply
    // await initTestBed(`<Checkbox validationStatus="success" initialValue="true" />`, {
    //   testThemeVars: {
    //     "borderColor-checked-Checkbox-success": "rgb(0, 255, 0)",
    //     "backgroundColor-checked-Checkbox-success": "rgb(0, 255, 0)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("border-color", "rgb(0, 255, 0)");
    // await expect(driver.input).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test.skip("component applies theme disabled background color", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme disabled background color applies
    // await initTestBed(`<Checkbox enabled="false" />`, {
    //   testThemeVars: {
    //     "backgroundColor-Checkbox--disabled": "rgb(128, 128, 128)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // await expect(driver.input).toHaveCSS("background-color", "rgb(128, 128, 128)");
  });

  test.skip("component applies theme indicator background color", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that theme indicator background color applies
    // await initTestBed(`<Checkbox initialValue="true" />`, {
    //   testThemeVars: {
    //     "backgroundColor-indicator-Checkbox": "rgb(255, 255, 255)",
    //   },
    // });
    // const driver = await createFormItemDriver();
    // const indicator = driver.component.locator(".checkbox-indicator");
    // await expect(indicator).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null and undefined props gracefully", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test with minimal props
    await initTestBed(`<Checkbox />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.input).toBeVisible();
  });

  test("component handles special characters in label", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that component handles special characters in label
    await initTestBed(`<Checkbox label="Accept terms &amp; conditions &lt;&gt;&amp;" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.label).toContainText("Accept terms & conditions <>&");
  });

  test("component handles Unicode characters in label", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that component handles Unicode characters
    await initTestBed(`<Checkbox label="同意条款 ✓" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.label).toContainText("同意条款 ✓");
  });

  test("component handles very long label text", async ({ initTestBed, createFormItemDriver }) => {
    // Test that component handles very long label text
    const longLabel =
      "This is a very long label that might cause layout issues or overflow problems in the component rendering and should be handled gracefully by the component implementation";
    await initTestBed(`<Checkbox label="${longLabel}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.label).toContainText(longLabel);
    await expect(driver.component).toBeVisible();
  });

  test("component handles rapid state changes", async ({ initTestBed, createFormItemDriver }) => {
    // Test that component handles rapid state changes
    await initTestBed(`<Checkbox />`, {});
    const driver = await createFormItemDriver();

    // Perform 10 rapid clicks
    for (let i = 0; i < 10; i++) {
      await driver.input.click();
    }
    // Should end up unchecked after 10 clicks (even number)
    await expect(driver.input).not.toBeChecked();
  });

  test("component handles boolean false as initialValue", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that component properly handles explicit false
    await initTestBed(`<Checkbox initialValue="{false}" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.input).not.toBeChecked();
  });

  test("component handles indeterminate with other states", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test indeterminate with other properties
    await initTestBed(`<Checkbox indeterminate="{true}" required="{true}" />`, {});
    const driver = await createFormItemDriver();

    const isIndeterminate = await driver.input.evaluate((el: HTMLInputElement) => el.indeterminate);
    expect(isIndeterminate).toBe(true);
    await expect(driver.input).toHaveAttribute("required");
  });

  test("component handles invalid validationStatus gracefully", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that component handles invalid validationStatus without crashing
    await initTestBed(`<Checkbox validationStatus="invalid" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toBeVisible();
    // Should not have any validation classes for invalid status
    await expect(driver.component).not.toHaveClass(/error/);
    await expect(driver.component).not.toHaveClass(/warning/);
    await expect(driver.component).not.toHaveClass(/valid/);
  });

  test("component handles invalid labelPosition gracefully", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that component handles invalid labelPosition without crashing
    await initTestBed(`<Checkbox labelPosition="invalid" label="Test label" />`, {});
    const driver = await createFormItemDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.label).toBeVisible();
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test.skip("component value API returns current state", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that value API returns current checkbox state
    // await initTestBed(`<Checkbox initialValue="true" />`, {});
    // const driver = await createFormItemDriver();
    //
    // // Test API access (this would need to be implemented based on actual API)
    // const value = await driver.component.evaluate(el => el.value);
    // expect(value).toBe(true);
  });

  test.skip("component setValue API updates state", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that setValue API updates checkbox state
    // await initTestBed(`<Checkbox />`, {});
    // const driver = await createFormItemDriver();
    //
    // // Test API access (this would need to be implemented based on actual API)
    // await driver.component.evaluate(el => el.setValue(true));
    // await expect(driver.input).toBeChecked();
  });

  test.skip("component setValue API triggers events", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that setValue API triggers appropriate events
    // const { testStateDriver } = await initTestBed(`<Checkbox didChange="testState = 'api-changed'" />`, {});
    // const driver = await createFormItemDriver();
    //
    // // Test API access (this would need to be implemented based on actual API)
    // await driver.component.evaluate(el => el.setValue(true));
    // await expect.poll(testStateDriver.testState).toEqual("api-changed");
  });

  test.skip("component APIs work with validation", async ({
    initTestBed,
    createFormItemDriver,
  }) => {
    // Test that APIs work correctly with validation
    // await initTestBed(`<Checkbox validationStatus="error" />`, {});
    // const driver = await createFormItemDriver();
    //
    // // Test API access with validation
    // await driver.component.evaluate(el => el.setValue(true));
    // await expect(driver.input).toBeChecked();
    // await expect(driver.component).toHaveClass(/error/);
  });
});
