import { expect, test } from "../src/testing/fixtures";

test("DataSource exposes responseHeaders after successful fetch", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
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

  await expect(page.getByTestId("test-state-view-testid")).not.toHaveText("null", {
    timeout: 5000,
  });
  const stateText = await page.getByTestId("test-state-view-testid").textContent();
  const headers = JSON.parse(stateText!);
  expect(headers["x-custom-header"]).toBe("hello-world");
});

test("DataSource responseHeaders includes content-type from server", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
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

  await expect(page.getByTestId("test-state-view-testid")).not.toHaveText("null", {
    timeout: 5000,
  });
  const stateText = await page.getByTestId("test-state-view-testid").textContent();
  const headers = JSON.parse(stateText!);
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
  await initTestBed(
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
  const stateEl = page.getByTestId("test-state-view-testid");
  await expect(stateEl).toHaveText(/^"\d+"$/, { timeout: 10000 });
  const initialText = await stateEl.textContent();
  const initialCount = parseInt(initialText!.replace(/"/g, ""), 10);

  // Trigger a refetch
  await page.getByTestId("refetch-btn").click();

  // Headers should be incremented by exactly 1 after the refetch
  await expect(stateEl).toHaveText(`"${initialCount + 1}"`, { timeout: 10000 });
});

test("DataSource onLoaded receives responseHeaders on the datasource state", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
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

  await expect(page.getByTestId("test-state-view-testid")).toHaveText("\"100\"", {
    timeout: 5000,
  });
});
