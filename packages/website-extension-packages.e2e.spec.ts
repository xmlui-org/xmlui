import { expect, test } from "xmlui/testing";

test("xmlui-docs-blocks renders docs helpers", async ({ initTestBed, page }) => {
  await initTestBed(
    `<VStack>
      <ReadingTime content="This is copied documentation content for package testing." />
      <Breadcrumbs defaultItems="{[
        { label: 'Docs', to: '/docs' },
        { label: 'Package docs' }
      ]}" />
    </VStack>`,
    { extensionIds: "xmlui-docs-blocks" },
  );

  await expect(page.getByText("1 min read")).toBeVisible();
  await expect(page.getByRole("link", { name: "Docs" })).toBeVisible();
  await expect(page.getByText("Package docs")).toBeVisible();
});

test("xmlui-website-blocks renders visual blocks", async ({ initTestBed, page }) => {
  await initTestBed(
    `<HeroSection
      preamble="Package test"
      headline="Website blocks"
      subheadline="Extension package E2E"
      ctaButtonText="Continue"
    />`,
    { extensionIds: "xmlui-website-blocks" },
  );

  await expect(page.getByText("Website blocks")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
});

test("xmlui-search filters results", async ({ initTestBed, page }) => {
  await initTestBed(
    `<Search mode="inline" data="{items}" />`,
    {
      extensionIds: "xmlui-search",
      mainXs: `
        var items = [
          { path: '#button', title: 'Button', content: 'A clickable button' },
          { path: '#table', title: 'Table', content: 'A data table' }
        ];
      `,
    },
  );

  await page.getByRole("searchbox").fill("button");
  await expect(page.getByRole("option", { name: /Button/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /Table/ })).not.toBeVisible();
});

test("xmlui-masonry renders item templates", async ({ initTestBed, page }) => {
  await initTestBed(
    `<Masonry columns="2">
      <Card><Text>Alpha</Text></Card>
      <Card><Text>Beta</Text></Card>
    </Masonry>`,
    { extensionIds: "xmlui-masonry" },
  );

  await expect(page.getByText("Alpha")).toBeVisible();
  await expect(page.getByText("Beta")).toBeVisible();
});

test("xmlui-gauge exposes value and setValue API", async ({ initTestBed, page }) => {
  await initTestBed(
    `<VStack>
      <Gauge id="gauge" initialValue="30" />
      <Text testId="value" value="{gauge.value}" />
      <Button testId="set" label="Set gauge" onClick="gauge.setValue(75)" />
    </VStack>`,
    { extensionIds: "xmlui-gauge" },
  );

  await expect(page.locator("smart-gauge")).toHaveCount(1);
  await expect(page.getByTestId("value")).toHaveText("30");
  await page.getByTestId("set").click();
  await expect(page.getByTestId("value")).toHaveText("75");
});

test("xmlui-echart renders chart output from options", async ({ initTestBed, page }) => {
  await initTestBed(
    `<EChart
      renderer="svg"
      width="400px"
      height="240px"
      option="{{
        xAxis: { type: 'category', data: ['A', 'B'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [1, 2] }]
      }}"
    />`,
    { extensionIds: "xmlui-echart" },
  );

  await expect(page.locator("svg").first()).toBeVisible();
});

test("xmlui-calendar renders events", async ({ initTestBed, page }) => {
  await initTestBed(
    `<BigCalendar
      height="420px"
      view="month"
      date="2026-03-01T00:00:00"
      events="{[
        {
          title: 'Package Review',
          start: '2026-03-09T09:00:00',
          end: '2026-03-09T09:30:00'
        }
      ]}"
    />`,
    { extensionIds: "xmlui-calendar" },
  );

  await expect(page.locator(".rbc-calendar")).toHaveCount(1);
  await expect(page.getByText("Package Review")).toBeVisible();
});

test("xmlui-grid-layout renders grid items", async ({ initTestBed, page }) => {
  await initTestBed(
    `<GridLayout
      columns="{12}"
      rowHeight="{60}"
      draggable="false"
      resizable="false"
      layout="{[
        { i: '0', x: 0, y: 0, w: 6, h: 2 },
        { i: '1', x: 6, y: 0, w: 6, h: 2 }
      ]}"
    >
      <Text>Tile A</Text>
      <Text>Tile B</Text>
    </GridLayout>`,
    { extensionIds: "xmlui-grid-layout" },
  );

  await expect(page.locator(".react-grid-layout")).toHaveCount(1);
  await expect(page.locator(".react-grid-item")).toHaveCount(2);
  await expect(page.getByText("Tile A")).toBeVisible();
  await expect(page.getByText("Tile B")).toBeVisible();
});

test("xmlui-tiptap-editor exposes value and setValue API", async ({ initTestBed, page }) => {
  await initTestBed(
    `<VStack>
      <TiptapEditor id="editor" toolbar="false" initialValue="Initial rich text" />
      <Text testId="value" value="{editor.value}" />
      <Button testId="set" label="Set editor" onClick="editor.setValue('Updated rich text')" />
    </VStack>`,
    { extensionIds: "xmlui-tiptap-editor" },
  );

  await expect(page.locator(".ProseMirror")).toHaveCount(1);
  await expect(page.getByTestId("value")).toHaveText("Initial rich text");
  await page.getByTestId("set").click();
  await expect(page.getByTestId("value")).toHaveText("Updated rich text");
});
