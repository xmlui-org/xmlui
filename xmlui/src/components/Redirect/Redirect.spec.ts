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

  test("supports dynamic targets with query parameters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.targetId="42">
        <Pages>
          <Page url="/">Home</Page>
          <Page url="/redirect">
            <Redirect to="/target/{targetId}?mode=edit" />
          </Page>
          <Page url="/target/:id">
            <Text testId="target">Target {$routeParams.id} {$queryParams.mode}</Text>
          </Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/redirect"; });
    await expect(page).toHaveURL(/#\/target\/42\?mode=edit$/);
    await expect(page.getByTestId("target")).toHaveText("Target 42 edit");
  });

  test("replace redirects do not add an extra history entry", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/redirect">
            <Redirect to="/target" replace="{true}" />
          </Page>
          <Page url="/target">Target Page</Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/redirect"; });
    await expect(page).toHaveURL(/#\/target$/);
    await page.goBack();
    await expect(page).not.toHaveURL(/#\/redirect$/);
  });
});
