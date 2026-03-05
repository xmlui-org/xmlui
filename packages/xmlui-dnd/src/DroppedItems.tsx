import React from "react";
import { createComponentRenderer, createMetadata } from "xmlui";
import { DroppedItemsNative } from "./DroppedItemsNative";

const COMP = "DroppedItems";

export const DroppedItemsMd = createMetadata({
  status: "experimental",
  description:
    "`DroppedItems` renders all items currently dropped into the enclosing `Droppable` zone. " +
    "Place it anywhere inside a `Droppable` to control exactly where dropped items appear. " +
    "When omitted, dropped items are rendered automatically at the bottom of the `Droppable`.",
});

export const droppedItemsComponentRenderer = createComponentRenderer(
  COMP,
  DroppedItemsMd,
  () => <DroppedItemsNative />,
);
