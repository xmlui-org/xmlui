import { startApp } from "xmlui";
import HelloWorld from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, HelloWorld);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, HelloWorld);
  });
}
