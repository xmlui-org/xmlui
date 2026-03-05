import "@mantine/core/styles.css";
import { startApp } from "xmlui";
import dnd from "./src";

export const runtime = import.meta.glob(`/demo/**`, { eager: true });
startApp(runtime, [dnd]);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime, [dnd]);
  });
}

export default dnd;
