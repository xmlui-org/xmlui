import { startApp } from "xmlui";
import playground from "xmlui-playground";
import search from "xmlui-search";

export const runtime = import.meta.glob(`/src/**`, { eager: true });
startApp(runtime, [playground, search]);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        startApp(newModule?.runtime, [playground, search]);
    });
}
