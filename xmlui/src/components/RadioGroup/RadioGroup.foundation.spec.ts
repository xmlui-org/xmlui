import { test, expect } from "../../testing/fixtures";

test.describe("RadioGroup foundation", () => {
  test("renders Option children as radios", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option value="1">Option 1</Option>
        <Option value="2">Option 2</Option>
        <Option value="3">Option 3</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options).toHaveCount(3);
    await expect(page.getByRole("radiogroup").locator("label")).toHaveText([
      "Option 1",
      "Option 2",
      "Option 3",
    ]);
  });

  test("initialValue uses strict value matching", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup initialValue="{2}">
        <Option value="1">Option 1</Option>
        <Option value="{2}">Option 2</Option>
      </RadioGroup>
    `);
    const options = page.getByRole("radiogroup").getByRole("radio");
    await expect(options.nth(0)).not.toBeChecked();
    await expect(options.nth(1)).toBeChecked();
  });

  test("didChange fires on selection", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <RadioGroup onDidChange="value => testState = value">
        <Option value="a">Alpha</Option>
        <Option value="b">Beta</Option>
      </RadioGroup>
    `);
    await page.getByRole("radio", { name: "Beta" }).check();
    await expect.poll(testStateDriver.testState).toBe("b");
  });

  test("disabled option remains disabled", async ({ initTestBed, page }) => {
    await initTestBed(`
      <RadioGroup>
        <Option value="a">Alpha</Option>
        <Option value="b" enabled="false">Beta</Option>
      </RadioGroup>
    `);
    await expect(page.getByRole("radio", { name: "Beta" })).toBeDisabled();
  });
});
