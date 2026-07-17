import { expect, test } from "../../testing/fixtures";

test.describe("NavPanel foundation", () => {
  test("renders NavLinks in the content area", async ({ initTestBed, createNavPanelDriver, page }) => {
    await initTestBed(`
      <App>
        <NavPanel testId="panel">
          <NavLink to="/" exact="true">Home</NavLink>
          <NavLink to="/reports">Reports</NavLink>
        </NavPanel>
      </App>
    `);

    const panel = await createNavPanelDriver("panel");
    await expect(panel.component).toBeVisible();
    await expect(panel.getContent().getByText("Home")).toBeVisible();
    await expect(panel.getContent().getByText("Reports")).toBeVisible();
    await expect(page.getByRole("navigation")).toBeVisible();
  });

  test("renders logo and footer templates", async ({ initTestBed, createNavPanelDriver }) => {
    await initTestBed(`
      <App>
        <NavPanel testId="panel">
          <property name="logoTemplate">
            <Text testId="logo">Logo area</Text>
          </property>
          <NavLink to="/">Home</NavLink>
          <property name="footerTemplate">
            <Text testId="footer">Footer area</Text>
          </property>
        </NavPanel>
      </App>
    `);

    const panel = await createNavPanelDriver("panel");
    await expect(panel.getLogo()).toContainText("Logo area");
    await expect(panel.getFooter()).toContainText("Footer area");
  });

  test("does not render logo template in vertical full header layout", async ({
    initTestBed,
    createNavPanelDriver,
  }) => {
    await initTestBed(`
      <App layout="vertical-full-header">
        <NavPanel testId="panel">
          <property name="logoTemplate">
            <Text>Logo area</Text>
          </property>
          <NavLink to="/">Home</NavLink>
        </NavPanel>
      </App>
    `);

    const panel = await createNavPanelDriver("panel");
    await expect(panel.getLogo()).toHaveCount(0);
    await expect(panel.getContent().getByText("Home")).toBeVisible();
  });

  test("NavLink inside NavPanel navigates and mutates state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <NavPanel>
          <NavLink testId="reports" to="/reports" onClick="message = 'reports clicked'">Reports</NavLink>
        </NavPanel>
        <Text testId="message">{message}</Text>
        <Text testId="path">{$pathname}</Text>
      </App>
    `);

    await page.getByTestId("reports").click();
    await expect(page.getByTestId("message")).toContainText("reports clicked");
    await expect(page.getByTestId("path")).toContainText("/reports");
  });

  test("accepts overlay scroll style and constrains content overflow", async ({ initTestBed, createNavPanelDriver }) => {
    await initTestBed(`
      <App>
        <NavPanel testId="panel" height="80px" scrollStyle="overlay">
          <NavLink to="/1">One</NavLink>
          <NavLink to="/2">Two</NavLink>
          <NavLink to="/3">Three</NavLink>
          <NavLink to="/4">Four</NavLink>
          <NavLink to="/5">Five</NavLink>
        </NavPanel>
      </App>
    `);

    const panel = await createNavPanelDriver("panel");
    await expect(panel.component).toHaveCSS("overflow-y", "auto");
    await expect(panel.getContent()).toBeVisible();
  });
});
