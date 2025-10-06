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

  test("sets initialValue of field", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Fragment>
          <Slider id="slider" initialValue="5" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
    await expect(page.getByTestId("slider-value")).toHaveText("5");
  });

  test("accepts empty as initialValue", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Fragment>
          <Slider id="slider" initialValue="" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
    await expect(page.getByTestId("slider-value")).toHaveText("0");
  });

  [
    { label: "int", value: 5, expected: "5" },
    { label: "float", value: 5.5, expected: "5.5" },
  ].forEach(({ label, value, expected }) => {
    test(`handles ${label} correctly`, async ({ initTestBed, page }) => {
      await initTestBed(`
        <Fragment>
          <Slider id="slider" initialValue="${JSON.stringify(value)}" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
      await expect(page.getByTestId("slider-value")).toHaveText(expected);
    });
  });

  [
    { label: "string that resolves to int", value: "5", expected: "5" },
    { label: "string that resolves to float", value: "5.5", expected: "5.5" },
  ].forEach(({ label, value, expected }) => {
    test(`handles ${label} correctly`, async ({ initTestBed, page }) => {
      await initTestBed(`
        <Fragment>
          <Slider id="slider" initialValue="${value}" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
      await expect(page.getByTestId("slider-value")).toHaveText(expected);
    });
  });

  [
    { label: "NaN", value: NaN },
    { label: "null", value: null },
    { label: "undefined", value: undefined },
    { label: "empty string", value: "" },
    { label: "string not resolving to number", value: "abc" },
  ].forEach(({ label, value }) => {
    test(`handles ${label} gracefully`, async ({ initTestBed, page }) => {
      await initTestBed(`
        <Fragment>
          <Slider id="slider" initialValue="${value}" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
      await expect(page.getByTestId("slider-value")).toHaveText("0");
    });
  });

  test("minValue sets the lower bound", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Fragment>
          <Slider id="slider" minValue="5" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuemin", "5");
  });

  test("value cannot be lower than minValue", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="slider" minValue="20" maxValue="30" initialValue="10" />
        <Text testId="slider-value" value="{slider.value}" />
      </Fragment>`);
    await expect(page.getByTestId("slider-value")).toHaveText("20");
  });

  test("maxValue sets the upper bound", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider maxValue="50" />`);
    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuemax", "50");
  });

  test("value cannot be larger than maxValue", async ({ initTestBed, page }) => {
    await initTestBed(`
        <Fragment>
          <Slider id="slider" maxValue="30" initialValue="40" />
          <Text testId="slider-value" value="{slider.value}" />
        </Fragment>`);
    await expect(page.getByTestId("slider-value")).toHaveText("30");
  });

  test("handles invalid minValue/maxValue gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider minValue="invalid" maxValue="invalid" />`);
    const slider = page.getByRole("slider");
    await expect(slider).toHaveAttribute("aria-valuemin", "0");
    await expect(slider).toHaveAttribute("aria-valuemax", "10");
  });

  test("step defines increment value", async ({ initTestBed, page }) => {
    await initTestBed(`
    <Fragment>
      <Slider id="slider" step="2" initialValue="0" />
      <Text testId="slider-value" value="{slider.value}" />
    </Fragment>`);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect(page.getByTestId("slider-value")).toHaveText("2");
  });

  test("handles fractional step values", async ({ initTestBed, page }) => {
    await initTestBed(`
    <Fragment>
      <Slider id="slider" step="0.1" initialValue="0" />
      <Text testId="slider-value" value="{slider.value}" />
    </Fragment>`);
    const slider = page.getByRole("slider");
    await slider.press("ArrowRight");
    await expect(page.getByTestId("slider-value")).toHaveText("0.1");
  });

  test("component handles multiple thumbs", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="{[2, 4]}" />`);
    const thumbs = page.getByRole("slider");
    await expect(thumbs).toHaveCount(2);
  });

  test("all thumbs are interactable via mouse", async ({
    initTestBed,
    createSliderDriver,
    page,
  }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="slider" initialValue="{[2, 4]}" minValue="0" maxValue="10" />
        <Text testId="sliderValue0">{slider.value[0]}</Text>
        <Text testId="sliderValue1">{slider.value[1]}</Text>
      </Fragment>
    `);
    const driver = await createSliderDriver("slider");
    await driver.dragThumbByMouse("start", 0);
    await driver.dragThumbByMouse("end", 1);

    await expect(page.getByTestId("sliderValue0")).toHaveText("0");
    await expect(page.getByTestId("sliderValue1")).toHaveText("10");
  });

  test("all thumbs are interactable via keyboard", async ({ initTestBed, createSliderDriver, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="slider" initialValue="{[2, 4]}" minValue="0" maxValue="10" />
        <Text testId="sliderValue0">{slider.value[0]}</Text>
        <Text testId="sliderValue1">{slider.value[1]}</Text>
      </Fragment>
    `);
    const driver = await createSliderDriver("slider");
    await driver.stepThumbByKeyboard("ArrowLeft", 0);
    await driver.stepThumbByKeyboard("ArrowRight", 1);
    await expect(page.getByTestId("sliderValue0")).toHaveText("1");
    await expect(page.getByTestId("sliderValue1")).toHaveText("5");
  });

  test("minStepsBetweenThumbs maintains thumb separation", async ({ initTestBed, createSliderDriver, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="slider" initialValue="{[0, 5]}" minStepsBetweenThumbs="3" minValue="0" maxValue="10" />
        <Text testId="sliderValue1">{slider.value[1]}</Text>
      </Fragment>
    `);
    const driver = await createSliderDriver("slider");
    await driver.stepThumbByKeyboard("ArrowLeft", 1, 3); // Try to move left by 3 steps
    await expect(page.getByTestId("sliderValue1")).toHaveText("3");
  });

  test("enabled=false disables control", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider enabled="false" />`);
    await expect(page.getByRole("slider")).toBeDisabled();
  });

  test("readOnly prevents interaction", async ({ initTestBed, page, createSliderDriver }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" readOnly="true" />
        <Text testId="slider-value" value="{mySlider.value}" />
      </Fragment>`);
    const driver = await createSliderDriver("mySlider");
    await driver.dragThumbByMouse("end");
    await expect(page.getByTestId("slider-value")).toHaveText("0"); // Value should remain unchanged
  });

  test.fixme(
    "autoFocus focuses slider on mount",
    SKIP_REASON.XMLUI_BUG("autoFocus does not seem to work with radix-ui, need to double-check"),
    async ({ initTestBed, page }) => {
      await initTestBed(`<Slider autoFocus="true" />`);
      await expect(page.getByRole("slider")).toBeFocused();
    },
  );

  test("required shows visual indicator", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider required="true" label="Required slider" />`);
    await expect(page.getByText("Required slider")).toContainText("*");
  });

  test("showValues=true displays current value", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider showValues="true" initialValue="10" />`);
    await page.getByRole("slider").hover();
    await expect(page.getByText("10")).toBeVisible();
  });

  test("showValues=false hides current value", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider showValues="false" initialValue="10" />`);
    await page.getByRole("slider").hover();
    await expect(page.getByText("10")).not.toBeVisible();
  });

  test("valueFormat customizes value display", async ({ initTestBed, page }) => {
    await initTestBed(
      `<Slider showValues="true" initialValue="10" valueFormat="{(v) => v + '%'}" />`,
    );
    await page.getByRole("slider").hover();
    await expect(page.getByText("10%")).toBeVisible();
  });

  test("handles array initialValue for range", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="{[2, 6]}" />`);
    const sliders = page.getByRole("slider");

    await sliders.first().hover();
    await expect(page.getByText("2")).toBeVisible();
    await expect(page.getByText("6")).toBeVisible();
  });

  test("maintains thumb order in range mode", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="{[6, 2]}" />`);
    const sliders = page.getByRole("slider");
    // Should auto-correct to [2, 6]
    await sliders.first().hover();
    await expect(page.getByText("2")).toBeVisible();
    await expect(page.getByText("6")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct ARIA role", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider />`);
    await expect(page.getByRole("slider")).toBeVisible();
  });
  test("label is properly associated", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider label="Volume Control" />`);
    await page.getByText("Volume Control").click();
    await expect(page.getByRole("slider")).toBeFocused();
  });

  test("supports keyboard navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" initialValue="5" />
        <Text testId="slider-value">{mySlider.value}</Text>
      </Fragment>`);
    const slider = page.getByRole("slider");
    await slider.focus();

    await slider.press("ArrowRight");
    await expect(page.getByTestId("slider-value")).toHaveText("6");

    await slider.press("ArrowLeft");
    await expect(page.getByTestId("slider-value")).toHaveText("5");
  });

  test("supports Home/End key navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" minValue="0" maxValue="100" initialValue="50" />
        <Text testId="slider-value">{mySlider.value}</Text>
      </Fragment>`);
    const slider = page.getByRole("slider");
    await slider.focus();

    await slider.press("Home");
    await expect(page.getByTestId("slider-value")).toHaveText("0");

    await slider.press("End");
    await expect(page.getByTestId("slider-value")).toHaveText("100");
  });

  test("disabled slider has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider enabled="false" />`);
    await expect(page.locator("span").first()).toHaveAttribute("aria-disabled", "true");
  });

  test("required slider has proper ARIA attributes", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider required="true" />`);
    await expect(page.getByRole("slider")).toHaveAttribute("aria-required", "true");
  });

  test("range slider has multiple slider roles", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider initialValue="{[3, 5]}" />`);
    const sliders = page.getByRole("slider");
    await expect(sliders).toHaveCount(2);
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

  test("labelBreak enables label line breaks", async ({ initTestBed, page }) => {
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
      <Slider onDidChange="testState = 'changed'" initialValue="0" />
    `);
    const slider = page.getByRole("slider");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });

  test("didChange event passes new value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Slider onDidChange="arg => testState = arg" initialValue="1" />
    `);
    const slider = page.getByRole("slider");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect.poll(testStateDriver.testState).toEqual(2);
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
        <Slider id="mySlider" initialValue="5" />
        <Text testId="value">{mySlider.value}</Text>
      </Fragment>
    `);
    await expect(page.getByTestId("value")).toHaveText("5");
  });

  test("value API returns state after change", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" initialValue="1" />
        <Text testId="value">{mySlider.value}</Text>
      </Fragment>
    `);
    const slider = page.getByRole("slider");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(page.getByTestId("value")).toHaveText("2");
  });

  test("setValue API updates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" />
        <Button testId="setBtn" onClick="mySlider.setValue(5)" label="{mySlider.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("5");
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

  test("focus API focuses the slider", async ({ initTestBed, page }) => {
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

  test("setValue does not update when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" enabled="false" initialValue="5" />
        <Button testId="setBtn" onClick="mySlider.setValue(10)" label="{mySlider.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("5");
  });

  test("setValue handles invalid values gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" initialValue="5" minValue="0" />
        <Button testId="setBtn" onClick="mySlider.setValue('invalid')" label="{mySlider.value}" />
      </Fragment>
    `);
    await page.getByTestId("setBtn").click();
    await expect(page.getByTestId("setBtn")).toHaveText("0");
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("backgroundColor-track applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "backgroundColor-track-Slider": "rgb(255, 0, 0)",
      },
    });
    const track = page.locator("[data-track]");
    await expect(track).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("backgroundColor-range applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" initialValue="5" />`, {
      testThemeVars: {
        "backgroundColor-range-Slider": "rgb(0, 255, 0)",
      },
    });
    const range = page.locator("[data-range]");
    await expect(range).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test("backgroundColor-thumb applies correctly", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "backgroundColor-thumb-Slider": "rgb(0, 0, 255)",
      },
    });
    const thumb = page.getByRole("slider");
    await expect(thumb).toHaveCSS("background-color", "rgb(0, 0, 255)");
  });

  test("disabled theme variables apply when disabled", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" enabled="false" />`, {
      testThemeVars: {
        "backgroundColor-track-Slider--disabled": "rgb(200, 200, 200)",
      },
    });
    const track = page.locator("[data-track]");
    await expect(track).toHaveCSS("background-color", "rgb(200, 200, 200)");
  });

  test("focus theme variables apply on focus", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "boxShadow-thumb-Slider--focus": "rgb(0, 123, 255) 0px 0px 10px 0px",
      },
    });
    const slider = page.getByRole("slider");
    await slider.focus();
    await expect(slider).toHaveCSS("box-shadow", "rgb(0, 123, 255) 0px 0px 10px 0px");
  });

  test("hover theme variables apply on hover", async ({ initTestBed, page }) => {
    await initTestBed(`<Slider testId="slider" />`, {
      testThemeVars: {
        "boxShadow-thumb-Slider--hover": "rgb(0, 0, 0) 0px 0px 5px 0px",
      },
    });
    const slider = page.getByRole("slider");
    await slider.hover();
    await expect(slider).toHaveCSS("box-shadow", "rgb(0, 0, 0) 0px 0px 5px 0px");
  });
});

