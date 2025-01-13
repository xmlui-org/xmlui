import { startApp } from "xmlui";
import animations from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [animations]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime);
  });
}
