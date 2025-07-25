import { getBounds, isIndeterminate, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox />`);
    await expect(page.getByRole("checkbox")).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="test" />`);
    await expect(page.getByLabel("test")).toBeVisible();
  });

  test("initialValue sets checked state", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox initialValue="true" />`);
    await expect(page.getByRole("checkbox")).toBeChecked();
  });

  test("initialValue=false sets unchecked state", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox initialValue="false" />`);
    await expect(page.getByRole("checkbox")).not.toBeChecked();
  });

  test("indeterminate state", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox indeterminate="true" />`);
    const indeterminate = await isIndeterminate(page.getByRole("checkbox"));
    expect(indeterminate).toBe(true);
  });

  test("indeterminate state with initialValue=true", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox indeterminate="true" initialValue="true" />`);
    const checkbox = page.getByRole("checkbox");
    const indeterminate = await isIndeterminate(checkbox);
    expect(indeterminate).toBe(true);
    await expect(checkbox).toBeChecked();
  });

  test("indeterminate state with initialValue=false", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox indeterminate="true" initialValue="false" />`);
    const checkbox = page.getByRole("checkbox");
    const indeterminate = await isIndeterminate(checkbox);
    expect(indeterminate).toBe(true);
    await expect(checkbox).not.toBeChecked();
  });

  test("component click toggles checked state", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox />`);
    const checkbox = page.getByRole("checkbox");

    // Initially unchecked
    await expect(checkbox).not.toBeChecked();

    // Click to check
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    // Click again to uncheck
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
  });

  test("component required prop adds required attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox required="true" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox enabled="false" />`);
    await expect(page.getByRole("checkbox")).toBeDisabled();
  });

  test("enabled=false disables interaction", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox enabled="false" initialValue="false" />`);
    const checkbox = page.getByRole("checkbox");
    checkbox.click({ force: true });
    await expect(checkbox).not.toBeChecked();
  });

  test("readOnly", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox readOnly="true" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("readonly");
  });

  test("readOnly prevents state changes", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox readOnly="true" initialValue="false" />`);
    const checkbox = page.getByRole("checkbox");
    checkbox.click({ force: true });
    await expect(checkbox).not.toBeChecked();
  });

  test("readOnly is not the same as disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox readOnly="true" enabled="true" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("readonly");
    await expect(page.getByRole("checkbox")).not.toBeDisabled();
  });

  test("autoFocus focuses input on mount", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox autoFocus="{true}" />`);
    await expect(page.getByRole("checkbox")).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox autoFocus="{true}" label="test" />`);
    await expect(page.getByRole("checkbox")).toBeFocused();
  });

  test("handle special characters in label", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="Accept terms &amp; conditions &lt;&gt;&amp;" />`);
    await expect(page.locator("label")).toContainText("Accept terms & conditions <>&");
  });

  test("handle Unicode characters in label", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="同意条款 ✓" />`);
    await expect(page.locator("label")).toContainText("同意条款 ✓");
  });

  test("component handles very long label text", async ({ initTestBed, page }) => {
    const longLabel =
      "This is a very long label that might cause layout issues or overflow problems " +
      "in the component rendering and should be handled gracefully by the component implementation";
    await initTestBed(`<Checkbox label="${longLabel}" />`);
    await expect(page.locator("label")).toContainText(longLabel);
  });

  test("component handles rapid state changes", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox initialValue="false" />`);
    const checkbox = page.getByRole("checkbox");
    await checkbox.click({ clickCount: 10 });
    await expect(checkbox).not.toBeChecked();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("label is associated with input", async ({ initTestBed, page }) => {
    const label = "test";
    await initTestBed(`<Checkbox label="${label}" />`);
    const component = page.getByLabel(label, { exact: true });
    expect(component).toHaveRole("checkbox");
  });

  test("pressing Space after focus checks the control", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox initialValue="false" />`);
    const checkbox = page.getByRole("checkbox");
    await checkbox.focus();
    await expect(checkbox).toBeFocused();
    await checkbox.press("Space");
    await expect(checkbox).toBeChecked();
  });

  test("component supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox />`);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("checkbox")).toBeFocused();
  });

  test("aria-checked=false applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("aria-checked", "false");
  });

  test("aria-checked=true applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="Accept terms" />`);
    const checkbox = page.getByRole("checkbox");
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  test("indeterminate has correct ARIA state", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox indeterminate="{true}" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  test("required has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox required="{true}" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("aria-required", "true");
  });

  test("component disabled has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox enabled="{false}" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("aria-disabled", "true");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox direction="ltr" label="test" labelPosition="start" />`);

    const { left: checkboxLeft } = await getBounds(page.getByLabel("test"));
    const { right: labelRight } = await getBounds(page.getByText("test"));

    expect(labelRight).toBeLessThan(checkboxLeft);
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox direction="ltr" label="test" labelPosition="end" />`);

    const { right: checkboxRight } = await getBounds(page.getByLabel("test"));
    const { left: labelLeft } = await getBounds(page.getByText("test"));

    expect(labelLeft).toBeGreaterThan(checkboxRight);
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="test" labelPosition="top" />`);

    const { top: checkboxTop } = await getBounds(page.getByLabel("test"));
    const { bottom: labelBottom } = await getBounds(page.getByText("test"));

    expect(labelBottom).toBeLessThan(checkboxTop);
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox label="test" labelPosition="bottom" />`);

    const { bottom: checkboxBottom } = await getBounds(page.getByLabel("test"));
    const { top: labelTop } = await getBounds(page.getByText("test"));

    expect(labelTop).toBeGreaterThan(checkboxBottom);
  });

  test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    const expected = 200;
    await initTestBed(`<Checkbox label="test test" labelWidth="${expected}px" />`);
    const { width } = await getBounds(page.getByText("test test"));
    expect(width).toEqual(expected);
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
    const labelText = "Very long label text that should break";
    const commonProps = `label="${labelText}" labelWidth="100px"`;
    await initTestBed(
      `<Fragment>
        <Checkbox ${commonProps} testId="break" labelBreak="{true}" />
        <Checkbox ${commonProps} testId="oneLine" labelBreak="{false}" />
      </Fragment>`,
    );
    const labelBreak = page.getByTestId("break").getByText(labelText, { exact: true });
    const labelOneLine = page.getByTestId("oneLine").getByText(labelText, { exact: true });
    const { height: heightBreak } = await getBounds(labelBreak);
    const { height: heightOneLine } = await getBounds(labelOneLine);

    expect(heightBreak).toBeGreaterThan(heightOneLine);
  });

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox labelPosition="invalid" label="test" />`);
    await expect(page.getByLabel("test")).toBeVisible();
    await expect(page.getByText("test")).toBeVisible();
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
  test("didChange event fires on state change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox initialValue="false" onDidChange="testState = 'changed'" />`,
    );
    await page.getByRole("checkbox").check();
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox initialValue="false" onDidChange="(value) => testState = value" />`,
    );
    const checkbox = page.getByRole("checkbox");
    await checkbox.check();
    await expect.poll(testStateDriver.testState).toEqual(true);
    await checkbox.uncheck();
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onGotFocus="testState = 'focused'" />`,
    );
    await page.getByRole("checkbox").focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("component lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Checkbox onLostFocus="testState = 'blurred'" />`,
    );
    await page.getByRole("checkbox").focus();
    await page.getByRole("checkbox").blur();
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
