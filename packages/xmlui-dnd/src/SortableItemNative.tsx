import React, { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortableList } from "./SortableListNative";
import styles from "./SortableItem.module.scss";

// Inline grip icon — avoids needing a separate icon library
const GripIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <circle cx="5.5" cy="4" r="1.25" />
    <circle cx="5.5" cy="8" r="1.25" />
    <circle cx="5.5" cy="12" r="1.25" />
    <circle cx="10.5" cy="4" r="1.25" />
    <circle cx="10.5" cy="8" r="1.25" />
    <circle cx="10.5" cy="12" r="1.25" />
  </svg>
);

type Props = {
  itemId: string;
  dragHandle?: boolean;
  /** Called with `isDragging` as first arg — maps to `$isDragging` context var in children. */
  childrenRender: (isDragging: boolean) => React.ReactNode;
  className?: string;
  registerComponentApi?: unknown;
};

export function SortableItemNative({
  itemId,
  dragHandle = false,
  childrenRender,
  className,
}: Props) {
  const { registerItem, itemOrder } = useSortableList();

  // Register this item's id with the parent SortableList once on mount.
  useEffect(() => {
    registerItem(itemId);
  }, [itemId, registerItem]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: itemId,
  });

  const sortedIndex = itemOrder.indexOf(itemId);

  // CSS `order` positions the item in the flex column according to the
  // current logical order without mutating DOM order.
  const style: React.CSSProperties = {
    ...(sortedIndex >= 0 && { order: sortedIndex }),
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging && { zIndex: 1 }),
  };

  const cls = [
    styles.item,
    isDragging ? styles.dragging : "",
    dragHandle ? styles.hasHandle : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={setNodeRef}
      className={cls}
      style={style}
      {...attributes}
      {...(!dragHandle ? listeners : {})}
    >
      {dragHandle && (
        <div className={styles.handle} {...listeners}>
          <GripIcon />
        </div>
      )}
      <div className={styles.content}>{childrenRender(isDragging)}</div>
    </div>
  );
}
