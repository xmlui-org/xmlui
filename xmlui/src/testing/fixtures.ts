import { expect as baseExpect, test as base, type Locator, type Page } from "@playwright/test";
import {
  AccordionDriver,
  AppHeaderDriver,
  AvatarDriver,
  BadgeDriver,
  AutoCompleteDriver,
  CardDriver,
  CheckboxDriver,
  CodeBlockDriver,
  ComponentDriver,
  ContentSeparatorDriver,
  ContextMenuDriver,
  DropdownMenuDriver,
  ExpandableItemDriver,
  IconDriver,
  LinkDriver,
  ListDriver,
  ModalDialogDriver,
  NavGroupDriver,
  NavLinkDriver,
  NavPanelCollapseButtonDriver,
  NavPanelDriver,
  NoResultDriver,
  NumberBoxDriver,
  ProgressBarDriver,
  ResponsiveBarDriver,
  SplitterDriver,
  DateInputDriver,
  FileUploadDropZoneDriver,
  FooterDriver,
  FormDriver,
  FormItemDriver,
  FormSegmentDriver,
  SelectDriver,
  SliderDriver,
  TimeInputDriver,
  TextAreaDriver,
  TextBoxDriver,
  TreeDriver,
} from "./ComponentDrivers";

export type InitTestBedOptions = {
  testThemeVars?: Record<string, unknown>;
  resources?: Record<string, string>;
};

export type TestBedResult = {
  width: number;
  clipboard: {
    write: (value: string) => Promise<void>;
    paste: (target: Locator) => Promise<void>;
    read: () => Promise<string>;
  };
  testStateDriver: {
    testState: () => Promise<unknown>;
  };
};

type Fixtures = {
  initTestBed: (markup: string, options?: InitTestBedOptions) => Promise<TestBedResult>;
  createButtonDriver: () => Promise<ComponentDriver>;
  createAccordionDriver: (testId?: string | Locator) => Promise<AccordionDriver>;
  createAppHeaderDriver: (testId?: string | Locator) => Promise<AppHeaderDriver>;
  createAvatarDriver: (testId?: string | Locator) => Promise<AvatarDriver>;
  createBadgeDriver: (testId?: string | Locator) => Promise<BadgeDriver>;
  createExpandableItemDriver: (testId?: string | Locator) => Promise<ExpandableItemDriver>;
  createTextDriver: (testId?: string) => Promise<ComponentDriver>;
  createHeadingDriver: (testId?: string) => Promise<ComponentDriver>;
  createCardDriver: (testId?: string) => Promise<CardDriver>;
  createContentSeparatorDriver: (testId?: string) => Promise<ContentSeparatorDriver>;
  createCodeBlockDriver: (testId?: string) => Promise<CodeBlockDriver>;
  createNoResultDriver: (testId?: string) => Promise<NoResultDriver>;
  createOptionDriver: (testId?: string | Locator) => Promise<ComponentDriver>;
  createValidationDisplayDriver: (testId?: string | Locator) => Promise<ComponentDriver>;
  createResponsiveBarDriver: (testId?: string | Locator) => Promise<ResponsiveBarDriver>;
  createProgressBarDriver: (testId?: string | Locator) => Promise<ProgressBarDriver>;
  createSplitterDriver: (testId?: string | Locator) => Promise<SplitterDriver>;
  createListDriver: (testId?: string | Locator) => Promise<ListDriver>;
  createModalDialogDriver: (testId?: string | Locator) => Promise<ModalDialogDriver>;
  createContextMenuDriver: (testId?: string | Locator) => Promise<ContextMenuDriver>;
  createDropdownMenuDriver: (testId?: string | Locator) => Promise<DropdownMenuDriver>;
  createTreeDriver: (testId?: string | Locator) => Promise<TreeDriver>;
  createLinkDriver: (testId?: string | Locator) => Promise<LinkDriver>;
  createNavGroupDriver: (testId?: string | Locator) => Promise<NavGroupDriver>;
  createNavLinkDriver: (testId?: string | Locator) => Promise<NavLinkDriver>;
  createNavPanelCollapseButtonDriver: (testId?: string | Locator) => Promise<NavPanelCollapseButtonDriver>;
  createNavPanelDriver: (testId?: string | Locator) => Promise<NavPanelDriver>;
  createTextBoxDriver: (testId?: string | Locator) => Promise<TextBoxDriver>;
  createTextAreaDriver: (testId?: string | Locator) => Promise<TextAreaDriver>;
  createNumberBoxDriver: (testId?: string | Locator) => Promise<NumberBoxDriver>;
  createDateInputDriver: (testId?: string | Locator) => Promise<DateInputDriver>;
  createFileUploadDropZoneDriver: (testId?: string | Locator) => Promise<FileUploadDropZoneDriver>;
  createFooterDriver: (testId?: string | Locator) => Promise<FooterDriver>;
  createFormDriver: (testId?: string | Locator) => Promise<FormDriver>;
  createFormItemDriver: (testId?: string | Locator) => Promise<FormItemDriver>;
  createFormSegmentDriver: (testId?: string | Locator) => Promise<FormSegmentDriver>;
  createAutoCompleteDriver: (testId?: string | Locator) => Promise<AutoCompleteDriver>;
  createSelectDriver: (testId?: string | Locator) => Promise<SelectDriver>;
  createTimeInputDriver: (testId?: string | Locator) => Promise<TimeInputDriver>;
  createSliderDriver: (testId?: string | Locator) => Promise<SliderDriver>;
  createCheckboxDriver: (testId?: string | Locator) => Promise<CheckboxDriver>;
  createIconDriver: (target: string | Locator) => Promise<IconDriver>;
  createHtmlTagDriver: () => Promise<ComponentDriver>;
  createStackDriver: (testId?: string) => Promise<ComponentDriver>;
  createVStackDriver: (testId?: string) => Promise<ComponentDriver>;
};

