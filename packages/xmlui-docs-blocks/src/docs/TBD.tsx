import { createMetadata, createUserDefinedComponentRenderer, type ComponentMetadata } from "xmlui";
import componentSource from "./TBD.xmlui";

export const TBDMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description: "Placeholder for content to be defined.",
  props: {},
});

export const tbdRenderer = createUserDefinedComponentRenderer(TBDMd, componentSource);
