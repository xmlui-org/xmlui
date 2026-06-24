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
});

test.describe("DataSource old-suite transfer debt", () => {
  test.fixme("copy literal old API-interceptor, notification, paging, CSV, SQL, and structural-sharing tests");
});
