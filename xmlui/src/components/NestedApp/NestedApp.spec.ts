import { expect, test } from "../../testing/fixtures";
import { readFileSync } from "node:fs";

const heroAppSource = readFileSync(
  new URL("../../../../website/src/components/home/HeroApp.xmlui", import.meta.url),
  "utf8",
);
const xmluiHeroTheme = {
  id: "xmlui-hero-theme",
  name: "XMLUI Hero Theme",
  extends: "xmlui",
  color: "$color-primary-500",
  themeVars: {
    "color-surface": "rgb(111, 110, 119)",
    "marginTop-CodeBlock": "0",
    "marginBottom-CodeBlock": "0",
    "backgroundColor-CodeBlock": "$color-surface-100",
    "borderRadius-CodeBlock": "0",
    "border-CodeBlock": "0",
  },
  resources: {},
};

const nestedCounterSource =
  "&lt;App var.count=&quot;{0}&quot;&gt;" +
  "&lt;Text testId=&quot;nested-count&quot;&gt;Nested: {count}&lt;/Text&gt;" +
  "&lt;Button testId=&quot;nested-button&quot; onClick=&quot;count++&quot;&gt;Increment nested&lt;/Button&gt;" +
  "&lt;/App&gt;";

const pickThemeSource = escapeNestedSource(`
<App var.theme="default">
  <VStack gap="$space-4" padding="$space-4">
    <HStack verticalAlignment="center">
      <Text variant="strong">Theme</Text>
      <Select initialValue="default" width="160px" onDidChange="(v) => theme = v">
        <Option value="default" label="Default" />
        <Option value="earthtone" label="Earthtone" />
      </Select>
    </HStack>
    <Theme>
      <VStack gap="$space-4">
        <HStack gap="$space-2">
          <Button label="Primary" />
          <Button label="Secondary" themeColor="secondary" />
          <Button label="Outlined" variant="outlined" />
        </HStack>
        <HStack gap="$space-4" verticalAlignment="center">
          <Badge value="Active" />
          <Badge value="Pending" variant="pill" />
          <Checkbox label="Enable notifications" initialValue="{true}" />
        </HStack>
        <ProgressBar value="0.6" />
        <TextBox placeholder="Enter your name" label="Name" />
      </VStack>
    </Theme>
  </VStack>
</App>
`);

const teamListSource = escapeNestedSource(`
<App>
  <List data="/api/users">
    <Text testId="user-{$item.id}">{$item.username}</Text>
  </List>
</App>
`);
const tubeTableSource = escapeNestedSource(`
<App>
  <Table data="https://api.example.test/line/mode/tube/status" testId="tube-table">
    <Column bindTo="name" />
    <Column header="status">
      {$item.lineStatuses[0].statusSeverityDescription}
    </Column>
  </Table>
</App>
`);
const transformedTableSource = escapeNestedSource(`
<App>
  <TransformedRows />
</App>
`);
const transformedRowsComponentSource = escapeNestedSource(`
<Component name="TransformedRows">
  <DataSource
    id="rows"
    url="https://api.example.test/raw-rows"
    transformResult="{transformRows}"
  />
  <Table data="{rows}" testId="transformed-table">
    <Column bindTo="name" />
    <Column bindTo="zone" />
  </Table>
</Component>
`);

const teamApi = {
  apiUrl: "/api",
  operations: {
    "get-users": {
      url: "/users",
      method: "get",
      handler:
        "return [{ id: 1, username: String.fromCharCode(67,111,100,101,114,32,71,97,108) }, { id: 2, username: String.fromCharCode(84,101,99,104,32,78,105,110,106,97) }]",
    },
  },
};
const teamApiExpression = `{JSON.parse('${JSON.stringify(teamApi).replace(/"/g, "&quot;")}')}`;
const decoupledDataSourceSource = escapeNestedSource(`
<App>
  <DataSource id="apiResult" url="/api/names-with-activity-decoupled" />
  <APICall
    id="addItem"
    method="post"
    url="/api/names-with-activity-decoupled"
    invalidates="/api/names-with-activity-decoupled"
  />

  <variable name="items" value="{apiResult.value ?? []}" />

  <Text testId="datasource-count">DataSource count: {(apiResult.value ?? []).length}</Text>
  <Text testId="items-count">items count: {items.length}</Text>

  <Button
    testId="snapshot"
    label="Take snapshot of active items"
    onClick="items = (apiResult.value ?? []).filter(i => i.active)"
  />
  <Button
    testId="add-active"
    label="Add active item"
    onClick="addItem.execute()"
  />

  <Items data="{items}">
    <Text testId="item-{$item.id}">{$item.name}</Text>
  </Items>
</App>
`);
const decoupledDataSourceApi = {
  apiUrl: "/api",
  initialize:
    "$state.items = [{ id: 1, name: String.fromCharCode(65,110,110,97), active: true }, { id: 2, name: String.fromCharCode(72,101,108,103,97), active: false }, { id: 3, name: String.fromCharCode(66,111,98), active: true }, { id: 4, name: String.fromCharCode(74,111,104,110), active: false }]",
  operations: {
    "get-names-with-activity-decoupled": {
      url: "/names-with-activity-decoupled",
      method: "get",
      handler: "return $state.items",
    },
    "add-names-with-activity-decoupled": {
      url: "/names-with-activity-decoupled",
      method: "post",
      handler:
        "$state.items = [...$state.items, { id: $state.items.length + 1, name: String.fromCharCode(70,114,97,110,107), active: true }]",
    },
  },
};
const decoupledDataSourceApiExpression =
  `{JSON.parse('${JSON.stringify(decoupledDataSourceApi).replace(/"/g, "&quot;")}')}`;
