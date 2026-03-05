import { startApp } from "xmlui";
import Select from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, Select);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, Select);
  });
}
