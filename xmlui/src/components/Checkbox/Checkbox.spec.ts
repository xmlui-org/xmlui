import { getBounds, getHtmlAttributes, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default props", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Checkbox />`);
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.field).toHaveAttribute("type", "checkbox");
  });

  test("component renders with label", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.label).toBeVisible();
    await expect(driver.label).toContainText("Accept terms");
  });

  test("component initialValue sets checked state", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox initialValue="{true}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).toBeChecked();
  });

  test("component initialValue=false sets unchecked state", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox initialValue="{false}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).not.toBeChecked();
  });

  test.fixme(
    "component indeterminate state displays correctly",
    SKIP_REASON.TEST_NOT_WORKING("Html attribute not showing up"),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox indeterminate="{true}" />`);
      const driver = await createCheckboxDriver();
      // TODO: test this function
      //const { indeterminate } = await getHtmlAttributes(driver.field, "indeterminate");
      console.log(await driver.field.getAttribute("indeterminate"));
      const isIndeterminate = await driver.field.evaluate(
        (el: HTMLInputElement) => el.indeterminate,
      );
      expect(isIndeterminate).toBe(true);
    },
  );

  test("component click toggles checked state", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Checkbox />`);
    const driver = await createCheckboxDriver();

    // Initially unchecked
    await expect(driver.field).not.toBeChecked();

    // Click to check
    await driver.field.click();
    await expect(driver.field).toBeChecked();

    // Click again to uncheck
    await driver.field.click();
    await expect(driver.field).not.toBeChecked();
  });

  test("component required prop adds required attribute", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox required="{true}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).toHaveAttribute("required");
  });

  test("component enabled=false disables interaction", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox enabled="{false}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).toBeDisabled();
  });

  test("component readOnly prevents state changes", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox readOnly="{true}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).toHaveAttribute("readonly");

    // Verify that clicking doesn't change the state
    const initialChecked = await driver.field.isChecked();
    await driver.field.click();
    const afterClickChecked = await driver.field.isChecked();
    expect(afterClickChecked).toBe(initialChecked);
  });

  test.fixme(
    "component autoFocus focuses input on mount",
    SKIP_REASON.TEST_NOT_WORKING("Times out on the assertion"),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox autoFocus="{true}" />`);
      const driver = await createCheckboxDriver();
      await expect(driver.component).toBeFocused();
    },
  );

  test("component handles special characters in label", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    // Test that component handles special characters in label
    await initTestBed(`<Checkbox label="Accept terms &amp; conditions &lt;&gt;&amp;" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.label).toContainText("Accept terms & conditions <>&");
  });

  test("component handles Unicode characters in label", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    // Test that component handles Unicode characters
    await initTestBed(`<Checkbox label="同意条款 ✓" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.label).toContainText("同意条款 ✓");
  });

  test("component handles very long label text", async ({ initTestBed, createCheckboxDriver }) => {
    // Test that component handles very long label text
    const longLabel =
      "This is a very long label that might cause layout issues or overflow problems " +
      "in the component rendering and should be handled gracefully by the component implementation";
    await initTestBed(`<Checkbox label="${longLabel}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.label).toContainText(longLabel);
    await expect(driver.component).toBeVisible();
  });

  test("component handles rapid state changes", async ({ initTestBed, createCheckboxDriver }) => {
    // Test that component handles rapid state changes
    await initTestBed(`<Checkbox />`);
    const driver = await createCheckboxDriver();

    // Perform 10 rapid clicks
    for (let i = 0; i < 10; i++) {
      await driver.click();
    }
    // Should end up unchecked after 10 clicks (even number)
    await expect(driver.field).not.toBeChecked();
  });

  test("component handles boolean false as initialValue", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    // Test that component properly handles explicit false
    await initTestBed(`<Checkbox initialValue="{false}" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).not.toBeChecked();
  });

  test.fixme(
    "component handles indeterminate with other states",
    SKIP_REASON.TEST_NOT_WORKING("Attribute not showing up"),
    async ({ initTestBed, createCheckboxDriver }) => {
      // Test indeterminate with other properties
      await initTestBed(`<Checkbox indeterminate="{true}" required="{true}" />`);
      const driver = await createCheckboxDriver();

      const isIndeterminate = await driver.field.evaluate(
        (el: HTMLInputElement) => el.indeterminate,
      );
      expect(isIndeterminate).toBe(true);
      await expect(driver.field).toHaveAttribute("required");
    },
  );
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).toHaveAttribute("type", "checkbox");
    await expect(driver.field).toHaveAttribute("role", "checkbox");
  });

  test("component label is associated with input", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    const driver = await createCheckboxDriver();
    const inputId = await driver.field.getAttribute("id");
    await expect(driver.label).toHaveAttribute("for", inputId);
  });

  test("component is keyboard accessible", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    const field = (await createCheckboxDriver()).field;
    await field.focus();
    await expect(field).toBeFocused();
    await field.press("Space");
    await expect(field).toBeChecked();
  });

  test.fixme(
    "component supports keyboard navigation",
    SKIP_REASON.TEST_NOT_WORKING("Tab not working"),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox label="Accept terms" />`);
      const driver = await createCheckboxDriver();
      const field = driver.component;
      await field.press("Tab");
      await expect(field).toBeFocused();
    },
  );

  test("component has proper ARIA states", async ({ initTestBed, createCheckboxDriver }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    const field = (await createCheckboxDriver()).field;
    await expect(field).toHaveAttribute("aria-checked", "false");
    await field.click();
    await expect(field).toHaveAttribute("aria-checked", "true");
  });

  test.fixme(
    "component indeterminate has correct ARIA state",
    SKIP_REASON.TEST_NOT_WORKING("Attribute not showing up"),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox indeterminate="{true}" />`);
      await expect((await createCheckboxDriver()).field).toHaveAttribute("aria-checked", "mixed");
    },
  );

  test("component required has proper ARIA attributes", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox required="{true}" />`);
    await expect((await createCheckboxDriver()).field).toHaveAttribute("aria-required", "true");
  });

  test("component disabled has proper ARIA attributes", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox enabled="{false}" />`);
    await expect((await createCheckboxDriver()).field).toHaveAttribute("aria-disabled", "true");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("component labelPosition=start positions label before input", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox direction="ltr" label="test" labelPosition="start" />`);
    const driver = await createCheckboxDriver();
    const { left: checkboxLeft, right: checkboxRight } = await getBounds(driver.field);
    const { left: labelLeft, right: labelRight } = await getBounds(driver.label);

    // Verify the component renders successfully with start position
    await expect(driver.label).toBeVisible();
    await expect(driver.field).toBeVisible();
    expect(labelLeft).toBeLessThan(checkboxLeft);
    expect(labelRight).toBeLessThan(checkboxRight);
  });

  test("component labelPosition=end positions label after input", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox direction="ltr" label="test" labelPosition="end" />`);
    const driver = await createCheckboxDriver();
    const { left: checkboxLeft, right: checkboxRight } = await getBounds(driver.field);
    const { left: labelLeft, right: labelRight } = await getBounds(driver.label);

    // Verify the component renders successfully with end position
    await expect(driver.label).toBeVisible();
    await expect(driver.field).toBeVisible();
    expect(labelLeft).toBeGreaterThan(checkboxLeft);
    expect(labelRight).toBeGreaterThan(checkboxRight);
  });

  test("component labelPosition=top positions label above input", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox label="test" labelPosition="top" />`);
    const driver = await createCheckboxDriver();
    const { top: checkboxTop, bottom: checkboxBottom } = await getBounds(driver.field);
    const { top: labelTop, bottom: labelBottom } = await getBounds(driver.label);

    // Verify the component renders successfully with top position
    await expect(driver.label).toBeVisible();
    await expect(driver.field).toBeVisible();
    expect(labelTop).toBeLessThan(checkboxTop);
    expect(labelBottom).toBeLessThan(checkboxBottom);
  });

  test("component labelPosition=bottom positions label below input", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox label="test" labelPosition="bottom" />`);
    const driver = await createCheckboxDriver();
    const { top: checkboxTop, bottom: checkboxBottom } = await getBounds(driver.field);
    const { top: labelTop, bottom: labelBottom } = await getBounds(driver.label);

    // Verify the component renders successfully with bottom position
    await expect(driver.label).toBeVisible();
    await expect(driver.field).toBeVisible();
    expect(labelTop).toBeGreaterThan(checkboxTop);
    expect(labelBottom).toBeGreaterThan(checkboxBottom);
  });

  test("component labelWidth applies custom label width", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    const expected = 200;
    await initTestBed(`<Checkbox label="Accept terms" labelWidth="${expected}px" />`);
    const driver = await createCheckboxDriver();
    const { width } = await getBounds(driver.label);
    expect(width).toEqual(expected);
  });

  test.fixme(
    "component labelBreak enables label line breaks",
    SKIP_REASON.TO_BE_IMPLEMENTED("Not how to test this"),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(
        `<Checkbox label="Very long label text that should break" labelBreak="{true}" />`,
      );
      const driver = await createCheckboxDriver();
      await expect(driver.label).toHaveCSS("white-space", "normal");
    },
  );

  test("component handles invalid labelPosition gracefully", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    // Test that component handles invalid labelPosition without crashing
    await initTestBed(`<Checkbox labelPosition="invalid" label="Test label" />`);
    const driver = await createCheckboxDriver();
    await expect(driver.field).toBeVisible();
    await expect(driver.label).toBeVisible();
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test.skip(
    "component validationStatus=error shows error styling",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox validationStatus="error" />`);
      const driver = await createCheckboxDriver();
      await expect(driver.component).toHaveClass(/error/);
    },
  );

  test.skip(
    "checked component validationStatus=error shows error styling",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {},
  );

  test.skip(
    "component validationStatus=warning shows warning styling",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox validationStatus="warning" />`);
      const driver = await createCheckboxDriver();
      await expect(driver.component).toHaveClass(/warning/);
    },
  );

  test.skip(
    "checked component validationStatus=warning shows error styling",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {},
  );

  test.skip(
    "component validationStatus=valid shows valid styling",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox validationStatus="valid" />`);
      const driver = await createCheckboxDriver();
      await expect(driver.component).toHaveClass(/valid/);
    },
  );

  test.skip(
    "checked component validationStatus=valid shows error styling",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {},
  );

  test.skip(
    "component handles invalid validationStatus gracefully",
    SKIP_REASON.TO_BE_IMPLEMENTED("Fix implementation"),
    async ({ initTestBed, createCheckboxDriver }) => {
      // Test that component handles invalid validationStatus without crashing
      await initTestBed(`<Checkbox validationStatus="invalid" />`);
      const driver = await createCheckboxDriver();
      await expect(driver.component).toBeVisible();
      // Should not have any validation classes for invalid status
      await expect(driver.component).not.toHaveClass(/error/);
      await expect(driver.component).not.toHaveClass(/warning/);
      await expect(driver.component).not.toHaveClass(/valid/);
    },
  );

  /* test.skip(
    "component validation status maintains functionality",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {
      // TODO: Fix selector issue - driver.input is not finding the checkbox input correctly
      await initTestBed(`<Checkbox validationStatus="error" label="Error checkbox" />`);
      const driver = await createCheckboxDriver();

      // Component should still be functional despite error status
      await expect(driver.component).toBeVisible();
      await expect(driver.input).not.toBeChecked();

      // Should still be clickable
      await driver.input.click();
      await expect(driver.input).toBeChecked();
    },
  );

  test.skip(
    "component validation status with required state",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {
      await initTestBed(`<Checkbox validationStatus="error" required="{true}" />`);
      const driver = await createCheckboxDriver();

      await expect(driver.component).toHaveClass(/error/);
      await expect(driver.input).toHaveAttribute("required");
    },
  ); */
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("component didChange event fires on state change", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onDidChange="testState = 'changed'" />`,
    );
    const driver = await createCheckboxDriver();
    await driver.click();
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("component didChange event passes new value", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onDidChange="(value) => testState = value" />`,
    );
    const driver = await createCheckboxDriver();

    await driver.click();
    await expect.poll(testStateDriver.testState).toEqual(true);
    await driver.click();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("component gotFocus event fires on focus", async ({ initTestBed, createCheckboxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onGotFocus="testState = 'focused'" />`,
    );
    const driver = await createCheckboxDriver();

    await driver.focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, createCheckboxDriver }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onLostFocus="testState = 'blurred'" />`,
    );
    const driver = await createCheckboxDriver();

    await driver.focus();
    await driver.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
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

// =============================================================================
// CUSTOM INPUT TEMPLATE TESTS
// =============================================================================

test.describe("Custom inputTemplate", () => {
  test.skip(
    "component inputTemplate renders custom input",
    SKIP_REASON.XMLUI_BUG("setting inputTemplate throws error"),
    async ({ initTestBed, createButtonDriver }) => {
      //   await initTestBed(`
      //   <Checkbox>
      //     <Button id="custom-checkbox" />
      //   </Checkbox>
      // `);
      // const driver = await createButtonDriver("custom-checkbox");
      // await expect(driver.component).toBeVisible();
    },
  );

  test.skip(
    "component inputTemplate maintains functionality",
    SKIP_REASON.XMLUI_BUG("setting inputTemplate throws error"),
    async ({ initTestBed, createFormItemDriver }) => {
      // Test that custom input template maintains checkbox functionality
      // const { testStateDriver } = await initTestBed(`
      //   <Checkbox didChange="testState = 'custom-changed'">
      //     <input type="checkbox" class="custom-checkbox" />
      //   </Checkbox>
      // `, {});
      // const driver = await createFormItemDriver();
      // await driver.component.locator(".custom-checkbox").click();
      // await expect.poll(testStateDriver.testState).toEqual("custom-changed");
    },
  );

  test.skip(
    "component inputTemplate with complex markup",
    SKIP_REASON.XMLUI_BUG("setting inputTemplate throws error"),
    async ({ initTestBed, createFormItemDriver }) => {
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
    },
  );
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme variables", () => {
  test.skip(
    "component applies theme backgroundColor",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed, createCheckboxDriver }) => {},
  );

  test.skip("component applies theme borderColor", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme checked backgroundColor", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme checked borderColor", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme error validation colors", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme warning validation colors", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme success validation colors", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme disabled background color", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});

  test.skip("component applies theme indicator background color", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {});
});

// =============================================================================
// PERFORMANCE TESTS (This is a cool set of tests!)
// =============================================================================

// no memory leak, fast user input response, rapid prop change
