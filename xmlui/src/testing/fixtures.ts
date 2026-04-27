/* eslint react-hooks/rules-of-hooks: 0 */
// The above exception is needed since it fires a false-positive
// for the "use" function coming from the playwright test framework
import { test as baseTest, devices } from "@playwright/test";
import type { BrowserContext, Locator, Page } from "playwright-core";

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
  OptionDriver,
  ProgressBarDriver,
  RadioGroupDriver,
  RangeDriver,
  SelectDriver,
  SplitterDriver,
  StackDriver,
  TestStateDriver,
  TextAreaDriver,
  TextDriver,
  ValidationDisplayDriver,
  ValidationSummaryDriver,
  VStackDriver,
  DatePickerDriver,
  AutoCompleteDriver,
  CodeBlockDriver,
  CheckboxDriver,
  DropdownMenuDriver,
  ContextMenuDriver,
  ExpandableItemDriver,
  FileInputDriver,
  FileUploadDropZoneDriver,
  LabelDriver,
  SpinnerDriver,
  SliderDriver,
  ResponsiveBarDriver,
} from "./ComponentDrivers";
import { parseComponentIfNecessary } from "./component-test-helpers";
import { TimeInputDriver } from "./drivers/TimeInputDriver";
import { TimerDriver } from "./drivers/TimerDriver";
import { DateInputDriver } from "./drivers/DateInputDriver";
import { ModalDialogDriver } from "./drivers/ModalDialogDriver";
import { TextBoxDriver } from "./drivers/TextBoxDriver";
import { NumberBoxDriver } from "./drivers/NumberBoxDriver";
import { TreeDriver } from "./drivers/TreeDriver";
import { collectCodeBehindFromSource } from "../parsers/scripting/code-behind-collect";
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
      window.navigator.clipboard.readText = () => Promise.resolve(this.content);
      window.navigator.clipboard.read = () => {
        throw new Error("Clipboard read not implemented in mocked environment");
      };
      window.navigator.clipboard.writeText = (text) => {
        this.content = text;
        return Promise.resolve(undefined);
      };
      window.navigator.clipboard.write = (items) => {
        throw new Error("Clipboard write not implemented in mocked environment");
      };
    };
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

export type TestBedDescription = Omit<
  Partial<StandaloneAppDescription>,
  "entryPoint" | "components"
> & {
  testThemeVars?: Record<string, string>;
  components?: string[];
  appGlobals?: Record<string, any>;
  /** Script source for Globals.xs — declarations become app-wide globals */
  globalsXs?: string;
  /** @deprecated Use globalsXs instead. Alias kept for backward compatibility. */
  mainXs?: string;
  noFragmentWrapper?: boolean;
  extensionIds?: string | string[];
};

const E2E_BASE_URL = `http://localhost:3211`;

type WorkerFixtures = {
  _sharedContext: BrowserContext;
  _sharedPage: Page;
};

