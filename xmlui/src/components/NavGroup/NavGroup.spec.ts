import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

/**
 * NOTE: We don't have a way to test icons yet, so some test cases are not fully realized. (See skip reasons)
 * TODO: Add tests for icons
 */

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("displays menuitems after click", async ({ initTestBed, page }) => {
    await initTestBed(`
        <NavGroup label="Pages">
          <NavLink label="Page 1" />
          <NavGroup label="subpages">
            <NavLink label="inner page 2" />
            <NavLink label="inner page 3" />
          </NavGroup>
          <NavLink label="Page 4" />
        </NavGroup>
      `);
    await page.getByRole("button", { name: "Pages", exact: true }).click();

    await expect(page.getByRole("menuitem")).toHaveCount(3);
    await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "subpages" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Page 4" })).toBeVisible();

    await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
    await expect(page.getByRole("menuitem", { name: "inner page 3" })).not.toBeVisible();
  });

  test("disabled navgroup can't open", async ({ initTestBed, page }) => {
    await initTestBed(`
        <NavGroup label="Pages" enabled="false">
          <NavLink label="Page 1" />
          <NavGroup label="subpages">
            <NavLink label="inner page 2" />
            <NavLink label="inner page 3" />
          </NavGroup>
          <NavLink label="Page 4" />
        </NavGroup>
      `);
    const pagesBtn = page.getByRole("button", { name: "Pages", exact: true });

    await expect(pagesBtn).toBeDisabled();
    await pagesBtn.click({ force: true });

    await expect(page.getByRole("menuitem", { name: "Page 1" })).not.toBeVisible();
    await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
  });
});

test("nested disabled navgroup can't open", async ({ initTestBed, page }) => {
  await initTestBed(`
        <NavGroup label="Pages" >
          <NavLink label="Page 1" />
          <NavGroup label="subpages" enabled="false">
            <NavLink label="inner page 2" />
            <NavLink label="inner page 3" />
          </NavGroup>
          <NavLink label="Page 4" />
        </NavGroup>
      `);
  const pagesBtn = page.getByRole("button", { name: "Pages", exact: true });
  await pagesBtn.click();

  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();

  const subpagesBtn = page.getByRole("menuitem", { name: "subpages" });

  await expect(subpagesBtn).toBeDisabled();

  await subpagesBtn.click({ force: true });

  await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
});

test("initiallyExpanded works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <NavGroup label="Pages" initiallyExpanded="true">
      <NavLink label="Page 1" />
      <NavGroup label="subpages">
        <NavLink label="inner page 2" />
        <NavLink label="inner page 3" />
      </NavGroup>
      <NavLink label="Page 4" />
    </NavGroup>
  `);

  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();

  await expect(page.getByRole("menuitem", { name: "inner page 2" })).not.toBeVisible();
});

test("nested initiallyExpanded works", async ({ initTestBed, page }) => {
  await initTestBed(`
    <NavGroup label="Pages" initiallyExpanded="true">
      <NavLink label="Page 1" />
      <NavGroup label="subpages" initiallyExpanded="true">
        <NavLink label="inner page 2" />
        <NavLink label="inner page 3" />
      </NavGroup>
      <NavLink label="Page 4" />
    </NavGroup>
  `);

  await expect(page.getByRole("menuitem", { name: "Page 1" })).toBeVisible();

  await expect(page.getByRole("menuitem", { name: "inner page 2" })).toBeVisible();
});

test.describe("integration with NavPanel", () => {
  test.skip(
    "collapsed in NavPanel + vertical app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {
      await initTestBed(`
      <App layout="vertical">
        <NavPanel>
          <NavGroup testId="navGroup" label="NavGroup">
            <NavLink label="link" to="/" />
          </NavGroup>
        </NavPanel>
      </App>`);
    },
  );

  test.skip(
    "expanded in NavPanel + vertical app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {
      await initTestBed(`
      <App layout="vertical">
        <NavPanel>
          <NavGroup testId="navGroup" label="NavGroup">
            <NavLink label="link" to="/" />
          </NavGroup>
        </NavPanel>
      </App>`);
    },
  );

  test.skip(
    "collapsed in NavPanel + horizontal app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "expanded in NavPanel + horizontal app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "collapsed in vertical app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "expanded in vertical app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "collapsed in horizontal app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {},
  );

  test.skip(
    "expanded in horizontal app layout",
    SKIP_REASON.TO_BE_IMPLEMENTED(
      "This case is not fully realized since we don't have a way to test icons",
    ),
    async ({ initTestBed }) => {},
  );
});