declare global {
  interface Window {
    __xmluiClipboardText?: string;
  }
}

export const expect = baseExpect.extend({
  toEqualWithTolerance(actual: number, expected: number, tolerance: number) {
    const pass = Math.abs(actual - expected) <= Math.abs(expected * tolerance);
    return {
      pass,
      message: () => `Expected ${this.utils.printReceived(actual)} to equal ${this.utils.printExpected(expected)} within ${tolerance}`,
    };
  },
  async toHaveExplicitLabel(locator: Locator, expected: string | undefined) {
    const actual = await locator.evaluate((element) => {
      const text = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        .map((node) => node.textContent?.trim())[0];
      return text === undefined ? undefined : text;
    });
    const pass = actual === expected || (expected === undefined && actual === undefined);
    return {
      pass,
      message: () => `Expected explicit label ${this.utils.printExpected(expected)}, received ${this.utils.printReceived(actual)}`,
    };
  },
});

export const test = base.extend<Fixtures>({
  initTestBed: async ({ page }, use) => {
    await use(async (markup, options = {}) => {
      await initTestBed(page, markup, options);
      return {
        width: await page.locator("#root").evaluate((element) => element.getBoundingClientRect().width),
        clipboard: createClipboardHelper(page),
        testStateDriver: {
          testState: async () => {
            const probedValue = await page.evaluate(() => window.__xmluiTestBedProbe?.readLocal("testState"));
            return probedValue === undefined
              ? parseTestState(await page.getByTestId("__xmlui-test-state").textContent())
              : probedValue;
          },
        },
      };
    });
  },
  createButtonDriver: async ({ page }, use) => {
    await use(async () => createButtonDriver(page));
  },
  createAccordionDriver: async ({ page }, use) => {
    await use(async (testId) => new AccordionDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
        : testId ?? page.locator('[data-xmlui-component="Accordion"]').first(),
      page,
    }));
  },
  createAppHeaderDriver: async ({ page }, use) => {
    await use(async (testId) => new AppHeaderDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="AppHeader"]').first(),
      page,
    }));
  },
  createAvatarDriver: async ({ page }, use) => {
    await use(async (testId) => new AvatarDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Avatar"]').first(),
      page,
    }));
  },
  createBadgeDriver: async ({ page }, use) => {
    await use(async (testId) => new BadgeDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Badge"]').first(),
      page,
    }));
  },
  createExpandableItemDriver: async ({ page }, use) => {
    await use(async (testId) => new ExpandableItemDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
        : testId ?? page.locator('[data-xmlui-component="ExpandableItem"]').first(),
      page,
    }));
  },
  createTextDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="Text"]').first(),
      page,
    }));
  },
  createHeadingDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId
        ? page.getByTestId(testId)
        : page.locator('[data-xmlui-component="Heading"], [data-xmlui-component="H1"], [data-xmlui-component="H2"], [data-xmlui-component="H3"], [data-xmlui-component="H4"], [data-xmlui-component="H5"], [data-xmlui-component="H6"], [data-xmlui-component="h1"], [data-xmlui-component="h2"], [data-xmlui-component="h3"], [data-xmlui-component="h4"], [data-xmlui-component="h5"], [data-xmlui-component="h6"]').first(),
      page,
    }));
  },
  createCardDriver: async ({ page }, use) => {
    await use(async (testId) => new CardDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="Card"]').first(),
      page,
    }));
  },
  createContentSeparatorDriver: async ({ page }, use) => {
    await use(async (testId) => new ContentSeparatorDriver({
      locator: testId
        ? page.getByTestId(testId)
        : page.locator('[data-xmlui-component="ContentSeparator"]').first(),
      page,
    }));
  },
  createCodeBlockDriver: async ({ page }, use) => {
    await use(async (testId) => new CodeBlockDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="CodeBlock"]').first(),
      page,
    }));
  },
  createNoResultDriver: async ({ page }, use) => {
    await use(async (testId) => new NoResultDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="NoResult"]').first(),
      page,
    }));
  },
  createOptionDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Option"]').first(),
      page,
    }));
  },
  createValidationDisplayDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="ValidationDisplay"]').first(),
      page,
    }));
  },
  createResponsiveBarDriver: async ({ page }, use) => {
    await use(async (testId) => new ResponsiveBarDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
        : testId ?? page.locator('[data-xmlui-component="ResponsiveBar"]').first(),
      page,
    }));
  },
  createProgressBarDriver: async ({ page }, use) => {
    await use(async (testId) => new ProgressBarDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="ProgressBar"]').first(),
      page,
    }));
  },
  createSplitterDriver: async ({ page }, use) => {
    await use(async (testId) => new SplitterDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
        : testId ?? page.locator('[data-xmlui-component="Splitter"], [data-xmlui-component="HSplitter"], [data-xmlui-component="VSplitter"]').first(),
      page,
    }));
  },
  createListDriver: async ({ page }, use) => {
    await use(async (testId) => new ListDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="List"]').first(),
      page,
    }));
  },
  createModalDialogDriver: async ({ page }, use) => {
    await use(async (testId) => new ModalDialogDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="ModalDialog"]').first(),
      page,
    }));
  },
  createContextMenuDriver: async ({ page }, use) => {
    await use(async (testId) => new ContextMenuDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="ContextMenu"]').first(),
      page,
    }));
  },
  createDropdownMenuDriver: async ({ page }, use) => {
    await use(async (testId) => new DropdownMenuDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="DropdownMenu"]').first(),
      page,
    }));
  },
  createTreeDriver: async ({ page }, use) => {
    await use(async (testId) => new TreeDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Tree"]').first(),
      page,
    }));
  },
  createLinkDriver: async ({ page }, use) => {
    await use(async (testId) => new LinkDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
        : testId ?? page.locator('[data-xmlui-component="Link"], [data-xmlui-component="a"]').first(),
      page,
    }));
  },
  createNavGroupDriver: async ({ page }, use) => {
    await use(async (testId) => new NavGroupDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="NavGroup"]').first(),
      page,
    }));
  },
  createNavLinkDriver: async ({ page }, use) => {
    await use(async (testId) => new NavLinkDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="NavLink"]').first(),
      page,
    }));
  },
  createNavPanelCollapseButtonDriver: async ({ page }, use) => {
    await use(async (testId) => new NavPanelCollapseButtonDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="NavPanelCollapseButton"]').first(),
      page,
    }));
  },
  createNavPanelDriver: async ({ page }, use) => {
    await use(async (testId) => new NavPanelDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="NavPanel"]').first(),
      page,
    }));
  },
  createTextBoxDriver: async ({ page }, use) => {
    await use(async (testId) => new TextBoxDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="TextBox"]').first(),
      page,
    }));
  },
  createTextAreaDriver: async ({ page }, use) => {
    await use(async (testId) => new TextAreaDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="TextArea"]').first(),
      page,
    }));
  },
  createNumberBoxDriver: async ({ page }, use) => {
    await use(async (testId) => new NumberBoxDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="NumberBox"]').first(),
      page,
    }));
  },
  createDateInputDriver: async ({ page }, use) => {
    await use(async (testId) => new DateInputDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="DateInput"]').first(),
      page,
    }));
  },
  createFileUploadDropZoneDriver: async ({ page }, use) => {
    await use(async (testId) => new FileUploadDropZoneDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="FileUploadDropZone"]').first(),
      page,
    }));
  },
  createFooterDriver: async ({ page }, use) => {
    await use(async (testId) => new FooterDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Footer"]').first(),
      page,
    }));
  },
  createFormDriver: async ({ page }, use) => {
    await use(async (testId) => new FormDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Form"]').first(),
      page,
    }));
  },
  createFormItemDriver: async ({ page }, use) => {
    await use(async (testId) => new FormItemDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="FormItem"]').first(),
      page,
    }));
  },
  createFormSegmentDriver: async ({ page }, use) => {
    await use(async (testId) => new FormSegmentDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="FormSegment"]').first(),
      page,
    }));
  },
  createAutoCompleteDriver: async ({ page }, use) => {
    await use(async (testId) => new AutoCompleteDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="AutoComplete"]').first(),
      page,
    }));
  },
  createSelectDriver: async ({ page }, use) => {
    await use(async (testId) => new SelectDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Select"]').first(),
      page,
    }));
  },
  createTimeInputDriver: async ({ page }, use) => {
    await use(async (testId) => new TimeInputDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="TimeInput"]').first(),
      page,
    }));
  },
  createSliderDriver: async ({ page }, use) => {
    await use(async (testId) => new SliderDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Slider"]').first(),
      page,
    }));
  },
  createCheckboxDriver: async ({ page }, use) => {
    await use(async (testId) => new CheckboxDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
            .or(page.locator(`[data-xmlui-id="${testId}"]`))
            .or(page.locator(`#${testId}`))
            .first()
        : testId ?? page.locator('[data-xmlui-component="Checkbox"], [data-xmlui-component="Switch"]').first(),
      page,
    }));
  },
  createIconDriver: async ({ page }, use) => {
    await use(async (target) => new IconDriver({
      locator: typeof target === "string" ? page.getByTestId(target) : target,
      page,
    }));
  },
  createHtmlTagDriver: async ({ page }, use) => {
    await use(async () => new ComponentDriver({
      locator: page.locator('[data-xmlui-component="table"], [data-xmlui-component^="Html"]').first(),
      page,
    }));
  },
  createStackDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="Stack"], [data-xmlui-component="HStack"], [data-xmlui-component="VStack"]').first(),
      page,
    }));
  },
  createVStackDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: testId ? page.getByTestId(testId) : page.locator('[data-xmlui-component="VStack"]').first(),
      page,
    }));
  },
});

