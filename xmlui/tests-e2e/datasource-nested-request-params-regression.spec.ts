import { test, expect } from "../src/testing/fixtures";

/**
 * Regression for issue #3889:
 * https://github.com/xmlui-org/xmlui/issues/3889
 *
 * A `DataSource` whose request params contain a *nested* value — the idiomatic
 * `body="{{ sql: '...', params: [] }}"` from the docs — used to pin the router:
 * while such a page was mounted, every route transition stopped. The URL changed
 * (NavLink clicks, direct `location.hash` assignment) but the mounted page never did.
 *
 * Cause: request params were memoized with a *shallow* comparison, so the fresh
 * inner array/object counted as a change on every render. That churned the loader's
 * `queryId` identity, re-running its `registerComponentApi` effect, which wrote new
 * component-API state, which re-rendered — an endless render loop that starved
 * React's concurrent rendering so the router's transition never committed.
 *
 * The `params` are now compared deeply, so a deeply-equal payload keeps its identity.
 */

function buildApp(dataSourceAttrs: string) {
  return `
<App>
  <NavPanel>
    <NavLink label="Home" to="/" />
    <NavLink label="Details" to="/details" />
  </NavPanel>
  <Pages>
    <Page url="/"><H1>Home Page</H1></Page>
    <Page url="/data">
      <DataSource id="ds" url="/api/query" ${dataSourceAttrs} />
      <H1>Data Page</H1>
      <Text testId="loaded" value="{ds.loaded ? 'yes' : 'no'}" />
    </Page>
    <Page url="/details"><H1>Details Page</H1></Page>
  </Pages>
</App>
`;
}

const cases: Array<{ name: string; attrs: string }> = [
  {
    name: "POST body with a nested array",
    attrs: `method="POST" body="{{ sql: 'SELECT 1', params: [] }}"`,
  },
  {
    name: "POST body with a nested object",
    attrs: `method="POST" body="{{ sql: 'SELECT 1', opts: { limit: 10 } }}"`,
  },
  {
    name: "GET queryParams with a nested array",
    attrs: `queryParams="{{ sql: 'SELECT 1', params: [] }}"`,
  },
  {
    name: "POST rawBody as a value-stable string",
    attrs: `method="POST" rawBody="{JSON.stringify({ sql: 'SELECT 1', params: [] })}"`,
  },
];

for (const { name, attrs } of cases) {
  test(`route transitions still run with a DataSource using ${name}`, async ({
    page,
    initTestBed,
  }) => {
    let requestCount = 0;
    await page.route(
      (url) => url.pathname === "/api/query",
      async (route) => {
        requestCount++;
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([{ id: 1 }]),
        });
      },
    );

    await initTestBed(buildApp(attrs));
    await page.goto("/#/data");
    await expect(page.getByRole("heading", { name: "Data Page" })).toBeVisible();
    await expect(page.getByTestId("loaded")).toHaveText("yes");

    // Leaving the page must work — this is what the render loop used to block.
    await page.getByRole("link", { name: "Details" }).click();
    await expect(page.getByRole("heading", { name: "Details Page" })).toBeVisible();

    // ...and navigating back in, then away again, must keep working.
    await page.goto("/#/data");
    await expect(page.getByTestId("loaded")).toHaveText("yes");
    await page.getByRole("link", { name: "Home" }).click();
    await expect(page.getByRole("heading", { name: "Home Page" })).toBeVisible();

    // A deeply-equal payload must not churn the react-query key into refetches.
    // Two visits to the page — never one request per render.
    expect(requestCount).toBeLessThanOrEqual(2);
  });
}

test("a deeply-equal body does not refetch when unrelated state changes", async ({
  page,
  initTestBed,
}) => {
  let requestCount = 0;
  await page.route(
    (url) => url.pathname === "/api/query",
    async (route) => {
      requestCount++;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ id: 1 }]),
      });
    },
  );

  // `when` holds the request until after mount so it cannot race the test bed's
  // API interceptor coming up — the same pattern as the other DataSource regressions.
  await initTestBed(`
    <Fragment var.armed="{false}" var.tick="{0}">
      <DataSource id="ds" url="/api/query" method="POST" when="{armed}"
        body="{{ sql: 'SELECT 1', params: [] }}" />
      <Button testId="arm-btn" label="Arm" onClick="armed = true" />
      <Button testId="tick-btn" label="Tick" onClick="tick++" />
      <Text testId="tick" value="{tick}" />
      <Text testId="loaded" value="{ds.loaded ? 'yes' : 'no'}" />
    </Fragment>
  `);

  await page.getByTestId("arm-btn").click();
  await expect(page.getByTestId("loaded")).toHaveText("yes");
  expect(requestCount).toEqual(1);

  // Re-render the tree a few times; the body is deeply equal every time, so the
  // loader must not issue another request.
  for (let i = 0; i < 3; i++) {
    await page.getByTestId("tick-btn").click();
  }
  await expect(page.getByTestId("tick")).toHaveText("3");
  expect(requestCount).toEqual(1);
});

test("a body whose value actually changes still refetches", async ({ page, initTestBed }) => {
  const bodies: any[] = [];
  await page.route(
    (url) => url.pathname === "/api/query",
    async (route) => {
      bodies.push(JSON.parse(route.request().postData() ?? "null"));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        // Response length tracks the request count so the UI can observe the refetch.
        body: JSON.stringify(bodies.map((_, i) => ({ id: i + 1 }))),
      });
    },
  );

  await initTestBed(`
    <Fragment var.armed="{false}" var.limit="{10}">
      <DataSource id="ds" url="/api/query" method="POST" when="{armed}"
        body="{{ sql: 'SELECT 1', opts: { limit: limit } }}" />
      <Button testId="arm-btn" label="Arm" onClick="armed = true" />
      <Button testId="bump-btn" label="Bump" onClick="limit = limit + 10" />
      <Text testId="count" value="{ds.loaded ? ds.value.length : 0}" />
    </Fragment>
  `);

  await page.getByTestId("arm-btn").click();
  await expect(page.getByTestId("count")).toHaveText("1");
  await page.getByTestId("bump-btn").click();
  await expect(page.getByTestId("count")).toHaveText("2");

  // The nested `opts.limit` change must reach the wire.
  expect(bodies.map((b) => b?.opts?.limit)).toEqual([10, 20]);
});
