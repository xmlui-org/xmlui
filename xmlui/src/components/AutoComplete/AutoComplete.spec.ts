import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("renders with default props", async ({ initTestBed, createAutoCompleteDriver }) => {
  await initTestBed(`
    <AutoComplete />
  `);

  const driver = await createAutoCompleteDriver();

  await expect(driver.component).toBeVisible();
});

test("displays placeholder text", async ({ initTestBed, page }) => {
  const placeholder = "Search for an option";
  await initTestBed(`<AutoComplete placeholder="${placeholder}" />`);
  await expect(page.getByPlaceholder(placeholder)).toBeVisible();
});

test("initialValue sets the selected option", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AutoComplete id="autoComplete" initialValue="1" label="Select a superhero">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Text testId="text">Selected value: {autoComplete.value}</Text>
    </Fragment>
  `);

  await expect(page.getByTestId("text")).toHaveText("Selected value: 1");
  await expect(page.getByRole("combobox")).toHaveValue("Bruce Wayne");
});

test("opens dropdown when clicked", async ({ initTestBed, page, createAutoCompleteDriver }) => {
  await initTestBed(`
    <AutoComplete>
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  const driver = await createAutoCompleteDriver();
  await driver.click();

  await expect(page.getByRole("listbox")).toBeVisible();
});

test("selects an option when clicked", async ({ initTestBed, page, createAutoCompleteDriver }) => {
  await initTestBed(`
    <Fragment>
      <AutoComplete id="autoComplete">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Text testId="text">Selected value: {autoComplete.value}</Text>
    </Fragment>
  `);

  const driver = await createAutoCompleteDriver("autoComplete");

  // Open the dropdown
  await driver.click();

  // Wait for options to be visible before selecting
  await page.getByRole("option", { name: "Diana Prince" }).waitFor({ state: "visible" });

  // Select the option
  await driver.selectLabel("Diana Prince");

  // Verify the results
  await expect(page.getByTestId("text")).toHaveText("Selected value: 3");
  await expect(page.getByRole("combobox")).toHaveValue("Diana Prince");
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("disabled option cannot be selected", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <AutoComplete id="autoComplete">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" enabled="false" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Text testId="text">Selected value: {autoComplete.value}</Text>
    </Fragment>
  `);

  const driver = await createAutoCompleteDriver("autoComplete");
  await driver.click();

  await driver.selectLabel("Clark Kent");

  // Value should not change to the disabled option
  await expect(page.getByRole("combobox")).not.toHaveValue("Bruce Wayne");
  await expect(page.getByTestId("text")).not.toHaveText("Selected value: 2");
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("multi mode allows selecting multiple options", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <Fragment>
      <AutoComplete id="autoComplete" multi="true">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Text testId="text">Selected values: {autoComplete.value}</Text>
    </Fragment>
  `);

  const driver = await createAutoCompleteDriver("autoComplete");
  await driver.click();

  // Click the first option
  await driver.selectLabel("Bruce Wayne");

  // First option should be selected
  await expect(page.getByTestId("text")).toHaveText("Selected values: 1");

  // Click another option
  await driver.selectLabel("Diana Prince");

  // Both options should be selected
  await expect(page.getByTestId("text")).toHaveText("Selected values: 1,3");

  await driver.click();

  // Both selected options should be visible as badges
  await expect(page.getByText("Bruce Wayne")).toBeVisible();
  await expect(page.getByText("Diana Prince")).toBeVisible();
});

test("searching filters options", async ({ initTestBed, page, createAutoCompleteDriver }) => {
  await initTestBed(`
    <AutoComplete>
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
      <Option value="4" label="Barry Allen" />
      <Option value="5" label="Hal Jordan" />
    </AutoComplete>
  `);

  const driver = await createAutoCompleteDriver();
  await driver.click();

  // Type in the search field
  await page.keyboard.type("Bruce");

  // Only Bruce Wayne should be visible
  await expect(page.getByText("Bruce Wayne")).toBeVisible();
  await expect(page.getByText("Clark Kent")).not.toBeVisible();
  await expect(page.getByText("Diana Prince")).not.toBeVisible();
});

test("emptyListTemplate is shown when no options match", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <AutoComplete>
      <property name="emptyListTemplate">
        <Text>No options found</Text>
      </property>
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  const driver = await createAutoCompleteDriver();
  await driver.click();

  // Type something that doesn't match any option
  await page.keyboard.type("Joker");

  // Empty list template should be shown
  await expect(page.getByText("No options found")).toBeVisible();
});

