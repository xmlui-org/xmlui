import { test, expect } from "xmlui/testing";
import type { Page } from "@playwright/test";

const EXT = { extensionIds: "xmlui-website-blocks" };

class BackdropDriver {
  constructor(private readonly page: Page) {}

  get component() {
    return this.page.locator('[class*="backdropContainer"]').first();
  }

  getBackdrop() {
    return this.component.locator('[class*="backdrop_"]').first();
  }

  getOverlay() {
    return this.component.locator('[class*="overlay"]').first();
  }

  getDefaultBackgroundColor() {
    return "rgba(0, 0, 0, 0)";
  }

  getDefaultOpacity() {
    return "0.1";
  }
}

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with default props", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(`<Backdrop>Content</Backdrop>`, EXT);
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toBeVisible();
  await expect(backdropElement).toHaveCSS(
    "background-color",
    backdropDriver.getDefaultBackgroundColor(),
  );
  await expect(backdropElement).toHaveCSS("opacity", backdropDriver.getDefaultOpacity());
  await expect(backdropDriver.component).toHaveText("Content");
});

test("component renders with custom background color", async ({ initTestBed, page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)"; // Red color
  await initTestBed(`<Backdrop backgroundColor="${EXPECTED_COLOR}">Content</Backdrop>`, EXT);
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", EXPECTED_COLOR);
});

test("component renders with custom opacity", async ({ initTestBed, page }) => {
  const EXPECTED_OPACITY = "0.5";
  await initTestBed(`<Backdrop opacity="${EXPECTED_OPACITY}">Content</Backdrop>`, EXT);
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("opacity", EXPECTED_OPACITY);
});

test("component renders with overlay template", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <Backdrop>
      <property name="overlayTemplate">
        <H1>Overlay</H1>
      </property>
      Content
    </Backdrop>
  `,
    EXT,
  );
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toBeVisible();
  await expect(backdropElement).toHaveCSS(
    "background-color",
    backdropDriver.getDefaultBackgroundColor(),
  );
  await expect(backdropElement).toHaveCSS("opacity", backdropDriver.getDefaultOpacity());
  await expect(backdropDriver.component).toContainText("Content");
  await expect(backdropDriver.getOverlay()).toContainText("Overlay");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

// TODO: Implement accessibility tests

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test("component handles different background colors", async ({ initTestBed, page }) => {
  await initTestBed(`<Backdrop backgroundColor="blue">Content</Backdrop>`, EXT);
  const EXPECTED_COLOR = "rgb(0, 0, 255)"; // Blue color
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", EXPECTED_COLOR);
});

test("component handles theme variables", async ({ initTestBed, page }) => {
  await initTestBed(`<Backdrop>Content</Backdrop>`, {
    ...EXT,
    testThemeVars: {
      "backgroundColor-Backdrop": "rgb(255, 0, 0)", // Red color
      "opacity-Backdrop": "0.75",
    },
  });
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", "rgb(255, 0, 0)"); // Red color
  await expect(backdropElement).toHaveCSS("opacity", "0.75");
});


// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles empty string props gracefully", async ({ initTestBed, page }) => {
  await initTestBed(`<Backdrop backgroundColor="">Content</Backdrop>`, EXT);
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", "rgba(0, 0, 0, 0)"); // Default transparent color
  await expect(backdropElement).toHaveCSS("opacity", "0.1");
});

test("component handles special characters in content correctly", async ({ initTestBed, page }) => {
  await initTestBed(`<Backdrop>Content with special characters: !@#$%^&*()</Backdrop>`, EXT);
  const backdropDriver = new BackdropDriver(page);
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toBeVisible();
  await expect(backdropDriver.component).toContainText("Content with special characters: !@#$%^&*()");
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly with nested content", async ({ initTestBed, page }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Backdrop>
      <VStack>
        <Text>Line 1</Text>
        <Text>Line 2</Text>
      </VStack>
    </Backdrop>
  `,
    EXT,
  );
  const backdropDriver = new BackdropDriver(page);

  // Test that nested content renders correctly
  await expect(backdropDriver.component).toContainText("Line 1");
  await expect(backdropDriver.component).toContainText("Line 2");

  // Test that backdrop is rendered over the content
  await expect(backdropDriver.getBackdrop()).toBeVisible();
});

test("component works correctly in different layout contexts", async ({ initTestBed, page }) => {
  await initTestBed(
    `
    <HStack>
      <Text>Before</Text>
      <Backdrop backgroundColor="blue" opacity="0.3">Backdrop Content</Backdrop>
      <Text>After</Text>
    </HStack>
  `,
    EXT,
  );
  const backdropDriver = new BackdropDriver(page);

  // Test that backdrop is rendered over the content
  await expect(backdropDriver.getBackdrop()).toBeVisible();
});
