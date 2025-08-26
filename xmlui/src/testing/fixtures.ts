/* eslint react-hooks/rules-of-hooks: 0 */
// The above exception is needed since it fires a false-positive
// for the "use" function coming from the playwright test framework
import { test as baseTest } from "@playwright/test";
import type { Locator, Page } from "playwright-core";

import type { ComponentDef, CompoundComponentDef } from "../abstractions/ComponentDefs";
import { xmlUiMarkupToComponent } from "../components-core/xmlui-parser";
import type { StandaloneAppDescription } from "../components-core/abstractions/standalone";
import {
  type ComponentDriverParams,
  type ComponentDriver,
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
  DatePickerDriver,
  AutoCompleteDriver,
  CodeBlockDriver,
  CheckboxDriver,
  DropdownMenuDriver,
  ExpandableItemDriver,
  FileInputDriver,
  FileUploadDropZoneDriver,
  LabelDriver,
  BackdropDriver,
  SpinnerDriver,
} from "./ComponentDrivers";
import { parseComponentIfNecessary } from "./component-test-helpers";
import { TimeInputDriver } from "./drivers/TimeInputDriver";

export { expect } from "./assertions";

const isCI = process?.env?.CI === "true";

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
  private content: string = "";

  constructor(page: Page) {
    this.page = page;
  }

  init() {
    return () => {
      window.navigator.clipboard.readText = async () => this.content;
      window.navigator.clipboard.read = async () => {
        throw new Error("Clipboard read not implemented in mocked environment");
      };
      window.navigator.clipboard.writeText = async (text) => { this.content = text };
      window.navigator.clipboard.write = async (items) => {
        throw new Error("Clipboard write not implemented in mocked environment");
      };
    }
  }

  /**
   * Reads the text from the clipboard.
   *
   * @returns The text from the clipboard.
   */
  async read() {
    const handle = await this.page.evaluateHandle(() => navigator.clipboard.readText());
    return handle.jsonValue();
  }

  /**
   * Writes the text to the clipboard.
   *
   * @param text - The text to write to the clipboard.
   */
  async write(text: string) {
    await this.page.evaluate((text) => navigator.clipboard.writeText(text), text);
  }

  async clear() {
    await this.page.evaluate(() => navigator.clipboard.writeText(""));
  }

  /**
   * Copies the text from the given locator to the clipboard.
   *
   * Steps:
   * 1. Focus the locator.
   * 2. Select the text.
   * 3. Copy the text to the clipboard. (ControlOrMeta+C)
   *
   * @param locator - a Locator to focus and copy from
   */
  async copy(locator: Locator) {
    await locator.focus();
    await locator.selectText();
    await this.page.keyboard.press("ControlOrMeta+C");
  }

  /**
   * Pastes the text from the clipboard to the given locator.
   *
   * Steps:
   * 1. Focus the locator.
   * 2. Paste the text from the clipboard. (ControlOrMeta+V)
   *
   * @param locator - a Locator to focus and paste to
   */
  async paste(locator: Locator) {
    await locator.focus();
    await this.page.keyboard.press("ControlOrMeta+V");
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

type TestBedDescription = Omit<Partial<StandaloneAppDescription>, "entryPoint" | "components"> & {
  testThemeVars?: Record<string, string>;
  components?: string[];
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

      const components = description?.components?.map((c) => {
        const { component, errors, erroneousCompoundComponentName } = parseComponentIfNecessary(c);
        if (erroneousCompoundComponentName) {
          throw new Error(
            `Error parsing component "${erroneousCompoundComponentName}": ${errors.join("\n")}`,
          );
        }
        return component as CompoundComponentDef;
      });

      if (source !== "" && entryPoint.children) {
        const sourceBaseComponent = entryPoint.children[0];
        const isCompoundComponentRoot =
          components &&
          components?.length > 0 &&
          components?.map((c) => c.name).includes(sourceBaseComponent.type);

        if (!isCompoundComponentRoot && !sourceBaseComponent.testId) {
          sourceBaseComponent.testId = baseComponentTestId;
        } else if (
          isCompoundComponentRoot &&
          sourceBaseComponent.children?.length === 1 &&
          !sourceBaseComponent.children?.[0].testId
        ) {
          // If the source is a compound component, we need to set the testId on the first & only child
          sourceBaseComponent.children[0].testId = baseComponentTestId;
        }
      }
      const themedDescription = mapThemeRelatedVars(description);

      const _appDescription: StandaloneAppDescription = {
        name: "test bed app",
        ...themedDescription,
        components,
        entryPoint,
      };

      const clipboard = new Clipboard(page);
      // --- Mock the clipboard API if in CI
      if (isCI) {
        await page.addInitScript(clipboard.init);
      }

      await page.addInitScript((app) => {
        // @ts-ignore
        window.TEST_ENV = app;
      }, _appDescription);
      const { width, height } = page.viewportSize();
      await page.goto("/");

      return {
        testStateDriver: new TestStateDriver(page.getByTestId(testStateViewTestId)),
        clipboard,
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
  createTimeInputDriver: async ({ createDriver }, use) => {
    await use(async (testIdOrLocator?: string | Locator) => {
      return createDriver(TimeInputDriver, testIdOrLocator);
    });
  }
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
  createTimeInputDriver: ComponentDriverMethod<TimeInputDriver>;
};
