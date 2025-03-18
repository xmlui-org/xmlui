import { ComponentDriver } from "../../testing/ComponentDrivers";
import { test, expect } from "../../testing/fixtures";

const CODE = `
  <AppHeader>
    Hello, World!
  </AppHeader>
`;

test("border", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "border-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT);
});

test("borderLeft", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "left");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "right",
    "top",
    "bottom",
  ]);
});

test("borderRight", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "right");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "top",
    "bottom",
  ]);
});

test("borderHorizontal", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, ["right", "left"]);
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderHorizontal and borderLeft", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-AppHeader": EXPECTED_BORDER_DEFAULT,
      "borderLeft-AppHeader": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "left");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "right");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderHorizontal and borderRight", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-AppHeader": EXPECTED_BORDER_DEFAULT,
      "borderRight-AppHeader": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "right");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "left");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderTop", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "top");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "right",
    "bottom",
  ]);
});

test("borderBottom", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "bottom");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "right",
    "top",
  ]);
});

test("borderVertical", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-AppHeader": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("borderVertical and borderTop", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-AppHeader": EXPECTED_BORDER_DEFAULT,
      "borderTop-AppHeader": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "bottom");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "top");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("borderVertical and border-bottom", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-AppHeader": EXPECTED_BORDER_DEFAULT,
      "borderBottom-AppHeader": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "top");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "bottom");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("border-color", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-AppHeader": EXPECTED_COLOR,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).not.toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).not.toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-horizontal", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, ["right", "left"]);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-left", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "left");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-right", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "right");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-vertical", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, ["top", "bottom"]);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-top", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "top");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-bottom", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomColor-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "bottom");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border-style", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-AppHeader": EXPECTED_STYLE,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).not.toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).not.toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-horizontal", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, ["left", "right"]);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-left", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "left");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-right", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "right");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-vertical", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, ["top", "bottom"]);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-top", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "top");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-bottom", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "bottom");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border-thickness", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-AppHeader": EXPECTED_WIDTH,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).not.toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).not.toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH, "bottom");
});

test("border, border-thickness", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED);
});

test("border, border-thickness-horizontal", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, ["left", "right"]);
});

test("border, border-thickness-left", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "left");
});

test("border, border-thickness-right", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "right");
});

test("border, border-thickness-vertical", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, ["top", "bottom"]);
});

test("border, border-thickness-top", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "top");
});

test("border, border-thickness-bottom", async ({ initTestBed, createAppHeaderDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomWidth-AppHeader": UPDATED,
      "border-AppHeader": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAppHeaderDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "bottom");
});
