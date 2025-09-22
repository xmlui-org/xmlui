import { expect, test } from "../../testing/fixtures";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, page }) => {
    await initTestBed(`
      <NavGroup testId="navGroup" label="NavGroup">
      </NavGroup>`);
    await expect(page.getByTestId("navGroup")).toBeVisible();
  });

  test("component renders with children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <NavGroup label="NavGroup" testId="navGroup">
        <NavLink label="link" to="/" />
      </NavGroup>`);
    await expect(page.getByTestId("navGroup")).toBeVisible();
  });
});

test("component trigger has correct aria labels", async ({ initTestBed, page }) => {
  await initTestBed(`
      <NavGroup testId="navGroup" label="NavGroup">
      </NavGroup>`);
  const button = page.getByTestId("navGroup");
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
});

// TODO: depending on layout, different component lists are rendered - need to test for all of them
/* test("component list content has correct aria labels", async ({ initTestBed, page }) => {
  await initTestBed(`
    <NavGroup testId="navGroup" label="NavGroup">
      <NavLink label="link" to="/asd" />
    </NavGroup>`);
  const button = page.getByTestId("navGroup");
  const content = page.getByRole('menuitem', { name: 'link' });

  await button.click();

  await expect(content).toBeVisible();
  await expect(content).toHaveAttribute("aria-hidden", "false");
}); */

test("expanded in NavPanel + vertical app layout if current page is same as link in group", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <App layout="vertical">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/" />
        </NavGroup>
      </NavPanel>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).toBeVisible();
});

test("collapsed in NavPanel + vertical app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="vertical">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/asd" />
        </NavGroup>
      </NavPanel>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).not.toBeVisible();
});

test("expanded in NavPanel + vertical app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="vertical">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/" />
        </NavGroup>
      </NavPanel>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).toBeVisible();
});

test("collapsed in NavPanel + horizontal app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="horizontal">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/" />
        </NavGroup>
      </NavPanel>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).not.toBeVisible();
});

test("click expands group in NavPanel + horizontal app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="horizontal">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/" />
        </NavGroup>
      </NavPanel>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "link" })).not.toBeVisible();
  await page.getByTestId("navGroup").click();
  await expect(page.getByRole("menuitem", { name: "link" })).toBeVisible();
});

test("collapsed in vertical app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="vertical">
      <NavGroup testId="navGroup" label="NavGroup">
        <NavLink label="link" to="/asd" />
      </NavGroup>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).not.toBeVisible();
});

test("expanded in vertical app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="vertical">
      <NavGroup testId="navGroup" label="NavGroup">
        <NavLink label="link" to="/" />
      </NavGroup>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).toBeVisible();
});

test("collapsed in horizontal app layout", async ({ initTestBed, page }) => {
  await initTestBed(`
    <App layout="horizontal">
      <NavGroup testId="navGroup" label="NavGroup">
        <NavLink label="link" to="/asd" />
      </NavGroup>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).not.toBeVisible();
});

test("collapsed in horizontal app layout if current page is same as link in group", async ({
  initTestBed,
  page,
}) => {
  await initTestBed(`
    <App layout="horizontal">
      <NavGroup testId="navGroup" label="NavGroup">
        <NavLink label="link" to="/" />
      </NavGroup>
    </App>`);
  await expect(page.getByTestId("navGroup")).toBeVisible();
  await expect(page.locator("[data-testid='nav-group-content']")).not.toBeVisible();
});
