import { buildContentFromRuntime } from "xmlui-docs-blocks";
import { type SearchItemData, SEARCH_CATEGORIES } from "xmlui";

const rawBlogContent: Record<string, { default: string }> = import.meta.glob(
  `/content/blog/*.md`,
  {
    eager: true,
    query: "?raw",
  },
);

const {
  content: blogContent,
  plainTextContent: plainTextBlogContent,
  frontmatter: blogFrontmatter,
} = buildContentFromRuntime(
  rawBlogContent,
  { contentPrefix: "/content/blog/" },
  { urlPrefix: "/post/" },
) as unknown as {
  content: Record<string, string>;
  plainTextContent: Record<string, string>;
  frontmatter: Record<string, Record<string, unknown>>;
};

// Build the post list (excluding drafts) sorted by date descending.
const allPosts = Object.entries(blogFrontmatter)
  .map(([key, fm]) => ({
    title: fm.title,
    slug: fm.slug ?? key.replace("/post/", ""),
    description: fm.description,
    author: fm.author,
    date: fm.date,
    image: fm.image,
    tags: fm.tags,
    draft: !!fm.draft,
  }))
  .filter((p) => !p.draft)
  .sort((a, b) => Date.parse(String(b.date)) - Date.parse(String(a.date)));

// Markdown content keyed by `/post/<slug>` for prefetched lookup from PostPage.
const prefetchedContent: Record<string, string> = {};
Object.keys(blogContent).forEach((fileName) => {
  prefetchedContent[`/post/${fileName}`] = blogContent[fileName];
});

const staticSearchData: SearchItemData[] = Object.entries(plainTextBlogContent).map(
  ([key, value]) => {
    const fmKey = key;
    const fm = blogFrontmatter[fmKey] || {};
    const fallbackTitle = key
      .replace("/post/", "")
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = fm.title ? String(fm.title) : fallbackTitle;
    return {
      path: key,
      title,
      content: value,
      category: SEARCH_CATEGORIES[1], // "blog"
    };
  },
);

export { allPosts, prefetchedContent, staticSearchData };
