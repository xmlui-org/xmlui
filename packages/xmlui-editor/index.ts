import { startApp } from "xmlui";
import editor from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [editor]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [editor]);
  });
}

export default editor;