// =============================================================================
// VALIDATION STATUS TESTS
// =============================================================================

test.describe("Validation", () => {
  test(`validationStatus=error applies correctly`, async ({ initTestBed, page }) => {
    await initTestBed(`<Slider validationStatus="error" />`, {
      testThemeVars: {
        [`borderColor-Slider-error`]: "rgb(255, 0, 0)",
      },
    });
    const sliderTrack = page.locator("[data-track]");
    await expect(sliderTrack).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  // NOTE: warning color is not applied correctly
  test.fixme(`validationStatus=warning applies correctly`, async ({ initTestBed, page }) => {
    await initTestBed(`<Slider validationStatus="warning" />`, {
      testThemeVars: {
        [`borderColor-Slider-warning`]: "rgb(255, 165, 0)",
      },
    });
    const sliderTrack = page.locator("[data-track]");
    await expect(sliderTrack).toHaveCSS("border-color", "rgb(218, 127, 0)");
  });

  test(`validationStatus=valid applies correctly`, async ({ initTestBed, page }) => {
    await initTestBed(`<Slider validationStatus="valid" />`, {
      testThemeVars: {
        [`borderColor-Slider-success`]: "rgb(0, 255, 0)",
      },
    });
    const sliderTrack = page.locator("[data-track]");
    await expect(sliderTrack).toHaveCSS("border-color", "rgb(0, 255, 0)");
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
  test("handles extremely large values", async ({ initTestBed, page }) => {
    await initTestBed(`
    <Fragment>
      <Slider id="mySlider" initialValue="${Number.MAX_SAFE_INTEGER}" maxValue="${Number.MAX_SAFE_INTEGER}" />
      <Text testId="slider-value" value="{mySlider.value}" />
    </Fragment>`);
    await expect(page.getByTestId("slider-value")).toHaveText(Number.MAX_SAFE_INTEGER.toString());
  });

  test("handles negative values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" minValue="-100" maxValue="0" initialValue="-50" />
        <Text testId="slider-value" value="{mySlider.value}" />
      </Fragment>`);
    await expect(page.getByTestId("slider-value")).toHaveText("-50");
  });

  test("handles very small step values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Fragment>
        <Slider id="mySlider" step="0.000000001" initialValue="0" />
        <Text testId="slider-value" value="{mySlider.value}" />
      </Fragment>`);
    const slider = page.getByRole("slider");
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(page.getByTestId("slider-value")).toHaveText((0.000000001).toExponential());
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

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<Slider width="200px" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<Slider width="200px" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<Slider width="50%" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<Slider width="50%" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});