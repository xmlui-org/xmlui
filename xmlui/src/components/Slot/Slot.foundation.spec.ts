import { expect, test } from "../../testing/fixtures";

test.describe("Slot foundation", () => {
  test("user-defined components do not inherit caller component id references", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <App var.message="Hello from App">
        <TextBox id="textBox" initialValue="{message}" />
        <MyCard />
      </App>
    `,
      {
        components: [
          `
          <Component name="MyCard">
            <Card>
              <Text testId="reference-message">Reference: {textBox.value}</Text>
              <Text testId="local-message">Local: {message}</Text>
            </Card>
          </Component>
        `,
        ],
      },
    );

    await expect(page.getByRole("textbox")).toHaveValue("Hello from App");
    await expect(page.getByTestId("reference-message")).toHaveText("Reference:");
    await expect(page.getByTestId("local-message")).toHaveText("Local:");
  });

  test("user-defined components still receive current context variables", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(
      `
      <Items data="{[{ name: 'Ada' }]}" >
        <ItemCard />
      </Items>
    `,
      {
        components: [
          `
          <Component name="ItemCard">
            <Text testId="item-name">{$item.name}</Text>
          </Component>
        `,
        ],
      },
    );

    await expect(page.getByTestId("item-name")).toHaveText("Ada");
  });

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
