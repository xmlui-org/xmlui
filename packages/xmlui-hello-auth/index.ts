import { startApp } from "xmlui";
import HelloAuth from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, HelloAuth);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, HelloAuth);
  });
}
