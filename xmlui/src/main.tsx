import { renderXmluiApp } from "./runtime";
import { compileXmluiSource, throwFirstCompilerDiagnostic } from "./compiler/compileXmluiSource";
import { createXmluiModule } from "./runtime";
import counterBadgeExtension from "../../packages/xmlui-counter-badge/src";

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
import broaderExpressionsApp from "./examples/broader-expressions/Main.xmlui";
import dataSourceMockApp from "./examples/data-source-mock/Main.xmlui";
import dataSourceRefetchApp from "./examples/data-source-refetch/Main.xmlui";
import expressionUpdateComponentsApp from "./examples/expression-update-components/Main.xmlui";
import expressionUpdatesApp from "./examples/expression-updates/Main.xmlui";
import eventTagHandlerApp from "./examples/event-tag-handler/Main.xmlui";
import extensionCounterBadgeApp from "./examples/extension-counter-badge/Main.xmlui";
import globalCounterApp from "./examples/counter-globals/Main.xmlui";
import handlerAssignmentsApp from "./examples/handler-assignments/Main.xmlui";
import handlerConditionalsApp from "./examples/handler-conditionals/Main.xmlui";
import handlerLocalsApp from "./examples/handler-locals/Main.xmlui";
import handlerLoopsApp from "./examples/handler-loops/Main.xmlui";
import headingOldCompatibilityApp from "./examples/heading-old-compatibility/Main.xmlui";
import htmlTagsFragmentApp from "./examples/html-tags-fragment/Main.xmlui";
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
  components: componentCounterApp,
  dataSourceMock: dataSourceMockApp,
  dataSourceRefetch: dataSourceRefetchApp,
  expressions: broaderExpressionsApp,
  expressionComponents: expressionUpdateComponentsApp,
  expressionUpdates: expressionUpdatesApp,
  eventTagHandler: eventTagHandlerApp,
  extensionCounterBadge: extensionCounterBadgeApp,
  globals: globalCounterApp,
  handlerAssignments: handlerAssignmentsApp,
  handlerConditionals: handlerConditionalsApp,
  handlerLocals: handlerLocalsApp,
  handlerLoops: handlerLoopsApp,
  headingOldCompatibility: headingOldCompatibilityApp,
  htmlTagsFragment: htmlTagsFragmentApp,
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
