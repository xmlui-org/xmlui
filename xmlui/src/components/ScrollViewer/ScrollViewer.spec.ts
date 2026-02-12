import { test, expect } from "../../testing/fixtures";
import { getBounds } from "../../testing/component-test-helpers";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.describe("Basic Functionality", () => {
  test("renders with default props", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("renders with scrollStyle='normal'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="normal">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("renders with scrollStyle='overlay'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("renders with scrollStyle='whenMouseOver'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="whenMouseOver">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("renders with scrollStyle='whenScrolling'", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="whenScrolling">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("renders multiple children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer">
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("First")).toBeVisible();
    await expect(page.getByText("Second")).toBeVisible();
    await expect(page.getByText("Third")).toBeVisible();
  });

  test("stretches to fill parent container", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack testId="parent" width="500px" height="300px">
        <ScrollViewer testId="viewer">
          <Text>Content</Text>
        </ScrollViewer>
      </Stack>
    `);

    const { width: parentWidth, height: parentHeight } = await getBounds(
      page.getByTestId("parent")
    );
    const { width: viewerWidth, height: viewerHeight } = await getBounds(
      page.getByTestId("viewer")
    );

    // ScrollViewer should fill parent dimensions
    expect(viewerWidth).toBeCloseTo(parentWidth, 0);
    expect(viewerHeight).toBeCloseTo(parentHeight, 0);
  });

  test("handles scrollable content", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="overlay">
          <Stack>
            <Text>Line 1</Text>
            <Text>Line 2</Text>
            <Text>Line 3</Text>
            <Text>Line 4</Text>
            <Text>Line 5</Text>
            <Text>Line 6</Text>
            <Text>Line 7</Text>
            <Text>Line 8</Text>
            <Text>Line 9</Text>
            <Text>Line 10</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Line 1", { exact: true })).toBeVisible();
  });

  test("showScrollerFade is true by default", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="overlay">
          <Stack height="500px">
            <Text>Tall content</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    // Fade overlays should be visible
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });

  test("showScrollerFade displays fade indicators", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="overlay" showScrollerFade="true">
          <Stack height="500px">
            <Text>Tall content</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    // Fade overlays should exist (top and bottom)
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });

  test("bottom fade is visible when not at bottom", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="overlay" showScrollerFade="true">
          <Stack height="500px">
            <Text>Tall content</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Bottom fade should be visible (has fadeVisible class)
    const bottomFade = page.locator("[class*='fadeBottom'][class*='fadeVisible']");
    await expect(bottomFade).toBeVisible();
  });

  test("top fade appears when scrolled down", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="overlay" showScrollerFade="true">
          <Stack height="500px">
            <Text testId="content">Tall content</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Scroll down
    const viewer = page.getByTestId("viewer");
    await viewer.evaluate((el) => {
      el.querySelector('[data-overlayscrollbars-viewport]')?.scrollTo(0, 50);
    });

    // Wait for fade to update
    await page.waitForTimeout(100);

    // Top fade should now be visible
    const topFade = page.locator("[class*='fadeTop'][class*='fadeVisible']");
    await expect(topFade).toBeVisible();
  });

  test("showScrollerFade works with whenMouseOver scrollStyle", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="whenMouseOver" showScrollerFade="true">
          <Stack height="500px">
            <Text>Tall content</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Fade overlays should exist
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });

  test("showScrollerFade works with whenScrolling scrollStyle", async ({ initTestBed, page }) => {
    await initTestBed(`
      <Stack height="200px">
        <ScrollViewer testId="viewer" scrollStyle="whenScrolling" showScrollerFade="true">
          <Stack height="500px">
            <Text>Tall content</Text>
          </Stack>
        </ScrollViewer>
      </Stack>
    `);

    // Wait for initialization
    await page.waitForTimeout(100);

    // Fade overlays should exist
    const fadeOverlays = page.locator("[class*='fadeOverlay']");
    await expect(fadeOverlays).toHaveCount(2);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.describe("Accessibility", () => {
  test("children are accessible", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer>
        <Button>Click me</Button>
      </ScrollViewer>
    `);

    const button = page.getByRole("button", { name: "Click me" });
    await expect(button).toBeVisible();
    await button.click();
  });

  test("maintains keyboard navigation for children", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer>
        <Button testId="btn1">First</Button>
        <Button testId="btn2">Second</Button>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("btn1")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("btn1")).toBeFocused();
    
    await expect(page.getByTestId("btn1")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("btn2")).toBeFocused();
  });
});

// =============================================================================
// THEME VARIABLE TESTS
// =============================================================================

