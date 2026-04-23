import { expect, test } from "../src/testing/fixtures";

test("DataSource exposes responseHeaders after successful fetch", async ({
  initTestBed,
}) => {
  const { testStateDriver } = await initTestBed(
    `<DataSource url="/api/data" id="ds" onLoaded="testState = ds.responseHeaders" />`,
    {
      apiInterceptor: {
        operations: {
          "get-data": {
            url: "/api/data",
            method: "get",
            handler: `
              $headerService.setHeader('x-custom-header', 'hello-world');
              return { result: 'ok' };
            `,
          },
        },
      },
    },
  );

  await expect.poll(testStateDriver.testState, { timeout: 5000 }).not.toBeNull();
  const headers = await testStateDriver.testState();
  expect(headers["x-custom-header"]).toBe("hello-world");
});

test("DataSource responseHeaders includes content-type from server", async ({
  initTestBed,
}) => {
  const { testStateDriver } = await initTestBed(
    `<DataSource url="/api/data" id="ds" onLoaded="testState = ds.responseHeaders" />`,
    {
      apiInterceptor: {
        operations: {
          "get-data": {
            url: "/api/data",
            method: "get",
            handler: `return ['item1', 'item2'];`,
          },
        },
      },
    },
  );

  await expect.poll(testStateDriver.testState, { timeout: 5000 }).not.toBeNull();
  const headers = await testStateDriver.testState();
  expect(headers["content-type"]).toContain("application/json");
});

test("DataSource responseHeaders accessible in markup via binding", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `
    <DataSource url="/api/data" id="ds" />
    <Text testId="header-value" value="{ds.loaded ? ds.responseHeaders['x-pagination-total'] : 'loading'}" />
    `,
    {
      apiInterceptor: {
        operations: {
          "get-data": {
            url: "/api/data",
            method: "get",
            handler: `
              $headerService.setHeader('x-pagination-total', '42');
              return [];
            `,
          },
        },
      },
    },
  );

  await expect(page.getByTestId("header-value")).toHaveText("42", { timeout: 5000 });
});

test("DataSource responseHeaders updated on refetch", async ({ page, initTestBed }) => {
  const { testStateDriver } = await initTestBed(
    `
    <DataSource url="/api/data" id="ds" onLoaded="testState = ds.responseHeaders['x-request-count']" />
    <Button testId="refetch-btn" onClick="ds.refetch()" label="Refetch" />
    `,
    {
      apiInterceptor: {
        initialize: "$state.count = 0;",
        operations: {
          "get-data": {
            url: "/api/data",
            method: "get",
            handler: `
              $state.count = ($state.count || 0) + 1;
              $headerService.setHeader('x-request-count', String($state.count));
              return { items: [], count: $state.count };
            `,
          },
        },
      },
    },
  );

  // Wait for the initial load and capture the starting count
  await expect.poll(testStateDriver.testState, { timeout: 10000 }).toMatch(/^\d+$/);

  // Wait for the count to stabilize. React StrictMode and dependency-tracking
  // re-renders can cause the DataSource to fire a few times during initial
  // mount; we want the snapshot taken *after* that quiescence, otherwise the
  // "exactly +1 after refetch" assertion can race against an in-flight load.
  let stableCount = "";
  await expect
    .poll(
      async () => {
        const current = String(await testStateDriver.testState());
        if (current === stableCount) return true;
        stableCount = current;
        return false;
      },
      { timeout: 10000, intervals: [200, 200, 200, 200, 500] },
    )
    .toBe(true);
  const initialCount = parseInt(stableCount, 10);

  // Trigger a refetch
  await page.getByTestId("refetch-btn").click();

  // After the explicit refetch the header counter must advance by at least 1.
  // We allow a higher value to absorb any additional unrelated refetches that
  // React's effect system may issue under load (StrictMode double-invoke etc.),
  // since the contract under test is "responseHeaders are updated on refetch",
  // not "exactly one extra request is made".
  await expect
    .poll(
      async () => parseInt(String(await testStateDriver.testState()), 10),
      { timeout: 10000 },
    )
    .toBeGreaterThan(initialCount);
});

test("DataSource onLoaded receives responseHeaders on the datasource state", async ({
  initTestBed,
}) => {
  const { testStateDriver } = await initTestBed(
    `
    <DataSource
      url="/api/data"
      id="ds"
      onLoaded="testState = ds.responseHeaders['x-total-count']"
    />
    `,
    {
      apiInterceptor: {
        operations: {
          "get-data": {
            url: "/api/data",
            method: "get",
            handler: `
              $headerService.setHeader('x-total-count', '100');
              return [1, 2, 3];
            `,
          },
        },
      },
    },
  );

  await expect.poll(testStateDriver.testState, { timeout: 5000 }).toBe("100");
});
