import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test.fixme(
  "component renders with basic content",
  SKIP_REASON.REFACTOR("This is not how we should test the rendering of the Footer"),
  async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <Footer>
      <Text>© 2025 Company Name</Text>
    </Footer>
  `,
      {},
    );

    // Check that the component is visible
    await expect(page.locator(".footer")).toBeVisible();

    // Check that content is rendered
    await expect(page.locator("text=© 2025 Company Name")).toBeVisible();
  },
);

test.skip("component renders multiple items correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>© 2025 Company Name</Text>
      <Text>Terms of Service</Text>
      <Text>Privacy Policy</Text>
    </Footer>
  `,
    {},
  );

  // Check that all items are rendered
  await expect(page.locator("text=© 2025 Company Name")).toBeVisible();
  await expect(page.locator("text=Terms of Service")).toBeVisible();
  await expect(page.locator("text=Privacy Policy")).toBeVisible();
});

test.skip("component applies layout to children correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>Item 1</Text>
      <Text>Item 2</Text>
      <Text>Item 3</Text>
    </Footer>
  `,
    {},
  );

  // Get the bounding boxes of items
  const item1Bounds = await page.locator("text=Item 1").boundingBox();
  const item2Bounds = await page.locator("text=Item 2").boundingBox();
  const item3Bounds = await page.locator("text=Item 3").boundingBox();

  // Items should be arranged horizontally (same y coordinate)
  expect(item1Bounds.y).toBeCloseTo(item2Bounds.y, 0);
  expect(item2Bounds.y).toBeCloseTo(item3Bounds.y, 0);

  // Items should be arranged left-to-right
  expect(item1Bounds.x).toBeLessThan(item2Bounds.x);
  expect(item2Bounds.x).toBeLessThan(item3Bounds.x);
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test.skip("component has correct accessibility attributes", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>© 2025 Company Name</Text>
    </Footer>
  `,
    {},
  );

  // Check that the component has the correct role
  await expect(page.locator(".footer")).toHaveAttribute("role", "contentinfo");
});

test.skip("component is not keyboard focusable", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>© 2025 Company Name</Text>
    </Footer>
  `,
    {},
  );

  // Footer itself should not be focusable
  const tabIndex = await page.locator(".footer").getAttribute("tabindex");
  expect(tabIndex).not.toBe("0");

  await page.locator(".footer").focus();
  await expect(page.locator(".footer")).not.toBeFocused();
});

test.skip("component allows interactive elements within it to be focusable", async ({
  page,
  initTestBed,
}) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>© 2025 Company Name</Text>
      <Button>Contact Us</Button>
    </Footer>
  `,
    {},
  );

  // Button within footer should be focusable
  const button = page.locator("button");
  await button.focus();
  await expect(button).toBeFocused();

  // Should be able to activate with keyboard
  await button.press("Enter");
  await expect(button).toBeVisible(); // Button should still be visible after activation
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test.skip("component handles empty content gracefully", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(`<Footer></Footer>`, {});

  // Component should still render even without children
  await expect(page.locator(".footer")).toBeVisible();
});

test.skip("component handles long content correctly", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>This is a very long text content that might cause overflow issues if not handled correctly by the footer component. The component should handle this gracefully.</Text>
    </Footer>
  `,
    {},
  );

  // Component should still render with long content
  await expect(page.locator(".footer")).toBeVisible();
  await expect(page.locator("text=This is a very long text")).toBeVisible();

  // The content should not overflow the viewport width
  const footerBounds = await page.locator(".footer").boundingBox();
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  expect(footerBounds.width).toBeLessThanOrEqual(viewportWidth);
});

test.skip("component handles different screen sizes", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>© 2025 Company Name</Text>
      <Text>Terms of Service</Text>
      <Text>Privacy Policy</Text>
    </Footer>
  `,
    {},
  );

  // Test on mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator(".footer")).toBeVisible();

  // Test on desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator(".footer")).toBeVisible();
});

// =============================================================================
// PERFORMANCE TESTS
// =============================================================================

