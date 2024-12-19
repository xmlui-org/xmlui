import { startApp } from "xmlui";
import components from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, components);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, components);
  });
}
