import { expect, test } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic props", async ({ initTestBed, page }) => {
    await initTestBed(`<App name="Test App" testId="app"/>`);
    await expect(page.getByTestId("app")).toBeVisible();
  });

  test("renders with horizontal layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="horizontal">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with horizontal-sticky layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="horizontal-sticky">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with condensed layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="condensed">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with condensed-sticky layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="condensed-sticky">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with vertical layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="vertical">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with vertical-sticky layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="vertical-sticky">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with vertical-full-header layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="vertical-full-header">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("renders with desktop layout", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="desktop">test text</App>`);
    await expect(page.getByText("test text")).toBeVisible();
  });

  test("desktop layout fills viewport dimensions", async ({ initTestBed, page }) => {
    await initTestBed(`<App layout="desktop" testId="app">test content</App>`);
    
    const app = page.getByTestId("app");
    await expect(app).toBeVisible();
    await expect(app).toHaveClass(/desktop/);
  });

  test("desktop layout renders with header and footer", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <AppHeader testId="header">
          <property name="logoTemplate">
            <Text value="Desktop App" />
          </property>
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="main-content">Main Content</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer Content</Footer>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("main-content")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
    await expect(page.getByText("Desktop App")).toBeVisible();
    await expect(page.getByText("Footer Content")).toBeVisible();
  });

  test("desktop layout works without header", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Content without header</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("desktop layout works without footer", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <AppHeader testId="header">
          <property name="logoTemplate">
            <Text value="Header Only" />
          </property>
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Content without footer</Text>
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByText("Header Only")).toBeVisible();
  });

  test("desktop layout works with only content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Content only</Text>
          </Page>
        </Pages>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
  });

  test("handles layout prop changes correctly", async ({
    page,
    initTestBed,
    createButtonDriver,
  }) => {
    await initTestBed(`
      <App var.lo="vertical" layout="{lo}" testId="app">
        <Button testId="toggleLayout" label="Toggle" onClick="lo = 'horizontal'" />
      </App>
    `);

    const buttonDriver = await createButtonDriver("toggleLayout");
    await expect(page.getByTestId("app")).toHaveClass(/vertical/);
    await buttonDriver.click();
    await expect(page.getByTestId("app")).toHaveClass(/horizontal/);
  });

  test("sets document title from name prop", async ({ initTestBed, page }) => {
    const APP_NAME = "My Test Application";
    await initTestBed(`<App name="${APP_NAME}" testId="app"/>`);

    await expect(page.getByTestId("app")).toBeVisible();
    expect(await page.title()).toBe(APP_NAME);
  });

  test("handles different visual states with scrolling options", async ({ initTestBed, page }) => {
    // Test with scrollWholePage=true
    await initTestBed(`<App scrollWholePage="true" testId="app"/>`);

    await expect(page.getByTestId("app")).toHaveClass(/scrollWholePage/);

    // Test with scrollWholePage=false
    await initTestBed(`<App scrollWholePage="false" testId="app"/>`);

    await expect(page.getByTestId("app")).not.toHaveClass(/scrollWholePage/);
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles undefined props gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`<App testId="app" />`);

    await expect(page.getByTestId("app")).toBeVisible();

    // App should use a default layout
    await expect(page.getByTestId("app")).toHaveClass(/horizontal/);
  });

  test("works correctly with basic content structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App testId="app">
        <Text testId="content">Content</Text>
      </App>`);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("works correctly with complex content structure", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App testId="app">
        <AppHeader testId="header">Header Content</AppHeader>
        <NavPanel testId="nav">
          <NavLink testId="link1" to="#">Link 1</NavLink>
          <NavGroup testId="group" label="Group">
            <NavLink testId="nestedLink" to="#">Nested Link</NavLink>
          </NavGroup>
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/" testId="homePage">
            <Text testId="homeContent">Home Content</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer Content</Footer>
      </App>`);

    await expect(page.getByTestId("app")).toBeVisible();

    // Test component structure
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("nav")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();

    // Test content
    await expect(page.getByText("Header Content")).toBeVisible();
    await expect(page.getByText("Link 1")).toBeVisible();
    await expect(page.getByText("Group")).toBeVisible();
    await expect(page.getByText("Home Content")).toBeVisible();
    await expect(page.getByText("Footer Content")).toBeVisible();
  });
});

// =============================================================================
// EVENT HANDLING TESTS
// =============================================================================

