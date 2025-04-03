import { startApp } from "xmlui";
import spreadsheet from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [spreadsheet]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [spreadsheet]);
  });
}

export default spreadsheet;
