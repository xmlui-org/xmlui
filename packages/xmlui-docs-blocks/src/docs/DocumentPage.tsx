import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./DocumentPage.xmlui";

export const DocumentPageMd = createMetadata({
  status: "experimental",
  description: "Document page with breadcrumbs, markdown content, TOC and prev/next links.",
  props: {
    content: { description: "Markdown content string." },
    url: { description: "URL to load markdown from." },
    hideToc: { description: "Hide table of contents.", valueType: "boolean" },
    maxHeadingLevel: { description: "Max TOC heading level.", valueType: "number" },
  },
});

export const documentPageRenderer = createUserDefinedComponentRenderer(
  DocumentPageMd,
  componentSource,
);
