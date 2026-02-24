import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./Separator.xmlui";

export const SeparatorMd = createMetadata({
  status: "experimental",
  description: "Vertical content separator.",
  props: {},
});

export const separatorRenderer = createUserDefinedComponentRenderer(
  SeparatorMd,
  componentSource,
);
