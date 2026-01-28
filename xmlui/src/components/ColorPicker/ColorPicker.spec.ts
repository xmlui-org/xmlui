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

test.describe("Validation", () => {
  [
    { value: "--default", prop: "" },
    { value: "--warning", prop: 'validationStatus="warning"' },
    { value: "--error", prop: 'validationStatus="error"' },
    { value: "--success", prop: 'validationStatus="valid"' },
  ].forEach((variant) => {
    test(`applies correct borderRadius ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-ColorPicker${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-ColorPicker${variant.value}`]: "rgb(255, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-ColorPicker${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-ColorPicker${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-ColorPicker${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-ColorPicker${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<ColorPicker testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-ColorPicker${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });
  });
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

test("component applies width-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker testId="test" />`, {
    testThemeVars: {
      "width-ColorPicker": "100px",
    },
  });
  const colorInput = page.getByTestId("test");
  await expect(colorInput).toHaveCSS("width", "100px");
});

test("component applies height-ColorPicker theme variable", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker testId="test" />`, {
    testThemeVars: {
      "height-ColorPicker": "50px",
    },
  });
  const colorInput = page.getByTestId("test");
  await expect(colorInput).toHaveCSS("height", "50px");
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
  
  // Submit the form
  await page.locator("[type=submit]").click();
  
  // Check that the form was submitted
  await expect.poll(testStateDriver.testState).toEqual("#0000ff");
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

test("bindTo syncs $data and value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Form hideButtonRow="true">
      <ColorPicker id="boundColorPicker" bindTo="colorValue" />
      <Button testId="setBtn" onClick="boundColorPicker.setValue('#00ff00')" />
      <Text testId="dataValue">{$data.colorValue}</Text>
      <Text testId="compValue">{boundColorPicker.value}</Text>
    </Form>
  `);

  await page.getByTestId("setBtn").click();
  await expect(page.getByTestId("dataValue")).toHaveText("#00ff00");
  await expect(page.getByTestId("compValue")).toHaveText("#00ff00");
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

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker width="200px" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<ColorPicker width="200px" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<ColorPicker width="50%" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300});
  await initTestBed(`<ColorPicker width="50%" label="test" testId="test"/>`, {});
  
  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("requireLabelMode='markRequired' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <ColorPicker testId="test" label="Theme Color" required="true" requireLabelMode="markRequired" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markRequired' hides indicator for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <ColorPicker testId="test" label="Theme Color" required="false" requireLabelMode="markRequired" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markOptional' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <ColorPicker testId="test" label="Theme Color" required="false" requireLabelMode="markOptional" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("requireLabelMode='markOptional' hides indicator for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <ColorPicker testId="test" label="Theme Color" required="true" requireLabelMode="markOptional" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <ColorPicker testId="test" label="Theme Color" required="true" requireLabelMode="markBoth" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <ColorPicker testId="test" label="Theme Color" required="false" requireLabelMode="markBoth" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).not.toContainText("*");
    await expect(label).toContainText("(Optional)");
  });

  test("input requireLabelMode overrides Form itemRequireLabelMode", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markRequired">
        <ColorPicker testId="test" label="Theme Color" required="false" requireLabelMode="markOptional" bindTo="themeColor" />
      </Form>
    `);
    
    const label = page.getByText("Theme Color");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("input inherits Form itemRequireLabelMode when not specified", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markBoth">
        <ColorPicker testId="test1" label="Required Field" required="true" bindTo="field1" />
        <ColorPicker testId="test2" label="Optional Field" required="false" bindTo="field2" />
      </Form>
    `);
    
    const requiredLabel = page.getByText("Required Field");
    const optionalLabel = page.getByText("Optional Field");
    
    await expect(requiredLabel).toContainText("*");
    await expect(requiredLabel).not.toContainText("(Optional)");
    await expect(optionalLabel).toContainText("(Optional)");
    await expect(optionalLabel).not.toContainText("*");
  });

  test("does not duplicate label when inside Form with label prop", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Form>
        <ColorPicker
          testId="test"
          label="Choose color"
          labelPosition="top"
        />
      </Form>
    `);
    
    // Should only have one label with the text "Choose color"
    const labels = page.getByText("Choose color");
    await expect(labels).toHaveCount(1);
  });
});