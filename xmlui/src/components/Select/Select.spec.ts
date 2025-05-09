import { initComponent } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";
import { initApp } from "../../testing/themed-app-test-helpers";

test("options with number type keeps number type - outside of forms", async ({
  initTestBed,
  createSelectDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<Select onDidChange="(value) => { testState = value; }">
      <Option value="{1}" label="One"/>
      <Option value="{2}" label="Two"/>
     </Select>`,
  );
  const driver = await createSelectDriver();

  await driver.selectLabel("One");
  await expect(driver.component.getByText("One")).toBeVisible();
  await expect(driver.component.getByText("Two")).not.toBeVisible();
  await expect.poll(testStateDriver.testState).toStrictEqual(1);
});

test("changing selected option in form", async ({ initTestBed, createSelectDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <Form data="{{sel: 'opt1'}}">
      <FormItem testId="mySelect" type="select" bindTo="sel">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </FormItem>
    </Form>`);
  const driver = await createSelectDriver("mySelect");

  await expect(driver.component.locator("select")).toHaveValue("opt1");
  await driver.selectLabel("second");
  await expect(driver.component.locator("select")).toHaveValue("opt2");
});

test("initialValue='{0}' works", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(`
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
});

test("reset works with initialValue", async ({ page, initTestBed, createSelectDriver, createButtonDriver }) => {
  const { testStateDriver } = await initTestBed(`
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
  const { testStateDriver } = await initTestBed(`
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
  await selectDrv.selectLabel("One");
  await expect(page.getByTestId("text")).toHaveText("Selected value: 1");
  const btnDriver = await createButtonDriver("resetBtn");
  await btnDriver.click();

  await expect(page.getByTestId("text")).not.toContainText("1");
});

test("disabled Select cannot be opened", async ({page, createSelectDriver, initTestBed}) => {
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
  await driver.selectLabel("Three");
  await expect(page.getByText("Three")).not.toBeVisible();
  await expect(page.getByText("One")).toBeVisible();
  await expect(page.getByText("Two")).toBeVisible();

  // verify dropdown is not visible but value is shown
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
  await driver.selectLabel("Two");
  await expect(page.getByRole("option", { name: "One" })).toBeVisible();
  await expect(page.getByRole("option", { name: "Two" })).toBeVisible();
});

test("clicking label brings up the options", async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`
    <Select label="Choose an option">
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
  `);
  await page.getByLabel("Choose an option").click();
  await expect(page.getByRole("option", {name: "One"})).toBeVisible();
  await expect(page.getByRole("option", {name: "Two"})).toBeVisible();
});

test("autoFocus brings the focus to component", async ({ initTestBed, page, createSelectDriver }) => {
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

test("emptyListTemplate shown when wrapped inside an App component", async ({ initTestBed, page, createSelectDriver }) => {
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

  await expect(page.getByText("Nothing to see here!", {exact: true})).toBeVisible();
});

test.skip("prop inProgressNotificationMessage ... what is this and why do we need it?", async ({ initTestBed, page, createSelectDriver }) => {
  const propMakesSenseAndDoesSomethingDetectable = false;
  expect(propMakesSenseAndDoesSomethingDetectable).toBeTruthy();
});

test.skip("prop inProgress ... what is this and why do we need it?", async ({ initTestBed, page, createSelectDriver }) => {
  const propMakesSenseAndDoesSomethingDetectable = false;
  expect(propMakesSenseAndDoesSomethingDetectable).toBeTruthy();
});

test('optionTemplate is shown', async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`
    <Select>
      <property name="optionTemplate">
        <Text>value={$item.value} label={$item.label}</Text>
      </property>
      <Option value="opt1" label="first"/>
    </Select>
  `);
  const driver = await createSelectDriver();
  await driver.click();
  await expect(page.getByRole("option", { name: "value=opt1 label=first" })).toBeVisible();
});

test.skip('optionLabelTemplate and optionTemplate do the same thing, so only one should be present', async ({ initTestBed, page, createSelectDriver }) => {
  const removedOneOfThePropFromXmlui = false;
  expect(removedOneOfThePropFromXmlui).toBeTruthy();
});

test('labelBreak prop defaults to false', async ({ initTestBed, page, createSelectDriver }) => {
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
  expect(labelWidth).toBeGreaterThan(selectWidth);
});

test('placeholder is shown', async ({ initTestBed, page, createSelectDriver }) => {
  await initTestBed(`
    <Select placeholder="Please select an item">
      <Option value="opt1" label="first"/>
      <Option value="opt2" label="second"/>
      <Option value="opt3" label="third"/>
    </Select>
  `);
  await expect(page.getByText("Please select an item")).toBeVisible();
});

test.describe("searchable select", () => {
  test('placeholder is shown', async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select searchable placeholder="Please select an item">
        <Option value="opt1" label="first"/>
        <Option value="opt2" label="second"/>
        <Option value="opt3" label="third"/>
      </Select>
    `);
    await expect(page.getByPlaceholder("Please select an item")).toBeVisible();
  });
});

