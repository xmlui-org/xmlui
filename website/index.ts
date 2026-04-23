import { startApp } from "xmlui";
import search from "xmlui-search";
import helloWorld from "xmlui-hello-world";
import websiteBlocks from "xmlui-website-blocks";
import docsBlocks from "xmlui-docs-blocks";

export const runtime = import.meta.glob(`/src/**`, { eager: true });

async function loadExtensionsForPath(pathname: string) {
    const extensions = [search, helloWorld, websiteBlocks, docsBlocks];
    const dynamicImports: Promise<any>[] = [];

    if (pathname.includes("/xmlui-echart") || pathname.includes("/wrap-component/echarts") || pathname.includes("/use-echarts")) {
        dynamicImports.push(import("xmlui-echart"));
    }
    if (pathname.includes("/wrap-component/bigcalendar") || pathname.includes("/wrap-component/calendar-theme")) {
        dynamicImports.push(import("xmlui-calendar"));
    }
    if (pathname.includes("/xmlui-gauge") || pathname.includes("/wrap-component/gauge-theme")) {
        dynamicImports.push(import("xmlui-gauge"));
    }
    if (pathname.includes("/xmlui-masonry") || pathname.includes("/wrap-component/masonry")) {
        dynamicImports.push(import("xmlui-masonry"));
    }
    if (pathname.includes("/xmlui-tiptap-editor") || pathname.includes("/wrap-component/tiptap")) {
        dynamicImports.push(import("xmlui-tiptap-editor"));
    }
    if (pathname.includes("/xmlui-grid-layout") || pathname.includes("/wrap-component/grid-layout")) {
        dynamicImports.push(import("xmlui-grid-layout"));
    }

    const loaded = await Promise.all(dynamicImports);
    return [...extensions, ...loaded.map((module) => module.default ?? module)];
}

async function boot(currentRuntime: typeof runtime) {
    const pathname = window.location.pathname;
    const usedExtensions = await loadExtensionsForPath(pathname);
    startApp(currentRuntime, usedExtensions);
}

void boot(runtime);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        void boot(newModule?.runtime ?? runtime);
    });
}