test.describe("Theme Variables", () => {
  test("applies size-Scroller theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Stack height="500px">
          <Text>Tall content</Text>
        </Stack>
      </ScrollViewer>
    `,
      {
        testThemeVars: {
          "size-Scroller": "20px",
        },
      }
    );

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
  });

  test("applies backgroundColor-handle-Scroller theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Stack height="500px">
          <Text>Tall content</Text>
        </Stack>
      </ScrollViewer>
    `,
      {
        testThemeVars: {
          "backgroundColor-handle-Scroller": "rgb(255, 0, 0)",
        },
      }
    );

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
  });

  test("applies borderRadius-handle-Scroller theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Stack height="500px">
          <Text>Tall content</Text>
        </Stack>
      </ScrollViewer>
    `,
      {
        testThemeVars: {
          "borderRadius-handle-Scroller": "0px",
        },
      }
    );

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
  });

  test("applies minSize-handle-Scroller theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Stack height="500px">
          <Text>Tall content</Text>
        </Stack>
      </ScrollViewer>
    `,
      {
        testThemeVars: {
          "minSize-handle-Scroller": "50px",
        },
      }
    );

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
  });

  test("applies backgroundColor-track-Scroller theme variable", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Stack height="500px">
          <Text>Tall content</Text>
        </Stack>
      </ScrollViewer>
    `,
      {
        testThemeVars: {
          "backgroundColor-track-Scroller": "rgb(200, 200, 200)",
        },
      }
    );

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
  });

  test("applies multiple theme variables together", async ({ initTestBed, page }) => {
    await initTestBed(
      `
      <ScrollViewer testId="viewer" scrollStyle="overlay">
        <Stack height="500px">
          <Text>Tall content</Text>
        </Stack>
      </ScrollViewer>
    `,
      {
        testThemeVars: {
          "size-Scroller": "15px",
          "backgroundColor-handle-Scroller": "rgb(0, 0, 255)",
          "borderRadius-handle-Scroller": "5px",
          "backgroundColor-track-Scroller": "rgb(220, 220, 220)",
        },
      }
    );

    const viewer = page.getByTestId("viewer");
    await expect(viewer).toBeVisible();
  });
});

// =============================================================================
// OTHER EDGE CASE TESTS
// =============================================================================

test.describe("Other Edge Cases", () => {
  test("handles empty content", async ({ initTestBed, page }) => {
    await initTestBed(`<ScrollViewer testId="viewer" />`);

    await expect(page.getByTestId("viewer")).toBeVisible();
  });

  test("handles null scrollStyle gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="{null}">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    // Should default to "normal"
    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("handles undefined scrollStyle gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="{undefined}">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    // Should default to "normal"
    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("handles invalid scrollStyle gracefully", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer" scrollStyle="invalidValue">
        <Text>Content</Text>
      </ScrollViewer>
    `);

    // Should default to "normal"
    await expect(page.getByTestId("viewer")).toBeVisible();
    await expect(page.getByText("Content")).toBeVisible();
  });

  test("works with nested ScrollViewers", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="outer" scrollStyle="normal">
        <ScrollViewer testId="inner" scrollStyle="overlay">
          <Text>Nested content</Text>
        </ScrollViewer>
      </ScrollViewer>
    `);

    await expect(page.getByTestId("outer")).toBeVisible();
    await expect(page.getByTestId("inner")).toBeVisible();
    await expect(page.getByText("Nested content")).toBeVisible();
  });

  test("preserves content dimensions", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer">
        <Stack testId="content" width="300px" height="200px">
          <Text>Fixed size content</Text>
        </Stack>
      </ScrollViewer>
    `);

    const { width, height } = await getBounds(page.getByTestId("content"));

    expect(width).toBeCloseTo(300, 0);
    expect(height).toBeCloseTo(200, 0);
  });

  test("handles dynamic content updates", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(`
      <Fragment>
        <ScrollViewer testId="viewer">
          <Text>{testState || 'Initial'}</Text>
        </ScrollViewer>
        <Button onClick="testState = 'Updated'">Update</Button>
      </Fragment>
    `);

    await expect(page.getByText("Initial")).toBeVisible();

    await page.getByRole("button").click();
    await expect.poll(testStateDriver.testState).toEqual("Updated");
    await expect(page.getByTestId("viewer").getByText("Updated")).toBeVisible();
  });

  test("works with different content types", async ({ initTestBed, page }) => {
    await initTestBed(`
      <ScrollViewer testId="viewer">
        <Text>Text content</Text>
        <Button>Button</Button>
        <Image src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Test" />
        <TextBox placeholder="Input" />
      </ScrollViewer>
    `);

    await expect(page.getByText("Text content")).toBeVisible();
    await expect(page.getByRole("button")).toBeVisible();
    await expect(page.getByRole("img")).toBeVisible();
    await expect(page.getByPlaceholder("Input")).toBeVisible();
  });
});
