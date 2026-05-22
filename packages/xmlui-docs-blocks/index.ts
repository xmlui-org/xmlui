import { startApp } from "xmlui";
import docs from "./src";
import { docsCodeHighlighter } from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
(window as any).__xmluiCodeHighlighter = docsCodeHighlighter;
startApp(runtime, [docs]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [docs]);
  });
}

export default docs;
