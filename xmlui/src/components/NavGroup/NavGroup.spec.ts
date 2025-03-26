import { SKIP_REASON } from "../../testing/component-test-helpers";
import { expect, test } from "../../testing/fixtures";

/**
 * NOTE: We don't have a way to test icons yet, so some test cases are not fully realized. (See skip reasons)
 * TODO: Add tests for icons
 */

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createNavGroupDriver }) => {
    await initTestBed(`
      <NavGroup label="NavGroup">
        <NavLink label="link" to="/" />
      </NavGroup>`);
    await expect((await createNavGroupDriver()).component).toBeAttached();
  });
});

test.skip(
  "collapsed in NavPanel + vertical app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {
    await initTestBed(`
    <App layout="vertical">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/" />
        </NavGroup>
      </NavPanel>
    </App>`);
    await expect((await createNavGroupDriver("navGroup")).component).toBeAttached();
  },
);

test.skip(
  "expanded in NavPanel + vertical app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {
    await initTestBed(`
    <App layout="vertical">
      <NavPanel>
        <NavGroup testId="navGroup" label="NavGroup">
          <NavLink label="link" to="/" />
        </NavGroup>
      </NavPanel>
    </App>`);
    const driver = await createNavGroupDriver("navGroup");
    await driver.click();
    await expect(driver.component).toBeAttached();
  },
);

test.skip(
  "collapsed in NavPanel + horizontal app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {},
);

test.skip(
  "expanded in NavPanel + horizontal app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {},
);

test.skip(
  "collapsed in vertical app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {},
);

test.skip(
  "expanded in vertical app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {},
);

test.skip(
  "collapsed in horizontal app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {},
);

test.skip(
  "expanded in horizontal app layout",
  SKIP_REASON.TO_BE_IMPLEMENTED(
    "This case is not fully realized since we don't have a way to test icons",
  ),
  async ({ initTestBed, createNavGroupDriver }) => {},
);
