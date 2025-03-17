import { test as baseTest } from "@playwright/test";
import type { Locator, Page } from "playwright-core";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";
import {
  type ComponentDriver,
  type ComponentDriverParams,
  AccordionDriver,
  AvatarDriver,
  ButtonDriver,
  CardDriver,
  FormDriver,
  FormItemDriver,
  HeadingDriver,
  HStackDriver,
  IconDriver,
  ItemsDriver,
  LinkDriver,
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

export { expect } from "./assertions";

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
    await driver.dblclick();
    await this.page.keyboard.press("Control+c");
  }

  async pasteTo(driver: ComponentDriver) {
    await driver.focus();
    await this.page.keyboard.press("Control+v");
  }
}

function mapThemeRelatedVars(description: TestBedDescription): TestBedDescription {
  const { themes, defaultTheme, testThemeVars, ...rest } = description ?? {};

  if (themes) {
    return { themes, defaultTheme: defaultTheme ?? "xmlui", ...rest };
  }

  const testTheme = {
    id: "test",
    name: "Test",
    extends: "xmlui",
    themeVars: testThemeVars,
  };

  return { themes: [testTheme], defaultTheme: "test", ...rest };
}

// -----------------------------------------------------------------
// --- TestBed and Driver Fixtures

type TestBedDescription = Omit<Partial<StandaloneAppDescription>, "entryPoint"> & {
  testThemeVars?: Record<string, string>;
};

export const test = baseTest.extend<TestDriverExtenderProps>({
  // NOTE: the base Playwright test can be extended with fixture methods
  // as well as any other language constructs we deem useful
  baseComponentTestId: "test-id-component",
  testStateViewTestId: "test-state-view-testid",

  initTestBed: async ({ page, baseComponentTestId, testStateViewTestId }, use) => {
    await use(async (source: string, description?: TestBedDescription) => {
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

      const themedDescription = mapThemeRelatedVars(description);
      await initComponent(page, { ...themedDescription, entryPoint });
      return {
        testStateDriver: new TestStateDriver(page.getByTestId(testStateViewTestId)),
        clipboard: new Clipboard(page),
      };
    });
  },

  createDriver: async <T extends new (...args: ComponentDriverParams[]) => any>(
    { page, baseComponentTestId, testStateViewTestId },
    use,
  ) => {
    await use(async (driverClass: T, testIdOrLocator?: string | Locator) => {
      let locator: Locator = undefined;
      if (testIdOrLocator === undefined || typeof testIdOrLocator === "string") {
        locator = await getOnlyFirstLocator(page, testIdOrLocator ?? baseComponentTestId);
      } else if (typeof testIdOrLocator === "object") {
        locator = testIdOrLocator;
      }

      return new driverClass({
        locator,
        page,
      });
    });
  },

  createButtonDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ButtonDriver, testIdOrLocator);
    });
  },
  createAvatarDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(AvatarDriver, testIdOrLocator);
    });
  },
  createFormDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(FormDriver, testIdOrLocator);
    });
  },
  createFormItemDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(FormItemDriver, testIdOrLocator);
    });
  },
  createSplitterDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(SplitterDriver, testIdOrLocator);
    });
  },
  createMarkdownDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(MarkdownDriver, testIdOrLocator);
    });
  },
  createItemsDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ItemsDriver, testIdOrLocator);
    });
  },
  createSliderDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(SliderDriver, testIdOrLocator);
    });
  },
  createRangeDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(RangeDriver, testIdOrLocator);
    });
  },
  createSelectDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(SelectDriver, testIdOrLocator);
    });
  },
  createRadioGroupDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(RadioGroupDriver, testIdOrLocator);
    });
  },
  createNumberBoxDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(NumberBoxDriver, testIdOrLocator);
    });
  },
  createTextBoxDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(TextBoxDriver, testIdOrLocator);
    });
  },
  createTextAreaDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(TextAreaDriver, testIdOrLocator);
    });
  },
  createListDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ListDriver, testIdOrLocator);
    });
  },
  createTextDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(TextDriver, testIdOrLocator);
    });
  },
  createHeadingDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(HeadingDriver, testIdOrLocator);
    });
  },
  createIconDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(IconDriver, testIdOrLocator);
    });
  },
  createStackDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(StackDriver, testIdOrLocator);
    });
  },
  createHStackDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(HStackDriver, testIdOrLocator);
    });
  },
  createVStackDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(VStackDriver, testIdOrLocator);
    });
  },
  createLinkDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(LinkDriver, testIdOrLocator);
    });
  },
  createCardDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(CardDriver, testIdOrLocator);
    });
  },
  createAccordionDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(AccordionDriver, testIdOrLocator);
    });
  },
});

// --- Types

type ComponentDriverMethod<T extends ComponentDriver> = (
  testIdOrLocator?: string | Locator,
) => Promise<T>;

type TestDriverExtenderProps = {
  testStateViewTestId: string;
  baseComponentTestId: string;
  initTestBed: (
    source: string,
    description?: TestBedDescription,
  ) => Promise<{ testStateDriver: TestStateDriver; clipboard: Clipboard }>;
  createDriver: <T extends new (...args: ComponentDriverParams[]) => any>(
    driverClass: T,
    testIdOrLocator?: string | Locator,
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
  createLinkDriver: ComponentDriverMethod<LinkDriver>;
  createCardDriver: ComponentDriverMethod<CardDriver>;
  createAccordionDriver: ComponentDriverMethod<AccordionDriver>;
};
