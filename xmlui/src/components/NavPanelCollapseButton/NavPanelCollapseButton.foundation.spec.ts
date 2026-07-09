import { expect, test } from "../../testing/fixtures";

test.describe("NavPanelCollapseButton foundation", () => {
  test("renders when App layout context is available", async ({ initTestBed, page }) => {
    await initTestBed(`<NavPanelCollapseButton />`);

    const collapse = page.getByRole("button", { name: "Collapse sidebar" });
    await expect(collapse).toBeVisible();
    await collapse.click();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  });

  test("renders inside NavPanel footer and toggles collapsed state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel">
          <NavLink to="/">Home</NavLink>
          <property name="footerTemplate">
            <NavPanelCollapseButton />
          </property>
        </NavPanel>
      </App>
    `);

    const collapse = page.getByRole("button", { name: "Collapse sidebar" });
    await expect(collapse).toBeVisible();
    await collapse.click();
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  });

  test("uses custom labels across collapse state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel>
          <property name="footerTemplate">
            <NavPanelCollapseButton
              icon="left"
              iconCollapsed="right"
              aria-label="Hide navigation"
              aria-labelCollapsed="Show navigation" />
          </property>
        </NavPanel>
      </App>
    `);

    const collapse = page.getByRole("button", { name: "Hide navigation" });
    await expect(collapse).toBeVisible();
    await collapse.click();
    await expect(page.getByRole("button", { name: "Show navigation" })).toBeVisible();
  });

  test("keyboard activation toggles the collapse state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel testId="panel">
          <property name="footerTemplate">
            <NavPanelCollapseButton />
          </property>
        </NavPanel>
      </App>
    `);

    const collapse = page.getByRole("button", { name: "Collapse sidebar" });
    await collapse.focus();
    await collapse.press("Enter");
    await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  });
});
