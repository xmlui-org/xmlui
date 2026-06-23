import { test, expect } from "../../testing/fixtures";

test.describe("Option foundation", () => {
  test("contributes value and label to Select", async ({ initTestBed, createSelectDriver }) => {
    await initTestBed(`
      <Select initialValue="dog">
        <Option value="cat" label="Cat" />
        <Option value="dog" label="Dog" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await expect(driver.component.locator("option")).toHaveText(["Cat", "Dog"]);
    expect(await driver.value()).toBe("dog");
  });

  test("disabled option cannot be selected by user interaction", async ({ initTestBed, createSelectDriver }) => {
    await initTestBed(`
      <Select initialValue="a">
        <Option value="a" label="Available" />
        <Option value="b" label="Disabled" enabled="false" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await expect(driver.component.locator("option").nth(1)).toBeDisabled();
  });
});
