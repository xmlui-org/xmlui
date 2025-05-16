import { startApp } from "xmlui";
import playground from "xmlui-playground";
export const runtime = import.meta.glob(`/src/**`, { eager: true });
startApp(runtime, [playground]);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        startApp(newModule?.runtime, [playground]);
    });
}
