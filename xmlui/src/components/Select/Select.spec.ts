import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  // --- Component rendering

  test("dynamic options displayed with Items component", async ({
    initTestBed,
    createSelectDriver,
    page,
  }) => {
    await initTestBed(`
      <Select>
        <Items data="{['One', 'Two', 'Three']}" >
          <Option value="{$itemIndex}" label="{$item}" />
        </Items>
      </Select>`);
    const driver = await createSelectDriver();

    await driver.click();
    await expect(page.getByRole("option", { name: "One" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Two" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Three" })).toBeVisible();
  });

  test("changing selected option in form", async ({ initTestBed, createSelectDriver }) => {
    await initTestBed(`
    <Form data="{{sel: 'opt1'}}">
      <FormItem testId="mySelect" type="select" bindTo="sel">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </FormItem>
    </Form>`);
    const driver = await createSelectDriver("mySelect");

    await expect(driver.component).toHaveText("first");
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("second");
    await expect(driver.component).toHaveText("second");
  });

  // --- initialValue prop

  test("initialValue set to first valid value", async ({ page, initTestBed }) => {
    await initTestBed(`
    <Fragment>
      <Select id="mySelect" initialValue="{0}">
        <Option value="{0}" label="Zero"/>
        <Option value="{1}" label="One"/>
        <Option value="{2}" label="Two"/>
      </Select>
      <Text testId="text">Selected value: {mySelect.value}</Text>
    </Fragment>
  `);
    await expect(page.getByTestId("text")).toHaveText("Selected value: 0");
    await expect(page.getByText("Zero", { exact: true })).toBeVisible();
    await expect(page.getByText("One", { exact: true })).not.toBeVisible();
  });

  test("initialValue set to non-existant option", async ({ page, initTestBed }) => {
    await initTestBed(`
    <Fragment>
      <Select id="mySelect" initialValue="{42}">
        <Option value="{0}" label="Zero"/>
        <Option value="{1}" label="One"/>
        <Option value="{2}" label="Two"/>
      </Select>
      <Text testId="text">Selected value: {mySelect.value}</Text>
    </Fragment>
  `);
    await expect(page.getByTestId("text")).toHaveText("Selected value: 42");
  });

  test("reset works with initialValue", async ({
    page,
    initTestBed,
    createSelectDriver,
    createButtonDriver,
  }) => {
    await initTestBed(`
    <Fragment>
      <Select id="mySelect" initialValue="{0}">
        <Option value="{0}" label="Zero"/>
        <Option value="{1}" label="One"/>
        <Option value="{2}" label="Two"/>
      </Select>
      <Button id="resetBtn" label="reset" onClick="mySelect.reset()"/>
      <Text testId="text">Selected value: {mySelect.value}</Text>
    </Fragment>
    `);
    const selectDrv = await createSelectDriver("mySelect");
    await selectDrv.toggleOptionsVisibility();
    await selectDrv.selectLabel("One");
    await expect(page.getByTestId("text")).toHaveText("Selected value: 1");
    const btnDriver = await createButtonDriver("resetBtn");
    await btnDriver.click();

    await expect(page.getByTestId("text")).toHaveText("Selected value: 0");
  });

  test("reset works with no intialValue", async ({
    page,
    initTestBed,
    createSelectDriver,
    createButtonDriver,
  }) => {
    await initTestBed(`
    <Fragment>
      <Select id="mySelect">
        <Option value="{0}" label="Zero"/>
        <Option value="{1}" label="One"/>
        <Option value="{2}" label="Two"/>
      </Select>
      <Button id="resetBtn" label="reset" onClick="mySelect.reset()"/>
      <Text testId="text">Selected value: {mySelect.value}</Text>
    </Fragment>
    `);
    const selectDrv = await createSelectDriver("mySelect");
    await selectDrv.toggleOptionsVisibility();
    await selectDrv.selectLabel("One");
    await expect(page.getByTestId("text")).toHaveText("Selected value: 1");
    const btnDriver = await createButtonDriver("resetBtn");
    await btnDriver.click();

    await expect(page.getByTestId("text")).not.toContainText("1");
  });

  // --- enabled prop

  test("disabled Select cannot be opened", async ({ page, createSelectDriver, initTestBed }) => {
    await initTestBed(`
    <Select enabled="{false}">
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
    `);
    const driver = await createSelectDriver();
    await driver.click({ force: true });
    await expect(page.getByText("One")).not.toBeVisible();
  });

  // --- readOnly prop

  test("readOnly Select shows options, but value cannot be changed", async ({
    page,
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
    <Select readOnly initialValue="1">
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
    `);
    const driver = await createSelectDriver();
    await expect(driver.component).toHaveText("One");
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("Two");
    await expect(driver.component).toHaveText("One");

    // verify dropdown is not visible but value is shown
  });

  test("readOnly multi-Select shows options, but value cannot be changed", async ({
    page,
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
    <Select readOnly initialValue="{[1, 2]}" multiSelect>
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
      <Option value="3" label="Three"/>
    </Select>
    `);
    const driver = await createSelectDriver();
    await expect(page.getByText("Three")).not.toBeVisible();
    await expect(page.getByText("One")).toBeVisible();
    await expect(page.getByText("Two")).toBeVisible();

    await driver.toggleOptionsVisibility();
    await driver.selectLabel("Three");

    await expect(page.getByText("Three")).not.toBeVisible();
    await expect(page.getByText("One")).toBeVisible();
    await expect(page.getByText("Two")).toBeVisible();
  });

  test("disabled Option cannot be selected", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
    <Select>
      <Option value="1" label="One"/>
      <Option value="2" label="Two" enabled="{false}"/>
    </Select>
    `);
    await expect(page.getByRole("option", { name: "One" })).not.toBeVisible();
    await expect(page.getByRole("option", { name: "Two" })).not.toBeVisible();
    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("Two");
    await expect(page.getByRole("option", { name: "One" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Two" })).toBeVisible();
  });

  test(
    "clicking label brings up the options",
    { tag: "@smoke" },
    async ({ initTestBed, page, createSelectDriver }) => {
      await initTestBed(`
    <Select label="Choose an option">
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
  `);
      await page.getByLabel("Choose an option").click();
      await expect(page.getByRole("option", { name: "One" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Two" })).toBeVisible();
    },
  );

  test("label displayed for selected numeric value", async ({ page, initTestBed }) => {
    await initTestBed(`
    <Fragment>
      <Select initialValue="{0}" >
        <Option value="{0}" label="Zero"/>
        <Option value="{1}" label="One"/>
        <Option value="{2}" label="Two"/>
      </Select>
    </Fragment>
  `);
    await expect(page.getByText("Zero")).toBeVisible();
  });

  // --- autoFocus prop

  test("autoFocus brings the focus to component", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
    <Select>
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
    <Select testId="focused-select" autoFocus>
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
    `);
    const driver = await createSelectDriver("focused-select");

    await expect(driver.component).toBeFocused();
  });

  // --- Templates

  test("emptyListTemplate shown when wrapped inside an App component", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
    <App>
      <Select testId="mySelect">
        <property name="emptyListTemplate">
          <Text value="Nothing to see here!" />
        </property>
      </Select>
    </App>
    `);
    const driver = await createSelectDriver("mySelect");
    await driver.click();

    await expect(page.getByText("Nothing to see here!", { exact: true })).toBeVisible();
  });

  test("optionTemplate is shown", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
    <Select>
      <Items items="{[
        { value: 'opt1', label: 'first' },
        { value: 'opt2', label: 'second' },
        { value: 'opt3', label: 'third' },
      ]}">
        <Option value="{$item.value}" label="{$item.label}">
          <Text>Template for value {$item.value}</Text>
        </Option>
      </Items>
    </Select>
    `);
    const driver = await createSelectDriver();
    await driver.click();
    await expect(page.getByText("Template for value opt1")).toBeVisible();
    await expect(page.getByText("Template for value opt2")).toBeVisible();
    await expect(page.getByText("Template for value opt3")).toBeVisible();
  });

  // --- placeholder prop

  test("placeholder is shown", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select placeholder="Please select an item">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
    await expect(page.getByText("Please select an item")).toBeVisible();
  });

  test(
    "Option without label and value is not rendered",
    { tag: "@smoke" },
    async ({ initTestBed, page, createSelectDriver }) => {
      await initTestBed(`
      <Select placeholder="Please select an item">
        <Option />
        <Option />
        <Option />
      </Select>
    `);
      const driver = await createSelectDriver();
      await driver.click();
      await expect(page.getByRole("option")).not.toBeVisible();
    },
  );

  test(
    "Option value defaults to label",
    { tag: "@smoke" },
    async ({ initTestBed, page, createSelectDriver }) => {
      await initTestBed(`
      <Fragment>
        <Select id="mySelect">
          <Option label="Zero"/>
          <Option label="One"/>
          <Option label="Two"/>
        </Select>
        <Text testId="text">Selected value: {mySelect.value}</Text>
      </Fragment>
    `);
      const driver = await createSelectDriver("mySelect");
      await driver.toggleOptionsVisibility();
      await driver.selectLabel("Zero");
      await expect(page.getByTestId("text")).toHaveText("Selected value: Zero");
    },
  );

  // --- clearable prop

  test("clear button not visible by default (clearable=false)", async ({
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select initialValue="opt1">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
      </Select>
    `);
    const driver = await createSelectDriver();

    // Clear button should not be visible (default clearable=false)
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("clear button visible when clearable=true and value selected", async ({
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select clearable="true">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
      </Select>
    `);
    const driver = await createSelectDriver();

    // Clear button should not be visible when no value selected
    await expect(driver.clearButton).not.toBeVisible();

    // Select a value
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("first");

    // Clear button should now be visible
    await expect(driver.clearButton).toBeVisible();
  });

  test("clicking clear button clears single selection", async ({
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select id="mySelect" clearable="true">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
      </Select>
    `);
    const driver = await createSelectDriver();
    const select = driver.component;

    // Select a value
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("first");
    await expect(select).toHaveText("first");

    // Click the clear button
    await driver.clearButton.click();

    // Value should be cleared
    await expect(select).not.toHaveText("first");
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("clear button works with multiSelect", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
      <Select clearable="true" multiSelect="true">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
    const driver = await createSelectDriver();

    // Select multiple values
    await driver.toggleOptionsVisibility();
    await driver.selectMultipleLabels(["first", "second"]);
    await driver.toggleOptionsVisibility();

    // Clear button should be visible
    await expect(driver.clearButton).toBeVisible();

    // Click the clear button
    await driver.clearButton.click();

    // All values should be cleared
    await expect(page.getByText("first")).not.toBeVisible();
    await expect(page.getByText("second")).not.toBeVisible();
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("clear button not visible when readOnly=true", async ({
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select clearable="true" readOnly="true" initialValue="opt1">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
      </Select>
    `);
    const driver = await createSelectDriver();

    // Clear button should not be visible even with clearable=true and value selected
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("clear button not visible when enabled=false", async ({
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select clearable="true" enabled="false" initialValue="opt1">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
      </Select>
    `);
    const driver = await createSelectDriver();

    // Clear button should not be visible when disabled
    await expect(driver.clearButton).not.toBeVisible();
  });

  test("clear button triggers didChange event", async ({
    initTestBed,
    createSelectDriver,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Select clearable="true" onDidChange="testState = 'changed'">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
      </Select>
    `);
    const driver = await createSelectDriver();

    // Select a value
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("first");

    // Reset test state
    await page.evaluate(() => ((window as any).testState = null));

    // Click the clear button
    await driver.clearButton.click();

    // Event should have fired
    await expect.poll(testStateDriver.testState).toEqual("changed");
  });
});

