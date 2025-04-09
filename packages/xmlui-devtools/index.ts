import { startApp } from "xmlui";
import DevTools from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, DevTools);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, DevTools);
  });
}

export default DevTools;
