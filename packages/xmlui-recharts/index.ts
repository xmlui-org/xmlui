import { startApp } from "xmlui";
import recharts from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [recharts]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [recharts]);
  });
}

export default recharts;
