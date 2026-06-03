import { MasonryReact } from "./MasonryReact";
import { wrapComponent, createMetadata, type ComponentMetadata } from "xmlui";

const COMP = "Masonry";

export const MasonryMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`Masonry` arranges children in a responsive multi-column layout where " +
    "items flow top-to-bottom then left-to-right, with columns automatically " +
    "adapting to container width.",
  props: {
    data: {
      description:
        "The array of items to render. Each item is exposed as `$item` inside the child template.",
    },
    columns: {
      description: "Maximum number of columns.",
      valueType: "number",
      defaultValue: 3,
    },
    gap: {
      description:
        "Gap between columns and between items. Accepts CSS lengths or theme tokens (e.g. '$space-3'). Overridden by columnGap/rowGap if set.",
      valueType: "string",
      defaultValue: "16px",
    },
    columnGap: {
      description: "Gap between columns. Overrides gap for the horizontal axis.",
      valueType: "string",
    },
    rowGap: {
      description: "Gap between items within a column. Overrides gap for the vertical axis.",
      valueType: "string",
    },
    minColumnWidth: {
      description:
        "Minimum width per column. Columns reduce automatically when the " +
        "container is too narrow. Any CSS length value.",
      valueType: "string",
      defaultValue: "250px",
    },
    itemTemplate: {
      description:
        "The template used to render each item. Use `$item` to access the current data item.",
    },
  },
  contextVars: {
    $item: {
      description: "The current data item.",
    },
    $itemIndex: {
      description: "The zero-based index of the current item.",
    },
    $isFirst: {
      description: "`true` when this is the first item.",
    },
    $isLast: {
      description: "`true` when this is the last item.",
    },
  },
  childrenAsTemplate: "itemTemplate",
});

// No config needed — mergeWithMetadata infers types from valueType in metadata.
export const masonryComponentRenderer = wrapComponent(COMP, MasonryReact, MasonryMd);
