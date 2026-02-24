import { buildContentFromRuntime, buildTreeFromPathsAndMeta } from "xmlui-docs-blocks";

// @ts-ignore
const contentRuntime: Record<string, { default: string }> = import.meta.glob(`/content/**/*.{md,mdx}`, {
  eager: true,
  query: "?raw",
});

// @ts-ignore
const metaJsons: Record<string, unknown> = import.meta.glob(`/content/**/_meta.json`, {
  eager: true,
});

const { content, plainTextContent, navPanelContent } = buildContentFromRuntime(contentRuntime);

export const groupedNavPanelContent = buildTreeFromPathsAndMeta(navPanelContent, metaJsons);

export { content, plainTextContent };

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