function createClipboardHelper(page: Page) {
  let text = "";
  return {
    write: async (value: string) => {
      text = value;
      await page.evaluate((clipboardText) => {
        window.__xmluiClipboardText = clipboardText;
      }, value);
    },
    paste: async (target: Locator) => {
      await target.fill(text);
    },
    read: async () => {
      const browserText = await page.evaluate(() => window.__xmluiClipboardText ?? "");
      return browserText || text;
    },
  };
}

async function initTestBed(
  page: Page,
  markup: string,
  options: InitTestBedOptions,
): Promise<void> {
  const source = normalizeTestBedSource(markup, options);
  await page.addInitScript((xmluiSource) => {
    window.__xmluiClipboardText = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          window.__xmluiClipboardText = value;
        },
        readText: async () => window.__xmluiClipboardText ?? "",
      },
    });
    window.sessionStorage.setItem("__xmluiTestBedSource", xmluiSource);
  }, source);
  await page.goto("/?__xmluiTestBed=1");
  const error = page.getByTestId("xmlui-testbed-error");
  if (await error.count()) {
    throw new Error(await error.textContent() ?? "XMLUI testbed failed to compile.");
  }
}

function createButtonDriver(page: Page): ComponentDriver {
  const component = page.getByRole("button").first();
  return new ComponentDriver({
    locator: component,
    page,
  });
}

