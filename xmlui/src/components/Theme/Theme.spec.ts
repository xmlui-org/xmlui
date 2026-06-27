import { expect, test } from "../../testing/fixtures";

test.describe("Theme foundation", () => {
  test("scopes theme variables to nested components", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme textColor-Text="rgb(10, 20, 30)">
        <Text testId="inside">Inside</Text>
      </Theme>
      <Text testId="outside">Outside</Text>
    `);

    await expect(page.getByTestId("inside")).toHaveCSS("color", "rgb(10, 20, 30)");
    await expect(page.getByTestId("outside")).not.toHaveCSS("color", "rgb(10, 20, 30)");
  });

  test("marks scoped tone on the wrapper", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme tone="dark">
        <Text testId="inside">Inside</Text>
      </Theme>
    `);

    await expect(page.locator('[data-xmlui-component="Theme"]')).toHaveAttribute("data-xmlui-tone", "dark");
  });

  test("does not apply theme variables or wrapper when applyIf is false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Theme textColor-Text="rgb(255, 0, 0)" applyIf="false">
        <Text testId="inside">Inside</Text>
      </Theme>
    `);

    await expect(page.getByTestId("inside")).toBeVisible();
    await expect(page.getByTestId("inside")).not.toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(page.locator('[data-xmlui-component="Theme"]')).toHaveCount(0);
  });

  test("does not insert a wrapper for an empty no-op Theme", async ({ initTestBed, page }) => {
    await initTestBed(`
      <HStack testId="row">
        <Theme>
          <Text testId="inside">Inside</Text>
        </Theme>
        <Text testId="sibling">Sibling</Text>
      </HStack>
    `);

    await expect(page.locator('[data-xmlui-component="Theme"]')).toHaveCount(0);
    await expect
      .poll(async () =>
        page.getByTestId("inside").evaluate((element) => {
          const sibling = document.querySelector('[data-testid="sibling"]');
          return element.parentElement === sibling?.parentElement;
        }),
      )
      .toBe(true);
  });

  test("reacts to dynamic applyIf changes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.applyTheme="{false}">
        <Button testId="toggle" onClick="applyTheme = !applyTheme">Toggle</Button>
        <Theme textColor-Text="rgb(255, 0, 0)" applyIf="{applyTheme}">
          <Text testId="inside">Inside</Text>
        </Theme>
      </App>
    `);

    await expect(page.getByTestId("inside")).not.toHaveCSS("color", "rgb(255, 0, 0)");
    await page.getByTestId("toggle").click();
    await expect(page.getByTestId("inside")).toHaveCSS("color", "rgb(255, 0, 0)");
  });
});
