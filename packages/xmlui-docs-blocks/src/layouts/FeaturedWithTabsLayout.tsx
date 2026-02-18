import { createMetadata, createUserDefinedComponentRenderer } from "xmlui";
import componentSource from "./FeaturedWithTabsLayout.xmlui";

const COMP = "FeaturedWithTabsLayout";

export const FeaturedWithTabsLayoutMd = createMetadata({
  status: "experimental",
  description:
    "A featured layout with a highlighted post and tabbed grid, suitable for blogs or documentation hubs.",
  props: {
    latestPost: {
      description: "The most recent or featured post object.",
    },
    sortedPosts: {
      description: "Array of all posts, sorted by date or other criteria.",
    },
    showTags: {
      description: "Whether to render tag-based tabs and tag labels.",
      valueType: "boolean",
      defaultValue: true,
    },
    postsByTag: {
      description:
        "Pre-grouped posts by tag in the shape { tag, posts[] }, used when tag tabs are shown.",
    },
    gridCols: {
      description:
        "Number of columns to use in supporting layouts; typically derived from media size.",
      valueType: "number",
    },
  },
});

export const featuredWithTabsLayoutRenderer = createUserDefinedComponentRenderer(
  FeaturedWithTabsLayoutMd,
  componentSource,
);

