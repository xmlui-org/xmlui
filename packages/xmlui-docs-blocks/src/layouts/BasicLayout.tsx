import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./BasicLayout.xmlui";

const COMP = "BasicLayout";

export const BasicLayoutMd = createMetadata({
  status: "experimental",
  description: "A generic list layout for blog or documentation posts.",
  props: {
    sortedPosts: {
      description: "Array of post objects to render in the list.",
    },
    showTags: {
      description: "Whether to render the tag list for each post.",
      valueType: "boolean",
      defaultValue: true,
    },
  },
});

export const basicLayoutRenderer = createUserDefinedComponentRenderer(
  BasicLayoutMd,
  componentSource,
);

