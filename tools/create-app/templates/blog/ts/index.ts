import { startApp } from "xmlui";
import search from "xmlui-search";
import docsBlocks from "xmlui-docs-blocks";

export const runtime = import.meta.glob(`/src/**`, { eager: true });
const usedExtensions = [search, docsBlocks];
startApp(runtime, usedExtensions);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        startApp(newModule?.runtime ?? runtime, usedExtensions);
    });
}