test('labelWidth applies with labelPosition="start"', async ({ initTestBed, page, createSelectDriver }) => {
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

  test("initialValue='{[0,1]}' works", async ({ page, initTestBed }) => {
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

  test("select multiple items without closing listbox", async ({ page, initTestBed, createSelectDriver, createButtonDriver }) => {
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
    await selectDrv.selectMultipleLabels(["Zero", "One"]);

    /* problem is that the listbox closes after the 1st selection is made */
    await expect(page.getByTestId("text")).toHaveText("Selected value: 0,1");
  });

  test("clicking label brings up the options", async ({ initTestBed, page, createSelectDriver }) => {
    await initTestBed(`
      <Select label="Choose an option" multiSelect>
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
    `);
    await page.getByLabel("Choose an option").click();
    await expect(page.getByRole("option", {name: "One"})).toBeVisible();
    await expect(page.getByRole("option", {name: "Two"})).toBeVisible();
  });

  test('labelBreak prop defaults to false', async ({ initTestBed, page, createSelectDriver }) => {
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
    expect(labelWidth).toBeGreaterThan(selectWidth);
  });

  test('labelPosition="start" is left in ltr language', async ({ initTestBed, browser, createSelectDriver, page}) => {
    await initTestBed(`
      <Select multiSelect label="hi there" labelPosition="start" labelBreak="false">
        <Option value="1" label="One"/>
        <Option value="2" label="Two"/>
      </Select>
      `)
    const { x: labelX } = await page.getByText("hi there").boundingBox()
    const select = page.getByRole("button").or(page.getByRole("combobox")).first();
    const { x: selectX } = await select.boundingBox();
    expect(labelX).toBeLessThan(selectX);
  });

  test.skip('labelPosition="start" is right to select in rtl language', async ({ browser }) => {

    const rightToLeftLanguage = 'ar';
    const context = await browser.newContext({
      locale: rightToLeftLanguage
    });
    const page = await context.newPage();
    await initComponent(page, {
      entryPoint: `
          <Select multiSelect label="hi there" labelPosition="start" labelBreak="false">
            <Option value="1" label="One"/>
            <Option value="2" label="Two"/>
          </Select>
        `})
    const { x: labelX } = await page.getByText("hi there").boundingBox()
    const select = page.getByRole("button").or(page.getByRole("combobox")).first();
    const { x: selectX } = await select.boundingBox();
    expect(labelX).toBeGreaterThan(selectX);
    const checkedBrowserIsActuallyRTL_inThisTestCase = false;
    expect(checkedBrowserIsActuallyRTL_inThisTestCase).toBeTruthy();
  });

  test("autoFocus brings the focus to component", async ({ initTestBed, page, createSelectDriver }) => {
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
});
