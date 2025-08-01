/* eslint react-hooks/rules-of-hooks: 0 */
// The above exception is needed since it fires a false-positive
// for the "use" function coming from the playwright test framework
import { test as baseTest } from "@playwright/test";
import type { Locator, Page } from "playwright-core";

import type { ComponentDef } from "../abstractions/ComponentDefs";
import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";
import {
  type ComponentDriver,
  type ComponentDriverParams,
  AccordionDriver,
  AppFooterDriver,
  AppHeaderDriver,
  AvatarDriver,
  BadgeDriver,
  ButtonDriver,
  CardDriver,
  ContentSeparatorDriver,
  FormDriver,
  FormItemDriver,
  HeadingDriver,
  HStackDriver,
  HtmlTagDriver,
  IconDriver,
  ItemsDriver,
  LinkDriver,
  ListDriver,
  MarkdownDriver,
  NavGroupDriver,
  NavLinkDriver,
  NavPanelDriver,
  NoResultDriver,
  NumberBoxDriver,
  OptionDriver,
  ProgressBarDriver,
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
  ValidationDisplayDriver,
  ValidationSummaryDriver,
  VStackDriver,
  DatePickerDriver, AutoCompleteDriver,
  CodeBlockDriver,
  CheckboxDriver,
  DropdownMenuDriver,
  ExpandableItemDriver,
  FileInputDriver,
  FileUploadDropZoneDriver,
  LabelDriver,
  BackdropDriver,
  SpinnerDriver
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
    // console.error(
    //   `More than one element found with testId: ${testId}! Ignoring all but the first.`,
    // );
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
      const { width, height } = page.viewportSize();
      return {
        testStateDriver: new TestStateDriver(page.getByTestId(testStateViewTestId)),
        clipboard: new Clipboard(page),
        width: width ?? 0,
        height: height ?? 0,
      };
    });
  },

  createDriver: async <T extends new (...args: ComponentDriverParams[]) => any>(
    { page, baseComponentTestId },
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
  createBackdropDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(BackdropDriver, testIdOrLocator);
    });
  },
  createContentSeparatorDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ContentSeparatorDriver, testIdOrLocator);
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
  createValidationSummaryDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ValidationSummaryDriver, testIdOrLocator);
    });
  },
  createValidationDisplayDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ValidationDisplayDriver, testIdOrLocator);
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
  createDatePickerDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(DatePickerDriver, testIdOrLocator);
    });
  },
  createExpandableItemDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ExpandableItemDriver, testIdOrLocator);
    });
  },
  createFileInputDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(FileInputDriver, testIdOrLocator);
    });
  },
  createFileUploadDropZoneDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(FileUploadDropZoneDriver, testIdOrLocator);
    });
  },
  createAutoCompleteDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(AutoCompleteDriver, testIdOrLocator);
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
  createProgressBarDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(ProgressBarDriver, testIdOrLocator);
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
  createNavLinkDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(NavLinkDriver, testIdOrLocator);
    });
  },
  createNavGroupDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(NavGroupDriver, testIdOrLocator);
    });
  },
  createNavPanelDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(NavPanelDriver, testIdOrLocator);
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
  createAppHeaderDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(AppHeaderDriver, testIdOrLocator);
    });
  },
  createAppFooterDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(AppFooterDriver, testIdOrLocator);
    });
  },
  createBadgeDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(BadgeDriver, testIdOrLocator);
    });
  },
  createNoResultDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(NoResultDriver, testIdOrLocator);
    });
  },
  createOptionDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(OptionDriver, testIdOrLocator);
    });
  },
  createHtmlTagDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(HtmlTagDriver, testIdOrLocator);
    });
  },
  createCodeBlockDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(CodeBlockDriver, testIdOrLocator);
    });
  },
  createCheckboxDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(CheckboxDriver, testIdOrLocator);
    });
  },
  createLabelDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(LabelDriver, testIdOrLocator);
    });
  },
  createSpinnerDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(SpinnerDriver, testIdOrLocator);
    });
  },
  createDropdownMenuDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(DropdownMenuDriver, testIdOrLocator);
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
  ) => Promise<{
    testStateDriver: TestStateDriver;
    clipboard: Clipboard;
    width: number;
    height: number;
  }>;
  createDriver: <T extends new (...args: ComponentDriverParams[]) => any>(
    driverClass: T,
    testIdOrLocator?: string | Locator,
  ) => Promise<InstanceType<T>>;
  createButtonDriver: ComponentDriverMethod<ButtonDriver>;
  createBackdropDriver: ComponentDriverMethod<BackdropDriver>;
  createContentSeparatorDriver: ComponentDriverMethod<ContentSeparatorDriver>;
  createAvatarDriver: ComponentDriverMethod<AvatarDriver>;
  createFormDriver: ComponentDriverMethod<FormDriver>;
  createFormItemDriver: ComponentDriverMethod<FormItemDriver>;
  createValidationSummaryDriver: ComponentDriverMethod<ValidationSummaryDriver>;
  createValidationDisplayDriver: ComponentDriverMethod<ValidationDisplayDriver>;
  createSplitterDriver: ComponentDriverMethod<SplitterDriver>;
  createMarkdownDriver: ComponentDriverMethod<MarkdownDriver>;
  createItemsDriver: ComponentDriverMethod<ItemsDriver>;
  createSliderDriver: ComponentDriverMethod<SliderDriver>;
  createRangeDriver: ComponentDriverMethod<RangeDriver>;
  createDatePickerDriver: ComponentDriverMethod<DatePickerDriver>;
  createExpandableItemDriver: ComponentDriverMethod<ExpandableItemDriver>;
  createFileInputDriver: ComponentDriverMethod<FileInputDriver>;
  createFileUploadDropZoneDriver: ComponentDriverMethod<FileUploadDropZoneDriver>;
  createAutoCompleteDriver: ComponentDriverMethod<AutoCompleteDriver>;
  createSelectDriver: ComponentDriverMethod<SelectDriver>;
  createRadioGroupDriver: ComponentDriverMethod<RadioGroupDriver>;
  createNumberBoxDriver: ComponentDriverMethod<NumberBoxDriver>;
  createTextBoxDriver: ComponentDriverMethod<TextBoxDriver>;
  createTextAreaDriver: ComponentDriverMethod<TextAreaDriver>;
  createProgressBarDriver: ComponentDriverMethod<ProgressBarDriver>;
  createListDriver: ComponentDriverMethod<ListDriver>;
  createTextDriver: ComponentDriverMethod<TextDriver>;
  createHeadingDriver: ComponentDriverMethod<HeadingDriver>;
  createIconDriver: ComponentDriverMethod<IconDriver>;
  createStackDriver: ComponentDriverMethod<StackDriver>;
  createHStackDriver: ComponentDriverMethod<HStackDriver>;
  createVStackDriver: ComponentDriverMethod<VStackDriver>;
  createLinkDriver: ComponentDriverMethod<LinkDriver>;
  createNavLinkDriver: ComponentDriverMethod<NavLinkDriver>;
  createNavGroupDriver: ComponentDriverMethod<NavGroupDriver>;
  createNavPanelDriver: ComponentDriverMethod<NavPanelDriver>;
  createCardDriver: ComponentDriverMethod<CardDriver>;
  createAccordionDriver: ComponentDriverMethod<AccordionDriver>;
  createAppHeaderDriver: ComponentDriverMethod<AppHeaderDriver>;
  createAppFooterDriver: ComponentDriverMethod<AppFooterDriver>;
  createBadgeDriver: ComponentDriverMethod<BadgeDriver>;
  createNoResultDriver: ComponentDriverMethod<NoResultDriver>;
  createOptionDriver: ComponentDriverMethod<OptionDriver>;
  createHtmlTagDriver: ComponentDriverMethod<HtmlTagDriver>;
  createCodeBlockDriver: ComponentDriverMethod<CodeBlockDriver>;
  createCheckboxDriver: ComponentDriverMethod<CheckboxDriver>;
  createLabelDriver: ComponentDriverMethod<LabelDriver>;
  createSpinnerDriver: ComponentDriverMethod<SpinnerDriver>;
  createDropdownMenuDriver: ComponentDriverMethod<DropdownMenuDriver>;
};
