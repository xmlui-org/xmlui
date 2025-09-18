import { getBounds, SKIP_REASON } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

test("component renders with basic content", async ({ page, initTestBed }) => {
  await initTestBed(
    `<App>
        <Footer>
          <Text testId="footer-text">© 2025 Company Name</Text>
        </Footer>
      </App>`,
  );

  await expect(page.getByTestId("footer-text")).toHaveText("© 2025 Company Name");
});

test("component renders multiple items correctly", async ({ page, initTestBed }) => {
  await initTestBed(
    `
    <App>
      <Footer>
        <Text testId="footer-1">© 2025 Company Name</Text>
        <Text testId="footer-2">Terms of Service</Text>
        <Text testId="footer-3">Privacy Policy</Text>
      </Footer>
    </App>
  `,
  );

  await expect(page.getByTestId("footer-1")).toHaveText("© 2025 Company Name");
  await expect(page.getByTestId("footer-2")).toHaveText("Terms of Service");
  await expect(page.getByTestId("footer-3")).toHaveText("Privacy Policy");
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

test("component has correct accessibility attributes", async ({ page, initTestBed }) => {
  // TODO: review these Copilot-created tests

  await initTestBed(
    `
    <App>
      <Footer testId="footer">
        <Text>© 2025 Company Name</Text>
      </Footer>
    </App>
  `,
    {},
  );

  // Check that the component has the correct role
  await expect(page.getByTestId("footer")).toHaveAttribute("role", "contentinfo");
});

test("component allows interactive elements within it to be focusable", async ({
  page,
  initTestBed,
}) => {
  await initTestBed(
    `
    <App>
      <Footer>
        <Text>© 2025 Company Name</Text>
        <Button testId="button">Contact Us</Button>
      </Footer>
    </App>
  `,
    {},
  );

  // Button within Footer should be focusable
  const button = page.getByTestId("button");
  await button.focus();
  await expect(button).toBeFocused();

  // Should be able to activate with keyboard
  await button.press("Enter");
  await expect(button).toBeVisible(); // Button should still be visible after activation
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

test("component handles empty content gracefully", async ({ page, initTestBed }) => {
  await initTestBed(`<App><Footer testId="footer"></Footer></App>`, {});

  // Component should still render even without children
  await expect(page.getByTestId("footer")).toBeVisible();
});

test("component handles long content correctly", async ({ page, initTestBed }) => {
  const LONG_TEXT = "This is a very long text content that might cause overflow issues if not handled correctly by the footer component. The component should handle this gracefully.";
  await initTestBed(
    `
    <App>
      <Footer>
        <Text testId="footer-text">${LONG_TEXT}</Text>
      </Footer>
    </App>
  `,
  );

  const textElement = page.getByTestId("footer-text");
  await expect(textElement).toBeVisible();
  await expect(textElement).toHaveText(LONG_TEXT);
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual State", () => {
  test("component applies theme variables correctly", async ({ page, initTestBed }) => {
    // TODO: review these Copilot-created tests

    await initTestBed(
      `
      <App>
        <Footer testId="footer">
          <Text>© 2025 Company Name</Text>
        </Footer>
      </App>
  `,
      {
        testThemeVars: {
          "backgroundColor-Footer": "rgb(80, 80, 80)",
          "textColor-Footer": "rgb(255, 0, 0)",
          "borderTop-Footer": "2px solid rgb(200, 200, 200)",
        },
      },
    );

    // Check that theme variables are applied
    const footer = page.getByTestId("footer");
    await expect(footer).toHaveCSS("background-color", "rgb(80, 80, 80)");
    await expect(footer).toHaveCSS("border-top", "2px solid rgb(200, 200, 200)");
    await expect(footer).toHaveCSS("color", "rgb(255, 0, 0)");
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
