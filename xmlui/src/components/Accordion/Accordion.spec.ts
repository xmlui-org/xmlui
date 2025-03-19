import { test, expect } from "../../testing/fixtures";

const CODE = `
  <Accordion>
    <AccordionItem>Hello</AccordionItem>
  </Accordion>
`;

test("border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderHorizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderHorizontal and borderLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderHorizontal and borderRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderBottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderVertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderVertical and borderTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("borderVertical and border-bottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Accordion": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border-color", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Accordion": EXPECTED_COLOR,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color-horizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color-left", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color-right", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color-vertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color-top", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-color-bottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomColor-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border-style", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Accordion": EXPECTED_STYLE,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style-horizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style-left", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style-right", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style-vertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style-top", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-style-bottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border-thickness", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Accordion": EXPECTED_WIDTH,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness-horizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness-left", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness-right", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness-vertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness-top", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("border, border-thickness-bottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomWidth-Accordion": UPDATED,
      "border-Accordion": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAccordionDriver()).component;

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

test("padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("paddingHorizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingHorizontal-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("paddingLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingLeft-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("paddingRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingRight-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingVertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingVertical-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingTop-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingBottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingBottom-Accordion": EXPECTED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).not.toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingHorizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingHorizontal-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", UPDATED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingLeft-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", UPDATED);
});

test("padding, paddingRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingRight-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", UPDATED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingVertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingVertical-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", UPDATED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", UPDATED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingTop-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", UPDATED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});

test("padding, paddingBottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  const UPDATED = "48px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
      "paddingBottom-Accordion": UPDATED,
    },
  });
  const component = (await createAccordionDriver()).component;
  await expect(component).toHaveCSS("padding-top", EXPECTED);
  await expect(component).toHaveCSS("padding-right", EXPECTED);
  await expect(component).toHaveCSS("padding-bottom", UPDATED);
  await expect(component).toHaveCSS("padding-left", EXPECTED);
});
