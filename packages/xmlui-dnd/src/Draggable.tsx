import React from "react";
import { createComponentRenderer, createMetadata, d } from "xmlui";
import { DraggableNative } from "./DraggableNative";

const COMP = "Draggable";

export const DraggableMd = createMetadata({
  status: "experimental",
  description:
    "`Draggable` makes its children draggable within a `DragDropProvider` context. " +
    "Each `Draggable` must have a unique `dragId`. The `$isDragging` context variable " +
    "is exposed to children so they can react to the dragging state.",
  props: {
    dragId: d(
      "Unique identifier for this draggable element. Must be unique within the `DragDropProvider`.",
      undefined,
      "string",
      undefined,
      undefined,
      true,
    ),
    data: d(
      "Optional data object associated with this draggable. " +
        "Accessible in `DragDropProvider` event handlers via `activeData`.",
    ),
    disabled: d(
      "When `true`, the element cannot be dragged.",
      undefined,
      "boolean",
      false,
    ),
  },
  contextVars: {
    $isDragging: {
      description: "`true` when this element is currently being dragged, `false` otherwise.",
    },
  },
});

export const draggableComponentRenderer = createComponentRenderer(
  COMP,
  DraggableMd,
  ({ node, extractValue, renderChild, layoutContext }) => {
    const props = node.props as any;
    return (
      <DraggableNative
        dragId={extractValue.asOptionalString(props?.dragId) ?? ""}
        data={extractValue(props?.data)}
        disabled={extractValue.asOptionalBoolean(props?.disabled, false)}
        renderFn={renderChild}
        children={node.children as any}
        layoutContext={layoutContext}
      />
    );
  },
);
