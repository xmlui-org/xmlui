import { expect, test } from "@testing/fixtures";

test("options with number type keeps number type - outside of forms", async ({ initTestBed, createSelectDriver }) => {
  const { testStateDriver } = await initTestBed(
    `<Select onDidChange="(value) => testState = value">
      <Option value="{1}" label="One"/>
      <Option value="{2}" label="Two"/>
     </Select>`,
  );
  const driver = await createSelectDriver();

  await driver.selectOption("One");
  await expect.poll(testStateDriver.testState).toStrictEqual(1);
});

test("options with number type keeps number type - inside a form", async ({ initTestBed, createSelectDriver }) => {
  const { testStateDriver } = await initTestBed(`
    <Select onDidChange="(value) => testState = value">
      <Option value="{1}" label="One"/>
      <Option value="{2}" label="Two"/>
    </Select>`
  );
  const driver = await createSelectDriver();

  await driver.selectOption("One");
  await expect.poll(testStateDriver.testState).toStrictEqual(1);
});