// =============================================================================
// LABEL POSITIONING TESTS
// =============================================================================

test.describe("Label", () => {
  test("labelBreak prop defaults to false", async ({ initTestBed, page, createSelectDriver }) => {
    await page.setViewportSize({ width: 300, height: 720 });

    await initTestBed(`
    <Select
      label="Dignissimos esse quasi esse cupiditate qui qui. Ut provident ad voluptatem tenetur sit consequuntur. Aliquam nisi fugit ut temporibus itaque ducimus rerum. Dolorem reprehenderit qui adipisci. Ullam harum atque ipsa."
      >
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
    `);
    const labelWidth = (await page.getByText("Dignissimos esse quasi").boundingBox()).width;
    const select = page.getByRole("button").or(page.getByRole("combobox")).first();
    const { width: selectWidth } = await select.boundingBox();
    expect(labelWidth).toBe(selectWidth);
  });

  test('labelWidth applies with labelPosition="start"', async ({ initTestBed, page }) => {
    await page.setViewportSize({ width: 300, height: 720 });

    await initTestBed(`
      <Select label="Dignissimos esse quasi" labelWidth="200px" labelPosition="start" >
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
        <Option value="opt4" label="fourth"/>
        <Option value="opt5" label="fifth"/>
      </Select>
    `);
    const labelWidth = (await page.getByText("Dignissimos esse quasi").boundingBox()).width;
    expect(labelWidth).toBeGreaterThanOrEqual(200);
  });
});

