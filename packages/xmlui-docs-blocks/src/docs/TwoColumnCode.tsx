import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./TwoColumnCode.xmlui";

export const TwoColumnCodeMd = createMetadata({
  status: "experimental",
  description: "Two-column layout: code (with highlighter) in first column, markdown in second.",
  props: {},
});

export const twoColumnCodeRenderer = createUserDefinedComponentRenderer(
  TwoColumnCodeMd,
  componentSource,
);
