import { renderXmluiApp } from "./runtime";
import counterBadgeExtension from "../../packages/xmlui-counter-badge/src";

import asyncDirectivesApp from "./examples/async-directives/Main.xmlui";
import asyncResponsiveLoopApp from "./examples/async-responsive-loop/Main.xmlui";
import asyncSequenceApp from "./examples/async-sequence/Main.xmlui";
import componentCounterApp from "./examples/counter-components/Main.xmlui";
import actionsCallApiApp from "./examples/actions-call-api/Main.xmlui";
import apiCallMutationApp from "./examples/api-call-mutation/Main.xmlui";
import builtinsInputsApp from "./examples/builtins-inputs/Main.xmlui";
import builtinsItemsApp from "./examples/builtins-items/Main.xmlui";
import builtinsLayoutApp from "./examples/builtins-layout/Main.xmlui";
import builtinsTaskFilterApp from "./examples/builtins-task-filter/Main.xmlui";
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
import layoutCoreApp from "./examples/layout-core/Main.xmlui";
import localCounterApp from "./examples/counter-local/Main.xmlui";
import reactiveDerivedBasicApp from "./examples/reactive-derived-basic/Main.xmlui";
import reactiveDerivedChainApp from "./examples/reactive-derived-chain/Main.xmlui";
import reactiveDerivedGlobalsApp from "./examples/reactive-derived-globals/Main.xmlui";
import reactiveDerivedOverrideApp from "./examples/reactive-derived-override/Main.xmlui";
import reactiveDerivedPropsApp from "./examples/reactive-derived-props/Main.xmlui";
import responsiveStateBasicsApp from "./examples/responsive-state-basics/Main.xmlui";
import routingBasicApp from "./examples/routing-basic/Main.xmlui";
import routingDataApp from "./examples/routing-data/Main.xmlui";
import routingQueryApp from "./examples/routing-query/Main.xmlui";
import routingStateApp from "./examples/routing-state/Main.xmlui";
import runtimeToastApp from "./examples/runtime-toast/Main.xmlui";
import styleMutationApp from "./examples/style-mutation/Main.xmlui";
import themeScopeApp from "./examples/theme-scope/Main.xmlui";
import themeVarsApp from "./examples/theme-vars/Main.xmlui";
import udcCombinedApp from "./examples/udc-combined/Main.xmlui";
import udcDefaultChildrenApp from "./examples/udc-default-children/Main.xmlui";
import udcEventEmissionApp from "./examples/udc-event-emission/Main.xmlui";
import udcMethodsApp from "./examples/udc-methods/Main.xmlui";
import udcSlotContextApp from "./examples/udc-slot-context/Main.xmlui";

const examples = {
  actionsCallApi: actionsCallApiApp,
  apiCallMutation: apiCallMutationApp,
  asyncDirectives: asyncDirectivesApp,
  asyncResponsiveLoop: asyncResponsiveLoopApp,
  asyncSequence: asyncSequenceApp,
  builtinsInputs: builtinsInputsApp,
  builtinsItems: builtinsItemsApp,
  builtinsLayout: builtinsLayoutApp,
  builtinsTaskFilter: builtinsTaskFilterApp,
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
  layoutCore: layoutCoreApp,
  local: localCounterApp,
  reactiveDerivedBasic: reactiveDerivedBasicApp,
  reactiveDerivedChain: reactiveDerivedChainApp,
  reactiveDerivedGlobals: reactiveDerivedGlobalsApp,
  reactiveDerivedOverride: reactiveDerivedOverrideApp,
  reactiveDerivedProps: reactiveDerivedPropsApp,
  responsiveStateBasics: responsiveStateBasicsApp,
  routingBasic: routingBasicApp,
  routingData: routingDataApp,
  routingQuery: routingQueryApp,
  routingState: routingStateApp,
  runtimeToast: runtimeToastApp,
  styleMutation: styleMutationApp,
  themeScope: themeScopeApp,
  themeVars: themeVarsApp,
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

const example = new URLSearchParams(window.location.search).get("example") ?? "globals";
renderXmluiApp(examples[example as keyof typeof examples] ?? globalCounterApp, root, {
  extensions: [counterBadgeExtension],
});
