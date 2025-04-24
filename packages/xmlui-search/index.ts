import { startApp } from "xmlui";
import demo from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, demo);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, demo);
  });
}

export default demo;
