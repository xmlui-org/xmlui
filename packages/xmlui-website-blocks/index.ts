import { startApp } from "xmlui";
import websites from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [websites]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [websites]);
  });
}

export default websites;
