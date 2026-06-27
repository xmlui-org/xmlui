import { expect, test } from "../../testing/fixtures";

const nestedCounterSource =
  "&lt;App var.count=&quot;{0}&quot;&gt;" +
  "&lt;Text testId=&quot;nested-count&quot;&gt;Nested: {count}&lt;/Text&gt;" +
  "&lt;Button testId=&quot;nested-button&quot; onClick=&quot;count++&quot;&gt;Increment nested&lt;/Button&gt;" +
  "&lt;/App&gt;";

test.describe("NestedApp foundation", () => {
  test("renders nested XMLUI source and keeps its local state isolated", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.count="{10}">
        <Text testId="outer-count">Outer: {count}</Text>
        <Button testId="outer-button" onClick="count++">Increment outer</Button>
        <NestedApp testId="nested" app="{'${nestedCounterSource}'}" />
      </App>
    `);

    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 10");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 0");

    await page.getByTestId("nested-button").click();
    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 10");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");

    await page.getByTestId("outer-button").click();
    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 11");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");
  });

  test("applies the height prop to the nested app container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" height="120px" app="{'&lt;App&gt;&lt;Text&gt;Nested&lt;/Text&gt;&lt;/App&gt;'}" />
      </App>
    `);

    await expect(page.getByTestId("nested")).toHaveCSS("height", "120px");
  });

  test("shows a compile error inside the nested app boundary", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" app="{'&lt;App&gt;&lt;UnknownNestedComponent /&gt;&lt;/App&gt;'}" />
      </App>
    `);

    await expect(page.getByTestId("nested-error")).toContainText("Unknown XMLUI component");
  });

  test("refreshVersion remounts the nested app without changing parent state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.outer="{0}" var.version="{1}">
        <Text testId="outer">Outer: {outer}</Text>
        <Button testId="outer-inc" onClick="outer++">Increment outer</Button>
        <Button testId="refresh" onClick="version++">Refresh nested</Button>
        <NestedApp testId="nested" refreshVersion="{version}" app="{'${nestedCounterSource}'}" />
      </App>
    `);

    await page.getByTestId("nested-button").click();
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");
    await page.getByTestId("outer-inc").click();
    await expect(page.getByTestId("outer")).toHaveText("Outer: 1");

    await page.getByTestId("refresh").click();
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 0");
    await expect(page.getByTestId("outer")).toHaveText("Outer: 1");
  });

  test("nested route navigation is isolated from the browser URL and parent route", async ({
    initTestBed,
    page,
  }) => {
    const routedNestedSource =
      "&lt;App&gt;" +
      "&lt;NavLink testId=&quot;nested-go&quot; to=&quot;/nested&quot;&gt;Nested&lt;/NavLink&gt;" +
      "&lt;Text testId=&quot;nested-path&quot;&gt;Path: {$pathname}&lt;/Text&gt;" +
      "&lt;Pages fallbackPath=&quot;/&quot;&gt;" +
      "&lt;Page url=&quot;/&quot;&gt;&lt;Text testId=&quot;nested-page&quot;&gt;Nested home&lt;/Text&gt;&lt;/Page&gt;" +
      "&lt;Page url=&quot;/nested&quot;&gt;&lt;Text testId=&quot;nested-page&quot;&gt;Nested route&lt;/Text&gt;&lt;/Page&gt;" +
      "&lt;/Pages&gt;" +
      "&lt;/App&gt;";

    await initTestBed(`
      <App>
        <NavLink testId="outer-go" to="/outer">Outer</NavLink>
        <Text testId="outer-path">Outer: {$pathname}</Text>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="outer-page">Outer home</Text>
            <NestedApp testId="nested" app="{'${routedNestedSource}'}" />
          </Page>
          <Page url="/outer">
            <Text testId="outer-page">Outer route</Text>
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.getByTestId("outer-path")).toHaveText("Outer: /");
    await expect(page.getByTestId("nested-path")).toHaveText("Path: /");
    await page.getByTestId("nested-go").click();
    await expect(page.getByTestId("nested-path")).toHaveText("Path: /nested");
    await expect(page.getByTestId("nested-page")).toHaveText("Nested route");
    await expect(page.getByTestId("outer-path")).toHaveText("Outer: /");
    expect(new URL(page.url()).hash).toBe("");

    await page.getByTestId("outer-go").click();
    await expect(page.getByTestId("outer-page")).toHaveText("Outer route");
  });

  test("renders nested app with supplied component definitions", async ({ initTestBed, page }) => {
    const source =
      "&lt;App&gt;" +
      "&lt;Panel title=&quot;Supplied&quot; /&gt;" +
      "&lt;/App&gt;";
    const componentSource =
      "&lt;Component name=&quot;Panel&quot;&gt;" +
      "&lt;Text testId=&quot;nested-panel&quot;&gt;Panel: {$props.title}&lt;/Text&gt;" +
      "&lt;/Component&gt;";

    await initTestBed(`
      <App>
        <NestedApp testId="nested" app="{'${source}'}" components="{['${componentSource}']}" />
      </App>
    `);

    await expect(page.getByTestId("nested-panel")).toHaveText("Panel: Supplied");
  });

  test("passes config globals and tone into the nested app boundary", async ({ initTestBed, page }) => {
    const source =
      "&lt;App&gt;" +
      "&lt;Text testId=&quot;nested-global&quot;&gt;{hostName} / {name}&lt;/Text&gt;" +
      "&lt;/App&gt;";

    await initTestBed(`
      <App global.hostName="Outer Host" global.name="Outer App">
        <Text testId="outer-global">{hostName} / {name}</Text>
        <NestedApp
          testId="nested"
          activeTone="dark"
          config="{{ appGlobals: { hostName: 'Nested Host' }, name: 'Nested App' }}"
          app="{'${source}'}"
        />
      </App>
    `);

    await expect(page.getByTestId("outer-global")).toHaveText("Outer Host / Outer App");
    await expect(page.getByTestId("nested-global")).toHaveText("Nested Host / Nested App");
    await expect(page.getByTestId("nested")).toHaveAttribute("data-xmlui-tone", "dark");
  });

  test("renders the framed code view shell and reset remounts the nested app", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp
          testId="nested"
          title="Nested demo"
          withFrame="{true}"
          splitView="{true}"
          initiallyShowCode="{true}"
          allowReset="{true}"
          app="{'${nestedCounterSource}'}"
        />
      </App>
    `);

    await expect(page.getByText("Nested demo")).toBeVisible();
    await expect(page.getByTestId("nested-code")).toContainText("nested-count");

    await page.getByTestId("nested-show-app").click();
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 0");
    await page.getByTestId("nested-button").click();
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");

    await page.getByTestId("nested-reset").click();
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 0");
  });
});
