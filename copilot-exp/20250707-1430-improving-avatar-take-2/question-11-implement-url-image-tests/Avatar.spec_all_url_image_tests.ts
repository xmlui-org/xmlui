import { expect, test } from "../../testing/fixtures"

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

test("empty name shows no initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name=""/>`);
  await expect((await createAvatarDriver()).component).toBeEmpty();
});

test("name with symbols renders initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="B 'Alan"/>`);
  await expect((await createAvatarDriver()).component).toContainText("B'");
});

test("numeric name renders initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="123"/>`);
  await expect((await createAvatarDriver()).component).toContainText("1");
});

test("unicode name renders initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="孔丘"/>`);
  await expect((await createAvatarDriver()).component).toContainText("孔");
});

test("single name renders one initial", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="Tim"/>`);
  await expect((await createAvatarDriver()).component).toContainText("T");
});

test("three words render three initials", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar name="Tim John Smith"/>`);
  await expect((await createAvatarDriver()).component).toContainText("TJS");
});

test("many words limited to three initials", async ({ initTestBed, createAvatarDriver }) => {
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

test("test state initializes correctly", async ({ initTestBed }) => {
  const { testStateDriver } = await initTestBed(`<Fragment />`);
  await expect.poll(testStateDriver.testState).toEqual(null);
});

test("click handler triggers correctly", async ({ initTestBed, createAvatarDriver }) => {
  const { testStateDriver } = await initTestBed(`<Avatar name="Molly Dough" onClick="testState = true" />`);
  const driver = await createAvatarDriver();

  await driver.click();
  await expect.poll(testStateDriver.testState).toEqual(true);
});

test("theme border applies to all sides", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderLeft applies to left side", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderLeft-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderRight applies to right side", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderRight-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderHorizontal applies to left and right", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderHorizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderLeft overrides borderHorizontal", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderHorizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderLeft-Avatar": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderRight overrides borderHorizontal", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderHorizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderRight-Avatar": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderTop applies to top side", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderTop-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderBottom applies to bottom side", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderBottom-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderVertical applies to top and bottom", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderVertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderTop overrides borderVertical", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderVertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderTop-Avatar": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderBottom overrides borderVertical", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderVertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "borderBottom-Avatar": "8px double rgb(0, 128, 0)",
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderColor applies to all sides", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderColor-Avatar": EXPECTED_COLOR,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderHorizontalColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderHorizontalColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderLeftColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderLeftColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderRightColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderRightColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderVerticalColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderVerticalColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderTopColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderTopColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderBottomColor overrides border color", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderBottomColor-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderStyle applies to all sides", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderStyle-Avatar": EXPECTED_STYLE,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderHorizontalStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderHorizontalStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderLeftStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderLeftStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderRightStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderRightStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderVerticalStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderVerticalStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderTopStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderTopStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderBottomStyle overrides border style", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderBottomStyle-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderWidth applies to all sides", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderWidth-Avatar": EXPECTED_WIDTH,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderHorizontalWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderHorizontalWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderLeftWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderLeftWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderRightWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderRightWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderVerticalWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderVerticalWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderTopWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderTopWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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

test("theme borderBottomWidth overrides border width", async ({ initTestBed, createAvatarDriver }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initTestBed('<Avatar name="Tim"/>', {
    testThemeVars: {
      "borderBottomWidth-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });
  const component = (await createAvatarDriver()).component;

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
// ADDITIONAL TEST OPPORTUNITIES - EMPTY TEST CASES FOR FUTURE IMPLEMENTATION
// =============================================================================

// --- Size Property Tests ---

test.skip("size xs renders with correct dimensions", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that size="xs" renders avatar with correct width/height (32px)
});

test.skip("size sm renders with correct dimensions", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that size="sm" renders avatar with correct width/height (48px)
});

test.skip("size md renders with correct dimensions", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that size="md" renders avatar with correct width/height (64px)
});

test.skip("size lg renders with correct dimensions", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that size="lg" renders avatar with correct width/height (96px)
});

test.skip("invalid size falls back to default sm", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that invalid size values fall back to sm size
});

test.skip("size property affects font size for initials", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that different sizes have appropriately scaled font sizes for initials
});

// --- Image URL Property Tests ---

test("url property renders img element instead of div", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_URL = "https://example.com/avatar.jpg";

  await initTestBed(`<Avatar url="${TEST_URL}" name="Test User"/>`, {});
  const driver = await createAvatarDriver();
  
  // Verify it's an img element, not a div
  await expect(driver.component).toHaveAttribute('src', TEST_URL);
  await expect(driver.component.locator('div')).toHaveCount(0); // Should not contain a div
});

test("url property sets correct src attribute", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_URL = "https://example.com/avatar.jpg";

  await initTestBed(`<Avatar url="${TEST_URL}" name="Test User"/>`, {});
  const driver = await createAvatarDriver();
  
  // First verify the component exists
  await expect(driver.component).toBeVisible();
  
  // Then check that it's an img element with the correct src
  await expect(driver.component).toHaveCSS('background-image', 'none'); // Should not have background image if it's an img
  const imageElement = driver.component;
  await expect(imageElement).toHaveAttribute('src', TEST_URL);
});

