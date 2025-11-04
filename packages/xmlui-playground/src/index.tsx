import { playgroundComponentRenderer } from "./playground/Playground";
import { standalonePlaygroundComponentRenderer } from "./playground/StandalonePlayground";
import { playgroundHeaderRenderer } from "./playground/Header/Header";
import { themeSwitcherRenderer } from "./playground/ThemeSwitcher/ThemeSwitcher";
import { playgroundContentRenderer } from "./playground/PlaygroundContent/PlaygroundContent";
import { previewRenderer } from "./playground/Preview/Preview";
import { editorRenderer } from "./playground/Editor/Editor";

export default {
  namespace: "XMLUIExtensions",
  components: [
    editorRenderer,
    previewRenderer,
    playgroundHeaderRenderer,
    playgroundComponentRenderer,
    standalonePlaygroundComponentRenderer,
    themeSwitcherRenderer,
    playgroundContentRenderer,
  ],
};
