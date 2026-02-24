import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./DocumentPageNoTOC.xmlui";

export const DocumentPageNoTOCMd = createMetadata({
  status: "experimental",
  description: "Document page without table of contents.",
  props: {
    content: { description: "Markdown content string." },
    url: { description: "URL to load markdown from." },
    width: { description: "Optional width." },
  },
});

export const documentPageNoTOCRenderer = createUserDefinedComponentRenderer(
  DocumentPageNoTOCMd,
  componentSource,
);
