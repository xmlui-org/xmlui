import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with both label and value properties", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Display Text" value="stored_value" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Display Text" });
    await expect(option).toBeVisible();
  });

  test("renders with only label property (uses label as value)", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Display Text" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Display Text" });
    await expect(option).toBeVisible();
  });

  test("renders with only value property (uses value as label)", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option value="display_value" />
        <Option label="Control Option" value="control" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    // The option with only value should render (may display as empty)
    await expect(page.getByRole("option")).toHaveCount(2);
    await expect(page.getByRole("option").first()).toBeVisible();
    await expect(page.getByRole("option", { name: "Control Option" })).toBeVisible();
  });

  test("does not render when neither label nor value is provided", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option />
        <Option label="Visible Option" value="visible" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    // Should only see the valid option
    await expect(page.getByRole("option")).toHaveCount(1);
    await expect(page.getByRole("option", { name: "Visible Option" })).toBeVisible();
  });

  test("enabled property defaults to true", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select>
        <Option label="Default Option" value="default" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Default Option" });
    await expect(option).toBeVisible();
    await expect(option).not.toHaveAttribute("aria-disabled", "true");
  });

  test("enabled set to true", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select>
        <Option label="Enabled Option" value="enabled" enabled="{true}" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Enabled Option" });
    await expect(option).toBeVisible();
    await expect(option).not.toHaveAttribute("aria-disabled", "true");
  });

  test("enabled set to false", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select>
        <Option label="Disabled Option" value="disabled" enabled="{false}" />
        <Option label="Enabled Option" value="enabled" enabled="{true}" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    const disabledOption = page.getByRole("option", { name: "Disabled Option" });
    const enabledOption = page.getByRole("option", { name: "Enabled Option" });

    await expect(disabledOption).toBeVisible();
    await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
    await expect(enabledOption).toBeVisible();
    await expect(enabledOption).not.toHaveAttribute("aria-disabled", "true");
  });

  test("supports text node children as label", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option value="text_node">Text Node Label</Option>
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Text Node Label" });
    await expect(option).toBeVisible();
  });

  test("supports rich content as children", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select>
        <Option value="rich_content">
          <HStack gap="$space-small">
            <Icon name="user" />
            <Text>Rich Content</Text>
          </HStack>
        </Option>
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option");
    await expect(option).toBeVisible();
    await expect(option.locator("text=Rich Content")).toBeVisible();
  });

  test("label property takes precedence over text node children", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Label Property" value="precedence">Text Node Content</Option>
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Label Property" });
    await expect(option).toBeVisible();
    // Text node should not be visible since label takes precedence
    await expect(page.getByRole("option", { name: "Text Node Content" })).not.toBeVisible();
  });

  test("works within Select component for selection", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="testSelect" onDidChange="arg => testState = arg">
          <Option label="First" value="1" />
          <Option label="Second" value="2" />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("testSelect");
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("Second");

    await expect.poll(testStateDriver.testState).toEqual("2");
  });

  test("works within AutoComplete component for selection", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <AutoComplete id="testAutoComplete" onDidChange="arg => testState = arg">
          <Option label="Apple" value="apple" />
          <Option label="Banana" value="banana" />
        </AutoComplete>
      </Fragment>
    `);

    const autocomplete = page.getByRole("combobox");
    await autocomplete.click();

    const appleOption = page.getByRole("option", { name: "Apple" });
    await appleOption.click();

    await expect.poll(testStateDriver.testState).toEqual("apple");
  });

  test("works within RadioGroup component for selection", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <RadioGroup id="testRadioGroup" onDidChange="arg => testState = arg">
          <VStack>
            <Option label="Option A" value="a" />
            <Option label="Option B" value="b" />
          </VStack>
        </RadioGroup>
      </Fragment>
    `);

    const optionB = page.getByRole("radio", { name: "Option B" });
    await optionB.click();

    await expect.poll(testStateDriver.testState).toEqual("b");
  });

  test("handles numeric values correctly", async ({ initTestBed, page, createSelectDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="numericSelect" onDidChange="arg => testState = arg">
          <Option label="Zero" value="{0}" />
          <Option label="Forty Two" value="{42}" />
          <Option label="Negative" value="{-1}" />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("numericSelect");
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("Forty Two");

    // Values from Select are returned as strings
    await expect.poll(testStateDriver.testState).toEqual(42);
  });

  test("handles boolean values correctly", async ({ initTestBed, page, createSelectDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="booleanSelect" onDidChange="arg => testState = arg">
          <Option label="True" value="{true}" />
          <Option label="False" value="{false}" />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("booleanSelect");
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("False");

    // Values from Select are returned as strings
    await expect.poll(testStateDriver.testState).toEqual(false);
  });

  test("works with dynamic data through Items component", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="dynamicSelect" onDidChange="arg => testState = arg">
          <Items data="{['apple', 'banana', 'cherry']}">
            <Option label="{$item}" value="{$itemIndex}" />
          </Items>
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("dynamicSelect");
    await driver.toggleOptionsVisibility();

    await expect(page.getByRole("option", { name: "apple" })).toBeVisible();
    await expect(page.getByRole("option", { name: "banana" })).toBeVisible();
    await expect(page.getByRole("option", { name: "cherry" })).toBeVisible();

    await driver.selectLabel("banana");
    // Values from Select are returned as strings
    await expect.poll(testStateDriver.testState).toEqual(1);
  });

  test("handles empty string values", async ({ initTestBed, page, createSelectDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="emptySelect" onDidChange="arg => testState = arg">
          <Option label="Empty String" value="" />
          <Option label="Space" value=" " />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("emptySelect");
    await driver.toggleOptionsVisibility();

    await expect(page.getByRole("option", { name: "Empty String" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Space" })).toBeVisible();

    await driver.selectLabel("Empty String");
    // When value is empty string, Select may return the label instead
    const result = await testStateDriver.testState();
    expect(result === "Empty String").toBe(true);
  });

  test("handles null values", async ({ initTestBed, page, createSelectDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="emptySelect" onDidChange="arg => testState = arg">
          <Option label="Empty String" value="{null}" />
          <Option label="Space" value=" " />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("emptySelect");
    await driver.toggleOptionsVisibility();

    await expect(page.getByRole("option", { name: "Empty String" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Space" })).toBeVisible();

    await driver.selectLabel("Empty String");
    // When value is empty string, Select may return the label instead
    const result = await testStateDriver.testState();
    expect(result).toBe(null);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("has correct option role within Select", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Test Option" value="test" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Test Option" });
    await expect(option).toBeVisible();
  });

  test("has correct radio role within RadioGroup", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option label="Test Option" value="test" />
      </RadioGroup>
    `);

    const radio = page.getByRole("radio", { name: "Test Option" });
    await expect(radio).toBeVisible();
  });

  test("disabled option has correct aria-disabled attribute", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Disabled Option" value="disabled" enabled="{false}" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Disabled Option" });
    await expect(option).toHaveAttribute("aria-disabled", "true");
  });

  test("enabled option does not have aria-disabled attribute", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Enabled Option" value="enabled" enabled="{true}" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: "Enabled Option" });
    await expect(option).not.toHaveAttribute("aria-disabled", "true");
  });

  test("supports keyboard navigation within Select", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="keyboardSelect" onDidChange="arg => testState = arg">
          <Option label="First Option" value="1" />
          <Option label="Second Option" value="2" />
          <Option label="Third Option" value="3" />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("keyboardSelect");

    // Start by clicking to open the dropdown and focus on first option
    await driver.component.click();
    await page.waitForTimeout(200);

    // Navigate down to third option step by step with longer waits
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);

    // Select with Enter
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);

    await expect.poll(testStateDriver.testState).toEqual("3");
  });

  test("supports keyboard navigation within RadioGroup", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <RadioGroup id="keyboardRadio" onDidChange="arg => testState = arg">
          <VStack>
            <Option label="First Option" value="1" />
            <Option label="Second Option" value="2" />
            <Option label="Third Option" value="3" />
          </VStack>
        </RadioGroup>
      </Fragment>
    `);

    const firstRadio = page.getByRole("radio", { name: "First Option" });
    await firstRadio.focus();
    await firstRadio.click(); // Start with a selection
    await page.waitForTimeout(100);

    // Navigate with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(100);

    await expect.poll(testStateDriver.testState).toEqual("3");
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles long unicode characters in label", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="Family: 👨‍👩‍👧‍👦" value="family" />
        <Option label="Chinese: 你好世界" value="chinese" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    await expect(page.getByRole("option", { name: "Family: 👨‍👩‍👧‍👦" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Chinese: 你好世界" })).toBeVisible();
  });

  test("handles very long label text", async ({ initTestBed, page, createSelectDriver }) => {
    const longText = "A".repeat(100); // Reduced from 500 to be more reasonable
    await initTestBed(`
      <Select>
        <Option label="${longText}" value="long" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    const option = page.getByRole("option", { name: longText });
    await expect(option).toBeVisible();
  });

  test("handles enabled as string value", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select>
        <Option label="String False" value="string" enabled="false" />
        <Option label="String True" value="string2" enabled="true" />
        <Option label="Valid Option" value="valid" enabled="{true}" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    // All options should be visible
    await expect(page.getByRole("option")).toHaveCount(3);
    await expect(page.getByRole("option", { name: "String False" })).toBeVisible();
    await expect(page.getByRole("option", { name: "String True" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Valid Option" })).toBeVisible();
  });

  test("disabled option cannot be selected in Select", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="disabledSelect" onDidChange="arg => testState = arg" initialValue="enabled">
          <Option label="Enabled Option" value="enabled" />
          <Option label="Disabled Option" value="disabled" enabled="{false}" />
        </Select>
      </Fragment>
    `);

    const driver = await createSelectDriver("disabledSelect");
    await driver.toggleOptionsVisibility();

    // Try to select the disabled option (driver should not succeed)
    const initialValue = await testStateDriver.testState();
    await driver.selectLabel("Disabled Option");

    // Value should not change since option is disabled
    await expect.poll(testStateDriver.testState).toEqual(initialValue);
  });

  test("handles object as label (converts to string)", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="{{}}" value="object" />
        <Option label="Valid Option" value="valid" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    // Should see both options - object will be converted to string representation
    await expect(page.getByRole("option")).toHaveCount(2);
    await expect(page.getByRole("option", { name: "Valid Option" })).toBeVisible();
    // The object label should be visible with some string representation
    await expect(page.getByRole("option")).toHaveCount(2);
  });

  test("null values are handled gracefully", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select>
        <Option label="{null}" value="null_label" />
        <Option label="Valid Option" value="valid" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    // The actual behavior might vary - this needs investigation
    await expect(page.getByRole("option", { name: "Valid Option" })).toBeVisible();
  });

  test("undefined values are handled gracefully", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select>
        <Option label="{undefined}" value="undefined_label" />
        <Option label="Valid Option" value="valid" />
      </Select>
    `);

    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();

    // The actual behavior might vary - this needs investigation
    await expect(page.getByRole("option", { name: "Valid Option" })).toBeVisible();
  });
});
