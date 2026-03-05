import React, { createContext, forwardRef, useCallback, useMemo, useState } from "react";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ContainerWrapperDef } from "xmlui";
import { useDragDropRegistry } from "./DragDropProviderNative";

export type DroppableContextValue = {
  dropId: string;
  onMount: () => void;
  onUnmount: () => void;
};

/** Provided by DroppableNative so DroppedItems can locate its parent zone. */
export const DroppableContext = createContext<DroppableContextValue | null>(null);

type Props = {
  dropId: string;
  data?: Record<string, any>;
  disabled?: boolean;
  childrenRender: (isOver: boolean) => React.ReactNode;
};

/**
 * Renders a draggable item that was dropped into this zone.
 * Exported so DroppedItemsNative can reuse it.
 */
export function PlacedItem({ dragId }: { dragId: string }) {
  const registry = useDragDropRegistry();
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({ id: dragId });

  const entry = registry?.getEntry(dragId);
  if (!entry) return null;

  const style: React.CSSProperties | undefined = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const node: ContainerWrapperDef = {
    type: "Container",
    contextVars: { $isDragging: isDragging },
    children: Array.isArray(entry.children)
      ? entry.children
      : entry.children
        ? [entry.children]
        : [],
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {entry.renderFn(node, entry.layoutContext)}
    </div>
  );
}

export const DroppableNative = forwardRef<HTMLDivElement, Props>(
  function DroppableNative({ dropId, data, disabled, childrenRender }, _ref) {
    const { setNodeRef, isOver } = useDroppable({ id: dropId, data, disabled });
    const registry = useDragDropRegistry();

    // Track whether a <DroppedItems> child has registered itself.
    // When it has, we skip the auto-render so items only appear in the explicit slot.
    const [dropZoneCount, setDropZoneCount] = useState(0);
    const onMount = useCallback(() => setDropZoneCount((c) => c + 1), []);
    const onUnmount = useCallback(() => setDropZoneCount((c) => c - 1), []);
    const ctx = useMemo<DroppableContextValue>(
      () => ({ dropId, onMount, onUnmount }),
      [dropId, onMount, onUnmount],
    );

    const hasExplicitDropZone = dropZoneCount > 0;

    // IDs of all draggables currently placed in this zone.
    const placedIds = registry
      ? Object.entries(registry.placements)
          .filter(([, zoneId]) => zoneId === dropId)
          .map(([dragId]) => dragId)
      : [];

    return (
      <DroppableContext.Provider value={ctx}>
        <div ref={setNodeRef}>
          {childrenRender(isOver)}
          {!hasExplicitDropZone && placedIds.map((id) => (
            <PlacedItem key={id} dragId={id} />
          ))}
        </div>
      </DroppableContext.Provider>
    );
  },
);
