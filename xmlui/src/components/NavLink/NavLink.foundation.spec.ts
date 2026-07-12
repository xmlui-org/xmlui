import { expect, test } from "../../testing/fixtures";

test.describe("NavLink foundation", () => {
  test("renders label and children and exposes active state", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavLink testId="forced" to="/forced" active="true">Forced active</NavLink>
        <NavLink testId="labelled" to="/labelled" label="Label prop" />
      </App>
    `);

    await expect(page.getByTestId("forced")).toHaveText("Forced active");
    await expect(page.getByTestId("forced")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("labelled")).toHaveText("Label prop");
  });

  test("disabled NavLink renders as disabled button and does not navigate", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavLink testId="disabled" to="/disabled" enabled="false">Disabled</NavLink>
        <Text testId="path">{$pathname}</Text>
      </App>
    `);

    await expect(page.getByTestId("disabled")).toHaveJSProperty("tagName", "BUTTON");
    await expect(page.getByTestId("disabled")).toBeDisabled();
    await page.getByTestId("disabled").evaluate((element) => (element as HTMLElement).click());
    await expect(page.getByTestId("path")).toContainText("/");
  });

  test("click handler mutates state and internal link navigates", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App var.message="{'idle'}">
        <NavLink testId="about" to="/about" onClick="message = 'clicked'">About</NavLink>
        <Text testId="message">{message}</Text>
        <Text testId="path">{$pathname}</Text>
      </App>
    `);

    await page.getByTestId("about").click();
    await expect(page.getByTestId("message")).toContainText("clicked");
    await expect(page.getByTestId("path")).toContainText("/about");
    await expect(page.getByTestId("about")).toHaveAttribute("aria-current", "page");
  });

  test("uses the public active class and honors exact matching", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/docs/page">
            <NavLink testId="parent" to="/docs">Docs</NavLink>
            <NavLink testId="exact" to="/docs" exact="true">Docs exact</NavLink>
            <NavLink testId="page" to="/docs/page">Page</NavLink>
          </Page>
        </Pages>
      </App>
    `);

    await page.evaluate(() => { window.location.hash = "#/docs/page"; });
    await expect(page.getByTestId("parent")).toHaveClass(/xmlui-navlink-active/);
    await expect(page.getByTestId("parent")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("exact")).not.toHaveClass(/xmlui-navlink-active/);
    await expect(page.getByTestId("exact")).not.toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("page")).toHaveClass(/xmlui-navlink-active/);
  });

  test("root link is not active on sibling routes", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="horizontal">
        <NavPanel>
          <NavLink testId="home" label="Home" to="/" />
          <NavLink testId="page1Link" label="Page 1" to="/page1" />
          <NavLink testId="page2Link" label="Page 2" to="/page2" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="page">Home</Text>
          </Page>
          <Page url="/page1">
            <Text testId="page">Page 1</Text>
          </Page>
          <Page url="/page2">
            <Text testId="page">Page 2</Text>
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.getByTestId("home")).toHaveClass(/xmlui-navlink-active/);

    await page.getByTestId("page1Link").click();

    await expect(page.getByTestId("page")).toHaveText("Page 1");
    await expect(page.getByTestId("home")).not.toHaveClass(/xmlui-navlink-active/);
    await expect(page.getByTestId("page1Link")).toHaveClass(/xmlui-navlink-active/);
    await expect(page.getByTestId("page2Link")).not.toHaveClass(/xmlui-navlink-active/);
  });

  test("preserves external href and target without routing rewrite", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavLink testId="external" to="https://example.com/path?q=1" target="_blank">External</NavLink>
      </App>
    `);

    await expect(page.getByTestId("external")).toHaveAttribute("href", "https://example.com/path?q=1");
    await expect(page.getByTestId("external")).toHaveAttribute("target", "_blank");
  });

  test("navigates to routed pages with query parameters", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App>
        <NavLink testId="queryLink" to="/docs/page?tab=api">Docs API</NavLink>
        <Pages>
          <Page url="/">
            <Text testId="page">Home</Text>
          </Page>
          <Page url="/docs/page">
            <Text testId="page">Docs page {$queryParams.tab}</Text>
          </Page>
        </Pages>
      </App>
    `);

    await page.getByTestId("queryLink").click();
    await expect(page.getByTestId("page")).toHaveText("Docs page api");
    await expect(page.getByTestId("queryLink")).toHaveAttribute("href", "#/docs/page?tab=api");
  });
});