test("optionTemplate customizes option appearance", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <AutoComplete>
      <property name="optionTemplate">
        <Text textAlign="center" color="purple">{$item.label}</Text>
      </property>
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  const driver = await createAutoCompleteDriver();
  await driver.click();

  // Options should be visible with custom styling
  await expect(page.getByText("Bruce Wayne")).toBeVisible();
  await expect(page.getByText("Clark Kent")).toBeVisible();
  await expect(page.getByText("Diana Prince")).toBeVisible();
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("readOnly prevents changing selection", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <AutoComplete readOnly="true" initialValue="1">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  // Initial value should be displayed
  await expect(page.getByRole("combobox")).toHaveValue("Bruce Wayne");

  // Try to click to open dropdown
  const driver = await createAutoCompleteDriver();
  await driver.click();

  // Selection should not change
  await expect(page.getByRole("listbox")).not.toBeVisible();
});

test("disabled state prevents interaction", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <AutoComplete enabled="false">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  const driver = await createAutoCompleteDriver();

  // Try to click to open dropdown
  await driver.click({ force: true });

  // Try to type in the input
  await page.keyboard.type("Joker");

  // Dropdown should not open
  await expect(page.getByRole("listbox")).not.toBeVisible();

  // Input should not change
  await expect(page.getByRole("combobox")).toHaveValue("");
});

// =============================================================================
// API AND EVENT TESTS
// =============================================================================

test("didChange event fires when option is selected", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <App var.selectedValue="">
      <AutoComplete id="autoComplete" onDidChange="(val) => selectedValue = val">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Text testId="text">{selectedValue}</Text>
    </App>
  `);

  const driver = await createAutoCompleteDriver("autoComplete");
  await driver.click();
  await driver.selectLabel("Diana Prince");

  await expect(page.getByTestId("text")).toHaveText("3");
});

test("gotFocus and lostFocus events work correctly", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'AutoComplete focused' : 'AutoComplete lost focus'}</Text>
      <AutoComplete
        id="autoComplete"
        onGotFocus="isFocused = true"
        onLostFocus="isFocused = false"
      >
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
    </App>
  `);

  // Initial state
  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete lost focus");

  // Focus the autocomplete
  const driver = await createAutoCompleteDriver("autoComplete");
  await driver.click();

  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete focused");

  // Blur the autocomplete
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete lost focus");
});

test("gotFocus and lostFocus events by clicking on label work correctly", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'AutoComplete focused' : 'AutoComplete lost focus'}</Text>
      <AutoComplete
        id="autoComplete"
        label="Select a hero"
        onGotFocus="isFocused = true"
        onLostFocus="isFocused = false"
      >
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
    </App>
  `);

  // Initial state
  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete lost focus");

  // Focus the autocomplete
  await page.getByText("Select a hero").click();

  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete focused");

  // Blur the autocomplete
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete lost focus");
});

test("setValue API works correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <AutoComplete id="autoComplete">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Button
        testId="setButton"
        label="Set Value"
        onClick="autoComplete.setValue('2')" />
      <Text testId="text">Selected value: {autoComplete.value}</Text>
    </App>
  `);

  // Initially no selection
  await expect(page.getByTestId("text")).toHaveText("Selected value: ");

  // Set the value using the API
  await page.getByTestId("setButton").click();
  await expect(page.getByTestId("text")).toHaveText("Selected value: 2");
  await expect(page.getByRole("combobox")).toHaveValue("Clark Kent");
});

test("focus API brings focus to the component", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'AutoComplete focused' : 'AutoComplete lost focus'}</Text>
 
      <AutoComplete id="autoComplete">
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
      <Button
        testId="focusButton"
        label="Focus AutoComplete"
        onClick="autoComplete.focus()" />
    </App>
  `);

  // Initial state
  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete lost focus");

  // Focus the autocomplete using the API
  await page.getByTestId("focusButton").click();

  // Check if the autocomplete is focused
  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete lost focus");

  const isFocused = await page
    .getByRole("combobox")
    .evaluate((el) => document.activeElement === el);
  expect(isFocused).toBeTruthy();
});

test("autoFocus brings focus to the component on load", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'AutoComplete focused' : 'AutoComplete lost focus'}</Text>
      <AutoComplete autoFocus="true" onGotFocus="isFocused = true">
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
    </App>
  `);

  await expect(page.getByTestId("focusText")).toHaveText("AutoComplete focused");
});

