import { create } from "domain";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with default props", async ({ initTestBed, createBackdropDriver }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(`<Backdrop>Content</Backdrop>`, {});
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toBeVisible();
  await expect(backdropElement).toHaveCSS(
    "background-color",
    backdropDriver.getDefaultBackgroundColor(),
  );
  await expect(backdropElement).toHaveCSS("opacity", backdropDriver.getDefaultOpacity());
  await expect(backdropDriver.component).toHaveText("Content");
});

test("component renders with custom background color", async ({
  initTestBed,
  createBackdropDriver,
}) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)"; // Red color
  await initTestBed(`<Backdrop backgroundColor="${EXPECTED_COLOR}">Content</Backdrop>`, {});
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", EXPECTED_COLOR);
});

test("component renders with custom opacity", async ({ initTestBed, createBackdropDriver }) => {
  const EXPECTED_OPACITY = "0.5";
  await initTestBed(`<Backdrop opacity="${EXPECTED_OPACITY}">Content</Backdrop>`, {});
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("opacity", EXPECTED_OPACITY);
});

test("component renders with overlay template", async ({ initTestBed, createBackdropDriver }) => {
  await initTestBed(
    `
    <Backdrop>
      <property name="overlayTemplate">
        <H1>Overlay</H1>
      </property>
      Content
    </Backdrop>
  `,
    {},
  );
  const backdropDriver = await createBackdropDriver();
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

test("component handles different background colors", async ({
  initTestBed,
  createBackdropDriver,
}) => {
  await initTestBed(`<Backdrop backgroundColor="blue">Content</Backdrop>`, {});
  const EXPECTED_COLOR = "rgb(0, 0, 255)"; // Blue color
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", EXPECTED_COLOR);
});

test("component handles theme variables", async ({
  initTestBed,
  createBackdropDriver,
}) => {
  await initTestBed(`<Backdrop>Content</Backdrop>`, {
    testThemeVars: {
      "backgroundColor-Backdrop": "rgb(255, 0, 0)", // Red color
      "opacity-Backdrop": "0.75",
    },
  });
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", "rgb(255, 0, 0)"); // Red color
  await expect(backdropElement).toHaveCSS("opacity", "0.75");
});


// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles empty string props gracefully", async ({
  initTestBed,
  createBackdropDriver,
}) => {
  await initTestBed(`<Backdrop backgroundColor="">Content</Backdrop>`, {});
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toHaveCSS("background-color", "rgba(0, 0, 0, 0)"); // Default transparent color
  await expect(backdropElement).toHaveCSS("opacity", "0.1");
});

test("component handles special characters in content correctly", async ({
  initTestBed,
  createBackdropDriver,
}) => {
  await initTestBed(`<Backdrop>Content with special characters: !@#$%^&*()</Backdrop>`, {});
  const backdropDriver = await createBackdropDriver();
  const backdropElement = backdropDriver.getBackdrop();

  await expect(backdropElement).toBeVisible();
  await expect(backdropDriver.component).toContainText("Content with special characters: !@#$%^&*()");
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test("component works correctly with nested content", async ({ initTestBed, createBackdropDriver }) => {
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
    {},
  );
  const backdropDriver = await createBackdropDriver();

  // Test that nested content renders correctly
  await expect(backdropDriver.component).toContainText("Line 1");
  await expect(backdropDriver.component).toContainText("Line 2");

  // Test that backdrop is rendered over the content
  await expect(backdropDriver.getBackdrop()).toBeVisible();
});

test("component works correctly in different layout contexts", async ({
  initTestBed,
  createBackdropDriver,
}) => {
  await initTestBed(
    `
    <HStack>
      <Text>Before</Text>
      <Backdrop backgroundColor="blue" opacity="0.3">Backdrop Content</Backdrop>
      <Text>After</Text>
    </HStack>
  `,
    {},
  );
  const backdropDriver = await createBackdropDriver();

  // Test that backdrop is rendered over the content
  await expect(backdropDriver.getBackdrop()).toBeVisible();
});
