import { expect as baseExpect, test as baseTest } from "@playwright/test";
import type { Page } from "playwright-core";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";
import {
  type ComponentDriver,
  type ComponentDriverParams,
  AvatarDriver,
  ButtonDriver,
  FormDriver,
  FormItemDriver,
  HeadingDriver,
  HStackDriver,
  IconDriver,
  ItemsDriver,
  ListDriver,
  MarkdownDriver,
  NumberBoxDriver,
  RadioGroupDriver,
  RangeDriver,
  SelectDriver,
  SliderDriver,
  SplitterDriver,
  StackDriver,
  TestStateDriver,
  TextAreaDriver,
  TextBoxDriver,
  TextDriver,
  VStackDriver,
} from "./ComponentDrivers";
import { initComponent } from "./component-test-helpers";
import { LintSeverity } from "../parsers/xmlui-parser/lint";
import { collectedComponentMetadata } from "../components/collectedComponentMetadata";

// -----------------------------------------------------------------
// --- Utility

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
});

class Clipboard {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getContent() {
    const handle = await this.page.evaluateHandle(() => navigator.clipboard.readText());
    return handle.jsonValue();
  }

  async write(text: string) {
    await this.page.evaluate((text) => navigator.clipboard.writeText(text), text);
  }

  async clear() {
    await this.page.evaluate(() => navigator.clipboard.writeText(""));
  }

  /**
   * Performs a focus on the given driver element, then copies the contents to the clipboard
   * @param driver
   */
  async copyFrom(driver: ComponentDriver) {
    await driver.focus();
    await driver.dblclick()
    await this.page.keyboard.press('Control+c');
  }

  async pasteTo(driver: ComponentDriver) {
    await driver.focus();
    await this.page.keyboard.press('Control+v');
  }
}

// -----------------------------------------------------------------
// --- TestBed and Driver Fixtures

export const test = baseTest.extend<TestDriverExtenderProps>({
  // NOTE: the base Playwright test can be extended with fixture methods
  // as well as any other language constructs we deem useful
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
        // `, 0, undefined, {lintSeverity: LintSeverity.Error, collectedMetadata: collectedComponentMetadata});

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
        return {
          testStateDriver: new TestStateDriver(page.getByTestId(testStateViewTestId)),
          clipboard: new Clipboard(page),
        };
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
      });
    });
  },

  createButtonDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(ButtonDriver, testId);
    });
  },
  createAvatarDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(AvatarDriver, testId);
    });
  },
  createFormDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(FormDriver, testId);
    });
  },
  createFormItemDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(FormItemDriver, testId);
    });
  },
  createSplitterDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(SplitterDriver, testId);
    });
  },
  createMarkdownDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(MarkdownDriver, testId);
    });
  },
  createItemsDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(ItemsDriver, testId);
    });
  },
  createSliderDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(SliderDriver, testId);
    });
  },
  createRangeDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(RangeDriver, testId);
    });
  },
  createSelectDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(SelectDriver, testId);
    });
  },
  createRadioGroupDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(RadioGroupDriver, testId);
    });
  },
  createNumberBoxDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(NumberBoxDriver, testId);
    });
  },
  createTextBoxDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(TextBoxDriver, testId);
    });
  },
  createTextAreaDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(TextAreaDriver, testId);
    });
  },
  createListDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(ListDriver, testId);
    });
  },
  createTextDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(TextDriver, testId);
    });
  },
  createHeadingDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(HeadingDriver, testId);
    });
  },
  createIconDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(IconDriver, testId);
    });
  },
  createStackDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(StackDriver, testId);
    });
  },
  createHStackDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(HStackDriver, testId);
    });
  },
  createVStackDriver: async ({ createDriver }, use) => {
    await use(async (testId?: string) => {
      return createDriver(VStackDriver, testId);
    });
  },
});

// --- Types

type ComponentDriverMethod<T extends ComponentDriver> = (testId?: string) => Promise<T>;

type TestDriverExtenderProps = {
  testStateViewTestId: string;
  baseComponentTestId: string;
  initTestBed: (
    source: string,
    description?: Omit<Partial<StandaloneAppDescription>, "entryPoint">,
  ) => Promise<{ testStateDriver: TestStateDriver, clipboard: Clipboard }>;
  createDriver: <T extends new (...args: ComponentDriverParams[]) => any>(
    driverClass: T,
    testId?: string,
  ) => Promise<InstanceType<T>>;
  createButtonDriver: ComponentDriverMethod<ButtonDriver>;
  createAvatarDriver: ComponentDriverMethod<AvatarDriver>;
  createFormDriver: ComponentDriverMethod<FormDriver>;
  createFormItemDriver: ComponentDriverMethod<FormItemDriver>;
  createSplitterDriver: ComponentDriverMethod<SplitterDriver>;
  createMarkdownDriver: ComponentDriverMethod<MarkdownDriver>;
  createItemsDriver: ComponentDriverMethod<ItemsDriver>;
  createSliderDriver: ComponentDriverMethod<SliderDriver>;
  createRangeDriver: ComponentDriverMethod<RangeDriver>;
  createSelectDriver: ComponentDriverMethod<SelectDriver>;
  createRadioGroupDriver: ComponentDriverMethod<RadioGroupDriver>;
  createNumberBoxDriver: ComponentDriverMethod<NumberBoxDriver>;
  createTextBoxDriver: ComponentDriverMethod<TextBoxDriver>;
  createTextAreaDriver: ComponentDriverMethod<TextAreaDriver>;
  createListDriver: ComponentDriverMethod<ListDriver>;
  createTextDriver: ComponentDriverMethod<TextDriver>;
  createHeadingDriver: ComponentDriverMethod<HeadingDriver>;
  createIconDriver: ComponentDriverMethod<IconDriver>;
  createStackDriver: ComponentDriverMethod<StackDriver>;
  createHStackDriver: ComponentDriverMethod<HStackDriver>;
  createVStackDriver: ComponentDriverMethod<VStackDriver>;
};
