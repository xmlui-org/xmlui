import { expect, test } from "../../testing/fixtures";

test.describe("TileGrid foundation", () => {
  test("renders data with item context and reacts to data mutation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.extra="{false}">
        <Button testId="add" onClick="extra = true">Add</Button>
        <TileGrid
          testId="grid"
          data="{extra ? [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' }
          ] : [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' }
          ]}"
          itemWidth="90px"
          itemHeight="40px"
          gap="6px">
          <Text>{$itemIndex}: {$item.label}</Text>
        </TileGrid>
      </App>
    `);

    await expect(page.getByText("0: Alpha")).toBeVisible();
    await expect(page.getByText("1: Beta")).toBeVisible();
    await page.getByTestId("add").click();
    await expect(page.getByText("2: Gamma")).toBeVisible();
    await expect(page.getByTestId("grid")).toHaveCSS("gap", "6px");
  });
});
