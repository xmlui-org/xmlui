import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./PageNotFound.xmlui";

export const PageNotFoundMd = createMetadata({
  status: "experimental",
  description: "404 page not found content with link to homepage.",
  props: {},
});

export const pageNotFoundRenderer = createUserDefinedComponentRenderer(
  PageNotFoundMd,
  componentSource,
);