// =============================================================================
// SEARCHABLE SELECT TESTS
// =============================================================================

test.describe("searchable select", () => {
  test("placeholder is shown", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select searchable placeholder="Please select an item">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
    await expect(page.getByText("Please select an item")).toBeVisible();
  });

  test("inProgressNotificationMessage shown when inProgress is true", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select searchable inProgress inProgressNotificationMessage="in-progress-msg">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
    const driver = await createSelectDriver();
    await driver.click();
    await expect(page.getByText("in-progress-msg")).toBeVisible();
  });

  test("inProgressNotificationMessage not shown when inProgress is false", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select searchable inProgress="false" inProgressNotificationMessage="in-progress-msg">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
    const driver = await createSelectDriver();
    await driver.click();
    await expect(page.getByText("in-progress-msg")).not.toBeVisible();
  });

  test(
    "search filters option labels",
    { tag: "@smoke" },
    async ({ initTestBed, page, createSelectDriver }) => {
      await initTestBed(`
      <Select searchable>
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
      const driver = await createSelectDriver();
      await driver.toggleOptionsVisibility();
      await driver.searchFor("econd");
      const options = await page.getByRole("option").all();
      expect(options).toHaveLength(1);
      await expect(options[0]).toHaveText("second");
    },
  );
});

// =============================================================================
// MULTISELECT TESTS
// =============================================================================

test.describe("multiSelect", () => {
  test("initialValue='{[0]}' works", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Select id="mySelect" initialValue="{[0]}" multiSelect>
          <Option value="{0}" label="Zero"/>
          <Option value="{1}" label="One"/>
          <Option value="{2}" label="Two"/>
        </Select>
        <Text testId="text">Selected value: {mySelect.value}</Text>
      </Fragment>
    `);

    await expect(page.getByTestId("text")).toHaveText("Selected value: 0");
  });

  test("initialValue='{[0,1]}' works", { tag: "@smoke" }, async ({ page, initTestBed }) => {
    await initTestBed(`
      <Fragment>
        <Select id="mySelect" initialValue="{[0,1]}" multiSelect>
          <Option value="{0}" label="Zero"/>
          <Option value="{1}" label="One"/>
          <Option value="{2}" label="Two"/>
        </Select>
        <Text testId="text">Selected value: {mySelect.value}</Text>
      </Fragment>
    `);

    await expect(page.getByTestId("text")).toHaveText("Selected value: 0,1");
  });

  test("select multiple items without closing listbox", async ({
    page,
    initTestBed,
    createSelectDriver,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <Select id="mySelect" multiSelect>
          <Option value="{0}" label="Zero"/>
          <Option value="{1}" label="One"/>
          <Option value="{2}" label="Two"/>
        </Select>
        <Text testId="text">Selected value: {mySelect.value}</Text>
      </Fragment>
    `);
    const selectDrv = await createSelectDriver("mySelect");
    await selectDrv.toggleOptionsVisibility();
    await selectDrv.selectMultipleLabels(["Zero", "One"]);

    /* problem is that the listbox closes after the 1st selection is made */
    await expect(page.getByTestId("text")).toHaveText("Selected value: 0,1");
  });

  test(
    "clicking label brings up the options",
    { tag: "@smoke" },
    async ({ initTestBed, page, createSelectDriver }) => {
      await initTestBed(`
      <Select label="Choose an option" multiSelect>
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
      await page.getByLabel("Choose an option").click();
      await expect(page.getByRole("option", { name: "One" })).toBeVisible();
      await expect(page.getByRole("option", { name: "Two" })).toBeVisible();
    },
  );

  test("labelBreak prop defaults to false", async ({ initTestBed, page, createSelectDriver }) => {
    await page.setViewportSize({ width: 300, height: 720 });

    await initTestBed(`
      <Select
        label="Dignissimos esse quasi esse cupiditate qui qui. Ut provident ad voluptatem tenetur sit consequuntur. Aliquam nisi fugit ut temporibus itaque ducimus rerum. Dolorem reprehenderit qui adipisci. Ullam harum atque ipsa."
        multiSelect>
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
    const labelWidth = (await page.getByText("Dignissimos esse quasi").boundingBox()).width;
    const select = page.getByRole("button").or(page.getByRole("combobox")).first();
    const { width: selectWidth } = await select.boundingBox();
    expect(labelWidth).toBe(selectWidth);
  });

  test('labelPosition="start" is left in ltr language', async ({ initTestBed, page }) => {
    await initTestBed(`
      <Select multiSelect label="hi there" labelPosition="start" labelBreak="false">
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
      `);
    const { x: labelX } = await page.getByText("hi there").boundingBox();
    const select = page.getByRole("button").or(page.getByRole("combobox")).first();
    const { x: selectX } = await select.boundingBox();
    expect(labelX).toBeLessThan(selectX);
  });

  test('labelPosition="start" is right in rtl language', async ({ initTestBed, page }) => {
    await initTestBed(`
      <VStack direction="rtl">
        <Select multiSelect label="hi there" labelPosition="start" labelBreak="false">
          <Option value="1" label="One" />
          <Option value="2" label="Two" />
        </Select>
      </VStack>
    `);
    const { x: labelX } = await page.getByText("hi there").boundingBox();
    const select = page.getByRole("button").or(page.getByRole("combobox")).first();
    const { x: selectX } = await select.boundingBox();
    expect(labelX).toBeGreaterThan(selectX);
  });

  test("multiSelect autoFocus brings the focus to component", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select multiSelect>
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
      <Select testId="focused-select" multmultiSelect autoFocus>
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
    const driver = await createSelectDriver("focused-select");

    await expect(driver.component).toBeFocused();
  });

  test("autoFocus brings the focus to component", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Select initialValue="opt1" placeholder="Select..." multiSelect>
          <property name="valueTemplate">
              <HStack>
              <Text>{$item.value}={$item.label}</Text>
              <Button
                  variant="ghost"
                  icon="close"
                  size="xs"
                  testId="remove-item-btn"
                  onClick="$itemContext.removeItem()"/>
              </HStack>
          </property>
          <Option value="opt1" label="first"/>
          <Option value="opt2" label="second"/>
          <Option value="opt3" label="third"/>
      </Select>
    `);
    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    await driver.selectLabel("first");

    await expect(page.getByText("opt1=first", { exact: true })).toBeVisible();
    await page.getByTestId("remove-item-btn").click();
    await expect(page.getByText("opt1=first", { exact: true })).not.toBeVisible();
  });
});

