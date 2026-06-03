import { GridLayoutRender } from "./GridLayoutRender";
import { wrapComponent, createMetadata } from "xmlui";

const COMP = "GridLayout";

export const GridLayoutMd = createMetadata({
  status: "experimental",
  description:
    "`GridLayout` wraps react-grid-layout to provide a draggable, resizable " +
    "dashboard-style grid. Items are positioned on an explicit grid with " +
    "configurable columns, row height, and responsive breakpoints.",
  props: {
    data: {
      description:
        "The array of items to render. Each item is exposed as `$item` inside the child template.",
    },
    layout: {
      description:
        "Array of layout items. Each item: { i: string, x: number, y: number, w: number, h: number }. " +
        "Position is in grid units.",
    },
    columns: {
      description: "Number of grid columns.",
      valueType: "number",
      defaultValue: 12,
    },
    rowHeight: {
      description: "Height of a single grid row in pixels.",
      valueType: "number",
      defaultValue: 60,
    },
    gap: {
      description: "Gap between grid items. Accepts a CSS length or theme token (e.g. '$space-3').",
      valueType: "string",
      defaultValue: "16px",
    },
    draggable: {
      description: "Whether items can be dragged.",
      valueType: "boolean",
      defaultValue: true,
    },
    resizable: {
      description: "Whether items can be resized.",
      valueType: "boolean",
      defaultValue: true,
    },
    compactType: {
      description: "Compaction direction: 'vertical', 'horizontal', or null for no compaction.",
      valueType: "string",
      defaultValue: "vertical",
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

// mergeWithMetadata infers types from valueType in metadata.
// Only captureNativeEvents is needed as config.
export const gridLayoutComponentRenderer = wrapComponent(COMP, GridLayoutRender, GridLayoutMd, {
  captureNativeEvents: true,
});
