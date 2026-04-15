import { GridLayoutRender } from "./GridLayoutRender";
import { wrapComponent, createMetadata, d } from "xmlui";

const COMP = "GridLayout";

export const GridLayoutMd = createMetadata({
  status: "experimental",
  description:
    "`GridLayout` wraps react-grid-layout to provide a draggable, resizable " +
    "dashboard-style grid. Items are positioned on an explicit grid with " +
    "configurable columns, row height, and responsive breakpoints.",
  props: {
    data: d(
      "The array of items to render. Each item is exposed as `$item` inside the child template.",
    ),
    layout: {
      description:
        "Array of layout items. Each item: { i: string, x: number, y: number, w: number, h: number }. " +
        "Position is in grid units.",
    },
    columns: d(
      "Number of grid columns.",
      undefined,
      "number",
      12,
    ),
    rowHeight: d(
      "Height of a single grid row in pixels.",
      undefined,
      "number",
      60,
    ),
    gap: d(
      "Gap between grid items. Accepts a CSS length or theme token (e.g. '$space-3').",
      undefined,
      "string",
      "16px",
    ),
    draggable: d(
      "Whether items can be dragged.",
      undefined,
      "boolean",
      true,
    ),
    resizable: d(
      "Whether items can be resized.",
      undefined,
      "boolean",
      true,
    ),
    compactType: d(
      "Compaction direction: 'vertical', 'horizontal', or null for no compaction.",
      undefined,
      "string",
      "vertical",
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

// mergeWithMetadata infers types from valueType in metadata.
// Only captureNativeEvents is needed as config.
export const gridLayoutComponentRenderer = wrapComponent(COMP, GridLayoutRender, GridLayoutMd, {
  captureNativeEvents: true,
});
