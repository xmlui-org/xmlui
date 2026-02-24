import { expect, test } from "../../testing/fixtures";

// =============================================================================
// NAVIGATION EVENT TESTS
// =============================================================================

test.describe("Navigation Events", () => {
  test("didNavigate fires after Link click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App 
        onDidNavigate="(to, queryParams) => testState = { event: 'didNavigate', to, queryParams }"
      >
        <NavPanel>
          <NavLink label="Home" to="/" />
          <NavLink label="About" to="/about" />
        </NavPanel>
        <Pages>
          <Page url="/">Home</Page>
          <Page url="/about">About</Page>
        </Pages>
      </App>
    `);

    const aboutLink = page.getByRole("link", { name: "About" });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();

    // Wait for navigation to complete
    await expect(page.locator(".xmlui-page-root")).toContainText("About");

    const state = await testStateDriver.testState();
    expect(state.event).toBe("didNavigate");
    expect(state.to).toContain("/about");
  });

  test("willNavigate fires on programmatic navigation", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App 
        onWillNavigate="(to, queryParams) => testState = { event: 'willNavigate', to, queryParams }"
      >
        <Pages>
          <Page url="/">
            Home
            <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
          </Page>
          <Page url="/about">About</Page>
        </Pages>
      </App>
    `);

    const navButton = page.getByTestId("navBtn");
    await expect(navButton).toBeVisible();
    await navButton.click();

    const state = await testStateDriver.testState();
    expect(state.event).toBe("willNavigate");
    expect(state.to).toBe("/about");
  });

  test("didNavigate fires after programmatic navigation", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App 
        onDidNavigate="(to, queryParams) => testState = { event: 'didNavigate', to, queryParams }"
      >
        <Pages>
          <Page url="/">
            Home
            <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
          </Page>
          <Page url="/about">About</Page>
        </Pages>
      </App>
    `);

    const navButton = page.getByTestId("navBtn");
    await expect(navButton).toBeVisible();
    await navButton.click();

    // Wait for navigation to complete
    await expect(page.locator(".xmlui-page-root")).toContainText("About");

    const state = await testStateDriver.testState();
    expect(state.event).toBe("didNavigate");
    expect(state.to).toContain("/about");
  });

  test("willNavigate can cancel programmatic navigation by returning false", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App 
        onWillNavigate="(to, queryParams) => to === '/about' ? false : undefined"
      >
        <Pages>
          <Page url="/">
            Home Page
            <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
          </Page>
          <Page url="/about">About Page</Page>
        </Pages>
      </App>
    `);

    // Verify we start on home page
    await expect(page.locator(".xmlui-page-root")).toContainText("Home Page");

    // Try to navigate to About - should be blocked
    const navBtn = page.getByTestId("navBtn");
    await expect(navBtn).toBeVisible();
    await navBtn.click();

    // Wait a bit to ensure no navigation occurred
    await page.waitForTimeout(500);

    // Should still be on home page
    await expect(page.locator(".xmlui-page-root")).toContainText("Home Page");
    await expect(page.locator(".xmlui-page-root")).not.toContainText("About Page");
  });

  test("willNavigate can allow programmatic navigation by returning undefined", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App 
        onWillNavigate="(to, queryParams) => undefined"
      >
        <Pages>
          <Page url="/">
            Home Page
            <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
          </Page>
          <Page url="/about">About Page</Page>
        </Pages>
      </App>
    `);

    // Verify we start on home page
    await expect(page.locator(".xmlui-page-root")).toContainText("Home Page");

    // Navigate to About - should succeed
    const navBtn = page.getByTestId("navBtn");
    await expect(navBtn).toBeVisible();
    await navBtn.click();

    // Should now be on about page
    await expect(page.locator(".xmlui-page-root")).toContainText("About Page");
    await expect(page.locator(".xmlui-page-root")).not.toContainText("Home Page");
  });

  test("both willNavigate and didNavigate fire in sequence for programmatic navigation", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.events="{[]}">
        <App 
          onWillNavigate="(to, queryParams) => { events.push('willNavigate'); testState = events; }"
          onDidNavigate="(to, queryParams) => { events.push('didNavigate'); testState = events; }"
        >
          <Pages>
            <Page url="/">
              Home
              <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
            </Page>
            <Page url="/about">About</Page>
          </Pages>
        </App>
      </Fragment>
    `);

    const navBtn = page.getByTestId("navBtn");
    await expect(navBtn).toBeVisible();
    await navBtn.click();

    // Wait for navigation to complete
    await expect(page.locator(".xmlui-page-root")).toContainText("About");

    // Poll until we have both events
    await expect.poll(testStateDriver.testState).toEqual(
      expect.arrayContaining(["willNavigate", "didNavigate"])
    );

    const events = await testStateDriver.testState();
    expect(events).toHaveLength(2);
    expect(events[0]).toBe("willNavigate");
    expect(events[1]).toBe("didNavigate");
  });

  test("willNavigate blocks programmatic navigation before didNavigate fires", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.events="{[]}">
        <App 
          onWillNavigate="(to, queryParams) => { events.push('willNavigate'); testState = events; return to === '/about' ? false : undefined; }"
          onDidNavigate="(to, queryParams) => { events.push('didNavigate'); testState = events; }"
        >
          <Pages>
            <Page url="/">
              Home Page
              <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
            </Page>
            <Page url="/about">About Page</Page>
          </Pages>
        </App>
      </Fragment>
    `);

    const navBtn = page.getByTestId("navBtn");
    await expect(navBtn).toBeVisible();
    await navBtn.click();

    // Wait a bit for any potential events
    await page.waitForTimeout(500);

    // Should still be on home page
    await expect(page.locator(".xmlui-page-root")).toContainText("Home Page");

    const events = await testStateDriver.testState();
    // willNavigate fired, but didNavigate should NOT have fired
    expect(events).toEqual(["willNavigate"]);
  });

  test("didNavigate fires on browser back button", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App 
        onDidNavigate="(to, queryParams) => testState = { event: 'didNavigate', to }"
      >
        <Pages>
          <Page url="/">
            Home
            <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
          </Page>
          <Page url="/about">About</Page>
        </Pages>
      </App>
    `);

    // Navigate to About to create history
    const navBtn = page.getByTestId("navBtn");
    await expect(navBtn).toBeVisible();
    await navBtn.click();
    await expect(page.locator(".xmlui-page-root")).toContainText("About");

    // Clear test state
    await page.evaluate(() => {
      (window as any).__XMLUI_TEST_STATE = null;
    });

    // Navigate back
    await page.goBack();

    // Wait for navigation to complete
    await expect(page.locator(".xmlui-page-root")).toContainText("Home");

    const state = await testStateDriver.testState();
    expect(state?.event).toBe("didNavigate");
  });

  test("didNavigate fires on browser forward button", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App 
        onDidNavigate="(to, queryParams) => testState = { event: 'didNavigate', to }"
      >
        <Pages>
          <Page url="/">
            Home
            <Button testId="navBtn" onClick="Actions.navigate('/about')">Go to About</Button>
          </Page>
          <Page url="/about">About</Page>
        </Pages>
      </App>
    `);

    // Navigate to About
    const navBtn = page.getByTestId("navBtn");
    await expect(navBtn).toBeVisible();
    await navBtn.click();
    await expect(page.locator(".xmlui-page-root")).toContainText("About");

    // Go back
    await page.goBack();
    await expect(page.locator(".xmlui-page-root")).toContainText("Home");

    // Clear test state
    await page.evaluate(() => {
      (window as any).__XMLUI_TEST_STATE = null;
    });

   // Go forward
    await page.goForward();

    // Wait for navigation to complete
    await expect(page.locator(".xmlui-page-root")).toContainText("About");

    const state = await testStateDriver.testState();
    expect(state?.event).toBe("didNavigate");
  });

  test("navigation events work with nested routes (programmatic)", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment var.navigationLog="{[]}">
        <App 
          onWillNavigate="(to, queryParams) => { navigationLog.push({ event: 'will', to }); testState = navigationLog; }"
          onDidNavigate="(to, queryParams) => { navigationLog.push({ event: 'did', to }); testState = navigationLog; }"
        >
          <Pages>
            <Page url="/">
              Home
              <Button testId="productsBtn" onClick="Actions.navigate('/products')">Go to Products</Button>
            </Page>
            <Page url="/products">
              Products
              <Button testId="detailBtn" onClick="Actions.navigate('/products/123')">View Detail</Button>
            </Page>
            <Page url="/products/:id">Product Detail</Page>
          </Pages>
        </App>
      </Fragment>
    `);

    // Navigate to products
    const productsBtn = page.getByTestId("productsBtn");
    await expect(productsBtn).toBeVisible();
    await productsBtn.click();
    await expect(page.locator(".xmlui-page-root")).toContainText("Products");

    // Navigate to detail
    const detailBtn = page.getByTestId("detailBtn");
    await expect(detailBtn).toBeVisible();
    await detailBtn.click();
    await expect(page.locator(".xmlui-page-root")).toContainText("Product Detail");

    const log = await testStateDriver.testState();
    // Should have logged 4 events: 2 for products, 2 for detail
    expect(log.length).toBeGreaterThanOrEqual(4);
    
    // Verify the pattern of will/did pairs
    const lastTwoEvents = log.slice(-2);
    expect(lastTwoEvents[0].event).toBe("will");
    expect(lastTwoEvents[0].to).toContain("/products/123");
    expect(lastTwoEvents[1].event).toBe("did");
    expect(lastTwoEvents[1].to).toContain("/products/123");
  });
});
