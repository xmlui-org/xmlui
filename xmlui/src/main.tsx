import { renderXmluiApp } from "./runtime";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compiler/compileXmluiSource";
import { createXmluiModule } from "./runtime";
import counterBadgeExtension from "../../packages/xmlui-counter-badge/src";
import "./global.css";

import asyncDirectivesApp from "./examples/async-directives/Main.xmlui";
import asyncResponsiveLoopApp from "./examples/async-responsive-loop/Main.xmlui";
import asyncSequenceApp from "./examples/async-sequence/Main.xmlui";
import componentCounterApp from "./examples/counter-components/Main.xmlui";
import actionsCallApiApp from "./examples/actions-call-api/Main.xmlui";
import accordionFoundationApp from "./examples/accordion-foundation/Main.xmlui";
import apiCallMutationApp from "./examples/api-call-mutation/Main.xmlui";
import appHeaderFoundationApp from "./examples/app-header-foundation/Main.xmlui";
import appMainContentLayoutApp from "./examples/app-main-content-layout/Main.xmlui";
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
import linkInteractionApp from "./examples/link-interaction/Main.xmlui";
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
import responsiveBarFoundationApp from "./examples/responsive-bar-foundation/Main.xmlui";
import scrollViewerFoundationApp from "./examples/scroll-viewer-foundation/Main.xmlui";
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
import tooltipFoundationApp from "./examples/tooltip-foundation/Main.xmlui";
import contextMenuFoundationApp from "./examples/context-menu-foundation/Main.xmlui";
import dropdownMenuFoundationApp from "./examples/dropdown-menu-foundation/Main.xmlui";
import cardFoundationApp from "./examples/card-foundation/Main.xmlui";
import fileInputFoundationApp from "./examples/file-input-foundation/Main.xmlui";
import fileUploadDropZoneFoundationApp from "./examples/file-upload-drop-zone-foundation/Main.xmlui";
import flowTileFoundationApp from "./examples/flow-tile-foundation/Main.xmlui";
import footerFoundationApp from "./examples/footer-foundation/Main.xmlui";
import timeInputFoundationApp from "./examples/time-input-foundation/Main.xmlui";
import stackFamilyFoundationApp from "./examples/stack-family-foundation/Main.xmlui";
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
      readLocal(name: string): unknown;
      readGlobal(name: string): unknown;
    };
  }
}

const examples = {
  actionsCallApi: actionsCallApiApp,
  accordionFoundation: accordionFoundationApp,
  apiCallMutation: apiCallMutationApp,
  appHeaderFoundation: appHeaderFoundationApp,
  appMainContentLayout: appMainContentLayoutApp,
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
  linkInteraction: linkInteractionApp,
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
  responsiveBarFoundation: responsiveBarFoundationApp,
  scrollViewerFoundation: scrollViewerFoundationApp,
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
  tooltipFoundation: tooltipFoundationApp,
  contextMenuFoundation: contextMenuFoundationApp,
  dropdownMenuFoundation: dropdownMenuFoundationApp,
  cardFoundation: cardFoundationApp,
  fileInputFoundation: fileInputFoundationApp,
  fileUploadDropZoneFoundation: fileUploadDropZoneFoundationApp,
  flowTileFoundation: flowTileFoundationApp,
  footerFoundation: footerFoundationApp,
  timeInputFoundation: timeInputFoundationApp,
  stackFamilyFoundation: stackFamilyFoundationApp,
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

const params = new URLSearchParams(window.location.search);
if (params.has("__xmluiTestBed")) {
  const source = window.sessionStorage.getItem("__xmluiTestBedSource") ?? "<App />";
  try {
    const compiled = compileXmluiSource({
      id: "testbed.xmlui",
      source,
      extensions: [counterBadgeExtension],
    });
    throwFirstCompilerDiagnostic(compiled);
    renderXmluiApp(createXmluiModule(compiled.runtimeDocument, [], {
      extensions: [counterBadgeExtension],
    }), root, {
      extensions: [counterBadgeExtension],
      testProbe: (probe) => {
        window.__xmluiTestBedProbe = probe;
      },
    });
  } catch (error) {
    root.innerHTML = `<pre data-testid="xmlui-testbed-error">${escapeHtml(error instanceof Error ? error.message : String(error))}</pre>`;
  }
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
