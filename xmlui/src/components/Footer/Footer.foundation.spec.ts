import { expect, test } from "../../testing/fixtures";

test.describe("Footer foundation", () => {
  test("renders content and contentinfo semantics", async ({ initTestBed, createFooterDriver }) => {
    await initTestBed(`
      <App>
        <Footer testId="footer">
          <Text testId="copyright">© 2026 Company Name</Text>
        </Footer>
      </App>
    `);

    const footer = await createFooterDriver("footer");
    await expect(footer.component).toBeVisible();
    await expect(footer.component).toHaveAttribute("role", "contentinfo");
    await expect(footer.getContent()).toContainText("© 2026 Company Name");
  });

  test("renders multiple children horizontally and keeps interactive children focusable", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Footer>
          <Text testId="terms">Terms</Text>
          <Button testId="contact">Contact</Button>
        </Footer>
      </App>
    `);

    await expect(page.getByTestId("terms")).toContainText("Terms");
    await page.getByTestId("contact").focus();
    await expect(page.getByTestId("contact")).toBeFocused();
  });

  test("reflects sticky prop on the rendered root", async ({ initTestBed, createFooterDriver }) => {
    await initTestBed(`
      <App>
        <Footer testId="stickyDefault">Default sticky</Footer>
        <Footer testId="notSticky" sticky="false">Not sticky</Footer>
      </App>
    `);

    await expect((await createFooterDriver("stickyDefault")).component).toHaveAttribute("data-sticky", "true");
    await expect((await createFooterDriver("notSticky")).component).toHaveAttribute("data-sticky", "false");
  });

  test("applies foundation theme variables", async ({ initTestBed, createFooterDriver }) => {
    await initTestBed(`<App><Footer testId="footer">Themed footer</Footer></App>`, {
      testThemeVars: {
        "backgroundColor-Footer": "rgb(0, 240, 0)",
        "textColor-Footer": "rgb(20, 30, 40)",
        "borderTop-Footer": "4px solid rgb(255, 0, 0)",
      },
    });

    const footer = await createFooterDriver("footer");
    await expect(footer.component).toHaveCSS("background-color", "rgb(0, 240, 0)");
    await expect(footer.component).toHaveCSS("color", "rgb(20, 30, 40)");
    await expect(footer.component).toHaveCSS("border-top-width", "4px");
    await expect(footer.component).toHaveCSS("border-top-color", "rgb(255, 0, 0)");
  });

  test("footer action can mutate app state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <Footer>
          <Button testId="action" onClick="message = 'footer clicked'">Change</Button>
        </Footer>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.getByTestId("action").click();
    await expect(page.getByTestId("message")).toContainText("footer clicked");
  });
});
