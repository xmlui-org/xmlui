import { startApp } from "xmlui";
import dndList from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [dndList]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [dndList]);
  });
}

export default dndList;