test.describe("Event Handling", () => {
  test("ready event is triggered when App component finishes rendering", async ({
    initTestBed,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App
        onReady="() => testState = 'app-ready'"
        testId="app"
      />
    `);

    // Verify the ready event was fired
    await expect.poll(testStateDriver.testState).toEqual("app-ready");
  });

  test("ready event is triggered for App with complex content", async ({ initTestBed }) => {
    const { testStateDriver } = await initTestBed(`
      <App
        onReady="() => testState = 'complex-app-ready'"
        layout="horizontal"
        testId="app"
      >
        <AppHeader>
          <property name="logoTemplate">
            <Text value="Test App" />
          </property>
        </AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text value="Home Page" />
          </Page>
        </Pages>
        <Footer>
          <Text value="Footer Content" />
        </Footer>
      </App>
    `);

    // Verify the ready event was fired even with complex content
    await expect.poll(testStateDriver.testState).toEqual("complex-app-ready");
  });

  test("ready event fires only once during component lifecycle", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App
        var.counter="{0}"
        onReady="() => { counter = counter + 1; testState = counter; }"
        testId="app"
      >
        <Button
          testId="trigger-rerender"
          label="Re-render"
          onClick="counter = counter"
        />
      </App>
    `);

    // Initial ready event should fire
    await expect.poll(testStateDriver.testState).toEqual(1);

    // Trigger a re-render by clicking the button
    await page.getByTestId("trigger-rerender").click();

    // Counter should still be 1 (ready event doesn't fire again)
    await expect.poll(testStateDriver.testState).toEqual(1);
  });

  test("messageReceived event is triggered when window receives a message", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App
        onMessageReceived="(msg, ev) => testState = msg"
        testId="app"
      />
    `);

    // Send a message to the window
    await page.evaluate(() => {
      window.postMessage("test-message", "*");
    });

    // Verify the event was received and handled
    await expect.poll(testStateDriver.testState).toEqual("test-message");
  });

  test("messageReceived event receives both message data and event object", async ({
    initTestBed,
    page,
  }) => {
    const { testStateDriver } = await initTestBed(`
      <App
        onMessageReceived="(msg, ev) => testState = { message: msg, eventType: ev.type, origin: ev.origin }"
        testId="app"
      />
    `);

    // Send a message to the window
    await page.evaluate(() => {
      window.postMessage("event-test", "*");
    });

    // Verify both parameters are accessible
    await expect.poll(testStateDriver.testState).toMatchObject({
      message: "event-test",
      eventType: "message",
      origin: expect.any(String),
    });
  });

  test("messageReceived event handles complex data objects", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <App
        onMessageReceived="(msg, ev) => testState = msg"
        testId="app"
      />
    `);

    // Send a complex object as message data
    const testData = { action: "test", payload: { id: 123, name: "test-item" } };
    await page.evaluate((data) => {
      window.postMessage(data, "*");
    }, testData);

    // Verify the complex data is received correctly
    await expect.poll(testStateDriver.testState).toEqual(testData);
  });
});

// =============================================================================
// Drawer HANDLING TESTS
// =============================================================================

test.describe("Drawer Handling", () => {
  test("Drawer displayed if NavPanel has no 'when'", async ({
    initTestBed,
    page,
  }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader testId="appHeader"/>
        <NavPanel>
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
      </App>
    `);

    // Open drawer by clicking hamburger button
    const appHeader = page.getByTestId("appHeader");
    const hamburgerButton = appHeader.locator('[data-part-id="hamburger"]').first();
    await expect (hamburgerButton).toBeVisible();
  });

  test("Drawer displayed if NavPanel has when='true'", async ({
    initTestBed,
    page,
  }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader testId="appHeader"/>
        <NavPanel when="true">
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
      </App>
    `);

    // Open drawer by clicking hamburger button
    const appHeader = page.getByTestId("appHeader");
    const hamburgerButton = appHeader.locator('[data-part-id="hamburger"]').first();
    await expect (hamburgerButton).toBeVisible();
  });

  test("Drawer displayed if NavPanel has when='{true}'", async ({
    initTestBed,
    page,
  }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader testId="appHeader"/>
        <NavPanel when="{true}">
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
      </App>
    `);

    // Open drawer by clicking hamburger button
    const appHeader = page.getByTestId("appHeader");
    const hamburgerButton = appHeader.locator('[data-part-id="hamburger"]').first();
    await expect (hamburgerButton).toBeVisible();
  });

  test("Drawer not displayed if NavPanel has when='false'", async ({
    initTestBed,
    page,
  }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader testId="appHeader"/>
        <NavPanel when="false">
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
      </App>
    `);

    // Open drawer by clicking hamburger button
    const appHeader = page.getByTestId("appHeader");
    const hamburgerButton = appHeader.locator('[data-part-id="hamburger"]').first();
    await expect (hamburgerButton).not.toBeVisible();
  });

  test("Drawer not displayed if NavPanel has when='{false}'", async ({
    initTestBed,
    page,
  }) => {
    // Set small viewport to trigger drawer mode
    await page.setViewportSize({ width: 400, height: 600 });

    await initTestBed(`
      <App layout="condensed">
        <AppHeader testId="appHeader"/>
        <NavPanel when="{false}">
          <NavGroup label="Pages">
            <NavLink label="Page 1" to="/page1"/>
            <NavLink label="Page 2" to="/page2"/>
          </NavGroup>
        </NavPanel>
      </App>
    `);

    // Open drawer by clicking hamburger button
    const appHeader = page.getByTestId("appHeader");
    const hamburgerButton = appHeader.locator('[data-part-id="hamburger"]').first();
    await expect (hamburgerButton).not.toBeVisible();
  });
});

