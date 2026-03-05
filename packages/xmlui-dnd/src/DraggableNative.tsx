import React, { forwardRef, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ComponentDef, RenderChildFn, LayoutContext, ContainerWrapperDef } from "xmlui";
import { useDragDropRegistry } from "./DragDropProviderNative";

type Props = {
  dragId: string;
  data?: Record<string, any>;
  disabled?: boolean;
  renderFn: RenderChildFn;
  children: ComponentDef | ComponentDef[] | undefined;
  layoutContext?: LayoutContext;
};

/**
 * Inner component that unconditionally calls useDraggable (React hook rules).
 * Only mounted while the item lives in the source area (not placed in a zone).
 */
function ActiveDraggable({ dragId, data, disabled, renderFn, children, layoutContext }: Props) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: dragId,
    data,
    disabled,
  });

  const style: React.CSSProperties | undefined = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  const node: ContainerWrapperDef = {
    type: "Container",
    contextVars: { $isDragging: isDragging },
    children: Array.isArray(children) ? children : children ? [children] : [],
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {renderFn(node, layoutContext)}
    </div>
  );
}

/**
 * Registers this item with the nearest DragDropProvider's registry so that
 * Droppable can render it after a drop. Renders ActiveDraggable only while the
 * item is in the source area; returns null once it has been placed in a zone.
 */
export const DraggableNative = forwardRef<HTMLDivElement, Props>(
  function DraggableNative({ dragId, data, disabled, renderFn, children, layoutContext }, _ref) {
    const registry = useDragDropRegistry();

    // Keep refs so the effect only fires when dragId changes, not on every
    // render caused by XMLUI recycling renderFn / children references.
    const registryRef = useRef(registry);
    registryRef.current = registry;

    const latestRef = useRef({ renderFn, children, layoutContext });
    latestRef.current = { renderFn, children, layoutContext };

    useEffect(() => {
      // Use getters so DroppableNative always reads the freshest values.
      registryRef.current?.register(dragId, {
        get renderFn() { return latestRef.current.renderFn; },
        get children() { return latestRef.current.children; },
        get layoutContext() { return latestRef.current.layoutContext; },
      });
      return () => {
        registryRef.current?.unregister(dragId);
      };
      // Only re-register when the drag identity changes.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dragId]);

    const isPlaced = registry != null && registry.placements[dragId] != null;

    // When placed, render nothing here — the item appears inside the Droppable.
    if (isPlaced) return null;

    return (
      <ActiveDraggable
        dragId={dragId}
        data={data}
        disabled={disabled}
        renderFn={renderFn}
        children={children}
        layoutContext={layoutContext}
      />
    );
  },
);
