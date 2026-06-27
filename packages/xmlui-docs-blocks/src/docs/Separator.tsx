import { createMetadata, createUserDefinedComponentRenderer, type ComponentMetadata } from "xmlui";
import componentSource from "./Separator.xmlui";

export const SeparatorMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description: "Vertical content separator.",
  props: {},
});

export const separatorRenderer = createUserDefinedComponentRenderer(
  SeparatorMd,
  componentSource,
);
