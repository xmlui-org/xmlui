import { expect, test } from "../../testing/fixtures";

test("renders with default props", async ({ initTestBed, createAutoCompleteDriver }) => {
  await initTestBed(`
    <AutoComplete />
  `);

  const driver = await createAutoCompleteDriver();

  await expect(driver.component).toBeVisible();
});


test("displays placeholder text", async ({ initTestBed, page }) => {
  const placeholder = "Search for an option";
  await initTestBed(`
    <AutoComplete placeholder="${placeholder}" />
  `);

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

test.fixme("opens dropdown when clicked", async ({ initTestBed, page, createAutoCompleteDriver }) => {
  await initTestBed(`
    <AutoComplete>
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  await expect(page.getByRole("listbox")).toBeVisible();
});


test("selects an option when clicked", async ({ initTestBed, page }) => {
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

  await page.locator(".command").click();
  await page.getByText("Diana Prince").click();

  await expect(page.getByTestId("text")).toHaveText("Selected value: 3");
  await expect(page.getByText("Diana Prince")).toBeVisible();
});

/*
test("disabled option cannot be selected", async ({ initTestBed, page }) => {
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

  await page.locator(".command").click();

  // Clark Kent should be disabled
  const disabledOption = page.getByText("Clark Kent");
  await expect(disabledOption).toHaveClass(/disabled/);

  // Try to click the disabled option
  await disabledOption.click({ force: true });

  // Value should not change to the disabled option
  await expect(page.getByTestId("text")).not.toHaveText("Selected value: 2");
});

test("multi mode allows selecting multiple options", async ({ initTestBed, page }) => {
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

  await page.locator(".command").click();
  await page.getByText("Bruce Wayne").click();

  // First option should be selected
  await expect(page.getByTestId("text")).toHaveText("Selected values: 1");

  // Click another option
  await page.locator(".command").click();
  await page.getByText("Diana Prince").click();

  // Both options should be selected
  await expect(page.getByTestId("text")).toHaveText("Selected values: 1,3");

  // Both selected options should be visible as badges
  await expect(page.getByText("Bruce Wayne")).toBeVisible();
  await expect(page.getByText("Diana Prince")).toBeVisible();
});

test("searching filters options", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete>
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
      <Option value="4" label="Barry Allen" />
      <Option value="5" label="Hal Jordan" />
    </AutoComplete>
  `);

  await page.locator(".command").click();

  // Type in the search field
  await page.keyboard.type("Bruce");

  // Only Bruce Wayne should be visible
  await expect(page.getByText("Bruce Wayne")).toBeVisible();
  await expect(page.getByText("Clark Kent")).not.toBeVisible();
  await expect(page.getByText("Diana Prince")).not.toBeVisible();
});

test("emptyListTemplate is shown when no options match", async ({ initTestBed, page }) => {
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

  await page.locator(".command").click();

  // Type something that doesn't match any option
  await page.keyboard.type("Joker");

  // Empty list template should be shown
  await expect(page.getByText("No options found")).toBeVisible();
});

test("optionTemplate customizes option appearance", async ({ initTestBed, page }) => {
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

  await page.locator(".command").click();

  // Options should be visible with custom styling
  const options = page.getByText("Bruce Wayne");
  await expect(options).toBeVisible();

  // Check for center alignment (this is approximate since we can't directly check CSS in this test)
  const optionElement = page.locator(".autoCompleteOption").first();
  await expect(optionElement).toBeVisible();
});

test("readOnly prevents changing selection", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete readOnly="true" initialValue="1">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  // Initial value should be displayed
  await expect(page.getByText("Bruce Wayne")).toBeVisible();

  // Try to click to open dropdown
  await page.locator(".command").click();

  // Dropdown should not open
  await expect(page.locator(".popoverContent")).not.toBeVisible();
});

test("disabled state prevents interaction", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete enabled="false">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  // Component should have disabled class
  await expect(page.locator(".command")).toHaveClass(/disabled/);

  // Try to click to open dropdown
  await page.locator(".command").click({ force: true });

  // Dropdown should not open
  await expect(page.locator(".popoverContent")).not.toBeVisible();
});

