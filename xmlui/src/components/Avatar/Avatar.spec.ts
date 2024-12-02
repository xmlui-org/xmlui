// import { expect, ComponentDriver, createTestWithDriver } from "../../testing/helpers/fixtures"
import { expect, ComponentDriver, createTestWithDriver } from "@testing/fixtures"
// --- Setup

class AvatarDriver extends ComponentDriver {
  get avatar() {
    return this.locator;
  }
}

const test = createTestWithDriver(AvatarDriver);

// --- Testing

test("No initials without name", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar />`);
  await expect(driver.avatar).toBeEmpty();
});

test("No initials with empty name", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name=""/>`);
  await expect(driver.avatar).toBeEmpty();
});

test("Name with ascii symbols works", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="B 'Alan"/>`);
  await expect(driver.avatar).toContainText("B'");
});

test("Name is numbers", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="123"/>`);
  await expect(driver.avatar).toContainText("1");
});

test("Name is 孔丘 (Kong Qiu)", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="孔丘"/>`);
  await expect(driver.avatar).toContainText("孔");
});

test("Can render 1 initial", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="Tim"/>`);
  await expect(driver.avatar).toContainText("T");
});

test("Can render 2 initials", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="Tim Smith"/>`);
  await expect(driver.avatar).toContainText("TS");
});

test("Can render 3 initials", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="Tim John Smith"/>`);
  await expect(driver.avatar).toContainText("TJS");
});

test("Max 3 initials", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="Tim John Smith Jones"/>`);
  await expect(driver.avatar).toContainText("TJS");
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

test("testState initializes to default value", async ({ createDriver }) => {
  const driver = await createDriver(`<Fragment />`);
  await expect.poll(driver.testState).toEqual(null);
});

test("click works", async ({ createDriver }) => {
  const driver = await createDriver(`<Avatar name="Molly Dough" onClick="testState = true" />`);
  await driver.click();
  await expect.poll(driver.testState).toEqual(true);
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
