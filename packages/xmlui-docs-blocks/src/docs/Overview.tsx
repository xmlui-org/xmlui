import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./Overview.xmlui";

export const OverviewMd = createMetadata({
  status: "experimental",
  description: "Overview/section landing page with breadcrumbs and overview cards from nav.",
  props: {},
});

export const overviewRenderer = createUserDefinedComponentRenderer(
  OverviewMd,
  componentSource,
);
