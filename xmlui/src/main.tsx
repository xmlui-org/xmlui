import "./global.css";

import { createElement } from "react";
import type { Root } from "react-dom/client";
import {
  createXmluiModule,
  mountXmluiApp,
  renderXmluiApp,
  XmluiRoot,
  type MountXmluiAppOptions,
  type XmluiModule,
} from "./runtime";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compiler/compileXmluiSource";
import counterBadgeExtension from "../../packages/xmlui-counter-badge/src";
import type { Extension } from "./extensions";
import type { ThemeDefinition } from "./abstractions/ThemingDefs";

import asyncDirectivesApp from "./examples/async-directives/Main.xmlui";
import asyncResponsiveLoopApp from "./examples/async-responsive-loop/Main.xmlui";
import asyncSequenceApp from "./examples/async-sequence/Main.xmlui";
import componentCounterApp from "./examples/counter-components/Main.xmlui";
import actionsCallApiApp from "./examples/actions-call-api/Main.xmlui";
import accordionFoundationApp from "./examples/accordion-foundation/Main.xmlui";
import apiCallMutationApp from "./examples/api-call-mutation/Main.xmlui";
import appHeaderFoundationApp from "./examples/app-header-foundation/Main.xmlui";
import appMainContentLayoutApp from "./examples/app-main-content-layout/Main.xmlui";
import appStateListenersApp from "./examples/app-state-listeners/Main.xmlui";
import builtinsInputsApp from "./examples/builtins-inputs/Main.xmlui";
import builtinsItemsApp from "./examples/builtins-items/Main.xmlui";
import builtinsLayoutApp from "./examples/builtins-layout/Main.xmlui";
import builtinsTaskFilterApp from "./examples/builtins-task-filter/Main.xmlui";
import buttonCompatibilityApp from "./examples/button-compatibility/Main.xmlui";
import codeBlockFoundationApp from "./examples/code-block-foundation/Main.xmlui";
import generatedOutputApp from "./examples/generated-output/Main.xmlui";
import emptyFallbackStatesApp from "./examples/empty-fallback-states/Main.xmlui";
import expandableItemFoundationApp from "./examples/expandable-item-foundation/Main.xmlui";
import separatorSpacingApp from "./examples/separator-spacing/Main.xmlui";
import broaderExpressionsApp from "./examples/broader-expressions/Main.xmlui";
import dataSourceMockApp from "./examples/data-source-mock/Main.xmlui";
import dataSourceRefetchApp from "./examples/data-source-refetch/Main.xmlui";
import debugHelpersApp from "./examples/debug-helpers/Main.xmlui";
import expressionUpdateComponentsApp from "./examples/expression-update-components/Main.xmlui";
import expressionUpdatesApp from "./examples/expression-updates/Main.xmlui";
import eventTagHandlerApp from "./examples/event-tag-handler/Main.xmlui";
import extensionCounterBadgeApp from "./examples/extension-counter-badge/Main.xmlui";
import globalCounterApp from "./examples/counter-globals/Main.xmlui";
import handlerAssignmentsApp from "./examples/handler-assignments/Main.xmlui";
import handlerConditionalsApp from "./examples/handler-conditionals/Main.xmlui";
import handlerLocalsApp from "./examples/handler-locals/Main.xmlui";
import handlerLoopBenchmarkApp from "./examples/handler-loop-benchmark/Main.xmlui";
import handlerLoopsApp from "./examples/handler-loops/Main.xmlui";
import headingOldCompatibilityApp from "./examples/heading-old-compatibility/Main.xmlui";
import htmlTagsFragmentApp from "./examples/html-tags-fragment/Main.xmlui";
import iconLogoMediaApp from "./examples/icon-logo-media/Main.xmlui";
import imageIFrameMediaApp from "./examples/image-iframe-media/Main.xmlui";
import includeMarkupFoundationApp from "./examples/include-markup-foundation/Main.xmlui";
import i18nFoundationApp from "./examples/i18n-foundation/Main.xmlui";
import inspectorFoundationApp from "./examples/inspector-foundation/Main.xmlui";
import linkInteractionApp from "./examples/link-interaction/Main.xmlui";
import markdownFoundationApp from "./examples/markdown-foundation/Main.xmlui";
import navGroupFoundationApp from "./examples/navgroup-foundation/Main.xmlui";
import navLinkFoundationApp from "./examples/navlink-foundation/Main.xmlui";
import navPanelCollapseButtonFoundationApp from "./examples/nav-panel-collapse-button-foundation/Main.xmlui";
import navPanelFoundationApp from "./examples/navpanel-foundation/Main.xmlui";
import layoutCoreApp from "./examples/layout-core/Main.xmlui";
import localCounterApp from "./examples/counter-local/Main.xmlui";
import reactiveDerivedBasicApp from "./examples/reactive-derived-basic/Main.xmlui";
import reactiveDerivedChainApp from "./examples/reactive-derived-chain/Main.xmlui";
import reactiveDerivedGlobalsApp from "./examples/reactive-derived-globals/Main.xmlui";
import reactiveDerivedOverrideApp from "./examples/reactive-derived-override/Main.xmlui";
import reactiveDerivedPropsApp from "./examples/reactive-derived-props/Main.xmlui";
import primitiveTextHeadingApp from "./examples/primitive-text-heading/Main.xmlui";
import profileMenuFoundationApp from "./examples/profile-menu-foundation/Main.xmlui";
import responsiveStateBasicsApp from "./examples/responsive-state-basics/Main.xmlui";
import routingBasicApp from "./examples/routing-basic/Main.xmlui";
import routingDataApp from "./examples/routing-data/Main.xmlui";
import routingQueryApp from "./examples/routing-query/Main.xmlui";
import routingStateApp from "./examples/routing-state/Main.xmlui";
import runtimeToastApp from "./examples/runtime-toast/Main.xmlui";
import retryPolicyFoundationApp from "./examples/retry-policy-foundation/Main.xmlui";
import responsiveBarFoundationApp from "./examples/responsive-bar-foundation/Main.xmlui";
import scrollViewerFoundationApp from "./examples/scroll-viewer-foundation/Main.xmlui";
import schedulingFoundationApp from "./examples/scheduling-foundation/Main.xmlui";
import splitterFoundationApp from "./examples/splitter-foundation/Main.xmlui";
import stickyFoundationApp from "./examples/sticky-foundation/Main.xmlui";
import styleMutationApp from "./examples/style-mutation/Main.xmlui";
import themeScopeApp from "./examples/theme-scope/Main.xmlui";
import themeVarsApp from "./examples/theme-vars/Main.xmlui";
import textOldCompatibilityApp from "./examples/text-old-compatibility/Main.xmlui";
import textAreaFoundationApp from "./examples/text-area-foundation/Main.xmlui";
import textBoxFoundationApp from "./examples/text-box-foundation/Main.xmlui";
import numberBoxFoundationApp from "./examples/number-box-foundation/Main.xmlui";
import checkboxFoundationApp from "./examples/checkbox-foundation/Main.xmlui";
import switchFoundationApp from "./examples/switch-foundation/Main.xmlui";
import ratingInputFoundationApp from "./examples/rating-input-foundation/Main.xmlui";
import sliderFoundationApp from "./examples/slider-foundation/Main.xmlui";
import colorPickerFoundationApp from "./examples/color-picker-foundation/Main.xmlui";
import dateInputFoundationApp from "./examples/date-input-foundation/Main.xmlui";
import datePickerFoundationApp from "./examples/date-picker-foundation/Main.xmlui";
import drawerFoundationApp from "./examples/drawer-foundation/Main.xmlui";
import modalDialogFoundationApp from "./examples/modal-dialog-foundation/Main.xmlui";
import messagingFoundationApp from "./examples/messaging-foundation/Main.xmlui";
import missingVisualComponentsFoundationApp from "./examples/missing-visual-components-foundation/Main.xmlui";
import feedbackAccessibilityFoundationApp from "./examples/feedback-accessibility-foundation/Main.xmlui";
import themeSlotFoundationApp from "./examples/theme-slot-foundation/Main.xmlui";
import appShellFoundationApp from "./examples/app-shell-foundation/Main.xmlui";
import pageRoutingFoundationApp from "./examples/page-routing-foundation/Main.xmlui";
import nestedAppFoundationApp from "./examples/nested-app-foundation/Main.xmlui";
import tooltipFoundationApp from "./examples/tooltip-foundation/Main.xmlui";
import contextMenuFoundationApp from "./examples/context-menu-foundation/Main.xmlui";
import dropdownMenuFoundationApp from "./examples/dropdown-menu-foundation/Main.xmlui";
import cardFoundationApp from "./examples/card-foundation/Main.xmlui";
import fileInputFoundationApp from "./examples/file-input-foundation/Main.xmlui";
import fileUploadDropZoneFoundationApp from "./examples/file-upload-drop-zone-foundation/Main.xmlui";
import focusScopeFoundationApp from "./examples/focus-scope-foundation/Main.xmlui";
import flowTileFoundationApp from "./examples/flow-tile-foundation/Main.xmlui";
import footerFoundationApp from "./examples/footer-foundation/Main.xmlui";
import formFoundationApp from "./examples/form-foundation/Main.xmlui";
import formSegmentFoundationApp from "./examples/form-segment-foundation/Main.xmlui";
import structuredFormsFoundationApp from "./examples/structured-forms-foundation/Main.xmlui";
import validationDisplayFoundationApp from "./examples/validation-display-foundation/Main.xmlui";
import timeInputFoundationApp from "./examples/time-input-foundation/Main.xmlui";
import stackFamilyFoundationApp from "./examples/stack-family-foundation/Main.xmlui";
import stepperFoundationApp from "./examples/stepper-foundation/Main.xmlui";
import tableFoundationApp from "./examples/table-foundation/Main.xmlui";
import tabsFoundationApp from "./examples/tabs-foundation/Main.xmlui";
import treeFamilyFoundationApp from "./examples/tree-family-foundation/Main.xmlui";
import udcCombinedApp from "./examples/udc-combined/Main.xmlui";
import udcDefaultChildrenApp from "./examples/udc-default-children/Main.xmlui";
import udcEventEmissionApp from "./examples/udc-event-emission/Main.xmlui";
import udcMethodsApp from "./examples/udc-methods/Main.xmlui";
import udcSlotContextApp from "./examples/udc-slot-context/Main.xmlui";

