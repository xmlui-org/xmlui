import { startApp } from "xmlui";
import search from "xmlui-search";
import helloWorld from "xmlui-hello-world";
import websiteBlocks from "xmlui-website-blocks";
import docsBlocks from "xmlui-docs-blocks";

export const runtime = import.meta.glob(`/src/**`, { eager: true });

const coreExtensions = [search, helloWorld, websiteBlocks, docsBlocks];

const extensionLoaders = {
    echart: () => import("xmlui-echart"),
    calendar: () => import("xmlui-calendar"),
    gauge: () => import("xmlui-gauge"),
    masonry: () => import("xmlui-masonry"),
    tiptap: () => import("xmlui-tiptap-editor"),
    gridLayout: () => import("xmlui-grid-layout"),
} as const;

type ExtensionKey = keyof typeof extensionLoaders;

const loadedExtensionKeys = new Set<ExtensionKey>();
const loadedExtensions = [...coreExtensions];
const loadPromises = new Map<ExtensionKey, Promise<void>>();

function getRequiredExtensions(pathname: string): ExtensionKey[] {
    const required = new Set<ExtensionKey>();

    if (
        pathname.includes("/xmlui-echart") ||
        pathname.includes("/wrap-component/echarts") ||
        pathname.includes("/use-echarts") ||
        pathname.includes("/tutorial-05")
    ) {
        required.add("echart");
    }
    if (pathname.includes("/xmlui-calendar") || pathname.includes("/wrap-component/bigcalendar") || pathname.includes("/wrap-component/calendar-theme")) {
        required.add("calendar");
    }
    if (pathname.includes("/xmlui-gauge") || pathname.includes("/wrap-component/gauge-theme")) {
        required.add("gauge");
    }
    if (pathname.includes("/xmlui-masonry") || pathname.includes("/wrap-component/masonry") || pathname.includes("/build-a-responsive-masonry-layout")) {
        required.add("masonry");
    }
    if (pathname.includes("/xmlui-tiptap-editor") || pathname.includes("/wrap-component/tiptap") || pathname.includes("/configure-a-tiptapeditor-toolbar")) {
        required.add("tiptap");
    }
    if (pathname.includes("/xmlui-grid-layout") || pathname.includes("/wrap-component/grid-layout")) {
        required.add("gridLayout");
    }

    return [...required];
}

async function ensureExtensionsForPath(pathname: string) {
    const required = getRequiredExtensions(pathname);
    const pendingLoads = required
        .filter((key) => !loadedExtensionKeys.has(key))
        .map((key) => {
            const existing = loadPromises.get(key);
            if (existing) return existing;

            const promise = extensionLoaders[key]().then((module) => {
                loadedExtensionKeys.add(key);
                loadedExtensions.push(module.default ?? module);
            });
            loadPromises.set(key, promise);
            return promise;
        });

    await Promise.all(pendingLoads);
    return pendingLoads.length > 0;
}

let bootToken = 0;

async function boot(currentRuntime: typeof runtime, pathname = window.location.pathname) {
    const token = ++bootToken;
    await ensureExtensionsForPath(pathname);
    if (token !== bootToken) return;
    startApp(currentRuntime, loadedExtensions);
}

function installNavigationWatcher(currentRuntime: typeof runtime) {
    let lastPathname = window.location.pathname;

    const syncForNavigation = async () => {
        const nextPathname = window.location.pathname;
        if (nextPathname === lastPathname) return;
        lastPathname = nextPathname;

        const loadedNewExtensions = await ensureExtensionsForPath(nextPathname);
        if (loadedNewExtensions) {
            void boot(currentRuntime, nextPathname);
        }
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
        const result = originalPushState(...args);
        void syncForNavigation();
        return result;
    };

    window.history.replaceState = function (...args) {
        const result = originalReplaceState(...args);
        void syncForNavigation();
        return result;
    };

    window.addEventListener("popstate", () => {
        void syncForNavigation();
    });
}

installNavigationWatcher(runtime);
void boot(runtime);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        void boot(newModule?.runtime ?? runtime);
    });
}
