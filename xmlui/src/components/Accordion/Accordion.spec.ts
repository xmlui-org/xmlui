import { test, expect } from "../../testing/fixtures";

const CODE = `
  <Accordion>
    <AccordionItem>Hello</AccordionItem>
  </Accordion>
`;

test("border", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "border-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT);
});

test("borderLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "left");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "right",
    "top",
    "bottom",
  ]);
});

test("borderRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "right");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "top",
    "bottom",
  ]);
});

test("borderHorizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, ["right", "left"]);
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderHorizontal and borderLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": EXPECTED_BORDER_DEFAULT,
      "borderLeft-Accordion": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "left");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "right");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderHorizontal and borderRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Accordion": EXPECTED_BORDER_DEFAULT,
      "borderRight-Accordion": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "right");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "left");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "top");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "right",
    "bottom",
  ]);
});

test("borderBottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "bottom");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "right",
    "top",
  ]);
});

test("borderVertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("borderVertical and borderTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": EXPECTED_BORDER_DEFAULT,
      "borderTop-Accordion": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "bottom");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "top");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("borderVertical and border-bottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Accordion": EXPECTED_BORDER_DEFAULT,
      "borderBottom-Accordion": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "top");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "bottom");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).not.toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).not.toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, ["right", "left"]);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "left");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "right");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, ["top", "bottom"]);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "top");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "bottom");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).not.toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).not.toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, ["left", "right"]);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "left");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "right");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, ["top", "bottom"]);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "top");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "bottom");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).not.toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).not.toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, ["left", "right"]);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "left");
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "right");
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, ["top", "bottom"]);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "top");
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "bottom");
});

test("padding", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "padding-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
});

test("paddingHorizontal", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingHorizontal-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
});

test("paddingLeft", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingLeft-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
});

test("paddingRight", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingRight-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingVertical", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingVertical-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingTop", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingTop-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-left", EXPECTED);
});

test("paddingBottom", async ({ initTestBed, createAccordionDriver }) => {
  const EXPECTED = "100px";
  await initTestBed(CODE, {
    testThemeVars: {
      "paddingBottom-Accordion": EXPECTED,
    },
  });
  const driver = await createAccordionDriver();
  await expect(driver.component).not.toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).not.toHaveCSS("padding-left", EXPECTED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", UPDATED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", UPDATED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", UPDATED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", UPDATED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", UPDATED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", UPDATED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", UPDATED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
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
  const driver = await createAccordionDriver();
  await expect(driver.component).toHaveCSS("padding-top", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-right", EXPECTED);
  await expect(driver.component).toHaveCSS("padding-bottom", UPDATED);
  await expect(driver.component).toHaveCSS("padding-left", EXPECTED);
});
