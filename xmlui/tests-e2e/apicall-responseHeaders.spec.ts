import { expect, test } from "../src/testing/fixtures";

test("APICall exposes lastResponseHeaders after successful execution", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<Fragment>
      <APICall id="api" url="/api/action" method="post" />
      <Button testId="trigger" onClick="api.execute()" label="Go" />
      <Text testId="header-output" value="{api.loaded ? (api.lastResponseHeaders['x-custom-header'] ?? 'missing') : 'loading'}" />
    </Fragment>`,
    {
      apiInterceptor: {
        operations: {
          "post-action": {
            url: "/api/action",
            method: "post",
            handler: `
              $headerService.setHeader('x-custom-header', 'hello-world');
              return { ok: true };
            `,
          },
        },
      },
    },
  );

  await page.getByTestId("trigger").click();
  await expect(page.getByTestId("header-output")).toHaveText("hello-world", { timeout: 5000 });
});

test("APICall lastResponseHeaders includes content-type from server", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<Fragment>
      <APICall id="api" url="/api/action" method="post" />
      <Button testId="trigger" onClick="api.execute()" label="Go" />
      <Text testId="header-output" value="{api.loaded ? (api.lastResponseHeaders['content-type'] ?? 'missing') : 'loading'}" />
    </Fragment>`,
    {
      apiInterceptor: {
        operations: {
          "post-action": {
            url: "/api/action",
            method: "post",
            handler: `return { data: 'value' };`,
          },
        },
      },
    },
  );

  await page.getByTestId("trigger").click();
  await expect(page.getByTestId("header-output")).toContainText("application/json", { timeout: 5000 });
});

test("APICall lastResponseHeaders accessible in markup via binding", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `<Fragment>
      <APICall id="api" url="/api/action" method="post" />
      <Button testId="trigger" onClick="api.execute()" label="Go" />
      <Text testId="header-value" value="{api.loaded ? api.lastResponseHeaders['x-result-id'] : 'pending'}" />
    </Fragment>`,
    {
      apiInterceptor: {
        operations: {
          "post-action": {
            url: "/api/action",
            method: "post",
            handler: `
              $headerService.setHeader('x-result-id', '99');
              return { ok: true };
            `,
          },
        },
      },
    },
  );

  await page.getByTestId("trigger").click();
  await expect(page.getByTestId("header-value")).toHaveText("99", { timeout: 5000 });
});

test("APICall lastResponseHeaders updated after re-execution", async ({
  page,
  initTestBed,
}) => {
  const { testStateDriver } = await initTestBed(
    `<Fragment>
      <APICall id="api" url="/api/action" method="post" onSuccess="testState = (testState || 0) + 1" />
      <Button testId="trigger" onClick="api.execute()" label="Go" />
      <Text testId="header-output" value="{api.loaded ? (api.lastResponseHeaders['x-call-count'] ?? '0') : '0'}" />
    </Fragment>`,
    {
      apiInterceptor: {
        initialize: "$state.count = 0;",
        operations: {
          "post-action": {
            url: "/api/action",
            method: "post",
            handler: `
              $state.count = ($state.count || 0) + 1;
              $headerService.setHeader('x-call-count', String($state.count));
              return { count: $state.count };
            `,
          },
        },
      },
    },
  );

  await page.getByTestId("trigger").click();
  await expect.poll(testStateDriver.testState, { timeout: 5000 }).toBe(1);
  await expect(page.getByTestId("header-output")).toHaveText("1", { timeout: 5000 });

  await page.getByTestId("trigger").click();
  await expect.poll(testStateDriver.testState, { timeout: 5000 }).toBe(2);
  await expect(page.getByTestId("header-output")).toHaveText("2", { timeout: 5000 });
});

test("APICall lastResponseHeaders is undefined before first execution", async ({
  page,
  initTestBed,
}) => {
  const { testStateDriver } = await initTestBed(
    `<Fragment>
      <APICall id="api" url="/api/action" method="post" />
      <Button testId="check" onClick="testState = api.lastResponseHeaders === undefined ? 'undefined' : 'defined'" label="Check" />
    </Fragment>`,
    {
      apiInterceptor: {
        operations: {
          "post-action": {
            url: "/api/action",
            method: "post",
            handler: `return { ok: true };`,
          },
        },
      },
    },
  );

  await page.getByTestId("check").click();
  await expect.poll(testStateDriver.testState, { timeout: 5000 }).toBe("undefined");
});
