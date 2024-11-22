import type { Page } from "@playwright/test";
import { expect as baseExpect, mergeExpects, test as base } from "@playwright/test";
import { initApp } from "./component-test-helpers";

export type baseComponentFixtures = {
  initComponent: (entryPoint: string) => Promise<void>;
  initComponentWithEventWrapper: (entryPoint: string) => Promise<TestBed>;
};

export const TEST_EVENT_PLACEHOLDER = "€EVENT_TESTING_PLACEHOLDER_WILL_REPLACE_ON_INITIALIZATION€" as const;

// type KeyValue = { [key: string]: any };
// export function extendWithDriverFixture<Fixture extends KeyValue>(baseTest, driver){
//  return baseTest.extend<Fixture>({
//     createAvatarDriver: async ({page}, use) =>{
//       await use((testId: string) => {
//         const avatarLocator = page.getByTestId(testId)
//         return new AvatarDriver(avatarLocator)
//       });
//     }
//   });
// }

export const test = base.extend<baseComponentFixtures>({
  initComponent: async ({page}, use) => {
    await use(async (entryPoint: string) => {
      await initApp(page, { entryPoint });
    });
  },
  initComponentWithEventWrapper : async ({page}, use) => {
      await use(async (entryPoint: string) => {
        const eventTargetTestId = "__event_target_placeholder_testId" as const;
        const testVarNameEventModifies = "__test_event_modifies_this_variable" as const;
        if (!entryPoint.includes(TEST_EVENT_PLACEHOLDER)){
          throw new Error("Tried to initialize a component with event wrapper, but no placeholder was found for the event handler.")
        }
        const codeWithReplacedHandler = entryPoint.replace(TEST_EVENT_PLACEHOLDER, `
          ${testVarNameEventModifies} += 1
          `)
        const prefix = `<Fragment var.${testVarNameEventModifies} = "{ 0 }">`
        const suffix =`
          <Stack width="0" height="0">
          <Text
            testId="${eventTargetTestId}"
            value="{ ${testVarNameEventModifies} }"/>
            </Stack>
        </Fragment>`

        const code = prefix + codeWithReplacedHandler + suffix;
        await initApp(page, { entryPoint: code });
        return new TestBed(page, eventTargetTestId)
      });
    },
});

class TestBed {
  constructor(private readonly page: Page, private readonly eventTargetTestId){ }

  async expectEventToBeInvoked() {
    await expect(this.page.getByTestId(this.eventTargetTestId)).not.toBeEmpty()
    await expect(this.page.getByTestId(this.eventTargetTestId)).not.toHaveText("0")
  }

  async expectEventNotToBeInvoked() {
    await expect(this.page.getByTestId(this.eventTargetTestId)).toHaveText("0")
  }
}
const expectWithToEqualWithTolerance = baseExpect.extend({
  /**
   * Compares two numbers with an optional tolerance value. If the tolerance is set to 0 the comparator acts as `toEqual`.
   * Used to compare element dimensions on different platforms because of half pixel rendering.
   *
   * **Usage**
   *
   * ```js
   * const value = 8;
   * expect(value).toEqualWithTolerance(10, 2); // true
   * ```
   *
   * @param expected Expected value
   * @param tolerance Tolerance value, **default is 1**
   */
  toEqualWithTolerance(provided: number, expected: number, tolerance: number = 1) {
    const assertionName = "toEqualWithTolerance";
    let pass = false;

    if (provided >= expected - (tolerance || 0) && provided < expected + (tolerance || 0)) {
      pass = true;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, provided, expected, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.isNot ? "not" : ""}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(provided)}`
      : () =>
          this.utils.matcherHint(assertionName, provided, expected, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(provided)}`;

    return {
      message,
      pass,
      name: assertionName,
      expected,
      actual: undefined,
    };
  },
});

export type ColorChannelCombinations = "red" | "green" | "blue" | "grey"