export const test = baseTest.extend<TestDriverExtenderProps, WorkerFixtures>({
  // Worker-scoped browser context — reused across all tests in a worker
  _sharedContext: [
    async ({ browser }, use) => {
      const context = await browser.newContext({
        ...devices["Desktop Chrome"],
        baseURL: E2E_BASE_URL,
        serviceWorkers: "allow",
        permissions: ["clipboard-read", "clipboard-write"],
      });
      await use(context);
      await context.close();
    },
    { scope: "worker" },
  ],

  // Worker-scoped page — reused across all tests in a worker
  _sharedPage: [
    async ({ _sharedContext }, use) => {
      const page = await _sharedContext.newPage();
      await use(page);
    },
    { scope: "worker" },
  ],

  // Override test-scoped page to use the shared worker page.
  // This avoids creating a new browser context + page per test.
  page: async ({ _sharedPage, viewport }, use) => {
    // Apply the viewport specified by test.use({ viewport }) to the shared page.
    // Without this, viewport changes from one test would leak into subsequent tests.
    if (viewport) {
      await _sharedPage.setViewportSize(viewport);
    }

    // Intercept addInitScript so that scripts registered by tests can be replayed
    // in the reinit fast path (which skips page.goto and wouldn't trigger them).
    const initScriptQueue: Array<{ fn: Function; arg?: unknown }> = [];
    const origAddInitScript = (_sharedPage.addInitScript as Function).bind(_sharedPage);
    (_sharedPage as any).addInitScript = async (fn: any, arg?: any) => {
      if (typeof fn === "function") {
        initScriptQueue.push({ fn, arg });
      }
      return origAddInitScript(fn, arg);
    };
    (_sharedPage as any).__initScriptQueue__ = initScriptQueue;

    await use(_sharedPage);

    // Restore original addInitScript method and clear the queue.
    (_sharedPage as any).addInitScript = origAddInitScript;
    (_sharedPage as any).__initScriptQueue__ = undefined;

    // Cleanup between tests: clear storage to prevent state leakage
    try {
      await _sharedPage.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
        // Reset page-level scroll so anchor navigation from this test doesn't
        // bleed into the next test's initial-state assertions.
        window.scrollTo(0, 0);
        // Restore window.matchMedia if it was patched by a test (e.g.
        // emulateTouchDevice in ScrollViewer tests). Without this, the patch
        // persists into subsequent tests in the same worker and causes
        // isTouchDevice=true, which forces normalizedScrollStyle='normal',
        // hiding OverlayScrollbars fade overlays and making fade tests flaky.
        if ((window as any).__originalMatchMedia) {
          window.matchMedia = (window as any).__originalMatchMedia;
          delete (window as any).__originalMatchMedia;
        }
      });
      // Move mouse to a neutral position so :hover CSS from the previous
      // test doesn't bleed into the next one.
      await _sharedPage.mouse.move(0, 0);
    } catch {
      // Page might be in a bad state after a failed test; ignore
    }
  },

  // NOTE: the base Playwright test can be extended with fixture methods
  // as well as any other language constructs we deem useful
  baseComponentTestId: "test-id-component",
  testStateViewTestId: "test-state-view-testid",

  initTestBed: async ({ page, baseComponentTestId, testStateViewTestId }, use) => {
    // Each initTestBed call gets a unique marker ID to prevent the fast-path
    // __XMLUI_REINIT__ race: flushSync removes the old testStateViewTestId
    // synchronously in the browser, but Playwright's CDP connection has small
    // latency so waitFor({ state: "attached" }) could find the OLD element
    // before the DOM-change notification arrives. Using a unique ID per call
    // ensures we always wait for a freshly created element.
    let _callCount = 0;
    await use(async (source: string, description?: TestBedDescription) => {
      const _markerTestId = `${testStateViewTestId}-${++_callCount}`;
      // Default test icon resources
      const defaultTestResources = {
        "icon.box": "/resources/box.svg",
        "icon.doc": "/resources/doc.svg",
        "icon.sun": "/resources/sun.svg",
        "icon.eye": "/resources/eye.svg",
        "icon.txt": "/resources/txt.svg",
        "icon.bell": "/resources/bell.svg",
      };
      // --- Initialize XMLUI App
      const markup = description?.noFragmentWrapper
        ? source
        : `
          <Fragment var.testState="{null}">
            ${source}
            <Stack width="0" height="0">
              <Text
                testId="${_markerTestId}"
                value="{ typeof testState === 'undefined' ? 'undefined' : JSON.stringify(testState) }"/>
            </Stack>
          </Fragment>
        `;

      const { errors, warnings, component } = xmlUiMarkupToComponent(markup);

      if (warnings.length > 0) {
        console.group(`[xmlui] Warnings in markup:`);
        warnings.forEach((msg) => console.warn(msg));
        console.groupEnd();
      }

      if (errors.length > 0) {
        const errText = errors
          .map((e) => {
            return `code: "${e.code}" msg: "${e.message}"`;
          })
          .join("\n");
        throw new Error(`(${errors.length}) Errors while parsing Main.xmlui:\n${errText}`);
      }
      const entryPoint = component as ComponentDef;

      const components = description?.components?.map((c) => {
        const { component, errors, erroneousCompoundComponentName } = parseComponentIfNecessary(c);
        if (erroneousCompoundComponentName) {
          const errorMessages = errors.map((e) => `[${e.code}] ${e.message}`).join("\n");
          throw new Error(
            `Error parsing component "${erroneousCompoundComponentName}":\n${errorMessages}`,
          );
        }
        return component as CompoundComponentDef;
      });

      let runtime: any;
      const globalsXsSource = description?.globalsXs ?? description?.mainXs;
      if (globalsXsSource) {
        const parsedCodeBehind = collectCodeBehindFromSource("Globals", globalsXsSource);
        const moduleErrors = parsedCodeBehind?.moduleErrors ?? {};
        if (Object.keys(moduleErrors).length > 0) {
          const errText = Object.entries(moduleErrors)
            .flatMap(([, errs]) => errs.map((e) => `code: "${e.code}" msg: "${e.text}"`))
            .join("\n");
          throw new Error(`Errors while parsing globalsXs:\n${errText}`);
        }
        if (parsedCodeBehind?.vars || parsedCodeBehind?.functions) {
          // Pass through the variable definitions with their source text intact
          // for StandaloneApp to process with transformMainXsToGlobalTags
          runtime = {
            "/src/Globals.xs": {
              vars: parsedCodeBehind.vars || {},
              functions: parsedCodeBehind.functions || {},
              src: globalsXsSource, // Include original source for debugging
            },
          };
        }
      }

      // Add entryPoint to runtime so resolveRuntime can find it
      if (description?.noFragmentWrapper && entryPoint) {
        runtime = runtime || {};
        runtime["/src/Main.xmlui"] = {
          default: {
            component: entryPoint,
            src: source,
          },
        };
      }

      if (source !== "" && entryPoint.children) {
        const sourceBaseComponent = description?.noFragmentWrapper
          ? entryPoint // When no wrapper, entryPoint is the actual source component
          : entryPoint.children[0]; // With wrapper, it's inside Fragment
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

      // Merge default test resources with any provided resources
      const mergedResources = {
        ...defaultTestResources,
        ...themedDescription.resources,
      };

      const _appDescription: StandaloneAppDescription & { runtime: any } = {
        name: "test bed app",
        ...themedDescription,
        resources: mergedResources,
        components,
        entryPoint,
        runtime,
      };

      const clipboard = new Clipboard(page);

      // Normalize extensionIds to array format
      const extensionIds = description?.extensionIds
        ? Array.isArray(description.extensionIds)
          ? description.extensionIds
          : [description.extensionIds]
        : [];

      // Check if page already has the app loaded (from a previous test in this worker)
      const isReady = await page
        .evaluate(() => !!(window as any).__XMLUI_READY__)
        .catch(() => false);

      if (isReady) {
        // Fast path: update globals and reinit in-page (skip full page navigation).
        // flushSync in __XMLUI_REINIT__ ensures the old DOM is removed synchronously,
        // so the subsequent waitFor sees only the new render's elements.
        try {
          // Replay any init scripts registered via page.addInitScript() by this test.
          // These normally run on page.goto() but the fast path skips navigation.
          const initScriptQueue: Array<{ fn: Function; arg?: unknown }> =
            (page as any).__initScriptQueue__ ?? [];
          for (const { fn, arg } of initScriptQueue) {
            try {
              await (arg !== undefined ? page.evaluate(fn as any, arg) : page.evaluate(fn as any));
            } catch {
              // ignore non-serializable scripts
            }
          }
          initScriptQueue.length = 0;

          await page.evaluate(
            ({ app, extensionIds }: { app: any; extensionIds: string[] }) => {
              // Reset URL so React Router starts fresh at the app root.
              history.replaceState(null, "", "/");
              // Reset page-level scroll: anchor navigation from the previous test
              // (e.g. clicking a #hash link) scrolls the page and that scroll
              // position persists across reinits unless we reset it here.
              window.scrollTo(0, 0);
              (window as any).TEST_ENV = app;
              (window as any).TEST_RUNTIME = app.runtime;
              (window as any).TEST_EXTENSION_IDS = extensionIds;
              (window as any).__XMLUI_REINIT__();
            },
            { app: _appDescription, extensionIds },
          );
        } catch {
          // Reinit failed (page crashed?), fall back to full navigation
          await page.addInitScript(
            ({ app, extensionIds }) => {
              // @ts-ignore
              window.TEST_ENV = app;
              window.TEST_RUNTIME = app.runtime;
              window.TEST_EXTENSION_IDS = extensionIds;
            },
            { app: _appDescription, extensionIds },
          );
          await page.goto("/");
        }
      } else {
        // Slow path: first test in this worker — do full page navigation
        if (isCI) {
          await page.addInitScript(clipboard.init);
        }
        await page.addInitScript(
          ({ app, extensionIds }) => {
            // @ts-ignore
            window.TEST_ENV = app;
            window.TEST_RUNTIME = app.runtime;
            window.TEST_EXTENSION_IDS = extensionIds;
          },
          { app: _appDescription, extensionIds },
        );
        await page.goto("/");
      }

      const { width, height } = page.viewportSize();

      if (!description?.noFragmentWrapper) {
        await page.getByTestId(_markerTestId).waitFor({ state: "attached" });
      }

      // Wait for fonts to load, then one animation frame + one macrotask
      // so that deferred React effects (useEffect, scheduled via MessageChannel)
      // and browser style/layout computation finish before the test starts.
      await page.evaluate(() =>
        document.fonts.ready.then(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() => setTimeout(resolve, 0));
            }),
        ),
      );

      // Activate keyboard-navigation mode so that :focus-visible styles
      // match reliably after programmatic .focus() calls.  Shift alone
      // doesn't move focus or trigger component handlers — it only flips
      // Chrome's internal had_keyboard_event flag.
      await page.keyboard.press("Shift");

      // Create test icon locators
      const testIcons = {
        boxIcon: page.getByTestId("box-svg"),
        docIcon: page.getByTestId("doc-svg"),
        sunIcon: page.getByTestId("sun-svg"),
        eyeIcon: page.getByTestId("eye-svg"),
        txtIcon: page.getByTestId("txt-svg"),
        bellIcon: page.getByTestId("bell-svg"),
      };

      return {
        testStateDriver: new TestStateDriver(page.getByTestId(_markerTestId)),
        clipboard,
        width: width ?? 0,
        height: height ?? 0,
        testIcons,
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
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ButtonDriver, testIdOrLocator);
    });
  },
  createContentSeparatorDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ContentSeparatorDriver, testIdOrLocator);
    });
  },
  createAvatarDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(AvatarDriver, testIdOrLocator);
    });
  },
  createFormDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(FormDriver, testIdOrLocator);
    });
  },
  createFormItemDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(FormItemDriver, testIdOrLocator);
    });
  },
  createValidationSummaryDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ValidationSummaryDriver, testIdOrLocator);
    });
  },
  createValidationDisplayDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ValidationDisplayDriver, testIdOrLocator);
    });
  },
  createSplitterDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(SplitterDriver, testIdOrLocator);
    });
  },
  createMarkdownDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(MarkdownDriver, testIdOrLocator);
    });
  },
  createItemsDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ItemsDriver, testIdOrLocator);
    });
  },
  createRangeDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(RangeDriver, testIdOrLocator);
    });
  },
  createDatePickerDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(DatePickerDriver, testIdOrLocator);
    });
  },
  createExpandableItemDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ExpandableItemDriver, testIdOrLocator);
    });
  },
  createFileInputDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(FileInputDriver, testIdOrLocator);
    });
  },
  createFileUploadDropZoneDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(FileUploadDropZoneDriver, testIdOrLocator);
    });
  },
  createAutoCompleteDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(AutoCompleteDriver, testIdOrLocator);
    });
  },
  createSelectDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(SelectDriver, testIdOrLocator);
    });
  },
  createRadioGroupDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(RadioGroupDriver, testIdOrLocator);
    });
  },
  createNumberBoxDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(NumberBoxDriver, testIdOrLocator);
    });
  },
  createTextBoxDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(TextBoxDriver, testIdOrLocator);
    });
  },
  createSliderDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(SliderDriver, testIdOrLocator);
    });
  },
  createTextAreaDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(TextAreaDriver, testIdOrLocator);
    });
  },
  createProgressBarDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ProgressBarDriver, testIdOrLocator);
    });
  },
  createListDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ListDriver, testIdOrLocator);
    });
  },
  createTextDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(TextDriver, testIdOrLocator);
    });
  },
  createHeadingDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(HeadingDriver, testIdOrLocator);
    });
  },
  createIconDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(IconDriver, testIdOrLocator);
    });
  },
  createStackDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(StackDriver, testIdOrLocator);
    });
  },
  createHStackDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(HStackDriver, testIdOrLocator);
    });
  },
  createVStackDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(VStackDriver, testIdOrLocator);
    });
  },
  createLinkDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(LinkDriver, testIdOrLocator);
    });
  },
  createNavLinkDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(NavLinkDriver, testIdOrLocator);
    });
  },
  createNavGroupDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(NavGroupDriver, testIdOrLocator);
    });
  },
  createNavPanelDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(NavPanelDriver, testIdOrLocator);
    });
  },
  createCardDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(CardDriver, testIdOrLocator);
    });
  },
  createAccordionDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(AccordionDriver, testIdOrLocator);
    });
  },
  createAppHeaderDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(AppHeaderDriver, testIdOrLocator);
    });
  },
  createAppFooterDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(AppFooterDriver, testIdOrLocator);
    });
  },
  createBadgeDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(BadgeDriver, testIdOrLocator);
    });
  },
  createNoResultDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(NoResultDriver, testIdOrLocator);
    });
  },
  createOptionDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(OptionDriver, testIdOrLocator);
    });
  },
  createHtmlTagDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(HtmlTagDriver, testIdOrLocator);
    });
  },
  createCodeBlockDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(CodeBlockDriver, testIdOrLocator);
    });
  },
  createCheckboxDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(CheckboxDriver, testIdOrLocator);
    });
  },
  createLabelDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(LabelDriver, testIdOrLocator);
    });
  },
  createSpinnerDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(SpinnerDriver, testIdOrLocator);
    });
  },
  createDropdownMenuDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(DropdownMenuDriver, testIdOrLocator);
    });
  },
  createContextMenuDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ContextMenuDriver, testIdOrLocator);
    });
  },
  createTimeInputDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(TimeInputDriver, testIdOrLocator);
    });
  },
  createTimerDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(TimerDriver, testIdOrLocator);
    });
  },
  createDateInputDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(DateInputDriver, testIdOrLocator);
    });
  },
  createModalDialogDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ModalDialogDriver, testIdOrLocator);
    });
  },
  createTreeDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(TreeDriver, testIdOrLocator);
    });
  },
  createResponsiveBarDriver: async ({ createDriver }, use) => {
    await use((testIdOrLocator?: string | Locator) => {
      return createDriver(ResponsiveBarDriver, testIdOrLocator);
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
    testIcons: {
      boxIcon: Locator;
      docIcon: Locator;
      sunIcon: Locator;
      eyeIcon: Locator;
      txtIcon: Locator;
      bellIcon: Locator;
    };
  }>;
  createDriver: <T extends new (...args: ComponentDriverParams[]) => any>(
    driverClass: T,
    testIdOrLocator?: string | Locator,
  ) => Promise<InstanceType<T>>;
  createButtonDriver: ComponentDriverMethod<ButtonDriver>;
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
  createContextMenuDriver: ComponentDriverMethod<ContextMenuDriver>;
  createTimeInputDriver: ComponentDriverMethod<TimeInputDriver>;
  createTimerDriver: ComponentDriverMethod<TimerDriver>;
  createDateInputDriver: ComponentDriverMethod<DateInputDriver>;
  createModalDialogDriver: ComponentDriverMethod<ModalDialogDriver>;
  createTreeDriver: ComponentDriverMethod<TreeDriver>;
  createResponsiveBarDriver: ComponentDriverMethod<ResponsiveBarDriver>;
};
