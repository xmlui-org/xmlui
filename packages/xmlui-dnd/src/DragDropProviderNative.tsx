import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
  type CollisionDetection,
} from "@dnd-kit/core";
import type { ComponentDef, RenderChildFn, LayoutContext } from "xmlui";

// --- Registry types ---------------------------------------------------------

/** The data each Draggable registers so Droppable can render it after a drop. */
export type DraggableEntry = {
  renderFn: RenderChildFn;
  children: ComponentDef | ComponentDef[] | undefined;
  layoutContext?: LayoutContext;
};

/** Placement map: dragId → dropId when placed, null when back at source. */
export type Placements = Record<string, string | null>;

export type DragDropRegistry = {
  register: (id: string, entry: DraggableEntry) => void;
  unregister: (id: string) => void;
  getEntry: (id: string) => DraggableEntry | undefined;
  /** Changes when items are dropped; drives re-renders in consumers. */
  placements: Placements;
  /** Move dragId into overId zone, or back to source when overId is null. */
  place: (activeId: string, overId: string | null) => void;
};

export const DragDropRegistryContext = createContext<DragDropRegistry | null>(null);

/** Returns the nearest DragDropProvider's registry, or null if none exists. */
export function useDragDropRegistry(): DragDropRegistry | null {
  return useContext(DragDropRegistryContext);
}

// --- Collision detectors ----------------------------------------------------

const COLLISION_DETECTORS: Record<string, CollisionDetection> = {
  closestCenter,
  closestCorners,
  rectIntersection,
  pointerWithin,
};

// --- Component -------------------------------------------------------------

type Props = {
  collisionDetection?: string;
  onDragStart?: (evt: { activeId: string; activeData: any }) => void;
  onDragEnd?: (evt: { activeId: string; activeData: any; overId: string | null; overData: any }) => void;
  onDragOver?: (evt: { activeId: string; activeData: any; overId: string | null; overData: any }) => void;
  onDragCancel?: (evt: { activeId: string; activeData: any }) => void;
  childrenRender: (activeDragId: string | null) => React.ReactNode;
};

export function DragDropProviderNative({
  collisionDetection = "rectIntersection",
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragCancel,
  childrenRender,
}: Props) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placements>({});

  // Entry map in a ref — mutations don't trigger re-renders; placements state does.
  const entriesRef = useRef<Record<string, DraggableEntry>>({});

  const register = useCallback((id: string, entry: DraggableEntry) => {
    entriesRef.current[id] = entry;
  }, []);

  const unregister = useCallback((id: string) => {
    delete entriesRef.current[id];
    // Placements are NOT cleared here — only place() changes placement.
    // DroppableNative already guards with getEntry() before rendering placed items.
  }, []);

  const getEntry = useCallback((id: string): DraggableEntry | undefined =>
    entriesRef.current[id],
  []);

  const place = useCallback((activeId: string, overId: string | null) => {
    setPlacements(prev => ({ ...prev, [activeId]: overId }));
  }, []);

  // New registry object only when placements changes; callbacks are stable.
  const registry = useMemo<DragDropRegistry>(
    () => ({ register, unregister, getEntry, placements, place }),
    [placements], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const detector = COLLISION_DETECTORS[collisionDetection] ?? rectIntersection;

  return (
    <DragDropRegistryContext.Provider value={registry}>
      <DndContext
        collisionDetection={detector}
        onDragStart={(event) => {
          const id = String(event.active.id);
          setActiveDragId(id);
          onDragStart?.({ activeId: id, activeData: event.active.data.current ?? null });
        }}
        onDragEnd={(event) => {
          setActiveDragId(null);
          const activeId = String(event.active.id);
          const overId = event.over ? String(event.over.id) : null;
          place(activeId, overId);
          onDragEnd?.({
            activeId,
            activeData: event.active.data.current ?? null,
            overId,
            overData: event.over?.data.current ?? null,
          });
        }}
        onDragOver={(event) => {
          onDragOver?.({
            activeId: String(event.active.id),
            activeData: event.active.data.current ?? null,
            overId: event.over ? String(event.over.id) : null,
            overData: event.over?.data.current ?? null,
          });
        }}
        onDragCancel={(event) => {
          setActiveDragId(null);
          onDragCancel?.({ activeId: String(event.active.id), activeData: event.active.data.current ?? null });
        }}
      >
        {childrenRender(activeDragId)}
      </DndContext>
    </DragDropRegistryContext.Provider>
  );
}
