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

  test("uses playground api blocks for URL data in nested apps", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NestedApp testId="nested" app="{'${teamListSource}'}" api="${teamApiExpression}" />
      </App>
    `);

    await expect(page.getByTestId("user-1")).toHaveText("Coder Gal");
    await expect(page.getByTestId("user-2")).toHaveText("Tech Ninja");
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
      const frame = (element as HTMLElement).closest('[class*="nestedAppContainer"]') as HTMLElement;
      const app = frame.querySelector('[data-xmlui-component="App"]') as HTMLElement;
      const pageContent = app.querySelector('[class*="pageContentContainer"]') as HTMLElement;
      const label = [...frame.querySelectorAll('[data-xmlui-component="Text"]')]
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
