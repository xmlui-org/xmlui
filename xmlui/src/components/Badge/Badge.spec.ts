import { getBounds, getStyles } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

test.describe("Basic Functionality For All Variants", () => {
  test("Component can render", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="badge" />`);
    await expect(page.getByTestId("badge")).toBeVisible();
  });
});

// =============================================================================
// BADGE TESTS
// =============================================================================

test.describe("Badge-specific Functionality", () => {
  test("colorMap background", async ({ initTestBed, page }) => {
    const EXPECTED_BG_COLOR_IMP = "rgb(255, 0, 0)";
    const EXPECTED_BG_COLOR_REG = "rgb(255, 255, 0)";
    await initTestBed(`
      <Fragment>
        <variable name="simpleColorMap"
          value="{{ important: '${EXPECTED_BG_COLOR_IMP}', regular: '${EXPECTED_BG_COLOR_REG}' }}" />
        <Badge testId="badgeImp" value="important" colorMap="{simpleColorMap}" />
        <Badge testId="badgeReg" value="regular" colorMap="{simpleColorMap}" />
      </Fragment>
    `);

    await expect(page.getByTestId("badgeImp")).toHaveCSS("background-color", EXPECTED_BG_COLOR_IMP);
    await expect(page.getByTestId("badgeReg")).toHaveCSS("background-color", EXPECTED_BG_COLOR_REG);
  });

  test("colorMap background and label", async ({ initTestBed, page }) => {
    const EXPECTED_TEXT_COLOR_IMP = "rgb(255, 0, 0)";
    const EXPECTED_BG_COLOR_IMP = "rgb(0, 255, 0)";
    const EXPECTED_TEXT_COLOR_REG = "rgb(0, 0, 255)";
    const EXPECTED_BG_COLOR_REG = "rgb(255, 255, 0)";

    await initTestBed(`
      <Fragment>
        <variable name="simpleColorMap"
          value="{{
            important: {label: '${EXPECTED_TEXT_COLOR_IMP}', background: '${EXPECTED_BG_COLOR_IMP}'},
            regular: {label: '${EXPECTED_TEXT_COLOR_REG}', background: '${EXPECTED_BG_COLOR_REG}'} }}"
        />
        <Badge testId="badgeImp" value="important" colorMap="{simpleColorMap}" />
        <Badge testId="badgeReg" value="regular" colorMap="{simpleColorMap}" />
      </Fragment>
    `);

    await expect(page.getByTestId("badgeImp")).toHaveCSS("background-color", EXPECTED_BG_COLOR_IMP);
    await expect(page.getByTestId("badgeImp")).toHaveCSS("color", EXPECTED_TEXT_COLOR_IMP);
    await expect(page.getByTestId("badgeReg")).toHaveCSS("background-color", EXPECTED_BG_COLOR_REG);
    await expect(page.getByTestId("badgeReg")).toHaveCSS("color", EXPECTED_TEXT_COLOR_REG);
  });
});

// =============================================================================
// PILL TESTS
// =============================================================================

test.describe("Pill-specific Functionality", () => {
  test("Is pill shaped", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge variant="pill" testId="badge" />`);

    const { width, height } = await getBounds(page.getByTestId("badge"));
    const smaller = Math.min(width, height);
    const minRadius = smaller / 2;
    const { borderRadius } = await getStyles(page.getByTestId("badge"), "border-radius");
    const radius = parseInt(borderRadius, 10);

    expect(radius).toBeGreaterThanOrEqual(minRadius);
  });

  test("fontSize", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_FONT_SIZE = "18px";
    await initTestBed(`<Badge variant="pill" value="test content" />`, {
      testThemeVars: {
        "fontSize-Badge-pill": EXPECTED_FONT_SIZE,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("font-size", EXPECTED_FONT_SIZE);
  });

  test("fontWeight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_FONT_WEIGHT = "700";
    await initTestBed(`<Badge variant="pill" value="test content" />`, {
      testThemeVars: {
        "fontWeight-Badge-pill": EXPECTED_FONT_WEIGHT,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("font-weight", EXPECTED_FONT_WEIGHT);
  });
});

// =============================================================================
// VISUAL STATE TESTS
// =============================================================================

test.describe("Theme Vars: Badge", () => {
  test("backgroundColor", async ({ initTestBed, page }) => {
    const EXPECTED_BG_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Badge variant="badge" testId="badge" value="test content"/>`, {
      testThemeVars: {
        "backgroundColor-Badge": EXPECTED_BG_COLOR,
      },
    });
    await expect(page.getByTestId("badge")).toHaveCSS("background-color", EXPECTED_BG_COLOR);
  });

  test("textColor", async ({ initTestBed, page }) => {
    const EXPECTED_TEXT_COLOR = "rgb(255, 0, 0)";
    await initTestBed(`<Badge variant="badge" testId="badge" value="test content"/>`, {
      testThemeVars: {
        "textColor-Badge": EXPECTED_TEXT_COLOR,
      },
    });
    await expect(page.getByTestId("badge")).toHaveCSS("color", EXPECTED_TEXT_COLOR);
  });
  
  test("border", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

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

  test("borderLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderLeft-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderRight-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderHorizontal and borderLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderLeft-Badge": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-left-width", "8px");
    await expect(component).toHaveCSS("border-left-style", "double");
  });

  test("borderHorizontal and borderRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontal-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderRight-Badge": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-right-width", "8px");
    await expect(component).toHaveCSS("border-right-style", "double");
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderTop-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderBottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderBottom-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderVertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderVertical and borderTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderVertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderTop-Badge": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-top-width", "8px");
    await expect(component).toHaveCSS("border-top-style", "double");
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("borderVertical and border-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderVertical-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderBottom-Badge": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-bottom-width", "8px");
    await expect(component).toHaveCSS("border-bottom-style", "double");
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border-color", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderColor-Badge": EXPECTED_COLOR,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", UPDATED);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", UPDATED);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", UPDATED);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", UPDATED);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-horizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontalColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", UPDATED);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", UPDATED);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-left", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderLeftColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", UPDATED);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-right", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderRightColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", UPDATED);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-vertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderVerticalColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", UPDATED);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", UPDATED);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-color-top", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderTopColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", UPDATED);
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

  test("border, border-color-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderBottomColor-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", UPDATED);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border-style", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderStyle-Badge": EXPECTED_STYLE,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", UPDATED);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", UPDATED);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", UPDATED);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", UPDATED);
  });

  test("border, border-style-horizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontalStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", UPDATED);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", UPDATED);
  });

  test("border, border-style-left", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderLeftStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

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
    await expect(component).toHaveCSS("border-left-style", UPDATED);
  });

  test("border, border-style-right", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderRightStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", UPDATED);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style-vertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderVerticalStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", UPDATED);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", UPDATED);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-style-top", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderTopStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", UPDATED);
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

  test("border, border-style-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderBottomStyle-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", UPDATED);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border-thickness", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "8px";
    const EXPECTED_STYLE = "dotted";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderWidth-Badge": EXPECTED_WIDTH,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", UPDATED);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", UPDATED);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", UPDATED);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", UPDATED);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-horizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontalWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", UPDATED);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", UPDATED);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-left", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderLeftWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

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
    await expect(component).toHaveCSS("border-left-width", UPDATED);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-right", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderRightWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", UPDATED);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-vertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderVerticalWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", UPDATED);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", UPDATED);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("border, border-thickness-top", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderTopWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", UPDATED);
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

  test("border, border-thickness-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";

    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "borderBottomWidth-Badge": UPDATED,
        "border-Badge": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;

    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", UPDATED);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });

  test("padding", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });

  test("paddingHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "paddingHorizontal-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });

  test("paddingLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "paddingLeft-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });

  test("paddingRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "paddingRight-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });

  test("paddingVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "paddingVertical-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });

  test("paddingTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "paddingTop-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });

  test("paddingBottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "paddingBottom-Badge": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });

  test("padding, paddingHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
        "paddingHorizontal-Badge": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", UPDATED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", UPDATED);
  });

  test("padding, paddingLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
        "paddingLeft-Badge": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", UPDATED);
  });

  test("padding, paddingRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
        "paddingRight-Badge": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", UPDATED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });

  test("padding, paddingVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
        "paddingVertical-Badge": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", UPDATED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", UPDATED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });

  test("padding, paddingTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
        "paddingTop-Badge": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", UPDATED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });

  test("padding, paddingBottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="badge" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge": EXPECTED,
        "paddingBottom-Badge": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", UPDATED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
});

test.describe("Theme Vars: Pill", () => {
  test("pill: padding", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_PADDING = "12px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED_PADDING,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding", EXPECTED_PADDING);
  });
  
  test("pill: paddingHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_PADDING_HORIZONTAL = "6px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingHorizontal-Badge-pill": EXPECTED_PADDING_HORIZONTAL,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
    await expect(component).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
  });
  
  test("pill: paddingVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_PADDING_VERTICAL = "8px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingVertical-Badge-pill": EXPECTED_PADDING_VERTICAL,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
  });
  
  test("border", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
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
  
  test("borderLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderLeft-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderRight-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontal-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderHorizontal and borderLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontal-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderLeft-Badge-pill": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-left-width", "8px");
    await expect(component).toHaveCSS("border-left-style", "double");
  });
  
  test("borderHorizontal and borderRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontal-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderRight-Badge-pill": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-right-width", "8px");
    await expect(component).toHaveCSS("border-right-style", "double");
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderTop-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderBottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderBottom-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderVertical-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderVertical and borderTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderVertical-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderTop-Badge-pill": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-top-width", "8px");
    await expect(component).toHaveCSS("border-top-style", "double");
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("borderVertical and border-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderVertical-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
        "borderBottom-Badge-pill": "8px double rgb(0, 128, 0)",
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
    await expect(component).toHaveCSS("border-bottom-width", "8px");
    await expect(component).toHaveCSS("border-bottom-style", "double");
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border-color", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderColor-Badge-pill": EXPECTED_COLOR,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-color", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", UPDATED);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", UPDATED);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", UPDATED);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", UPDATED);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-color-horizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontalColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", UPDATED);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", UPDATED);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-color-left", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderLeftColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", UPDATED);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-color-right", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderRightColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", UPDATED);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-color-vertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderVerticalColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", UPDATED);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", UPDATED);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-color-top", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderTopColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", UPDATED);
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
  
  test("border, border-color-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "rgb(0, 128, 0)";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderBottomColor-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", UPDATED);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border-style", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderStyle-Badge-pill": EXPECTED_STYLE,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-style", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", UPDATED);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", UPDATED);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", UPDATED);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", UPDATED);
  });
  
  test("border, border-style-horizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontalStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", UPDATED);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", UPDATED);
  });
  
  test("border, border-style-left", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderLeftStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
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
    await expect(component).toHaveCSS("border-left-style", UPDATED);
  });
  
  test("border, border-style-right", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderRightStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", UPDATED);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-style-vertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderVerticalStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", UPDATED);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", UPDATED);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-style-top", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderTopStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", UPDATED);
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
  
  test("border, border-style-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "double";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderBottomStyle-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", UPDATED);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border-thickness", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(0, 128, 0)";
    const EXPECTED_WIDTH = "8px";
    const EXPECTED_STYLE = "dotted";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderWidth-Badge-pill": EXPECTED_WIDTH,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-thickness", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", UPDATED);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", UPDATED);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", UPDATED);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", UPDATED);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-thickness-horizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderHorizontalWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", UPDATED);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", UPDATED);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-thickness-left", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderLeftWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
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
    await expect(component).toHaveCSS("border-left-width", UPDATED);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-thickness-right", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderRightWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", UPDATED);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-thickness-vertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderVerticalWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", UPDATED);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", UPDATED);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("border, border-thickness-top", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderTopWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", UPDATED);
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
  
  test("border, border-thickness-bottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED_COLOR = "rgb(255, 0, 0)";
    const EXPECTED_WIDTH = "5px";
    const EXPECTED_STYLE = "dotted";
    const UPDATED = "12px";
  
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "borderBottomWidth-Badge-pill": UPDATED,
        "border-Badge-pill": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      },
    });
    const component = (await createBadgeDriver()).component;
  
    await expect(component).toHaveCSS("border-top-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-top-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-top-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-right-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-right-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-right-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-bottom-width", UPDATED);
    await expect(component).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
    await expect(component).toHaveCSS("border-left-color", EXPECTED_COLOR);
    await expect(component).toHaveCSS("border-left-width", EXPECTED_WIDTH);
    await expect(component).toHaveCSS("border-left-style", EXPECTED_STYLE);
  });
  
  test("padding", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
  
  test("paddingHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingHorizontal-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
  
  test("paddingLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingLeft-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
  
  test("paddingRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingRight-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });
  
  test("paddingVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingVertical-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });
  
  test("paddingTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingTop-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });
  
  test("paddingBottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "paddingBottom-Badge-pill": EXPECTED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).not.toHaveCSS("padding-top", EXPECTED);
    await expect(component).not.toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).not.toHaveCSS("padding-left", EXPECTED);
  });
  
  test("padding, paddingHorizontal", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
        "paddingHorizontal-Badge-pill": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", UPDATED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", UPDATED);
  });
  
  test("padding, paddingLeft", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
        "paddingLeft-Badge-pill": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", UPDATED);
  });
  
  test("padding, paddingRight", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
        "paddingRight-Badge-pill": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", UPDATED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
  
  test("padding, paddingVertical", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
        "paddingVertical-Badge-pill": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", UPDATED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", UPDATED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
  
  test("padding, paddingTop", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
        "paddingTop-Badge-pill": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", UPDATED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", EXPECTED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
  
  test("padding, paddingBottom", async ({ initTestBed, createBadgeDriver }) => {
    const EXPECTED = "100px";
    const UPDATED = "48px";
    await initTestBed(`<Badge variant="pill" value="test content"/>`, {
      testThemeVars: {
        "padding-Badge-pill": EXPECTED,
        "paddingBottom-Badge-pill": UPDATED,
      },
    });
    const component = (await createBadgeDriver()).component;
    await expect(component).toHaveCSS("padding-top", EXPECTED);
    await expect(component).toHaveCSS("padding-right", EXPECTED);
    await expect(component).toHaveCSS("padding-bottom", UPDATED);
    await expect(component).toHaveCSS("padding-left", EXPECTED);
  });
});
