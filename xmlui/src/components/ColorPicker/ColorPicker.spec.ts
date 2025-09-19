import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with default value", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {});
  
  // Check that the component is visible
  await expect(page.locator("input[type='color']")).toBeVisible();
  
  // Check default color (#000000 - black)
  await expect(page.locator("input[type='color']")).toHaveValue("#000000");
});

test("component updates when value changes", async ({ page, initTestBed }) => {
  const COLOR_1 = "#ff0000"; // Red
  const COLOR_2 = "#00ff00"; // Green

  await initTestBed(`<ColorPicker initialValue="${COLOR_1}" />`, {});
  
  // Check that the initial color is set correctly
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveValue(COLOR_1);
  
  // Change the color
  await colorInput.fill(COLOR_2); // Green
  await expect(colorInput).toHaveValue(COLOR_2);
});

test("component renders label correctly", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker label="Select Color" />`);
  // Check that the label is displayed
  const label = page.locator("label");
  await expect(label).toBeVisible();
  await expect(label).toContainText("Select Color");
});

test("component handles disabled state correctly", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker enabled="false" />`, {});
  
  // Check that the input is disabled
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toBeDisabled();
});

test("component handles enabled state correctly", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker enabled="true" />`, {});
  
  // Check that the input is disabled
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toBeEnabled();
});

test("component fires didChange event when color is selected", async ({ page, initTestBed }) => {
  const COLOR_1 = "#ff0000"; // Red
  const COLOR_2 = "#00ff00"; // Green
  const { testStateDriver } = await initTestBed(`
    <ColorPicker initialValue="${COLOR_1}" onDidChange="(value) => testState = value" />
  `);
  
  // Change the color
  await page.locator("input[type='color']").fill(COLOR_2);
  
  // Check that the event fired with the new color value
  await expect.poll(() => testStateDriver.testState()).toEqual(COLOR_2);
});

test("component's gotFocus event fires", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <ColorPicker initialValue="#FF0000" onGotFocus="testState = 'focused'" />
  `);
  const colorInput = page.locator("input[type='color']");
  
  // Focus the input
  await colorInput.focus();
  
  // Verify the input is focused
  await expect(colorInput).toBeFocused();
  // Verify the focus event fired
  await expect.poll(testStateDriver.testState).toEqual("focused");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has correct accessibility attributes", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker label="Select Color" />`, {});
  
  // Check that the input has a valid label association
  const colorInput = page.locator("input[type='color']");
  const inputId = await colorInput.getAttribute("id");  
  const label = page.locator("label");

  expect(inputId).toBeTruthy();
  await expect(label).toHaveAttribute("for", inputId);
});

test("component is keyboard accessible", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <ColorPicker initialValue="#FF0000" onGotFocus="testState = 'focused'" />
  `);
  const colorInput = page.locator("input[type='color']");
  
  // Focus the input
  await page.keyboard.press("Tab");
  
  // Verify the input is focused
  await expect(colorInput).toBeFocused();
  // Verify the focus event fired
  await expect.poll(testStateDriver.testState).toEqual("focused");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.skip("component shows different validation states correctly", async ({ page, initTestBed }) => {
  // Error state
  await initTestBed(`<ColorPicker validationStatus="error" />`, {});
  let colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveClass(/error/);
  
  // Warning state
  await initTestBed(`<ColorPicker validationStatus="warning" />`, {});
  colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveClass(/warning/);
  
  // Valid state
  await initTestBed(`<ColorPicker validationStatus="valid" />`, {});
  colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveClass(/valid/);
});

test("component applies backgroundColor-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "backgroundColor-ColorPicker": "rgb(240, 240, 240)",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("background-color", "rgb(240, 240, 240)");
});

test("component applies borderColor-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "borderColor-ColorPicker": "rgb(255, 0, 0)",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("border-color", "rgb(255, 0, 0)");
});

test("component applies borderColor-ColorPicker--hover theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "borderColor-ColorPicker": "rgb(0, 0, 0)",
      "borderColor-ColorPicker--hover": "rgb(255, 0, 0)",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("border-color", "rgb(0, 0, 0)");
  await colorInput.hover();
  await expect(colorInput).toHaveCSS("border-color", "rgb(255, 0, 0)");
});

test("component applies borderColor-ColorPicker--focus theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "borderColor-ColorPicker": "rgb(0, 0, 0)",
      "borderColor-ColorPicker--focus": "rgb(0, 255, 0)",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("border-color", "rgb(0, 0, 0)");
  await colorInput.focus();
  await expect(colorInput).toHaveCSS("border-color", "rgb(0, 255, 0)");
});

test("component applies borderRadius-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "borderRadius-ColorPicker": "4px",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("border-radius", "4px");
});

test("component applies borderWidth-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "borderWidth-ColorPicker": "2px",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("border-width", "2px");
});

test("component applies borderStyle-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "borderStyle-ColorPicker": "solid",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("border-style", "solid");
});

test("component applies boxShadow-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker />`, {
    testThemeVars: {
      "boxShadow-ColorPicker": "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
  });
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveCSS("box-shadow", "rgba(0, 0, 0, 0.1) 0px 2px 4px 0px");
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles invalid color values gracefully", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker initialValue="not-a-color" />`);
    const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveValue("#000000");
});

