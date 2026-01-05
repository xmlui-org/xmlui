import { startApp } from "xmlui";
import usedExtensions from "./extensions";

export const runtime = import.meta.glob(`/src/**`, { eager: true });

startApp(runtime, usedExtensions);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        startApp(newModule?.runtime, usedExtensions);
    });
}
