import { startApp } from "xmlui";
import devtools from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [devtools]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [devtools]);
  });
}

export default devtools;