test("creates new option when typing non-existing value", async ({
  initTestBed,
  page,
  createAutoCompleteDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Fragment>
      <AutoComplete id="autoComplete" creatable="true" onItemCreated="item => testState = item">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
      </AutoComplete>
    </Fragment>
  `);

  const driver = await createAutoCompleteDriver("autoComplete");
  await driver.click();

  // Type a new option
  await page.keyboard.type("Peter Parker");
  await page.keyboard.press("Enter");

  expect(await testStateDriver.testState()).toBe("Peter Parker");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("has appropriate ARIA attributes", async ({ initTestBed, page }) => {
  // ), //   "There's a weird issue where the aria-expanded attribute is not set correctly on the input but it is on the wrapping div.", // SKIP_REASON.XMLUI_BUG(
  // TODO: review these Copilot-created tests
  await initTestBed(`
    <AutoComplete label="Select a hero" placeholder="Search heroes">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  // Get the combobox element
  const listWrapper = page.locator('[data-part-id="listWrapper"]').first();
  const combobox = page.getByRole("combobox");

  // Check initial ARIA attributes
  await expect(combobox).toHaveAttribute("aria-autocomplete", "list");
  await expect(listWrapper).toHaveAttribute("aria-expanded", "false");

  // Open the dropdown
  await combobox.focus();
  await page.keyboard.press("Enter");

  // Check expanded state
  await expect(listWrapper).toHaveAttribute("aria-expanded", "true");
});

test("supports keyboard navigation with arrow keys", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete id="autoComplete">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  // Focus the autocomplete
  await page.getByRole("combobox").focus();

  // Open dropdown with arrow down
  await page.keyboard.press("ArrowDown", { delay: 100 });
  await expect(page.getByRole("listbox")).toBeVisible();

  // Navigate through options
  await page.keyboard.press("ArrowDown", { delay: 100 }); // First option
  await page.keyboard.press("ArrowDown", { delay: 100 }); // Second option
  await page.keyboard.press("ArrowDown", { delay: 100 }); // Third option
  await page.keyboard.press("ArrowUp", { delay: 100 }); // Back to second option

  // Select with Enter
  await page.keyboard.press("Enter", { delay: 100 });

  // Verify selection
  await expect(page.getByRole("combobox")).toHaveValue("Clark Kent");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("input has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<AutoComplete width="200px" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in px", async ({ page, initTestBed }) => {
  await initTestBed(`<AutoComplete width="200px" label="test" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<AutoComplete width="50%" testId="test"/>`, {});

  const input = page.getByTestId("test");
  const { width } = await input.boundingBox();
  expect(width).toBe(200);
});

test("input with label has correct width in %", async ({ page, initTestBed }) => {
  await page.setViewportSize({ width: 400, height: 300 });
  await initTestBed(`<AutoComplete width="50%" label="test" testId="test"/>`, {});

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
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-AutoComplete${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-AutoComplete${variant.value}`]: "rgb(255, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-AutoComplete${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-AutoComplete${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct fontSize ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`fontSize-AutoComplete${variant.value}`]: "14px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("font-size", "14px");
    });

    test(`applies correct backgroundColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-AutoComplete${variant.value}`]: "rgb(240, 240, 240)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-AutoComplete${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-AutoComplete${variant.value}`]: "rgb(0, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-AutoComplete${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct backgroundColor on hover ${variant.value}`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-AutoComplete${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-AutoComplete${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-AutoComplete${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });
  });

  test("applies correct textColor to placeholder", async ({ initTestBed, page }) => {
    await initTestBed(`<AutoComplete testId="test" placeholder="Search..." />`, {
      testThemeVars: { "textColor-placeholder-AutoComplete": "rgb(0, 0, 0)" },
    });
    const placeholderColor = await page.evaluate(() => {
      const input = document.querySelector("input");
      return window.getComputedStyle(input, "::placeholder").color;
    });
    expect(placeholderColor).toBe("rgb(0, 0, 0)");
  });

  test.fixme(
    "applies correct fontSize to placeholder",
    SKIP_REASON.UNSURE("Does AutoComplete applies the correct css for the placeholder?"),
    async ({ initTestBed, page }) => {
      await initTestBed(`<AutoComplete testId="test" placeholder="Search..." />`, {
        testThemeVars: { "fontSize-placeholder-AutoComplete--default": "20px" },
      });
      const placeholderFontSize = await page.evaluate(() => {
        const input = document.querySelector("input");
        return window.getComputedStyle(input, "::placeholder").fontSize;
      });
      expect(placeholderFontSize).toBe("20px");
    },
  );
});

