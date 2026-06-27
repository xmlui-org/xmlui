import { expect, test } from "../../testing/fixtures";

test.describe("APICall foundation", () => {
  test("execute runs mockExecute and stores the last result", async ({ initTestBed, page }) => {
    await initTestBed(`
      <APICall
        id="saveTask"
        onMockExecute="$param"
        onSuccess="result => testState = result" />
      <Button label="Save" onClick="saveTask.execute('Ship runtime')" />
      <Text testId="loaded">Loaded: {saveTask.loaded ? 'yes' : 'no'}</Text>
      <Text testId="result">Result: {saveTask.lastResult || 'none'}</Text>
    `);

    await expect(page.getByTestId("loaded")).toHaveText("Loaded: no");
    await expect(page.getByTestId("result")).toHaveText("Result: none");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByTestId("loaded")).toHaveText("Loaded: yes");
    await expect(page.getByTestId("result")).toHaveText("Result: Ship runtime");
    await expect(page.getByTestId("__xmlui-test-state")).toHaveText("Ship runtime");
  });

  test("beforeRequest can cancel execution", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <APICall
        id="blocked"
        onBeforeRequest="testState = 'blocked'; false"
        onMockExecute="testState = 'executed'; true" />
      <Button label="Run" onClick="blocked.execute()" />
      <Text testId="loaded">Loaded: {blocked.loaded ? 'yes' : 'no'}</Text>
    `);

    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByTestId("loaded")).toHaveText("Loaded: no");
    await expect.poll(testStateDriver.testState).toEqual("blocked");
  });

  test("success invalidates a DataSource", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{1}">
        <DataSource id="stats" mockData="{{ count }}" />
        <APICall
          id="mutate"
          invalidates="stats"
          onMockExecute="count++; true" />
        <Text testId="count">Count: {stats.value.count}</Text>
        <Button label="Mutate" onClick="mutate.execute()" />
      </App>
    `);

    await expect(page.getByTestId("count")).toHaveText("Count: 1");
    await page.getByRole("button", { name: "Mutate" }).click();
    await expect(page.getByTestId("count")).toHaveText("Count: 2");
  });

  test("execute context exposes all parameters", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <APICall
        id="ctx"
        queryParams="{{ page: 1 }}"
        body="{{ active: true }}"
        headers="{{ 'x-test': 'yes' }}"
        onMockExecute="testState = $param + ':' + $params[1] + ':' + $queryParams.page + ':' + $requestBody.active + ':' + $requestHeaders['x-test']; true" />
      <Button label="Run" onClick="ctx.execute('first', 'second')" />
    `);

    await page.getByRole("button", { name: "Run" }).click();
    await expect.poll(testStateDriver.testState).toEqual("first:second:1:true:yes");
  });

  test("execute sends remote request, stores headers, and shows success notification", async ({
    initTestBed,
    page,
  }) => {
    let captured:
      | {
          method: string;
          header: string | undefined;
          body: unknown;
        }
      | undefined;
    await page.route("**/api/save?mode=full", async (route) => {
      const request = route.request();
      captured = {
        method: request.method(),
        header: request.headers()["x-api"],
        body: request.postDataJSON(),
      };
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json", "x-result": "saved" },
        body: JSON.stringify({ title: "Saved task" }),
      });
    });

    await initTestBed(`
      <APICall
        id="save"
        url="/api/save"
        method="post"
        queryParams="{{ mode: 'full' }}"
        headers="{{ 'x-api': 'yes' }}"
        body="{{ title: 'Saved task' }}"
        completedNotificationMessage="Saved" />
      <Button label="Save" onClick="save.execute()" />
      <Text testId="loaded">{save.loaded ? 'loaded' : 'pending'}</Text>
      <Text testId="result">{save.lastResult.title}</Text>
      <Text testId="header">{save.lastResponseHeaders['x-result']}</Text>
    `);

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByTestId("loaded")).toHaveText("loaded");
    await expect(page.getByTestId("result")).toHaveText("Saved task");
    await expect(page.getByTestId("header")).toHaveText("saved");
    await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();
    expect(captured).toMatchObject({
      method: "POST",
      header: "yes",
      body: { title: "Saved task" },
    });
  });

  test("confirmation can cancel or allow execution", async ({ initTestBed, page }) => {
    let requests = 0;
    await page.route("**/api/confirm", async (route) => {
      requests += 1;
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      });
    });

    await initTestBed(`
      <APICall
        id="confirmed"
        url="/api/confirm"
        confirmTitle="Confirm"
        confirmMessage="Proceed?" />
      <Button label="Run" onClick="confirmed.execute()" />
      <Text testId="loaded">{confirmed.loaded ? 'loaded' : 'pending'}</Text>
    `);

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toContain("Proceed?");
      await dialog.dismiss();
    });
    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByTestId("loaded")).toHaveText("pending");
    expect(requests).toBe(0);

    page.once("dialog", async (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByTestId("loaded")).toHaveText("loaded");
    expect(requests).toBe(1);
  });

  test("errors update lastError, fire error event, and show error notification", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <APICall
        id="failing"
        url="/api/failing"
        errorNotificationMessage="Failed"
        onError="error => testState = error.statusCode" />
      <Button label="Run" onClick="failing.execute().catch(e => null)" />
      <Text testId="error">{failing.lastError ? failing.lastError.statusCode : 'none'}</Text>
    `);

    await page.route("**/api/failing", async (route) => {
      await route.fulfill({
        status: 400,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Bad request" }),
      });
    });

    await page.getByRole("button", { name: "Run" }).click();
    await expect(page.getByTestId("error")).toHaveText("400");
    await expect.poll(testStateDriver.testState).toEqual(400);
    await expect(page.getByText("Failed")).toBeVisible();
  });

  test("deferred mode polls status endpoint until completion", async ({ initTestBed, page }) => {
    let statusRequests = 0;
    await page.route("**/api/start", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operationId: "op-1" }),
      });
    });
    await page.route("**/api/status/op-1", async (route) => {
      statusRequests += 1;
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(statusRequests < 2
          ? { status: "running", progress: 50 }
          : { status: "completed", progress: 100, message: "done" }),
      });
    });

    const { testStateDriver } = await initTestBed(`
      <APICall
        id="deferred"
        url="/api/start"
        deferredMode="{true}"
        statusUrl="/api/status/op-1"
        pollIntervalInMilliseconds="{10}"
        onStatusUpdate="(statusData, progress) => testState = 'progress:' + progress"
        onPollingComplete="(statusData, reason) => testState = reason + ':' + statusData.message" />
      <Button label="Start" onClick="deferred.execute()" />
      <Text testId="loaded">{deferred.loaded ? 'loaded' : 'pending'}</Text>
      <Text testId="polling">{deferred.isPolling ? 'polling' : 'idle'}</Text>
      <Text testId="result">{deferred.lastResult.message || 'none'}</Text>
    `);

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByTestId("loaded")).toHaveText("loaded");
    await expect(page.getByTestId("polling")).toHaveText("idle");
    await expect(page.getByTestId("result")).toHaveText("done");
    await expect.poll(testStateDriver.testState).toEqual("completed:done");
    expect(statusRequests).toBeGreaterThanOrEqual(2);
  });

  test("cancel stops deferred polling and calls cancelUrl", async ({ initTestBed, page }) => {
    let cancelRequests = 0;
    await page.route("**/api/start-cancel", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ operationId: "cancel-1" }),
      });
    });
    await page.route("**/api/status/cancel-1", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "running", progress: 10 }),
      });
    });
    await page.route("**/api/cancel/cancel-1", async (route) => {
      cancelRequests += 1;
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cancelled: true }),
      });
    });

    await initTestBed(`
      <APICall
        id="job"
        url="/api/start-cancel"
        deferredMode="{true}"
        statusUrl="/api/status/cancel-1"
        pollIntervalInMilliseconds="{50}"
        cancelUrl="/api/cancel/cancel-1" />
      <Button label="Start" onClick="job.execute()" />
      <Button label="Cancel" onClick="job.cancel()" />
      <Text testId="polling">{job.isPolling ? 'polling' : 'idle'}</Text>
    `);

    await page.getByRole("button", { name: "Start" }).click();
    await expect(page.getByTestId("polling")).toHaveText("polling");
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByTestId("polling")).toHaveText("idle");
    expect(cancelRequests).toBe(1);
  });

  test("Actions.callApi supports notifications and invalidates DataSource refs", async ({
    initTestBed,
    page,
  }) => {
    let value = 1;
    await page.route("**/api/actions-source", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ value }),
      });
    });
    await page.route("**/api/actions-mutate", async (route) => {
      value += 1;
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "changed" }),
      });
    });

    await initTestBed(`
      <App var.result="{{ message: 'none' }}">
        <DataSource id="source" url="/api/actions-source" />
        <Button
          label="Mutate"
          onClick="let apiResult = Actions.callApi({ url: '/api/actions-mutate', method: 'post', invalidates: 'source', completedNotificationMessage: 'Action' }); result = apiResult" />
        <Text testId="value">{source.value.value}</Text>
        <Text testId="result">{result.message || 'none'}</Text>
      </App>
    `);

    await expect(page.getByTestId("value")).toHaveText("1");
    await page.getByRole("button", { name: "Mutate" }).click();
    await expect(page.getByTestId("value")).toHaveText("2");
    await expect(page.getByTestId("result")).toHaveText("changed");
    await expect(page.getByRole("status").filter({ hasText: "Action" })).toBeVisible();
  });

  test("optimisticValue updates invalidated DataSource before the request settles", async ({
    initTestBed,
    page,
  }) => {
    let value = "server";
    await page.route("**/api/optimistic-source", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: value }),
      });
    });
    await page.route("**/api/optimistic-mutate", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      value = "saved";
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      });
    });

    await initTestBed(`
      <DataSource id="items" url="/api/optimistic-source" />
      <APICall
        id="save"
        url="/api/optimistic-mutate"
        method="post"
        invalidates="items"
        optimisticValue="{{ label: 'optimistic' }}" />
      <Button label="Save" onClick="save.execute()" />
      <Text testId="label">{items.value.label}</Text>
    `);

    await expect(page.getByTestId("label")).toHaveText("server");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByTestId("label")).toHaveText("optimistic");
    await expect(page.getByTestId("label")).toHaveText("saved");
  });
});
