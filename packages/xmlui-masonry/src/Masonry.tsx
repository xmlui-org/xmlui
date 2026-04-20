import { MasonryReact } from "./MasonryReact";
import { wrapComponent, createMetadata, type ComponentMetadata, d } from "xmlui";

const COMP = "Masonry";

export const MasonryMd: ComponentMetadata = createMetadata({
  status: "experimental",
  description:
    "`Masonry` arranges children in a responsive multi-column layout where " +
    "items flow top-to-bottom then left-to-right, with columns automatically " +
    "adapting to container width.",
  props: {
    data: d(
      "The array of items to render. Each item is exposed as `$item` inside the child template.",
    ),
    columns: d(
      "Maximum number of columns.",
      undefined,
      "number",
      3,
    ),
    gap: d(
      "Gap between columns and between items. Accepts CSS lengths or theme tokens (e.g. '$space-3'). Overridden by columnGap/rowGap if set.",
      undefined,
      "string",
      "16px",
    ),
    columnGap: d(
      "Gap between columns. Overrides gap for the horizontal axis.",
      undefined,
      "string",
    ),
    rowGap: d(
      "Gap between items within a column. Overrides gap for the vertical axis.",
      undefined,
      "string",
    ),
    minColumnWidth: d(
      "Minimum width per column. Columns reduce automatically when the " +
      "container is too narrow. Any CSS length value.",
      undefined,
      "string",
      "250px",
    ),
    itemTemplate: d(
      "The template used to render each item. Use `$item` to access the current data item.",
    ),
  },
  contextVars: {
    $item: d("The current data item."),
    $itemIndex: d("The zero-based index of the current item."),
    $isFirst: d("`true` when this is the first item."),
    $isLast: d("`true` when this is the last item."),
  },
  childrenAsTemplate: "itemTemplate",
});

// No config needed — mergeWithMetadata infers types from valueType in metadata.
export const masonryComponentRenderer = wrapComponent(COMP, MasonryReact, MasonryMd);
