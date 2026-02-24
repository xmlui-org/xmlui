import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./DocumentLinks.xmlui";

export const DocumentLinksMd = createMetadata({
  status: "experimental",
  description: "Previous/Next document links using linkInfo.",
  props: {
    width: { description: "Optional width." },
  },
});

export const documentLinksRenderer = createUserDefinedComponentRenderer(
  DocumentLinksMd,
  componentSource,
);
