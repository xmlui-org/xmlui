import { test, expect } from "../../testing/fixtures";

const CODE = `
  <AppHeader>
    Hello, World!
  </AppHeader>
`;

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with basic props", async ({ initTestBed, createAppHeaderDriver }) => {
    await initTestBed(`<App><AppHeader testId="header" /></App>`);
    const driver = await createAppHeaderDriver();

    await expect(driver.component).toBeVisible();
  });

  test("renders with title prop", async ({ initTestBed, createAppHeaderDriver }) => {
    const TITLE = "Application Title";
    await initTestBed(`<App><AppHeader testId="header" title="${TITLE}" /></App>`);
    const driver = await createAppHeaderDriver();

    await expect(driver.component).toBeVisible();
    await expect(driver.component).toContainText(TITLE);
  });

  test("renders with custom logo content", async ({ initTestBed, createAppHeaderDriver, page }) => {
    await initTestBed(`
      <App>
        <AppHeader testId="header">
          <property name="logoTemplate">
            <Icon name="star" testId="customLogo" />
          </property>
        </AppHeader>
      </App>`);

    const driver = await createAppHeaderDriver();
    await expect(driver.component).toBeVisible();
    await expect(page.getByTestId("customLogo")).toBeVisible();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test.skip("has correct accessibility structure", async ({
    initTestBed,
    createAppHeaderDriver,
  }) => {
    // TODO: review these Copilot-created tests
    await initTestBed(`<AppHeader testId="header" title="Accessible Header" />`);
    const driver = await createAppHeaderDriver();

    // AppHeader should have a role of "banner"
    await expect(driver.component).toHaveAttribute("role", "banner");
  });

  test.skip("properly handles focus management", async ({ initTestBed, page }) => {
    // TODO: review these Copilot-created tests
    await initTestBed(`<AppHeader testId="header">
      <NavLink testId="headerLink1" to="#">Link 1</NavLink>
      <NavLink testId="headerLink2" to="#">Link 2</NavLink>
    </AppHeader>`);

    // Test that links within the header are keyboard focusable
    await page.getByTestId("headerLink1").focus();
    await expect(page.getByTestId("headerLink1")).toBeFocused();

    // Test tab navigation works between links
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("headerLink2")).toBeFocused();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies background color theme variable correctly", async ({
    initTestBed,
    createAppHeaderDriver,
  }) => {
    const EXPECTED_BG_COLOR = "rgb(0, 240, 0)";
    await initTestBed(`<App><AppHeader testId="header" /></App>`, {
      testThemeVars: {
        "backgroundColor-AppHeader": EXPECTED_BG_COLOR,
      },
    });

    const driver = await createAppHeaderDriver("header");
    await expect(driver.component).toHaveCSS("background-color", EXPECTED_BG_COLOR);
  });

  test("applies height theme variable correctly", async ({
    initTestBed,
    createAppHeaderDriver,
  }) => {
    const EXPECTED_HEIGHT = "80px";
    await initTestBed(`<App><AppHeader testId="header" /></App>`, {
      testThemeVars: {
        "height-AppHeader": EXPECTED_HEIGHT,
      },
    });

    const driver = await createAppHeaderDriver("header");
    await expect(driver.component).toHaveCSS("height", EXPECTED_HEIGHT);
  });

  test("border", async ({ initTestBed, createAppHeaderDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(CODE, {
      testThemeVars: {
        "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createAppHeaderDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderLeft", async ({ initTestBed, createAppHeaderDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(CODE, {
      testThemeVars: {
        "borderLeft-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createAppHeaderDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.describe("Edge Cases", () => {
  test("handles undefined props gracefully", async ({ initTestBed, createAppHeaderDriver }) => {
    await initTestBed(`<App><AppHeader testId="header" title="{undefined}" /></App>`);
    const driver = await createAppHeaderDriver("header");

    // Component should render without errors when props are undefined
    await expect(driver.component).toBeVisible();
  });

  test("handles special characters in title prop", async ({
    initTestBed,
    createAppHeaderDriver,
  }) => {
    const SPECIAL_TITLE = "应用程序 & Test – Special Character's Test 🚀 ñáéíóú ≤≥∞ «»";
    await initTestBed(`<App><AppHeader testId="header" title="${SPECIAL_TITLE}" /></App>`);
    const driver = await createAppHeaderDriver("header");

    // Special characters should display correctly
    await expect(driver.component).toContainText(SPECIAL_TITLE);
  });

  test("handles empty child components", async ({ initTestBed, createAppHeaderDriver }) => {
    await initTestBed(`
      <App>
        <AppHeader testId="header">
          <property name="logoTemplate"></property>
        </AppHeader>
      </App>
    `);

    const driver = await createAppHeaderDriver("header");

    // Component should handle empty template slots gracefully
    await expect(driver.component).toBeVisible();
  });
});
