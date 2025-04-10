import { devToolsComponentRenderer } from "./devtools/DevTools";
import { Editor as editor } from "./editor/Editor";

export default {
  namespace: "XMLUIDevtools",
  components: [devToolsComponentRenderer, editor],
};

export const Editor = editor;

