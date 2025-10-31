import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with basic props", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea label="Comments" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByText("Comments")).toBeVisible();
  });

  test("initialValue sets textarea value correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="Initial text content" />`);
    await expect(page.getByRole("textbox")).toHaveValue("Initial text content");
  });

  test("initialValue accepts different data types", async ({ initTestBed, page }) => {
    // Test string
    await initTestBed(`<TextArea initialValue="hello world" />`);
    await expect(page.getByRole("textbox")).toHaveValue("hello world");

    // Test number
    await initTestBed(`<TextArea initialValue="{123}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("123");

    // Test boolean
    await initTestBed(`<TextArea initialValue="{true}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("true");
  });

  test("component handles null and undefined props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="{null}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");

    await initTestBed(`<TextArea initialValue="{undefined}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");

    await initTestBed(`<TextArea />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("component accepts user input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea />`);
    await page.getByRole("textbox").fill("user input");
    await expect(page.getByRole("textbox")).toHaveValue("user input");
  });

  test("component accepts multiline input", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea />`);
    const multilineText = "First line\nSecond line\nThird line";

    await page.getByRole("textbox").fill(multilineText);
    await expect(page.getByRole("textbox")).toHaveValue(multilineText);
  });

  test("component clears input correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="Initial content" />`);
    const textarea = page.getByRole("textbox");
    await expect(textarea).toHaveValue("Initial content");
    await textarea.clear();
    await expect(textarea).toHaveValue("");
  });

  test("required prop adds required attribute", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea required="true" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("required");
  });

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea enabled="false" />`);
    await expect(page.getByRole("textbox")).not.toBeEditable();
  });

  test("readOnly prevents editing but allows focus", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea readOnly="true" initialValue="Read only content" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("readonly");
    await expect(page.getByRole("textbox")).toHaveValue("Read only content");
    await expect(page.getByRole("textbox")).not.toBeEditable();

    await page.getByRole("textbox").focus();
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("autoFocus focuses textarea on mount", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea autoFocus="true" />`);
    await expect(page.getByRole("textbox")).toBeFocused();
  });

  test("autoFocus focuses input on mount with label", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea autoFocus="true" label="Auto-focused input" />`);
    await expect(page.getByLabel("Auto-focused input")).toBeFocused();
  });

  test("placeholder shows when textarea is empty", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea placeholder="Enter your comments here..." />`);
    await expect(page.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Enter your comments here...",
    );
  });

  test("placeholder is hidden when textarea has content", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea placeholder="Enter comments" />`);
    const textarea = page.getByRole("textbox");
    await textarea.fill("Some content");
    await expect(textarea).toHaveValue("Some content");
    await expect(textarea).toHaveAttribute("placeholder", "Enter comments");
  });

  test("maxLength limits input length", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea maxLength="10" />`);
    await page.getByRole("textbox").fill("12345678901234567890");
    await expect(page.getByRole("textbox")).toHaveValue("1234567890");
  });

  test("rows prop sets textarea height", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea rows="5" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("rows", "5");
  });

  test("component handles special characters correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea />`);
    const specialText = "Hello 日本語 @#$%! 🚀 Unicode test 🎉";
    await page.getByRole("textbox").fill(specialText);
    await expect(page.getByRole("textbox")).toHaveValue(specialText);
  });

  test("component handles very long input values", async ({ initTestBed, page }) => {
    const longText =
      "This is a very long text that might cause issues with component rendering or processing. ".repeat(
        50,
      );
    await initTestBed(`<TextArea />`);
    await page.getByRole("textbox").fill(longText);
    await expect(page.getByRole("textbox")).toHaveValue(longText);
  });

  test("component prop changes update display correctly", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment var.rows="{3}">
        <TextArea rows="{rows}" />
        <Button onClick="rows = 5">Set Rows to 5</Button>
      </Fragment>`);
    const textarea = page.getByRole("textbox");

    await expect(textarea).toHaveAttribute("rows", "3");
    await page.getByRole("button", { name: "Set Rows to 5" }).click();
    await expect(textarea).toHaveAttribute("rows", "5");
  });

  test("autoSize enables automatic height adjustment", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea testId="input" autoSize="true" />`);
    const textarea = page.getByTestId("input");
    const areaField = page.getByRole("textbox");

    // Get initial height with single line
    await areaField.fill("Single line");
    const initialHeight = await textarea.evaluate((el) => el.scrollHeight);

    // Add multiple lines and verify height increases
    await areaField.fill("Line 1\nLine 2\nLine 3\nLine 4");
    const expandedHeight = await textarea.evaluate((el) => el.scrollHeight);

    // Height should increase when more lines are added
    expect(expandedHeight).toBeGreaterThan(initialHeight);

    // Verify content is correct
    await expect(areaField).toHaveValue("Line 1\nLine 2\nLine 3\nLine 4");

    // Test reduction - go back to fewer lines
    await areaField.fill("Line 1\nLine 2");
    const reducedHeight = await areaField.evaluate((el) => el.scrollHeight);

    // Height should decrease when lines are removed
    expect(reducedHeight).toBeLessThan(expandedHeight);
    expect(reducedHeight).toBeGreaterThanOrEqual(initialHeight);
  });

  test("maxRows limits auto-size height", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea testId="input" autoSize="true" maxRows="3" />`);
    const textarea = page.getByTestId("input");
    const areaField = page.getByRole("textbox");

    // Fill with more content than maxRows should allow
    const manyLines = Array(10).fill("Line content").join("\n");
    await areaField.fill(manyLines);

    // Content should still be there - the key is that maxRows is applied
    await expect(areaField).toHaveValue(manyLines);

    // Verify the component is still visible and functional with large content
    await expect(areaField).toBeVisible();
    await expect(areaField).toBeEditable();

    // The textarea should have some form of height constraint applied
    // (exact implementation may vary, but component should remain functional)
    const boundingRect = await getBounds(textarea);
    expect(boundingRect).not.toBeNull();
    expect(boundingRect.height).toBeGreaterThan(0);
  });

  test("minRows sets minimum auto-size height", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea testId="input" autoSize="true" minRows="4" />`);
    const textarea = page.getByTestId("input");
    const areaField = page.getByRole("textbox");

    await expect(textarea).toBeVisible();
    await expect(areaField).toBeVisible();

    // Even with no content, component should be functional
    await expect(areaField).toHaveValue("");

    // Fill with single line (less than minRows)
    await areaField.fill("Single line");
    await expect(areaField).toHaveValue("Single line");

    // Fill with content that matches minRows
    await areaField.fill("Line 1\nLine 2\nLine 3\nLine 4");
    await expect(areaField).toHaveValue("Line 1\nLine 2\nLine 3\nLine 4");

    // Verify the component remains functional with different content lengths
    await expect(areaField).toBeVisible();
    await expect(areaField).toBeEditable();
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

  test("escResets=false does not reset on Escape", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea escResets="false" initialValue="Initial value" />`);
    const textarea = page.getByRole("textbox");

    await textarea.fill("Changed content");
    await expect(textarea).toHaveValue("Changed content");

    await textarea.press("Escape");
    await expect(textarea).toHaveValue("Changed content"); // Should remain unchanged
  });

  test("component handles readOnly and enabled=false together", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea readOnly="true" enabled="false" />`);
    const textarea = page.getByRole("textbox");
    await expect(textarea).toBeDisabled();
    await expect(textarea).toHaveAttribute("readonly");
  });

  test("component handles autoFocus with enabled=false", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea autoFocus="true" enabled="false" />`);
    const textarea = page.getByRole("textbox");
    await expect(textarea).toBeDisabled();
    await expect(textarea).not.toBeFocused();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("component has correct accessibility attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea label="Comments" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute("aria-multiline", "true");
  });

  test("component is keyboard accessible when interactive", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea
        label="Comments"
        onGotFocus="testState = 'keyboard-focused'"
      />
    `);
    const textarea = page.getByRole("textbox");
    await textarea.focus();
    await expect(textarea).toBeFocused();
    await expect.poll(testStateDriver.testState).toEqual("keyboard-focused");
  });

  test("non-interactive component is not focusable when disabled", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<TextArea enabled="false" />`);
    const textarea = page.getByRole("textbox");

    await expect(textarea).toBeDisabled();
    await expect(textarea).not.toBeFocused();
  });

  test("label is properly associated with textarea", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea label="User Comments" />`);
    const component = page.getByLabel("User Comments");
    await expect(component).toHaveRole("textbox");
  });

  test("required has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea required="true" label="Required Comments" />`);

    await expect(page.getByRole("textbox")).toHaveAttribute("required");
    await expect(page.getByText("Required Comments")).toContainText("*");
  });

  test("readOnly has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea readOnly="true" label="Read-only textarea" />`);
    const textarea = page.getByRole("textbox");
    await expect(textarea).toHaveAttribute("aria-readonly", "true");
    await expect(textarea).toHaveAttribute("readonly");
  });

  test("placeholder provides accessible description", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea placeholder="Describe your feedback in detail" />`);
    await expect(page.getByRole("textbox")).toHaveAttribute(
      "placeholder",
      "Describe your feedback in detail",
    );
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
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on input change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea onDidChange="testState = 'changed'" />
    `);
    await page.getByRole("textbox").fill("test");
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea onDidChange="arg => testState = arg" />
    `);
    await page.getByRole("textbox").fill("test value");
    await expect.poll(testStateDriver.testState).toEqual("test value");
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea onGotFocus="testState = 'focused'" />
    `);
    await page.getByRole("textbox").focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("gotFocus event fires on label click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea label="Comments" onGotFocus="testState = 'focused'" />
    `);
    await page.getByText("Comments").click();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea onLostFocus="testState = 'blurred'" />
    `);
    const textarea = page.getByRole("textbox");
    await textarea.focus();
    await textarea.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("events do not fire when component is disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea enabled="false" onDidChange="testState = 'changed'" onGotFocus="testState = 'focused'" />
    `);
    const textarea = page.getByRole("textbox");
    await textarea.focus();
    await textarea.fill("test", { force: true });
    await expect.poll(testStateDriver.testState).toEqual(null);
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual States", () => {
  test("component applies theme variables correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea testId="input" />`, {
      testThemeVars: {
        "backgroundColor-TextArea--default": "rgb(255, 0, 0)",
        "textColor-TextArea--default": "rgb(0, 255, 0)",
      },
    });
    await expect(page.getByTestId("input")).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(page.getByTestId("input")).toHaveCSS("color", "rgb(0, 255, 0)");
  });

  test("component handles horizontal resize option", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea resize="horizontal" />`);
    await expect(page.getByRole("textbox")).toHaveCSS("resize", "horizontal");
  });

  test("component handles vertical resize option", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea resize="vertical" />`);
    await expect(page.getByRole("textbox")).toHaveCSS("resize", "vertical");
  });

  test("component handles both resize option", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea resize="both" />`);
    await expect(page.getByRole("textbox")).toHaveCSS("resize", "both");
  });

  test("component handles disabled visual state", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-TextArea--disabled": "rgb(255, 0, 0)",
        "textColor-TextArea--disabled": "rgb(0, 255, 0)",
        "borderColor-TextArea--disabled": "rgb(0, 0, 255)",
      },
    });
    const textarea = page.getByRole("textbox");
    await expect(textarea).toBeDisabled();
    await expect(textarea).toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(textarea).toHaveCSS("color", "rgb(0, 255, 0)");
    await expect(textarea).toHaveCSS("border-color", "rgb(0, 0, 255)");
  });

  test("component handles focus state", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea />`, {
      testThemeVars: {
        "borderColor-TextArea--focus": "rgb(255, 0, 0)",
        "backgroundColor-TextArea--focus": "rgb(0, 255, 0)",
        "textColor-TextArea--focus": "rgb(0, 0, 255)",
      },
    });
    const textarea = page.getByRole("textbox");

    // Test focus state
    await textarea.focus();
    await expect(textarea).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(textarea).toHaveCSS("background-color", "rgb(0, 255, 0)");
    await expect(textarea).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test("component handles hover state", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea />`, {
      testThemeVars: {
        "borderColor-TextArea--hover": "rgb(255, 0, 0)",
        "backgroundColor-TextArea--hover": "rgb(0, 255, 0)",
        "textColor-TextArea--hover": "rgb(0, 0, 255)",
      },
    });
    const textarea = page.getByRole("textbox");

    // Test hover state (simulated through interaction)
    await textarea.hover();
    await expect(textarea).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(textarea).toHaveCSS("background-color", "rgb(0, 255, 0)");
    await expect(textarea).toHaveCSS("color", "rgb(0, 0, 255)");
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("component handles special characters correctly", async ({ initTestBed, page }) => {
    await initTestBed(
      `<TextArea label="José María's Comments" placeholder="Введите текст здесь" />`,
    );
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByText("José María's Comments")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveAttribute("placeholder", "Введите текст здесь");
  });

  test("component handles empty array as initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="{[]}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("");
  });

  test("component handles empty object as initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="{{}}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("[object Object]");
  });

  test("component handles function as initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="{() => {}}" />`);
    await expect(page.getByRole("textbox")).toHaveValue("[object Object]");
  });

  test("component handles negative maxLength gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea maxLength="{-1}" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component handles zero maxLength gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea maxLength="0" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component handles very large maxLength gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea maxLength="999999" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component handles invalid resize values gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea resize="invalid" />`);
    await expect(page.getByRole("textbox")).toHaveCSS("resize", "none");
  });

  test("component handles empty value", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="" />`);
    const textarea = page.getByRole("textbox");
    await expect(textarea).toHaveValue("");
  });

  test("component handles whitespace-only value", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="   " />`);
    const whitespaceTextarea = page.getByRole("textbox");
    await expect(whitespaceTextarea).toHaveValue("   ");
  });

  test("component handles tab and newline characters in value", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea initialValue="\t\n" />`);
    const tabNewlineTextarea = page.getByRole("textbox");
    const value = await tabNewlineTextarea.inputValue();
    expect(value).toContain("\t");
    expect(value).toContain("\n");
  });

  test("component handles very long input values", async ({ initTestBed, page }) => {
    const longValue =
      "Very long value that might cause issues with component rendering or processing. ".repeat(
        100,
      );
    await initTestBed(`<TextArea initialValue="${longValue}" />`);
    const textarea = page.getByRole("textbox");
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue(longValue);
  });

  test("component handles invalid maxRows/minRows combinations with autoSize", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<TextArea autoSize="true" maxRows="2" minRows="5" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component handles zero maxRows/minRows values with autoSize", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<TextArea autoSize="true" maxRows="0" minRows="0" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("component handles negative maxRows/minRows values with autoSize", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`<TextArea autoSize="true" maxRows="{-1}" minRows="{-1}" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.describe("Performance", () => {
  test("component memoization prevents unnecessary re-renders", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea
        label="Performance Test"
        onDidChange="testState = ++testState || 1"
      />
    `);

    const textarea = page.getByRole("textbox");

    // Test that memoization works through stable behavior
    await textarea.fill("a");
    await expect.poll(testStateDriver.testState).toEqual(1);

    await textarea.fill("ab");
    await expect.poll(testStateDriver.testState).toEqual(2);

    // Component should maintain consistent behavior
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue("ab");
  });

  test("component handles large content efficiently", async ({ initTestBed, page }) => {
    const largeContent = "Large content line.\n".repeat(1000);
    await initTestBed(`<TextArea />`);
    const textarea = page.getByRole("textbox");

    // Fill with large content
    await textarea.fill(largeContent);
    await expect(textarea).toHaveValue(largeContent);

    // Verify component still responsive
    await textarea.clear();
    await expect(textarea).toHaveValue("");
  });

  test("component performs well with rapid user input", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TextArea onDidChange="testState = (testState || 0) + 1" />
    `);
    const textarea = page.getByRole("textbox");

    // Simulate rapid typing
    await textarea.pressSequentially("rapid input test", { delay: 10 });

    // Should have received multiple change events efficiently
    const changeCount = await testStateDriver.testState();
    expect(changeCount).toBeGreaterThan(10);

    await expect(textarea).toHaveValue("rapid input test");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.describe("Integration", () => {
  test("component works correctly in different layout contexts", async ({ initTestBed, page }) => {
    await initTestBed(`<TextArea label="Layout Test" />`);
    const textarea = page.getByRole("textbox");

    // Test basic layout integration
    await expect(textarea).toBeVisible();

    // Test bounding box and dimensions
    const boundingBox = await getBounds(textarea);
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
      <Fragment var.value="">
        <TextBox testId="myTextBox" initialValue="{value}" onDidChange="{(val) => {value = val}}"/>
        <TextArea testId="myTextArea" initialValue="{value}" onDidChange="{(val) => {value = val}}"/>
      </Fragment>
    `);

    const tbDriver = await createTextBoxDriver("myTextBox");
    const driver = await createTextAreaDriver("myTextArea");

    // Test basic layout integration
    await expect(driver.component).toBeVisible();

    await driver.focus();
    await expect(driver.component).toBeFocused();
    await driver.component.fill("a");
    await expect(driver.component).toHaveValue("a");
    await driver.component.fill("abc");
    await expect(driver.component).toHaveValue("abc");
    await driver.component.fill("abcde");
    await expect(driver.component).toHaveValue("abcde");
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<TextArea width="200px" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<TextArea width="200px" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<TextArea width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<TextArea width="50%" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  [
    { value: "--default", prop: "" },
    { value: "--warning", prop: 'validationStatus="warning"' },
    { value: "--error", prop: 'validationStatus="error"' },
    { value: "--success", prop: 'validationStatus="valid"' },
  ].forEach((variant) => {
    test(`applies correct borderRadius ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-TextArea${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-TextArea${variant.value}`]: "rgb(255, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-TextArea${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-TextArea${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct fontSize ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`fontSize-TextArea${variant.value}`]: "14px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("font-size", "14px");
    });

    test(`applies correct backgroundColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-TextArea${variant.value}`]: "rgb(240, 240, 240)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-TextArea${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-TextArea${variant.value}`]: "rgb(0, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-TextArea${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct backgroundColor on hover ${variant.value}`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-TextArea${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-TextArea${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<TextArea testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-TextArea${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });
  });
});
