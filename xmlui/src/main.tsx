import { renderXmluiApp } from "./runtime";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compiler/compileXmluiSource";
import { createXmluiModule } from "./runtime";
import counterBadgeExtension from "../../packages/xmlui-counter-badge/src";
import "./global.css";
import "./components/HtmlTags/HtmlTags.module.scss?xmlui-css-module";
import "./components/IFrame/IFrame.module.scss?xmlui-css-module";
import "./components/Image/Image.module.scss?xmlui-css-module";
import "./components/CodeBlock/CodeBlock.module.scss?xmlui-css-module";
import "./components/ContentSeparator/ContentSeparator.module.scss?xmlui-css-module";
import "./components/List/List.module.scss?xmlui-css-module";
import "./components/Link/Link.module.scss?xmlui-css-module";
import "./components/NoResult/NoResult.module.scss?xmlui-css-module";
import "./components/QRCode/QRCode.module.scss?xmlui-css-module";
import "./components/SpaceFiller/SpaceFiller.module.scss?xmlui-css-module";
import "./components/Stack/Stack.module.scss?xmlui-css-module";
import "./components/TextBox/TextBox.module.scss?xmlui-css-module";
import "./components/TextArea/TextArea.module.scss?xmlui-css-module";
import "./components/NumberBox/NumberBox.module.scss?xmlui-css-module";
import "./components/Checkbox/Checkbox.module.scss?xmlui-css-module";
import "./components/Switch/Switch.module.scss?xmlui-css-module";
import "./components/RatingInput/RatingInput.module.scss?xmlui-css-module";
import "./components/Slider/Slider.module.scss?xmlui-css-module";
import "./components/ColorPicker/ColorPicker.module.scss?xmlui-css-module";
import "./components/DateInput/DateInput.module.scss?xmlui-css-module";
import "./components/DatePicker/DatePicker.module.scss?xmlui-css-module";
import "./components/AutoComplete/AutoComplete.module.scss?xmlui-css-module";
import "./components/FileInput/FileInput.module.scss?xmlui-css-module";
import "./components/FileUploadDropZone/FileUploadDropZone.module.scss?xmlui-css-module";
import "./components/FlowLayout/FlowLayout.module.scss?xmlui-css-module";
import "./components/Pagination/Pagination.module.scss?xmlui-css-module";
import "./components/RadioGroup/RadioGroup.module.scss?xmlui-css-module";
import "./components/Select/Select.module.scss?xmlui-css-module";
import "./components/Stack/Stack.module.scss?xmlui-css-module";
import "./components/Table/Table.module.scss?xmlui-css-module";
import "./components/TableOfContents/TableOfContents.module.scss?xmlui-css-module";
import "./components/TileGrid/TileGrid.module.scss?xmlui-css-module";
import "./components/TimeInput/TimeInput.module.scss?xmlui-css-module";
import "./components/Tree/TreeComponent.module.scss?xmlui-css-module";
import "./components/TreeDisplay/TreeDisplay.module.scss?xmlui-css-module";

import asyncDirectivesApp from "./examples/async-directives/Main.xmlui";
import asyncResponsiveLoopApp from "./examples/async-responsive-loop/Main.xmlui";
import asyncSequenceApp from "./examples/async-sequence/Main.xmlui";
import componentCounterApp from "./examples/counter-components/Main.xmlui";
import actionsCallApiApp from "./examples/actions-call-api/Main.xmlui";
import apiCallMutationApp from "./examples/api-call-mutation/Main.xmlui";
import appMainContentLayoutApp from "./examples/app-main-content-layout/Main.xmlui";
import builtinsInputsApp from "./examples/builtins-inputs/Main.xmlui";
import builtinsItemsApp from "./examples/builtins-items/Main.xmlui";
import builtinsLayoutApp from "./examples/builtins-layout/Main.xmlui";
import builtinsTaskFilterApp from "./examples/builtins-task-filter/Main.xmlui";
import buttonCompatibilityApp from "./examples/button-compatibility/Main.xmlui";
import codeBlockFoundationApp from "./examples/code-block-foundation/Main.xmlui";
import generatedOutputApp from "./examples/generated-output/Main.xmlui";
import emptyFallbackStatesApp from "./examples/empty-fallback-states/Main.xmlui";
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
import layoutCoreApp from "./examples/layout-core/Main.xmlui";
import localCounterApp from "./examples/counter-local/Main.xmlui";
import reactiveDerivedBasicApp from "./examples/reactive-derived-basic/Main.xmlui";
import reactiveDerivedChainApp from "./examples/reactive-derived-chain/Main.xmlui";
import reactiveDerivedGlobalsApp from "./examples/reactive-derived-globals/Main.xmlui";
import reactiveDerivedOverrideApp from "./examples/reactive-derived-override/Main.xmlui";
import reactiveDerivedPropsApp from "./examples/reactive-derived-props/Main.xmlui";
import primitiveTextHeadingApp from "./examples/primitive-text-heading/Main.xmlui";
import responsiveStateBasicsApp from "./examples/responsive-state-basics/Main.xmlui";
import routingBasicApp from "./examples/routing-basic/Main.xmlui";
import routingDataApp from "./examples/routing-data/Main.xmlui";
import routingQueryApp from "./examples/routing-query/Main.xmlui";
import routingStateApp from "./examples/routing-state/Main.xmlui";
import runtimeToastApp from "./examples/runtime-toast/Main.xmlui";
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
import fileInputFoundationApp from "./examples/file-input-foundation/Main.xmlui";
import fileUploadDropZoneFoundationApp from "./examples/file-upload-drop-zone-foundation/Main.xmlui";
import flowTileFoundationApp from "./examples/flow-tile-foundation/Main.xmlui";
import timeInputFoundationApp from "./examples/time-input-foundation/Main.xmlui";
import stackFamilyFoundationApp from "./examples/stack-family-foundation/Main.xmlui";
import tableFoundationApp from "./examples/table-foundation/Main.xmlui";
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
  apiCallMutation: apiCallMutationApp,
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
  layoutCore: layoutCoreApp,
  local: localCounterApp,
  reactiveDerivedBasic: reactiveDerivedBasicApp,
  reactiveDerivedChain: reactiveDerivedChainApp,
  reactiveDerivedGlobals: reactiveDerivedGlobalsApp,
  reactiveDerivedOverride: reactiveDerivedOverrideApp,
  reactiveDerivedProps: reactiveDerivedPropsApp,
  primitiveTextHeading: primitiveTextHeadingApp,
  responsiveStateBasics: responsiveStateBasicsApp,
  routingBasic: routingBasicApp,
  routingData: routingDataApp,
  routingQuery: routingQueryApp,
  routingState: routingStateApp,
  runtimeToast: runtimeToastApp,
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
  fileInputFoundation: fileInputFoundationApp,
  fileUploadDropZoneFoundation: fileUploadDropZoneFoundationApp,
  flowTileFoundation: flowTileFoundationApp,
  timeInputFoundation: timeInputFoundationApp,
  stackFamilyFoundation: stackFamilyFoundationApp,
  tableFoundation: tableFoundationApp,
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
