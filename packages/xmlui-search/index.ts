import { startApp } from "xmlui";
import Search from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, Search);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, Search);
  });
}
