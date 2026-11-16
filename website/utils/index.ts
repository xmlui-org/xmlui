import {
  buildContentFromRuntime,
  docsCodeHighlighter,
  shikiHighlighter,
  highlight,
} from "xmlui-docs-blocks";
import { type SearchItemData, SEARCH_CATEGORIES } from "xmlui";
import componentsSection from "../navSections/components.json";
import extensionsSection from "../navSections/extensions.json";
export { componentsSection, extensionsSection, docsCodeHighlighter, shikiHighlighter, highlight };

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

// Docs search keys come from content file paths ("pages/markup.md" -> "/docs/markup"), but
// src/Main.xmlui serves some of those pages under /docs/guides/. Each entry maps a derived
// path (and anything below it) to the route its Page uses; keep in sync with Main.xmlui.
const GUIDE_PAGES = [
  "app-structure",
  "forms",
  "hosted-deployment",
  "layout",
  "markup",
  "modal-dialogs",
  "playground-and-codefence",
  "refactoring",
  "routing-and-links",
  "scoping",
  "scripting",
  "user-defined-components",
  "visibility",
  "working-with-markdown",
  "working-with-text",
];
const DOCS_ROUTE_PREFIXES: [string, string][] = [
  ["/docs/wrap-component/_overview", "/docs/guides/wrap-component"],
  ["/docs/wrap-component", "/docs/guides/wrap-component"],
  ...GUIDE_PAGES.map((page): [string, string] => [`/docs/${page}`, `/docs/guides/${page}`]),
];

// Content files that no Page in src/Main.xmlui serves (stale copies, drafts, unrouted pages).
// They are left out of search so results never lead to a missing page.
const DOCS_SEARCH_EXCLUDED = [
  "/docs/news-and-reviews",
  "/docs/reference-extensions",
  "/docs/test",
  "/docs/styles-and-themes/themes",
  "/docs/wrap-component/grid-layout",
  "/docs/xmlui-animations",
  "/docs/xmlui-pdf",
  "/docs/xmlui-spreadsheet",
];

function isAtOrBelow(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + "/");
}

function toDocsRoute(path: string): string {
  const entry = DOCS_ROUTE_PREFIXES.find(([from]) => isAtOrBelow(path, from));
  return entry ? entry[1] + path.slice(entry[0].length) : path;
}

const staticSearchData: SearchItemData[] = [
  ...Object.entries(plainTextDocsContent)
    .filter(([key]) => !DOCS_SEARCH_EXCLUDED.some((prefix) => isAtOrBelow(key, prefix)))
    .map(([key, value]) => {
      const lines = value.split("\n");
      const firstLine = lines.length > 0 ? lines[0] : "";
      // Remove title after matching, since it is in the "label"
      const restContent = lines.length > 1 ? lines.slice(1).join("\n") : "";
      return {
        path: toDocsRoute(key),
        title: firstLine,
        content: restContent,
        category: SEARCH_CATEGORIES[0], // "docs"
      }}),
  ...Object.entries(plainTextBlogContent).map(([key, value]) => {
    const titleFromFileName = key
      .replace("/blog/", "")
      .replace(/\.mdx?$/, "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const title = blogFrontmatter[key]?.title ? String(blogFrontmatter[key].title) : titleFromFileName;
    return {
      path: key,
      title,
      content: value,
      category: SEARCH_CATEGORIES[1], // "blog"
    };
  }),
];

// Build allPosts (including drafts, for direct URL preview) and posts (excluding drafts, for listing)
const allPosts = Object.entries(blogFrontmatter)
  .map(([key, fm]) => ({
    title: fm.title,
    slug: fm.slug ?? key.replace("/blog/", ""),
    description: fm.description,
    author: fm.author,
    date: fm.date,
    image: fm.image,
    tags: fm.tags,
    draft: !!fm.draft,
  }));

const posts = allPosts.filter((p) => !p.draft);

const prefetchedContent: Record<string, any> = {};

// NOTE: We intentionally do NOT filter drafts from blogContent here.
// Draft posts are excluded from the posts array (used by BlogOverview listing),
// but their content remains available so they can be previewed via direct URL.
// Populate prefetched blog content
Object.keys(blogContent).forEach((fileName) => {
  prefetchedContent[`/blog/${fileName}.md`] = blogContent[fileName];
});
// Populate prefetched homepage content
Object.keys(rawHomepageContent).forEach((filePath) => {
  const fileName = filePath.split("/").pop() || "";
  prefetchedContent[`/pages/${fileName}`] = rawHomepageContent[filePath].default;
});

export { prefetchedContent, docsContent, staticSearchData, posts, allPosts };

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
