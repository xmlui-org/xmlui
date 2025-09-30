import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Amount" />`);
    await expect(page.getByText("Amount")).toBeVisible();
  });

  // --- initialValue prop

  test("initialValue sets field value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="123" />`);
    await expect(page.getByRole("textbox")).toHaveValue("123");
  });

  [
    { label: "integer", value: "'{1}'", toExpect: "1" },
    { label: "float", value: "'{1.2}'", toExpect: "1.2" },
    { label: "undefined", value: "'{undefined}'", toExpect: "" },
    { label: "null", value: "'{null}'", toExpect: "" },
    { label: "empty string", value: "''", toExpect: "" },
    { label: "string that resolves to integer", value: "'1'", toExpect: "1" },
    { label: "string that resolves to float", value: "'1.2'", toExpect: "1.2" },
  ].forEach(({ label, value, toExpect }) => {
    test(`initialValue accepts ${label} type with ${value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox initialValue=${value} />`);
      await expect(page.getByRole("textbox")).toHaveValue(toExpect);
    });
  });

  // --- enabled prop

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox enabled="false" />`);
    await expect(page.getByRole("textbox")).toBeDisabled();
  });

  test("enabled=true enables control", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox enabled="true" />`);
    await expect(page.getByRole("textbox")).not.toBeDisabled();
  });

  test("disabled input field stops user interaction for spinbox", async ({
    initTestBed,
    createNumberBoxDriver,
    page,
  }) => {
    await initTestBed(`<NumberBox enabled="false" initialValue="5" />`);
    const driver = await createNumberBoxDriver();

    await driver.increment();
    await expect(driver.input).toHaveValue("5");
    await expect(driver.spinnerUp).toBeDisabled();

    await driver.decrement();
    await expect(driver.input).toHaveValue("5");
    await expect(driver.spinnerDown).toBeDisabled();
  });

  // --- readOnly prop

  test("readOnly adds readonly attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" initialValue="123" />`);
    const input = page.getByRole("textbox");
    await expect(input).toHaveAttribute("readonly");
  });

  test("readOnly input is not editable", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" initialValue="123" />`);
    const input = page.getByRole("textbox");
    await expect(input).not.toBeEditable();
  });

  test("readOnly input has value and can be focused", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" initialValue="123" />`);
    const input = page.getByRole("textbox");
    await expect(input).toHaveValue("123");
    await input.focus();
    await expect(input).toBeFocused();
  });

  // --- required prop

  test("required prop adds required attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox required="true" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
  });

  test("empty required NumberBox shows visual indicator", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="test" required="{true}" />`);
    await expect(page.getByText("test")).toContainText("*");
  });

  // --- autoFocus prop

  test("autoFocus focuses input on mount", async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox autoFocus="true" />`);
    const driver = await createNumberBoxDriver();
    await expect(driver.input).toBeFocused();
  });

  // --- placeholder prop

  test("placeholder shows when input is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox placeholder="Enter number..." />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("placeholder", "Enter number...");
  });

  test("placeholder does not appear if input is filled", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox placeholder="placeholder text" initialValue="123" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("placeholder", "placeholder text");
    await expect(page.getByRole("textbox", { name: "placeholder text" })).toBeVisible();
  });

  // --- maxLength prop

  test("maxLength limits input length", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox maxLength="3" />`);
    await page.getByRole("textbox").fill("12345");
    await expect(page.getByRole("textbox")).toHaveValue("123");
  });

  // --- User input testing

  test("component accepts user input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    await page.getByRole("textbox").fill("456");
    await expect(page.getByRole("textbox")).toHaveValue("456");
  });

  test("component clears input correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="123" />`);
    const input = page.getByRole("textbox");
    await expect(input).toHaveValue("123");
    await input.clear();
    await expect(input).toHaveValue("");
  });

  // --- hasSpinBox prop

  test("hasSpinBox=true renders spinbox", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox hasSpinBox="true" />`);
    // Look for spinner container or buttons
    const spinnerContainer = page.locator(".spinnerBox, .spinner, [class*='spin']").first();
    const spinButtons = page.locator("button");

    const hasSpinnerContainer = await spinnerContainer.isVisible().catch(() => false);
    const hasSpinButtons = (await spinButtons.count()) > 0;

    expect(hasSpinnerContainer || hasSpinButtons).toBe(true);
  });

  test("hasSpinBox=false hides spinbox", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox hasSpinBox="false" />`);
    // When hasSpinBox is false, spinner should not be visible
    const spinnerContainer = page.locator(".spinnerBox, .spinner, [class*='spin']").first();
    const spinButtons = page.locator("button");

    const hasSpinnerContainer = await spinnerContainer.isVisible().catch(() => false);
    const spinButtonCount = await spinButtons.count();

    expect(hasSpinnerContainer).toBe(false);
    expect(spinButtonCount).toBe(0);
  });

  // --- step prop with spinbox

  test("clicking spinbox up-arrow adds step value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="5" step="2" />`);
    const incrementButton = page.locator("button").first();

    await incrementButton.click();
    await expect(page.getByRole("textbox")).toHaveValue("7");
  });

  test("clicking spinbox down-arrow subtracts step value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="5" step="2" />`);
    const decrementButton = page.locator("button").nth(1);

    await decrementButton.click();
    await expect(page.getByRole("textbox")).toHaveValue("3");
  });

  test("invalid step values use default step", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="10" step="3.5" />`);
    const incrementButton = page.locator("button").first();
    await incrementButton.click();
    await expect(page.getByRole("textbox")).toHaveValue("13.5");
  });

  // --- Arrow key navigation

  test("pressing up arrow adds step value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="5" />`);
    const input = page.getByRole("textbox");
    await input.focus();
    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("6");
  });

  test("pressing down arrow subtracts step value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="5" />`);
    const input = page.getByRole("textbox");
    await input.focus();
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveValue("4");
  });

  // --- integersOnly prop

  test("integersOnly=true prevents decimal input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox integersOnly="true" />`);
    const input = page.getByRole("textbox");
    await input.fill("123.45");
    // Should not allow decimal point
    await expect(input).not.toHaveValue("123.45");
  });

  // --- zeroOrPositive prop

  test("zeroOrPositive=true prevents negative values", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox zeroOrPositive="true" initialValue="1" />`);
    const input = page.getByRole("textbox");
    const decrementButton = page.locator("button").nth(1);

    await decrementButton.click();
    expect(input).toHaveValue("0");

    await decrementButton.click();
    expect(input).toHaveValue("0");
  });

  // --- Range validation (min/max)

  test("minValue prevents values below minimum spinner button", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox minValue="10" initialValue="11" />`);
    const decrementButton = page.getByRole("spinbutton").nth(1);

    const textbox = page.getByRole("textbox");

    await decrementButton.click();
    await expect(textbox).toHaveValue("10");

    await decrementButton.click();
    await expect(textbox).toHaveValue("10");
  });

  test("minValue prevents typing values below minimum", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox minValue="10" initialValue="11" />`);
    const decrementButton = page.getByRole("spinbutton").nth(1);

    const textbox = page.getByRole("textbox");

    await textbox.fill("2");
    await textbox.blur();
    await expect(textbox).toHaveValue("10");
  });

  test("maxValue prevents values above maximum spinner button", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox maxValue="11" initialValue="10" />`);
    const incrementButton = page.getByRole("spinbutton").nth(0);

    const textbox = page.getByRole("textbox");

    await incrementButton.click();
    await expect(textbox).toHaveValue("11");

    await incrementButton.click();
    await expect(textbox).toHaveValue("11");
  });

  test("maxValue prevents typing values above maximum", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox maxValue="11" initialValue="10" />`);

    const textbox = page.getByRole("textbox");

    await textbox.fill("200");
    await textbox.blur();
    await expect(textbox).toHaveValue("11");
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct role", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" hasSpinBox="true" />`);
    await expect(page.getByRole("spinbutton")).toHaveCount(2);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Amount" />`);
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("required has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox required="true" label="Required field" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="invalid" />`);
    await expect(page.getByText("Label")).toBeVisible();
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("empty string label is not rendered", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="" initialValue="" />`);
    // No specific label should be visible, just the input
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("clicking on the label focuses input field", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Input Field Label" />`);
    await page.getByText("Input Field Label").click();
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox direction="ltr" label="Label" labelPosition="start" />`);
    const labelBox = await getBounds(page.getByText("Label"));
    const inputBox = await getBounds(page.getByRole("textbox"));

    expect(labelBox.right).toBeLessThan(inputBox.left);
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox direction="ltr" label="Label" labelPosition="end" />`);
    const labelBox = await getBounds(page.getByText("Label"));
    const inputBox = await getBounds(page.getByRole("textbox"));

    expect(labelBox.left).toBeGreaterThan(inputBox.right);
  });

  test("labelPosition=start positions label before input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox direction="rtl" label="Label" labelPosition="start" />`);
    const labelBox = await getBounds(page.getByText("Label"));
    const inputBox = await getBounds(page.getByRole("textbox"));

    expect(labelBox.left).toBeGreaterThan(inputBox.right);
  });

  test("labelPosition=end positions label after input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox direction="rtl" label="Label" labelPosition="end" />`);
    const labelBox = await getBounds(page.getByText("Label"));
    const inputBox = await getBounds(page.getByRole("textbox"));

    expect(labelBox.right).toBeLessThan(inputBox.left);
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="top" />`);
    const labelBox = await getBounds(page.getByText("Label"));
    const inputBox = await getBounds(page.getByRole("textbox"));

    expect(labelBox.bottom).toBeLessThan(inputBox.top);
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="bottom" />`);
    const labelBox = await getBounds(page.getByText("Label"));
    const inputBox = await getBounds(page.getByRole("textbox"));

    expect(labelBox.top).toBeGreaterThan(inputBox.bottom);
  });

  test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelWidth="200px" />`);
    const label = page.getByText("Label");
    await expect(label).toBeVisible();
    await expect(label).toHaveCSS("width", "200px");
  });

  test("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
    await initTestBed(
      `<NumberBox label="Very long label text" labelBreak="true" labelWidth="50px" />`,
    );
    const label = page.getByText("Very long label text");
    await expect(label).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on input change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox onDidChange="testState = 'changed'" />`,
    );
    await page.getByRole("textbox").fill("123");
    await expect.poll(testStateDriver.testState).toBe("changed");
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox onDidChange="arg => testState = arg" />`,
    );
    await page.getByRole("textbox").fill("123");
    await expect.poll(testStateDriver.testState).toBe("123");
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox onGotFocus="testState = 'focused'" />`,
    );
    await page.getByRole("textbox").focus();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });

  test("lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox onLostFocus="testState = 'blurred'" />`,
    );
    const input = page.getByRole("textbox");
    await input.focus();
    await input.blur();
    await expect.poll(testStateDriver.testState).toBe("blurred");
  });

  test("events do not fire when component is disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <NumberBox enabled="false" onDidChange="testState = 'changed'" onGotFocus="testState = 'focused'" />
    `);

    const input = page.getByRole("textbox");
    await input.focus();
    await input.fill("123", { force: true }); // Should not allow input

    await expect.poll(testStateDriver.testState).toBe(null);
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("API", () => {
  test("value API returns current state", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" initialValue="123" />
        <Button label="test" onClick="testState = numberbox.value" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "test" }).click();
    await expect.poll(testStateDriver.testState).toBe(123);
  });

  test("value API returns state after change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" />
        <Button label="test" onClick="testState = numberbox.value" />
      </Fragment>
    `);

    await page.getByRole("textbox").fill("456");
    await page.getByRole("button", { name: "test" }).click();
    await expect.poll(testStateDriver.testState).toBe("456");
  });

  test("setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" />
        <Button label="test" onClick="numberbox.setValue(789)" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "test" }).click();
    await expect(page.getByRole("textbox")).toHaveValue("789");
  });

  test("setValue API triggers events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" onDidChange="testState = 'changed'" />
        <Button label="test" onClick="numberbox.setValue(123)" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "test" }).click();
    await expect.poll(testStateDriver.testState).toBe("changed");
  });

  test("focus API focuses the input", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" />
        <Button label="test" onClick="numberbox.focus()" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "test" }).click();
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("focus API does nothing when component is disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" enabled="false" />
        <Button label="test" onClick="numberbox.focus()" />
      </Fragment>
    `);

    await page.getByRole("button", { name: "test" }).click();
    await expect(page.getByRole("textbox")).not.toBeFocused();
  });
});

// =============================================================================
// INPUT ADORNMENTS TESTS (From TextBox pattern)
// =============================================================================

test.describe("Input Adornments", () => {
  test("startText displays at beginning of input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="ltr" startText="$" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

    await expect(page.getByTestId("input")).toContainText("$");
    expect(textRight - compLeft).toBeLessThanOrEqual(compRight - textLeft);
  });

  test("startText displays at beginning of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="rtl" startText="$" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

    await expect(page.getByTestId("input")).toContainText("$");
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
  });

  test("endText displays at end of input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="ltr" endText="USD" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("USD"));

    await expect(page.getByTestId("input")).toContainText("USD");
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
  });

  test("endText displays at end of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="rtl" endText="USD" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("USD"));

    await expect(page.getByTestId("input")).toContainText("USD");
    expect(textRight - compLeft).toBeLessThanOrEqual(compRight - textLeft);
  });

  test("startIcon displays at beginning of input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="ltr" startIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img").first());

    expect(iconRight - compLeft).toBeLessThanOrEqual(compRight - iconLeft);
  });

  test("startIcon displays at beginning of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="rtl" startIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img").first());

    expect(iconRight - compLeft).toBeGreaterThanOrEqual(compRight - iconLeft);
  });

  test("endIcon displays at end of input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" endIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img").first());

    expect(iconRight - compLeft).toBeGreaterThanOrEqual(compRight - iconLeft);
  });

  test("endIcon displays at end of input (rtl)", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" direction="rtl" endIcon="search" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: iconLeft, right: iconRight } = await getBounds(page.getByRole("img").first());

    expect(iconRight - compLeft).toBeLessThanOrEqual(compRight - iconLeft);
  });

  test("multiple adornments can be combined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <NumberBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" />
    `);
    await expect(page.getByTestId("input")).toContainText("$");
    await expect(page.getByTestId("input")).toContainText("USD");
    await expect(page.getByRole("img").first()).toBeVisible();
    await expect(page.getByRole("img").nth(1)).toBeVisible();
  });

  test("all adornments appear in the right place", async ({ initTestBed, page }) => {
    await initTestBed(`
      <NumberBox testId="input" startText="$" endText="USD" startIcon="search" endIcon="search" direction="ltr" />
    `);
    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: startTextLeft, right: startTextRight } = await getBounds(page.getByText("$"));
    const { left: endTextLeft, right: endTextRight } = await getBounds(page.getByText("USD"));
    const { left: startIconLeft, right: startIconRight } = await getBounds(
      page.getByRole("img").first(),
    );
    const { left: endIconLeft, right: endIconRight } = await getBounds(
      page.getByRole("img").nth(1),
    );

    // Check order of adornments
    expect(startTextRight - compLeft).toBeLessThanOrEqual(compRight - startTextLeft);
    expect(startIconRight - compLeft).toBeLessThanOrEqual(compRight - startIconLeft);
    expect(endTextRight - compLeft).toBeGreaterThanOrEqual(compRight - endTextLeft);
    expect(endIconRight - compLeft).toBeGreaterThanOrEqual(compRight - endIconLeft);
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("backgroundColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "backgroundColor-NumberBox-default": "rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("borderColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox-default": "rgb(0, 255, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("textColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "textColor-NumberBox-default": "rgb(0, 0, 255)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("focus borderColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox-default--focus": "rgb(255, 255, 0)" },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 255, 0)");
  });

  test("disabled backgroundColor applies when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" enabled="false" />`, {
      testThemeVars: { "backgroundColor-NumberBox--disabled": "rgb(128, 128, 128)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(128, 128, 128)");
  });

  test("borderRadius applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderRadius-NumberBox-default": "10px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-radius", "10px");
  });

  test("padding applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "padding-NumberBox": "15px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("padding", "15px");
  });

  // Additional variant mixin theme variable tests
  test("borderWidth applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderWidth-NumberBox-default": "3px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-width", "3px");
  });

  test("borderStyle applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderStyle-NumberBox-default": "dashed" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-style", "dashed");
  });

  test("fontSize applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "fontSize-NumberBox-default": "18px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("font-size", "18px");
  });

  test("boxShadow applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "boxShadow-NumberBox-default": "rgba(0, 0, 0, 0.2) 0px 2px 4px 0px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS(
      "box-shadow",
      "rgba(0, 0, 0, 0.2) 0px 2px 4px 0px",
    );
  });

  test("hover borderColor applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox-default--hover": "rgb(255, 100, 100)" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 100, 100)");
  });

  test("hover backgroundColor applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "backgroundColor-NumberBox-default--hover": "rgb(240, 240, 240)" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("hover boxShadow applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "boxShadow-NumberBox-default--hover": "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS(
      "box-shadow",
      "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px",
    );
  });

  test("hover textColor applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "textColor-NumberBox-default--hover": "rgb(50, 50, 50)" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(50, 50, 50)");
  });

  test("focus backgroundColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "backgroundColor-NumberBox-default--focus": "rgb(250, 250, 250)" },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(250, 250, 250)");
  });

  test("focus boxShadow applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: {
        "boxShadow-NumberBox-default--focus": "rgba(0, 100, 255, 0.4) 0px 0px 0px 3px",
      },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS(
      "box-shadow",
      "rgba(0, 100, 255, 0.4) 0px 0px 0px 3px",
    );
  });

  test("focus textColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "textColor-NumberBox-default--focus": "rgb(20, 20, 20)" },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(20, 20, 20)");
  });

  test("focus outline properties apply on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: {
        "outlineWidth-NumberBox-default--focus": "2px",
        "outlineColor-NumberBox-default--focus": "rgb(0, 123, 255)",
        "outlineStyle-NumberBox-default--focus": "solid",
        "outlineOffset-NumberBox-default--focus": "2px",
      },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS("outline-width", "2px");
    await expect(page.getByTestId("input")).toHaveCSS("outline-color", "rgb(0, 123, 255)");
    await expect(page.getByTestId("input")).toHaveCSS("outline-style", "solid");
    await expect(page.getByTestId("input")).toHaveCSS("outline-offset", "2px");
  });

  test("placeholder textColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" placeholder="Enter number" />`, {
      testThemeVars: { "textColor-placeholder-NumberBox-default": "rgb(150, 150, 150)" },
    });
    const input = page.getByRole("textbox");
    const placeholderColor = await input.evaluate((el: HTMLInputElement) => {
      return window.getComputedStyle(el, "::placeholder").color;
    });
    expect(placeholderColor).toBe("rgb(150, 150, 150)");
  });

  test("placeholder fontSize applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" placeholder="Enter number" />`, {
      testThemeVars: { "fontSize-placeholder-NumberBox-default": "14px" },
    });
    const input = page.getByRole("textbox");
    const placeholderFontSize = await input.evaluate((el: HTMLInputElement) => {
      return window.getComputedStyle(el, "::placeholder").fontSize;
    });
    expect(placeholderFontSize).toBe("14px");
  });

  test("gap between adornments applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" startText="$" endText="USD" />`, {
      testThemeVars: { "gap-adornment-NumberBox": "8px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("gap", "8px");
  });

  test("disabled textColor applies when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" enabled="false" />`, {
      testThemeVars: { "textColor-NumberBox--disabled": "rgb(160, 160, 160)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(160, 160, 160)");
  });

  test("disabled borderColor applies when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" enabled="false" />`, {
      testThemeVars: { "borderColor-NumberBox--disabled": "rgb(200, 200, 200)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(200, 200, 200)");
  });

  // Error variant theme variables
  test("error variant borderRadius applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="error" />`, {
      testThemeVars: { "borderRadius-NumberBox-error": "8px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-radius", "8px");
  });

  test("error variant fontSize applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="error" />`, {
      testThemeVars: { "fontSize-NumberBox-error": "16px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("font-size", "16px");
  });

  test("error variant backgroundColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="error" />`, {
      testThemeVars: { "backgroundColor-NumberBox-error": "rgb(255, 240, 240)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(255, 240, 240)");
  });

  // Warning variant theme variables
  test("warning variant borderColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="warning" />`, {
      testThemeVars: { "borderColor-NumberBox-warning": "rgb(255, 193, 7)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 193, 7)");
  });

  test("warning variant textColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="warning" />`, {
      testThemeVars: { "textColor-NumberBox-warning": "rgb(133, 100, 4)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(133, 100, 4)");
  });

  // Success variant theme variables
  test("success variant borderColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="valid" />`, {
      testThemeVars: { "borderColor-NumberBox-success": "rgb(40, 167, 69)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(40, 167, 69)");
  });

  test("success variant backgroundColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="valid" />`, {
      testThemeVars: { "backgroundColor-NumberBox-success": "rgb(240, 255, 240)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(240, 255, 240)");
  });

  test("input text adornment colors apply correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" startText="$" endText="€" />`, {
      testThemeVars: { "color-adornment-NumberBox-default": "rgb(0, 123, 255)" },
    });
    await expect(page.getByText("$")).toHaveCSS("color", "rgb(0, 123, 255)");
    await expect(page.getByText("€")).toHaveCSS("color", "rgb(0, 123, 255)");
  });

  test("input icon adornment colors apply correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" startIcon="search" endIcon="search" />`, {
      testThemeVars: { "color-adornment-NumberBox-default": "rgb(0, 123, 255)" },
    });
    await expect(page.getByRole("img").first()).toHaveCSS("color", "rgb(0, 123, 255)");
    await expect(page.getByRole("img").nth(1)).toHaveCSS("color", "rgb(0, 123, 255)");
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test("error borderColor applies with error validation", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="error" />`, {
      testThemeVars: { "borderColor-NumberBox-error": "rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("warning borderColor applies with warning validation", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="warning" />`, {
      testThemeVars: { "borderColor-NumberBox-warning": "rgb(255, 165, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 165, 0)");
  });

  test("success borderColor applies with valid validation", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="valid" />`, {
      testThemeVars: { "borderColor-NumberBox-success": "rgb(0, 128, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 128, 0)");
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" validationStatus="invalid-status" />`, {
      testThemeVars: {
        "borderColor-NumberBox": "rgb(0, 0, 0)",
        "borderColor-NumberBox-error": "rgb(255, 0, 0)",
        "borderColor-NumberBox-warning": "rgb(255, 165, 0)",
        "borderColor-NumberBox-success": "rgb(0, 255, 0)",
      },
    });
    await expect(page.getByTestId("input")).not.toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(page.getByTestId("input")).not.toHaveCSS("border-color", "rgb(255, 165, 0)");
    await expect(page.getByTestId("input")).not.toHaveCSS("border-color", "rgb(0, 255, 0)");
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 0, 0)");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("placeholder is hidden if input field is filled", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox placeholder="123" />`);
    const input = page.getByRole("textbox");
    await input.fill("456");
    await expect(input).toHaveValue("456");
    await expect(input).toHaveAttribute("placeholder", "123");
  });

  test("invalid initialValue types are handled gracefully", async ({ initTestBed, page }) => {
    // Test various invalid types
    await initTestBed(`<NumberBox initialValue="{true}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("handles if initialValue is a string", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="asdasd" />`);
    await expect(page.getByRole("textbox")).toHaveValue("asdasd");
  });

  test("if initialValue is too large, handles gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="100000000000000000000000000000000000" />`);
    const input = page.getByRole("textbox");
    // Should either clamp to max value or handle the large number appropriately
    await expect(input).toBeVisible();
  });

  test("if initialValue is too small, handles gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="-100000000000000000000000000000000000" />`);
    const input = page.getByRole("textbox");
    // Should either clamp to min value or handle the small number appropriately
    await expect(input).toBeVisible();
  });

  // Complex edge cases
  test("handle special characters in input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    // Should filter out special characters
    await input.fill("!@#$123%^&");
    await expect(input).not.toHaveValue("!@#$123%^&");
  });

  test("handle Unicode characters in input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    // Should filter out Unicode characters
    await input.fill("👨‍👩‍👧‍👦123");
    await expect(input).not.toHaveValue("👨‍👩‍👧‍👦123");
  });

  test("component handles very long input text", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    const longNumber = "1".repeat(100);
    await input.fill(longNumber);
    // Should handle or truncate appropriately
    await expect(input).toBeVisible();
  });

  test("component handles rapid input changes", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.pressSequentially("123", { delay: 50 });
    await expect(input).toHaveValue("123");

    await input.clear();
    await input.pressSequentially("456", { delay: 25 });
    await expect(input).toHaveValue("456");
  });

  test("component works correctly in layout contexts", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`
      <Stack>
        <NumberBox label="First" testId="first"/>
        <NumberBox label="Second" testId="second" />
      </Stack>
    `);

    const driver1 = await createNumberBoxDriver("first");
    const driver2 = await createNumberBoxDriver("second");
    await expect(driver1.input).toBeVisible();
    await expect(driver1.label).toBeVisible();
    await expect(driver2.input).toBeVisible();
    await expect(driver2.label).toBeVisible();
  });

  test("component integrates with forms correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox name="amount" required="true" />`);
    const input = page.getByRole("textbox");
    await expect(input).toHaveAttribute("required");
  });

  test("component works with conditional rendering", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox when="{testState}" />
        <Button label="test" onClick="testState = true" />
      </Fragment>
    `);

    // Initially not visible
    await expect(page.getByRole("textbox")).not.toBeVisible();

    // Click to show
    await page.getByRole("button", { name: "test" }).click();
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("spinner buttons work with long press", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="0" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    // Hold down the button (simulate long press)
    await incrementButton.hover();
    await page.mouse.down();
    await page.waitForTimeout(600); // Wait longer than initial delay
    await page.mouse.up();

    // Should have incremented multiple times
    const value = await page.getByRole("textbox").inputValue();
    expect(parseInt(value) || 0).toBeGreaterThan(1);
  });

  test("integersOnly with zeroOrPositive combination works", async ({
    initTestBed,
    createNumberBoxDriver,
    page,
  }) => {
    await initTestBed(`<NumberBox integersOnly="true" zeroOrPositive="true" initialValue="1" />`);

    const driver = await createNumberBoxDriver();

    await driver.decrement();
    await expect(driver.input).toHaveValue("0");

    await driver.decrement();
    await expect(driver.input).toHaveValue("0");

    await driver.input.type(".5");
    await expect(driver.input).toHaveValue("5");
  });

  // Special numeric formats
  test("handle special numeric input formats", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    // Test scientific notation
    await input.fill("1e5");
    await expect(input).toHaveValue("1e5");

    // Test negative numbers
    await input.clear();
    await input.fill("-123");
    await expect(input).toHaveValue("-123");
  });

  test("entering multiple 0s only results in one 0", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    await page.getByRole("textbox").pressSequentially("0000000000000000");
    await page.getByRole("textbox").blur();
    await expect(page.getByRole("textbox")).toHaveValue("0");
  });

  test("copying multiple 0s only results in one 0", async ({ initTestBed, page }) => {
    const { clipboard } = await initTestBed(`<NumberBox />`);
    await clipboard.write("0000000000000000");
    await clipboard.paste(page.getByRole("textbox"));
    await page.getByRole("textbox").blur();
    await expect(page.getByRole("textbox")).toHaveValue("0");
  });

  test("standalone minus sign is permitted if field is not blurred yet", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox />`);
    await page.getByRole("textbox").fill("-");
    await expect(page.getByRole("textbox")).toHaveValue("-");
  });

  test("minus sign is applied correctly if it comes after number", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox />`);
    await page.getByRole("textbox").pressSequentially("123-");
    await expect(page.getByRole("textbox")).toHaveValue("-123");
  });

  test("placing decimal separator between the numbers of an integer results in a float", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.fill("123456");
    await input.press("ArrowLeft");
    await input.press("ArrowLeft");
    await input.press("ArrowLeft");
    await input.press(".");

    await expect(input).toHaveValue("123.456");
  });

  test("placing second decimal separator is not permitted", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.fill("1.23456");
    await input.press("ArrowLeft");
    await input.press(".");

    await expect(input).toHaveValue("1.23456");
  });

  test("placing decimal separator before an integer adds a leading 0 (#1)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.fill("12");
    await input.press("ArrowLeft");
    await input.press("ArrowLeft");
    await input.press(".");

    await expect(input).toHaveValue("0.12");
  });

  test("placing decimal separator before an integer adds a leading 0 (#2)", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.fill("");
    await input.press(".");

    await expect(input).toHaveValue("0.");
  });

  test("adding floating point to the end adds a trailing 0 when blurred", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.pressSequentially("123.");
    await input.blur();
    await expect(input).toHaveValue("123.0");
  });
});
