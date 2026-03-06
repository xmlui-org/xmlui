import { getBounds } from "../../testing/component-test-helpers";
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
// STICKY PROPERTY TESTS
// =============================================================================

test.describe("sticky property", () => {
  type StickyCase = {
    markup: string;
    scroll: () => Promise<void>;
    expectMode: "same" | "leq";
  };

  test("sticky cases stay fixed across sticky layouts", async ({ page, initTestBed }) => {
    const cases: StickyCase[] = [
      {
        markup: `
          <App layout="horizontal-sticky">
            <Pages fallbackPath="/">
              <Page url="/">
                <Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack>
              </Page>
            </Pages>
            <Footer testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        scroll: async () => {
          await page.evaluate(() => window.scrollBy(0, 500));
          await page.waitForTimeout(100);
        },
        expectMode: "leq",
      },
      {
        markup: `
          <App layout="vertical-sticky">
            <NavPanel><NavLink label="Home" to="/" /></NavPanel>
            <Pages fallbackPath="/">
              <Page url="/">
                <Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack>
              </Page>
            </Pages>
            <Footer testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        scroll: async () => {
          await page.evaluate(() => {
            const contentWrapper = document.querySelector(".contentWrapper") as HTMLElement | null;
            if (contentWrapper) contentWrapper.scrollTop = 500;
          });
          await page.waitForTimeout(100);
        },
        expectMode: "same",
      },
      {
        markup: `
          <App layout="condensed-sticky">
            <Pages fallbackPath="/">
              <Page url="/">
                <Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack>
              </Page>
            </Pages>
            <Footer testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        scroll: async () => {
          await page.evaluate(() => window.scrollBy(0, 500));
          await page.waitForTimeout(100);
        },
        expectMode: "leq",
      },
      {
        markup: `
          <App layout="vertical-full-header">
            <AppHeader><Text>Header</Text></AppHeader>
            <NavPanel><NavLink label="Home" to="/" /></NavPanel>
            <Pages fallbackPath="/">
              <Page url="/">
                <Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack>
              </Page>
            </Pages>
            <Footer testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        scroll: async () => {
          await page.evaluate(() => window.scrollBy(0, 500));
          await page.waitForTimeout(100);
        },
        expectMode: "leq",
      },
      {
        markup: `
          <App layout="horizontal-sticky">
            <Pages fallbackPath="/">
              <Page url="/">
                <Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack>
              </Page>
            </Pages>
            <Footer sticky="true" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        scroll: async () => {
          await page.evaluate(() => window.scrollBy(0, 500));
          await page.waitForTimeout(100);
        },
        expectMode: "leq",
      },
      {
        markup: `
          <App layout="desktop">
            <Pages fallbackPath="/">
              <Page url="/">
                <Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack>
              </Page>
            </Pages>
            <Footer sticky="false" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        scroll: async () => {
          await page.evaluate(() => {
            const pagesWrapper = document.querySelector(".PagesWrapperInner") as HTMLElement | null;
            if (pagesWrapper) pagesWrapper.scrollTop = 500;
          });
          await page.waitForTimeout(100);
        },
        expectMode: "same",
      },
    ];

    for (const current of cases) {
      await initTestBed(current.markup);
      const footer = page.getByTestId("footer");
      await expect(footer).toBeVisible();
      const before = await footer.boundingBox();
      await current.scroll();
      const after = await footer.boundingBox();

      if (current.expectMode === "same") {
        expect(after?.y).toEqual(before?.y);
      } else {
        expect(after?.y).toBeLessThanOrEqual(before?.y);
      }
    }
  });

  test("sticky=false scrolls with content in sticky/non-sticky layouts", async ({
    page,
    initTestBed,
  }) => {
    const cases = [
      {
        markup: `
          <App layout="horizontal-sticky">
            <Pages fallbackPath="/">
              <Page url="/"><Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack></Page>
            </Pages>
            <Footer sticky="false" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        goToBottom: async () => {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(100);
        },
      },
      {
        markup: `
          <App layout="vertical-sticky">
            <NavPanel><NavLink label="Home" to="/" /></NavPanel>
            <Pages fallbackPath="/">
              <Page url="/"><Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack></Page>
            </Pages>
            <Footer sticky="false" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        goToBottom: async () => {
          await page.evaluate(() => {
            const contentWrapper = document.querySelector(".contentWrapper") as HTMLElement | null;
            if (contentWrapper) contentWrapper.scrollTop = contentWrapper.scrollHeight;
          });
          await page.waitForTimeout(100);
        },
      },
      {
        markup: `
          <App layout="condensed-sticky">
            <Pages fallbackPath="/">
              <Page url="/"><Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack></Page>
            </Pages>
            <Footer sticky="false" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        goToBottom: async () => {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(100);
        },
      },
      {
        markup: `
          <App layout="vertical-full-header">
            <AppHeader><Text>Header</Text></AppHeader>
            <NavPanel><NavLink label="Home" to="/" /></NavPanel>
            <Pages fallbackPath="/">
              <Page url="/"><Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack></Page>
            </Pages>
            <Footer sticky="false" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        goToBottom: async () => {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(100);
        },
      },
      {
        markup: `
          <App layout="horizontal">
            <Pages fallbackPath="/">
              <Page url="/"><Stack height="2000px"><Text>Long content to enable scrolling</Text></Stack></Page>
            </Pages>
            <Footer sticky="false" testId="footer"><Text>Footer Content</Text></Footer>
          </App>
        `,
        goToBottom: async () => {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(100);
        },
      },
    ];

    for (const current of cases) {
      await initTestBed(current.markup);
      await current.goToBottom();
      await expect(page.getByTestId("footer")).toBeVisible();
    }
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Visual State", () => {
  const FOOTER_ID = "footer";
  const FOOTER = page => page.getByTestId(FOOTER_ID);
  const FOOTER_CODE = `<Footer testId="${FOOTER_ID}">"This is a footer."</Footer>`;

  test("component applies theme variables correctly", async ({ page, initTestBed }) => {
    await initTestBed(
      `
      <App>
        <Footer testId="footer"><Text>© 2025 Company Name</Text></Footer>
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

    await expect(FOOTER(page)).toHaveCSS("background-color", "rgb(80, 80, 80)");
    await expect(FOOTER(page)).toHaveCSS("border-top", "2px solid rgb(200, 200, 200)");
    await expect(FOOTER(page)).toHaveCSS("color", "rgb(255, 0, 0)");
  });

  test("height", async ({ page, initTestBed }) => {
    const expectedHeightPx = 100;
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "height-Footer": `${expectedHeightPx}px` },
    });
    const { height } = await getBounds(FOOTER(page));
    expect(height).toEqualWithTolerance(expectedHeightPx);
  });

  test("padding", async ({ page, initTestBed }) => {
    const expected = "10px";
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "padding-Footer": expected },
    });
    await expect(FOOTER(page).locator("> div")).toHaveCSS("padding", expected);
  });

  test("paddingHorizontal", async ({ page, initTestBed }) => {
    const expected = "10px";
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "paddingHorizontal-Footer": expected },
    });
    await expect(FOOTER(page).locator("> div")).toHaveCSS("padding-left", expected);
    await expect(FOOTER(page).locator("> div")).toHaveCSS("padding-right", expected);
  });

  test("paddingVertical", async ({ page, initTestBed }) => {
    const expected = "10px";
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "paddingVertical-Footer": expected },
    });
    await expect(FOOTER(page).locator("> div")).toHaveCSS("padding-top", expected);
    await expect(FOOTER(page).locator("> div")).toHaveCSS("padding-bottom", expected);
  });

  test("bg-color", async ({ page, initTestBed }) => {
    const expected = "rgb(255, 0, 0)";
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "backgroundColor-Footer": expected },
    });
    await expect(FOOTER(page)).toHaveCSS("background-color", expected);
  });

  test("fontSize", async ({ page, initTestBed }) => {
    const expected = "20px";
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "fontSize-Footer": expected },
    });
    await expect(FOOTER(page).locator("> div")).toHaveCSS("font-size", expected);
  });

  test("vertical-alignment", async ({ page, initTestBed }) => {
    const expected = "center";
    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "vertical-alignment-Footer": expected },
    });
    await expect(FOOTER(page).locator("> div")).toHaveCSS("align-items", expected);
  });

  const sides = ["top", "right", "bottom", "left"] as const;
  const borderProp = (side: (typeof sides)[number], part: "color" | "width" | "style") =>
    `border-${side}-${part}`;

  test("border-side family", async ({ page, initTestBed }) => {
    const red = { color: "rgb(255, 0, 0)", width: "5px", style: "dotted" };
    const green = { color: "rgb(0, 128, 0)", width: "8px", style: "double" };

    const assertBorder = async (
      expected: Partial<Record<(typeof sides)[number], typeof red>>,
      absentRef?: typeof red,
    ) => {
      for (const side of sides) {
        const sideExpected = expected[side];
        if (sideExpected) {
          await expect(FOOTER(page)).toHaveCSS(borderProp(side, "color"), sideExpected.color);
          await expect(FOOTER(page)).toHaveCSS(borderProp(side, "width"), sideExpected.width);
          await expect(FOOTER(page)).toHaveCSS(borderProp(side, "style"), sideExpected.style);
        } else if (absentRef) {
          await expect(FOOTER(page)).not.toHaveCSS(borderProp(side, "color"), absentRef.color);
          await expect(FOOTER(page)).not.toHaveCSS(borderProp(side, "width"), absentRef.width);
          await expect(FOOTER(page)).not.toHaveCSS(borderProp(side, "style"), absentRef.style);
        }
      }
    };

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "border-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ top: red, right: red, bottom: red, left: red });

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "borderLeft-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ left: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "borderRight-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ right: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "borderHorizontal-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ right: red, left: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontal-Footer": `${red.style} ${red.color} ${red.width}`,
        "borderLeft-Footer": `${green.width} ${green.style} ${green.color}`,
      },
    });
    await assertBorder({ right: red, left: green }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderHorizontal-Footer": `${red.style} ${red.color} ${red.width}`,
        "borderRight-Footer": `${green.width} ${green.style} ${green.color}`,
      },
    });
    await assertBorder({ right: green, left: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "borderTop-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ top: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "borderBottom-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ bottom: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: { "borderVertical-Footer": `${red.style} ${red.color} ${red.width}` },
    });
    await assertBorder({ top: red, bottom: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVertical-Footer": `${red.style} ${red.color} ${red.width}`,
        "borderTop-Footer": `${green.width} ${green.style} ${green.color}`,
      },
    });
    await assertBorder({ top: green, bottom: red }, red);

    await initTestBed(FOOTER_CODE, {
      testThemeVars: {
        "borderVertical-Footer": `${red.style} ${red.color} ${red.width}`,
        "borderBottom-Footer": `${green.width} ${green.style} ${green.color}`,
      },
    });
    await assertBorder({ top: red, bottom: green }, red);
  });

  test("border-color family", async ({ page, initTestBed }) => {
    const base = { color: "rgb(255, 0, 0)", width: "5px", style: "dotted" };
    const updated = "rgb(0, 128, 0)";

    const cases: Array<{ varName: string; sideMap: Partial<Record<(typeof sides)[number], string>> }> = [
      { varName: "borderColor", sideMap: { top: updated, right: updated, bottom: updated, left: updated } },
      { varName: "borderHorizontalColor", sideMap: { right: updated, left: updated } },
      { varName: "borderLeftColor", sideMap: { left: updated } },
      { varName: "borderRightColor", sideMap: { right: updated } },
      { varName: "borderVerticalColor", sideMap: { top: updated, bottom: updated } },
      { varName: "borderTopColor", sideMap: { top: updated } },
      { varName: "borderBottomColor", sideMap: { bottom: updated } },
    ];

    for (const current of cases) {
      await initTestBed(FOOTER_CODE, {
        testThemeVars: {
          "border-Footer": `${base.style} ${base.color} ${base.width}`,
          [`${current.varName}-Footer`]: updated,
        },
      });

      for (const side of sides) {
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "color"), current.sideMap[side] ?? base.color);
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "width"), base.width);
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "style"), base.style);
      }
    }
  });

  test("border-style family", async ({ page, initTestBed }) => {
    const base = { color: "rgb(0, 128, 0)", width: "5px", style: "dotted" };
    const updated = "double";

    const cases: Array<{ varName: string; sideMap: Partial<Record<(typeof sides)[number], string>> }> = [
      { varName: "borderStyle", sideMap: { top: updated, right: updated, bottom: updated, left: updated } },
      { varName: "borderHorizontalStyle", sideMap: { right: updated, left: updated } },
      { varName: "borderLeftStyle", sideMap: { left: updated } },
      { varName: "borderRightStyle", sideMap: { right: updated } },
      { varName: "borderVerticalStyle", sideMap: { top: updated, bottom: updated } },
      { varName: "borderTopStyle", sideMap: { top: updated } },
      { varName: "borderBottomStyle", sideMap: { bottom: updated } },
    ];

    for (const current of cases) {
      await initTestBed(FOOTER_CODE, {
        testThemeVars: {
          "border-Footer": `${base.style} ${base.color} ${base.width}`,
          [`${current.varName}-Footer`]: updated,
        },
      });

      for (const side of sides) {
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "color"), base.color);
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "width"), base.width);
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "style"), current.sideMap[side] ?? base.style);
      }
    }
  });

  test("border-thickness family", async ({ page, initTestBed }) => {
    const base = { color: "rgb(255, 0, 0)", width: "5px", style: "dotted" };
    const updated = "12px";

    const cases: Array<{ varName: string; sideMap: Partial<Record<(typeof sides)[number], string>> }> = [
      { varName: "borderWidth", sideMap: { top: updated, right: updated, bottom: updated, left: updated } },
      { varName: "borderHorizontalWidth", sideMap: { right: updated, left: updated } },
      { varName: "borderLeftWidth", sideMap: { left: updated } },
      { varName: "borderRightWidth", sideMap: { right: updated } },
      { varName: "borderVerticalWidth", sideMap: { top: updated, bottom: updated } },
      { varName: "borderTopWidth", sideMap: { top: updated } },
      { varName: "borderBottomWidth", sideMap: { bottom: updated } },
    ];

    for (const current of cases) {
      await initTestBed(FOOTER_CODE, {
        testThemeVars: {
          "border-Footer": `${base.style} ${base.color} ${base.width}`,
          [`${current.varName}-Footer`]: updated,
        },
      });

      for (const side of sides) {
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "color"), base.color);
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "width"), current.sideMap[side] ?? base.width);
        await expect(FOOTER(page)).toHaveCSS(borderProp(side, "style"), base.style);
      }
    }
  });
});
