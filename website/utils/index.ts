import {
  buildContentFromRuntime,
  buildTreeFromPathsAndMeta,
  shikiHighlighter,
  highlight,
} from "xmlui-docs-blocks";
import componentsSection from "../navSections/components.json";
import extensionsSection from "../navSections/extensions.json";
import extensions from "../extensions";
export { componentsSection, extensionsSection, extensions, shikiHighlighter, highlight };

// Load only docs content from /content/docs and normalize keys to start at "pages/..."
// @ts-ignore
const contentRuntime: Record<string, { default: string }> = import.meta.glob(
  `/content/docs/**/*.{md,mdx}`,
  {
    eager: true,
    query: "?raw",
  },
);

// @ts-ignore
const metaJsons: Record<string, MetaJson> = import.meta.glob(
  `/content/docs/**/_meta.json`,
  {
    eager: true,
  },
);

const { content, plainTextContent, navPanelContent } = buildContentFromRuntime(
  contentRuntime,
  {
    // Strip "/content/docs/" so keys are "pages/intro.md", "components/App", etc.
    contentPrefix: "/content/docs/",
  },
);

// Prefetched blog markdown content, now loaded from /content/blog,
// but still keyed by `/blog/<slug>.md` to match BlogPage expectations.
// @ts-ignore
const blogPagesRuntime: Record<string, any> = import.meta.glob(
  `/content/blog/*.md`,
  {
    eager: true,
    query: "?raw",
  },
);

export const prefetchedContent: Record<string, any> = {};
Object.keys(blogPagesRuntime).map((filePath) => {
  const fileName = filePath.split("/").pop() || "";
  const urlFragment = `/blog/${fileName}`;
  prefetchedContent[urlFragment] = blogPagesRuntime[filePath].default;
});

export { content, plainTextContent };

export const groupedNavPanelContent = buildTreeFromPathsAndMeta(
  navPanelContent,
  metaJsons,
  {
    // Root of the docs content tree
    contentRoot: "/content/docs",
  },
);

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
