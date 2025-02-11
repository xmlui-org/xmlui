import { test, expect } from "./fixtures";
import { getBoundingRect, getElementStyle, initApp, initThemedApp, pixelStrToNum } from "./component-test-helpers";
import { Locator } from "@playwright/test";

const RED = "rgb(255, 0, 0)";
const GREEN = "rgb(0, 255, 0)";
const BLUE = "rgb(0, 0, 255)";
const BADGE_CODE = `<Badge variant="badge" testId="badge" value="test content"/>`;
const BADGE_CODE_PILL = `<Badge variant="pill" testId="badge" value="test content"/>`;

test("Can render empty", async ({ page }) => {
  const entryPoint = `<Badge testId="badge" />`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("badge")).toBeAttached();
  await expect(page.getByTestId("badge")).toBeEmpty();
});

test("Can render value", async ({ page }) => {
  const EXPECTED_TEXT = "test value";
  const entryPoint = `<Badge testId="badge" value="${EXPECTED_TEXT}"/>`;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByText(EXPECTED_TEXT, { exact: true })).toBeVisible();
});

test("variant pill", async ({ page }) => {
  await initApp(page, {
    entryPoint: BADGE_CODE_PILL,
  });

  await isPillShaped(page.getByTestId("badge"));
});

test("colorMap background", async ({ page }) => {
  const EXPECTED_BG_COLOR_IMP = RED;
  const EXPECTED_BG_COLOR_REG = GREEN;
  const entryPoint = `
  <Stack>
    <variable name="simpleColorMap" value="{{ important: '${RED}', regular: '${GREEN}' }}" />
    <Badge testId="badgeImp" value="important" colorMap="{simpleColorMap}" />
    <Badge testId="badgeReg" value="regular" colorMap="{simpleColorMap}" />
  </Stack>
  `;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("badgeImp")).toHaveCSS("background-color", EXPECTED_BG_COLOR_IMP);
  await expect(page.getByTestId("badgeReg")).toHaveCSS("background-color", EXPECTED_BG_COLOR_REG);
});

test("colorMap background and label", async ({ page }) => {
  const EXPECTED_TEXT_COLOR_IMP = RED;
  const EXPECTED_BG_COLOR_IMP = GREEN;
  const EXPECTED_TEXT_COLOR_REG = GREEN;
  const EXPECTED_BG_COLOR_REG = RED;

  const entryPoint = `
  <Stack>
    <variable name="simpleColorMap" value="{{ important: {label: '${EXPECTED_TEXT_COLOR_IMP}', background: '${EXPECTED_BG_COLOR_IMP}'}, regular: {label: '${EXPECTED_TEXT_COLOR_REG}', background: '${EXPECTED_BG_COLOR_REG}'} }}" />
    <Badge testId="badgeImp" value="important" colorMap="{simpleColorMap}" />
    <Badge testId="badgeReg" value="regular" colorMap="{simpleColorMap}" />
  </Stack>
  `;

  await initApp(page, {
    entryPoint,
  });

  await expect(page.getByTestId("badgeImp")).toHaveCSS("background-color", EXPECTED_BG_COLOR_IMP);
  await expect(page.getByTestId("badgeImp")).toHaveCSS("color", EXPECTED_TEXT_COLOR_IMP);

  await expect(page.getByTestId("badgeReg")).toHaveCSS("background-color", EXPECTED_BG_COLOR_REG);
  await expect(page.getByTestId("badgeReg")).toHaveCSS("color", EXPECTED_TEXT_COLOR_REG);
});

test("color-bg", async ({ page }) => {
  const EXPECTED_BG_COLOR = RED;
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "color-bg-Badge": EXPECTED_BG_COLOR,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("background-color", EXPECTED_BG_COLOR);
});

test("color-text", async ({ page }) => {
  const EXPECTED_TEXT_COLOR = BLUE;
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "color-text-Badge": EXPECTED_TEXT_COLOR,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("color", EXPECTED_TEXT_COLOR);
});

test("badge: radius", async ({ page }) => {
  const EXPECTED_RADIUS = "8px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "radius-Badge": EXPECTED_RADIUS,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("border-radius", EXPECTED_RADIUS);
});

test("badge: font-size", async ({ page }) => {
  const EXPECTED_FONT_SIZE = "16px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "font-size-Badge": EXPECTED_FONT_SIZE,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-size", EXPECTED_FONT_SIZE);
});

test("badge: font-weight", async ({ page }) => {
  // bold font weight
  const EXPECTED_FONT_WEIGHT = "700";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "font-weight-Badge": EXPECTED_FONT_WEIGHT,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-weight", EXPECTED_FONT_WEIGHT);
});

test("badge: padding", async ({ page }) => {
  const EXPECTED_PADDING = "10px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-Badge": EXPECTED_PADDING,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding", EXPECTED_PADDING);
});

test("badge: padding-horizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "5px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-horizontal-Badge": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("badge: padding-vertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "7px";
  await initThemedApp(page, BADGE_CODE, {
    themeVars: {
      "padding-vertical-Badge": EXPECTED_PADDING_VERTICAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
});

test("pill: font-size", async ({ page }) => {
  const EXPECTED_FONT_SIZE = "18px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "font-size-Badge-pill": EXPECTED_FONT_SIZE,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-size", EXPECTED_FONT_SIZE);
});

test("pill: font-weight", async ({ page }) => {
  // bold font weight
  const EXPECTED_FONT_WEIGHT = "700";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "font-weight-Badge-pill": EXPECTED_FONT_WEIGHT,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("font-weight", EXPECTED_FONT_WEIGHT);
});

test("pill: padding", async ({ page }) => {
  const EXPECTED_PADDING = "12px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-Badge-pill": EXPECTED_PADDING,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding", EXPECTED_PADDING);
});

test("pill: padding-horizontal", async ({ page }) => {
  const EXPECTED_PADDING_HORIZONTAL = "6px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-horizontal-Badge-pill": EXPECTED_PADDING_HORIZONTAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-left", EXPECTED_PADDING_HORIZONTAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-right", EXPECTED_PADDING_HORIZONTAL);
});

test("pill: padding-vertical", async ({ page }) => {
  const EXPECTED_PADDING_VERTICAL = "8px";
  await initThemedApp(page, BADGE_CODE_PILL, {
    themeVars: {
      "padding-vertical-Badge-pill": EXPECTED_PADDING_VERTICAL,
    },
  });
  await expect(page.getByTestId("badge")).toHaveCSS("padding-top", EXPECTED_PADDING_VERTICAL);
  await expect(page.getByTestId("badge")).toHaveCSS("padding-bottom", EXPECTED_PADDING_VERTICAL);
});

async function isPillShaped(elem: Locator) {
  const { width, height } = await getBoundingRect(elem);
  const smaller = Math.min(width, height);
  const minRadius = smaller / 2;

  const radiusPx = await getElementStyle(elem, "border-radius");
  const radius = pixelStrToNum(radiusPx);

  expect(radius).toBeGreaterThanOrEqual(minRadius);
}
