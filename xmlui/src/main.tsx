import { renderXmluiApp } from "./runtime";

// Switch this import while manually trying the first experiment:
// - ./examples/counter-local/Main.xmlui
// - ./examples/counter-components/Main.xmlui
// - ./examples/counter-globals/Main.xmlui
import app from "./examples/counter-globals/Main.xmlui";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Missing #root element");
}

renderXmluiApp(app, root);
