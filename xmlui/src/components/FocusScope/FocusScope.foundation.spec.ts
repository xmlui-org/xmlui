import { expect, test } from "../../testing/fixtures";

test.describe("FocusScope foundation", () => {
  test("preserves vertical stack item width for nested controls", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <VStack gap="$space-4">
          <FocusScope>
            <VStack padding="$space-4" gap="$space-3" border="1px solid $borderColor">
              <H3>Edit status</H3>
              <Select initialValue="open">
                <Option value="open" label="Open" />
                <Option value="closed" label="Closed" />
              </Select>
              <HStack>
                <Button label="Cancel" />
                <Button label="Save" />
              </HStack>
            </VStack>
          </FocusScope>

          <Button label="Outside scope" />
        </VStack>
      </App>
    `);

    const panel = page.locator(
      '[data-xmlui-component="FocusScope"] [data-xmlui-component="VStack"]',
    );
    const select = page.getByRole("combobox");
    await expect(panel).toHaveCount(1);
    const panelBox = await panel.boundingBox();
    const selectBox = await select.boundingBox();

    expect(panelBox).not.toBeNull();
    expect(selectBox).not.toBeNull();
    expect(selectBox!.width).toBeCloseTo(panelBox!.width - 34, 0);
  });
});
