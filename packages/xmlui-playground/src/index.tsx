import { playgroundComponentRenderer } from "./playground/Playground";
import { standalonePlaygroundComponentRenderer } from "./playground/StandalonePlayground";

export default {
  namespace: "XMLUIExtensions",
  components: [playgroundComponentRenderer, standalonePlaygroundComponentRenderer],
};
