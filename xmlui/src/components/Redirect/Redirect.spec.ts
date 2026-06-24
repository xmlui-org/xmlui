import { expect, test } from "../../testing/fixtures";

test.describe("Redirect foundation", () => {
  test("redirects when rendered inside a page", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/target" />
            <Text>Redirecting</Text>
          </Page>
          <Page url="/target">Target Page</Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/redirect"; });
    await expect(page).toHaveURL(/#\/target$/);
    await expect(page.getByText("Target Page")).toBeVisible();
  });
});

test.describe("Redirect old-suite transfer debt", () => {
  test("copy literal old conditional, replace, dynamic target, and query-param tests", async () => {
    test.fixme(true, "Full Redirect suite is deferred to routing closure");
  });
});