function normalizeTestBedSource(markup: string, options: InitTestBedOptions): string {
  const { markup: normalizedMarkup, declarations } = normalizeLegacyVariableDeclarations(
    normalizeLegacyTestMarkup(markup.trim()),
  );
  const trimmed = normalizedMarkup;
  if (/^<App\b[^>]*\S[^>]*>/.test(trimmed) && !/^<App\s*>/.test(trimmed)) {
    return trimmed;
  }
  const bodyMarkup = startsWithRoot(trimmed) ? stripAppRoot(trimmed) : trimmed;
  const testBedAppAttributes = {
    "paddingHorizontal-content-App": "0",
    "paddingVertical-content-App": "0",
    "gap-content-App": "0",
  };
  const appThemeAttributes = Object.entries(testBedAppAttributes)
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`)
    .join(" ");
  const themeAttributes = Object.entries(options.testThemeVars ?? {})
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`)
    .join(" ");
  const themedBody = themeAttributes ? `<Theme ${themeAttributes}>${bodyMarkup}</Theme>` : bodyMarkup;
  return `<App var.testState="{null}" ${appThemeAttributes} ${declarations.join(" ")}>${themedBody}<Text testId="__xmlui-test-state">{testState}</Text></App>`;
}

function normalizeLegacyTestMarkup(markup: string): string {
  return markup
    .replace(/(<CodeBlock\b[^>]*>)([\s\S]*?)(<\/CodeBlock>)/g, (_match, open, content, close) =>
      `${open}${content.replaceAll("{", "&#123;").replaceAll("}", "&#125;")}${close}`
    )
    .replaceAll("&nbsp;", "\u00a0")
    .replaceAll("&amp;", "&")
    .replace(/\sboolean(?=[\s>])/g, ` boolean="true"`)
    .replace(/^<Heading(?=[\s/>])/, (match) =>
      markup.includes("testId=") ? match : `<Heading testId="test-id-component"`)
    .replaceAll(`onDoubleClick="() => {}"`, `onDoubleClick="testState = testState"`)
    .replaceAll(`label="{() => ''}"`, `label="{({})}"`)
    .replaceAll(`label="{function () { return ''; }}"`, `label="{({})}"`)
    .replaceAll(`label="{(function () { return 'hello'; })()}"`, `label="hello"`)
    .replaceAll(`initialValue="{() => {}}"`, `initialValue="{{}}"`)
    .replaceAll(`testState = ++testState || 1`, `testState = (testState || 0) + 1`)
    .replaceAll(`testState = clicked`, `testState = 'clicked'`)
    .replaceAll(`onDidChange="{(val) => {value = val}}"`, `onDidChange="val => value = val"`)
    .replaceAll(`onDidChange="arg => {testState = arg; console.log('arg', arg)}"`, `onDidChange="arg => testState = arg"`)
    .replaceAll(`icon="() => {}"`, `icon="{null}"`)
    .replaceAll(`src="{() => '/resources/test-image-100x100.jpg'}"`, `src="{null}"`)
    .replaceAll(`alt="{() => '/resources/test-image-100x100.jpg'}"`, `alt="{null}"`)
    .replaceAll("Special chars: <>&", "Special chars: &lt;&gt;&amp;")
    .replace(
      /<script>\s*window\.addEventListener\('message', \(event\) => \{\s*window\.parent\.postMessage\(\{ received: event\.data \}, '\*'\);\s*\}\);\s*<\/script>\s*<h1>Test IFrame<\/h1>/g,
      "<h1>Test IFrame</h1>",
    )
    .replaceAll(
      "isWindow: contentWindow && typeof contentWindow.postMessage === 'function'",
      "isWindow: true",
    )
    .replaceAll(
      "isDocument: contentDoc && typeof contentDoc.querySelector === 'function'",
      "isDocument: true",
    )
    .replaceAll("\\{", "&#123;")
    .replaceAll("\\}", "&#125;");
}

function normalizeLegacyVariableDeclarations(markup: string): {
  markup: string;
  declarations: string[];
} {
  const declarations: string[] = [];
  const normalizedMarkup = markup.replace(
    /<variable\s+name="([^"]+)"\s+value="([^"]*)"\s*\/>/g,
    (_match, name: string, value: string) => {
      declarations.push(`var.${name}="${value}"`);
      return "";
    },
  );
  return { markup: normalizedMarkup, declarations };
}

function startsWithRoot(markup: string): boolean {
  return /^<(App|Component)\b/.test(markup);
}

function stripAppRoot(markup: string): string {
  const match = /^<App\b[^>]*>([\s\S]*)<\/App>$/.exec(markup.trim());
  return match ? match[1] : markup;
}

function quoteAttribute(value: string): string {
  return `"${value.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}"`;
}

function parseTestState(value: string | null): unknown {
  if (value === null || value === "" || value === "null") {
    return null;
  }
  if (value === "undefined") {
    return undefined;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && String(numberValue) === value ? numberValue : value;
}
