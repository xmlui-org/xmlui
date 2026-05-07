import { buildContentFromRuntime } from "xmlui-docs-blocks";
import { type SearchItemData, SEARCH_CATEGORIES } from "xmlui";

const rawDocsContent: Record<string, { default: string }> = import.meta.glob(
  `/content/docs/**/*.md`,
  {
    eager: true,
    query: "?raw",
  },
);

const { content: docsContent, plainTextContent: plainTextDocsContent } = buildContentFromRuntime(
  rawDocsContent,
  { contentPrefix: "/content/docs/" },
  { urlPrefix: "/" },
) as unknown as {
  content: Record<string, string>;
  plainTextContent: Record<string, string>;
};

const staticSearchData: SearchItemData[] = Object.entries(plainTextDocsContent).map(
  ([key, value]) => {
    const lines = value.split("\n");
    const firstLine = lines.length > 0 ? lines[0] : "";
    const restContent = lines.length > 1 ? lines.slice(1).join("\n") : "";
    return {
      path: key,
      title: firstLine,
      content: restContent,
      category: SEARCH_CATEGORIES[0], // "docs"
    };
  },
);

export { docsContent, staticSearchData };
