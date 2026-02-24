import {
  buildContentFromRuntime,
  buildTreeFromPathsAndMeta,
  shikiHighlighter,
  highlight,
  type TreeNode,
  type MetaJson,
} from "xmlui-docs-blocks";
import componentsSection from "../navSections/components.json";
import extensionsSection from "../navSections/extensions.json";
import extensions from "../extensions";
export { componentsSection, extensionsSection, extensions, shikiHighlighter, highlight };

// @ts-ignore
const contentRuntime: Record<string, { default: string }> = import.meta.glob(`/content/**/*.{md,mdx}`, {
  eager: true,
  query: "?raw",
});

// @ts-ignore
const metaJsons: Record<string, MetaJson> = import.meta.glob(`/content/**/_meta.json`, {
  eager: true,
});

const { content, plainTextContent, navPanelContent } = buildContentFromRuntime(contentRuntime);

export { content, plainTextContent };

export const groupedNavPanelContent = buildTreeFromPathsAndMeta(navPanelContent, metaJsons);

export function getLocalIcons() {
  const icons: Record<string, string> = import.meta.glob(`/icons/**/*.svg`, {
    import: "default",
    eager: true,
    query: "?raw",
  });
  const processedIcons: Record<string, string> = {};
  Object.entries(icons).forEach(([key, value]) => {
    const iconName =
      key
        .split("/")
        .pop()
        ?.replace(/\.svg$/, "") || "";
    processedIcons[iconName] = value;
  });
  return processedIcons;
}
