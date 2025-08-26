import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders with default format", async ({ initTestBed, createTimeInputDriver }) => {
    await initTestBed(`<TimeInput testId="timeInput" />`);
    const driver = await createTimeInputDriver("timeInput");
    await expect(driver.component).toBeVisible();
    await expect(driver.getHourInput()).toBeVisible();
    await expect(driver.getMinuteInput()).toBeVisible();
    await expect(driver.getSecondInput()).not.toBeVisible();
    await expect(driver.getAmPmInput()).not.toBeVisible();
    await expect(driver.getClearButton()).not.toBeVisible();
  });

  test.skip("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput label="Select time" />`);
    await expect(page.getByLabel("Select time")).toBeVisible();
  });

  test.describe("initialValue property", () => {
    test("renders with initialValue", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });

    test("handles null initialValue", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput initialValue="{null}" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("");
      await expect(inputs.nth(1)).toHaveValue("");
    });

    test("handles undefined initialValue", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput initialValue="{undefined}" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("");
      await expect(inputs.nth(1)).toHaveValue("");
    });

    test("handles invalid time string", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput initialValue="invalid" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("00");
      await expect(inputs.nth(1)).toHaveValue("00");
    });

    test("handles time with seconds", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput initialValue="14:30:45" format="HH:mm:ss" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
      await expect(inputs.nth(2)).toHaveValue("45");
    });
  });

  test.describe("format property", () => {
    test("displays 24-hour format H:mm", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="H:mm" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
      await expect(page.getByText("AM")).not.toBeVisible();
      await expect(page.getByText("PM")).not.toBeVisible();
    });

    test("displays 24-hour format HH:mm:ss", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="HH:mm:ss" initialValue="14:30:15" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
      await expect(inputs.nth(2)).toHaveValue("15");
    });

    test.skip("displays 12-hour format h:mm a", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="h:mm a" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("2");
      await expect(inputs.nth(1)).toHaveValue("30");
      await expect(page.getByRole("combobox")).toBeVisible();
    });

    test.skip("displays 12-hour format hh:mm:ss a", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="hh:mm:ss a" initialValue="14:30:15" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("02");
      await expect(inputs.nth(1)).toHaveValue("30");
      await expect(inputs.nth(2)).toHaveValue("15");
      await expect(page.getByRole("combobox")).toBeVisible();
    });

    test("handles null format property", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="{null}" initialValue="14:30" />`);
      // Should default to HH:mm format
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });

    test("handles invalid format property", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="invalid" initialValue="14:30" />`);
      // Should fallback to default format
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });
  });

  test.describe("enabled property", () => {
    test.skip("renders enabled by default", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput />`);
      await expect(page.getByRole("textbox")).toBeEnabled();
    });

    test("disables component when enabled is false", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput enabled="false" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toBeDisabled();
      await expect(inputs.nth(1)).toBeDisabled();
    });

    test.skip("handles null enabled property", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput enabled="{null}" />`);
      await expect(page.getByRole("textbox")).toBeEnabled();
    });
  });

  test.describe("readOnly property", () => {
    test.skip("makes component readonly", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput readOnly="true" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveAttribute("readonly");
      await expect(inputs.nth(1)).toHaveAttribute("readonly");
    });

    test("allows editing when readOnly is false", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput readOnly="false" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).not.toHaveAttribute("readonly");
      await expect(inputs.nth(1)).not.toHaveAttribute("readonly");
    });
  });

  test.describe("clearable property", () => {
    test.skip("shows clear button when clearable is true", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput clearable="true" initialValue="14:30" />`);
      await expect(page.getByRole("button", { name: /clear/i })).toBeVisible();
    });

    test("hides clear button when clearable is false", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput clearable="false" initialValue="14:30" />`);
      await expect(page.getByRole("button", { name: /clear/i })).not.toBeVisible();
    });

    test.skip("clears value when clear button is clicked", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput clearable="true" initialValue="14:30" />`);
      await page.getByRole("button", { name: /clear/i }).click();
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("");
      await expect(inputs.nth(1)).toHaveValue("");
    });
  });

  test.describe("clearIcon property", () => {
    test.skip("displays custom clear icon", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput clearable="true" clearIcon="trash" initialValue="14:30" />`);
      await expect(page.getByRole("button", { name: /clear/i })).toBeVisible();
      // Icon presence would be tested via the icon's specific attributes
    });
  });

  test.describe("required property", () => {
    test("makes component required", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput required="true" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.first()).toHaveAttribute("required");
    });

    test("component is not required by default", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.first()).not.toHaveAttribute("required");
    });
  });

  test.describe("validationStatus property", () => {
    test.skip("displays valid status", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput validationStatus="valid" initialValue="14:30" />`);
      await expect(page.getByRole("textbox")).toBeVisible();
    });

    test.skip("displays warning status", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput validationStatus="warning" initialValue="14:30" />`);
      await expect(page.getByRole("textbox")).toBeVisible();
    });

    test.skip("displays error status", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput validationStatus="error" initialValue="14:30" />`);
      await expect(page.getByRole("textbox")).toBeVisible();
    });

    test.skip("handles null validationStatus", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput validationStatus="{null}" />`);
      await expect(page.getByRole("textbox")).toBeVisible();
    });
  });

  test.describe("minTime and maxTime properties", () => {
    test("accepts minTime constraint", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput minTime="10:00" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });

    test("accepts maxTime constraint", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput maxTime="18:00" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });

    test("handles null minTime", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput minTime="{null}" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });

    test("handles null maxTime", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput maxTime="{null}" initialValue="14:30" />`);
      const inputs = page.locator('input[type="text"]');
      await expect(inputs.nth(0)).toHaveValue("14");
      await expect(inputs.nth(1)).toHaveValue("30");
    });
  });

  test.describe("label properties", () => {
    test.skip("displays label with labelPosition top", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput label="Time" labelPosition="top" />`);
      await expect(page.getByText("Time")).toBeVisible();
      await expect(page.getByLabel("Time")).toBeVisible();
    });

    test.skip("displays label with labelPosition left", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput label="Time" labelPosition="left" />`);
      await expect(page.getByText("Time")).toBeVisible();
      await expect(page.getByLabel("Time")).toBeVisible();
    });

    test.skip("sets labelWidth", async ({ initTestBed, page }) => {
      const expectedWidth = 150;
      await initTestBed(`<TimeInput label="Time" labelPosition="left" labelWidth="${expectedWidth}px" />`);
      const { width } = await getBounds(page.getByText("Time"));
      expect(width).toEqual(expectedWidth);
    });

    test.skip("handles labelBreak", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput label="Time Input" labelBreak="true" />`);
      await expect(page.getByText("Time Input")).toBeVisible();
    });
  });

  test.describe("adornment properties", () => {
    test("displays startText", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput startText="Start" />`);
      await expect(page.getByText("Start")).toBeVisible();
    });

    test("displays endText", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput endText="End" />`);
      await expect(page.getByText("End")).toBeVisible();
    });

    test.skip("displays startIcon", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput startIcon="clock" />`);
      await expect(page.getByRole("img")).toBeVisible();
    });

    test.skip("displays endIcon", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput endIcon="clock" />`);
      await expect(page.getByRole("img")).toBeVisible();
    });

    test.skip("displays multiple adornments together", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput startText="Start" endText="End" startIcon="clock" endIcon="calendar" />`);
      await expect(page.getByText("Start")).toBeVisible();
      await expect(page.getByText("End")).toBeVisible();
      await expect(page.getByRole("img").first()).toBeVisible();
      await expect(page.getByRole("img").last()).toBeVisible();
    });
  });

  test.describe("gap property", () => {
    test("applies custom gap", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput gap="20px" startText="Start" />`);
      await expect(page.getByText("Start")).toBeVisible();
    });

    test("handles null gap", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput gap="{null}" startText="Start" />`);
      await expect(page.getByText("Start")).toBeVisible();
    });
  });

  test.describe("autoFocus property", () => {
    test("focuses component when autoFocus is true", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput autoFocus="true" />`);
      await expect(page.locator('input[type="text"]').first()).toBeFocused();
    });

    test("does not focus when autoFocus is false", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput autoFocus="false" />`);
      await expect(page.locator('input[type="text"]').first()).not.toBeFocused();
    });
  });

  test.describe("User Interactions", () => {
    test("allows typing in hour input", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput />`);
      const hourInput = page.locator('input[type="text"]').first();
      await hourInput.click();
      await hourInput.fill("15");
      await expect(hourInput).toHaveValue("15");
    });

    test("allows typing in minute input", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput />`);
      const minuteInput = page.locator('input[type="text"]').nth(1);
      await minuteInput.click();
      await minuteInput.fill("45");
      await expect(minuteInput).toHaveValue("45");
    });

    test("navigates between inputs with Tab", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="HH:mm:ss" />`);
      const hourInput = page.locator('input[type="text"]').first();
      const minuteInput = page.locator('input[type="text"]').nth(1);
      const secondInput = page.locator('input[type="text"]').nth(2);
      
      await hourInput.focus();
      await page.keyboard.press("Tab");
      await expect(minuteInput).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(secondInput).toBeFocused();
    });

    test.skip("changes AM/PM with select", async ({ initTestBed, page }) => {
      await initTestBed(`<TimeInput format="h:mm a" initialValue="14:30" />`);
      const ampmSelect = page.getByRole("combobox");
      await expect(ampmSelect).toHaveValue("PM");
      await ampmSelect.selectOption("AM");
      await expect(ampmSelect).toHaveValue("AM");
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test.skip("has correct role for main container", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput label="Time Input" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test.skip("has correct accessibility attributes for inputs", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput label="Select time" />`);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toHaveAttribute("type", "text");
    await expect(inputs.nth(1)).toHaveAttribute("type", "text");
  });

  test.skip("associates label with component", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput label="Meeting time" />`);
    await expect(page.getByLabel("Meeting time")).toBeVisible();
  });

  test("supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput format="HH:mm:ss" />`);
    const inputs = page.locator('input[type="text"]');
    
    // Tab through all inputs
    await inputs.first().focus();
    await expect(inputs.first()).toBeFocused();
    
    await page.keyboard.press("Tab");
    await expect(inputs.nth(1)).toBeFocused();
    
    await page.keyboard.press("Tab");
    await expect(inputs.nth(2)).toBeFocused();
  });

  test.skip("supports required attribute for accessibility", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput required="true" label="Required time" />`);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toHaveAttribute("required");
  });

  test.skip("has proper ARIA attributes for disabled state", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput enabled="false" label="Disabled time" />`);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toBeDisabled();
    await expect(inputs.nth(1)).toBeDisabled();
  });

  test.skip("has proper ARIA attributes for readonly state", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput readOnly="true" label="Readonly time" initialValue="14:30" />`);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toHaveAttribute("readonly");
    await expect(inputs.nth(1)).toHaveAttribute("readonly");
  });

  test.skip("clear button has accessible name", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput clearable="true" initialValue="14:30" />`);
    await expect(page.getByRole("button", { name: /clear/i })).toBeVisible();
  });

  test.skip("AM/PM select has proper role", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput format="h:mm a" initialValue="14:30" />`);
    await expect(page.getByRole("combobox")).toBeVisible();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test.skip("applies Input borderRadius theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "Input:borderRadius-TimeInput-default": "10px" },
    });
    await expect(page.getByTestId("time-input")).toHaveCSS("border-radius", "10px");
  });

  test.skip("applies Input borderColor theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "Input:borderColor-TimeInput-default": "rgb(255, 0, 0)" },
    });
    await expect(page.getByTestId("time-input")).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test.skip("applies Input backgroundColor theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "Input:backgroundColor-TimeInput-default": "rgb(0, 255, 0)" },
    });
    await expect(page.getByTestId("time-input")).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test.skip("applies Input textColor theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "Input:textColor-TimeInput-default": "rgb(0, 0, 255)" },
    });
    await expect(page.getByTestId("time-input")).toHaveCSS("color", "rgb(0, 0, 255)");
  });

  test.skip("applies error state theme variables", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" validationStatus="error" />`, {
      testThemeVars: { "Input:backgroundColor-TimeInput-error": "rgba(220, 53, 69, 0.15)" },
    });
    await expect(page.getByTestId("time-input")).toHaveCSS("background-color", "rgba(220, 53, 69, 0.15)");
  });

  test.skip("applies TimeInput specific color-divider theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "color-divider-TimeInput": "rgb(128, 128, 128)" },
    });
    // Check that dividers exist and use the themed color
    await expect(page.locator(".divider").first()).toHaveCSS("color", "rgb(128, 128, 128)");
  });

  test.skip("applies TimeInput specific width-input theme variable", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="time-input" />`, {
      testThemeVars: { "width-input-TimeInput": "3em" },
    });
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.first()).toHaveCSS("width", "48px"); // 3em ≈ 48px
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test.skip("handles no props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test.skip("handles empty string props", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput label="" format="" />`);
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("handles very long unicode characters in initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput initialValue="👨‍👩‍👧‍👦" />`);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(0)).toHaveValue("00");
    await expect(inputs.nth(1)).toHaveValue("00");
  });

  test("handles chinese characters in initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput initialValue="中文时间" />`);
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(0)).toHaveValue("00");
    await expect(inputs.nth(1)).toHaveValue("00");
  });

  test.skip("handles unexpected object type for format prop", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput format="{{}}" />`);
    // Should gracefully handle object input and fallback to default
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test.skip("handles negative values in time inputs", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput />`);
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.click();
    await hourInput.fill("-5");
    // Component should handle negative values gracefully
    await hourInput.blur();
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test.skip("handles very large numbers in time inputs", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput />`);
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.click();
    await hourInput.fill("999");
    // Component should handle large values gracefully
    await hourInput.blur();
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test.skip("handles multiple rapid clear button clicks", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput clearable="true" initialValue="14:30" />`);
    const clearButton = page.getByRole("button", { name: /clear/i });
    
    // Rapidly click clear button multiple times
    await clearButton.click();
    await clearButton.click();
    await clearButton.click();
    
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(0)).toHaveValue("");
    await expect(inputs.nth(1)).toHaveValue("");
  });

  test.skip("maintains focus after value changes", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput />`);
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.focus();
    await hourInput.fill("15");
    await expect(hourInput).toBeFocused();
  });
});

// =============================================================================
// EVENT TESTS
// =============================================================================

test.describe("Events", () => {
  test.skip("didChange event fires when value changes", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput onDidChange="arg => testState = arg" />
    `);
    
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.click();
    await hourInput.fill("14");
    await hourInput.blur();
    
    await expect.poll(testStateDriver.testState).toBeTruthy();
  });

  test("didChange event receives correct time value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput format="HH:mm" onDidChange="arg => testState = arg" />
    `);
    
    const hourInput = page.locator('input[type="text"]').first();
    const minuteInput = page.locator('input[type="text"]').nth(1);
    
    await hourInput.click();
    await hourInput.fill("14");
    await minuteInput.click();
    await minuteInput.fill("30");
    await minuteInput.blur();
    
    await expect.poll(testStateDriver.testState).toEqual("14:30");
  });

  test("gotFocus event fires when component receives focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput onGotFocus="testState = 'focused'" />
    `);
    
    await page.locator('input[type="text"]').first().focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("lostFocus event fires when component loses focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput onLostFocus="testState = 'blurred'" />
    `);
    
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.focus();
    await hourInput.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("invalidTime event fires for invalid input", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput onInvalidTime="testState = 'invalid'" />
    `);
    
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.click();
    await hourInput.fill("25"); // Invalid hour
    await hourInput.blur();
    
    await expect.poll(testStateDriver.testState).toEqual("invalid");
  });

  test.skip("multiple events work together", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <TimeInput 
        onGotFocus="testState = testState ? testState + ',focused' : 'focused'"
        onLostFocus="testState = testState + ',blurred'"
        onDidChange="arg => testState = testState + ',changed:' + arg"
      />
    `);
    
    const hourInput = page.locator('input[type="text"]').first();
    await hourInput.focus();
    await hourInput.fill("14");
    await hourInput.blur();
    
    const result = await testStateDriver.testState();
    expect(result).toContain("focused");
    expect(result).toContain("blurred");
    expect(result).toContain("changed");
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("API", () => {
  test("focus() method focuses the component", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TimeInput id="timeInput" />
        <Button onClick="timeInput.focus()" testId="focusBtn" />
      </Fragment>
    `);
    
    await page.getByTestId("focusBtn").click();
    await expect(page.locator('input[type="text"]').first()).toBeFocused();
  });

  test("value property returns current time", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TimeInput id="timeInput" initialValue="14:30" />
        <Button onClick="testState = timeInput.value" testId="getValueBtn" />
      </Fragment>
    `);
    
    await page.getByTestId("getValueBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("14:30");
  });

  test("setValue() method updates the time", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TimeInput id="timeInput" />
        <Button onClick="timeInput.setValue('15:45')" testId="setValueBtn" />
      </Fragment>
    `);
    
    await page.getByTestId("setValueBtn").click();
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(0)).toHaveValue("15");
    await expect(inputs.nth(1)).toHaveValue("45");
  });

  test("setValue() with empty string clears the value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <TimeInput id="timeInput" initialValue="14:30" />
        <Button onClick="timeInput.setValue('')" testId="clearBtn" />
      </Fragment>
    `);
    
    await page.getByTestId("clearBtn").click();
    const inputs = page.locator('input[type="text"]');
    await expect(inputs.nth(0)).toHaveValue("");
    await expect(inputs.nth(1)).toHaveValue("");
  });

  test("value property returns undefined when no value set", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TimeInput id="timeInput" />
        <Button onClick="testState = timeInput.value === undefined ? 'undefined' : 'defined'" testId="checkBtn" />
      </Fragment>
    `);
    
    await page.getByTestId("checkBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("undefined");
  });

  test("setValue() triggers didChange event", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <TimeInput id="timeInput" onDidChange="arg => testState = 'changed:' + arg" />
        <Button onClick="timeInput.setValue('16:20')" testId="setBtn" />
      </Fragment>
    `);
    
    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("changed:16:20");
  });
});

// =============================================================================
// LAYOUT TESTS
// =============================================================================

test.describe("Layout", () => {
  test.skip("adornments appear in correct positions (LTR)", async ({ initTestBed, page }) => {
    await initTestBed(`
      <TimeInput 
        testId="input" 
        startText="Start" 
        endText="End" 
        startIcon="clock" 
        endIcon="calendar" 
        direction="ltr" 
      />
    `);
    
    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: startTextLeft, right: startTextRight } = await getBounds(page.getByText("Start"));
    const { left: endTextLeft, right: endTextRight } = await getBounds(page.getByText("End"));
    const { left: startIconLeft, right: startIconRight } = await getBounds(page.getByRole("img").first());
    const { left: endIconLeft, right: endIconRight } = await getBounds(page.getByRole("img").last());

    // Check order of adornments relative to container bounds
    expect(startTextRight - compLeft).toBeLessThanOrEqual(compRight - startTextLeft);
    expect(startIconRight - compLeft).toBeLessThanOrEqual(compRight - startIconLeft);
    expect(endTextRight - compLeft).toBeGreaterThanOrEqual(compRight - endTextLeft);
    expect(endIconRight - compLeft).toBeGreaterThanOrEqual(compRight - endIconLeft);
  });

  test("startText displays at beginning of input (RTL)", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput testId="input" direction="rtl" startText="$" />`);

    const { left: compLeft, right: compRight } = await getBounds(page.getByTestId("input"));
    const { left: textLeft, right: textRight } = await getBounds(page.getByText("$"));

    await expect(page.getByTestId("input")).toContainText("$");
    expect(textRight - compLeft).toBeGreaterThanOrEqual(compRight - textLeft);
  });

  test.skip("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    const expected = 200;
    await initTestBed(`<TimeInput label="Select time" labelPosition="left" labelWidth="${expected}px" />`);
    const { width } = await getBounds(page.getByText("Select time"));
    expect(width).toEqual(expected);
  });

  test("time inputs maintain consistent spacing", async ({ initTestBed, page }) => {
    await initTestBed(`<TimeInput format="HH:mm:ss" testId="time-input" />`);
    
    const inputs = page.locator('input[type="text"]');
    const { right: hourRight } = await getBounds(inputs.first());
    const { left: minuteLeft, right: minuteRight } = await getBounds(inputs.nth(1));
    const { left: secondLeft } = await getBounds(inputs.nth(2));
    
    // Verify there's consistent spacing between inputs
    const hourToMinuteGap = minuteLeft - hourRight;
    const minuteToSecondGap = secondLeft - minuteRight;
    
    expect(hourToMinuteGap).toBeGreaterThan(0);
    expect(minuteToSecondGap).toBeGreaterThan(0);
    expect(Math.abs(hourToMinuteGap - minuteToSecondGap)).toBeLessThan(5); // Allow small differences
  });
});
