import { startApp } from "xmlui";
import Playground from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, Playground);


if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, Playground);
  });
}