test.skip("component handles many items efficiently", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  // Create a Footer with many items
  const manyItems = Array(10)
    .fill(0)
    .map((_, i) => `<Text>Item ${i}</Text>`)
    .join("");

  await initTestBed(
    `
    <Footer>
      ${manyItems}
    </Footer>
  `,
    {},
  );

  // Check that all items are rendered
  await expect(page.locator("text=Item 0")).toBeVisible();
  await expect(page.locator("text=Item 9")).toBeVisible();

  // Component should still be responsive
  await expect(page.locator(".footer")).toBeVisible();
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

test.skip("component works correctly with different child component types", async ({
  page,
  initTestBed,
}) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <Footer>
      <Text>© 2025 Company Name</Text>
      <Button>Contact Us</Button>
      <Icon name="star" />
      <Image src="placeholder.png" alt="Placeholder" />
    </Footer>
  `,
    {},
  );

  // Check that all different component types are rendered
  await expect(page.locator("text=© 2025 Company Name")).toBeVisible();
  await expect(page.locator("button")).toBeVisible();
  await expect(page.locator("svg")).toBeVisible();
  await expect(page.locator("img")).toBeVisible();
});

test.skip("component sticks to the bottom in a page layout", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <VStack style="height: 400px; display: flex; flex-direction: column;">
      <Header>Header Content</Header>
      <Main style="flex: 1;">Main Content</Main>
      <Footer>© 2025 Company Name</Footer>
    </VStack>
  `,
    {},
  );

  // Check that the footer is at the bottom of the container
  const containerBounds = await page.locator(".v-stack").boundingBox();
  const footerBounds = await page.locator(".footer").boundingBox();

  // Footer should be at the bottom of the container
  expect(footerBounds.y + footerBounds.height).toBeCloseTo(
    containerBounds.y + containerBounds.height,
    0,
  );
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual State", () => {
  test.skip("component applies theme variables correctly", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <Footer>
      <Text>© 2025 Company Name</Text>
    </Footer>
  `,
      {
        testThemeVars: {
          "backgroundColor-Footer": "rgb(240, 240, 240)",
          "textColor-Footer": "rgb(50, 50, 50)",
          "borderTop-Footer": "2px solid rgb(200, 200, 200)",
        },
      },
    );

    // Check that theme variables are applied
    await expect(page.locator(".footer")).toHaveCSS("background-color", "rgb(240, 240, 240)");
    await expect(page.locator(".footer")).toHaveCSS("color", "rgb(50, 50, 50)");
    await expect(page.locator(".footer")).toHaveCSS("border-top", "2px solid rgb(200, 200, 200)");
  });

  test.skip("component has correct vertical alignment", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
    <Footer>
      <Text>© 2025 Company Name</Text>
    </Footer>
  `,
      {
        testThemeVars: {
          "verticalAlignment-Footer": "center",
        },
      },
    );

    // Check vertical alignment
    await expect(page.locator(".footer")).toHaveCSS("align-items", "center");
  });

  const FOOTER_ID = "footer";
  const FOOTER_CODE = `<Footer testId="${FOOTER_ID}">"This is a footer."</Footer>`;

  test(`height`, async ({ page, initTestBed }) => {
    const expectedHeightPx = 100;

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "height-Footer": expectedHeightPx + "px",
      },
    });

    const { height } = await getBounds(page.getByTestId(FOOTER_ID));
    expect(height).toEqualWithTolerance(expectedHeightPx);
  });

  test(`padding`, async ({ page, initTestBed }) => {
    const expectedPadding = "10px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "padding-Footer": expectedPadding,
      },
    });

    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "padding",
      expectedPadding,
    );
  });

  test("paddingHorizontal", async ({ page, initTestBed }) => {
    const expectedPadding = "10px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "paddingHorizontal-Footer": expectedPadding,
      },
    });
    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "padding-left",
      expectedPadding,
    );
    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "padding-right",
      expectedPadding,
    );
  });

  test("paddingVertical", async ({ page, initTestBed }) => {
    const expectedPadding = "10px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "paddingVertical-Footer": expectedPadding,
      },
    });
    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "padding-top",
      expectedPadding,
    );
    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "padding-bottom",
      expectedPadding,
    );
  });

  test(`bg-color`, async ({ page, initTestBed }) => {
    const expectedBackgroundColor = "rgb(255, 0, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "backgroundColor-Footer": expectedBackgroundColor,
      },
    });

    await expect(page.getByTestId(FOOTER_ID)).toHaveCSS(
      "background-color",
      expectedBackgroundColor,
    );
  });

  test(`fontSize`, async ({ page, initTestBed }) => {
    const expectedFontSizePx = "20px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "fontSize-Footer": expectedFontSizePx,
      },
    });

    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "font-size",
      expectedFontSizePx,
    );
  });

  test(`vertical-alignment`, async ({ page, initTestBed }) => {
    const expectedAlignment = "center";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "vertical-alignment-Footer": expectedAlignment,
      },
    });

    await expect(page.getByTestId(FOOTER_ID).locator("> div")).toHaveCSS(
      "align-items",
      expectedAlignment,
    );
  });

  test("border", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderLeft", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderLeft-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderRight", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderRight-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderHorizontal", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderHorizontal and borderLeft", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderLeft-Footer": "8px double rgb(0, 128, 0)",
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", "8px");
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", "double");
  });

  test("borderHorizontal and borderRight", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontal-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderRight-Footer": "8px double rgb(0, 128, 0)",
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", "8px");
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", "double");
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderTop", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderTop-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderBottom", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderBottom-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderVertical", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderVertical and borderTop", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderTop-Footer": "8px double rgb(0, 128, 0)",
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", "8px");
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", "double");
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderVertical and borderBottom", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVertical-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderBottom-Footer": "8px double rgb(0, 128, 0)",
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", "8px");
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", "double");
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border-color", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderColor-Footer": EXPECTED_COLOR,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-horizontal", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontalColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-left", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderLeftColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-right", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderRightColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-vertical", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVerticalColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-top", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderTopColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-bottom", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderBottomColor-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border-style", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderStyle-Footer": EXPECTED_STYLE,
      },
    });

    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", UPDATED);
  });

  test("border, border-style-horizontal", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontalStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", UPDATED);
  });

  test("border, border-style-left", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderLeftStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", UPDATED);
  });

  test("border, border-style-right", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderRightStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style-vertical", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVerticalStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style-top", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderTopStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style-bottom", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderBottomStyle-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border-thickness", async ({ page, initTestBed }) => {
    const EXPECTED_WIDTH = "8px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderWidth-Footer": EXPECTED_WIDTH,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", "0px");
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", "0px");
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", "0px");
  });

  test("border, border-thickness", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-horizontal", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontalWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-left", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderLeftWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-right", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderRightWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-vertical", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVerticalWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-top", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderTopWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-bottom", async ({ page, initTestBed }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderBottomWidth-Footer": UPDATED,
        "border-Footer": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });

    await expect(page.getByTestId("footer")).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-width", UPDATED);
    await expect(page.getByTestId("footer")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(page.getByTestId("footer")).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
});
