import { startApp } from "xmlui";
import search from "xmlui-search";
import websiteBlocks from "xmlui-website-blocks";
import docsBlocks from "xmlui-docs-blocks";
import masonry from "xmlui-masonry";
import gauge from "xmlui-gauge";
import echart from "xmlui-echart";
import calendar from "xmlui-calendar";
import gridLayout from "xmlui-grid-layout";
import tiptapEditor from "xmlui-tiptap-editor";

export const runtime = import.meta.glob("/src/**", { eager: true });
const usedExtensions = [
  search,
  websiteBlocks,
  docsBlocks,
  masonry,
  gauge,
  echart,
  calendar,
  gridLayout,
  tiptapEditor,
];

startApp(runtime, usedExtensions);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    startApp(newModule?.runtime ?? runtime, usedExtensions);
  });
}
