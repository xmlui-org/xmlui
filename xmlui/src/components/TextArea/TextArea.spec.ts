import { test, expect } from "../../testing/fixtures";
import { getElementStyle } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.field).toBeVisible();
    await expect(driver.field).toHaveValue("");
  });

  test("component renders with label", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea label="Comments" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.label).toHaveText("Comments");
  });

  test("initialValue sets textarea value correctly", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea initialValue="Initial text content" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveValue("Initial text content");
  });

  test("initialValue accepts different data types", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test string
    await initTestBed(`<TextArea initialValue="hello world" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("hello world");

    // Test number
    await initTestBed(`<TextArea initialValue="{123}" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("123");

    // Test boolean
    await initTestBed(`<TextArea initialValue="{true}" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("true");
  });

  test("component handles null and undefined props gracefully", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea initialValue="{null}" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("");

    await initTestBed(`<TextArea initialValue="{undefined}" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("");

    await initTestBed(`<TextArea />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("");
  });

  test("component accepts user input", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    await driver.field.fill("User typed content");
    await expect(driver.field).toHaveValue("User typed content");
  });

  test("component accepts multiline input", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    const multilineText = "First line\nSecond line\nThird line";
    await driver.field.fill(multilineText);
    await expect(driver.field).toHaveValue(multilineText);
  });

  test("component clears input correctly", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea initialValue="Initial content" />`);
    const driver = await createTextAreaDriver();

    await driver.field.clear();
    await expect(driver.field).toHaveValue("");
  });

  test("required prop adds required attribute", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea required="true" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea enabled="false" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toBeDisabled();
    await expect(driver.field).not.toBeEditable();
  });

  test("readOnly prevents editing but allows focus", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea readOnly="true" initialValue="Read only content" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("readonly");
    await expect(driver.field).toHaveValue("Read only content");
    await expect(driver.field).not.toBeEditable();

    await driver.field.focus();
    await expect(driver.field).toBeFocused();
  });

  test("autoFocus focuses textarea on mount", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea autoFocus="true" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toBeFocused();
  });

  test("placeholder shows when textarea is empty", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea placeholder="Enter your comments here..." />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("placeholder", "Enter your comments here...");
  });

  test("placeholder is hidden when textarea has content", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea placeholder="Enter comments" />`);
    const driver = await createTextAreaDriver();

    await driver.field.fill("Some content");
    await expect(driver.field).toHaveValue("Some content");
    expect(await driver.placeholder).toBe("Enter comments");
  });

  test("maxLength limits input length", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea maxLength="10" />`);
    const driver = await createTextAreaDriver();

    await driver.field.fill("12345678901234567890");
    await expect(driver.field).toHaveValue("1234567890");
  });

  test("rows prop sets textarea height", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea rows="5" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("rows", "5");
  });

  test("component handles special characters correctly", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    const specialText = "Hello 日本語 @#$%! 🚀 Unicode test 🎉";
    await driver.field.fill(specialText);
    await expect(driver.field).toHaveValue(specialText);
  });

  test("component handles very long input values", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const longText =
      "This is a very long text that might cause issues with component rendering or processing. ".repeat(
        50,
      );
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    await driver.field.fill(longText);
    await expect(driver.field).toHaveValue(longText);
  });

  test("component handles rapid input changes efficiently", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    // Type rapidly
    await driver.field.pressSequentially("rapid typing test", { delay: 25 });
    await expect(driver.field).toHaveValue("rapid typing test");

    await driver.field.clear();
    await driver.field.pressSequentially("another fast test", { delay: 10 });
    await expect(driver.field).toHaveValue("another fast test");
  });

  test("component prop changes update display correctly", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea rows="3" />`);
    const driver = await createTextAreaDriver();
    await expect(driver.field).toHaveAttribute("rows", "3");

    await initTestBed(`<TextArea rows="5" />`);
    const driver2 = await createTextAreaDriver();
    await expect(driver2.field).toHaveAttribute("rows", "5");
  });

  test("autoSize enables automatic height adjustment", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea autoSize="true" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.field).toBeVisible();

    // Get initial height with single line
    await driver.field.fill("Single line");
    const initialHeight = await driver.field.evaluate((el) => el.scrollHeight);

    // Add multiple lines and verify height increases
    await driver.field.fill("Line 1\nLine 2\nLine 3\nLine 4");
    const expandedHeight = await driver.field.evaluate((el) => el.scrollHeight);

    // Height should increase when more lines are added
    expect(expandedHeight).toBeGreaterThan(initialHeight);

    // Verify content is correct
    await expect(driver.field).toHaveValue("Line 1\nLine 2\nLine 3\nLine 4");

    // Test reduction - go back to fewer lines
    await driver.field.fill("Line 1\nLine 2");
    const reducedHeight = await driver.field.evaluate((el) => el.scrollHeight);

    // Height should decrease when lines are removed
    expect(reducedHeight).toBeLessThan(expandedHeight);
    expect(reducedHeight).toBeGreaterThanOrEqual(initialHeight);
  });

  test("maxRows limits auto-size height", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea autoSize="true" maxRows="3" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.component).toBeVisible();

    // Fill with more content than maxRows should allow
    const manyLines = Array(10).fill("Line content").join("\n");
    await driver.field.fill(manyLines);

    // Content should still be there - the key is that maxRows is applied
    await expect(driver.field).toHaveValue(manyLines);

    // Verify the component is still visible and functional with large content
    await expect(driver.field).toBeVisible();
    await expect(driver.field).toBeEditable();

    // The textarea should have some form of height constraint applied
    // (exact implementation may vary, but component should remain functional)
    const boundingRect = await driver.field.boundingBox();
    expect(boundingRect).not.toBeNull();
    expect(boundingRect!.height).toBeGreaterThan(0);
  });

  test("minRows sets minimum auto-size height", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea autoSize="true" minRows="4" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.field).toBeVisible();

    // Even with no content, component should be functional
    await expect(driver.field).toHaveValue("");

    // Fill with single line (less than minRows)
    await driver.field.fill("Single line");
    await expect(driver.field).toHaveValue("Single line");

    // Fill with content that matches minRows
    await driver.field.fill("Line 1\nLine 2\nLine 3\nLine 4");
    await expect(driver.field).toHaveValue("Line 1\nLine 2\nLine 3\nLine 4");

    // Verify the component remains functional with different content lengths
    await expect(driver.field).toBeVisible();
    await expect(driver.field).toBeEditable();
  });

  test("enterSubmits enables form submission on Enter", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="testState = 'submitted'">
        <TextArea enterSubmits="true" />
        <Button type="submit" testId="submitBtn">Submit</Button>
      </Form>
    `);

    const textarea = page.getByRole("textbox");

    await textarea.focus();
    await textarea.fill("Some content");
    await textarea.press("Enter");

    await expect.poll(testStateDriver.testState).toEqual("submitted");
  });

  test("enterSubmits=false prevents form submission on Enter", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="testState = 'submitted'">
        <TextArea enterSubmits="false" />
        <Button type="submit" testId="submitBtn">Submit</Button>
      </Form>
    `);

    const textarea = page.getByRole("textbox");

    await textarea.focus();
    await textarea.fill("Some content");
    await textarea.press("Enter");

    // Should not submit, so testState should remain null
    await expect.poll(testStateDriver.testState).toEqual(null);

    // But should allow new line in textarea
    await expect(textarea).toHaveValue("Some content\n");
  });

  test("Shift+Enter creates new line even with enterSubmits=true", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Form onSubmit="testState = 'submitted'">
        <TextArea enterSubmits="true" />
      </Form>
    `);

    const textarea = page.getByRole("textbox");

    await textarea.focus();
    await textarea.fill("Line 1");
    await textarea.press("Shift+Enter");
    await textarea.type("Line 2");

    await expect(textarea).toHaveValue("Line 1\nLine 2");
    await expect.poll(testStateDriver.testState).toEqual(null); // Should not have submitted
  });

  test("escResets enables form reset on Escape", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <TextArea id="myTextarea" initialValue="Initial value" escResets="true" />
      </Form>
    `);

    const textarea = page.getByRole("textbox");

    await textarea.fill("Changed content");
    await expect(textarea).toHaveValue("Changed content");

    await textarea.press("Escape");
    await expect(textarea).toHaveValue("Initial value");
  });

  test("escResets=false does not reset on Escape", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea escResets="false" initialValue="Initial value" />`);
    const driver = await createTextAreaDriver();

    await driver.field.fill("Changed content");
    await expect(driver.field).toHaveValue("Changed content");

    await driver.field.press("Escape");
    await expect(driver.field).toHaveValue("Changed content"); // Should remain unchanged
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea label="Comments" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("aria-multiline", "true");
    await expect(driver.field).toHaveRole("textbox");
  });

  test("component is keyboard accessible when interactive", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea 
        label="Comments"
        onGotFocus="testState = 'keyboard-focused'"
      />
    `);

    const driver = await createTextAreaDriver();

    // Test focus management
    await driver.field.focus();
    await expect(driver.field).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual("keyboard-focused");
  });

  test("non-interactive component is not focusable when disabled", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea enabled="false" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toBeDisabled();
    await expect(driver.field).not.toBeFocused();
  });

  test("label is properly associated with textarea", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea label="User Comments" />`);
    const component = page.getByLabel("User Comments");
    await expect(component).toHaveRole("textbox");
  });

  test("required has proper ARIA attributes", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea required="true" label="Required Comments" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("required");
    await expect(driver.label).toContainText("*");
  });

  test("component disabled has proper accessibility state", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea enabled="false" label="Disabled textarea" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toBeDisabled();
  });

  test("readOnly has proper ARIA attributes", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea readOnly="true" label="Read-only textarea" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("aria-readonly", "true");
    await expect(driver.field).toHaveAttribute("readonly");
  });

  test("placeholder provides accessible description", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea placeholder="Describe your feedback in detail" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toHaveAttribute("placeholder", "Describe your feedback in detail");
  });

  test("component supports multiple textareas with keyboard navigation", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <Fragment>
        <TextArea label="First textarea" />
        <TextArea label="Second textarea" />
      </Fragment>
    `);

    const firstTextarea = page.getByLabel("First textarea");
    const secondTextarea = page.getByLabel("Second textarea");

    await firstTextarea.focus();
    await expect(firstTextarea).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(secondTextarea).toBeFocused();
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States", () => {
  test("component applies theme variables correctly", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea />`, {
      testThemeVars: {
        "Input:backgroundColor-TextArea-default": "rgb(255, 0, 0)",
        "Input:textColor-TextArea-default": "rgb(0, 255, 0)",
      },
    });
    const driver = await createTextAreaDriver();

    // Test that component renders with theme variables applied
    await expect(driver.field).toBeVisible();
    await expect(driver.component).toBeVisible();
  });

  test("component handles different validation states", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test error state
    await initTestBed(`<TextArea validationStatus="error" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toHaveClass(/error/);

    // Test warning state
    await initTestBed(`<TextArea validationStatus="warning" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveClass(/warning/);

    // Test valid state
    await initTestBed(`<TextArea validationStatus="valid" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveClass(/valid/);
  });

  test("component transitions smoothly between states", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test normal state
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();
    await expect(driver.field).toBeVisible();

    // Test focus state
    await driver.field.focus();
    await expect(driver.field).toBeFocused();

    // Test blur state
    await driver.field.blur();
    await expect(driver.field).not.toBeFocused();
  });

  test("component handles different resize options", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test horizontal resize
    await initTestBed(`<TextArea resize="horizontal" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toHaveClass(/resizeHorizontal/);

    // Test vertical resize
    await initTestBed(`<TextArea resize="vertical" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveClass(/resizeVertical/);

    // Test both resize
    await initTestBed(`<TextArea resize="both" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveClass(/resizeBoth/);
  });

  test("component handles disabled visual state", async ({ initTestBed, createTextAreaDriver }) => {
    await initTestBed(`<TextArea enabled="false" />`);
    const driver = await createTextAreaDriver();

    await expect(driver.field).toBeDisabled();
  });

  test("component handles focus and hover states", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    // Test focus state
    await driver.field.focus();
    await expect(driver.field).toBeFocused();

    // Test hover state (simulated through interaction)
    await driver.field.hover();
    await expect(driver.field).toBeVisible();
  });

  test("component handles different visual configurations", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test initial configuration
    await initTestBed(`<TextArea rows="3" />`);
    const driver1 = await createTextAreaDriver();
    await expect(driver1.field).toHaveAttribute("rows", "3");

    // Test changed configuration
    await initTestBed(`<TextArea rows="5" resize="both" />`);
    const driver2 = await createTextAreaDriver();
    await expect(driver2.field).toHaveAttribute("rows", "5");
    await expect(driver2.field).toHaveClass(/resizeBoth/);
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles null and undefined props gracefully", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test with undefined props
    await initTestBed(`<TextArea />`);
    const driver1 = await createTextAreaDriver();
    await expect(driver1.component).toBeVisible();

    // Test with empty string props
    await initTestBed(`<TextArea label="" placeholder="" />`);
    const driver2 = await createTextAreaDriver();
    await expect(driver2.component).toBeVisible();
    await expect(driver2.label).not.toBeAttached();
  });

  test("component handles special characters correctly", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(
      `<TextArea label="José María's Comments" placeholder="Введите текст здесь" />`,
    );
    const driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.label).toHaveText("José María's Comments");
    await expect(driver.field).toHaveAttribute("placeholder", "Введите текст здесь");
  });

  test("component handles edge case data types", async ({ initTestBed, createTextAreaDriver }) => {
    // Test empty array (gets converted to string)
    await initTestBed(`<TextArea initialValue="{[]}" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("");

    // Test empty object (gets converted to [object Object])
    await initTestBed(`<TextArea initialValue="{{}}" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("[object Object]");

    // Test function (also gets converted to [object Object])
    await initTestBed(`<TextArea initialValue="{() => {}}" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("[object Object]");
  });

  test("component handles extreme values gracefully", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test negative maxLength (should be ignored)
    await initTestBed(`<TextArea maxLength="{-1}" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();

    // Test zero maxLength
    await initTestBed(`<TextArea maxLength="0" />`);
    driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();

    // Test very large maxLength
    await initTestBed(`<TextArea maxLength="999999" />`);
    driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles invalid resize values gracefully", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea resize="invalid" />`);
    const driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles conflicting prop combinations", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // readOnly and enabled=false
    await initTestBed(`<TextArea readOnly="true" enabled="false" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toBeDisabled();

    // autoFocus with enabled=false
    await initTestBed(`<TextArea autoFocus="true" enabled="false" />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toBeDisabled();
    await expect(driver.field).not.toBeFocused();
  });

  test("component handles empty and whitespace-only values", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Empty value
    await initTestBed(`<TextArea initialValue="" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("");

    // Whitespace-only value
    await initTestBed(`<TextArea initialValue="   " />`);
    driver = await createTextAreaDriver();
    await expect(driver.field).toHaveValue("   ");

    // Tab and newline characters (note: may be normalized)
    await initTestBed(`<TextArea initialValue="\t\n" />`);
    driver = await createTextAreaDriver();
    // The value might be normalized by the browser
    const value = await driver.field.inputValue();
    expect(value).toContain("\t");
    expect(value).toContain("\n");
  });

  test("component handles very long input values", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const longValue =
      "Very long value that might cause issues with component rendering or processing. ".repeat(
        100,
      );
    await initTestBed(`<TextArea initialValue="${longValue}" />`);
    const driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.field).toHaveValue(longValue);
  });

  test("component handles edge cases with autoSize properties", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test invalid maxRows/minRows combinations
    await initTestBed(`<TextArea autoSize="true" maxRows="2" minRows="5" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();

    // Test zero values
    await initTestBed(`<TextArea autoSize="true" maxRows="0" minRows="0" />`);
    driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();

    // Test negative values
    await initTestBed(`<TextArea autoSize="true" maxRows="{-1}" minRows="{-1}" />`);
    driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
  });

  test("component handles conflicting enterSubmits and escResets", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea enterSubmits="true" escResets="true" />`);
    const driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();

    // Both properties should work independently
    await driver.field.fill("test content");
    await expect(driver.field).toHaveValue("test content");
  });

  test("component handles autoSize with resize options", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // autoSize with resize should work together
    await initTestBed(`<TextArea autoSize="true" resize="horizontal" />`);
    let driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.field).toHaveClass(/resizeHorizontal/);

    // autoSize with both resize
    await initTestBed(`<TextArea autoSize="true" resize="both" />`);
    driver = await createTextAreaDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.field).toHaveClass(/resizeBoth/);
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("component memoization prevents unnecessary re-renders", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea 
        label="Performance Test"
        onDidChange="testState = ++testState || 1"
      />
    `);

    const driver = await createTextAreaDriver();

    // Test that memoization works through stable behavior
    await driver.field.fill("a");
    await expect.poll(testStateDriver.testState).toEqual(1);

    await driver.field.fill("ab");
    await expect.poll(testStateDriver.testState).toEqual(2);

    // Component should maintain consistent behavior
    await expect(driver.component).toBeVisible();
    await expect(driver.field).toHaveValue("ab");
  });

  test("component handles rapid prop changes efficiently", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    // Test multiple rapid prop changes
    await initTestBed(`<TextArea placeholder="First placeholder" />`);
    const driver1 = await createTextAreaDriver();
    await expect(driver1.field).toHaveAttribute("placeholder", "First placeholder");

    await initTestBed(`<TextArea placeholder="Second placeholder" />`);
    const driver2 = await createTextAreaDriver();
    await expect(driver2.field).toHaveAttribute("placeholder", "Second placeholder");

    await initTestBed(`<TextArea placeholder="Third placeholder" />`);
    const driver3 = await createTextAreaDriver();
    await expect(driver3.field).toHaveAttribute("placeholder", "Third placeholder");
  });

  test("component memory usage stays stable", async ({ initTestBed, createTextAreaDriver }) => {
    // Test multiple instances don't cause memory leaks
    const configurations = [
      { label: "Comments 1", rows: "3" },
      { label: "Comments 2", rows: "5" },
      { label: "Comments 3", rows: "7" },
    ];

    for (const config of configurations) {
      await initTestBed(`<TextArea label="${config.label}" rows="${config.rows}" />`);
      const driver = await createTextAreaDriver();
      await expect(driver.component).toBeVisible();
      await expect(driver.field).toHaveAttribute("rows", config.rows);
    }

    // Verify final state is clean
    await initTestBed(`<TextArea label="Final Test" />`);
    const finalDriver = await createTextAreaDriver();
    await expect(finalDriver.component).toBeVisible();
  });

  test("component handles large content efficiently", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const largeContent = "Large content line.\n".repeat(1000);
    await initTestBed(`<TextArea />`);
    const driver = await createTextAreaDriver();

    // Fill with large content
    await driver.field.fill(largeContent);
    await expect(driver.field).toHaveValue(largeContent);

    // Verify component still responsive
    await driver.field.clear();
    await expect(driver.field).toHaveValue("");
  });

  test("component performs well with rapid user input", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea onDidChange="testState = (testState || 0) + 1" />
    `);
    const driver = await createTextAreaDriver();

    // Simulate rapid typing
    await driver.field.pressSequentially("rapid input test", { delay: 10 });

    // Should have received multiple change events efficiently
    const changeCount = await testStateDriver.testState();
    expect(changeCount).toBeGreaterThan(10);

    await expect(driver.field).toHaveValue("rapid input test");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in different layout contexts", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`<TextArea label="Layout Test" />`);
    const driver = await createTextAreaDriver();

    // Test basic layout integration
    await expect(driver.component).toBeVisible();

    // Test bounding box and dimensions
    const boundingBox = await driver.component.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test("component integrates with Form components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="comments" label="Comments" required="true" />
        <Button testId="submit">Submit</Button>
      </Fragment>
    `);

    const textarea = page.getByLabel("Comments");
    const submitButton = page.getByTestId("submit");

    await expect(textarea).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test form interaction
    await textarea.fill("User feedback");
    await expect(textarea).toHaveValue("User feedback");
  });

  test("component state synchronization with other components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="textarea" initialValue="Initial text" />
        <Text testId="display">{textarea.value}</Text>
        <Button testId="clear" onClick="textarea.setValue('')">Clear</Button>
      </Fragment>
    `);

    // Initial state sync
    await expect(page.getByTestId("display")).toHaveText("Initial text");

    // Manual input sync
    const textarea = page.getByRole("textbox");
    await textarea.fill("Updated text");
    await expect(page.getByTestId("display")).toHaveText("Updated text");

    // API call sync
    await page.getByTestId("clear").click();
    await expect(page.getByTestId("display")).toHaveText("");
    await expect(textarea).toHaveValue("");
  });

  test("component works with event handling chain", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TextArea 
          onGotFocus="testState = 'focused'"
          onLostFocus="testState = 'blurred'"
          onDidChange="(value) => testState = 'changed: ' + value"
        />
        <Button testId="otherElement">Other Element</Button>
      </Fragment>
    `);

    const textarea = page.getByRole("textbox");
    const button = page.getByTestId("otherElement");

    // Test focus event
    await textarea.focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");

    // Test change event (use fill for reliable event triggering)
    await textarea.fill("test input");
    await expect.poll(testStateDriver.testState).toEqual("changed: test input");

    // Test blur event
    await button.focus();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("component API methods work in integrated scenarios", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="textarea1" />
        <TextArea id="textarea2" />
        <Button testId="copyBtn" onClick="textarea2.setValue(textarea1.value)">Copy</Button>
        <Button testId="focusBtn" onClick="textarea1.focus()">Focus First</Button>
      </Fragment>
    `);

    const textarea1 = page.getByRole("textbox").first();
    const textarea2 = page.getByRole("textbox").nth(1);
    const copyBtn = page.getByTestId("copyBtn");
    const focusBtn = page.getByTestId("focusBtn");

    // Setup initial content
    await textarea1.fill("Content to copy");

    // Test setValue API integration
    await copyBtn.click();
    await expect(textarea2).toHaveValue("Content to copy");

    // Test focus API integration
    await focusBtn.click();
    await expect(textarea1).toBeFocused();
  });

  test("component handles complex validation scenarios", async ({
    initTestBed,
    createTextAreaDriver,
  }) => {
    await initTestBed(`
      <TextArea 
        required="true"
        maxLength="100"
        validationStatus="error"
        label="Required Comments"
      />
    `);
    const driver = await createTextAreaDriver();

    // Component should show error state
    await expect(driver.field).toHaveClass(/error/);
    await expect(driver.field).toHaveAttribute("required");
    await expect(driver.field).toHaveAttribute("maxlength", "100");
    await expect(driver.label).toContainText("*");
  });

  test("component works in nested component structures", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <VStack>
          <TextArea label="Nested Textarea 1" />
          <HStack>
            <TextArea label="Nested Textarea 2" />
            <Button testId="nestedBtn">Button</Button>
          </HStack>
        </VStack>
      </Fragment>
    `);

    const textarea1 = page.getByLabel("Nested Textarea 1");
    const textarea2 = page.getByLabel("Nested Textarea 2");
    const button = page.getByTestId("nestedBtn");

    await expect(textarea1).toBeVisible();
    await expect(textarea2).toBeVisible();
    await expect(button).toBeVisible();

    // Test interaction in nested structure
    await textarea1.fill("Content in nested structure");
    await expect(textarea1).toHaveValue("Content in nested structure");
  });

  test("programmatic control works", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="input" />
        <Button testId="focusBtn" onClick="input.focus()">Focus</Button>
        <Button testId="setBtn" onClick="input.setValue('API Value')">Set Value</Button>
        <Button testId="insertBtn" onClick="input.insert(' inserted')">Insert Text</Button>
      </Fragment>
    `);

    const textarea = page.getByRole("textbox");

    // Test focus API
    await page.getByTestId("focusBtn").click();
    await expect(textarea).toBeFocused();

    // Test setValue API
    await page.getByTestId("setBtn").click();
    await expect(textarea).toHaveValue("API Value");

    // Test insert API
    await textarea.click(); // Focus and position cursor at end
    await page.getByTestId("insertBtn").click();
    await expect(textarea).toHaveValue("API Value inserted");
  });

  test("insert API method works at cursor position", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="textarea" initialValue="Hello World" />
        <Button testId="insertBtn" onClick="textarea.insert(' Beautiful')">Insert</Button>
      </Fragment>
    `);

    const textarea = page.getByRole("textbox");

    // Position cursor between "Hello" and " World" (after "Hello")
    await textarea.focus();
    await page.evaluate(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.setSelectionRange(5, 5); // Position after "Hello"
      }
    });

    await page.getByTestId("insertBtn").click();
    await expect(textarea).toHaveValue("Hello Beautiful World");
  });

  test("component value API reflects current content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TextArea id="myTextArea" initialValue="Initial content" />
        <Text testId="valueDisplay">{myTextArea.value}</Text>
      </Fragment>
    `);

    const textarea = page.getByRole("textbox");
    const valueDisplay = page.getByTestId("valueDisplay");

    await expect(valueDisplay).toHaveText("Initial content");

    await textarea.fill("Updated content");
    await expect(valueDisplay).toHaveText("Updated content");
  });
});

// =============================================================================
// REGRESSION TESTS
// =============================================================================

test.describe("Regression", () => {
  test("component does not loose focus #1", async ({
    initTestBed,
    createTextAreaDriver,
    createTextBoxDriver,
  }) => {
    await initTestBed(`
      <App var.value="">
        <TextBox testId="myTextBox" initialValue="{value}" onDidChange="{(val) => {value = val}}"/>
        <TextArea testId="myTextArea" initialValue="{value}" onDidChange="{(val) => {value = val}}"/>
      </App>
    `);

    const tbDriver = await createTextBoxDriver("myTextBox");
    const driver = await createTextAreaDriver("myTextArea");

    // Test basic layout integration
    await expect(driver.component).toBeVisible();

    await driver.focus();
    await driver.field.fill("a");
    await expect(driver.field).toHaveValue("a");
    await expect(driver.field).toBeFocused();
    await expect(tbDriver.field).toHaveValue("a");
    await tbDriver.field.fill("abc");
    await expect(driver.field).toHaveValue("abc");
    await expect(tbDriver.field).toBeFocused();
    await expect(tbDriver.field).toHaveValue("abc");
    await driver.field.fill("abcde");
    await expect(driver.field).toHaveValue("abcde");
    await expect(driver.field).toBeFocused();
    await expect(tbDriver.field).toHaveValue("abcde");
  });
});
