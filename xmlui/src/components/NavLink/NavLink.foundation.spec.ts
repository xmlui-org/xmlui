import { expect, test } from "../../testing/fixtures";

test.describe("NavLink foundation", () => {
  test("renders label and children and exposes active state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavLink testId="forced" to="/forced" active="true">Forced active</NavLink>
        <NavLink testId="labelled" to="/labelled" label="Label prop" />
      </App>
    `);

    await expect(page.getByTestId("forced")).toHaveText("Forced active");
    await expect(page.getByTestId("forced")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("labelled")).toHaveText("Label prop");
  });

  test("disabled NavLink renders as disabled button and does not navigate", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavLink testId="disabled" to="/disabled" enabled="false">Disabled</NavLink>
        <Text testId="path">{$pathname}</Text>
      </App>
    `);

    await expect(page.getByTestId("disabled")).toHaveJSProperty("tagName", "BUTTON");
    await expect(page.getByTestId("disabled")).toBeDisabled();
    await page.getByTestId("disabled").click({ force: true });
    await expect(page.getByTestId("path")).toContainText("/");
  });

  test("click handler mutates state and internal link navigates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <NavLink testId="about" to="/about" onClick="message = 'clicked'">About</NavLink>
        <Text testId="message">{message}</Text>
        <Text testId="path">{$pathname}</Text>
      </App>
    `);

    await page.getByTestId("about").click();
    await expect(page.getByTestId("message")).toContainText("clicked");
    await expect(page.getByTestId("path")).toContainText("/about");
    await expect(page.getByTestId("about")).toHaveAttribute("aria-current", "page");
  });
});
