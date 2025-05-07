import { expect, test } from "../../testing/fixtures";

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

test("changing selected option in form", async ({
                                                  initTestBed,
                                                  createSelectDriver,
                                                }) => {
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

test("multi-select initialValue='{[0]}' works", async ({ page, initTestBed }) => {
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

test("multi-select initialValue='{[0,1]}' works", async ({ page, initTestBed }) => {
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

test("reset works with no intialValue", async ({ page, initTestBed, createSelectDriver, createButtonDriver }) => {
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

test("disabled Select cannot be opened", async ({page, createSelectDriver, initTestBed}) => {
  await initTestBed(`
    <Select enabled="{false}">
      <Option value="1" label="One"/>
      <Option value="2" label="Two"/>
    </Select>
  `);
  const driver = await createSelectDriver();
  await driver.click({force: true});
  await expect(page.getByText("One")).not.toBeVisible();
});

test("readOnly Select shows options, but value cannot be changed", async ({ page, initTestBed, createSelectDriver }) => {
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

test.fixme(
  "clicking label brings up the options",
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
