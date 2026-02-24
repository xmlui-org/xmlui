import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./Breadcrumbs.xmlui";

export const BreadcrumbsMd = createMetadata({
  status: "experimental",
  description: "Breadcrumb navigation using linkInfo and pathSegments.",
  props: {},
});

export const breadcrumbsRenderer = createUserDefinedComponentRenderer(
  BreadcrumbsMd,
  componentSource,
);
