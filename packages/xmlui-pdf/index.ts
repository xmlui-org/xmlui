import { startApp } from "xmlui";
import pdf from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [pdf]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime);
  });
}
