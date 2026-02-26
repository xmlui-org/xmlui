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
const docsContentRuntime: Record<string, { default: string }> = import.meta.glob(
  `/content/docs/**/*.{md,mdx}`,
  {
    eager: true,
    query: "?raw",
  },
);

const blogContentRuntime: Record<string, { default: string }> = import.meta.glob(
  `/content/blog/**/*.{md,mdx}`,
  {
    eager: true,
    query: "?raw",
  },
);

// @ts-ignore
const metaJsons: Record<string, MetaJson> = import.meta.glob(`/content/docs/**/_meta.json`, {
  eager: true,
});

const {
  content: docsContent,
  plainTextContent: plainTextDocsContent,
  navPanelContent,
} = buildContentFromRuntime(
  docsContentRuntime,
  {
    // Strip "/content/docs/" so keys are "pages/intro.md", "reference/components/App", etc.
    contentPrefix: "/content/docs/",
  },
  { urlPrefix: "/docs/" }, // Prefix for plain text content keys, so they match the URL structure used in the app
);

const { plainTextContent: plainTextBlogContent } = buildContentFromRuntime(
  blogContentRuntime,
  {
    contentPrefix: "/content/blog/",
  },
  { urlPrefix: "/blog/" },
);
// TEMP: For now, we need to generate titles for the blog search results based on the keys ofd plaintTextBlogContent.
// These come from the file paths of the blog markdown files, so we can generate them by stripping the prefix and suffix from the keys.
Object.keys(plainTextBlogContent).forEach((key) => {
  const title = key
    .replace("/blog/", "")
    .replace(/\.mdx?$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  plainTextBlogContent[key] = `${title}\n\n${plainTextBlogContent[key]}`;
});

// Prefetched blog markdown content, now loaded from /content/blog,
// but still keyed by `/blog/<slug>.md` to match BlogPage expectations.
// @ts-ignore
const blogPagesRuntime: Record<string, any> = import.meta.glob(`/content/blog/*.md`, {
  eager: true,
  query: "?raw",
});

// Prefetched home page markdown (e.g. WhyXMLUI), keyed by `/pages/<name>.md`.
// @ts-ignore
const homePagesRuntime: Record<string, any> = import.meta.glob(`/content/home/*.md`, {
  eager: true,
  query: "?raw",
});

export const prefetchedContent: Record<string, any> = {};
Object.keys(blogPagesRuntime).map((filePath) => {
  const fileName = filePath.split("/").pop() || "";
  const urlFragment = `/blog/${fileName}`;
  prefetchedContent[urlFragment] = blogPagesRuntime[filePath].default;
});
Object.keys(homePagesRuntime).map((filePath) => {
  const fileName = filePath.split("/").pop() || "";
  prefetchedContent[`/pages/${fileName}`] = homePagesRuntime[filePath].default;
});

export { docsContent, plainTextDocsContent, plainTextBlogContent };

export const groupedNavPanelContent = buildTreeFromPathsAndMeta(navPanelContent, metaJsons, {
  // Root of the docs content tree
  contentRoot: "/content/docs",
});

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
