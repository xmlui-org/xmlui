import { expect, test } from "../../testing/fixtures";

test.describe("Slot foundation", () => {
  test("runs event handlers on default fallback children", async ({ initTestBed, page }) => {
    await initTestBed(`<ActionBar />`, {
      components: [
        `
        <Component name="ActionBar">
          <Card>
            <H3>Use these actions</H3>
            <HStack>
              <Slot>
                <Button label="Default" onClick="window.alert('Default clicked')" />
              </Slot>
            </HStack>
          </Card>
        </Component>
        `,
      ],
    });

    await page.evaluate(() => {
      (window as any).__slotFallbackAlertMessage = undefined;
      window.alert = (message?: unknown) => {
        (window as any).__slotFallbackAlertMessage = String(message);
      };
    });

    await page.getByRole("button", { name: "Default" }).click();
    await expect.poll(() => page.evaluate(() => (window as any).__slotFallbackAlertMessage)).toBe("Default clicked");
  });
});
