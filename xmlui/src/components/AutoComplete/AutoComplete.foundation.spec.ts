import { test, expect } from "../../testing/fixtures";

test.describe("AutoComplete foundation", () => {
  test("renders with default props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AutoComplete>
        <Option value="alpha">Alpha</Option>
      </AutoComplete>
    `);
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("filters options while typing", async ({ initTestBed, page }) => {
    await initTestBed(`
      <AutoComplete initiallyOpen="true">
        <Option value="alpha">Alpha</Option>
        <Option value="beta">Beta</Option>
      </AutoComplete>
    `);
    await page.getByRole("combobox").fill("bet");
    await expect(page.getByRole("option", { name: "Beta" })).toBeVisible();
    await expect(page.getByRole("option", { name: "Alpha" })).toHaveCount(0);
  });

  test("selects an option and fires didChange", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <AutoComplete initiallyOpen="true" onDidChange="value => testState = value">
        <Option value="alpha">Alpha</Option>
        <Option value="beta">Beta</Option>
      </AutoComplete>
    `);
    await page.getByRole("option", { name: "Beta" }).click();
    await expect.poll(testStateDriver.testState).toBe("beta");
    await expect(page.getByRole("combobox")).toHaveValue("Beta");
  });

  test("disabled option cannot be selected", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <AutoComplete initiallyOpen="true" onDidChange="value => testState = value">
        <Option value="alpha">Alpha</Option>
        <Option value="beta" enabled="false">Beta</Option>
      </AutoComplete>
    `);
    await expect(page.getByRole("option", { name: "Beta" })).toBeDisabled();
    await page.getByRole("option", { name: "Alpha" }).click();
    await expect.poll(testStateDriver.testState).toBe("alpha");
  });

  test("creatable value fires itemCreated", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <AutoComplete creatable="true" onItemCreated="value => testState = value">
        <Option value="alpha">Alpha</Option>
      </AutoComplete>
    `);
    await page.getByRole("combobox").fill("Gamma");
    await page.getByRole("option", { name: "Gamma" }).click();
    await expect.poll(testStateDriver.testState).toBe("Gamma");
  });
});
