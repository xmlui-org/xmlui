import { buildContentFromRuntime, shikiHighlighter, highlight } from "xmlui-docs-blocks";
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
  `/content/blog/*.md`,
  {
    eager: true,
    query: "?raw",
  },
);

const { content: docsContent, plainTextContent: plainTextDocsContent } = buildContentFromRuntime(
  docsContentRuntime,
  {
    // Strip "/content/docs/" so keys are "pages/intro.md", "reference/components/App", etc.
    contentPrefix: "/content/docs/",
  },
  { urlPrefix: "/docs/" }, // Prefix for plain text content keys, so they match the URL structure used in the app
);

let {
  content: blogContent,
  plainTextContent: plainTextBlogContent,
  frontmatter: blogFrontmatter,
} = buildContentFromRuntime(
  blogContentRuntime,
  {
    contentPrefix: "/content/blog/",
  },
  { urlPrefix: "/blog/" },
);

plainTextBlogContent = Object.fromEntries(
  Object.entries(plainTextBlogContent).filter(([key]) => !(blogFrontmatter[key]?.draft === true)),
);
Object.keys(plainTextBlogContent).forEach((key) => {
  const title = key
    .replace("/blog/", "")
    .replace(/\.mdx?$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  plainTextBlogContent[key] =
    `${blogFrontmatter[key]?.title ?? title}\n\n${plainTextBlogContent[key]}`;
});

blogContent = Object.fromEntries(
  Object.entries(blogContent).filter(([key]) => {
    return !(blogFrontmatter[`/blog/${key}`]?.draft === true);
  }),
);

// Prefetched home page markdown (e.g. WhyXMLUI), keyed by `/pages/<name>.md`.
// @ts-ignore
const homePagesRuntime: Record<string, any> = import.meta.glob(`/content/home/*.md`, {
  eager: true,
  query: "?raw",
});

export const prefetchedContent: Record<string, any> = {};
Object.keys(blogContent).map((fileName) => {
  const urlFragment = `/blog/${fileName}.md`;
  prefetchedContent[urlFragment] = blogContent[fileName];
});

Object.keys(homePagesRuntime).map((filePath) => {
  const fileName = filePath.split("/").pop() || "";
  prefetchedContent[`/pages/${fileName}`] = homePagesRuntime[filePath].default;
});

export { docsContent, plainTextDocsContent, plainTextBlogContent };

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
