import { test, expect } from "../../testing/fixtures";

// =============================================================================
// VALIDATION TESTS FOR APP PLACEHOLDER COMPONENTS
// =============================================================================

test.describe("App Placeholder Component Validation", () => {
  test("AppHeader throws error when used outside App", async ({ page, initTestBed }) => {
    let errorMessage = "";
    page.on("pageerror", (error) => {
      errorMessage = error.message;
    });

    await initTestBed(`<AppHeader />`);
    
    await expect
      .poll(() => errorMessage, { timeout: 2000 })
      .toContain("<AppHeader> can only be used as a direct child of <App> or <App2> components");
  });

  test("NavPanel throws error when used outside App", async ({ page, initTestBed }) => {
    let errorMessage = "";
    page.on("pageerror", (error) => {
      errorMessage = error.message;
    });

    await initTestBed(`<NavPanel />`);
    
    await expect
      .poll(() => errorMessage, { timeout: 2000 })
      .toContain("<NavPanel> can only be used as a direct child of <App> or <App2> components");
  });

  test("Logo throws error when used outside App", async ({ page, initTestBed }) => {
    let errorMessage = "";
    page.on("pageerror", (error) => {
      errorMessage = error.message;
    });

    await initTestBed(`<Logo />`);
    
    await expect
      .poll(() => errorMessage, { timeout: 2000 })
      .toContain("<Logo> can only be used as a direct child of <App> or <App2> components");
  });

  test("Pages throws error when used outside App", async ({ page, initTestBed }) => {
    let errorMessage = "";
    page.on("pageerror", (error) => {
      errorMessage = error.message;
    });

    await initTestBed(`<Pages />`);
    
    await expect
      .poll(() => errorMessage, { timeout: 2000 })
      .toContain("<Pages> can only be used as a direct child of <App> or <App2> components");
  });

  test("Footer throws error when used outside App", async ({ page, initTestBed }) => {
    let errorMessage = "";
    page.on("pageerror", (error) => {
      errorMessage = error.message;
    });

    await initTestBed(`<Footer />`);
    
    await expect
      .poll(() => errorMessage, { timeout: 2000 })
      .toContain("<Footer> can only be used as a direct child of <App> or <App2> components");
  });

  test("AppHeader works correctly inside App", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <AppHeader title="Test App" />
      </App>
    `);
    
    // Just verify the app renders without errors
    await expect(page.locator("body")).toBeVisible();
  });

  test("NavPanel works correctly inside App", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App layout="vertical">
        <NavPanel>
          <NavLink to="/" label="Home" />
        </NavPanel>
      </App>
    `);
    
    // Just verify the app renders without errors and nav link is present
    await expect(page.getByText("Home")).toBeVisible();
  });

  test("Footer works correctly inside App", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Footer>Footer content</Footer>
      </App>
    `);
    
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("Pages works correctly inside App", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App>
        <Pages>
          <Page url="/">Home</Page>
        </Pages>
      </App>
    `);
    
    await expect(page.locator(".xmlui-page-root")).toBeVisible();
  });

  test("All placeholders work correctly inside App2", async ({ page, initTestBed }) => {
    await initTestBed(`
      <App2>
        <AppHeader title="Test" />
        <NavPanel>
          <NavLink to="/" label="Home" />
        </NavPanel>
        <Pages>
          <Page url="/">Home Content</Page>
        </Pages>
        <Footer>Footer Text</Footer>
      </App2>
    `);
    
    // Verify components render without errors
    await expect(page.getByText("Home Content")).toBeVisible();
    await expect(page.getByText("Footer Text")).toBeVisible();
  });
});
