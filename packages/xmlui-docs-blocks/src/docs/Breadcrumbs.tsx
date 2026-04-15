import { createMetadata, createUserDefinedComponentRenderer, type ComponentMetadata } from "xmlui";
import componentSource from "./Breadcrumbs.xmlui";

export const BreadcrumbsMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description: "Breadcrumb navigation using linkInfo and pathSegments.",
  props: {},
});

export const breadcrumbsRenderer = createUserDefinedComponentRenderer(
  BreadcrumbsMd,
  componentSource,
);
