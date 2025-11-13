import { expect as baseExpect } from "@playwright/test";
import type { Locator } from "playwright-core";

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
});