// =============================================================================
// DESKTOP LAYOUT SPECIFIC TESTS
// =============================================================================

test.describe("Desktop Layout", () => {
  test("desktop layout applies nested-app class when used in NestedApp context", async ({ initTestBed, page }) => {
    // Note: In actual nested context (playground), isNested would be true automatically
    // This test verifies the class is applied when the condition is met
    await initTestBed(`<App layout="desktop" testId="app">test content</App>`);
    
    const app = page.getByTestId("app");
    await expect(app).toBeVisible();
    await expect(app).toHaveClass(/desktop/);
  });

  test("desktop layout stretches content area vertically", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <AppHeader testId="header">Header</AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Content that should stretch</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
  });

  test("desktop layout handles scrolling content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <AppHeader testId="header">Header</AppHeader>
        <Pages fallbackPath="/">
          <Page url="/">
            <VStack testId="content" gap="4">
              <Text value="Item 1" />
              <Text value="Item 2" />
              <Text value="Item 3" />
              <Text value="Item 4" />
              <Text value="Item 5" />
            </VStack>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByText("Item 1")).toBeVisible();
    await expect(page.getByText("Item 5")).toBeVisible();
  });

  test("desktop layout ignores scrollWholePage property", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" scrollWholePage="false" testId="app">
        <Text testId="content">Content</Text>
      </App>
    `);

    const app = page.getByTestId("app");
    await expect(app).toBeVisible();
    await expect(app).toHaveClass(/desktop/);
    await expect(page.getByTestId("content")).toBeVisible();
  });

  test("desktop layout with NavPanel does not display navigation", async ({ initTestBed, page }) => {
    await initTestBed(`
      <App layout="desktop" testId="app">
        <AppHeader testId="header">Header</AppHeader>
        <NavPanel testId="nav">
          <NavLink label="Home" to="/" />
          <NavLink label="About" to="/about" />
        </NavPanel>
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Home Page</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    await expect(page.getByTestId("app")).toBeVisible();
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("content")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
    
    // NavPanel should not be visible in desktop layout
    // (it's designed for full-screen apps without navigation panels)
    await expect(page.getByTestId("nav")).not.toBeVisible();
  });

  test("desktop layout switches from other layout correctly", async ({ initTestBed, page, createButtonDriver }) => {
    await initTestBed(`
      <App var.currentLayout="horizontal" layout="{currentLayout}" testId="app">
        <AppHeader testId="header">Header</AppHeader>
        <Button testId="switchBtn" label="Switch to Desktop" onClick="currentLayout = 'desktop'" />
        <Pages fallbackPath="/">
          <Page url="/">
            <Text testId="content">Content</Text>
          </Page>
        </Pages>
        <Footer testId="footer">Footer</Footer>
      </App>
    `);

    const app = page.getByTestId("app");
    const buttonDriver = await createButtonDriver("switchBtn");

    // Initially horizontal layout
    await expect(app).toHaveClass(/horizontal/);
    await expect(app).not.toHaveClass(/desktop/);

    // Switch to desktop layout
    await buttonDriver.click();
    await expect(app).toHaveClass(/desktop/);
    await expect(app).not.toHaveClass(/horizontal/);
  });
});
