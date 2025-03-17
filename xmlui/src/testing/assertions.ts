import { expect as baseExpect } from "@playwright/test";
import type { Locator } from "playwright-core";
import {
  BorderSide,
  BorderSideValues,
  CSSBorder,
  isBorderSide,
  numericCSSToString,
  parseAsCssBorder,
} from "./component-test-helpers";

// --- Extending Expect

export const expect = baseExpect.extend({
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

    if (provided >= expected - (tolerance || 0) && provided <= expected + (tolerance || 0)) {
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

  /**
   * Asserts whether a component has the correct CSS `border` shorthand set:
   * `color`, `width`, `style`.
   * 
   * Border options are the following: **"all", "top", "right", "bottom", "left"** or
   * set multiple sides at once with an array, e.g. **["top", "bottom"]**
   *
   * Default: **"all"**
   *
   * ---
   * **Usage**
   *
   * ```js
   * await initTestBed(`<Button label="hello" />`, {
   *    themeVars: { "borderLeft-Button": "1px solid black" },
   * });
   * const driver = await createButtonDriver();
   * await expect(driver.component).toHaveBorder("1px solid black", "left");
   * ```
   *
   * @param expected Expected string label
   */
  async toHaveBorder(
    locator: Locator,
    expected: string,
    border: "all" | BorderSide | BorderSide[] = "all",
    options?: { timeout?: number },
  ) {
    const assertionName = "toHaveBorder";

    let expectedBorder: CSSBorder;
    try {
      expectedBorder = parseAsCssBorder(expected);
      if (Object.values(expectedBorder).length === 0) {
        throw new Error("Empty style!");
      }
    } catch (e) {
      return {
        message: () =>
          "In " +
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          ":\n" +
          (e instanceof Error ? e.message : String(e)) +
          "\n\n" +
          `Expected: Correct CSS border style to expect (e.g. "1px solid black")\n` +
          `Received: ${this.utils.printReceived(expected)}`,
        pass: false,
        name: assertionName,
        expected,
        actual: undefined,
      };
    }

    let _border: BorderSide[] = [];
    if (typeof border === "string") {
      if (border === "all") {
        _border = ["top", "bottom", "left", "right"];
      } else {
        _border = [border];
      }
    } else {
      _border = Array.from(new Set(border)).filter(isBorderSide);
    }

    let pass = true;
    let matcherResult: any;
    try {
      for (let b of _border) {
        if (expectedBorder?.color) {
          await baseExpect(locator).toHaveCSS(
            `border-${b}-color`,
            `rgb(${expectedBorder.color.rgb().join(", ")})`,
            options,
          );
        }
        if (expectedBorder?.width) {
          await baseExpect(locator).toHaveCSS(
            `border-${b}-width`,
            numericCSSToString(expectedBorder.width),
            options,
          );
        }
        if (expectedBorder?.style) {
          await baseExpect(locator).toHaveCSS(`border-${b}-style`, expectedBorder.style, options);
        }
      }
    } catch (e: any) {
      matcherResult = e.matcherResult;
      pass = false;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: not ${this.utils.printExpected(expected)}\n` +
          (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : "")
      : () =>
          this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          (matcherResult ? `Received: ${this.utils.printReceived(matcherResult.actual)}` : "");

    return {
      message,
      pass,
      name: assertionName,
      expected,
      actual: matcherResult?.actual,
    };
  },
});
