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
});

test.describe("APICall old-suite transfer debt", () => {
  test.fixme("copy literal old API-interceptor, confirmation, optimistic update, deferred, and notification tests");
});
