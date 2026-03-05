import { wrapContainer, createMetadata, d } from "xmlui";
import { DroppableNative } from "./DroppableNative";

const COMP = "Droppable";

export const DroppableMd = createMetadata({
  status: "experimental",
  description:
    "`Droppable` defines a drop zone within a `DragDropProvider` context. " +
    "Items dragged from `Draggable` components can be dropped here. " +
    "Use `DroppedItems` inside it to control exactly where dropped items appear.",
  props: {
    dropId: d(
      "Unique identifier for this drop zone. Must be unique within the `DragDropProvider`.",
      undefined,
      "string",
      undefined,
      undefined,
      true,
    ),
    data: d(
      "Optional data object associated with this drop zone. " +
        "Accessible in `DragDropProvider` event handlers via `overData`.",
    ),
    disabled: d(
      "When `true`, this zone does not accept drops.",
      undefined,
      "boolean",
      false,
    ),
  },
  contextVars: {
    $isOver: {
      description: "`true` when a draggable item is currently hovering over this zone.",
    },
  },
});

export const droppableComponentRenderer = wrapContainer(
  COMP,
  DroppableNative,
  DroppableMd,
  {
    booleans: ["disabled"],
    contextVarNames: ["$isOver"],
  },
);
