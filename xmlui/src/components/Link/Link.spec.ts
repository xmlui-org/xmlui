import { expect, test } from "../../testing/fixtures";
import { initThemedApp } from "../../testing/themed-app-test-helpers";

test.describe("smoke tests", { tag: "@smoke" }, () => {
  test("component renders", async ({ initTestBed, createLinkDriver }) => {
    await initTestBed(`<Link />`);
    const driver = await createLinkDriver();

    await expect(driver.component).toBeAttached();
    await expect(driver.component).toBeEmpty();
  });

  test("HtmlTag link is rendered", async ({ initTestBed, createLinkDriver }) => {
    await initTestBed(`<a />`);
    const driver = await createLinkDriver();

    await expect(driver.component).toBeAttached();
  });
});

test("HtmlTag 'a' accepts custom props not immediately used", async ({
  initTestBed,
  createLinkDriver,
}) => {
  await initTestBed(`<a custom="test" boolean>Test Heading</a>`);
  const driver = await createLinkDriver();

  await expect(driver.component).toHaveAttribute("custom", "test");
  await expect(driver.component).toHaveAttribute("boolean", "true");
});

const LINK_CODE = `<Link testId="link" to="/">Hello</Link>`;

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "border-left-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "border-right-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderHorizontal-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderHorizontal-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-Link": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", "double");
});

test("borderHorizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderHorizontal-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-Link": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "border-top-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderBottom-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderVertical-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderVertical-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-Link": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderVertical-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Link": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "color-border-Link": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "color-border-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderHorizontalColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "color-border-left-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "color-border-right-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderVerticalColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "color-border-top-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderBottomColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "style-border-Link": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "style-border-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderHorizontalStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "style-border-left-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "style-border-right-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderVerticalStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "style-border-top-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderBottomStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "thickness-border-Link": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "thickness-border-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderHorizontalWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "thickness-border-left-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "thickness-border-right-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderVerticalWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "thickness-border-top-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, LINK_CODE, {
    themeVars: {
      "borderBottomWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("link")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("link")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("link")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
