import { startApp } from "xmlui";
import charts from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, charts);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, charts);
  });
}
