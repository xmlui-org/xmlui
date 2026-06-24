import { test, expect } from "../../testing/fixtures";

test.describe("SelectionStore foundation", () => {
  test("renders children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <SelectionStore>
        <Text>Inside store</Text>
      </SelectionStore>
    `);
    await expect(page.getByText("Inside store")).toBeVisible();
  });

  test("clearSelection API clears value", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <SelectionStore id="selection" value="{[{ id: 'a' }]}">
        <Button onClick="selection.clearSelection(); testState = selection.value.length">
          Clear
        </Button>
      </SelectionStore>
    `);
    await page.getByRole("button", { name: "Clear" }).click();
    await expect.poll(testStateDriver.testState).toBe(0);
  });
});
