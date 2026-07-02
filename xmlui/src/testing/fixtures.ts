import {
  devices,
  expect as baseExpect,
  test as base,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";
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
  components?: string[];
  extensionIds?: string | string[];
  mainXs?: string;
  resources?: Record<string, string>;
  apiInterceptor?: {
    initialize?: string;
    operations?: Record<string, {
      url: string;
      method?: string;
      handler?: string;
      status?: number;
    }>;
  };
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
  createButtonDriver: (testId?: string | Locator) => Promise<ComponentDriver>;
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
  createMarkdownDriver: (testId?: string | Locator) => Promise<ComponentDriver>;
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

type WorkerFixtures = {
  _sharedContext: BrowserContext;
  _sharedPage: Page;
};

declare global {
  interface Window {
    __xmluiClipboardText?: string;
    __xmluiTestBedProbe?: {
      hasLocal(name: string): boolean;
      readLocal(name: string): unknown;
      readGlobal(name: string): unknown;
    };
    __xmluiTestBedReady?: boolean;
    __xmluiTestBedReinit?: (source: string) => Promise<void>;
  }
}

export const expect = baseExpect.extend({
  toEqualWithTolerance(actual: number, expected: number, tolerance = 0.001) {
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

export const test = base.extend<Fixtures, WorkerFixtures>({
  _sharedContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        ...devices["Desktop Chrome"],
        baseURL: "http://127.0.0.1:5173/",
        permissions: ["clipboard-read", "clipboard-write"],
      });
      await use(context);
      await context.close();
    },
    { scope: "worker" },
  ],
  _sharedPage: [
    async ({ _sharedContext }, use) => {
      const page = await _sharedContext.newPage();
      await use(page);
    },
    { scope: "worker" },
  ],
  page: async ({ _sharedPage, viewport }, use) => {
    if (viewport) {
      await _sharedPage.setViewportSize(viewport);
    }

    const initScriptQueue: Array<{ fn: Function; arg?: unknown }> = [];
    const originalAddInitScript = (_sharedPage.addInitScript as Function).bind(_sharedPage);
    (_sharedPage as any).addInitScript = async (fn: any, arg?: any) => {
      if (typeof fn === "function") {
        initScriptQueue.push({ fn, arg });
      }
      return originalAddInitScript(fn, arg);
    };
    (_sharedPage as any).__xmluiInitScriptQueue = initScriptQueue;

    await use(_sharedPage);

    (_sharedPage as any).addInitScript = originalAddInitScript;
    (_sharedPage as any).__xmluiInitScriptQueue = undefined;
    try {
      await _sharedPage.unrouteAll({ behavior: "ignoreErrors" });
      await _sharedPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.documentElement.style.fontSize = "";
        window.scrollTo(0, 0);
        if ((window as any).__originalMatchMedia) {
          window.matchMedia = (window as any).__originalMatchMedia;
          delete (window as any).__originalMatchMedia;
        }
      });
      await moveMouseAwayFromOrigin(_sharedPage);
    } catch {
      // The shared page can already be gone after a hard test failure.
    }
  },
  initTestBed: async ({ page }, use) => {
    await use(async (markup, options = {}) => {
      await initTestBed(page, markup, options);
      return {
        width: await page.locator("#root").evaluate((element) => element.getBoundingClientRect().width),
        clipboard: createClipboardHelper(page),
        testStateDriver: {
          testState: async () => {
            const probed = await page.evaluate(() => {
              const probe = window.__xmluiTestBedProbe;
              return {
                hasLocal: probe?.hasLocal?.("testState") ?? false,
                value: probe?.readLocal("testState"),
              };
            });
            if (probed.hasLocal) {
              return probed.value;
            }
            return parseTestState(await page.getByTestId("__xmlui-test-state").textContent());
          },
        },
      };
    });
  },
  createButtonDriver: async ({ page }, use) => {
    await use(async (testId) => createButtonDriver(page, testId));
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
  createMarkdownDriver: async ({ page }, use) => {
    await use(async (testId) => new ComponentDriver({
      locator: typeof testId === "string"
        ? page.getByTestId(testId)
        : testId ?? page.locator('[data-xmlui-component="Markdown"]').first(),
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
  const testBedPayload = {
    source,
    components: options.components ?? [],
    extensionIds: normalizeExtensionIds(options.extensionIds),
    resources: options.resources ?? {},
  };
  await installApiInterceptor(page, options.apiInterceptor);
  const installTestBedSource = (payload: { source: string; components: string[]; extensionIds: string[]; resources: Record<string, string> }) => {
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
    window.sessionStorage.setItem("__xmluiTestBedSource", payload.source);
    window.sessionStorage.setItem("__xmluiTestBedComponents", JSON.stringify(payload.components));
    window.sessionStorage.setItem("__xmluiTestBedExtensionIds", JSON.stringify(payload.extensionIds));
    window.sessionStorage.setItem("__xmluiTestBedResources", JSON.stringify(payload.resources));
  };
  const isReady = await page.evaluate(() => !!window.__xmluiTestBedReady).catch(() => false);
  if (isReady) {
    await replayInitScripts(page);
    await page.evaluate(installTestBedSource, testBedPayload);
    try {
      await page.evaluate(async (xmluiSource) => {
        await window.__xmluiTestBedReinit?.(xmluiSource);
      }, source);
    } catch {
      await navigateWithTestBedSource(page, installTestBedSource, testBedPayload);
    }
  } else {
    await navigateWithTestBedSource(page, installTestBedSource, testBedPayload);
  }
  await page.waitForFunction(() => window.__xmluiTestBedReady === true);
  const error = page.getByTestId("xmlui-testbed-error");
  if (await error.count()) {
    throw new Error(await error.textContent() ?? "XMLUI testbed failed to compile.");
  }
  await page.evaluate(() =>
    document.fonts.ready.then(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => setTimeout(resolve, 0));
        }),
    ),
  );
  await moveMouseAwayFromOrigin(page);
  await page.keyboard.press("Shift");
}

async function navigateWithTestBedSource(
  page: Page,
  installTestBedSource: (payload: { source: string; components: string[]; extensionIds: string[]; resources: Record<string, string> }) => void,
  testBedPayload: { source: string; components: string[]; extensionIds: string[]; resources: Record<string, string> },
): Promise<void> {
  await page.goto("/?__xmluiTestBed=1");
  await page.waitForFunction(() =>
    typeof window.__xmluiTestBedReinit === "function" ||
    !!document.querySelector('[data-testid="xmlui-testbed-error"]'),
  );
  await page.evaluate(installTestBedSource, testBedPayload);
  await page.evaluate(async (xmluiSource) => {
    await window.__xmluiTestBedReinit?.(xmluiSource);
  }, testBedPayload.source);
}

async function moveMouseAwayFromOrigin(page: Page): Promise<void> {
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.mouse.move(Math.max(viewport.width - 1, 0), Math.max(viewport.height - 1, 0));
}

function normalizeExtensionIds(extensionIds: string | string[] | undefined): string[] {
  if (!extensionIds) {
    return [];
  }
  return Array.isArray(extensionIds) ? extensionIds : [extensionIds];
}

async function installApiInterceptor(
  page: Page,
  apiInterceptor: InitTestBedOptions["apiInterceptor"],
): Promise<void> {
  const operations = apiInterceptor?.operations;
  if (!operations) {
    return;
  }
  const state: Record<string, unknown> = {};
  if (apiInterceptor?.initialize) {
    runApiHandler(apiInterceptor.initialize, { $state: state });
  }
  for (const operation of Object.values(operations)) {
    await page.route(`**${routeGlob(operation.url)}`, async (route) => {
      let body: unknown = { success: true };
      let status = operation.status ?? 200;
      if (operation.handler) {
	        try {
	          const apiContext = {
	            $state: state,
	            $requestBody: requestBody(route.request()),
	            $pathParams: pathParams(operation.url, new URL(route.request().url()).pathname),
	            $delayMs: 0,
	          };
	          body = runApiHandler(operation.handler, apiContext);
	          if (apiContext.$delayMs > 0) {
	            await new Promise((resolve) => setTimeout(resolve, apiContext.$delayMs));
	          }
	        } catch (error) {
          if (isHttpError(error)) {
            status = error.status;
            body = error.body;
          } else {
            status = 500;
            body = { error: String(error) };
          }
        }
      }
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
  }
}

function routeGlob(pattern: string): string {
  return pattern.replace(/:[^/]+/g, "*");
}

function runApiHandler(source: string, context: Record<string, unknown>): unknown {
  const handler = createApiHandler(source);
	  return handler(
	    context.$state,
	    context.$requestBody,
	    context.$pathParams,
	    context.$pathParams,
	    (ms: number) => {
	      context.$delayMs = Math.max(Number(context.$delayMs) || 0, Math.max(0, Number(ms) || 0));
	    },
	    {
	      HttpError: (status: number, body: unknown) => {
	        throw { __xmluiHttpError: true, status, body };
      },
    },
  );
}

function createApiHandler(source: string): Function {
  const trimmed = source.trim();
  if (trimmed.startsWith("(") || trimmed.includes("=>")) {
    return new Function(
	      "$state",
	      "$requestBody",
	      "$pathParams",
	      "$params",
	      "delay",
	      "Errors",
	      `return (${source})();`,
	    );
	  }
	  return new Function("$state", "$requestBody", "$pathParams", "$params", "delay", "Errors", source);
}

function requestBody(request: import("@playwright/test").Request): unknown {
  const text = request.postData();
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function pathParams(pattern: string, pathname: string): Record<string, string> {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = pathname.split("/").filter(Boolean);
  return Object.fromEntries(
    patternParts.flatMap((part, index) =>
      part.startsWith(":") ? [[part.slice(1), pathParts[index] ?? ""]] : [],
    ),
  );
}

function isHttpError(error: unknown): error is { status: number; body: unknown } {
  return Boolean(
    error &&
      typeof error === "object" &&
      (error as { __xmluiHttpError?: unknown }).__xmluiHttpError === true,
  );
}

async function replayInitScripts(page: Page): Promise<void> {
  const initScriptQueue: Array<{ fn: Function; arg?: unknown }> =
    (page as any).__xmluiInitScriptQueue ?? [];
  for (const { fn, arg } of initScriptQueue) {
    try {
      if (arg === undefined) {
        await page.evaluate(fn as any);
      } else {
        await page.evaluate(fn as any, arg);
      }
    } catch {
      // Playwright accepts init scripts that cannot be replayed via evaluate.
    }
  }
  initScriptQueue.length = 0;
}

function createButtonDriver(page: Page, testId?: string | Locator): ComponentDriver {
  const component = typeof testId === "string"
    ? page.getByTestId(testId).or(page.locator(`[data-xmlui-id="${testId}"]`)).or(page.locator(`#${testId}`)).first()
    : testId ?? page.getByRole("button").first();
  return new ComponentDriver({
    locator: component,
    page,
  });
}

function normalizeTestBedSource(markup: string, options: InitTestBedOptions): string {
  const { markup: normalizedMarkup, declarations } = normalizeLegacyVariableDeclarations(
    normalizeLegacyTestMarkup(markup.trim()),
  );
  const mainXsDeclarations = normalizeLegacyMainXsDeclarations(options.mainXs);
  const trimmed = normalizedMarkup;
  const testBedAppAttributes = {
    "paddingHorizontal-content-App": "0",
    "paddingVertical-content-App": "0",
    "gap-content-App": "0",
  };
  const appThemeAttributeEntries = Object.entries(testBedAppAttributes)
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`);
  if (/^<App\b[^>]*\S[^>]*>/.test(trimmed) && !/^<App\s*>/.test(trimmed)) {
    const injectedAttributes = [
      ...appThemeAttributeEntries,
      ...mainXsDeclarations,
      ...declarations,
      trimmed.includes("testState") && !/\bvar\.testState=/.test(trimmed) ? `var.testState="{${implicitTestStateInitialValue(trimmed)}}"` : "",
    ].filter(Boolean);
    return wrapRootAppTheme(injectAppAttributes(trimmed, injectedAttributes), options.testThemeVars);
  }
  const bodyMarkup = startsWithRoot(trimmed) ? stripAppRoot(trimmed) : trimmed;
  const defaultAppThemeAttributes = Object.entries(testBedAppAttributes)
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`)
    .join(" ");
  const themeAttributes = Object.entries(options.testThemeVars ?? {})
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`)
    .join(" ");
  const themedBody = themeAttributes ? `<Theme ${themeAttributes}>${bodyMarkup}</Theme>` : bodyMarkup;
  return `<App var.testState="{${implicitTestStateInitialValue(trimmed)}}" ${defaultAppThemeAttributes} ${mainXsDeclarations.join(" ")} ${declarations.join(" ")}>${themedBody}<Text testId="__xmlui-test-state">{testState}</Text></App>`;
}

function normalizeLegacyMainXsDeclarations(mainXs: string | undefined): string[] {
  if (!mainXs) {
    return [];
  }
  const declarations: string[] = [];
  const variablePattern = /\bvar\s+([A-Za-z_$][\w$]*)\s*=\s*([\s\S]*?);(?=\s*(?:var\b|$))/g;
  for (const match of mainXs.matchAll(variablePattern)) {
    declarations.push(`var.${match[1]}="{${match[2].trim()}}"`);
  }
  return declarations;
}

function implicitTestStateInitialValue(markup: string): "null" | "undefined" {
  if (markup.includes("selectionFired") || markup.includes("testState = testState || {}")) {
    return "null";
  }
  return /<Tree\b|<TreeDisplay\b|<TableOfContents\b/.test(markup) ? "undefined" : "null";
}

function injectAppAttributes(markup: string, attributes: string[]): string {
  if (attributes.length === 0) {
    return markup;
  }
  const end = findOpeningAppTagEnd(markup);
  if (end < 0) {
    return markup;
  }
  const openTag = markup.slice(0, end + 1);
  const selfClosing = /\/\s*>$/.test(openTag);
  const existing = selfClosing
    ? openTag.slice(4, openTag.lastIndexOf("/"))
    : openTag.slice(4, -1);
  const names = new Set([...existing.matchAll(/\s([^\s=]+)=/g)].map((match) => match[1]));
  const filtered = attributes
    .filter((entry) => {
      const name = entry.split("=")[0];
      return name && !names.has(name);
    })
    .join(" ");
  if (!filtered) {
    return markup;
  }
  const rebuilt = selfClosing
    ? `<App${existing} ${filtered} />`
    : `<App${existing} ${filtered}>`;
  return `${rebuilt}${markup.slice(end + 1)}`;
}

function wrapRootAppTheme(markup: string, themeVars: Record<string, unknown> | undefined): string {
  const entries = Object.entries(themeVars ?? {});
  if (entries.length === 0) {
    return markup;
  }
  const openEnd = findOpeningAppTagEnd(markup);
  const closeStart = markup.lastIndexOf("</App>");
  if (openEnd < 0 || closeStart < 0) {
    return markup;
  }
  const themeAttributes = entries
    .map(([name, value]) => `${name}=${quoteAttribute(String(value))}`)
    .join(" ");
  return `${markup.slice(0, openEnd + 1)}<Theme ${themeAttributes}>${markup.slice(openEnd + 1, closeStart)}</Theme>${markup.slice(closeStart)}`;
}

function findOpeningAppTagEnd(markup: string): number {
  let quote: string | undefined;
  for (let index = 4; index < markup.length; index++) {
    const char = markup[index];
    if (quote) {
      if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === `"` || char === `'`) {
      quote = char;
      continue;
    }
    if (char === ">") {
      return index;
    }
  }
  return -1;
}

function normalizeLegacyTestMarkup(markup: string): string {
  return stripLegacyTryCatchBlocks(escapeGtInQuotedAttributes(stripLegacyIframePostMessageScript(markup)))
    .replace(/(<CodeBlock\b[^>]*>)([\s\S]*?)(<\/CodeBlock>)/g, (_match, open, content, close) =>
      `${open}${content.replaceAll("{", "&#123;").replaceAll("}", "&#125;")}${close}`
    )
	    .replaceAll("&nbsp;", "\u00a0")
	    .replaceAll("&amp;", "&")
	    .replace(/\sboolean(?=[\s>])/g, ` boolean="true"`)
	    .replace(/\s(itemClickExpands)(?=[\s>])/g, ` $1="true"`)
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
    .replaceAll(`await delay(`, `delay(`)
    .replace(/testState\.loadCount(?!\s*=)/g, `(testState || {}).loadCount`)
    .replaceAll(`data="{invalidJson}"`, `data="invalidJson"`)
    .replace(/icon="\(\)\s*(?:=>|=&gt;)\s*\{\s*\}"/g, `icon="{null}"`)
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

function stripLegacyIframePostMessageScript(markup: string): string {
  return markup.replace(
    /<script>\s*window\.addEventListener\('message', \(event\) => \{\s*window\.parent\.postMessage\(\{ received: event\.data \}, '\*'\);\s*\}\);\s*<\/script>\s*<h1>Test IFrame<\/h1>/g,
    "<h1>Test IFrame</h1>",
  );
}

function stripLegacyTryCatchBlocks(markup: string): string {
  let output = "";
  let index = 0;
  while (index < markup.length) {
    const tryIndex = markup.indexOf("try", index);
    if (tryIndex < 0) {
      output += markup.slice(index);
      break;
    }
    const before = markup[tryIndex - 1];
    const after = markup[tryIndex + 3];
    if ((before && /[\w$]/.test(before)) || (after && /[\w$]/.test(after))) {
      output += markup.slice(index, tryIndex + 3);
      index = tryIndex + 3;
      continue;
    }
    const openTry = markup.indexOf("{", tryIndex + 3);
    if (openTry < 0) {
      output += markup.slice(index);
      break;
    }
    const closeTry = findMatchingBrace(markup, openTry);
    if (closeTry < 0) {
      output += markup.slice(index);
      break;
    }
    const catchMatch = /^\s*catch\s*\([^)]*\)\s*\{/.exec(markup.slice(closeTry + 1));
    if (!catchMatch) {
      output += markup.slice(index, closeTry + 1);
      index = closeTry + 1;
      continue;
    }
    const openCatch = closeTry + 1 + catchMatch[0].lastIndexOf("{");
    const closeCatch = findMatchingBrace(markup, openCatch);
    if (closeCatch < 0) {
      output += markup.slice(index);
      break;
    }
    output += markup.slice(index, tryIndex);
    output += markup.slice(openTry + 1, closeTry);
    index = closeCatch + 1;
  }
  return output;
}

function findMatchingBrace(source: string, openIndex: number): number {
  let depth = 0;
  let quote: string | undefined;
  for (let index = openIndex; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === "\\" && index + 1 < source.length) {
        index++;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }
    if (char === `"` || char === `'` || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        return index;
      }
    }
  }
  return -1;
}

