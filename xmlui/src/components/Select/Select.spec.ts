import { expect, test } from "../../testing/fixtures";

test("options with number type keeps number type - outside of forms", async ({
  initTestBed,
  createSelectDriver,
}) => {
  const { testStateDriver } = await initTestBed(
    `<Select onDidChange="(value) => {console.log('bla'); testState = value; }">
      <Option value="{1}" label="One"/>
      <Option value="{2}" label="Two"/>
     </Select>`,
  );
  const driver = await createSelectDriver();

  await driver.selectOption("One");
  await expect.poll(testStateDriver.testState).toStrictEqual(1);
});

test("options with number type keeps number type - inside a form", async ({
  initTestBed,
  createSelectDriver,
}) => {
  const { testStateDriver } = await initTestBed(`
    <Select onDidChange="(value) => testState = value">
      <Option value="{1}" label="One"/>
      <Option value="{2}" label="Two"/>
    </Select>`);
  const driver = await createSelectDriver();

  await driver.selectOption("One");
  await expect.poll(testStateDriver.testState).toStrictEqual(1);
});

test("select initialValue='{0}' works", async ({ page, initTestBed }) => {
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
  await selectDrv.selectOption("One");
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
  await selectDrv.selectOption("One");
  const btnDriver = await createButtonDriver("resetBtn");
  await btnDriver.click();

  await expect(page.getByTestId("text")).toHaveText("Selected value:");
});
