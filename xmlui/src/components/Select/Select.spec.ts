import { expect, test } from "../../testing/fixtures";

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

  await expect(driver.component.locator("select")).toHaveValue("opt1");
  await driver.toggleOptionsVisibility();
  await driver.selectLabel("second");
  await expect(driver.component.locator("select")).toHaveValue("opt2");
});

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
  await expect(page.getByText("Two")).not.toBeVisible();
  await expect(page.getByText("One")).toBeVisible();
  await driver.toggleOptionsVisibility();
  await driver.selectLabel("Two");
  await expect(page.getByText("Two")).not.toBeVisible();
  await expect(page.getByText("One")).toBeVisible();

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

test('labelWidth applies with labelPosition="start"', async ({
  initTestBed,
  page,
  createSelectDriver,
}) => {
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
    createButtonDriver,
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

  test('labelPosition="start" is left in ltr language', async ({
    initTestBed,
    page,
  }) => {
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

  test('labelPosition="start" is right in rtl language', async ({
    initTestBed,
    page,
  }) => {
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