// =============================================================================
// BEHAVIOR TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" tooltip="Tooltip text" />`);

    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");

    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "borderColor-AutoComplete-CustomVariant": "rgb(255, 0, 0)",
      },
    });
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("can select part: 'listWrapper'", async ({ page, initTestBed }) => {
    await initTestBed(
      `<AutoComplete testId="test"><Option value="1" label="Test" /></AutoComplete>`,
    );
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    await expect(listWrapper).toBeVisible();
  });

  test("can select part: 'input'", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" />`);
    const inputPart = page.locator("[data-part-id='input']");
    await expect(inputPart).toBeVisible();
  });

  test("parts are present when tooltip is added", async ({ page, initTestBed }) => {
    await initTestBed(
      `<AutoComplete testId="test" tooltip="Tooltip text"><Option value="1" label="Test" /></AutoComplete>`,
    );

    const component = page.getByTestId("test");
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    const inputPart = page.locator("[data-part-id='input']");

    await expect(listWrapper).toBeVisible();
    await expect(inputPart).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(
      `<AutoComplete testId="test" variant="CustomVariant"><Option value="1" label="Test" /></AutoComplete>`,
      {
        testThemeVars: {
          "borderColor-AutoComplete-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );

    const component = page.getByTestId("test");
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    const inputPart = page.locator("[data-part-id='input']");

    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(listWrapper).toBeVisible();
    await expect(inputPart).toBeVisible();
  });

  test("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" variant="CustomVariant" />`, {
      testThemeVars: {
        "backgroundColor-AutoComplete-CustomVariant": "rgb(255, 0, 0)",
      },
    });

    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");
  });

  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" tooltipMarkdown="**Bold text**" />`);

    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");

    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" animation="fadeIn" />`);

    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
  });

  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(`<AutoComplete testId="test" tooltip="Tooltip text" animation="fadeIn" />`);

    const component = page.getByTestId("test");
    await expect(component).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <AutoComplete 
        testId="test" 
        tooltip="Tooltip text" 
        variant="CustomVariant"
        animation="fadeIn"
      >
        <Option value="1" label="Test" />
      </AutoComplete>
    `,
      {
        testThemeVars: {
          "backgroundColor-AutoComplete-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );

    const component = page.getByTestId("test");
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    const inputPart = page.locator("[data-part-id='input']");

    // Verify variant applied
    await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");

    // Verify parts are visible
    await expect(listWrapper).toBeVisible();
    await expect(inputPart).toBeVisible();
  });

  test("requireLabelMode='markRequired' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <AutoComplete testId="test" label="Username" required="true" requireLabelMode="markRequired" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markRequired' hides indicator for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <AutoComplete testId="test" label="Username" required="false" requireLabelMode="markRequired" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markOptional' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <AutoComplete testId="test" label="Username" required="false" requireLabelMode="markOptional" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("requireLabelMode='markOptional' hides indicator for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <AutoComplete testId="test" label="Username" required="true" requireLabelMode="markOptional" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).not.toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows asterisk for required fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <AutoComplete testId="test" label="Username" required="true" requireLabelMode="markBoth" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).toContainText("*");
    await expect(label).not.toContainText("(Optional)");
  });

  test("requireLabelMode='markBoth' shows optional tag for optional fields", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form>
        <AutoComplete testId="test" label="Username" required="false" requireLabelMode="markBoth" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).not.toContainText("*");
    await expect(label).toContainText("(Optional)");
  });

  test("input requireLabelMode overrides Form itemRequireLabelMode", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markRequired">
        <AutoComplete testId="test" label="Username" required="false" requireLabelMode="markOptional" bindTo="username">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const label = page.getByText("Username");
    await expect(label).toContainText("(Optional)");
    await expect(label).not.toContainText("*");
  });

  test("input inherits Form itemRequireLabelMode when not specified", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Form itemRequireLabelMode="markBoth">
        <AutoComplete testId="test1" label="Required Field" required="true" bindTo="field1">
          <Option value="1" label="Option 1" />
        </AutoComplete>
        <AutoComplete testId="test2" label="Optional Field" required="false" bindTo="field2">
          <Option value="1" label="Option 1" />
        </AutoComplete>
      </Form>
    `);
    
    const requiredLabel = page.getByText("Required Field");
    const optionalLabel = page.getByText("Optional Field");
    
    await expect(requiredLabel).toContainText("*");
    await expect(requiredLabel).not.toContainText("(Optional)");
    await expect(optionalLabel).toContainText("(Optional)");
    await expect(optionalLabel).not.toContainText("*");
  });
});