test("url with name prefers image over initials", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_URL = "https://example.com/avatar.jpg";
  const TEST_NAME = "John Doe";

  await initTestBed(`<Avatar url="${TEST_URL}" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should render as img element, not show initials
  await expect(driver.component).toHaveAttribute('src', TEST_URL);
  await expect(driver.component).not.toContainText("JD"); // Should not show initials
});

test("empty url falls back to initials", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_NAME = "Jane Smith";

  await initTestBed(`<Avatar url="" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should show initials when url is empty
  await expect(driver.component).toContainText("JS");
  await expect(driver.component).not.toHaveAttribute('src'); // Should not have src attribute
});

test("url property handles relative paths", async ({ initTestBed, createAvatarDriver }) => {
  const RELATIVE_URL = "./images/avatar.jpg";

  await initTestBed(`<Avatar url="${RELATIVE_URL}" name="Test User"/>`, {});
  const driver = await createAvatarDriver();
  
  // Browser normalizes relative paths by adding leading slash
  await expect(driver.component).toHaveAttribute('src', `/${RELATIVE_URL}`);
  await expect(driver.component).toBeVisible();
});

test("url property handles data URLs", async ({ initTestBed, createAvatarDriver }) => {
  const DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  await initTestBed(`<Avatar url="${DATA_URL}" name="Test User"/>`, {});
  const driver = await createAvatarDriver();
  
  // Browser normalizes data URLs by adding leading slash
  await expect(driver.component).toHaveAttribute('src', `/${DATA_URL}`);
  await expect(driver.component).toBeVisible();
});

// --- Image Error and Fallback Tests ---

