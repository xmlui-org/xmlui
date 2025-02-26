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

// theme vars are more intricate, global theme vars can interact
// const THEME_TESTS: ThemeTestDesc[] = [
//   { themeVar: "color-bg-Avatar", themeVarAsCSS: "background-color", expected: RED },
//   { themeVar: "color-border-Avatar", themeVarAsCSS: "border-color", expected: RED },
//   { themeVar: "color-text-Avatar", themeVarAsCSS: "color", expected: RED },
//   { themeVar: "font-weight-Avatar", themeVarAsCSS: "font-weight", expected: "700" },
//   { themeVar: "radius-Avatar", themeVarAsCSS: "border-radius", expected: "15px" },
//   { themeVar: "shadow-Avatar", themeVarAsCSS: "box-shadow", expected: RED + " 5px 10px 0px 0px" },
//   { themeVar: "style-border-Avatar", themeVarAsCSS: "border-style", expected: "dotted" },
//   { themeVar: "thickness-border-Avatar", themeVarAsCSS: "border-width", expected: "5px"},
// ];

// THEME_TESTS.forEach((testCase) => {
//   test(testCase.themeVar, async ({ }) => {
//   });
// });

const AVATAR_CODE = '<Avatar testId="avatar" name="Tim"/>';

test("border", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-left-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-right-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-horizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-horizontal and border-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-horizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-left-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", "double");
});

test("border-horizontal and border-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-horizontal-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-right-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", "double");
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-top-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-bottom-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-vertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-vertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-top-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", "double");
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-vertical and border-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "border-vertical-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
      "border-bottom-Avatar": "8px double rgb(0, 128, 0)",
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", "rgb(0, 128, 0)");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", "8px");
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", "double");
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-Avatar": EXPECTED_COLOR,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-horizontal-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-left-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-right-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-vertical-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-top-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-color-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "rgb(0, 128, 0)";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "color-border-bottom-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-Avatar": EXPECTED_STYLE,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-horizontal-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-left-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", UPDATED);
});

test("border, border-style-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-right-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-vertical-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-top-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-style-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "double";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "style-border-bottom-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(0, 128, 0)";
  const EXPECTED_WIDTH = "8px";
  const EXPECTED_STYLE = "dotted";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-Avatar": EXPECTED_WIDTH,
    },
  });

  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).not.toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-horizontal", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-horizontal-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-left", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-left-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-right", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-right-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-vertical", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-vertical-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-top", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-top-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});

test("border, border-thickness-bottom", async ({ page }) => {
  const EXPECTED_COLOR = "rgb(255, 0, 0)";
  const EXPECTED_WIDTH = "5px";
  const EXPECTED_STYLE = "dotted";
  const UPDATED = "12px";

  await initThemedApp(page, AVATAR_CODE, {
    themeVars: {
      "thickness-border-bottom-Avatar": UPDATED,
      "border-Avatar": `${EXPECTED_STYLE} ${EXPECTED_COLOR} ${EXPECTED_WIDTH}`,
    },
  });

  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-top-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-right-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-width", UPDATED);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-bottom-style", EXPECTED_STYLE);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-color", EXPECTED_COLOR);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-width", EXPECTED_WIDTH);
  await expect(page.getByTestId("avatar")).toHaveCSS("border-left-style", EXPECTED_STYLE);
});
