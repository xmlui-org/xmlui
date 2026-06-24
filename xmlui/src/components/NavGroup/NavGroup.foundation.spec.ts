import { expect, test } from "../../testing/fixtures";

test.describe("NavGroup foundation", () => {
  test("renders collapsed by default and expands nested links", async ({ initTestBed, createNavGroupDriver, page }) => {
    await initTestBed(`
      <App>
        <NavGroup testId="group" label="Pages">
          <NavLink testId="child" to="/child">Child page</NavLink>
        </NavGroup>
      </App>
    `);

    const group = await createNavGroupDriver("group");
    await expect(group.getTrigger()).toHaveText(/Pages/);
    await expect(group.getTrigger()).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("child")).toBeHidden();

    await group.toggle();
    await expect(group.getTrigger()).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("child")).toBeVisible();
  });

  test("initiallyExpanded displays child content", async ({ initTestBed, createNavGroupDriver, page }) => {
    await initTestBed(`
      <App>
        <NavGroup testId="group" label="Reports" initiallyExpanded="true">
          <NavLink testId="report" to="/reports">Reports</NavLink>
        </NavGroup>
      </App>
    `);

    const group = await createNavGroupDriver("group");
    await expect(group.getTrigger()).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("report")).toBeVisible();
  });

  test("disabled groups cannot be expanded", async ({ initTestBed, createNavGroupDriver, page }) => {
    await initTestBed(`
      <App>
        <NavGroup testId="group" label="Disabled" enabled="false">
          <NavLink testId="child" to="/child">Child page</NavLink>
        </NavGroup>
      </App>
    `);

    const group = await createNavGroupDriver("group");
    await expect(group.getTrigger()).toBeDisabled();
    await group.getTrigger().click({ force: true });
    await expect(group.getTrigger()).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("child")).toBeHidden();
  });

  test("nested NavLink can navigate and mutate app state", async ({ initTestBed, createNavGroupDriver, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <NavGroup testId="group" label="Pages" initiallyExpanded="true">
          <NavLink testId="reports" to="/reports" onClick="message = 'reports selected'">Reports</NavLink>
        </NavGroup>
        <Text testId="message">{message}</Text>
        <Text testId="path">{$pathname}</Text>
      </App>
    `);

    const group = await createNavGroupDriver("group");
    await expect(group.getContent()).toBeVisible();

    await page.getByTestId("reports").click();
    await expect(page.getByTestId("message")).toContainText("reports selected");
    await expect(page.getByTestId("path")).toContainText("/reports");
  });
});
