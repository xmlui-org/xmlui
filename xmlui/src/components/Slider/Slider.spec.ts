/**
 * Testing Notes: the Driver needs to account for the correct positioning of the indicators on the slider
 */

import { validationStatusValues } from "../abstractions";
import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider />`);
    await expect(page.getByRole("slider")).toBeVisible();
  });

  test("component renders with label", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider label="Volume" />`);
    await expect(page.getByRole("slider")).toBeVisible();
    await expect(page.getByText("Volume")).toBeVisible();
  });

  test.describe("initialValue", () => {
    test.skip("sets initial value of field", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider initialValue="50" />`);
      await expect(page.getByRole("slider")).toHaveValue("50");
    });

    test.skip("accepts empty as default value", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider initialValue="" />`);
      await expect(page.getByRole("slider")).toHaveValue("0");
    });

    [
      { label: "int", value: 25, expected: "25" },
      { label: "float", value: 25.5, expected: "25.5" },
      { label: "string that resolves to int", value: "25", expected: "25" },
      { label: "string that resolves to float", value: "25.5", expected: "25.5" },
    ].forEach(({ label, value, expected }) => {
      test.skip(`handles ${label} correctly`, SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
        await initTestBed(`<Slider initialValue="{${JSON.stringify(value)}}" />`);
        await expect(page.getByRole("slider")).toHaveValue(expected);
      });
    });

    [
      { label: "NaN", value: NaN },
      { label: "null", value: null },
      { label: "undefined", value: undefined },
      { label: "empty string", value: "" },
      { label: "string not resolving to number", value: "abc" },
    ].forEach(({ label, value }) => {
      test.skip(`handles ${label} gracefully`, SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
        await initTestBed(`<Slider initialValue="{${JSON.stringify(value)}}" />`);
        await expect(page.getByRole("slider")).toHaveValue("0");
      });
    });
  });

  test.describe("minValue and maxValue", () => {
    test.skip("minValue sets the lower bound", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider minValue="10" initialValue="5" />`);
      await expect(page.getByRole("slider")).toHaveValue("10");
    });

    test.skip("maxValue sets the upper bound", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider maxValue="50" initialValue="75" />`);
      await expect(page.getByRole("slider")).toHaveValue("50");
    });

    test.skip("value cannot be lower than minValue", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider minValue="20" maxValue="80" initialValue="10" />`);
      await expect(page.getByRole("slider")).toHaveValue("20");
    });

    test.skip("value cannot be larger than maxValue", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider minValue="20" maxValue="80" initialValue="100" />`);
      await expect(page.getByRole("slider")).toHaveValue("80");
    });

    test("handles invalid minValue/maxValue gracefully", async ({ initTestBed, page }) => {
      await initTestBed(`<Slider minValue="invalid" maxValue="invalid" />`);
      await expect(page.getByRole("slider")).toBeVisible();
    });
  });

  test.skip("step defines increment value", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider step="5" initialValue="0" />`);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect(slider).toHaveValue("5");
  });

  test.skip("handles fractional step values", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider step="0.1" initialValue="0" />`);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect(slider).toHaveValue("0.1");
  });

  test.skip("minStepsBetweenThumbs maintains thumb separation", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test actual thumb separation logic"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="{[10, 15]}" minStepsBetweenThumbs="5" />`);
    // Test that thumbs maintain minimum separation
    await expect(page.getByRole("slider")).toBeVisible();
  });

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider enabled="false" />`);
    await expect(page.getByRole("slider")).toBeDisabled();
  });

  test.skip("readOnly prevents interaction", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider readOnly="true" initialValue="50" />`);
    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("readonly");
    await expect(slider).toHaveValue("50");
  });

  test.skip("autoFocus focuses slider on mount", SKIP_REASON.TO_BE_IMPLEMENTED("autoFocus behavior not implemented correctly"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider autoFocus="true" />`);
    await expect(page.getByRole("slider")).toBeFocused();
  });

  test("required shows visual indicator", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider required="true" label="Required slider" />`);
    await expect(page.getByText("Required slider")).toContainText("*");
  });

  test.describe("showValues", () => {
    test("showValues=true displays current value", async ({ initTestBed, page }) => {
      await initTestBed(`<Slider showValues="true" initialValue="75" />`);
      await expect(page.getByText("75")).toBeVisible();
    });

    test("showValues=false hides current value", async ({ initTestBed, page }) => {
      await initTestBed(`<Slider showValues="false" initialValue="75" />`);
      await expect(page.getByText("75")).not.toBeVisible();
    });
  });

  test.skip("valueFormat customizes value display", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test custom formatting function"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider showValues="true" initialValue="75" valueFormat="(v) => v + '%'" />`);
    await expect(page.getByText("75%")).toBeVisible();
  });

  test.describe("range sliders", () => {
    test.skip("handles array initialValue for range", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider initialValue="{[25, 75]}" />`);
      const sliders = page.getByRole("slider");
      await expect(sliders.first()).toHaveValue("25");
      await expect(sliders.last()).toHaveValue("75");
    });

    test.skip("maintains thumb order in range mode", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test thumb auto-correction logic"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider initialValue="{[75, 25]}" />`);
      // Should auto-correct to [25, 75]
      const sliders = page.getByRole("slider");
      await expect(sliders.first()).toHaveValue("25");
      await expect(sliders.last()).toHaveValue("75");
    });
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test.skip("has correct ARIA role", SKIP_REASON.TO_BE_IMPLEMENTED("Need to verify role=slider is actually set by component"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider />`);
    await expect(page.getByRole("slider")).toBeVisible();
  });

  test.skip("label is properly associated", SKIP_REASON.TO_BE_IMPLEMENTED("Label association not implemented correctly - getByLabel can't find slider"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider label="Volume Control" />`);
    await expect(page.getByLabel("Volume Control")).toBeVisible();
  });

  test.skip("supports keyboard navigation", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value and actual keyboard behavior"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="50" />`);
    const slider = page.getByRole("slider");
    await slider.focus();
    await expect(slider).toBeFocused();
    
    await slider.press("ArrowRight");
    await expect(slider).toHaveValue("51");
    
    await slider.press("ArrowLeft");
    await expect(slider).toHaveValue("50");
  });

  test.skip("supports Home/End key navigation", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider minValue="0" maxValue="100" initialValue="50" />`);
    const slider = page.getByRole("slider");
    await slider.focus();
    
    await slider.press("Home");
    await expect(slider).toHaveValue("0");
    
    await slider.press("End");
    await expect(slider).toHaveValue("100");
  });

  test.skip("disabled slider has proper ARIA attributes", SKIP_REASON.TO_BE_IMPLEMENTED("Need to verify ARIA attribute implementation"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider enabled="false" />`);
    await expect(page.getByRole("slider")).toHaveAttribute("aria-disabled", "true");
  });

  test.skip("required slider has proper ARIA attributes", SKIP_REASON.TO_BE_IMPLEMENTED("Need to verify ARIA attribute implementation"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider required="true" />`);
    await expect(page.getByRole("slider")).toHaveAttribute("aria-required", "true");
  });

  test.describe("range slider accessibility", () => {
    test.skip("range slider has multiple slider roles", SKIP_REASON.TO_BE_IMPLEMENTED("Need to verify if range sliders actually render multiple elements with slider role"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider initialValue="{[25, 75]}" />`);
      const sliders = page.getByRole("slider");
      await expect(sliders).toHaveCount(2);
    });

    test.skip("range slider thumbs have proper labels", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test ARIA labeling for individual thumbs"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider label="Price Range" initialValue="{[25, 75]}" />`);
      await expect(page.getByRole("slider", { name: /minimum/i })).toBeVisible();
      await expect(page.getByRole("slider", { name: /maximum/i })).toBeVisible();
    });
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelPosition=top positions label above slider", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider label="test" labelPosition="top" />`);
    
    const { top: sliderTop } = await getBounds(page.getByRole("slider"));
    const { bottom: labelBottom } = await getBounds(page.getByText("test"));
    
    expect(labelBottom).toBeLessThan(sliderTop);
  });

  test("labelPosition=start positions label before slider", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider label="test" labelPosition="start" />`);
    
    const { left: sliderLeft } = await getBounds(page.getByRole("slider"));
    const { right: labelRight } = await getBounds(page.getByText("test"));
    
    expect(labelRight).toBeLessThan(sliderLeft);
  });

  test("labelWidth applies custom label width", async ({ initTestBed, page }) => {
    const expected = 150;
    await initTestBed(`<Slider label="test label" labelWidth="${expected}px" />`);
    const { width } = await getBounds(page.getByText("test label"));
    expect(width).toEqual(expected);
  });

  test.skip("labelBreak enables label line breaks", SKIP_REASON.TO_BE_IMPLEMENTED("Need to measure actual line break behavior"), async ({ initTestBed, page }) => {
    const labelText = "Very long label text that should break";
    await initTestBed(`<Slider label="${labelText}" labelWidth="100px" labelBreak="true" />`);
    const label = page.getByText(labelText);
    const { height } = await getBounds(label);
    expect(height).toBeGreaterThan(20); // Assumes multi-line height
  });

  test("handles invalid labelPosition gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider labelPosition="invalid" label="test" />`);
    await expect(page.getByRole("slider")).toBeVisible();
    await expect(page.getByText("test")).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("didChange event fires on value change", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Slider onDidChange="testState = 'changed'" initialValue="50" />
    `);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test.skip("didChange event passes new value", SKIP_REASON.TO_BE_IMPLEMENTED("Keyboard navigation and event value passing not working correctly"), async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Slider onDidChange="arg => testState = arg" initialValue="50" />
    `);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect.poll(testStateDriver.testState).toEqual(51);
  });

  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Slider onGotFocus="testState = 'focused'" />
    `);
    await page.getByRole("slider").focus();
    await expect.poll(testStateDriver.testState).toEqual("focused");
  });

  test("lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Slider onLostFocus="testState = 'blurred'" />
    `);
    const slider = page.getByRole("slider");
    await slider.focus();
    await slider.blur();
    await expect.poll(testStateDriver.testState).toEqual("blurred");
  });

  test("events do not fire when disabled", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Slider enabled="false" onDidChange="testState = 'changed'" onGotFocus="testState = 'focused'" />
    `);
    const slider = page.getByRole("slider");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect.poll(testStateDriver.testState).toEqual(null);
  });
});

// =============================================================================
// API TESTS
// =============================================================================

test.describe("Api", () => {
  test("value API returns current state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" initialValue="50" />
        <Text testId="value">{mySlider.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("50");
  });

  test.skip("value API returns state after change", SKIP_REASON.TO_BE_IMPLEMENTED("Keyboard navigation not updating value correctly"), async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" initialValue="50" />
        <Text testId="value">{mySlider.value}</Text>
      </Fragment>
    `);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect(page.getByTestId("value")).toHaveText("51");
  });

  test.skip("setValue API updates state", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" />
        <Button testId="setBtn" onClick="mySlider.setValue(75)" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByRole("slider")).toHaveValue("75");
  });

  test("setValue API triggers events", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Slider id="mySlider" onDidChange="testState = 'api-changed'" />
        <Button testId="setBtn" onClick="mySlider.setValue(75)" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect.poll(testStateDriver.testState).toEqual("api-changed");
  });

  test.skip("focus API focuses the slider", SKIP_REASON.TO_BE_IMPLEMENTED("Focus API not working correctly"), async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" />
        <Button testId="focusBtn" onClick="mySlider.focus()" />
      </Fragment>
    `);
    const slider = page.getByRole("slider");
    await expect(slider).not.toBeFocused();
    
    await page.getByTestId("focusBtn").click();
    await expect(slider).toBeFocused();
  });

  test("focus API does nothing when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" enabled="false" />
        <Button testId="focusBtn" onClick="mySlider.focus()" />
      </Fragment>
    `);
    await page.getByTestId("focusBtn").click();
    await expect(page.getByRole("slider")).not.toBeFocused();
  });

  test.skip("setValue does not update when disabled", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" enabled="false" initialValue="50" />
        <Button testId="setBtn" onClick="mySlider.setValue(75)" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByRole("slider")).toHaveValue("50");
  });

  test.skip("setValue handles invalid values gracefully", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" initialValue="50" />
        <Button testId="setBtn" onClick="mySlider.setValue('invalid')" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByRole("slider")).toHaveValue("50");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test.skip("backgroundColor-track applies correctly", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test internal track element styling"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "backgroundColor-track-Slider": "rgb(255, 0, 0)",
      },
    });
    const track = page.getByTestId("slider").locator(".track");
    await expect(track).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test.skip("backgroundColor-range applies correctly", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test internal range element styling"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" initialValue="50" />`, {
      testThemeVars: {
        "backgroundColor-range-Slider": "rgb(0, 255, 0)",
      },
    });
    const range = page.getByTestId("slider").locator(".range");
    await expect(range).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test.skip("backgroundColor-thumb applies correctly", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test internal thumb element styling"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "backgroundColor-thumb-Slider": "rgb(0, 0, 255)",
      },
    });
    const thumb = page.getByTestId("slider").locator(".thumb");
    await expect(thumb).toHaveCSS("background-color", "rgb(0, 0, 255)");
  });

  test.skip("disabled theme variables apply when disabled", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test disabled state styling"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-track-Slider--disabled": "rgb(200, 200, 200)",
      },
    });
    const track = page.getByTestId("slider").locator(".track");
    await expect(track).toHaveCSS("background-color", "rgb(200, 200, 200)");
  });

  test.skip("focus theme variables apply on focus", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test focus state styling"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "boxShadow-thumb-Slider--focus": "0px 0px 10px rgb(0, 123, 255)",
      },
    });
    const slider = page.getByRole("slider");
    await slider.focus();
    const thumb = page.getByTestId("slider").locator(".thumb");
    await expect(thumb).toHaveCSS("box-shadow", "0px 0px 10px rgb(0, 123, 255)");
  });

  test.skip("hover theme variables apply on hover", SKIP_REASON.TO_BE_IMPLEMENTED("Need to test hover state styling"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "boxShadow-thumb-Slider--hover": "0px 0px 5px rgb(0, 0, 0)",
      },
    });
    const thumb = page.getByTestId("slider").locator(".thumb");
    await thumb.hover();
    await expect(thumb).toHaveCSS("box-shadow", "0px 0px 5px rgb(0, 0, 0)");
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  const validationStatuses = validationStatusValues.filter((v) => v !== "none");
  
  validationStatuses.forEach((status) => {
    test.skip(`validationStatus=${status} applies correctly`, SKIP_REASON.TO_BE_IMPLEMENTED("Need to test actual validation status attribute or styling"), async ({ initTestBed, page }) => {
      await initTestBed(`<Slider testId="slider" validationStatus="${status}" />`);
      const slider = page.getByTestId("slider");
      await expect(slider).toHaveAttribute("data-validation-status", status);
    });
  });

  test("handles invalid validationStatus gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider validationStatus="invalid" />`);
    await expect(page.getByRole("slider")).toBeVisible();
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test.skip("handles extremely large values", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="999999999" maxValue="1000000000" />`);
    await expect(page.getByRole("slider")).toHaveValue("999999999");
  });

  test.skip("handles negative values", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider minValue="-100" maxValue="0" initialValue="-50" />`);
    await expect(page.getByRole("slider")).toHaveValue("-50");
  });

  test.skip("handles very small step values", SKIP_REASON.TO_BE_IMPLEMENTED("Need proper assertion for slider value - toHaveValue doesn't work on sliders"), async ({ initTestBed, page }) => {
    await initTestBed(`<Slider step="0.001" initialValue="0" />`);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect(slider).toHaveValue("0.001");
  });

  test("handles conflicting min/max values", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider minValue="100" maxValue="50" />`);
    await expect(page.getByRole("slider")).toBeVisible();
  });

  test("handles zero step value", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider step="0" />`);
    await expect(page.getByRole("slider")).toBeVisible();
  });

  test("handles range with identical values", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="{[50, 50]}" />`);
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
  });
});