test("component handles required attribute correctly", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker required="true" />`);
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveAttribute("required", "");
});

test("component handles readOnly mode correctly", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker readOnly="true" />`);
  const colorInput = page.locator("input[type='color']");
  // For ColorPickers the readOnly attribute typically makes the input disabled
  await expect(colorInput).toBeDisabled();
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test("component handles rapid value changes efficiently", async ({ page, initTestBed }) => {
  // Test with initial color
  await initTestBed(`
    <Fragment>
      <ColorPicker id="colorPicker" initialValue="#ff0000" />
      <Button testId="toGreen" onClick="colorPicker.setValue('#00ff00')">Change to Green</Button>
      <Button testId="toBlue" onClick="colorPicker.setValue('#0000ff')">Change to Blue</Button>
    </Fragment>
    `);
  await page.getByTestId("toGreen").click();
  await page.getByTestId("toBlue").click();
  await expect(page.locator("input[type='color']")).toHaveValue("#0000ff", { timeout: 3000 });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly in a form context", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <Form onSubmit="(data) => testState = data.testField" data="{{ testField: '#0000ff' }}">
      <FormItem type="colorpicker" label="Choose Color" bindTo="testField" />
    </Form>
  `);
  
  // Check that the color picker is inside the form
  const formElement = page.locator("form");
  const colorInput = formElement.locator("input[type='color']");
  await expect(colorInput).toBeVisible();
  
  // Change the color
  await colorInput.fill("#00ff00");
  
  // Submit the form
  await page.locator("[type=submit]").click();
  
  // Check that the form was submitted
  await expect.poll(testStateDriver.testState).toEqual("#00ff00");
});

test("component value API works", async ({ page, initTestBed }) => { 
  await initTestBed(`
    <Fragment>
      <ColorPicker id="colorPicker" initialValue="#ff0000" />
      <Text testId="colorPickerValue" value="{colorPicker.value}" />
    </Fragment>
  `);
  await expect(page.getByTestId("colorPickerValue")).toHaveText("#ff0000");
});

test("component setValue API works", async ({ page, initTestBed }) => { 
  await initTestBed(`
    <Fragment>
      <ColorPicker id="colorPicker" initialValue="#ff0000" />
      <Button onClick="colorPicker.setValue('#00ff00')">Change Color</Button>
    </Fragment>
  `);
  
  // Test setValue API
  await page.getByRole("button", { name: "Change Color" }).click();
  const colorInput = page.locator("input[type='color']");
  await expect(colorInput).toHaveValue("#00ff00");
});

test("component focus API works", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <ColorPicker id="colorPicker" onGotFocus="testState = 'focused'" />
      <Button onClick="colorPicker.focus()">Focus Color Picker</Button>
    </Fragment>
  `);
  const button = page.getByRole("button", { name: "Focus Color Picker" });
  
  // Focus the input
  await button.click();
  
  // Verify the input is focused
  await expect(page.locator("input[type='color']")).toBeFocused();
  // Verify the focus event fired
  await expect.poll(testStateDriver.testState).toEqual("focused");
});
