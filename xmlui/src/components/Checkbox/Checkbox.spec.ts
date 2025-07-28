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

  ["yes", 1].forEach((value) => {
    test.fixme(
      `initialValue accepts as string value: ${value}`,
      SKIP_REASON.UNSURE("These shouldn't work"),
      async ({ initTestBed, page }) => {
        await initTestBed(`<Checkbox initialValue="${value}" />`);
        await expect(page.getByRole("checkbox")).not.toBeChecked();
      },
    );
  });

  ["yes", 1, {}, { a: "b" }, [], [1, 2]].forEach((value) => {
    test.fixme(
      `initialValue does not accepts value: ${JSON.stringify(value)}`,
      SKIP_REASON.XMLUI_BUG("Inconsistent behaviour and inconsistent error messages"),
      async ({ initTestBed, page }) => {
        await initTestBed(`<Checkbox initialValue="{${value}}" />`);
        await expect(page.getByRole("checkbox")).not.toBeAttached();
      },
    );
  });

  test("initialValue accepts empty as false", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox initialValue="" />`);
    await expect(page.getByRole("checkbox")).not.toBeChecked();
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
    await checkbox.click({ force: true });
    await expect(checkbox).not.toBeChecked();
  });

  test("readOnly", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox readOnly="true" />`);
    await expect(page.getByRole("checkbox")).toHaveAttribute("readonly");
  });

  test("readOnly prevents state changes", async ({ initTestBed, page }) => {
    await initTestBed(`<Checkbox readOnly="true" initialValue="false" />`);
    const checkbox = page.getByRole("checkbox");
    await checkbox.click({ force: true });
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
    const component = page.getByLabel(label);
    await expect(component).toHaveRole("checkbox");
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
    await page.keyboard.press("Tab", { delay: 100 });
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

  test("required state has visual representation next to label", async ({
    initTestBed,
    createCheckboxDriver,
  }) => {
    await initTestBed(`<Checkbox required="{true}" label="test" />`);
    await expect((await createCheckboxDriver()).requiredIndicator).toBeVisible();
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
    const labelBreak = page.getByTestId("break").getByText(labelText);
    const labelOneLine = page.getByTestId("oneLine").getByText(labelText);
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
  test("component value API returns current state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Checkbox id="checkbox" initialValue="true" />
        <Text testId="value">{checkbox.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toContainText("true");
  });

  test("component value API returns state after change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Checkbox id="checkbox" initialValue="false" />
        <Text testId="value">{checkbox.value}</Text>
      </Fragment>
    `);
    await page.getByRole("checkbox").check();
    await expect(page.getByTestId("value")).toContainText("true");
  });

  test("component setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Checkbox id="checkbox" initialValue="false" />
        <Button onClick="checkbox.setValue(true)" testId="button">Check</Button>
      </Fragment>
    `);
    await page.getByRole("button").click();
    await expect(page.getByTestId("checkbox")).toBeChecked();
  });

  test("component setValue API triggers events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Checkbox id="checkbox" initialValue="false" onDidChange="testState = 'changed'" />
        <Button onClick="checkbox.setValue(true)" testId="button">Check</Button>
      </Fragment>
    `);
    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });
});

// =============================================================================
// CUSTOM INPUT TEMPLATE TESTS
// =============================================================================

test.describe("Custom inputTemplate", () => {
  test("inputTemplate renders custom input", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Checkbox>
        <property name="inputTemplate">
          <Button/>
        </property>
      </Checkbox>`);
    await expect(page.getByRole("button")).toBeVisible();
  });

  test.fixme(
    "inputTemplate without <property>",
    SKIP_REASON.XMLUI_BUG("Component throws error"),
    async ({ initTestBed, page }) => {
      await initTestBed(`
      <Checkbox>
        <Button/>
      </Checkbox>`);
      await expect(page.getByRole("button")).toBeVisible();
    },
  );

  test("inputTemplate fires didChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Checkbox onDidChange="testState = 'custom-changed'">
        <property name="inputTemplate">
          <Text testId="inner" value="asd" />
        </property>
      </Checkbox>
    `);
    await page.getByTestId("inner").click();
    await expect.poll(testStateDriver.testState).toEqual("custom-changed");
  });

  test("inputTemplate child can access $checked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Checkbox initialValue="true">
        <property name="inputTemplate">
          <Button testId="inner" label="{$checked}" />
        </property>
      </Checkbox>
    `);
    await expect(page.getByTestId("inner")).toContainText("true");
  });

  test("inputTemplate child can access $setChecked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Checkbox initialValue="true">
        <property name="inputTemplate">
          <Button testId="inner" onClick="() => $setChecked(false)" />
        </property>
      </Checkbox>
    `);
    await expect(page.getByRole("checkbox")).toBeChecked();
    await page.getByTestId("inner").click();
    await expect(page.getByRole("checkbox")).not.toBeChecked();
  });

  test("inputTemplate child can access $setChecked & $checked", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Checkbox initialValue="true">
        <property name="inputTemplate">
          <Button testId="inner" label="{$checked}" onClick="() => $setChecked(!$checked)" />
        </property>
      </Checkbox>
    `);
    await expect(page.getByRole("checkbox")).toBeChecked();
    await expect(page.getByTestId("inner")).toContainText("true");
    await page.getByTestId("inner").click();
    await expect(page.getByRole("checkbox")).not.toBeChecked();
    await expect(page.getByTestId("inner")).toContainText("false");
  });

  test("$checked has no meaning outside component", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Checkbox initialValue="true">
          <property name="inputTemplate">
            <Button testId="inner" label="{$checked}" />
          </property>
        </Checkbox>
        <Button testId="outer" label="{$checked}" />
      </Fragment>
    `);
    await expect(page.getByTestId("inner")).toContainText("true");
    await expect(page.getByTestId("outer")).toContainText("");
  });

  test("$setChecked has no meaning outside component", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Checkbox initialValue="true">
          <property name="inputTemplate">
            <Button testId="inner" label="{$checked}" />
          </property>
        </Checkbox>
        <Button testId="outer" onClick="() => $setChecked(!$checked)" />
      </Fragment>
    `);
    await expect(page.getByTestId("inner")).toContainText("true");
    await expect(page.getByTestId("outer")).toContainText("");
    await page.getByTestId("outer").click();
    await expect(page.getByTestId("inner")).toContainText("true");
    await expect(page.getByTestId("outer")).toContainText("");
  });

  test("inputTemplate didChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Checkbox initialValue="false" onDidChange="testState = 'custom-changed'">
        <property name="inputTemplate">
          <Button testId="inner" label="{$checked}" onClick="() => $setChecked(!$checked)" />
        </property>
      </Checkbox>
    `);
    await page.getByTestId("inner").click();
    await expect.poll(testStateDriver.testState).toEqual("custom-changed");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Vars", () => {
  test("checked borderColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox initialValue="true" />`, {
      testThemeVars: {
        "borderColor-checked-Checkbox": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test("checked backgroundColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox initialValue="true" />`, {
      testThemeVars: {
        "backgroundColor-checked-Checkbox": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
  });

  test("indicator backgroundColor", async ({ initTestBed, createCheckboxDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox initialValue="true" />`, {
      testThemeVars: {
        "backgroundColor-indicator-Checkbox": EXPECTED_COLOR,
      },
    });
    const driver = await createCheckboxDriver();
    const indicatorColor = await driver.getIndicatorColor();
    expect(indicatorColor).toEqual(EXPECTED_COLOR);
  });

  test("disabled backgroundColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-Checkbox--disabled": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
  });

  test("valid borderColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="valid" />`, {
      testThemeVars: {
        "borderColor-Checkbox-success": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test("valid backgroundColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="valid" />`, {
      testThemeVars: {
        "backgroundColor-Checkbox-success": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
  });

  test("warning borderColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="warning" />`, {
      testThemeVars: {
        "borderColor-Checkbox-warning": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test("warning backgroundColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="warning" />`, {
      testThemeVars: {
        "backgroundColor-Checkbox-warning": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
  });

  test("error borderColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="error" />`, {
      testThemeVars: {
        "borderColor-Checkbox-error": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test("error backgroundColor", async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="error" />`, {
      testThemeVars: {
        "backgroundColor-Checkbox-error": EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
  });

  test("borderRadius", async ({ initTestBed, page }) => {
    const CUSTOM_BORDER_RADIUS = "10px";
    await initTestBed(`<Checkbox />`, {
      testThemeVars: {
        "borderRadius-Checkbox": CUSTOM_BORDER_RADIUS,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("border-radius", CUSTOM_BORDER_RADIUS);
  });

  test("outlineWidth on focus", async ({ initTestBed, page }) => {
    const CUSTOM_OUTLINE_WIDTH = "10px";
    await initTestBed(`<Checkbox />`, {
      testThemeVars: {
        "outlineWidth-Checkbox": CUSTOM_OUTLINE_WIDTH,
      },
    });
    await page.getByRole("checkbox").focus();
    await expect(page.getByRole("checkbox")).toHaveCSS("outline-width", CUSTOM_OUTLINE_WIDTH);
  });

  test("outlineColor on focus", async ({ initTestBed, page }) => {
    const CUSTOM_OUTLINE_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox />`, {
      testThemeVars: {
        "outlineColor-Checkbox": CUSTOM_OUTLINE_COLOR,
      },
    });
    await page.getByRole("checkbox").focus();
    await expect(page.getByRole("checkbox")).toHaveCSS("outline-color", CUSTOM_OUTLINE_COLOR);
  });

  test("outlineOffset on focus", async ({ initTestBed, page }) => {
    const CUSTOM_OUTLINE_OFFSET = "10px";
    await initTestBed(`<Checkbox />`, {
      testThemeVars: {
        "outlineOffset-Checkbox": CUSTOM_OUTLINE_OFFSET,
      },
    });
    await page.getByRole("checkbox").focus();
    await expect(page.getByRole("checkbox")).toHaveCSS("outline-offset", CUSTOM_OUTLINE_OFFSET);
  });

  test("outlineStyle on focus", async ({ initTestBed, page }) => {
    const CUSTOM_OUTLINE_STYLE = "dotted";
    await initTestBed(`<Checkbox />`, {
      testThemeVars: {
        "outlineStyle-Checkbox": CUSTOM_OUTLINE_STYLE,
      },
    });
    await page.getByRole("checkbox").focus();
    await expect(page.getByRole("checkbox")).toHaveCSS("outline-style", CUSTOM_OUTLINE_STYLE);
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test(`validationStatus=error correctly displayed`, async ({ initTestBed, page }) => {
    const validationLevel = "error";
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="${validationLevel}" />`, {
      testThemeVars: {
        [`backgroundColor-Checkbox-${validationLevel}`]: EXPECTED_COLOR,
        [`borderColor-Checkbox-${validationLevel}`]: EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test(`validationStatus=warning correctly displayed`, async ({ initTestBed, page }) => {
    const validationLevel = "warning";
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="${validationLevel}" />`, {
      testThemeVars: {
        [`backgroundColor-Checkbox-${validationLevel}`]: EXPECTED_COLOR,
        [`borderColor-Checkbox-${validationLevel}`]: EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test(`validationStatus=valid correctly displayed`, async ({ initTestBed, page }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="valid" />`, {
      testThemeVars: {
        [`backgroundColor-Checkbox-success`]: EXPECTED_COLOR,
        [`borderColor-Checkbox-success`]: EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).toHaveCSS("background-color", EXPECTED_COLOR);
    await expect(page.getByRole("checkbox")).toHaveCSS("border-color", EXPECTED_COLOR);
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, page }) => {
    const validationLevel = "invalid";
    const NOT_EXPECTED_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Checkbox validationStatus="${validationLevel}" />`, {
      testThemeVars: {
        [`backgroundColor-Checkbox-${validationLevel}`]: NOT_EXPECTED_COLOR,
        [`borderColor-Checkbox-${validationLevel}`]: NOT_EXPECTED_COLOR,
      },
    });
    await expect(page.getByRole("checkbox")).not.toHaveCSS("background-color", NOT_EXPECTED_COLOR);
    await expect(page.getByRole("checkbox")).not.toHaveCSS("border-color", NOT_EXPECTED_COLOR);
  });
});

// =============================================================================
// PERFORMANCE TESTS (This is a cool set of tests!)
// =============================================================================

// no memory leak, fast user input response, rapid prop change
// TODO: Need to figure out how to do this
