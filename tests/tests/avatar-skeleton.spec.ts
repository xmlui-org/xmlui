import { expect, ComponentDriver, createTestWithComponentDriverFixture} from "./fixtures";

class AvatarDriver extends ComponentDriver {
  async expectInitials(initials: string) {
    await expect(this.componentLocator).toContainText(initials)
  }

  async expectNoInitials(){
    await expect(this.componentLocator).toBeEmpty();
  }
}

const test = createTestWithComponentDriverFixture(AvatarDriver)

const RED = "rgb(255, 0, 0)";

test("No initials without name", async ({ createDriver}) => {
  const avatar = await createDriver(`<Avatar />`);
  await avatar.expectNoInitials()
});

test("No initials with empty name", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name=""/>`);
  await avatar.expectNoInitials()
});

test("Name with ascii symbols works", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="B 'Alan"/>`);
  await avatar.expectInitials('B\'');
});

test("Name is numbers", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="123"/>`);
  await avatar.expectInitials('1');
});

test("Name is 孔丘 (Kong Qiu)", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="孔丘"/>`);
  await avatar.expectInitials('孔');
});

test("Can render 1 initial", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="Tim"/>`);
  await avatar.expectInitials('T');
});

test("Can render 2 initials", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="Tim Smith"/>`);
  await avatar.expectInitials('TS');
});

test("Can render 3 initials", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="Tim John Smith"/>`);
  await avatar.expectInitials('TJS');
});

test("Max 3 initials", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar testId="avatar" name="Tim John Smith Jones"/>`);
  await avatar.expectInitials('TJS');
});

const sizes = [
  { size: "xs", expected: ""},
  { size: "sm", expected: ""},
  { size: "md", expected: ""},
  { size: "lg", expected: ""},
]
sizes.forEach((tc) =>{
  test(`"${tc.size}" works with no name`, async ({}) => {
  });

  test(`"${tc.size}" works with empty name`, async ({}) => {
  });

  test(`"${tc.size}" works with "I"`, async ({}) => {
  });

  test(`"${tc.size}" works with "WWW"`, async ({}) => {
  });
  test(`"${tc.size}" works with image`, async ({}) => {
  });
})

test("url image status 404", async ({ }) => {
});

test("url image status 400", async ({ }) => {
});

test("url returns non-image", async ({ }) => {
});


sizes.forEach((tc) => {
  test(`${tc.size} url image 100x100px`, async ({ }) => {
  });

  test(`${tc.size} url image 100x200px`, async ({ }) => {
  });

  test(`${tc.size} url image 200x100px`, async ({ }) => {
  });
});

test("click works", async ({ createDriver }) => {
  const avatar = await createDriver(`<Avatar name="Molly Dough" onClick="testState = true" />`);
  await avatar.expectDefaultTestState();
  await avatar.click();
  await avatar.expectTestStateToEq(true);
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
