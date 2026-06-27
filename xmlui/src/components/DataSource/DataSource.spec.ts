import { expect, test } from "../../testing/fixtures";

test.describe("DataSource foundation", () => {
  test("mockData is visible through component APIs", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DataSource id="tasks" mockData="{[
        { id: 1, title: 'Build runtime' },
        { id: 2, title: 'Write tests' }
      ]}" />
      <Text testId="loaded">Loaded: {tasks.loaded ? 'yes' : 'no'}</Text>
      <Text testId="first">{tasks.value[0].title}</Text>
    `);

    await expect(page.getByTestId("loaded")).toHaveText("Loaded: yes");
    await expect(page.getByTestId("first")).toHaveText("Build runtime");
  });

  test("refetch updates rendered API values", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{1}">
        <DataSource id="stats" mockData="{{ count }}" />
        <Text testId="count">Count: {stats.value.count}</Text>
        <Button label="Refresh" onClick="count++; stats.refetch()" />
      </App>
    `);

    await expect(page.getByTestId("count")).toHaveText("Count: 1");
    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByTestId("count")).toHaveText("Count: 2");
  });

  test("fetch event receives request context variables", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <DataSource
        id="ctx"
        url="/api/items"
        method="post"
        queryParams="{{ page: 2 }}"
        body="{{ active: true }}"
        headers="{{ 'x-test': 'yes' }}"
        onFetch="testState = $method + ':' + $url + ':' + $queryParams.page + ':' + $requestBody.active + ':' + $requestHeaders['x-test']; 'ok'" />
      <Text testId="message">{ctx.value}</Text>
    `);

    await expect(page.getByTestId("message")).toHaveText("ok");
    await expect.poll(testStateDriver.testState).toEqual("post:/api/items:2:true:yes");
  });

  test("resultSelector and transformResult shape the published value", async ({ initTestBed, page }) => {
    await initTestBed(`
      <DataSource
        id="selected"
        mockData="{{ payload: { items: ['alpha', 'beta'] } }}"
        resultSelector="payload.items"
        transformResult="{items => items.join(', ')}" />
      <Text testId="value">{selected.value}</Text>
    `);

    await expect(page.getByTestId("value")).toHaveText("alpha, beta");
  });

  test("network load exposes lifecycle status, response headers, and loaded event", async ({
    initTestBed,
    page,
  }) => {
    await page.route("**/api/lifecycle", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json", "x-source": "route" },
        body: JSON.stringify({ message: "ready" }),
      });
    });

    const { testStateDriver } = await initTestBed(`
      <DataSource id="remote" url="/api/lifecycle" onLoaded="(value, isRefetch) => testState = value.message + ':' + isRefetch" />
      <Text testId="loaded">{remote.loaded ? 'loaded' : 'pending'}</Text>
      <Text testId="message">{remote.value.message}</Text>
      <Text testId="header">{remote.responseHeaders['x-source']}</Text>
      <Text testId="error">{remote.error ? 'error' : 'none'}</Text>
    `);

    await expect(page.getByTestId("loaded")).toHaveText("loaded");
    await expect(page.getByTestId("message")).toHaveText("ready");
    await expect(page.getByTestId("header")).toHaveText("route");
    await expect(page.getByTestId("error")).toHaveText("none");
    await expect.poll(testStateDriver.testState).toEqual("ready:false");
  });

  test("network error exposes error state and fires error event", async ({ initTestBed, page }) => {
    await page.route("**/api/failure", async (route) => {
      await route.fulfill({
        status: 500,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "Nope" }),
      });
    });

    const { testStateDriver } = await initTestBed(`
      <DataSource id="broken" url="/api/failure" onError="error => testState = error.statusCode + ':' + error.response.message" />
      <Text testId="loaded">{broken.loaded ? 'loaded' : 'not-loaded'}</Text>
      <Text testId="error">{broken.error ? broken.error.statusCode + ':' + broken.error.response.message : 'none'}</Text>
    `);

    await expect(page.getByTestId("loaded")).toHaveText("not-loaded");
    await expect(page.getByTestId("error")).toHaveText("500:Nope");
    await expect.poll(testStateDriver.testState).toEqual("500:Nope");
  });

  test("request builder sends method, query params, headers, credentials, and JSON body", async ({
    initTestBed,
    page,
  }) => {
    let captured:
      | {
          method: string;
          url: string;
          header: string | undefined;
          body: unknown;
        }
      | undefined;

    await page.route("**/api/request?term=xmlui", async (route) => {
      const request = route.request();
      captured = {
        method: request.method(),
        url: request.url(),
        header: request.headers()["x-test"],
        body: request.postDataJSON(),
      };
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ok: true }),
      });
    });

    await initTestBed(`
      <DataSource
        id="remote"
        url="/api/request"
        method="post"
        queryParams="{{ term: 'xmlui' }}"
        headers="{{ 'x-test': 'yes' }}"
        credentials="same-origin"
        body="{{ count: 3 }}" />
      <Text testId="ok">{remote.value.ok ? 'ok' : 'no'}</Text>
    `);

    await expect(page.getByTestId("ok")).toHaveText("ok");
    expect(captured).toMatchObject({
      method: "POST",
      header: "yes",
      body: { count: 3 },
    });
    expect(captured?.url).toContain("/api/request?term=xmlui");
  });

  test("polling refetches remote data and marks refetch loads", async ({ initTestBed, page }) => {
    let requests = 0;
    await page.route("**/api/polling", async (route) => {
      requests += 1;
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count: requests }),
      });
    });

    const { testStateDriver } = await initTestBed(`
      <DataSource
        id="polling"
        url="/api/polling"
        pollIntervalInSeconds="{0.05}"
        onLoaded="(value, isRefetch) => testState = value.count + ':' + isRefetch" />
      <Text testId="count">{polling.value.count}</Text>
    `);

    await expect.poll(async () => Number(await page.getByTestId("count").textContent())).toBeGreaterThanOrEqual(2);
    await expect.poll(async () => {
      const state = await testStateDriver.testState();
      return typeof state === "string" && state.endsWith(":true");
    }).toBe(true);
  });

  test("older in-flight loads cannot overwrite a newer refetch result", async ({
    initTestBed,
    page,
  }) => {
    let requests = 0;
    await page.route("**/api/stale", async (route) => {
      requests += 1;
      const current = requests;
      if (current === 1) {
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ label: current === 1 ? "slow" : "fresh" }),
      });
    });

    await initTestBed(`
      <DataSource id="stale" url="/api/stale" />
      <Button label="Refresh" onClick="stale.refetch()" />
      <Text testId="label">{stale.value.label || 'pending'}</Text>
    `);

    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.getByTestId("label")).toHaveText("fresh");
    await page.waitForTimeout(200);
    await expect(page.getByTestId("label")).toHaveText("fresh");
  });

  test("dataType parses text, csv, and sql-compatible text responses", async ({
    initTestBed,
    page,
  }) => {
    await page.route("**/api/plain", async (route) => {
      await route.fulfill({ status: 200, body: "plain text" });
    });
    await page.route("**/api/csv?filter=active", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "text/csv" },
        body: 'name,value\n"alpha, one",1\nbeta,2',
      });
    });
    await page.route("**/api/sql", async (route) => {
      await route.fulfill({ status: 200, body: "select 1" });
    });

    await initTestBed(`
      <DataSource id="plain" url="/api/plain" dataType="text" />
      <DataSource id="rows" url="/api/csv" queryParams="{{ filter: 'active' }}" dataType="csv" />
      <DataSource id="sql" url="/api/sql" dataType="sql" />
      <Text testId="plain">{plain.value}</Text>
      <Text testId="csv">{rows.value[0].name}:{rows.value[1].value}</Text>
      <Text testId="sql">{sql.value}</Text>
    `);

    await expect(page.getByTestId("plain")).toHaveText("plain text");
    await expect(page.getByTestId("csv")).toHaveText("alpha, one:2");
    await expect(page.getByTestId("sql")).toHaveText("select 1");
  });

  test("page selectors expose previous and next page API values", async ({
    initTestBed,
    page,
  }) => {
    await page.route("**/api/page", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: ["first"],
          paging: { previous: null, next: { cursor: "next-1" } },
        }),
      });
    });

    await initTestBed(`
      <DataSource
        id="paged"
        url="/api/page"
        resultSelector="items"
        prevPageSelector="paging.previous"
        nextPageSelector="paging.next" />
      <Text testId="items">{paged.value[0]}</Text>
      <Text testId="prev">{paged.hasPrevPage ? 'prev' : 'no-prev'}</Text>
      <Text testId="next">{paged.hasNextPage ? paged.nextPage.cursor : 'no-next'}</Text>
    `);

    await expect(page.getByTestId("items")).toHaveText("first");
    await expect(page.getByTestId("prev")).toHaveText("no-prev");
    await expect(page.getByTestId("next")).toHaveText("next-1");
  });

  test("structuralSharing keeps unchanged result references across refetch", async ({
    initTestBed,
    page,
  }) => {
    let requests = 0;
    await page.route("**/api/shared-structure", async (route) => {
      requests += 1;
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: [{ id: 1, label: "stable" }] }),
      });
    });

    await initTestBed(`
      <App var.previousValue="{null}" var.shareState="{''}">
        <DataSource
          id="shared"
          url="/api/shared-structure" />
        <Button label="Check sharing" onClick="previousValue = shared.value; shared.refetch(); delay(100); shareState = previousValue === shared.value ? 'same' : 'different'" />
        <Text testId="label">{shared.value.items[0].label}</Text>
        <Text testId="share">{shareState}</Text>
      </App>
    `);

    await expect(page.getByTestId("label")).toHaveText("stable");
    await page.getByRole("button", { name: "Check sharing" }).click();
    await expect(page.getByTestId("share")).toHaveText("same");
    expect(requests).toBeGreaterThanOrEqual(2);
  });
});
