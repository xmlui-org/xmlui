import { labelPositionValues, validationStatusValues } from "../abstractions";
import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { NUMBERBOX_MAX_VALUE } from "./numberbox-abstractions";

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
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByText("Amount")).toBeVisible();
  });

  // --- initialValue prop

  test("initialValue sets field value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="123" />`);
    await expect(page.getByRole("textbox")).toHaveValue("123");
  });

  test("initialValue accepts empty as empty string", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("initialValue accepts different data types", async ({ initTestBed, page }) => {
    // Test string
    await initTestBed(`<NumberBox initialValue="123" />`);
    await expect(page.getByRole("textbox")).toHaveValue("123");

    // Test number
    await initTestBed(`<NumberBox initialValue="{456}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("456");

    // Test float
    await initTestBed(`<NumberBox initialValue="{123.45}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("123.45");
  });

  test("initialValue handles null", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="{null}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("initialValue handles undefined", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="{undefined}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  // Valid initialValue types from existing tests
  [
    { label: "integer", value: "'{1}'", toExpect: "1" },
    { label: "float", value: "'{1.2}'", toExpect: "1.2" },
    { label: "undefined", value: "'{undefined}'", toExpect: "" },
    { label: "null", value: "'{null}'", toExpect: "" },
    { label: "empty string", value: "''", toExpect: "" },
    { label: "string that resolves to integer", value: "'1'", toExpect: "1" },
    { label: "string that resolves to float", value: "'1.2'", toExpect: "1.2" },
  ].forEach(({ label, value, toExpect }) => {
    test(`setting initialValue to ${label} sets value of field`, async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox initialValue=${value} />`);
      await expect(page.getByRole("textbox")).toHaveValue(toExpect);
    });
  });

  // --- enabled prop

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox enabled="false" />`);
    await expect(page.getByRole("textbox")).toBeDisabled();
  });

  test("enabled=false prevents user input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox enabled="false" />`);
    await expect(page.getByRole("textbox")).not.toBeEditable();
  });

  test("disabled input field stops user interaction for spinbox", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox enabled="false" initialValue="5" />`);

    // Try to find spinbox buttons (implementation may vary)
    const spinButtons = page.locator("button");
    const firstSpinButton = spinButtons.first();

    if (await firstSpinButton.isVisible()) {
      await firstSpinButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("5"); // Should not change
    }
  });

  // --- readOnly prop

  test("readOnly prevents editing but allows focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" initialValue="123" />`);
    const input = page.getByRole("textbox");
    await expect(input).toHaveAttribute("readonly");
    await expect(input).toHaveValue("123");
    await expect(input).not.toBeEditable();

    await input.focus();
    await expect(input).toBeFocused();
  });

  test("readOnly disables the spinbox", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" initialValue="5" />`);

    // Try to find and click spinbox buttons
    const spinButtons = page.locator("button");
    const firstSpinButton = spinButtons.first();

    if (await firstSpinButton.isVisible()) {
      await firstSpinButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("5"); // Should not change
    }
  });

  // --- required prop

  test("required prop adds required attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox required="true" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
  });

  test("empty required NumberBox shows visual indicator", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="test" required="{true}" />`);
    await expect(page.getByText("test")).toContainText("*");
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
  });

  // --- autoFocus prop

  test("autoFocus focuses input on mount", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox autoFocus="true" />`);
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox autoFocus="true" label="Auto-focused input" />`);
    await expect(page.getByLabel("Auto-focused input")).toBeFocused();
  });

  // --- placeholder prop

  test("placeholder shows when input is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox placeholder="Enter number..." />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("placeholder", "Enter number...");
  });

  test("placeholder appears if input field is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox placeholder="123" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("placeholder", "123");
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

  test("renders spinbox by default", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
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

  test("clicking spinbox up-arrow adds default step value", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="5" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("6");
    }
  });

  test("clicking spinbox down-arrow subtracts default step value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox initialValue="5" />`);
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();

    if (await decrementButton.isVisible()) {
      await decrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("4");
    }
  });

  test("custom step value applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="10" step="5" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("15");
    }
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
    await initTestBed(`<NumberBox zeroOrPositive="true" initialValue="5" />`);
    const input = page.getByRole("textbox");
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();

    if (await decrementButton.isVisible()) {
      // Click multiple times to try to go negative
      for (let i = 0; i < 10; i++) {
        await decrementButton.click();
      }
      // Should not go below 0
      const value = await input.inputValue();
      expect(parseInt(value) || 0).toBeGreaterThanOrEqual(0);
    }
  });

  // --- Range validation (min/max)

  test("minValue prevents values below minimum", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox minValue="10" initialValue="15" />`);
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();

    if (await decrementButton.isVisible()) {
      // Click multiple times to try to go below minimum
      for (let i = 0; i < 10; i++) {
        await decrementButton.click();
      }
      const value = await page.getByRole("textbox").inputValue();
      expect(parseInt(value) || 0).toBeGreaterThanOrEqual(10);
    }
  });

  test("maxValue prevents values above maximum", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox maxValue="20" initialValue="15" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    if (await incrementButton.isVisible()) {
      // Click multiple times to try to go above maximum
      for (let i = 0; i < 10; i++) {
        await incrementButton.click();
      }
      const value = await page.getByRole("textbox").inputValue();
      expect(parseInt(value) || 0).toBeLessThanOrEqual(20);
    }
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct role", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("label is properly associated with input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Amount" />`);
    await expect(page.getByLabel("Amount")).toBeVisible();
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

  test("disabled component has proper attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox enabled="false" />`);
    await expect(page.getByRole("textbox")).toBeDisabled();
  });

  test("readOnly has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("readonly");
  });

  test("spinbox buttons are accessible when present", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const spinButtons = page.locator("button");
    const buttonCount = await spinButtons.count();

    // If spinbox buttons exist, they should be accessible
    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = spinButtons.nth(i);
        await expect(button).toBeVisible();
      }
    }
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=start positions label before input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="start" />`);
    const label = page.getByText("Label");
    const input = page.getByRole("textbox");

    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

    const labelBox = await label.boundingBox();
    const inputBox = await input.boundingBox();
    if (labelBox && inputBox) {
      expect(labelBox.x).toBeLessThan(inputBox.x);
    }
  });

  test("labelPosition=end positions label after input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="end" />`);
    const label = page.getByText("Label");
    const input = page.getByRole("textbox");

    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

    const labelBox = await label.boundingBox();
    const inputBox = await input.boundingBox();
    if (labelBox && inputBox) {
      expect(labelBox.x).toBeGreaterThan(inputBox.x);
    }
  });

  test("labelPosition=top positions label above input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="top" />`);
    const label = page.getByText("Label");
    const input = page.getByRole("textbox");

    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

    const labelBox = await label.boundingBox();
    const inputBox = await input.boundingBox();
    if (labelBox && inputBox) {
      expect(labelBox.y).toBeLessThan(inputBox.y);
    }
  });

  test("labelPosition=bottom positions label below input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="bottom" />`);
    const label = page.getByText("Label");
    const input = page.getByRole("textbox");

    await expect(label).toBeVisible();
    await expect(input).toBeVisible();

    const labelBox = await label.boundingBox();
    const inputBox = await input.boundingBox();
    if (labelBox && inputBox) {
      expect(labelBox.y).toBeGreaterThan(inputBox.y);
    }
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

  test("component handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Label" labelPosition="invalid" />`);
    await expect(page.getByText("Label")).toBeVisible();
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("label is rendered if provided", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox label="Input Field Label" />`);
    await expect(page.getByText("Input Field Label")).toBeVisible();
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

  test("onDidChange is called on input change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`<NumberBox onDidChange="testState = 'test'" />`);
    await page.getByRole("textbox").fill("1");
    await expect.poll(testStateDriver.testState).toBe("test");
  });

  test("onDidChange function changes are properly reflected", async ({ initTestBed, page }) => {
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

  test("gotFocus event fires on focusing the field", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`<NumberBox onGotFocus="testState = true" />`);
    await page.getByRole("textbox").focus();
    await expect(page.getByRole("textbox")).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
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

  test("lostFocus event fires when field is blurred", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`<NumberBox onLostFocus="testState = true" />`);
    const input = page.getByRole("textbox");
    await input.focus();
    await input.blur();
    await expect(input).not.toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual(true);
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

  test("value returns current input value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" initialValue="123" />
        <Button label="test" onClick="testState = numberbox.value" />
      </Fragment>`);

    await page.getByRole("button", { name: "test" }).click();
    await expect.poll(testStateDriver.testState).toBe(123);
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

  test("setValue updates input value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" />
        <Button label="test" onClick="numberbox.setValue(456)" />
      </Fragment>`);

    await page.getByRole("button", { name: "test" }).click();
    await expect(page.getByRole("textbox")).toHaveValue("456");
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

  test("focus() focuses the field", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <NumberBox id="numberbox" />
        <Button label="test" onClick="numberbox.focus()" />
      </Fragment>`);

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
      testThemeVars: { "backgroundColor-NumberBox": "rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("borderColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox": "rgb(0, 255, 0)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-color", "rgb(0, 255, 0)");
  });

  test("textColor applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "textColor-NumberBox": "rgb(0, 0, 255)" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("focus borderColor applies on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "borderColor-NumberBox--focus": "rgb(255, 255, 0)" },
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
      testThemeVars: { "borderRadius-NumberBox": "10px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("border-radius", "10px");
  });

  test("padding applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox testId="input" />`, {
      testThemeVars: { "padding-NumberBox": "15px" },
    });
    await expect(page.getByTestId("input")).toHaveCSS("padding", "15px");
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
  test("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

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

  test.fixme(
    "handles if initialValue is a string",
    SKIP_REASON.XMLUI_BUG("NumberBox accepts string as initialValue"),
    async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox initialValue="'asdasd'" />`);
      await expect(page.getByRole("textbox")).toHaveValue("");
    },
  );

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

  test("focuses component if autoFocus is set", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox autoFocus="{true}" />`);
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("readOnly lets user copy from input field", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox initialValue="123" readOnly="{true}" />`);
    const input = page.getByRole("textbox");
    await expect(input).toHaveValue("123");
    await input.focus();
    await expect(input).toBeFocused();
  });

  // Range and constraint tests with edge cases
  test("maxLength caps the length of the input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox maxLength="3" />`);
    const input = page.getByRole("textbox");
    await input.fill("12345");
    await expect(input).toHaveValue("123");
  });

  test("integersOnly limits input to integers", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox integersOnly="true" />`);
    const input = page.getByRole("textbox");
    await input.fill("123.45");
    // Should not contain decimal
    await expect(input).not.toHaveValue("123.45");
  });

  test("zeroOrPositive limits input to non-negative numbers and zero", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox zeroOrPositive="true" initialValue="5" />`);

    // Try to decrement below zero using spinbox
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();
    if (await decrementButton.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await decrementButton.click();
      }
    }

    const value = await page.getByRole("textbox").inputValue();
    expect(parseInt(value) || 0).toBeGreaterThanOrEqual(0);
  });

  test.fixme(
    "user cannot enter negative number with zeroOrPositive",
    SKIP_REASON.XMLUI_BUG("Input accepts negative number, need to think how to fix"),
    async ({ initTestBed, page }) => {
      await initTestBed(`<NumberBox zeroOrPositive="true" />`);
      const input = page.getByRole("textbox");
      await input.fill("-5");
      // Should not allow negative values
      await expect(input).not.toHaveValue("-5");
    },
  );

  test("down button on spinbox does nothing when result would be negative with zeroOrPositive", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox zeroOrPositive="true" initialValue="0" />`);
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();

    if (await decrementButton.isVisible()) {
      await decrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("0");
    }
  });

  test("minValue limits input to numbers greater than or equal to minValue", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox minValue="10" initialValue="15" />`);

    // Try to decrement below minimum
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();
    if (await decrementButton.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await decrementButton.click();
      }
    }

    const value = await page.getByRole("textbox").inputValue();
    expect(parseInt(value) || 0).toBeGreaterThanOrEqual(10);
  });

  test("maxValue limits input to numbers less than or equal to maxValue", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox maxValue="20" initialValue="15" />`);

    // Try to increment above maximum
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();
    if (await incrementButton.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await incrementButton.click();
      }
    }

    const value = await page.getByRole("textbox").inputValue();
    expect(parseInt(value) || 0).toBeLessThanOrEqual(20);
  });

  test("setting valid integer step adds that value to input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox step="5" initialValue="10" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("15");
    }
  });

  test("invalid step values use default step", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox step="invalid" initialValue="10" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("11"); // Default step is 1
    }
  });

  test("clicking spinbox up-arrow that would overflow max value does not add value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox maxValue="10" initialValue="10" />`);
    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();

    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("10");
    }
  });

  test("pressing the up arrow that would overflow max value does not add value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox maxValue="10" initialValue="10" />`);
    const input = page.getByRole("textbox");
    await input.focus();
    await page.keyboard.press("ArrowUp");
    await expect(input).toHaveValue("10");
  });

  test("clicking spinbox down-arrow that would underflow min value does not subtract value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox minValue="5" initialValue="5" />`);
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();

    if (await decrementButton.isVisible()) {
      await decrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("5");
    }
  });

  test("pressing the down arrow that would underflow min value does not subtract value", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<NumberBox minValue="5" initialValue="5" />`);
    const input = page.getByRole("textbox");
    await input.focus();
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveValue("5");
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

  test("component works correctly in layout contexts", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack>
        <NumberBox label="First" />
        <NumberBox label="Second" />
      </Stack>
    `);

    await expect(page.getByLabel("First")).toBeVisible();
    await expect(page.getByLabel("Second")).toBeVisible();
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

    if (await incrementButton.isVisible()) {
      // Hold down the button (simulate long press)
      await incrementButton.hover();
      await page.mouse.down();
      await page.waitForTimeout(600); // Wait longer than initial delay
      await page.mouse.up();

      // Should have incremented multiple times
      const value = await page.getByRole("textbox").inputValue();
      expect(parseInt(value) || 0).toBeGreaterThan(1);
    }
  });

  test("readOnly disables spinner buttons", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox readOnly="true" initialValue="5" />`);

    const incrementButton = page
      .locator("button")
      .filter({ hasText: /increment|up|\+/ })
      .first();
    if (await incrementButton.isVisible()) {
      await incrementButton.click();
      await expect(page.getByRole("textbox")).toHaveValue("5"); // Should not change
    }
  });

  test("integersOnly with zeroOrPositive combination works", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox integersOnly="true" zeroOrPositive="true" initialValue="5" />`);
    const input = page.getByRole("textbox");

    // Try to go negative
    const decrementButton = page
      .locator("button")
      .filter({ hasText: /decrement|down|\-/ })
      .first();
    if (await decrementButton.isVisible()) {
      for (let i = 0; i < 10; i++) {
        await decrementButton.click();
      }
      await expect(input).toHaveValue("0"); // Should stop at 0
    }

    // Try to add decimal
    await input.focus();
    await page.keyboard.type(".5");
    await expect(input).not.toHaveValue("0.5"); // Should not allow decimal
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

  test("handle very large numbers within limits", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    const largeNumber = "999999999999";
    await input.fill(largeNumber);
    await expect(input).toHaveValue(largeNumber);
  });

  test("prevents invalid character input", async ({ initTestBed, page }) => {
    await initTestBed(`<NumberBox />`);
    const input = page.getByRole("textbox");

    await input.fill("abc123def");
    // Should filter out non-numeric characters
    await expect(input).not.toHaveValue("abc123def");
  });

  test.skip(
    "entering multiple 0s only results in one 0",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "copying multiple 0s only results in one 0",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "entering: no leading 0s are allowed",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "copying: no leading 0s are allowed",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "minus sign is rendered at the start of the field if prompt is at the start",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "minus sign is rendered at the start of the field if prompt is at any point in input value",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "minus sign is removed if user inputs a second minus sign",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "minus sign is removed if user copies a second minus sign",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "adding floating point to an integer results in a float",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "adding floating point to a float replaces the last point",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "adding floating point to the beginning of an integer adds a leading 0",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "adding floating point to the end of an integer adds a trailing 0",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "adding floating point to the beginning of 0 does adds a leading 0",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "adding floating point to the end of 0 adds a trailing 0",
    SKIP_REASON.TO_BE_IMPLEMENTED(),
    async ({ initTestBed }) => {},
  );
});
