import { expect as baseExpect } from "@playwright/test";
import type { Locator } from "playwright-core";
import {
  type BorderSide,
  type CSSBorder,
  type CSSBorderStyle,
  type CSSColor,
  type NumericCSS,
  isBorderSide,
  numericCSSToString,
  parseAsCssBorder,
  parseAsCSSBorderStyle,
  parseAsCSSColor,
  parseAsNumericCss,
} from "./component-test-helpers";

// --- Extending Expect

export const expect = baseExpect.extend({
  /**
   * Asserts whether the Button component has the expected label either through the `label` property
   * or as a text node child.
   *
   * **Usage**
   *
   * ```js
   * await initTestBed(`<Button label="hello" />`);
   * const driver = await createButtonDriver();
   * await expect(driver.component).toHaveLabel("hello"); // <- resolves to true
   * ```
   *
   * @param expected Expected string label
   */
  async toHaveExplicitLabel(locator: Locator, expected: string) {
    const assertionName = "toHaveExplicitLabel";
    let pass = false;

    const label = await locator.evaluate(
      (element) =>
        [...element.childNodes]
          .filter((e) => e.nodeType === Node.TEXT_NODE && e.textContent.trim())
          .map((e) => e.textContent.trim())?.[0],
    );

    if (label === expected) {
      pass = true;
    }

    const message = pass
      ? () =>
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.isNot ? "not" : ""}${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(label)}`
      : () =>
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          "\n\n" +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(label)}`;

    return {
      message,
      pass,
      name: assertionName,
      expected,
      actual: undefined,
    };
  },

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
  
  // ---
  // --- NOTE: Assertations below this line are experimental and are reserved for future test cases (ex. comparison tests)
  // ---

  /**
   * Asserts whether a component has the correct CSS `border-color` styling.
   *
   * @param expected Expected CSS color
   * @param border Border side(s), Default: **"all"**
   *
   * ---
   * **Usage**
   *
   * ```js
   * await initTestBed(`<Button label="hello" />`, {
   *    testThemeVars: { "borderLeftColor-Button": "rgb(0, 0, 0)" },
   * });
   * const driver = await createButtonDriver();
   * await expect(driver.component).toHaveBorderColor("rgb(0, 0, 0)", "left");
   * ```
   */
  async toHaveBorderColor(
    locator: Locator,
    expected: string,
    border: "all" | BorderSide | BorderSide[] = "all",
  ) {
    const assertionName = "toHaveBorder";

    let expectedBorderColor: CSSColor;
    try {
      expectedBorderColor = parseAsCSSColor(expected);
      if (Object.values(expectedBorderColor).length === 0) {
        throw new Error("Empty color!");
      }
    } catch (e) {
      return {
        message: () =>
          "In " +
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          ":\n" +
          (e instanceof Error ? e.message : String(e)) +
          "\n\n" +
          `Expected: Correct CSS border color to expect (e.g. "red", "rgb(0, 0, 0)", "#AA0011")\n` +
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
    const colorStr = `rgb(${expectedBorderColor.rgb().join(", ")})`;
    try {
      for (let b of _border) {
        await baseExpect(locator).toHaveCSS(`border-${b}-color`, colorStr);
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

  /**
   * Asserts whether a component has the correct CSS `border-width` styling.
   *
   * @param expected Expected CSS size
   * @param border Border side(s), Default: **"all"**
   *
   * ---
   * **Usage**
   *
   * ```js
   * await initTestBed(`<Button label="hello" />`, {
   *    testThemeVars: { "borderLeftWidth-Button": "12px" },
   * });
   * const driver = await createButtonDriver();
   * await expect(driver.component).toHaveBorderWidth("12px", "left");
   * ```
   */
  async toHaveBorderWidth(
    locator: Locator,
    expected: string,
    border: "all" | BorderSide | BorderSide[] = "all",
  ) {
    const assertionName = "toHaveBorder";

    let expectedBorderWidth: NumericCSS;
    try {
      expectedBorderWidth = parseAsNumericCss(expected);
      if (Object.values(expectedBorderWidth).length === 0) {
        throw new Error("Empty width!");
      }
    } catch (e) {
      return {
        message: () =>
          "In " +
          this.utils.matcherHint(assertionName, locator, expected, { isNot: this.isNot }) +
          ":\n" +
          (e instanceof Error ? e.message : String(e)) +
          "\n\n" +
          `Expected: Correct CSS border width to expect (e.g. "1px", "2rem")\n` +
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
    const widthStr = numericCSSToString(expectedBorderWidth);
    try {
      for (let b of _border) {
        await baseExpect(locator).toHaveCSS(`border-${b}-width`, widthStr);
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

  /**
   * Asserts whether a component has the correct CSS `border-style` styling.
   *
   * @param expected Expected CSS border style
   * @param border Border side(s), default: **"all"**
   *
   * ---
   * **Usage**
   *
   * ```js
   * await initTestBed(`<Button label="hello" />`, {
   *    testThemeVars: { "borderLeftStyle-Button": "dotted" },
   * });
   * const driver = await createButtonDriver();
   * await expect(driver.component).toHaveBorderStyle("dotted", "left");
   * ```
   */
  async toHaveBorderStyle(
    locator: Locator,
    expected: string,
    border: "all" | BorderSide | BorderSide[] = "all",
  ) {
    const assertionName = "toHaveBorder";

    let expectedBorderStyle: CSSBorderStyle;
    try {
      expectedBorderStyle = parseAsCSSBorderStyle(expected);
      if (Object.values(expectedBorderStyle).length === 0) {
        throw new Error("Empty border style!");
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
        await baseExpect(locator).toHaveCSS(`border-${b}-style`, expectedBorderStyle);
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

  /**
   * Asserts whether a component has the correct CSS `border` shorthand set:
   * `color`, `width`, `style`.
   *
   * @param expected Expected string label
   * @param border Border side(s), Default: **"all"**
   *
   * ---
   * **Usage**
   *
   * ```js
   * await initTestBed(`<Button label="hello" />`, {
   *    testThemeVars: { "borderLeft-Button": "1px solid black" },
   * });
   * const driver = await createButtonDriver();
   * await expect(driver.component).toHaveBorder("1px solid black", "left");
   * ```
   */
  async toHaveBorder(
    locator: Locator,
    expected: string,
    border: "all" | BorderSide | BorderSide[] = "all",
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
      if (expectedBorder?.color) {
        const colorStr = `rgb(${expectedBorder.color.rgb().join(", ")})`;
        await expect(locator).toHaveBorderColor(colorStr, _border);
      }
      if (expectedBorder?.width) {
        await expect(locator).toHaveBorderWidth(numericCSSToString(expectedBorder.width), _border);
      }
      if (expectedBorder?.style) {
        await expect(locator).toHaveBorderStyle(expectedBorder.style, _border);
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
