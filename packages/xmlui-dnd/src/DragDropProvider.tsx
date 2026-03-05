import { wrapContainer, createMetadata, d } from "xmlui";
import { DragDropProviderNative } from "./DragDropProviderNative";

const COMP = "DragDropProvider";

export const DragDropProviderMd = createMetadata({
  status: "experimental",
  description:
    "`DragDropProvider` establishes a drag-and-drop context for its children using " +
    "the dnd-kit library. Wrap `Draggable` and `Droppable` components inside it to " +
    "enable drag-and-drop interactions.",
  props: {
    collisionDetection: d(
      "The collision detection algorithm used to determine which droppable a draggable overlaps.",
      [
        { value: "closestCenter", description: "Measures distance to the center of each droppable." },
        { value: "closestCorners", description: "Measures distance to the corners of each droppable." },
        { value: "rectIntersection", description: "Uses rectangle intersection (default)." },
        { value: "pointerWithin", description: "Uses the pointer position within a droppable." },
      ],
      "string",
      "rectIntersection",
    ),
  },
  events: {
    dragStart: {
      description: "Fired when the user starts dragging an item. Receives `{ activeId, activeData }`.",
      parameters: {
        activeId: "The id of the element that started being dragged.",
        activeData: "The data associated with the active draggable element.",
      },
    },
    dragEnd: {
      description:
        "Fired when the user releases a dragged item. Receives `{ activeId, activeData, overId, overData }`. " +
        "`overId` is `null` if released outside any droppable.",
      parameters: {
        activeId: "The id of the element that was dragged.",
        activeData: "The data associated with the active draggable element.",
        overId: "The id of the droppable that the active element was released over, or null.",
        overData: "The data associated with the droppable element, or null.",
      },
    },
    dragOver: {
      description:
        "Fired while a dragged item hovers over a droppable zone. " +
        "Receives `{ activeId, activeData, overId, overData }`.",
      parameters: {
        activeId: "The id of the element being dragged.",
        activeData: "The data associated with the active draggable element.",
        overId: "The id of the droppable currently under the draggable, or null.",
        overData: "The data associated with the droppable element, or null.",
      },
    },
    dragCancel: {
      description:
        "Fired when a drag operation is cancelled (e.g., via the Escape key). " +
        "Receives `{ activeId, activeData }`.",
      parameters: {
        activeId: "The id of the element whose drag was cancelled.",
        activeData: "The data associated with the active draggable element.",
      },
    },
  },
  contextVars: {
    $activeDragId: {
      description:
        "The `id` of the element currently being dragged, or `null` when nothing is being dragged.",
    },
  },
});

export const dragDropProviderComponentRenderer = wrapContainer(
  COMP,
  DragDropProviderNative,
  DragDropProviderMd,
  {
    strings: ["collisionDetection"],
    events: {
      dragStart: "onDragStart",
      dragEnd: "onDragEnd",
      dragOver: "onDragOver",
      dragCancel: "onDragCancel",
    },
    contextVarNames: ["$activeDragId"],
  },
);
