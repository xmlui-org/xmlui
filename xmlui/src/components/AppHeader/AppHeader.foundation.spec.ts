import { expect, test } from "../../testing/fixtures";

test.describe("AppHeader foundation", () => {
  test("renders banner with title and child content", async ({ initTestBed, createAppHeaderDriver }) => {
    await initTestBed(`
      <App>
        <AppHeader testId="header" title="Application Title">
          <Text testId="headerText">Header child</Text>
        </AppHeader>
      </App>
    `);

    const header = await createAppHeaderDriver("header");
    await expect(header.component).toBeVisible();
    await expect(header.component).toHaveAttribute("role", "banner");
    await expect(header.component).toContainText("Application Title");
    await expect(header.getContent()).toContainText("Header child");
  });

  test("renders logo, title, and profile menu templates", async ({ initTestBed, createAppHeaderDriver, page }) => {
    await initTestBed(`
      <App>
        <AppHeader testId="header" title="Fallback title">
          <property name="logoTemplate">
            <Text testId="logo">Logo</Text>
          </property>
          <property name="titleTemplate">
            <Text testId="title">Template title</Text>
          </property>
          <property name="profileMenuTemplate">
            <Button testId="profile">Profile</Button>
          </property>
        </AppHeader>
      </App>
    `);

    const header = await createAppHeaderDriver("header");
    await expect(header.getLogo()).toBeVisible();
    await expect(page.getByTestId("logo")).toBeVisible();
    await expect(page.getByTestId("title")).toContainText("Template title");
    await expect(header.getProfileMenu()).toContainText("Profile");
  });

  test("header children remain keyboard focusable", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <AppHeader>
          <NavLink testId="first" to="/first">First</NavLink>
          <NavLink testId="second" to="/second">Second</NavLink>
        </AppHeader>
      </App>
    `);

    await page.getByTestId("first").focus();
    await expect(page.getByTestId("first")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("second")).toBeFocused();
  });

  test("applies foundation theme variables", async ({ initTestBed, createAppHeaderDriver }) => {
    await initTestBed(`<App><AppHeader testId="header" title="Themed" /></App>`, {
      testThemeVars: {
        "backgroundColor-AppHeader": "rgb(0, 240, 0)",
        "height-AppHeader": "80px",
        "borderBottom-AppHeader": "5px dotted rgb(255, 0, 0)",
      },
    });

    const header = await createAppHeaderDriver("header");
    await expect(header.component).toHaveCSS("background-color", "rgb(0, 240, 0)");
    await expect(header.component).toHaveCSS("height", "80px");
    await expect(header.component).toHaveCSS("border-bottom-color", "rgb(255, 0, 0)");
    await expect(header.component).toHaveCSS("border-bottom-width", "5px");
    await expect(header.component).toHaveCSS("border-bottom-style", "dotted");
  });

  test("header action can mutate app state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <AppHeader>
          <Button testId="action" onClick="message = 'changed'">Change</Button>
        </AppHeader>
        <Text testId="message">{message}</Text>
      </App>
    `);

    await page.getByTestId("action").click();
    await expect(page.getByTestId("message")).toContainText("changed");
  });
});
