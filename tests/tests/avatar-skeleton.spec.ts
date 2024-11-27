import type { Locator, Page } from "@playwright/test";
import type { ThemeTestDesc } from "./component-test-helpers";
import type { baseComponentFixtures} from "./fixtures";
import type { ComponentDef } from "../../xmlui/src/abstractions/ComponentDefs";

import { test as base, expect, TEST_EVENT_PLACEHOLDER } from "./fixtures";
import { initApp } from "./component-test-helpers";
import { INITIAL_THEME_TONE } from "../../xmlui/src/abstractions/ThemingDefs";
import { xmlUiMarkupToComponent } from "../../xmlui/src/components-core/xmlui-parser";


class ComponentDriver {
  protected readonly componentLocator: Locator
  protected readonly testStateLocator: Locator

  constructor({ componentLocator, testStateViewLocator }) {
    this.componentLocator = componentLocator;
    this.testStateLocator = testStateViewLocator;
  }

  async click() {
    await this.componentLocator.click()
  }

  async expectDefaultTestState(options?: {timeout?: number, intervals?: number[]}) {
    await this.expectTestStateToEq({}, options)
  }

  async expectTestStateToEq(expected: any, options?: {timeout?: number, intervals?: number[]}) {
    await expect.poll(this.getTestState(), options).toEqual(expected);
  }

  /** returns an async function that can query the test state */
  private getTestState(){
    return async () =>{
      const text = await this.testStateLocator.textContent();
      const testState = JSON.parse(text!);
      return testState
    }
  }
}

class AvatarDriver extends ComponentDriver {
  async expectInitials(initials: string) {
    await expect(this.componentLocator).toContainText(initials)
  }

  async expectNoInitials(){
    await expect(this.componentLocator).toBeEmpty();
  }
}

type avatarFixtures = baseComponentFixtures & {
  createAvatarDriver: (source: string) => Promise<AvatarDriver>;
};

export const test = base.extend<avatarFixtures>({
  createAvatarDriver: async ({page}, use) =>{
    await use(async (source: string) => {
      const testStateViewTestId = "test-state-view-testid"
      // await initSingleTestComponent()
      const prefix = `<Fragment var.testState="{{}}">`
      const suffix =`
        <Stack width="0" height="0">
          <Text
            testId="${testStateViewTestId}"
            value="{ JSON.stringify(testState) }"/>
        </Stack>
      </Fragment>`
      const code = prefix + source + suffix
      const { errors, component } = xmlUiMarkupToComponent(code)
      if (errors.length > 0){
        throw { errors: errors };
      }
      let componentTestId = "test-id-component";
      const children =(component as ComponentDef).children
      const child0 = children?.[0]
      const testId = child0?.testId
      if(testId){
        componentTestId = testId
      } else {
        component.children ??= []
        component.children[0]!.testId ??= componentTestId
      }

      await initApp(page, { entryPoint: component });
      return new AvatarDriver({ componentLocator:page.getByTestId(componentTestId) , testStateViewLocator: page.getByTestId(testStateViewTestId) })
    });
  }
});

const RED = "rgb(255, 0, 0)";

test("No initials without name", async ({ createAvatarDriver}) => {
  const avatar = await createAvatarDriver(`<Avatar />`);
  await avatar.expectNoInitials()
});

test("No initials with empty name", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name=""/>`);
  await avatar.expectNoInitials()
});

test("Name with ascii symbols works", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="B 'Alan"/>`);
  await avatar.expectInitials('B\'');
});

test("Name is numbers", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="123"/>`);
  await avatar.expectInitials('1');
});

test("Name is 孔丘 (Kong Qiu)", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="孔丘"/>`);
  await avatar.expectInitials('孔');
});

test("Can render 1 initial", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="Tim"/>`);
  await avatar.expectInitials('T');
});

test("Can render 2 initials", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="Tim Smith"/>`);
  await avatar.expectInitials('TS');
});

test("Can render 3 initials", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="Tim John Smith"/>`);
  await avatar.expectInitials('TJS');
});

test("Max 3 initials", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar testId="avatar" name="Tim John Smith Jones"/>`);
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

test("click works", async ({ createAvatarDriver }) => {
  const avatar = await createAvatarDriver(`<Avatar name="Molly Dough" onClick="testState = true" />`);
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
