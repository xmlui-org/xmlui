import { expect, test } from "../../testing/fixtures";

test.describe("NavPanelCollapseButton foundation", () => {
  test("does not render outside a NavPanel collapse context", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavPanelCollapseButton testId="collapse" />
      </App>
    `);

    await expect(page.getByTestId("collapse")).toHaveCount(0);
  });

  test("renders inside NavPanel footer and toggles collapsed state", async ({
    initTestBed,
    createNavPanelCollapseButtonDriver,
    createNavPanelDriver,
  }) => {
    await initTestBed(`
      <App>
        <NavPanel testId="panel">
          <NavLink to="/">Home</NavLink>
          <property name="footerTemplate">
            <NavPanelCollapseButton testId="collapse" />
          </property>
        </NavPanel>
      </App>
    `);

    const panel = await createNavPanelDriver("panel");
    const collapse = await createNavPanelCollapseButtonDriver("collapse");

    await expect(panel.component).toHaveAttribute("data-nav-panel-collapsed", "false");
    await expect(collapse.component).toHaveAttribute("aria-label", "Collapse sidebar");
    await expect(collapse.component).toHaveAttribute("data-nav-panel-collapsed", "false");

    await collapse.click();
    await expect(panel.component).toHaveAttribute("data-nav-panel-collapsed", "true");
    await expect(collapse.component).toHaveAttribute("aria-label", "Expand sidebar");
    await expect(collapse.component).toHaveAttribute("data-nav-panel-collapsed", "true");
  });

  test("uses custom labels and icons across collapse state", async ({ initTestBed, createNavPanelCollapseButtonDriver }) => {
    await initTestBed(`
      <App>
        <NavPanel>
          <property name="footerTemplate">
            <NavPanelCollapseButton
              testId="collapse"
              icon="left"
              iconCollapsed="right"
              aria-label="Hide navigation"
              aria-labelCollapsed="Show navigation" />
          </property>
        </NavPanel>
      </App>
    `);

    const collapse = await createNavPanelCollapseButtonDriver("collapse");
    await expect(collapse.component).toHaveAttribute("aria-label", "Hide navigation");
    await expect(collapse.component.getByTestId("collapse").locator('[data-icon="left"]')).toHaveCount(0);
    await expect(collapse.component.locator('[data-icon="left"]')).toHaveCount(1);

    await collapse.click();
    await expect(collapse.component).toHaveAttribute("aria-label", "Show navigation");
    await expect(collapse.component.locator('[data-icon="right"]')).toHaveCount(1);
  });

  test("keyboard activation toggles the collapse state", async ({
    initTestBed,
    createNavPanelCollapseButtonDriver,
    createNavPanelDriver,
  }) => {
    await initTestBed(`
      <App>
        <NavPanel testId="panel">
          <property name="footerTemplate">
            <NavPanelCollapseButton testId="collapse" />
          </property>
        </NavPanel>
      </App>
    `);

    const panel = await createNavPanelDriver("panel");
    const collapse = await createNavPanelCollapseButtonDriver("collapse");
    await collapse.focus();
    await collapse.component.press("Enter");
    await expect(panel.component).toHaveAttribute("data-nav-panel-collapsed", "true");
  });
});
