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

  test("prefers the most specific route and decodes params", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/files/:id">
            <Text testId="page">Param {$routeParams.id}</Text>
          </Page>
          <Page url="/files/new">
            <Text testId="page">New file</Text>
          </Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/files/new"; });
    await expect(page.getByTestId("page")).toHaveText("New file");

    await page.evaluate(() => { window.location.hash = "#/files/a%20b"; });
    await expect(page.getByTestId("page")).toHaveText("Param a b");
  });

  test("navigate supports query params and query-only updates", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/docs/start">
            <Button testId="next" onClick="navigate('/docs/next', { tab: 'api' })">Next</Button>
            <Button testId="query" onClick="navigate('?tab=guide')">Query</Button>
            <Text testId="route">{$pathname}:{$queryParams.tab}:{$queryString}</Text>
          </Page>
          <Page url="/docs/next">
            <Text testId="route">{$pathname}:{$queryParams.tab}:{$queryString}</Text>
          </Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/docs/start"; });
    await expect(page.getByTestId("route")).toHaveText("/docs/start::");
    await page.getByTestId("next").click();
    await expect(page).toHaveURL(/#\/docs\/next\?tab=api/);
    await expect(page.getByTestId("route")).toHaveText("/docs/next:api:?tab=api");

    await page.evaluate(() => { window.location.hash = "#/docs/start"; });
    await expect(page.getByTestId("route")).toHaveText("/docs/start::");
    await page.getByTestId("query").click();
    await expect(page).toHaveURL(/#\/docs\/start\?tab=guide$/);
    await expect(page.getByTestId("route")).toHaveText("/docs/start:guide:?tab=guide");
  });

  test("Page owns routed content padding inside App", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">
            <Text testId="content">Home Page</Text>
          </Page>
        </Pages>
      </App>
    `);

    const metrics = await page.evaluate(() => {
      const pageRoot = document.querySelector("[data-xmlui-component='Page']") as HTMLElement | null;
      const appPageContent = document.querySelector("[data-xmlui-part='pageContent']") as HTMLElement | null;
      if (!pageRoot || !appPageContent) {
        return null;
      }
      const pageStyle = getComputedStyle(pageRoot);
      const appStyle = getComputedStyle(appPageContent);
      const pageRect = pageRoot.getBoundingClientRect();
      const appRect = appPageContent.getBoundingClientRect();
      return {
        pagePaddingLeft: pageStyle.paddingLeft,
        pagePaddingTop: pageStyle.paddingTop,
        pageDisplay: pageStyle.display,
        pageFlexDirection: pageStyle.flexDirection,
        appPaddingLeft: appStyle.paddingLeft,
        appPaddingTop: appStyle.paddingTop,
        horizontalInset: pageRect.left - appRect.left,
        verticalInset: pageRect.top - appRect.top,
      };
    });

    expect(metrics).toMatchObject({
      pagePaddingLeft: "16px",
      pagePaddingTop: "20px",
      pageDisplay: "flex",
      pageFlexDirection: "column",
      appPaddingLeft: "0px",
      appPaddingTop: "0px",
      horizontalInset: 0,
      verticalInset: 0,
    });
  });
});