const expectWithToBeShadeOf = baseExpect.extend({
  /**
   * Determines whether a color has a promininent red or green or blue shade in regards to the RGB colorspace.
   * How: the red, green or blue color channel value is higher than the others and the other 2 have the same value (so the most they can do is to make the color more pale).
   * Alpha channel is ignored the value to check should be a valid rgb or rgba color like "rgb(255, 0, 0)" or "rgba(255, 0, 0, 2)"
   */
  toBeShadeOf(providedColor: string, channel: ColorChannelCombinations ) {
    const assertionName = "toBeShadeOf";
    let pass = false;
    let expectedMiddle = "";
    let message: () => string;
    //simple regex for rgb or rgba colors
    const pattern = /rgba?\((\d{1,3}), (\d{1,3}), (\d{1,3})(, ((0\.)?\d+))?\)/m;
    const matches = providedColor.match(pattern);
    if (matches !== null) {
      const r = parseInt(matches[1]);
      const g = parseInt(matches[2]);
      const b = parseInt(matches[3]);
      if (channel === "red") {
        pass = g === b && r > g;
        expectedMiddle = "x, y, y";
      } else if (channel === "green") {
        pass = r === b && g > r;
        expectedMiddle = "y, x, y";
      } else if (channel === "blue") {
        pass = r === g && b > r;
        expectedMiddle = "y, y, x";
      }else if (channel === "grey") {
        pass = r === g && g === b;
        expectedMiddle = "x, x, x";
      }
    }
    const expectedStart = matches?.[4] ? "rgba(" : "rgb(";

    const expectedEnd = matches?.[4] ? ", z)" : ")";
    const expected = expectedStart + expectedMiddle + expectedEnd;

    if (matches === null) {
      message = () =>
        this.utils.matcherHint(assertionName, providedColor, expected, { isNot: this.isNot }) +
        "\n" +
        "Wrong rgb or rgba string pattern" +
        "\n\n" +
        `Expected to look like: "rgb(255, 0, 0)" or "rgba(225, 0, 0, 0)"\n` +
        `Received: ${this.utils.printReceived(providedColor)}`;
    } else {
      message = () =>
        this.utils.matcherHint(assertionName, providedColor, expected, { isNot: this.isNot }) +
        "\n" +
        "\n\n" +
        `Expected: ${this.isNot ? "not" : ""}${this.utils.printExpected(expected)} where x > y\n` +
        `Received: ${this.utils.printReceived(providedColor)}`;
    }

    return {
      message,
      pass,
      name: assertionName,
      expected,
      actual: providedColor,
    };
  },
});

const expectWithToBeTransparent = baseExpect.extend({
  /**
   * Determines whether a color is transparent using it's alpha channel.
   * The value to check should be a valid rgba color like "rgba(255, 0, 0, 0)"
   */
  toBeTransparent(providedColor: string) {
    const assertionName = "toBeTransparent";
    let pass = false;
    let message: () => string;
    //simple regex for rgba color
    const pattern = /(?<=rgba\(\d{1,3}, \d{1,3}, \d{1,3}, )(0\.)?\d+(?=\))/m;
    const matches = providedColor.match(pattern);

    pass = matches?.[0] === "0";
    let expected: string;
    if (matches === null) {
      expected = "rgba(225, 12, 34, 0)";
      message = () =>
        this.utils.matcherHint(assertionName, providedColor, expected, { isNot: this.isNot }) +
        "\n" +
        "Wrong rgba string pattern" +
        "\n\n" +
        `Expected to look like: "${expected}"\n` +
        `Received: ${this.utils.printReceived(providedColor)}`;
    } else {
      expected = providedColor.replace(pattern, "0");
      message = () =>
        this.utils.matcherHint(assertionName, providedColor, expected, { isNot: this.isNot }) +
        "\n" +
        "\n\n" +
        `Expected: ${this.isNot ? "not" : ""}${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(providedColor)}`;
    }

    return {
      message,
      pass,
      name: assertionName,
      expected,
      actual: providedColor,
    };
  },
});

export const expect = mergeExpects(expectWithToEqualWithTolerance, expectWithToBeShadeOf, expectWithToBeTransparent);
