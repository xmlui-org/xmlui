import { createMetadata, createUserDefinedComponentRenderer, type ComponentMetadata } from "xmlui";
import componentSource from "./DocumentPage.xmlui";

export const DocumentPageMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description: "Document page with breadcrumbs, markdown content, TOC and prev/next links.",
  props: {
    content: { description: "Markdown content string." },
    url: { description: "URL to load markdown from." },
    showInspector: {
      description: "Show a page-level Inspector button and enable tracing for markdown playgrounds on this page.",
      valueType: "boolean",
    },
    hideToc: { description: "Hide table of contents.", valueType: "boolean" },
    maxHeadingLevel: { description: "Max TOC heading level.", valueType: "number" },
  },
});

export const documentPageRenderer = createUserDefinedComponentRenderer(
  DocumentPageMd,
  componentSource,
);
