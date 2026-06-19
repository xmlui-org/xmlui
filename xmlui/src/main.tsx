import { renderXmluiApp } from "./runtime";

import asyncDirectivesApp from "./examples/async-directives/Main.xmlui";
import asyncResponsiveLoopApp from "./examples/async-responsive-loop/Main.xmlui";
import asyncSequenceApp from "./examples/async-sequence/Main.xmlui";
import componentCounterApp from "./examples/counter-components/Main.xmlui";
import broaderExpressionsApp from "./examples/broader-expressions/Main.xmlui";
import expressionUpdateComponentsApp from "./examples/expression-update-components/Main.xmlui";
import expressionUpdatesApp from "./examples/expression-updates/Main.xmlui";
import globalCounterApp from "./examples/counter-globals/Main.xmlui";
import handlerAssignmentsApp from "./examples/handler-assignments/Main.xmlui";
import handlerConditionalsApp from "./examples/handler-conditionals/Main.xmlui";
import handlerLocalsApp from "./examples/handler-locals/Main.xmlui";
import handlerLoopsApp from "./examples/handler-loops/Main.xmlui";
import localCounterApp from "./examples/counter-local/Main.xmlui";
import reactiveDerivedBasicApp from "./examples/reactive-derived-basic/Main.xmlui";
import reactiveDerivedChainApp from "./examples/reactive-derived-chain/Main.xmlui";
import reactiveDerivedGlobalsApp from "./examples/reactive-derived-globals/Main.xmlui";
import reactiveDerivedOverrideApp from "./examples/reactive-derived-override/Main.xmlui";
import reactiveDerivedPropsApp from "./examples/reactive-derived-props/Main.xmlui";
import udcCombinedApp from "./examples/udc-combined/Main.xmlui";
import udcDefaultChildrenApp from "./examples/udc-default-children/Main.xmlui";
import udcEventEmissionApp from "./examples/udc-event-emission/Main.xmlui";
import udcMethodsApp from "./examples/udc-methods/Main.xmlui";
import udcSlotContextApp from "./examples/udc-slot-context/Main.xmlui";

const examples = {
  asyncDirectives: asyncDirectivesApp,
  asyncResponsiveLoop: asyncResponsiveLoopApp,
  asyncSequence: asyncSequenceApp,
  components: componentCounterApp,
  expressions: broaderExpressionsApp,
  expressionComponents: expressionUpdateComponentsApp,
  expressionUpdates: expressionUpdatesApp,
  globals: globalCounterApp,
  handlerAssignments: handlerAssignmentsApp,
  handlerConditionals: handlerConditionalsApp,
  handlerLocals: handlerLocalsApp,
  handlerLoops: handlerLoopsApp,
  local: localCounterApp,
  reactiveDerivedBasic: reactiveDerivedBasicApp,
  reactiveDerivedChain: reactiveDerivedChainApp,
  reactiveDerivedGlobals: reactiveDerivedGlobalsApp,
  reactiveDerivedOverride: reactiveDerivedOverrideApp,
  reactiveDerivedProps: reactiveDerivedPropsApp,
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
renderXmluiApp(examples[example as keyof typeof examples] ?? globalCounterApp, root);
