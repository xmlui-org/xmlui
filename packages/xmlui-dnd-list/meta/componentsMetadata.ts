import { DndItemsMd } from "../src/DndList";

export const componentMetadata = {
  name: "DndList",
  state: "experimental",
  description:
    "This package provides a drag-and-drop sortable list. `DndItems` is a " +
    "drop-in replacement for `Items` that adds an `onReorder` event firing " +
    "with the new array order after a drag completes.",
  metadata: {
    DndItems: DndItemsMd,
  },
};