declare global {
  interface Window {
    __xmluiTestBedProbe?: {
      hasLocal(name: string): boolean;
      readLocal(name: string): unknown;
      readGlobal(name: string): unknown;
      readReference(name: string): unknown;
    };
    __xmluiTestBedReady?: boolean;
    __xmluiTestBedReinit?: (source: string) => Promise<void>;
  }
}

const examples = {
  actionsCallApi: actionsCallApiApp,
  accordionFoundation: accordionFoundationApp,
  apiCallMutation: apiCallMutationApp,
  appHeaderFoundation: appHeaderFoundationApp,
  appMainContentLayout: appMainContentLayoutApp,
  appStateListeners: appStateListenersApp,
  asyncDirectives: asyncDirectivesApp,
  asyncResponsiveLoop: asyncResponsiveLoopApp,
  asyncSequence: asyncSequenceApp,
  builtinsInputs: builtinsInputsApp,
  builtinsItems: builtinsItemsApp,
  builtinsLayout: builtinsLayoutApp,
  builtinsTaskFilter: builtinsTaskFilterApp,
  buttonCompatibility: buttonCompatibilityApp,
  codeBlockFoundation: codeBlockFoundationApp,
  generatedOutput: generatedOutputApp,
  emptyFallbackStates: emptyFallbackStatesApp,
  expandableItemFoundation: expandableItemFoundationApp,
  separatorSpacing: separatorSpacingApp,
  components: componentCounterApp,
  dataSourceMock: dataSourceMockApp,
  dataSourceRefetch: dataSourceRefetchApp,
  debugHelpers: debugHelpersApp,
  expressions: broaderExpressionsApp,
  expressionComponents: expressionUpdateComponentsApp,
  expressionUpdates: expressionUpdatesApp,
  eventTagHandler: eventTagHandlerApp,
  extensionCounterBadge: extensionCounterBadgeApp,
  globals: globalCounterApp,
  handlerAssignments: handlerAssignmentsApp,
  handlerConditionals: handlerConditionalsApp,
  handlerLocals: handlerLocalsApp,
  handlerLoopBenchmark: handlerLoopBenchmarkApp,
  handlerLoops: handlerLoopsApp,
  headingOldCompatibility: headingOldCompatibilityApp,
  htmlTagsFragment: htmlTagsFragmentApp,
  iconLogoMedia: iconLogoMediaApp,
  imageIFrameMedia: imageIFrameMediaApp,
  includeMarkupFoundation: includeMarkupFoundationApp,
  i18nFoundation: i18nFoundationApp,
  inspectorFoundation: inspectorFoundationApp,
  linkInteraction: linkInteractionApp,
  markdownFoundation: markdownFoundationApp,
  navGroupFoundation: navGroupFoundationApp,
  navLinkFoundation: navLinkFoundationApp,
  navPanelCollapseButtonFoundation: navPanelCollapseButtonFoundationApp,
  navPanelFoundation: navPanelFoundationApp,
  layoutCore: layoutCoreApp,
  local: localCounterApp,
  reactiveDerivedBasic: reactiveDerivedBasicApp,
  reactiveDerivedChain: reactiveDerivedChainApp,
  reactiveDerivedGlobals: reactiveDerivedGlobalsApp,
  reactiveDerivedOverride: reactiveDerivedOverrideApp,
  reactiveDerivedProps: reactiveDerivedPropsApp,
  primitiveTextHeading: primitiveTextHeadingApp,
  profileMenuFoundation: profileMenuFoundationApp,
  responsiveStateBasics: responsiveStateBasicsApp,
  routingBasic: routingBasicApp,
  routingData: routingDataApp,
  routingQuery: routingQueryApp,
  routingState: routingStateApp,
  runtimeToast: runtimeToastApp,
  retryPolicyFoundation: retryPolicyFoundationApp,
  responsiveBarFoundation: responsiveBarFoundationApp,
  scrollViewerFoundation: scrollViewerFoundationApp,
  schedulingFoundation: schedulingFoundationApp,
  splitterFoundation: splitterFoundationApp,
  stickyFoundation: stickyFoundationApp,
  styleMutation: styleMutationApp,
  themeScope: themeScopeApp,
  themeVars: themeVarsApp,
  textOldCompatibility: textOldCompatibilityApp,
  textAreaFoundation: textAreaFoundationApp,
  textBoxFoundation: textBoxFoundationApp,
  numberBoxFoundation: numberBoxFoundationApp,
  checkboxFoundation: checkboxFoundationApp,
  switchFoundation: switchFoundationApp,
  ratingInputFoundation: ratingInputFoundationApp,
  sliderFoundation: sliderFoundationApp,
  colorPickerFoundation: colorPickerFoundationApp,
  dateInputFoundation: dateInputFoundationApp,
  datePickerFoundation: datePickerFoundationApp,
  drawerFoundation: drawerFoundationApp,
  modalDialogFoundation: modalDialogFoundationApp,
  messagingFoundation: messagingFoundationApp,
  missingVisualComponentsFoundation: missingVisualComponentsFoundationApp,
  feedbackAccessibilityFoundation: feedbackAccessibilityFoundationApp,
  themeSlotFoundation: themeSlotFoundationApp,
  appShellFoundation: appShellFoundationApp,
  pageRoutingFoundation: pageRoutingFoundationApp,
  nestedAppFoundation: nestedAppFoundationApp,
  tooltipFoundation: tooltipFoundationApp,
  contextMenuFoundation: contextMenuFoundationApp,
  dropdownMenuFoundation: dropdownMenuFoundationApp,
  cardFoundation: cardFoundationApp,
  fileInputFoundation: fileInputFoundationApp,
  fileUploadDropZoneFoundation: fileUploadDropZoneFoundationApp,
  focusScopeFoundation: focusScopeFoundationApp,
  flowTileFoundation: flowTileFoundationApp,
  footerFoundation: footerFoundationApp,
  formFoundation: formFoundationApp,
  formSegmentFoundation: formSegmentFoundationApp,
  structuredFormsFoundation: structuredFormsFoundationApp,
  validationDisplayFoundation: validationDisplayFoundationApp,
  timeInputFoundation: timeInputFoundationApp,
  stackFamilyFoundation: stackFamilyFoundationApp,
  stepperFoundation: stepperFoundationApp,
  tableFoundation: tableFoundationApp,
  tabsFoundation: tabsFoundationApp,
  treeFamilyFoundation: treeFamilyFoundationApp,
  udcCombined: udcCombinedApp,
  udcDefaultChildren: udcDefaultChildrenApp,
  udcEventEmission: udcEventEmissionApp,
  udcMethods: udcMethodsApp,
  udcSlotContext: udcSlotContextApp,
};

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const TESTBED_EXTENSION_PATHS: Record<string, string> = {
  "xmlui-ai-blocks": "../../packages/xmlui-ai-blocks/src/index.tsx",
  "xmlui-animations": "../../packages/xmlui-animations/src/index.tsx",
  "xmlui-calendar": "../../packages/xmlui-calendar/src/index.tsx",
  "xmlui-crm-blocks": "../../packages/xmlui-crm-blocks/src/index.tsx",
  "xmlui-docs-blocks": "../../packages/xmlui-docs-blocks/src/index.tsx",
  "xmlui-echart": "../../packages/xmlui-echart/src/index.tsx",
  "xmlui-gauge": "../../packages/xmlui-gauge/src/index.tsx",
  "xmlui-grid-layout": "../../packages/xmlui-grid-layout/src/index.tsx",
  "xmlui-masonry": "../../packages/xmlui-masonry/src/index.tsx",
  "xmlui-search": "../../packages/xmlui-search/src/index.tsx",
  "xmlui-tiptap-editor": "../../packages/xmlui-tiptap-editor/src/index.tsx",
  "xmlui-website-blocks": "../../packages/xmlui-website-blocks/src/index.tsx",
};