const tubeStatusInterceptor = {
  operations: {
    "tube-status": {
      url: "https://api.example.test/line/mode/tube/status",
      method: "get",
      handler: `return [
        { id: "bakerloo", name: "Bakerloo", lineStatuses: [{ statusSeverityDescription: "Good Service" }] },
        { id: "central", name: "Central", lineStatuses: [{ statusSeverityDescription: "Minor Delays" }] }
      ];`,
    },
  },
};
const rawRowsInterceptor = {
  operations: {
    "raw-rows": {
      url: "https://api.example.test/raw-rows",
      method: "get",
      handler: `return [
        {
          commonName: "Oxford Circus Underground Station",
          additionalProperties: [{ key: "Zone", value: "1" }]
        },
        {
          commonName: "Waterloo Underground Station",
          additionalProperties: [{ key: "Zone", value: "1" }]
        }
      ];`,
    },
  },
};

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
    await expect
      .poll(() => page.evaluate(() =>
        [...document.querySelectorAll("*")].some((element) =>
          !!element.shadowRoot?.querySelector('[data-testid="nested-count"]')
        )
      ))
      .toBe(true);

    await page.getByTestId("nested-button").click();
    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 10");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");

    await page.getByTestId("outer-button").click();
    await expect(page.getByTestId("outer-count")).toHaveText("Outer: 11");
    await expect(page.getByTestId("nested-count")).toHaveText("Nested: 1");
  });

  test("does not register nested headings in the host TableOfContents", async ({
    initTestBed,
    page,
  }) => {
    const source = escapeNestedSource(`
      <App>
        <Heading level="h2">Nested Section</Heading>
      </App>
    `);

    await initTestBed(`
      <App>
        <TableOfContents />
        <Heading level="h2">Host Section</Heading>
        <NestedApp testId="nested" app="{'${source}'}" />
      </App>
    `);

    await expect(page.getByText("Nested Section")).toBeVisible();
    const toc = page.getByRole("navigation", { name: "Table of Contents" });
    await expect(toc.getByRole("link", { name: "Host Section" })).toBeVisible();
    await expect(toc.getByRole("link", { name: "Nested Section" })).toHaveCount(0);
  });

  test("applies the height prop to the nested app container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" height="120px" app="{'&lt;App&gt;&lt;Text&gt;Nested&lt;/Text&gt;&lt;/App&gt;'}" />
      </App>
    `);

    await expect(page.getByTestId("nested")).toHaveCSS("height", "120px");
  });

  test("uses playground api blocks for URL data in nested apps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" app="{'${teamListSource}'}" api="${teamApiExpression}" />
      </App>
    `);

    await expect(page.getByTestId("user-1")).toHaveText("Coder Gal");
    await expect(page.getByTestId("user-2")).toHaveText("Tech Ninja");
  });

  test("keeps assigned variables decoupled from nested DataSource refetches", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <NestedApp
          testId="nested"
          app="{'${decoupledDataSourceSource}'}"
          api="${decoupledDataSourceApiExpression}"
        />
      </App>
    `);

    await expect(page.getByTestId("datasource-count")).toHaveText("DataSource count: 4");
    await expect(page.getByTestId("items-count")).toHaveText("items count: 4");
    await expect(page.getByTestId("item-1")).toHaveText("Anna");
    await expect(page.getByTestId("item-2")).toHaveText("Helga");

    await page.getByTestId("snapshot").click();
    await expect(page.getByTestId("datasource-count")).toHaveText("DataSource count: 4");
    await expect(page.getByTestId("items-count")).toHaveText("items count: 2");
    await expect(page.getByTestId("item-1")).toHaveText("Anna");
    await expect(page.getByTestId("item-3")).toHaveText("Bob");
    await expect(page.getByTestId("item-2")).toHaveCount(0);

    await page.getByTestId("add-active").click();
    await expect(page.getByTestId("datasource-count")).toHaveText("DataSource count: 5");
    await expect(page.getByTestId("items-count")).toHaveText("items count: 2");
    await expect(page.getByTestId("item-5")).toHaveCount(0);
  });

  test("falls through same-prefix playground api adapters until an operation matches", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <NestedApp
          testId="decoupled"
          app="{'${decoupledDataSourceSource}'}"
          api="${decoupledDataSourceApiExpression}"
        />
        <NestedApp testId="team" app="{'${teamListSource}'}" api="${teamApiExpression}" />
      </App>
    `);

    await expect(page.getByTestId("datasource-count")).toHaveText("DataSource count: 4");
    await expect(page.getByTestId("items-count")).toHaveText("items count: 4");
    await expect(page.getByTestId("user-1")).toHaveText("Coder Gal");
    await expect(page.getByTestId("user-2")).toHaveText("Tech Ninja");

    await page.getByTestId("add-active").click();
    await expect(page.getByTestId("datasource-count")).toHaveText("DataSource count: 5");
  });

  test("resolves global transformResult functions by bare name in nested apps", async ({
    initTestBed,
    page,
  }) => {
    await page.addInitScript(() => {
      (window as any).transformRows = (rows: any[]) =>
        rows.map((row) => ({
          name: row.commonName,
          zone:
            row.additionalProperties?.find((property: { key: string }) => property.key === "Zone")
              ?.value ?? "",
        }));
    });

    await initTestBed(`
      <App>
        <NestedApp
          testId="nested"
          app="{'${transformedTableSource}'}"
          components="{['${transformedRowsComponentSource}']}"
        />
      </App>
    `, { apiInterceptor: rawRowsInterceptor });

    const table = page.getByTestId("transformed-table");
    await expect(
      table.locator("td").filter({ hasText: "Oxford Circus Underground Station" }).first(),
    ).toBeVisible();
    await expect(
      table.locator("td").filter({ hasText: "Waterloo Underground Station" }).first(),
    ).toBeVisible();
    await expect(
      table.locator("td").filter({ hasText: "1" }).first(),
    ).toBeVisible();
  });

  test("keeps playground api mocks from intercepting sibling URL data samples", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="team" app="{'${teamListSource}'}" api="${teamApiExpression}" />
        <NestedApp testId="tube" app="{'${tubeTableSource}'}" />
      </App>
    `, { apiInterceptor: tubeStatusInterceptor });

    await expect(page.getByTestId("user-1")).toHaveText("Coder Gal");
    await expect(page.getByTestId("user-2")).toHaveText("Tech Ninja");
    const tubeSample = page.getByTestId("tube");
    await expect(tubeSample.locator("td").filter({ hasText: "Bakerloo" }).first()).toBeVisible();
    await expect(tubeSample.locator("td").filter({ hasText: "Good Service" }).first()).toBeVisible();
    await expect(tubeSample.locator("td").filter({ hasText: "Central" }).first()).toBeVisible();
    await expect(tubeSample.locator("td").filter({ hasText: "Minor Delays" }).first()).toBeVisible();
    await expect(tubeSample.getByText("No data available")).toHaveCount(0);
  });

  test("renders the website HeroApp team list through markdown playground api", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <HeroApp />
      </App>
    `, {
      components: [heroAppSource],
      themes: [xmluiHeroTheme],
    });

    const heroPlayground = page.locator('[data-xmlui-component="NestedApp"]').first();
    await expect(heroPlayground.getByText("Coder Gal")).toBeVisible();
    await expect(heroPlayground.getByText("Tech Ninja")).toBeVisible();
    await expect(heroPlayground.getByText("No data available")).toHaveCount(0);
    await expect(heroPlayground.locator('[data-xmlui-component="AppHeader"] img[alt="Logo"]')).toHaveCount(0);
    const appHeader = heroPlayground.locator('[data-xmlui-component="AppHeader"]').first();
    await expect(appHeader).toHaveCSS("flex-shrink", "0");
    const headerOverflow = await appHeader.evaluate((shell) => {
      const wrapper = shell.closest("header") ?? shell.parentElement;
      if (!wrapper) {
        return Number.POSITIVE_INFINITY;
      }
      return Math.abs(shell.getBoundingClientRect().width - wrapper.getBoundingClientRect().width);
    });
    expect(headerOverflow).toBeLessThan(1);
    const headerSpacer = heroPlayground.locator('[data-part-id="content"] > div').first();
    await expect(headerSpacer).toHaveCSS("flex", "1 1 0px");
    await expect(headerSpacer).not.toHaveAttribute("data-xmlui-component", /.+/);
    await expect(headerSpacer).not.toHaveClass(/xmlui-SpaceFiller/);

    const firstCard = heroPlayground.locator('[data-xmlui-component="Card"]').first();
    await expect(firstCard).toBeVisible();
    const firstCardBox = await firstCard.boundingBox();
    expect(firstCardBox?.height).toBeLessThan(100);
    await expect(firstCard.locator("h2")).toHaveCSS("margin-top", "0px");
    await expect(firstCard.locator("h2")).toHaveCSS("margin-bottom", "0px");
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

  test("framed website sample inherits shell text color and does not show nested app scrollbars", async ({
    initTestBed,
    page,
  }) => {
    await initTestBed(`
      <App>
        <VStack testId="host" width="900px">
          <NestedApp
            testId="nested"
            title="Pick a theme"
            withFrame="{true}"
            height="400px"
            activeTheme="nested-spacing"
            config="{{
              defaultTheme: 'nested-spacing',
              themes: [{
                id: 'nested-spacing',
                extends: 'xmlui',
                themeVars: {
                  'paddingHorizontal-content-App': '80px',
                  'textColor-Text': 'rgb(99, 98, 106)'
                }
              }]
            }}"
            app="{'${pickThemeSource}'}"
          />
        </VStack>
      </App>
    `);

    await page.getByTestId("host").evaluate((element) => {
      (element as HTMLElement).style.color = "rgb(99, 98, 106)";
    });

    await expect(page.getByText("Pick a theme")).toHaveCSS("color", "rgb(99, 98, 106)");

    const nestedAppMetrics = await page.getByTestId("nested").locator('[data-xmlui-component="App"]').evaluate((element) => {
      const app = element as HTMLElement;
      const style = getComputedStyle(app);
      const pageContent = app.querySelector('[class*="pageContentContainer"]') as HTMLElement;
      const pageContentStyle = getComputedStyle(pageContent);
      return {
        clientHeight: app.clientHeight,
        clientWidth: app.clientWidth,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
        pagePaddingLeft: pageContentStyle.paddingLeft,
        scrollbarGutter: style.scrollbarGutter,
        scrollHeight: app.scrollHeight,
        scrollWidth: app.scrollWidth,
      };
    });

    expect(nestedAppMetrics.overflowX).toBe("hidden");
    expect(nestedAppMetrics.overflowY).toBe("auto");
    expect(nestedAppMetrics.pagePaddingLeft).toBe("80px");
    expect(nestedAppMetrics.scrollbarGutter).toBe("stable both-edges");
    expect(nestedAppMetrics.scrollHeight).toBeLessThanOrEqual(nestedAppMetrics.clientHeight + 1);
    expect(nestedAppMetrics.scrollWidth).toBeGreaterThanOrEqual(nestedAppMetrics.clientWidth);
  });

  test("framed playground reserves the nested app scrollbar gutter", async ({
    initTestBed,
    page,
  }) => {
    const markdownSource = [
      '```xmlui-pg height="400px" name="Pick a theme"',
      unescapeNestedSource(pickThemeSource),
      "```",
    ].join("\n");
    await initTestBed(`
      <App>
        <VStack testId="host" width="1760px">
          <Markdown><![CDATA[${markdownSource}]]></Markdown>
        </VStack>
      </App>
    `);

    const frameMetrics = await page.getByText("Pick a theme").evaluate((element) => {
      const shadowHost = [...document.querySelectorAll("*")]
        .find((candidate) => candidate.shadowRoot?.querySelector('[data-xmlui-component="App"]')) as HTMLElement;
      const shadowRoot = shadowHost.shadowRoot as ShadowRoot;
      const app = shadowRoot.querySelector('[data-xmlui-component="App"]') as HTMLElement;
      const frame = shadowHost.closest('[class*="nestedAppContainer"]') as HTMLElement;
      const pageContent = app.querySelector('[class*="pageContentContainer"]') as HTMLElement;
      const label = [...shadowRoot.querySelectorAll('[data-xmlui-component="Text"]')]
        .find((candidate) => candidate.textContent?.trim() === "Theme") as HTMLElement;
      const frameBox = frame.getBoundingClientRect();
      const appBox = app.getBoundingClientRect();
      const pageContentBox = pageContent.getBoundingClientRect();
      const labelBox = label.getBoundingClientRect();
      return {
        appGutterLeft: pageContentBox.left - appBox.left,
        labelInset: labelBox.left - frameBox.left,
        scrollbarGutter: getComputedStyle(app).scrollbarGutter,
      };
    });

    expect(frameMetrics.scrollbarGutter).toBe("stable both-edges");
    expect(frameMetrics.appGutterLeft).toBeGreaterThanOrEqual(14);
    expect(frameMetrics.labelInset).toBeGreaterThanOrEqual(45);
  });
});

function escapeNestedSource(source: string): string {
  return source
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "");
}

function unescapeNestedSource(source: string): string {
  return source
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");
}
