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

  test("initialValue ignores non-numeric string", async ({ initTestBed, page }) => {
    await initTestBed(`
        <NumberBox initialValue="can't be this" />
    `);

    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("initialValue accepts various types", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack>
        <NumberBox testId="integer" initialValue="{1}" />
        <NumberBox testId="float" initialValue="{1.2}" />
        <NumberBox testId="undefined" initialValue="{undefined}" />
        <NumberBox testId="null" initialValue="{null}" />
        <NumberBox testId="empty-string" initialValue="" />
        <NumberBox testId="string-integer" initialValue="1" />
        <NumberBox testId="string-float" initialValue="1.2" />
      </Stack>
    `);

    await expect(page.getByTestId("integer").getByRole("textbox")).toHaveValue("1");
    await expect(page.getByTestId("float").getByRole("textbox")).toHaveValue("1.2");
    await expect(page.getByTestId("undefined").getByRole("textbox")).toHaveValue("");
    await expect(page.getByTestId("null").getByRole("textbox")).toHaveValue("");
    await expect(page.getByTestId("empty-string").getByRole("textbox")).toHaveValue("");
    await expect(page.getByTestId("string-integer").getByRole("textbox")).toHaveValue("1");
    await expect(page.getByTestId("string-float").getByRole("textbox")).toHaveValue("1.2");
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
    await expect(page.getByText("placeholder text")).not.toBeVisible();
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

  test("clicking spinbox up-arrow adds step value", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox initialValue="5" step="2" />`);
    const driver = await createNumberBoxDriver();

    await driver.increment();
    await expect(driver.input).toHaveValue("7");
  });

  test("clicking spinbox down-arrow subtracts step value", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox initialValue="5" step="2" />`);
    const driver = await createNumberBoxDriver();

    await driver.decrement();
    await expect(driver.input).toHaveValue("3");
  });

  test("invalid step values use default step", async ({ initTestBed, createNumberBoxDriver }) => {
    await initTestBed(`<NumberBox initialValue="10" step="3.5" />`);
    const driver = await createNumberBoxDriver();
    await driver.increment();
    await expect(driver.input).toHaveValue("11");
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

  test("zeroOrPositive=true prevents negative values", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox zeroOrPositive="true" initialValue="1" />`);
    const driver = await createNumberBoxDriver();

    await driver.decrement();
    await expect(driver.input).toHaveValue("0");

    await driver.decrement();
    await expect(driver.input).toHaveValue("0");
  });

  // --- Range validation (min/max)

  test("minValue prevents values below minimum spinner button", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox minValue="10" initialValue="11" />`);
    const driver = await createNumberBoxDriver();

    await driver.decrement();
    await expect(driver.input).toHaveValue("10");

    await driver.decrement();
    await expect(driver.input).toHaveValue("10");
  });

  test("minValue prevents typing values below minimum", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox minValue="10" initialValue="11" />`);

    const textbox = page.getByRole("textbox");

    await textbox.fill("2");
    await textbox.blur();
    await expect(textbox).toHaveValue("10");
  });

  test("maxValue prevents values above maximum spinner button", async ({
    initTestBed,
    createNumberBoxDriver,
  }) => {
    await initTestBed(`<NumberBox maxValue="11" initialValue="10" />`);
    const driver = await createNumberBoxDriver();

    await driver.increment();
    await expect(driver.input).toHaveValue("11");

    await driver.increment();
    await expect(driver.input).toHaveValue("11");
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

  test("gotFocus event fires on label focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<NumberBox onGotFocus="testState = 'focused'" label="test" />`,
    );
    await page.getByText("test").click();
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
    expect(textRight - compLeft).toBeLessThanOrEqual(compRight - textLeft);
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
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
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

    expect(iconRight - compLeft).toBeLessThanOrEqual(compRight - iconLeft);
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

    expect(iconRight - compLeft).toBeGreaterThanOrEqual(compRight - iconLeft);
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
      testThemeVars: { "backgroundColor-NumberBox--default": "rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("borderColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox--default": "rgb(0, 255, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("textColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "textColor-NumberBox--default": "rgb(0, 0, 255)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("focus borderColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox--default--focus": "rgb(255, 255, 0)" },
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
      testThemeVars: { "borderRadius-NumberBox--default": "10px" },
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
      testThemeVars: { "borderWidth-NumberBox--default": "3px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-width", "3px");
  });

  test("borderStyle applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderStyle-NumberBox--default": "dashed" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-style", "dashed");
  });

  test("fontSize applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "fontSize-NumberBox--default": "18px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("font-size", "18px");
  });

  test("boxShadow applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "boxShadow-NumberBox--default": "rgba(0, 0, 0, 0.2) 0px 2px 4px 0px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS(
      "box-shadow",
      "rgba(0, 0, 0, 0.2) 0px 2px 4px 0px",
    );
  });

  test("hover borderColor applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox--default--hover": "rgb(255, 100, 100)" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(255, 100, 100)");
  });

  test("hover backgroundColor applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "backgroundColor-NumberBox--default--hover": "rgb(240, 240, 240)" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(240, 240, 240)");
  });

  test("hover boxShadow applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "boxShadow-NumberBox--default--hover": "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS(
      "box-shadow",
      "rgba(0, 0, 0, 0.3) 0px 4px 8px 0px",
    );
  });

  test("hover textColor applies on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "textColor-NumberBox--default--hover": "rgb(50, 50, 50)" },
    });
    await page.getByTestId("input").hover();
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(50, 50, 50)");
  });

  test("focus backgroundColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "backgroundColor-NumberBox--default--focus": "rgb(250, 250, 250)" },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(250, 250, 250)");
  });

  test("focus boxShadow applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: {
        "boxShadow-NumberBox--default--focus": "rgba(0, 100, 255, 0.4) 0px 0px 0px 3px",
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
      testThemeVars: { "textColor-NumberBox--default--focus": "rgb(20, 20, 20)" },
    });
    await page.getByRole("textbox").focus();
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(20, 20, 20)");
  });

  test("focus outline properties apply on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: {
        "outlineWidth-NumberBox--default--focus": "2px",
        "outlineColor-NumberBox--default--focus": "rgb(0, 123, 255)",
        "outlineStyle-NumberBox--default--focus": "solid",
        "outlineOffset-NumberBox--default--focus": "2px",
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
      testThemeVars: { "textColor-placeholder-NumberBox--default": "rgb(150, 150, 150)" },
    });
    const input = page.getByRole("textbox");
    const placeholderColor = await input.evaluate((el: HTMLInputElement) => {
      return window.getComputedStyle(el, "::placeholder").color;
    });
    expect(placeholderColor).toBe("rgb(150, 150, 150)");
  });

  test("placeholder fontSize applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" placeholder="Enter number" />`, {
      testThemeVars: { "fontSize-placeholder-NumberBox--default": "14px" },
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

  test("input text adornment colors apply correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" startText="$" endText="€" />`, {
      testThemeVars: { "color-adornment-NumberBox--default": "rgb(0, 123, 255)" },
    });
    await expect(page.getByText("$")).toHaveCSS("color", "rgb(0, 123, 255)");
    await expect(page.getByText("€")).toHaveCSS("color", "rgb(0, 123, 255)");
  });

  test("input icon adornment colors apply correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" startIcon="search" endIcon="search" />`, {
      testThemeVars: { "color-adornment-NumberBox--default": "rgb(0, 123, 255)" },
    });
    await expect(page.getByRole("img").first()).toHaveCSS("color", "rgb(0, 123, 255)");
    await expect(page.getByRole("img").nth(1)).toHaveCSS("color", "rgb(0, 123, 255)");
  });

  [
    { value: "--default", prop: "" },
    { value: "--warning", prop: 'validationStatus="warning"' },
    { value: "--error", prop: 'validationStatus="error"' },
    { value: "--success", prop: 'validationStatus="valid"' },
  ].forEach((variant) => {
    test(`applies correct borderRadius ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-NumberBox${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-NumberBox${variant.value}`]: "rgb(255, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-NumberBox${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-NumberBox${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct fontSize ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`fontSize-NumberBox${variant.value}`]: "14px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("font-size", "14px");
    });

    test(`applies correct backgroundColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-NumberBox${variant.value}`]: "rgb(240, 240, 240)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-NumberBox${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-NumberBox${variant.value}`]: "rgb(0, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-NumberBox${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct backgroundColor on hover ${variant.value}`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-NumberBox${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-NumberBox${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-NumberBox${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });
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

  test("spinner buttons work with long press", async ({
    initTestBed,
    createNumberBoxDriver,
    page,
  }) => {
    await initTestBed(`<NumberBox initialValue="0" />`);
    const driver = await createNumberBoxDriver();

    // Hold down the button (simulate long press)
    await driver.spinnerUp.hover();
    await page.mouse.down();
    await page.waitForTimeout(600); // Wait longer than initial delay
    await page.mouse.up();

    // Should have incremented multiple times
    await expect(driver.input).not.toHaveValue("0");
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

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<NumberBox width="200px" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<NumberBox width="200px" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<NumberBox width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<NumberBox width="50%" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" tooltip="Tooltip text" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" tooltipMarkdown="**Bold text**" />`);
    
    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test.fixme("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "borderColor-NumberBox-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test.fixme("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "backgroundColor-NumberBox-CustomVariant": "rgb(0, 255, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" animation="fadeIn" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
  });

  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" tooltip="Tooltip text" animation="fadeIn" />`);
    
    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
    
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("can select part: 'input'", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" />`);
    const inputPart = page.getByTestId("test").locator("[data-part-id='input']");
    await expect(inputPart).toBeVisible();
  });

  test("can select part: 'spinnerUp'", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" />`);
    const spinnerUp = page.getByTestId("test").locator("[data-part-id='spinnerUp']");
    await expect(spinnerUp).toBeVisible();
  });

  test("can select part: 'spinnerDown'", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" />`);
    const spinnerDown = page.getByTestId("test").locator("[data-part-id='spinnerDown']");
    await expect(spinnerDown).toBeVisible();
  });

  test("can select part: 'startAdornment'", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" startText="$" />`);
    const startAdornment = page.getByTestId("test").locator("[data-part-id='startAdornment']");
    await expect(startAdornment).toBeVisible();
    await expect(startAdornment).toHaveText("$");
  });

  test("can select part: 'endAdornment'", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" endText="USD" />`);
    const endAdornment = page.getByTestId("test").locator("[data-part-id='endAdornment']");
    await expect(endAdornment).toBeVisible();
    await expect(endAdornment).toHaveText("USD");
  });

  test("spinners are not present when hasSpinBox is false", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" hasSpinBox="false" />`);
    const spinnerUp = page.getByTestId("test").locator("[data-part-id='spinnerUp']");
    const spinnerDown = page.getByTestId("test").locator("[data-part-id='spinnerDown']");
    await expect(spinnerUp).not.toBeVisible();
    await expect(spinnerDown).not.toBeVisible();
  });

  test("parts are present when tooltip is added", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" tooltip="Tooltip text" startText="$" />`);
    
    const component = page.getByTestId("test");
    const inputPart = component.locator("[data-part-id='input']");
    const startAdornment = component.locator("[data-part-id='startAdornment']");
    const spinnerUp = component.locator("[data-part-id='spinnerUp']");
    
    await expect(inputPart).toBeVisible();
    await expect(startAdornment).toBeVisible();
    await expect(spinnerUp).toBeVisible();
    
    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test.fixme("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(`<NumberBox testId="test" variant="CustomVariant" endText="USD" />`, {
      testThemeVars: {
        "borderColor-NumberBox-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const inputPart = component.locator("[data-part-id='input']");
    const endAdornment = component.locator("[data-part-id='endAdornment']");
    const spinnerDown = component.locator("[data-part-id='spinnerDown']");
    
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(inputPart).toBeVisible();
    await expect(endAdornment).toBeVisible();
    await expect(spinnerDown).toBeVisible();
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <NumberBox 
        testId="test" 
        variant="CustomVariant"
        animation="fadeIn"
        startText="$"
        endText="USD"
      />
    `, {
      testThemeVars: {
        "backgroundColor-NumberBox-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    
    const component = page.getByTestId("test");
    const inputPart = component.locator("[data-part-id='input']");
    const startAdornment = component.locator("[data-part-id='startAdornment']");
    const endAdornment = component.locator("[data-part-id='endAdornment']");
    const spinnerUp = component.locator("[data-part-id='spinnerUp']");
    const spinnerDown = component.locator("[data-part-id='spinnerDown']");
    
    // Verify variant applied
    await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
    
    // Verify parts are visible
    await expect(inputPart).toBeVisible();
    await expect(startAdornment).toBeVisible();
    await expect(endAdornment).toBeVisible();
    await expect(spinnerUp).toBeVisible();
    await expect(spinnerDown).toBeVisible();
  });
});