function escapeGtInQuotedAttributes(markup: string): string {
  let quote: string | undefined;
  let inTag = false;
  let escaped = "";
  for (let index = 0; index < markup.length; index++) {
    const char = markup[index];
    if (quote) {
      if (char === quote) {
        quote = undefined;
        escaped += char;
      } else {
        escaped += char === ">" ? "&gt;" : char;
      }
      continue;
    }
    if (char === "<") {
      inTag = true;
    }
    if (char === ">" && inTag) {
      inTag = false;
      escaped += char;
      continue;
    }
    if (inTag && (char === `"` || char === `'`)) {
      quote = char;
    }
    escaped += char;
  }
  return escaped;
}

function normalizeLegacyVariableDeclarations(markup: string): {
  markup: string;
  declarations: string[];
} {
  const declarations: string[] = [];
  const modalBlocks: string[] = [];
  const protectedMarkup = markup.replace(/<ModalDialog\b[\s\S]*?<\/ModalDialog>/g, (block) => {
    const index = modalBlocks.push(block) - 1;
    return `__XMLUI_MODAL_BLOCK_${index}__`;
  });
  const normalizedMarkup = protectedMarkup.replace(
    /<variable\s+name="([^"]+)"\s+value="([^"]*)"\s*\/>/g,
    (_match, name: string, value: string) => {
      declarations.push(`var.${name}="${value}"`);
      return "";
    },
  ).replace(/__XMLUI_MODAL_BLOCK_(\d+)__/g, (_match, index: string) => modalBlocks[Number(index)] ?? "");
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
