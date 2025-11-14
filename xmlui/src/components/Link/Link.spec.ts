import { expect, test } from "../../testing/fixtures";

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

  test("HtmlTag 'a' accepts custom props not immediately used", async ({
    initTestBed,
    createLinkDriver,
  }) => {
    await initTestBed(`<a custom="test" boolean>Test Heading</a>`);
    const driver = await createLinkDriver();

    await expect(driver.component).toHaveAttribute("custom", "test");
    await expect(driver.component).toHaveAttribute("boolean", "true");
  });
});

const CODE = `<Link to="/">Hello</Link>`;

test("border", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderLeft", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderRight", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderHorizontal", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderHorizontal and borderLeft", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Link": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderHorizontal and borderRight", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Link": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderTop", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderBottom", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderVertical", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderVertical and borderTop", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Link": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createLinkDriver()).component;

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

test("borderVertical and border-bottom", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Link": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border-color", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Link": EXPECTED_COLOR,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color-horizontal", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color-left", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color-right", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color-vertical", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color-top", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-color-bottom", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomColor-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border-style", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Link": EXPECTED_STYLE,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style-horizontal", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style-left", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style-right", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style-vertical", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style-top", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-style-bottom", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border-thickness", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Link": EXPECTED_WIDTH,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness-horizontal", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness-left", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness-right", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness-vertical", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness-top", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

test("border, border-thickness-bottom", async ({ initTestBed, createLinkDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomWidth-Link": UPDATED,
      "border-Link": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createLinkDriver()).component;

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

// =============================================================================
// BEHAVIOR TESTS
// =============================================================================

test.describe("Behaviors and Parts", () => {
  test("handles tooltip", async ({ page, initTestBed }) => {
    await initTestBed(`<Link to="/" testId="test" tooltip="Tooltip text">text</Link>`);

    const link = page.getByTestId("test");
    await link.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("handles variant", async ({ page, initTestBed }) => {
    await initTestBed(`<Link to="/" testId="test" variant="CustomLink">Link text</Link>`, {
      testThemeVars: {
        "borderColor-Link-CustomLink": "rgb(255, 0, 0)",
      },
    });
    const link = page.getByTestId("test");
    await expect(link).toHaveCSS("border-color", "rgb(255, 0, 0)");
  });

  test("can select part: 'icon'", async ({ page, initTestBed }) => {
    await initTestBed(`<Link to="/" testId="test" icon="search">Link text</Link>`);
    const icon = page.getByTestId("test").locator("[data-part-id='icon']");
    await expect(icon).toBeVisible();
  });

  test("icon part is not present without icon prop", async ({ page, initTestBed }) => {
    await initTestBed(`<Link to="/" testId="test">Link text</Link>`);
    const icon = page.getByTestId("test").locator("[data-part-id='icon']");
    await expect(icon).not.toBeVisible();
  });

  test("parts are present when tooltip is added", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link to="/" testId="test" tooltip="Tooltip text" icon="search">Link text</Link>
    `);
    
    const link = page.getByTestId("test");
    const icon = link.locator("[data-part-id='icon']");
    const tooltip = page.getByRole("tooltip");
    
    await link.hover();
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
    await expect(icon).toBeVisible();
  });

  test("parts are present when variant is added", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link to="/" testId="test" variant="CustomLink" icon="search">Link text</Link>
    `, {
      testThemeVars: {
        "textColor-Link-CustomLink": "rgb(255, 0, 0)",
      },
    });
    
    const link = page.getByTestId("test");
    const icon = link.locator("[data-part-id='icon']");
    
    await expect(link).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(icon).toBeVisible();
  });

  test("variant applies custom theme variables", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link to="/" testId="test" variant="CustomLink">Link text</Link>
    `, {
      testThemeVars: {
        "textColor-Link-CustomLink": "rgb(255, 0, 0)",
        "fontSize-Link-CustomLink": "20px",
      },
    });
    
    const link = page.getByTestId("test");
    await expect(link).toHaveCSS("color", "rgb(255, 0, 0)");
    await expect(link).toHaveCSS("font-size", "20px");
  });

  test("tooltip with markdown content", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link to="/" testId="test" tooltipMarkdown="**Bold text**">Link text</Link>
    `);
    
    const link = page.getByTestId("test");
    await link.hover();
    const tooltip = page.getByRole("tooltip");
    
    await expect(tooltip).toBeVisible();
    await expect(tooltip.locator("strong")).toHaveText("Bold text");
  });

  test("animation behavior", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link to="/" testId="test" animation="fadeIn">Link text</Link>
    `);
    
    const link = page.getByTestId("test");
    await expect(link).toBeVisible();
  });

  test("combined tooltip and animation", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link to="/" testId="test" tooltip="Tooltip text" animation="fadeIn">Link text</Link>
    `);
    
    const link = page.getByTestId("test");
    await expect(link).toBeVisible();
    
    await link.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });

  test("all behaviors combined with parts", async ({ page, initTestBed }) => {
    await initTestBed(`
      <Link 
        to="/" 
        testId="test" 
        tooltip="Tooltip text" 
        variant="CustomLink"
        icon="search"
        animation="fadeIn"
      >Link text</Link>
    `, {
      testThemeVars: {
        "backgroundColor-Link-CustomLink": "rgb(255, 0, 0)",
      },
    });
    
    const link = page.getByTestId("test");
    const icon = link.locator("[data-part-id='icon']");
    
    // Verify variant applied
    await expect(link).toHaveCSS("background-color", "rgb(255, 0, 0)");
    
    // Verify icon part is visible
    await expect(icon).toBeVisible();
    
    // Verify tooltip appears
    await link.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("Tooltip text");
  });
});