const TESTBED_EXTENSION_MODULES = import.meta.glob<{ default: Extension }>(
  "../../packages/xmlui-{ai-blocks,animations,calendar,crm-blocks,docs-blocks,echart,gauge,grid-layout,masonry,search,tiptap-editor,website-blocks}/src/index.{ts,tsx}",
);

const params = new URLSearchParams(window.location.search);
if (params.has("__xmluiTestBed")) {
  let testBedRoot: Root | undefined;
  let testBedRenderKey = 0;

  const compileTestBedModule = async (source: string): Promise<Extract<XmluiModule, { kind: "app" }>> => {
    const componentSources = readTestBedComponentSources();
    const extensions = await readTestBedExtensions();
    const knownComponents = componentSources.map((componentSource, index) => {
      const compiled = compileXmluiSource({
        id: `testbed-component-${index}.xmlui`,
        source: componentSource,
        extensions,
        validateComponentReferences: false,
      });
      if (compiled.runtimeDocument.kind !== "component") {
        throw new Error("Test bed component sources must compile to component modules.");
      }
      return compiled.runtimeDocument.name;
    });
    const components = componentSources.map((componentSource, index) => {
      const compiled = compileXmluiSource({
        id: `testbed-component-${index}.xmlui`,
        source: componentSource,
        knownComponents,
        extensions,
      });
      throwFirstCompilerDiagnostic(compiled);
      return createXmluiModule(compiled.runtimeDocument, [], {
        extensions,
      });
    });
    const compiled = compileXmluiSource({
      id: "testbed.xmlui",
      source,
      knownComponents,
      extensions,
    });
    throwFirstCompilerDiagnostic(compiled);
    const module = createXmluiModule(compiled.runtimeDocument, components, {
      extensions,
    });
    if (module.kind !== "app") {
      throw new Error("Test bed source must compile to an app module.");
    }
    return module;
  };

  const readTestBedComponentSources = (): string[] => {
    const raw = window.sessionStorage.getItem("__xmluiTestBedComponents");
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [];
    }
  };

  const readTestBedResources = (): Record<string, string> => {
    const raw = window.sessionStorage.getItem("__xmluiTestBedResources");
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? Object.fromEntries(
            Object.entries(parsed).filter(
              (entry): entry is [string, string] =>
                typeof entry[0] === "string" && typeof entry[1] === "string",
            ),
          )
        : {};
    } catch {
      return {};
    }
  };

  const readTestBedThemes = (): Array<ThemeDefinition> => {
    const raw = window.sessionStorage.getItem("__xmluiTestBedThemes");
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((item): item is ThemeDefinition =>
            item && typeof item === "object" && typeof item.id === "string",
          )
        : [];
    } catch {
      return [];
    }
  };

  const readTestBedDefaultTheme = (): string | undefined => {
    const value = window.sessionStorage.getItem("__xmluiTestBedDefaultTheme");
    return value || undefined;
  };

  const readTestBedExtensions = async (): Promise<Extension[]> => {
    const raw = window.sessionStorage.getItem("__xmluiTestBedExtensionIds");
    if (!raw) {
      return [counterBadgeExtension];
    }
    let ids: string[];
    try {
      const parsed = JSON.parse(raw);
      ids = Array.isArray(parsed)
        ? parsed.filter((item): item is string => typeof item === "string")
        : [];
    } catch {
      return [counterBadgeExtension];
    }
    return [
      counterBadgeExtension,
      ...(await Promise.all(ids.map(loadTestBedExtension))).flat(),
    ];
  };

  const loadTestBedExtension = async (id: string): Promise<Extension[]> => {
    const path = TESTBED_EXTENSION_PATHS[id];
    if (!path) {
      return [];
    }
    const loader = TESTBED_EXTENSION_MODULES[path];
    if (!loader) {
      throw new Error(`Missing XMLUI testbed extension module for '${id}'.`);
    }
    const module = await loader();
    return module.default ? [module.default] : [];
  };

  const showTestBedError = (error: unknown): void => {
    root.innerHTML = `<pre data-testid="xmlui-testbed-error">${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>`;
  };

  const waitForTestBedRender = (): Promise<void> =>
    new Promise((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });

  const renderTestBedModule = async (module: Extract<XmluiModule, { kind: "app" }>): Promise<void> => {
    const key = testBedRenderKey++;
    const extensions = await readTestBedExtensions();
    const resources = readTestBedResources();
    const themes = readTestBedThemes();
    const defaultTheme = readTestBedDefaultTheme();
    const testProbe: MountXmluiAppOptions["testProbe"] = (probe) => {
      window.__xmluiTestBedProbe = probe;
    };
    if (!testBedRoot) {
      testBedRoot = mountXmluiApp(module, root, {
        extensions,
        resources,
        themes,
        defaultTheme,
        testProbe,
      });
      return;
    }
    testBedRoot.render(createElement(XmluiRoot, {
      key,
      module,
      extensions,
      resources,
      themes,
      defaultTheme,
      testProbe,
    }));
  };

  window.__xmluiTestBedReinit = async (source: string) => {
    window.__xmluiTestBedReady = false;
    window.__xmluiTestBedProbe = undefined;
    try {
      if (testBedRoot) {
        testBedRoot.unmount();
        testBedRoot = undefined;
        await waitForTestBedRender();
      }
      const module = await compileTestBedModule(source);
      history.replaceState(null, "", "/");
      window.scrollTo(0, 0);
      await renderTestBedModule(module);
      await waitForTestBedRender();
      window.__xmluiTestBedReady = true;
    } catch (error) {
      showTestBedError(error);
      throw error;
    }
  };

  (async () => {
    const source = window.sessionStorage.getItem("__xmluiTestBedSource") ?? "<App />";
    try {
      await renderTestBedModule(await compileTestBedModule(source));
      await waitForTestBedRender();
      window.__xmluiTestBedReady = true;
    } catch (error) {
      showTestBedError(error);
    }
  })();
} else {
  const example = params.get("example") ?? "globals";
  renderXmluiApp(examples[example as keyof typeof examples] ?? globalCounterApp, root, {
    extensions: [counterBadgeExtension],
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
