import { renderXmluiApp } from "./runtime";

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

const examples = {
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
};

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const example = new URLSearchParams(window.location.search).get("example") ?? "globals";
renderXmluiApp(examples[example as keyof typeof examples] ?? globalCounterApp, root);
