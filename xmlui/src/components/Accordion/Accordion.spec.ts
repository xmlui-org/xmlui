import { test, expect } from "../../testing/fixtures";
import { initThemedApp } from "../../testing/themed-app-test-helpers";

const ACCORDION_CODE = `
  <Accordion testId="accordion">
    <AccordionItem>Hello</AccordionItem>
  </Accordion>
`;

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderLeft-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderRight-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderHorizontal and borderLeft", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Accordion": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", "double");
});

test("borderHorizontal and borderRight", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Accordion": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderTop-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderBottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderBottom-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and borderTop", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Accordion": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("borderVertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Accordion": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderColor-Accordion": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderHorizontalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderLeftColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderRightColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderVerticalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderTopColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderBottomColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderStyle-Accordion": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderHorizontalStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderLeftStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderRightStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderVerticalStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderTopStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderBottomStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderWidth-Accordion": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderHorizontalWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderLeftWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderRightWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderVerticalWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderTopWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "borderBottomWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("accordion")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("padding", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "paddingHorizontal-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "paddingLeft-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});

test("paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "paddingRight-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "paddingVertical-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "paddingTop-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "paddingBottom-Accordion": EXPECTED,
    },
  });
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingHorizontal", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
      "paddingHorizontal-Accordion": UPDATED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingLeft", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
      "paddingLeft-Accordion": UPDATED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingRight", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
      "paddingRight-Accordion": UPDATED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingVertical", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
      "paddingVertical-Accordion": UPDATED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingTop", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
      "paddingTop-Accordion": UPDATED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingBottom", async ({ page }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initThemedApp(page, ACCORDION_CODE, {
    themeVars: {
      "padding-Accordion": EXPECTED,
      "paddingBottom-Accordion": UPDATED,
    },
  });
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-top", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-right", EXPECTED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-bottom", UPDATED);
  await expect(page.getByTestId("accordion")).toHaveCSS("padding-left", EXPECTED);
});
