import type { Locator } from "@playwright/test";
import type { ComponentDef } from "../../xmlui/src/abstractions/ComponentDefs";
import { expect as baseExpect, mergeExpects, test as baseTest } from "@playwright/test";
import { initApp } from "./component-test-helpers";
import { xmlUiMarkupToComponent } from "../../xmlui/src/components-core/xmlui-parser";

export { test } from "@playwright/test";

async function getElementSize(locator: Locator) {
  const dimensions = await locator.evaluate((element) => [
    element.clientWidth,
    element.clientHeight,
  ]);
  return { width: dimensions[0] ?? 0, height: dimensions[1] ?? 0 } as const;
}

export type ComponentDriverParams = {
  locator: Locator;
  testStateLocator: Locator;
}

export class ComponentDriver {
  protected readonly locator: Locator;
  protected readonly testStateLocator: Locator;

  constructor({ locator, testStateLocator }: ComponentDriverParams) {
    this.locator = locator;
    this.testStateLocator = testStateLocator;
  }

  get component () {
    return this.locator;
  }

  // NOTE: methods must be created using the arrow function notation.
  // Otherwise, the "this" will not be correctly bound to the class instance when destructuring.

  click = async (options?: { timeout?: number }) => {
    await this.locator.click(options);
  }

  focus = async (options?: { timeout?: number }) => {
    await this.locator.focus(options);
  }

  blur = async (options?: { timeout?: number }) => {
    await this.locator.blur(options);
  }
 
  getComponentSize = async () => {
    return getElementSize(this.locator);
  }

  expectTestState(options?: {timeout?: number, intervals?: number[]}) {
    return expect.poll(this.testState, options);
  }

  /** returns an async function that can query the test state */
  get testState () {
    return async () =>{
      const text = await this.testStateLocator.textContent();
      const testState = text === "undefined" ? undefined : JSON.parse(text!);
      return testState;
    }
  }
}


export function createTestWithDriver<T extends new (...args: ComponentDriverParams[]) => any>(
  DriverClass: T
) {
  return baseTest.extend<{
    createDriver: (source: string, resources?: Record<string, string>) => Promise<InstanceType<T>>;
  }>({
    createDriver: async ({page}, use) => {
      await use(async (source: string, resources?: Record<string, string>) => {
        const testStateViewTestId = "test-state-view-testid"
        const prefix = `<Fragment var.testState="{null}">`
        const suffix =`
          <Stack width="0" height="0">
            <Text
              testId="${testStateViewTestId}"
              value="{ testState === undefined ? 'undefined' : JSON.stringify(testState) }"/>
          </Stack>
        </Fragment>`
        const code = prefix + source + suffix
        const { errors, component } = xmlUiMarkupToComponent(code)
        if (errors.length > 0){
          throw { errors: errors };
        }
        if (!component) {
          throw new Error("xmlUiMarkupToComponent returned null for component");
        }
        const componentTestId = "test-id-component";
        (component as ComponentDef).children![0].testId ??= componentTestId;

        await initApp(page, { entryPoint: component, resources });
        return new DriverClass({
          locator: page.getByTestId((component as ComponentDef).children![0].testId!),
          testStateLocator: page.getByTestId(testStateViewTestId)
        });
      });
    }
  });
}

// -----------------------------------------------------------------

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
