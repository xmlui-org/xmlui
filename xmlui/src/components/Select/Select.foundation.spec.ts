import { test, expect } from "../../testing/fixtures";

test.describe("Select foundation", () => {
  test("renders options and honors initialValue", async ({ initTestBed, createSelectDriver }) => {
    await initTestBed(`
      <Select initialValue="2">
        <Option value="1" label="One" />
        <Option value="2" label="Two" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await expect(driver.component).toBeVisible();
    await expect(driver.component.locator("option")).toHaveCount(2);
    expect(await driver.value()).toBe("2");
  });

  test("didChange fires when selection changes", async ({ initTestBed, createSelectDriver }) => {
    const { testStateDriver } = await initTestBed(`
      <Select onDidChange="value => testState = value">
        <Option value="a" label="Alpha" />
        <Option value="b" label="Beta" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await driver.selectOption("b");
    await expect.poll(testStateDriver.testState).toBe("b");
  });

  test("renders options from data", async ({ initTestBed, createSelectDriver }) => {
    await initTestBed(`
      <App var.items="{[
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' }
      ]}">
        <Select data="{items}" valueField="id" labelField="name" initialValue="b" />
      </App>
    `);
    const driver = await createSelectDriver();
    await expect(driver.component.locator("option")).toHaveText(["Alpha", "Beta"]);
    expect(await driver.value()).toBe("b");
  });
});
