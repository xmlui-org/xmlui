import { test, expect } from "../../testing/fixtures";

test.describe("Option foundation", () => {
  test("contributes value and label to Select", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
      <Select initialValue="dog">
        <Option value="cat" label="Cat" />
        <Option value="dog" label="Dog" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    await expect(page.getByRole("option", { name: "Cat" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Dog" })).toBeVisible();
    expect(await driver.value()).toBe("dog");
  });

  test("disabled option cannot be selected by user interaction", async ({ initTestBed, createSelectDriver, page }) => {
    await initTestBed(`
      <Select initialValue="a">
        <Option value="a" label="Available" />
        <Option value="b" label="Disabled" enabled="false" />
      </Select>
    `);
    const driver = await createSelectDriver();
    await driver.toggleOptionsVisibility();
    await expect(page.getByRole("option", { name: "Disabled" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
