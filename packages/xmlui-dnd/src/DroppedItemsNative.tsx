import React, { useContext, useEffect, useRef } from "react";
import { DroppableContext, PlacedItem } from "./DroppableNative";
import { useDragDropRegistry } from "./DragDropProviderNative";

/**
 * Renders the items currently placed in the enclosing Droppable zone.
 * Registers itself with DroppableContext so the Droppable skips its own
 * auto-render at the bottom.
 */
export function DroppedItemsNative() {
  const ctx = useContext(DroppableContext);
  const registry = useDragDropRegistry();

  // ctxRef so useEffect only re-runs when dropId changes, not on every
  // context object identity change triggered by parent re-renders.
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    ctxRef.current?.onMount();
    return () => ctxRef.current?.onUnmount();
    // Re-register only when the enclosing Droppable identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.dropId]);

  if (!ctx || !registry) return null;

  const { dropId } = ctx;
  const placedIds = Object.entries(registry.placements)
    .filter(([, zoneId]) => zoneId === dropId)
    .map(([dragId]) => dragId);

  return (
    <>
      {placedIds.map((id) => (
        <PlacedItem key={id} dragId={id} />
      ))}
    </>
  );
}
