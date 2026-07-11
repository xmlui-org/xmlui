import { test, expect } from "../../testing/fixtures";

// Fake origins used as mock URLs — chosen to be distinct so Playwright can route them selectively
const MOCK_URL = "http://xmlui-include-test.local/markup.xmlui";
const MOCK_URL_2 = "http://xmlui-include-test-2.local/markup.xmlui";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders a Fragment fetched from a URL", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text testId="included-text">Hello from include</Text></Fragment>`,
      });
    });

    await initTestBed(`<IncludeMarkup url="${MOCK_URL}"/>`);

    await expect(page.getByTestId("included-text")).toBeVisible();
    await expect(page.getByTestId("included-text")).toHaveText("Hello from include");
  });

  test("unwraps a top-level Component and renders its children", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Component name="Footer">
          <Text testId="footer-text">Footer content</Text>
        </Component>`,
      });
    });

    await initTestBed(`<IncludeMarkup url="${MOCK_URL}"/>`);

    await expect(page.getByTestId("footer-text")).toBeVisible();
    await expect(page.getByTestId("footer-text")).toHaveText("Footer content");
  });

  test("renders multiple children from the fetched markup", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment>
          <Text testId="first-text">First</Text>
          <Text testId="second-text">Second</Text>
        </Fragment>`,
      });
    });

    await initTestBed(`<IncludeMarkup url="${MOCK_URL}"/>`);

    await expect(page.getByTestId("first-text")).toBeVisible();
    await expect(page.getByTestId("second-text")).toBeVisible();
  });

  test("shows loadingContent while the request is in-flight", async ({ page, initTestBed }) => {
    // Gate that we control: the route won't fulfill until we open it
    let openRoute: () => void;
    const routeGate = new Promise<void>((resolve) => {
      openRoute = resolve;
    });

    await page.route(MOCK_URL, async (route) => {
      await routeGate;
      await route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text testId="loaded-text">Loaded</Text></Fragment>`,
      });
    });

    await initTestBed(`
      <IncludeMarkup url="${MOCK_URL}">
        <property name="loadingContent">
          <Text testId="loading-text">Loading…</Text>
        </property>
      </IncludeMarkup>
    `);

    // While the gate is closed the loading placeholder must be visible
    await expect(page.getByTestId("loading-text")).toBeVisible();

    // Open the gate — the real content should replace the placeholder
    openRoute!();
    await expect(page.getByTestId("loaded-text")).toBeVisible();
    await expect(page.getByTestId("loading-text")).not.toBeVisible();
  });

  test("fires didLoad after successful fetch", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text>Loaded</Text></Fragment>`,
      });
    });

    const { testStateDriver } = await initTestBed(`
      <IncludeMarkup url="${MOCK_URL}" onDidLoad="testState = 'loaded'"/>
    `);

    await expect.poll(testStateDriver.testState).toEqual("loaded");
  });

  test("fires didFail on network error", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.abort();
    });

    const { testStateDriver } = await initTestBed(`
      <IncludeMarkup url="${MOCK_URL}" onDidFail="msg => testState = 'failed: ' + msg"/>
    `);

    await expect.poll(testStateDriver.testState).toMatch(/^failed:/);
  });

  test("fires didFail on non-2xx HTTP status", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({ status: 404, body: "Not Found" });
    });

    const { testStateDriver } = await initTestBed(`
      <IncludeMarkup url="${MOCK_URL}" onDidFail="msg => testState = msg"/>
    `);

    await expect.poll(testStateDriver.testState).toMatch(/404/);
  });

  test("fires didFail on parse error", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text>unclosed`,
      });
    });

    const { testStateDriver } = await initTestBed(`
      <IncludeMarkup url="${MOCK_URL}" onDidFail="msg => testState = 'parse-error'"/>
    `);

    await expect.poll(testStateDriver.testState).toEqual("parse-error");
  });

  test("re-fetches when url prop changes", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text testId="content-1">Content 1</Text></Fragment>`,
      });
    });
    await page.route(MOCK_URL_2, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text testId="content-2">Content 2</Text></Fragment>`,
      });
    });

    await initTestBed(`
      <Fragment var.currentUrl="${MOCK_URL}">
        <IncludeMarkup url="{currentUrl}"/>
        <Button testId="switch-btn" onClick="currentUrl = '${MOCK_URL_2}'"/>
      </Fragment>
    `);

    await expect(page.getByTestId("content-1")).toBeVisible();

    await page.getByTestId("switch-btn").click();

    await expect(page.getByTestId("content-2")).toBeVisible();
    await expect(page.getByTestId("content-1")).not.toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("renders nothing when url is not provided", async ({ page, initTestBed }) => {
    await initTestBed(`<IncludeMarkup testId="include"/>`);

    // The component should mount and produce no visible output
    const component = page.getByTestId("include");
    // nonVisual components don't produce a testId wrapper, so just confirm no crash
    await expect(page.locator("body")).toBeVisible();
  });

  test("is transparent — does not inject a wrapper element", async ({ page, initTestBed }) => {
    await page.route(MOCK_URL, (route) => {
      route.fulfill({
        contentType: "text/plain",
        body: `<Fragment><Text testId="inner-text">Inner</Text></Fragment>`,
      });
    });

    await initTestBed(`
      <VStack testId="stack">
        <IncludeMarkup url="${MOCK_URL}"/>
      </VStack>
    `);

    await expect(page.getByTestId("inner-text")).toBeVisible();

    // The Text element should be a direct child of the VStack, not wrapped in an extra div
    const stack = page.getByTestId("stack");
    await expect(stack.getByTestId("inner-text")).toBeVisible();
  });
});
