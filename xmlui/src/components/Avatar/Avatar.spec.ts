import { expect, test } from "../../testing/fixtures"
import { initThemedApp } from "../../testing/themed-app-test-helpers";

// --- Testing

test.describe("smoke tests", {tag: "@smoke"}, () =>{
  test("No initials without name", async ({ initTestBed, createAvatarDriver }) => {
    await initTestBed(`<Avatar />`);
    await expect((await createAvatarDriver()).component).toBeEmpty();
  });

  test("Can render 2 initials", async ({ initTestBed, createAvatarDriver }) => {
    await initTestBed(`<Avatar name="Tim Smith"/>`);
    await expect((await createAvatarDriver()).component).toContainText("TS");
  });
});

test("No initials with empty name smoke", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name=""/>`);
  await expect((await createAvatarDriver()).component).toBeEmpty();
});

test("Name with ascii symbols works", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="B 'Alan"/>`);
  await expect((await createAvatarDriver()).component).toContainText("B'");
});

test("Name is numbers", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="123"/>`);
  await expect((await createAvatarDriver()).component).toContainText("1");
});

test("Name is 孔丘 (Kong Qiu)", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="孔丘"/>`);
  await expect((await createAvatarDriver()).component).toContainText("孔");
});

test("Can render 1 initial", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="Tim"/>`);
  await expect((await createAvatarDriver()).component).toContainText("T");
});

test("Can render 3 initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="Tim John Smith"/>`);
  await expect((await createAvatarDriver()).component).toContainText("TJS");
});

test("Max 3 initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="Tim John Smith Jones"/>`);
  await expect((await createAvatarDriver()).component).toContainText("TJS");
});

// const sizes = [
//   { size: "xs", expected: ""},
//   { size: "sm", expected: ""},
//   { size: "md", expected: ""},
//   { size: "lg", expected: ""},
// ]
// sizes.forEach((tc) =>{
//   test(`"${tc.size}" works with no name`, async ({}) => {
//   });

//   test(`"${tc.size}" works with empty name`, async ({}) => {
//   });

//   test(`"${tc.size}" works with "I"`, async ({}) => {
//   });

//   test(`"${tc.size}" works with "WWW"`, async ({}) => {
//   });
//   test(`"${tc.size}" works with image`, async ({}) => {
//   });
// })

// test("url image status 404", async ({ }) => {
// });

// test("url image status 400", async ({ }) => {
// });

// test("url returns non-image", async ({ }) => {
// });

// sizes.forEach((tc) => {
//   test(`${tc.size} url image 100x100px`, async ({ }) => {
//   });

//   test(`${tc.size} url image 100x200px`, async ({ }) => {
//   });

//   test(`${tc.size} url image 200x100px`, async ({ }) => {
//   });
// });

test("testState initializes to default value", async ({ initTestBed }) => {
  const { testStateDriver } = await initTestBed(`<Fragment />`);
  await expect.poll(testStateDriver.testState).toEqual(null);
});

test("click works", async ({ initTestBed, createAvatarDriver }) => {
  const { testStateDriver } = await initTestBed(`<Avatar name="Molly Dough" onClick="testState = true" />`);
  const driver = await createAvatarDriver();

  await driver.click();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

const CODE = '<Avatar name="Tim"/>';

test("border", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "border-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT);
});

test("borderLeft", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeft-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "left");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "right",
    "top",
    "bottom",
  ]);
});

test("borderRight", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderRight-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "right");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "top",
    "bottom",
  ]);
});

test("borderHorizontal", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, ["right", "left"]);
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderHorizontal and borderLeft", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Avatar": EXPECTED_BORDER_DEFAULT,
      "borderLeft-Avatar": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "left");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "right");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderHorizontal and borderRight", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontal-Avatar": EXPECTED_BORDER_DEFAULT,
      "borderRight-Avatar": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "right");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "left");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
});

test("borderTop", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderTop-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "top");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "right",
    "bottom",
  ]);
});

test("borderBottom", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottom-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "bottom");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, [
    "left",
    "right",
    "top",
  ]);
});

test("borderVertical", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Avatar": EXPECTED_BORDER_DEFAULT,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, ["top", "bottom"]);
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("borderVertical and borderTop", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Avatar": EXPECTED_BORDER_DEFAULT,
      "borderTop-Avatar": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "bottom");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "top");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("borderVertical and border-bottom", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_BORDER_DEFAULT = "5px dotted rgb(255, 0, 0)";
  const EXPECTED_BORDER_UPDATE = "8px double rgb(0, 128, 0)";
  await initTestBed(CODE, {
    testThemeVars: {
      "borderVertical-Avatar": EXPECTED_BORDER_DEFAULT,
      "borderBottom-Avatar": EXPECTED_BORDER_UPDATE,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_DEFAULT, "top");
  await expect(driver.component).toHaveBorder(EXPECTED_BORDER_UPDATE, "bottom");
  await expect(driver.component).not.toHaveBorder(EXPECTED_BORDER_DEFAULT, ["left", "right"]);
});

test("border-color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Avatar": EXPECTED_COLOR,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).not.toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).not.toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-horizontal", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, ["right", "left"]);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-left", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "left");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-right", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "right");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-vertical", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, ["top", "bottom"]);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-top", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "top");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-color-bottom", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(UPDATED, "bottom");
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border-style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Avatar": EXPECTED_STYLE,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).not.toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).not.toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-horizontal", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, ["left", "right"]);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-left", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "left");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-right", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "right");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-vertical", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, ["top", "bottom"]);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-top", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "top");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-style-bottom", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(UPDATED, "bottom");
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border-thickness", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Avatar": EXPECTED_WIDTH,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).not.toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).not.toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(EXPECTED_WIDTH);
});

test("border, border-thickness", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED);
});

test("border, border-thickness-horizontal", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderHorizontalWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, ["left", "right"]);
});

test("border, border-thickness-left", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderLeftWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "left");
});

test("border, border-thickness-right", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderRightWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "right");
});

test("border, border-thickness-vertical", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderVerticalWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, ["top", "bottom"]);
});

test("border, border-thickness-top", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderTopWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "top");
});

test("border, border-thickness-bottom", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed(CODE, {
    testThemeVars: {
      "borderBottomWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const driver = await createAvatarDriver();
  await expect(driver.component).toHaveBorderColor(EXPECTED_COLOR);
  await expect(driver.component).toHaveBorderStyle(EXPECTED_STYLE);
  await expect(driver.component).toHaveBorderWidth(UPDATED, "bottom");
});
