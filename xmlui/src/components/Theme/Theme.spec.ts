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
});

test.describe("Theme old-suite transfer debt", () => {
  test("copy literal named-theme, root, notification, and inline-style tests", async () => {
    test.fixme(true, "Full Theme suite is deferred to theme runtime closure");
  });
});