test("validation states apply correct styling", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <AutoComplete testId="valid" validationStatus="valid">
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
      <AutoComplete testId="warning" validationStatus="warning">
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
      <AutoComplete testId="error" validationStatus="error">
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
    </App>
  `);

  await expect(page.getByTestId("valid")).toHaveClass(/valid/);
  await expect(page.getByTestId("warning")).toHaveClass(/warning/);
  await expect(page.getByTestId("error")).toHaveClass(/error/);
});

test("didChange event fires when option is selected", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.selectedValue="">
      <AutoComplete onDidChange="(val) => selectedValue = val">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
        <Option value="3" label="Diana Prince" />
      </AutoComplete>
      <Text testId="text">{selectedValue}</Text>
    </App>
  `);

  await page.locator(".command").click();
  await page.getByText("Diana Prince").click();

  await expect(page.getByTestId("text")).toHaveText("3");
});

test("gotFocus and lostFocus events work correctly", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App var.isFocused="false">
      <Text testId="focusText">{isFocused === true ? 'AutoComplete focused' : 'AutoComplete lost focus'}</Text>
      <AutoComplete
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
  await page.locator(".command").focus();
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
  await expect(page.getByText("Clark Kent")).toBeVisible();
});

test("focus API brings focus to the component", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App>
      <AutoComplete id="autoComplete">
        <Option value="1" label="Bruce Wayne" />
      </AutoComplete>
      <Button
        testId="focusButton"
        label="Focus AutoComplete"
        onClick="autoComplete.focus()" />
    </App>
  `);

  // Focus the autocomplete using the API
  await page.getByTestId("focusButton").click();

  // Check if the autocomplete is focused
  const isFocused = await page.locator("input").first().evaluate(el => document.activeElement === el);
  expect(isFocused).toBeTruthy();
});

test("autoFocus brings focus to the component on load", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete autoFocus="true">
      <Option value="1" label="Bruce Wayne" />
    </AutoComplete>
  `);

  // Check if the autocomplete is focused
  const isFocused = await page.locator("input").first().evaluate(el => document.activeElement === el);
  expect(isFocused).toBeTruthy();
});

test("dropdownHeight sets the height of the dropdown", async ({ initTestBed, page }) => {
  const dropdownHeight = "200px";
  await initTestBed(`
    <AutoComplete dropdownHeight="${dropdownHeight}">
      <Option value="1" label="Bruce Wayne" />
      <Option value="2" label="Clark Kent" />
      <Option value="3" label="Diana Prince" />
    </AutoComplete>
  `);

  await page.locator(".command").click();

  // Check if the dropdown has the specified height
  const dropdown = page.locator(".popoverContent");
  const style = await dropdown.getAttribute("style");
  expect(style).toContain(`height: ${dropdownHeight}`);
});

test("label is displayed correctly", async ({ initTestBed, page }) => {
  const label = "Select a superhero";
  await initTestBed(`
    <AutoComplete label="${label}">
      <Option value="1" label="Bruce Wayne" />
    </AutoComplete>
  `);

  await expect(page.getByText(label)).toBeVisible();
});

test("labelPosition changes label placement", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete label="Select a superhero" labelPosition="start" labelBreak="false">
      <Option value="1" label="Bruce Wayne" />
    </AutoComplete>
  `);

  // Check that the label is positioned to the left of the input
  const labelElement = page.getByText("Select a superhero");
  const inputElement = page.locator(".command");

  const labelBox = await labelElement.boundingBox();
  const inputBox = await inputElement.boundingBox();

  // In left-to-right layout, label should be to the left of the input
  expect(labelBox.x).toBeLessThan(inputBox.x);
});

test("required adds required indicator", async ({ initTestBed, page }) => {
  await initTestBed(`
    <AutoComplete label="Select a superhero" required="true">
      <Option value="1" label="Bruce Wayne" />
    </AutoComplete>
  `);

  // Required indicator should be visible
  await expect(page.locator(".required")).toBeVisible();
});

test("creates new option when typing non-existing value", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Fragment>
      <AutoComplete id="autoComplete">
        <Option value="1" label="Bruce Wayne" />
        <Option value="2" label="Clark Kent" />
      </AutoComplete>
      <Text testId="text">Selected value: {autoComplete.value}</Text>
    </Fragment>
  `);

  await page.locator(".command").click();

  // Type a new option
  await page.keyboard.type("Peter Parker");

  // The "Create" option should appear
  await expect(page.getByText('Create "Peter Parker"')).toBeVisible();

  // Click the create option
  await page.getByText('Create "Peter Parker"').click();

  // The new option should be selected
  await expect(page.getByTestId("text")).toHaveText("Selected value: Peter Parker");
  await expect(page.getByText("Peter Parker")).toBeVisible();
});
*/
