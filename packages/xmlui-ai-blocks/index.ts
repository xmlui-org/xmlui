import { startApp } from "xmlui";
import aiBlocks from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, aiBlocks);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, aiBlocks);
  });
}

export default aiBlocks;