// =============================================================================
// SEARCHABLE MULTISELECT TESTS
// =============================================================================

test.describe("searchable multiselect", { tag: "@smoke" }, () => {
  test("searching for and selecting 2 items works", async ({
    page,
    initTestBed,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <Select id="mySelect" testId="mySelect" multiSelect searchable>
          <Option value="{0}" label="Zero"/>
          <Option value="{1}" label="One"/>
          <Option value="{2}" label="Two"/>
        </Select>
        <Text testId="text">Selected value: {mySelect.value}</Text>
      </Fragment>
    `);
    const driver = await createSelectDriver("mySelect");
    await driver.toggleOptionsVisibility();
    await driver.selectFirstLabelPostSearh("One");
    await driver.selectFirstLabelPostSearh("Two");

    await expect(page.getByTestId("text")).toHaveText("Selected value: 1,2");
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("gotFocus event fires on focus", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Select onGotFocus="testState = 'focused'">
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
    const selectButton = page.getByRole("combobox");
    await selectButton.focus();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });

  test("gotFocus event fires on label click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Select label="Choose" onGotFocus="testState = 'focused'">
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
    await page.getByText("Choose").click();
    await expect.poll(testStateDriver.testState).toBe("focused");
  });

  test("lostFocus event fires on blur", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Select onLostFocus="testState = 'blurred'">
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
    const selectButton = page.getByRole("combobox");
    await selectButton.focus();
    await selectButton.blur();
    await expect.poll(testStateDriver.testState).toBe("blurred");
  });
});

// =============================================================================
// FORM INTEGRATION TESTS
// =============================================================================

//this is an upstream issue: https://github.com/radix-ui/primitives/issues/3135
test("initialValue honored when used within Form", async ({ initTestBed, page }) => {
  await initTestBed(`
    <Form>
      <Select id="mySelect" initialValue="opt3">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
      <Text testId="text">Selected value: {mySelect.value}</Text>
    </Form>`);

  await expect(page.getByTestId("text")).toHaveText("Selected value: opt3");
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual State", () => {
  test("input has correct width in px", async ({ page, initTestBed }) => {
    await initTestBed(`<Select width="200px" testId="test"/>`, {});

    const input = page.getByTestId("test");
    const { width } = await input.boundingBox();
    expect(width).toBe(200);
  });

  test("input with label has correct width in px", async ({ page, initTestBed }) => {
    await initTestBed(`<Select width="200px" label="test" testId="test"/>`, {});

    const input = page.getByTestId("test");
    const { width } = await input.boundingBox();
    expect(width).toBe(200);
  });

  test("input has correct width in %", async ({ page, initTestBed }) => {
    await page.setViewportSize({ width: 400, height: 300 });
    await initTestBed(`<Select width="50%" testId="test"/>`, {});

    const input = page.getByTestId("test");
    const { width } = await input.boundingBox();
    expect(width).toBe(200);
  });

  test("input with label has correct width in %", async ({ page, initTestBed }) => {
    await page.setViewportSize({ width: 400, height: 300 });
    await initTestBed(`<Select width="50%" label="test" testId="test"/>`, {});

    const input = page.getByTestId("test");
    const { width } = await input.boundingBox();
    expect(width).toBe(200);
  });
});

// =============================================================================
// Z-INDEX AND MODAL LAYERING TESTS
// =============================================================================

test.describe("Z-Index and Modal Layering", () => {
  test("Select dropdown in modal is visible and not covered by modal overlay", async ({
    initTestBed,
    page,
    createSelectDriver,
  }) => {
    await initTestBed(`
      <Fragment>
        <Select testId="select">
          <Option value="stuff1">option 1</Option>
          <Option value="stuff2">option 2</Option>
          <Button onClick="modal.open()">BLOW UP</Button>
        </Select>
        <ModalDialog id="modal" title="Example Dialog">
          <Form data="{{ firstName: 'Billy', lastName: 'Bob' }}">
            <FormItem bindTo="firstName" required="true" />
            <FormItem bindTo="lastName" required="true" />
            <FormItem
              label="Field to Update"
              type="select"
              width="200px"
              bindTo="fieldToUpdate"
              required
              initialValue="rate"
              testId="modal-select"
            >
              <Option value="rate">Price</Option>
              <Option value="description">Item Description</Option>
              <Option value="account_id">Account</Option>
            </FormItem>
          </Form>
        </ModalDialog>
      </Fragment>
    `);

    const selectDriver = await createSelectDriver("select");
    await selectDriver.click();

    // Click button to open modal
    const blowUpButton = page.getByText("BLOW UP");
    await blowUpButton.click();

    // Wait for modal to be visible
    await expect(page.getByRole("dialog", { name: "Example Dialog" })).toBeVisible();

    // Open the select in the modal
    const modalSelectDriver = await createSelectDriver("modal-select");
    await modalSelectDriver.click();

    // Check that all options are visible
    await expect(page.getByRole("option", { name: "Price" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Item Description" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Account" })).toBeVisible();
  });
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
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderRadius-Select${variant.value}`]: "12px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-radius", "12px");
    });

    test(`applies correct borderColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-Select${variant.value}`]: "rgb(255, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(255, 0, 0)");
    });

    test(`applies correct borderWidth ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderWidth-Select${variant.value}`]: "1px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-width", "1px");
    });

    test(`applies correct borderStyle ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderStyle-Select${variant.value}`]: "dashed" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("border-style", "dashed");
    });

    test(`applies correct fontSize ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`fontSize-Select${variant.value}`]: "14px" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("font-size", "14px");
    });

    test(`applies correct backgroundColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-Select${variant.value}`]: "rgb(240, 240, 240)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    });

    test(`applies correct boxShadow ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-Select${variant.value}`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-Select${variant.value}`]: "rgb(0, 0, 0)" },
      });
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });

    test(`applies correct borderColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`borderColor-Select${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("border-color", "rgb(0, 0, 0)");
    });

    test(`applies correct backgroundColor on hover ${variant.value}`, async ({
      initTestBed,
      page,
    }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`backgroundColor-Select${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    });

    test(`applies correct boxShadow on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: {
          [`boxShadow-Select${variant.value}--hover`]: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS(
        "box-shadow",
        "rgba(0, 0, 0, 0.1) 0px 2px 8px 0px",
      );
    });

    test(`applies correct textColor on hover ${variant.value}`, async ({ initTestBed, page }) => {
      await initTestBed(`<Select testId="test" ${variant.prop} />`, {
        testThemeVars: { [`textColor-Select${variant.value}--hover`]: "rgb(0, 0, 0)" },
      });
      await page.getByTestId("test").hover();
      await expect(page.getByTestId("test")).toHaveCSS("color", "rgb(0, 0, 0)");
    });
  });
});

