import {
  Fragment,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// =====================================================================================================================
// Pure React drag-and-drop sortable list. No XMLUI imports.
//
// API mirrors XMLUI's <Items>: takes `items` + `renderItem(contextVars, key)`,
// where contextVars exposes `$item`, `$itemIndex`, `$isFirst`, `$isLast`.
// One additional event: `onReorder(newItems)` — fires after a drag completes.
//
// Stable IDs: dnd-kit needs each item to have a stable id so it can track
// positions during a drag. We accept an optional `getItemId(item, index)` prop;
// the default tries `item.id`, then `item.name`, then falls back to a JSON
// digest of the item. For typical lists of objects with id/name this is fine;
// if it's not, callers pass `getItemId`.

export type ContextVars = {
  $item: any;
  $itemIndex: number;
  $isFirst: boolean;
  $isLast: boolean;
};

export type ReorderInfo = {
  /** The item that was dragged. */
  item: any;
  /** 0-based index in the canonical (un-reversed) array, before the move. */
  fromIndex: number;
  /** 0-based index in the canonical (un-reversed) array, after the move. */
  toIndex: number;
  /** Human-readable summary, e.g. "Toronto moved from position 1 to position 3".
   *  Best-effort: derived from item.name/label/title/id or the item itself
   *  when stringifiable. Trace consumers (Inspector, xs-trace tooling) can
   *  surface this directly. */
  description: string;
};

export type DndListNativeProps = {
  items: any[];
  renderItem: (contextVars: ContextVars, key: number) => ReactNode;
  onReorder?: (newItems: any[], info: ReorderInfo) => void;
  getItemId?: (item: any, index: number) => string | number;
  reverse?: boolean;
  /** When true, only a rendered ⋮⋮ grip carries the drag listeners; the rest
   *  of the row stays fully interactive (inputs, buttons, text selection).
   *  Default false keeps the v0 behavior where the whole row is the handle. */
  dragHandle?: boolean;
};

function defaultItemLabel(item: any): string {
  if (item == null) return "(empty)";
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (typeof item === "object") {
    if (item.name !== undefined) return String(item.name);
    if (item.label !== undefined) return String(item.label);
    if (item.title !== undefined) return String(item.title);
    if (item.id !== undefined) return `#${String(item.id)}`;
  }
  return String(item);
}

const defaultGetItemId = (item: any, index: number): string | number => {
  if (item == null) return index;
  if (typeof item === "object") {
    if (item.id !== undefined) return String(item.id);
    if (item.name !== undefined) return String(item.name);
    try {
      return JSON.stringify(item);
    } catch {
      return index;
    }
  }
  return String(item);
};

export function DndListNative({
  items,
  renderItem,
  onReorder,
  getItemId = defaultGetItemId,
  reverse = false,
  dragHandle = false,
}: DndListNativeProps) {
  const normalized = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return reverse ? [...items].reverse() : items;
  }, [items, reverse]);

  // Tag each item with a stable id once per render, so the DragEndEvent
  // active.id / over.id round-trip lands us back on the right item.
  const idForIndex = useMemo(
    () => normalized.map((item, idx) => String(getItemId(item, idx))),
    [normalized, getItemId],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require a small drag distance so plain clicks don't trigger drag —
      // important when row content has its own buttons.
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldLocal = idForIndex.indexOf(String(active.id));
      const newLocal = idForIndex.indexOf(String(over.id));
      if (oldLocal < 0 || newLocal < 0) return;
      const newLocalOrder = arrayMove(normalized, oldLocal, newLocal);
      // If we rendered reversed, un-reverse the reported array so the caller
      // sees the canonical source-of-truth order.
      const newOrder = reverse ? [...newLocalOrder].reverse() : newLocalOrder;

      // Build the structured info payload. Map local indices into the canonical
      // array space so `fromIndex`/`toIndex` describe the move in terms of the
      // array the caller stores, not the rendered order.
      const last = normalized.length - 1;
      const fromIndex = reverse ? last - oldLocal : oldLocal;
      const toIndex = reverse ? last - newLocal : newLocal;
      const item = normalized[oldLocal];
      const description = `${defaultItemLabel(item)} moved from position ${fromIndex + 1} to position ${toIndex + 1}`;

      onReorder?.(newOrder, { item, fromIndex, toIndex, description });
    },
    [idForIndex, normalized, onReorder, reverse],
  );

  if (normalized.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={idForIndex} strategy={verticalListSortingStrategy}>
        {normalized.map((item, index) => (
          <SortableRow key={idForIndex[index]} id={idForIndex[index]} dragHandle={dragHandle}>
            {renderItem(
              {
                $item: item,
                $itemIndex: index,
                $isFirst: index === 0,
                $isLast: index === normalized.length - 1,
              },
              index,
            )}
          </SortableRow>
        ))}
      </SortableContext>
    </DndContext>
  );
}

// SortableRow wraps each rendered child in the dnd-kit sortable hook, applying
// transform styles. Two modes:
//   - default: the whole row carries the drag listeners (simple lists).
//   - dragHandle: only a rendered ⋮⋮ grip carries the listeners, so the row's
//     own content (inputs, buttons, selectable text) stays fully interactive.
//     The grip lives inside the extension because XMLUI markup can't spread
//     raw pointer/keyboard listeners onto components.
function SortableRow({
  id,
  dragHandle,
  children,
}: {
  id: string;
  dragHandle: boolean;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const baseStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (dragHandle) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...baseStyle, display: "flex", alignItems: "stretch", gap: 8 }}
      >
        <div
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            opacity: 0.5,
            fontSize: "1.1em",
            lineHeight: 1,
          }}
        >
          ⋮⋮
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...baseStyle,
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
      }}
      {...attributes}
      {...listeners}
    >
      <Fragment>{children}</Fragment>
    </div>
  );
}
