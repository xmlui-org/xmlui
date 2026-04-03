import { startApp } from "xmlui";
import crmBlocks from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, crmBlocks);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, crmBlocks);
  });
}

export default crmBlocks;
