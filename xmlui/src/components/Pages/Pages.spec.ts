import { expect, test } from "../../testing/fixtures";

test.describe("Pages foundation", () => {
  test("renders the matching page", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">Home Page</Page>
          <Page url="/about">About Page</Page>
        </Pages>
      </App>
    `);

    await expect(page.getByText("Home Page")).toBeVisible();
    await page.evaluate(() => { window.location.hash = "#/about"; });
    await expect(page.getByText("About Page")).toBeVisible();
  });

  test("provides route and query context variables", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/user/:id">
            <Text testId="route">{$pathname}:{$routeParams.id}:{$queryParams.tab}:{$queryString}</Text>
          </Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/user/42?tab=profile"; });
    await expect(page.getByTestId("route")).toHaveText("/user/42:42:profile:?tab=profile");
  });

  test("navigates to fallbackPath when no route matches", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages fallbackPath="/">
          <Page url="/">Home Page</Page>
          <Page url="/about">About Page</Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/missing"; });
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.getByText("Home Page")).toBeVisible();
  });
});

test.describe("Pages old-suite transfer debt", () => {
  test("copy literal old route guards, canonical URL, scroll restoration, and search-index tests", async () => {
    test.fixme(true, "Full Pages/Page suite is deferred to routing closure");
  });
});
