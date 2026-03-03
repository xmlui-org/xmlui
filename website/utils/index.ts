import { buildContentFromRuntime, shikiHighlighter, highlight } from "xmlui-docs-blocks";
import componentsSection from "../navSections/components.json";
import extensionsSection from "../navSections/extensions.json";
import extensions from "../extensions";
export { componentsSection, extensionsSection, extensions, shikiHighlighter, highlight };

// --- Load markdown content from the filesystem using Vite's glob import

const rawDocsContent: Record<string, { default: string }> = import.meta.glob(
  `/content/docs/**/*.{md,mdx}`,
  {
    eager: true,
    query: "?raw",
  },
);
const rawBlogContent: Record<string, { default: string }> = import.meta.glob(`/content/blog/*.md`, {
  eager: true,
  query: "?raw",
});

// Get home page markdown (e.g. WhyXMLUI), keyed by `/pages/<name>.md`
const rawHomepageContent: Record<string, { default: string }> = import.meta.glob(
  `/content/home/*.md`,
  {
    eager: true,
    query: "?raw",
  },
);

// --- Process the raw markdown content to extract frontmatter, generate plain text versions,
//     filter out drafts and transform keys to match URL structure, etc.

const { content: docsContent, plainTextContent: plainTextDocsContent } = buildContentFromRuntime(
  rawDocsContent,
  {
    // Strip "/content/docs/" so keys are "pages/intro.md", "reference/components/App", etc.
    contentPrefix: "/content/docs/",
  },
  { urlPrefix: "/docs/" }, // Prefix for plain text content keys, so they match the URL structure used in the app
) as unknown as {
  content: Record<string, string>;
  plainTextContent: Record<string, string>;
  frontmatter: Record<string, Record<string, unknown>>;
};

let {
  content: blogContent,
  plainTextContent: plainTextBlogContent,
  frontmatter: blogFrontmatter,
} = buildContentFromRuntime(
  rawBlogContent,
  {
    contentPrefix: "/content/blog/",
  },
  { urlPrefix: "/blog/" },
) as unknown as {
  content: Record<string, string>;
  plainTextContent: Record<string, string>;
  frontmatter: Record<string, Record<string, unknown>>;
};

plainTextBlogContent = Object.fromEntries(
  Object.entries(plainTextBlogContent).filter(([key]) => !(blogFrontmatter[key]?.draft === true)),
);

// Place the title (from frontmatter if available, otherwise derived from filename)
// at the top of the plain text content for each blog post, since the title is often important context
// for search results and may not be included in the body of the markdown.
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
// Filter out drafts from the main blogContent as well, so they don't show up in the UI
blogContent = Object.fromEntries(
  Object.entries(blogContent).filter(([key]) => {
    return !(blogFrontmatter[`/blog/${key}`]?.draft === true);
  }),
);

const prefetchedContent: Record<string, any> = {};

// Populate prefetched blog content
Object.keys(blogContent).forEach((fileName) => {
  prefetchedContent[`/blog/${fileName}.md`] = blogContent[fileName];
});

// Populate prefetched homepage content
Object.keys(rawHomepageContent).forEach((filePath) => {
  const fileName = filePath.split("/").pop() || "";
  prefetchedContent[`/pages/${fileName}`] = rawHomepageContent[filePath].default;
});

const staticSearchData = {
  ...Object.fromEntries(
    Object.entries(plainTextDocsContent).map(([key, value]) => [
      key,
      { content: value, meta: { category: "Docs" } },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(plainTextBlogContent).map(([key, value]) => [
      key,
      { content: value, meta: { category: "Blog" } },
    ]),
  ),
};
export { prefetchedContent, docsContent, staticSearchData };

// --- Icon loader utility

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
