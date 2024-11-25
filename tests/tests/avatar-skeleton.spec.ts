import type { Locator, Page } from "@playwright/test";
import type { ThemeTestDesc } from "./component-test-helpers";
import type { baseComponentFixtures} from "./fixtures";

import { test as base, expect, TEST_EVENT_PLACEHOLDER } from "./fixtures";
import { initApp } from "./component-test-helpers";
import { INITIAL_THEME_TONE } from "../../xmlui/src/abstractions/ThemingDefs";


class AvatarDriver {
  constructor(private readonly avatar: Locator) { }
  async expectInitials(initials: string) {
    await expect(this.avatar).toContainText(initials)
  }
  async expectNoInitials(){
    await expect(this.avatar).toBeEmpty();
  }
  async click() {
    await this.avatar.click()
  }
}

type avatarFixtures = baseComponentFixtures & {
  createAvatarDriver: (testId: string) => AvatarDriver;
};
export const test = base.extend<avatarFixtures>({
  createAvatarDriver: async ({page}, use) =>{
    await use((testId: string) => {
      const avatarLocator = page.getByTestId(testId)
      return new AvatarDriver(avatarLocator)
    });
  }
});

const RED = "rgb(255, 0, 0)";

test("No initials without name", async ({ initComponent, createAvatarDriver}) => {
  await initComponent(`<Avatar testId="avatar"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectNoInitials()
});

test("No initials with empty name", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name=""/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectNoInitials()
});

test("Name with ascii symbols works", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="B 'Alan"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectInitials('B\'');
});

test("Name is numbers", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="123"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectInitials('1');
});

test("Name is 孔丘 (Kong Qiu)", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="孔丘"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectInitials('孔');
});

test("Can render 1 initial", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="Tim"/>`);
  const driver = createAvatarDriver("avatar")
  await driver.expectInitials('T');
});

test("Can render 2 initials", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="Tim Smith"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectInitials('TS');
});

test("Can render 3 initials", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="Tim John Smith"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectInitials('TJS');
});

test("Max 3 initials", async ({ initComponent, createAvatarDriver }) => {
  await initComponent(`<Avatar testId="avatar" name="Tim John Smith Jones"/>`);
  const driver = createAvatarDriver("avatar");
  await driver.expectInitials('TJS');
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

test("click works", async ({ initComponentWithEventWrapper, createAvatarDriver }) => {
  const testBed = await initComponentWithEventWrapper(
    `<Avatar testId="avatar" name="Molly Dough" onClick="${TEST_EVENT_PLACEHOLDER}" />`
  );
  const driver = createAvatarDriver("avatar");
  //the driver uses the testBed inside itself

  testBed.expectEventNotToBeInvoked()
  await driver.click();
  testBed.expectEventToBeInvoked()
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
