import { mountXmluiApp } from "../runtime";

import counterComponentsApp from "../../standalone-samples/counter-components/Main.xmlui";
import routingStateApp from "../../standalone-samples/routing-state/Main.xmlui";
import styleMutationApp from "../../standalone-samples/style-mutation/Main.xmlui";

const examples = {
  counterComponents: counterComponentsApp,
  routingState: routingStateApp,
  styleMutation: styleMutationApp,
};

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

const example =
  root.dataset.xmluiExample ??
  new URLSearchParams(window.location.search).get("example") ??
  "counterComponents";
const initialUrl = root.dataset.xmluiSsgPath;
mountXmluiApp(examples[example as keyof typeof examples] ?? counterComponentsApp, root, {
  hydrate: root.dataset.xmluiSsg === "true",
  initialUrl,
});
