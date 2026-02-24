import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./TBD.xmlui";

export const TBDMd = createMetadata({
  status: "experimental",
  description: "Placeholder for content to be defined.",
  props: {},
});

export const tbdRenderer = createUserDefinedComponentRenderer(TBDMd, componentSource);
