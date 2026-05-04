import { startApp } from "xmlui";
import search from "xmlui-search";
import websiteBlocks from "xmlui-website-blocks";
import docsBlocks from "xmlui-docs-blocks";
import echart from "xmlui-echart";
import calendar from "xmlui-calendar";
import gauge from "xmlui-gauge";
import gridLayout from "xmlui-grid-layout";
import masonry from "xmlui-masonry";
import tiptap from "xmlui-tiptap-editor";

export const runtime = import.meta.glob(`/src/**`, { eager: true });
const usedExtensions = [
    search,
    websiteBlocks,
    docsBlocks,
    echart,
    calendar,
    gauge,
    gridLayout,
    masonry,
    tiptap,
];

startApp(runtime, usedExtensions);

if (import.meta.hot) {
    import.meta.hot.accept((newModule) => {
        startApp(newModule?.runtime ?? runtime, usedExtensions);
    });
}