// =============================================================================
// BEHAVIORS AND PARTS TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" tooltip="Tooltip text"><Option value="1" label="Test" /></Select>`,
    );

    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");

    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" tooltipMarkdown="**Bold text**"><Option value="1" label="Test" /></Select>`,
    );

    const component = page.getByTestId("test");
    await component.hover();
    const tooltip = page.getByRole("tooltip");

    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" variant="CustomVariant"><Option value="1" label="Test" /></Select>`,
      {
        testThemeVars: {
          "borderColor-Select-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" variant="CustomVariant"><Option value="1" label="Test" /></Select>`,
      {
        testThemeVars: {
          "backgroundColor-Select-CustomVariant": "rgb(0, 255, 0)",
        },
      },
    );
    const component = page.getByTestId("test");
    await expect(component).toHaveCSS("background-color", "rgb(0, 255, 0)");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" animation="fadeIn"><Option value="1" label="Test" /></Select>`,
    );

    const component = page.getByTestId("test");
    await expect(component).toBeVisible();
  });

  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" tooltip="Tooltip text" animation="fadeIn"><Option value="1" label="Test" /></Select>`,
    );

    const component = page.getByTestId("test");
    await expect(component).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("can select part: 'listWrapper'", async ({ page, initTestBed }) => {
    await initTestBed(`<Select testId="test"><Option value="1" label="Test" /></Select>`);
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    await expect(listWrapper).toBeVisible();
  });

  test("can select part: 'clearButton'", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" clearable="true" initialValue="1"><Option value="1" label="Test" /></Select>`,
    );
    const clearButton = page.locator("[data-part-id='clearButton']");
    await expect(clearButton).toBeVisible();
  });

  test("clearButton part is not present without clearable", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" clearable="false"><Option value="1" label="Test" /></Select>`,
    );
    const clearButton = page.locator("[data-part-id='clearButton']");
    await expect(clearButton).not.toBeVisible();
  });

  test("parts are present when tooltip is added", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" tooltip="Tooltip text" clearable="true" initialValue="1"><Option value="1" label="Test" /></Select>`,
    );

    const component = page.getByTestId("test");
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    const clearButton = page.locator("[data-part-id='clearButton']");

    await expect(listWrapper).toBeVisible();
    await expect(clearButton).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(
      `<Select testId="test" variant="CustomVariant"><Option value="1" label="Test" /></Select>`,
      {
        testThemeVars: {
          "borderColor-Select-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );

    const component = page.getByTestId("test");
    const listWrapper = page.locator("[data-part-id='listWrapper']");

    await expect(component).toHaveCSS("border-color", "rgb(255, 0, 0)");
    await expect(listWrapper).toBeVisible();
  });

  test.fixme("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <Select 
        testId="test" 
        variant="CustomVariant"
        animation="fadeIn"
        clearable="true"
        initialValue="1"
        tooltip="Tooltip text"
      >
        <Option value="1" label="Test" />
      </Select>
    `,
      {
        testThemeVars: {
          "backgroundColor-Select-CustomVariant": "rgb(255, 0, 0)",
        },
      },
    );

    const component = page.getByTestId("test");
    const listWrapper = page.locator("[data-part-id='listWrapper']");
    const clearButton = page.locator("[data-part-id='clearButton']");

    // Verify variant applied
    await expect(component).toHaveCSS("background-color", "rgb(255, 0, 0)");

    // Verify parts are visible
    await expect(listWrapper).toBeVisible();
    await expect(clearButton).toBeVisible();

    await component.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });
});
