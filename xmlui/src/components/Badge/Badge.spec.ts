import { getBounds, getStyles } from "../../testing/component-test-helpers";
import { test, expect } from "../../testing/fixtures";

test.describe("Basic Functionality For All Variants", () => {
  test("Component can render", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="badge" />`);
    await expect(page.getByTestId("badge")).toBeVisible();
  });

  test("contextMenu event fires on right click", async ({ initTestBed, page }) => {
    const { testStateDriver } = await initTestBed(
      `<Badge testId="badge" value="Test" onContextMenu="testState = 'context-menu-fired'" />`
    );

    const badge = page.getByTestId("badge");
    await badge.click({ button: "right" });

    await expect.poll(testStateDriver.testState).toEqual("context-menu-fired");
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

const SIDES = ["top", "right", "bottom", "left"] as const;

type Side = (typeof SIDES)[number];
type BorderSpec = { color: string; width: string; style: string };
type BorderBySide = Partial<Record<Side, BorderSpec>>;
type PaddingBySide = Partial<Record<Side, string>>;

const borderProp = (side: Side, part: "color" | "width" | "style") => `border-${side}-${part}`;

async function expectBorderState(component: any, expected: BorderBySide, absentRef?: BorderSpec) {
  for (const side of SIDES) {
    const sideExpected = expected[side];

    if (sideExpected) {
      await expect(component).toHaveCSS(borderProp(side, "color"), sideExpected.color);
      await expect(component).toHaveCSS(borderProp(side, "width"), sideExpected.width);
      await expect(component).toHaveCSS(borderProp(side, "style"), sideExpected.style);
      continue;
    }

    if (absentRef) {
      await expect(component).not.toHaveCSS(borderProp(side, "color"), absentRef.color);
      await expect(component).not.toHaveCSS(borderProp(side, "width"), absentRef.width);
      await expect(component).not.toHaveCSS(borderProp(side, "style"), absentRef.style);
    }
  }
}

async function expectPaddingState(
  component: any,
  expected: PaddingBySide,
  notExpected?: PaddingBySide
) {
  for (const side of SIDES) {
    const cssProp = `padding-${side}`;
    if (expected[side] !== undefined) {
      await expect(component).toHaveCSS(cssProp, expected[side]!);
    }
    if (notExpected?.[side] !== undefined) {
      await expect(component).not.toHaveCSS(cssProp, notExpected[side]!);
    }
  }
}

function registerConsolidatedThemeVarTests(
  describeName: string,
  variant: "badge" | "pill",
  suffix: "" | "-pill",
  includeBackgroundAndText: boolean
) {
  test.describe(describeName, () => {
    const key = (name: string) => `${name}-Badge${suffix}`;

    if (includeBackgroundAndText) {
      test("backgroundColor", async ({ initTestBed, page }) => {
        const expected = "rgb(255, 0, 0)";
        await initTestBed(`<Badge variant="${variant}" testId="badge" value="test content"/>`, {
          testThemeVars: {
            [key("backgroundColor")]: expected,
          },
        });
        await expect(page.getByTestId("badge")).toHaveCSS("background-color", expected);
      });

      test("textColor", async ({ initTestBed, page }) => {
        const expected = "rgb(255, 0, 0)";
        await initTestBed(`<Badge variant="${variant}" testId="badge" value="test content"/>`, {
          testThemeVars: {
            [key("textColor")]: expected,
          },
        });
        await expect(page.getByTestId("badge")).toHaveCSS("color", expected);
      });
    }

    test("applies border-side theme variables", async ({ initTestBed, createBadgeDriver }) => {
      const red: BorderSpec = { color: "rgb(255, 0, 0)", width: "5px", style: "dotted" };
      const green: BorderSpec = { color: "rgb(0, 128, 0)", width: "8px", style: "double" };
      let component = (await createBadgeDriver()).component;

      // border
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("border")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { top: red, right: red, bottom: red, left: red });

      // borderLeft
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderLeft")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { left: red }, red);

      // borderRight
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderRight")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { right: red }, red);

      // borderHorizontal
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderHorizontal")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { right: red, left: red }, red);

      // borderHorizontal + borderLeft
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: {
          [key("borderHorizontal")]: `${red.style} ${red.color} ${red.width}`,
          [key("borderLeft")]: `${green.width} ${green.style} ${green.color}`,
        },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { right: red, left: green }, red);

      // borderHorizontal + borderRight
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: {
          [key("borderHorizontal")]: `${red.style} ${red.color} ${red.width}`,
          [key("borderRight")]: `${green.width} ${green.style} ${green.color}`,
        },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { right: green, left: red }, red);

      // borderTop
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderTop")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { top: red }, red);

      // borderBottom
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderBottom")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { bottom: red }, red);

      // borderVertical
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderVertical")]: `${red.style} ${red.color} ${red.width}` },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { top: red, bottom: red }, red);

      // borderVertical + borderTop
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: {
          [key("borderVertical")]: `${red.style} ${red.color} ${red.width}`,
          [key("borderTop")]: `${green.width} ${green.style} ${green.color}`,
        },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { top: green, bottom: red }, red);

      // borderVertical + borderBottom
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: {
          [key("borderVertical")]: `${red.style} ${red.color} ${red.width}`,
          [key("borderBottom")]: `${green.width} ${green.style} ${green.color}`,
        },
      });
      component = (await createBadgeDriver()).component;
      await expectBorderState(component, { top: red, bottom: green }, red);
    });

    test("applies border-color theme variables", async ({ initTestBed, createBadgeDriver }) => {
      const base = { color: "rgb(255, 0, 0)", width: "5px", style: "dotted" };
      const updated = "rgb(0, 128, 0)";
      let component = (await createBadgeDriver()).component;

      // borderColor only
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderColor")]: updated },
      });
      component = (await createBadgeDriver()).component;
      for (const side of SIDES) {
        await expect(component).toHaveCSS(borderProp(side, "color"), updated);
        await expect(component).not.toHaveCSS(borderProp(side, "width"), base.width);
        await expect(component).not.toHaveCSS(borderProp(side, "style"), base.style);
      }

      const cases: Array<{ varName: string; sideMap: Partial<Record<Side, string>> }> = [
        { varName: "borderColor", sideMap: { top: updated, right: updated, bottom: updated, left: updated } },
        { varName: "borderHorizontalColor", sideMap: { right: updated, left: updated } },
        { varName: "borderLeftColor", sideMap: { left: updated } },
        { varName: "borderRightColor", sideMap: { right: updated } },
        { varName: "borderVerticalColor", sideMap: { top: updated, bottom: updated } },
        { varName: "borderTopColor", sideMap: { top: updated } },
        { varName: "borderBottomColor", sideMap: { bottom: updated } },
      ];

      for (const current of cases) {
        await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
          testThemeVars: {
            [key("border")]: `${base.style} ${base.color} ${base.width}`,
            [key(current.varName)]: updated,
          },
        });
        component = (await createBadgeDriver()).component;

        for (const side of SIDES) {
          await expect(component).toHaveCSS(borderProp(side, "color"), current.sideMap[side] ?? base.color);
          await expect(component).toHaveCSS(borderProp(side, "width"), base.width);
          await expect(component).toHaveCSS(borderProp(side, "style"), base.style);
        }
      }
    });

    test("applies border-style theme variables", async ({ initTestBed, createBadgeDriver }) => {
      const base = { color: "rgb(0, 128, 0)", width: "5px", style: "dotted" };
      const updated = "double";
      let component = (await createBadgeDriver()).component;

      // borderStyle only
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderStyle")]: base.style },
      });
      component = (await createBadgeDriver()).component;
      for (const side of SIDES) {
        await expect(component).toHaveCSS(borderProp(side, "style"), base.style);
        await expect(component).not.toHaveCSS(borderProp(side, "color"), base.color);
        await expect(component).not.toHaveCSS(borderProp(side, "width"), base.width);
      }

      const cases: Array<{ varName: string; sideMap: Partial<Record<Side, string>> }> = [
        { varName: "borderStyle", sideMap: { top: updated, right: updated, bottom: updated, left: updated } },
        { varName: "borderHorizontalStyle", sideMap: { right: updated, left: updated } },
        { varName: "borderLeftStyle", sideMap: { left: updated } },
        { varName: "borderRightStyle", sideMap: { right: updated } },
        { varName: "borderVerticalStyle", sideMap: { top: updated, bottom: updated } },
        { varName: "borderTopStyle", sideMap: { top: updated } },
        { varName: "borderBottomStyle", sideMap: { bottom: updated } },
      ];

      for (const current of cases) {
        await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
          testThemeVars: {
            [key("border")]: `${base.style} ${base.color} ${base.width}`,
            [key(current.varName)]: updated,
          },
        });
        component = (await createBadgeDriver()).component;

        for (const side of SIDES) {
          await expect(component).toHaveCSS(borderProp(side, "color"), base.color);
          await expect(component).toHaveCSS(borderProp(side, "width"), base.width);
          await expect(component).toHaveCSS(borderProp(side, "style"), current.sideMap[side] ?? base.style);
        }
      }
    });

    test("applies border-thickness theme variables", async ({ initTestBed, createBadgeDriver }) => {
      const base = { color: "rgb(255, 0, 0)", width: "5px", style: "dotted" };
      const updated = "12px";
      let component = (await createBadgeDriver()).component;

      // borderWidth only
      await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
        testThemeVars: { [key("borderWidth")]: "8px" },
      });
      component = (await createBadgeDriver()).component;
      for (const side of SIDES) {
        await expect(component).toHaveCSS(borderProp(side, "width"), "8px");
      }

      const cases: Array<{ varName: string; sideMap: Partial<Record<Side, string>> }> = [
        { varName: "borderWidth", sideMap: { top: updated, right: updated, bottom: updated, left: updated } },
        { varName: "borderHorizontalWidth", sideMap: { right: updated, left: updated } },
        { varName: "borderLeftWidth", sideMap: { left: updated } },
        { varName: "borderRightWidth", sideMap: { right: updated } },
        { varName: "borderVerticalWidth", sideMap: { top: updated, bottom: updated } },
        { varName: "borderTopWidth", sideMap: { top: updated } },
        { varName: "borderBottomWidth", sideMap: { bottom: updated } },
      ];

      for (const current of cases) {
        await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
          testThemeVars: {
            [key("border")]: `${base.style} ${base.color} ${base.width}`,
            [key(current.varName)]: updated,
          },
        });
        component = (await createBadgeDriver()).component;

        for (const side of SIDES) {
          await expect(component).toHaveCSS(borderProp(side, "color"), base.color);
          await expect(component).toHaveCSS(borderProp(side, "width"), current.sideMap[side] ?? base.width);
          await expect(component).toHaveCSS(borderProp(side, "style"), base.style);
        }
      }
    });

    test("applies padding theme variables", async ({ initTestBed, createBadgeDriver }) => {
      const base = "100px";
      const updated = "48px";
      let component = (await createBadgeDriver()).component;

      const cases: Array<{
        vars: Record<string, string>;
        expected: PaddingBySide;
        notExpected?: PaddingBySide;
      }> = [
        { vars: { [key("padding")]: base }, expected: { top: base, right: base, bottom: base, left: base } },
        {
          vars: { [key("paddingHorizontal")]: base },
          expected: { right: base, left: base },
          notExpected: { top: base, bottom: base },
        },
        {
          vars: { [key("paddingLeft")]: base },
          expected: { left: base },
          notExpected: { top: base, right: base, bottom: base },
        },
        {
          vars: { [key("paddingRight")]: base },
          expected: { right: base },
          notExpected: { top: base, bottom: base, left: base },
        },
        {
          vars: { [key("paddingVertical")]: base },
          expected: { top: base, bottom: base },
          notExpected: { right: base, left: base },
        },
        {
          vars: { [key("paddingTop")]: base },
          expected: { top: base },
          notExpected: { right: base, bottom: base, left: base },
        },
        {
          vars: { [key("paddingBottom")]: base },
          expected: { bottom: base },
          notExpected: { top: base, right: base, left: base },
        },
        {
          vars: { [key("padding")]: base, [key("paddingHorizontal")]: updated },
          expected: { top: base, right: updated, bottom: base, left: updated },
        },
        {
          vars: { [key("padding")]: base, [key("paddingLeft")]: updated },
          expected: { top: base, right: base, bottom: base, left: updated },
        },
        {
          vars: { [key("padding")]: base, [key("paddingRight")]: updated },
          expected: { top: base, right: updated, bottom: base, left: base },
        },
        {
          vars: { [key("padding")]: base, [key("paddingVertical")]: updated },
          expected: { top: updated, right: base, bottom: updated, left: base },
        },
        {
          vars: { [key("padding")]: base, [key("paddingTop")]: updated },
          expected: { top: updated, right: base, bottom: base, left: base },
        },
        {
          vars: { [key("padding")]: base, [key("paddingBottom")]: updated },
          expected: { top: base, right: base, bottom: updated, left: base },
        },
      ];

      for (const current of cases) {
        await initTestBed(`<Badge variant="${variant}" value="test content"/>`, {
          testThemeVars: current.vars,
        });
        component = (await createBadgeDriver()).component;
        await expectPaddingState(component, current.expected, current.notExpected);
      }
    });
  });
}

registerConsolidatedThemeVarTests("Theme Vars: Badge", "badge", "", true);
registerConsolidatedThemeVarTests("Theme Vars: Pill", "pill", "-pill", false);

test.describe("Responsive Layout Properties", () => {
  test("width-md applies at md viewport and above", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="test" value="hello" width-md="200px" />`);
    const badge = page.getByTestId("test");

    // Below md — width should NOT be 200px
    await page.setViewportSize({ width: 767, height: 600 });
    await expect(badge).not.toHaveCSS("width", "200px");

    // At md — width should be 200px
    await page.setViewportSize({ width: 768, height: 600 });
    await expect(badge).toHaveCSS("width", "200px");

    // Well above md — width should still be 200px
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(badge).toHaveCSS("width", "200px");
  });

  test("base width applies at all viewport sizes", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="test" value="hello" width="100px" />`);
    const badge = page.getByTestId("test");

    for (const width of [375, 576, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 600 });
      await expect(badge).toHaveCSS("width", "100px");
    }
  });

  test("breakpoint-specific width overrides base width at that breakpoint", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="test" value="hello" width="60px" width-lg="250px" />`);
    const badge = page.getByTestId("test");

    // Below lg — base 60px
    await page.setViewportSize({ width: 991, height: 600 });
    await expect(badge).toHaveCSS("width", "60px");

    // At lg — 250px
    await page.setViewportSize({ width: 992, height: 600 });
    await expect(badge).toHaveCSS("width", "250px");
  });

  test("multiple breakpoint widths stack correctly (mobile-first cascade)", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="test" value="hello" width-sm="80px" width-md="160px" width-xl="240px" />`);
    const badge = page.getByTestId("test");

    // xs: no rule applies
    await page.setViewportSize({ width: 400, height: 600 });
    await expect(badge).not.toHaveCSS("width", "80px");

    // sm: 80px rule
    await page.setViewportSize({ width: 600, height: 600 });
    await expect(badge).toHaveCSS("width", "80px");

    // md: 160px overrides
    await page.setViewportSize({ width: 800, height: 600 });
    await expect(badge).toHaveCSS("width", "160px");

    // lg: md rule still applies (no lg rule defined)
    await page.setViewportSize({ width: 1100, height: 600 });
    await expect(badge).toHaveCSS("width", "160px");

    // xl: 240px overrides
    await page.setViewportSize({ width: 1300, height: 600 });
    await expect(badge).toHaveCSS("width", "240px");
  });

  test("opacity-sm applies from sm breakpoint upward", async ({ page, initTestBed }) => {
    await initTestBed(`<Badge testId="test" value="hello" opacity-sm="0.4" />`);
    const badge = page.getByTestId("test");

    // xs — no opacity override
    await page.setViewportSize({ width: 400, height: 600 });
    await expect(badge).not.toHaveCSS("opacity", "0.4");

    // sm — opacity applies
    await page.setViewportSize({ width: 600, height: 600 });
    await expect(badge).toHaveCSS("opacity", "0.4");
  });
});
