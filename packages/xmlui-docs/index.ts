import { startApp } from "xmlui";
import docs from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [docs]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [docs]);
  });
}

export default docs;