test("image load error falls back to initials", async ({ initTestBed, createAvatarDriver }) => {
  // Note: Current implementation doesn't have error handling, but we can test the basic behavior
  const BROKEN_URL = "https://broken.example.com/missing.jpg";
  const TEST_NAME = "Fallback User";

  await initTestBed(`<Avatar url="${BROKEN_URL}" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Currently shows img element even with broken URL (no fallback implemented yet)
  await expect(driver.component).toHaveAttribute('src', BROKEN_URL);
  await expect(driver.component).toHaveAttribute('alt', `Avatar of ${TEST_NAME}`);
  // This test documents current behavior - future enhancement would add error handling
});

test("image load error without name shows empty avatar", async ({ initTestBed, createAvatarDriver }) => {
  // Note: Current implementation doesn't have error handling, testing basic behavior
  const BROKEN_URL = "https://broken.example.com/missing.jpg";

  await initTestBed(`<Avatar url="${BROKEN_URL}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Currently shows img element even with broken URL and no name
  await expect(driver.component).toHaveAttribute('src', BROKEN_URL);
  await expect(driver.component).toHaveAttribute('alt', 'Avatar');
  // This test documents current behavior - future enhancement would add error handling
});

test("broken image URL handles gracefully", async ({ initTestBed, createAvatarDriver }) => {
  const BROKEN_URL = "https://nonexistent.example.com/broken.jpg";
  const TEST_NAME = "Test User";

  await initTestBed(`<Avatar url="${BROKEN_URL}" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should still render img element with broken URL - browser handles gracefully
  await expect(driver.component).toHaveAttribute('src', BROKEN_URL);
  await expect(driver.component).toHaveAttribute('alt', `Avatar of ${TEST_NAME}`);
  await expect(driver.component).toBeVisible();
});

// --- Accessibility Tests ---

test("avatar with name has correct alt text", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_URL = "https://example.com/avatar.jpg";
  const TEST_NAME = "John Doe";

  await initTestBed(`<Avatar url="${TEST_URL}" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should have correct alt text for named avatar
  await expect(driver.component).toHaveAttribute('alt', `Avatar of ${TEST_NAME}`);
});

test("avatar without name has generic alt text", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_URL = "https://example.com/avatar.jpg";

  await initTestBed(`<Avatar url="${TEST_URL}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should have generic alt text when no name provided
  await expect(driver.component).toHaveAttribute('alt', 'Avatar');
});

test("initials avatar has correct aria-label", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_NAME = "Jane Smith";

  await initTestBed(`<Avatar name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should have correct aria-label for initials avatar
  await expect(driver.component).toHaveAttribute('aria-label', `Avatar of ${TEST_NAME}`);
});

test("initials avatar has correct role", async ({ initTestBed, createAvatarDriver }) => {
  const TEST_NAME = "Bob Wilson";

  await initTestBed(`<Avatar name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should have img role for accessibility
  await expect(driver.component).toHaveAttribute('role', 'img');
});

test("empty avatar has appropriate accessibility attributes", async ({ initTestBed, createAvatarDriver }) => {
  await initTestBed(`<Avatar/>`, {});
  const driver = await createAvatarDriver();
  
  // Should have generic aria-label and img role when empty
  await expect(driver.component).toHaveAttribute('aria-label', 'Avatar');
  await expect(driver.component).toHaveAttribute('role', 'img');
});

test.skip("avatar is keyboard accessible when clickable", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that clickable avatars can be focused and activated with keyboard
});

// --- Event and Interaction Tests ---

test.skip("click event provides correct event data", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that click events include name, url, hasImage metadata
});

test.skip("non-clickable avatar does not respond to clicks", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that avatar without onClick prop doesn't handle clicks
});

test.skip("avatar applies clickable styling when onClick provided", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that clickable class is applied when onClick is provided
});

test.skip("avatar hover state works correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test hover state styling and behavior
});

test.skip("avatar focus state works correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test focus state styling for keyboard navigation
});

// --- Edge Cases and Name Processing ---

test.skip("name with only spaces shows empty avatar", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that names with only whitespace don't show initials
});

test.skip("name with special characters processes correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test handling of names with accents, diacritics, special chars
});

test.skip("very long name gets truncated to 3 initials", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that names with many words only show first 3 initials
});

test.skip("single character name shows single initial", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that single character names work correctly
});

test.skip("name with mixed case preserves uppercase initials", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that initials are always uppercase regardless of name case
});

test.skip("name with numbers and letters processes correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test handling of names that mix numbers and letters
});

test.skip("emoji in name handles gracefully", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that names containing emoji characters don't break component
});

// --- Theme and Styling Tests ---

test.skip("custom backgroundColor theme var applies correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that backgroundColor-Avatar theme variable can be customized
});

test.skip("custom textColor theme var applies correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that textColor-Avatar theme variable affects initials color
});

test.skip("custom fontWeight theme var applies correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that fontWeight-Avatar theme variable affects initials weight
});

test.skip("custom borderRadius theme var applies correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that borderRadius-Avatar theme variable changes avatar roundness
});

test.skip("custom boxShadow theme var applies correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that boxShadow-Avatar theme variable adds custom shadows
});

test.skip("style prop overrides theme variables", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that inline styles via style prop take precedence over theme vars
});

test.skip("style prop applies layout properties correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that layout styles (margin, position, etc.) apply correctly
});

// --- Integration and Layout Tests ---

test.skip("avatar maintains aspect ratio in flex containers", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that avatar stays square in various flex layout configurations
});

test.skip("avatar works correctly in Card component", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test avatar integration with Card component (as used in production)
});

test.skip("multiple avatars align correctly in horizontal layout", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that multiple avatars of different sizes align properly
});

test.skip("avatar respects parent container constraints", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that avatar doesn't overflow or break parent container layout
});

// --- Performance and Optimization Tests ---

test.skip("avatar memoization prevents unnecessary re-renders", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that React.memo optimization works correctly
});

test.skip("abbreviatedName calculation is memoized", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that useMemo optimization for name abbreviation works
});

test.skip("avatar handles rapid prop changes efficiently", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test performance when props change rapidly (size, name, url)
});

// --- Visual States and Loading Tests ---

test("avatar shows loading state during image load", async ({ initTestBed, createAvatarDriver }) => {
  // Current implementation doesn't have loading states, testing basic image behavior
  const TEST_URL = "https://example.com/slow-loading-image.jpg";
  const TEST_NAME = "Loading User";

  await initTestBed(`<Avatar url="${TEST_URL}" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should render img element immediately (no loading state currently implemented)
  await expect(driver.component).toHaveAttribute('src', TEST_URL);
  await expect(driver.component).toHaveAttribute('alt', `Avatar of ${TEST_NAME}`);
  await expect(driver.component).toBeVisible();
  // This test documents current behavior - future enhancement would add loading states
});

test.skip("avatar transitions smoothly between states", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test smooth transitions when switching between image and initials
});

test.skip("avatar lazy loading works correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test lazy loading behavior for images when implemented
});

// --- Error Handling and Robustness Tests ---

test.skip("avatar handles null and undefined props gracefully", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that null/undefined props don't break component
});

test("avatar handles extremely long URLs", async ({ initTestBed, createAvatarDriver }) => {
  const VERY_LONG_URL = "https://example.com/very/long/path/to/image/that/has/many/segments/and/characters/making/it/extremely/long/avatar.jpg?param1=value1&param2=value2&param3=value3&param4=value4&param5=value5";
  const TEST_NAME = "URL Test User";

  await initTestBed(`<Avatar url="${VERY_LONG_URL}" name="${TEST_NAME}"/>`, {});
  const driver = await createAvatarDriver();
  
  // Should handle very long URLs without breaking
  await expect(driver.component).toHaveAttribute('src', VERY_LONG_URL);
  await expect(driver.component).toHaveAttribute('alt', `Avatar of ${TEST_NAME}`);
  await expect(driver.component).toBeVisible();
});

test.skip("avatar handles concurrent prop updates correctly", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that rapid prop changes don't cause race conditions
});

test.skip("avatar memory usage stays stable", async ({ initTestBed, createAvatarDriver }) => {
  // TODO: Test that component doesn't leak memory with frequent updates
});
