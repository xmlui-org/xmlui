import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import styles from "./SortableList.module.scss";

// --- Shared context ---------------------------------------------------------

export type SortableListCtxType = {
  /** Called by each SortableItem on mount to register its id. */
  registerItem: (id: string) => void;
  /** Current logical order of item ids (updated after each drag). */
  itemOrder: string[];
};

export const SortableListCtx = createContext<SortableListCtxType>({
  registerItem: () => {},
  itemOrder: [],
});

export function useSortableList(): SortableListCtxType {
  return useContext(SortableListCtx);
}

// --- Component --------------------------------------------------------------

type Props = {
  childrenRender: () => React.ReactNode;
  onDidReorder?: (order: string[]) => void;
  className?: string;
};

export function SortableListNative({ childrenRender, onDidReorder, className }: Props) {
  const [itemOrder, setItemOrder] = useState<string[]>([]);
  // Shadow ref so registerItem never changes identity, avoiding dependency loops.
  const registeredRef = useRef<string[]>([]);

  const registerItem = useCallback((id: string) => {
    if (registeredRef.current.includes(id)) return;
    registeredRef.current = [...registeredRef.current, id];
    setItemOrder([...registeredRef.current]);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = itemOrder.indexOf(active.id as string);
    const newIndex = itemOrder.indexOf(over.id as string);
    const newOrder = arrayMove(itemOrder, oldIndex, newIndex);
    setItemOrder(newOrder);
    onDidReorder?.(newOrder);
  };

  return (
    <SortableListCtx.Provider value={{ registerItem, itemOrder }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemOrder} strategy={verticalListSortingStrategy}>
          <div className={`${styles.list}${className ? ` ${className}` : ""}`}>
            {childrenRender()}
          </div>
        </SortableContext>
      </DndContext>
    </SortableListCtx.Provider>
  );
}
