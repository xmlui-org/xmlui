import { createMetadata, createUserDefinedComponentRenderer, type ComponentMetadata } from "xmlui";
import componentSource from "./SectionHeader.xmlui";

export const SectionHeaderMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description: "Section heading (H4) with padding.",
  props: {
    title: { description: "Section title text." },
  },
});

export const sectionHeaderRenderer = createUserDefinedComponentRenderer(
  SectionHeaderMd,
  componentSource,
);
