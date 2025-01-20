import type { ComponentDef } from "@abstractions/ComponentDefs";
import { expect as baseExpect, test as baseTest } from "@playwright/test";
import { initComponent } from "./component-test-helpers";
import { xmlUiMarkupToComponent } from "@components-core/xmlui-parser";
import type { StandaloneAppDescription } from "@components-core/abstractions/standalone";
import type { Page } from "playwright-core";
import { type ComponentDriver, type ComponentDriverParams, ButtonDriver, TestStateDriver } from "./ComponentDrivers";

export { test } from "@playwright/test";

export function createTestWithDriver<T extends new (...args: ComponentDriverParams[]) => any>(
  DriverClass: T,
) {
  return baseTest.extend<{
    createDriver: (
      source: string,
      description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">,
    ) => Promise<InstanceType<T>>;
  }>({
    createDriver: async ({ page }, use) => {
      await use(
        async (
          source: string,
          description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">,
        ) => {
          const testStateViewTestId = "test-state-view-testid";
          const { errors, component } = xmlUiMarkupToComponent(`
            <Fragment var.testState="{null}">
              ${source}
              <Stack width="0" height="0">
                <Text
                  testId="${testStateViewTestId}"
                  value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
              </Stack>
            </Fragment>
          `);

          if (errors.length > 0) {
            throw { errors };
          }

          const entryPoint = component as ComponentDef;
          const componentTestId = "test-id-component";
          const componentToTest = entryPoint.children![0];
          componentToTest.testId ??= componentTestId;

          await initComponent(page, { ...description, entryPoint });

          return new DriverClass({
            locator: page.getByTestId(componentToTest.testId!),
            testStateLocator: page.getByTestId(testStateViewTestId),
            page: page,
          });
        },
      );
    },
  });
}

type ComponentDriverMethod<T extends ComponentDriver> = (testId?: string) => Promise<T>;

type TestDriverExtenderProps = {
  testStateViewTestId: string;
  baseComponentTestId: string;
  initTestBed: (
    source: string,
    description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">,
  ) => Promise<TestStateDriver>;
  createDriver: <T extends new (...args: ComponentDriverParams[]) => any>(
    driverClass: T,
    testId?: string,
  ) => Promise<InstanceType<T>>;
  createButtonDriver: ComponentDriverMethod<ButtonDriver>;
};

export function createTestWithDrivers() {
  // NOTE: the base Playwright test can be extended with fixture methods as well as any other language constructs we deem useful
  return baseTest.extend<TestDriverExtenderProps>({
    baseComponentTestId: "test-id-component",
    testStateViewTestId: "test-state-view-testid",

    initTestBed: async ({ page, baseComponentTestId, testStateViewTestId }, use) => {
      await use(
        async (
          source: string,
          description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">,
        ) => {
          // --- Initialize XMLUI App
          const { errors, component } = xmlUiMarkupToComponent(`
            <Fragment var.testState="{null}">
              ${source}
              <Stack width="0" height="0">
                <Text
                  testId="${testStateViewTestId}"
                  value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
              </Stack>
            </Fragment>
          `);

          if (errors.length > 0) {
            throw { errors };
          }
          const entryPoint = component as ComponentDef;

          if (source !== "" && entryPoint.children) {
            const sourceBaseComponent = entryPoint.children[0];
            if (!sourceBaseComponent.testId) {
              sourceBaseComponent.testId = baseComponentTestId;
            }
          }
          await initComponent(page, { ...description, entryPoint });
          return new TestStateDriver(page.getByTestId(testStateViewTestId));
        },
      );
    },

    createDriver: async <T extends new (...args: ComponentDriverParams[]) => any>(
      { page, baseComponentTestId, testStateViewTestId },
      use,
    ) => {
      await use(async (driverClass: T, testId?: string) => {
        const locator = await getOnlyFirstLocator(page, testId ?? baseComponentTestId);
        return new driverClass({
          locator,
          page,
          
          testStateLocator: page.getByTestId(testStateViewTestId),
        });
      });
    },

    createButtonDriver: async ({ createDriver }, use) => {
      await use(async (testId?: string) => {
        return createDriver(ButtonDriver, testId);
      });
    },
  });
}

/**
 * Writes an error in the console to indicate if multiple elements have the same testId
 */
async function getOnlyFirstLocator(page: Page, testId: string) {
  const locators = page.getByTestId(testId);
  if ((await locators.count()) > 1) {
    console.error(
      `More than one element found with testId: ${testId}! Ignoring all but the first.`,
    );
    return locators.first();
  }
  return locators;
}

// -----------------------------------------------------------------

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
});