// =============================================================================
// Z-INDEX AND MODAL LAYERING TESTS
// =============================================================================

test.describe("Nested DropdownMenu and AutoComplete", () => {
  test("ModalDialog > DropdownMenu > AutoComplete", async ({
    initTestBed,
    page,
    createDropdownMenuDriver,
    createAutoCompleteDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="outerDialog.open()">Open Dialog</Button>
        <ModalDialog id="outerDialog" title="Outer Dialog">
          <DropdownMenu testId="nested-dropdown" modal="{true}">
            <property name="triggerTemplate">
              <Button label="Open actions" />
            </property>
            <MenuItem>Item 1</MenuItem>
            <MenuItem>Item 2</MenuItem>
            <AutoComplete modal="{true}" id="testAutoComplete" testId="testAutoComplete">
              <Option value="opt1" label="Option 1" />
              <Option value="opt2" label="Option 2" />
              <Button
                label="Confirm action"
                onClick="{
                  const result = confirm('Confirm action', 'Are you sure?', 'Yes');
                  testState = result ? 'confirmed' : 'canceled';
                }"
              />
            </AutoComplete>
          </DropdownMenu>
        </ModalDialog>
      </Fragment>
    `);

    const dropdownDriver = await createDropdownMenuDriver("nested-dropdown");

    await page.getByTestId("openBtn").click();

    const outerDialog = page.getByRole("dialog", { name: "Outer Dialog" });
    await expect(outerDialog).toBeVisible();

    await expect(dropdownDriver.component).toBeVisible();

    await dropdownDriver.open();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 2")).toBeVisible();

    const autoCompleteDriver = await createAutoCompleteDriver("testAutoComplete");
    await expect(autoCompleteDriver.component).toBeVisible();

    await autoCompleteDriver.click();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 2")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Option 2")).toBeVisible();

    await page.getByText("Confirm action").nth(1).click();
    const confirmDialog = page.getByRole("dialog", { name: "Confirm action" });
    await expect(confirmDialog).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 }); // Click outside all dialogs
    await expect(confirmDialog).not.toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Option 1")).not.toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Item 1")).not.toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Outer Dialog")).not.toBeVisible();
  });

  test("ModalDialog > AutoComplete > DropdownMenu", async ({
    initTestBed,
    page,
    createDropdownMenuDriver,
    createAutoCompleteDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <Button testId="openBtn" onClick="outerDialog.open()">Open Dialog</Button>
        <ModalDialog id="outerDialog" title="Outer Dialog">
          <AutoComplete modal="{true}" id="testAutoComplete" testId="testAutoComplete">
            <Option value="opt1" label="Option 1" />
            <Option value="opt2" label="Option 2" />
            <DropdownMenu testId="nested-dropdown" modal="{true}">
              <property name="triggerTemplate">
                <Button label="Open actions" />
              </property>
              <MenuItem>Item 1</MenuItem>
              <MenuItem>Item 2</MenuItem>
              <Button
                label="Confirm action"
                onClick="{
                  const result = confirm('Confirm action', 'Are you sure?', 'Yes');
                  testState = result ? 'confirmed' : 'canceled';
                }"
              />
            </DropdownMenu>
          </AutoComplete>
        </ModalDialog>
      </Fragment>
    `);

    const autoCompleteDriver = await createAutoCompleteDriver("testAutoComplete");

    await page.getByTestId("openBtn").click();

    const outerDialog = page.getByRole("dialog", { name: "Outer Dialog" });
    await expect(outerDialog).toBeVisible();

    await expect(autoCompleteDriver.component).toBeVisible();

    await autoCompleteDriver.click();
    await page.waitForTimeout(100);
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Option 2")).toBeVisible();

    const dropdownDriver = await createDropdownMenuDriver("nested-dropdown");
    await dropdownDriver.open();
    await page.waitForTimeout(100);

    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Option 2")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 2")).toBeVisible();

    await page.getByText("Confirm action").click({ delay: 100 });
    const confirmDialog = page.getByRole("dialog", { name: "Confirm action" });
    await expect(confirmDialog).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 }); // Click outside all dialogs
    await expect(confirmDialog).not.toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Item 1")).not.toBeVisible();
    await expect(page.getByText("Option 1")).toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Option 1")).not.toBeVisible();
    await expect(page.getByText("Outer Dialog")).toBeVisible();

    await page.mouse.click(10, 10, { delay: 100 });
    await expect(page.getByText("Outer Dialog")).not.toBeVisible();
  });
});
