import { Fragment, type ReactNode, useCallback, useEffect, useId, useMemo, useRef } from "react";
import { isPlainObject } from "lodash-es";
import { orderedKeys } from "../../components-core/utils/orderedKeys";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";

// =====================================================================================================================
// React Items component implementation

type Props = {
  items: any[];
  renderItem: (contextVars: any, key: string | number) => ReactNode;
  reverse?: boolean;
  /** Wrap each item so a text selection can be mapped back to it (#3959). Off by default. */
  trackSelection?: boolean;
  onTextSelectionDidChange?: (selection: ItemsTextSelection) => void;
  registerComponentApi?: RegisterComponentApiFn;
};

export type ItemsTextSelection = {
  text: string;
  startItem: any;
  endItem: any;
  startIndex: number | null;
  endIndex: number | null;
};

const SELECTION_ATTR = "data-xmlui-items-sel";

import { defaultProps } from "./Items.defaults";

function getItemKey(item: any, index: number): string | number {
  if (item && typeof item === "object") {
    const itemKey = item.$id ?? item.id ?? item.key;
    if (itemKey !== undefined && itemKey !== null) {
      return `${String(itemKey)}:${index}`;
    }
  }
  return index;
}

export function Items({
  items,
  renderItem,
  reverse = defaultProps.reverse,
  trackSelection = false,
  onTextSelectionDidChange,
  registerComponentApi,
}: Props) {
  const itemsToRender = useMemo(() => {
    if (!items) {
      return [];
    }
    let normalizedItems = items;
    if (isPlainObject(items)) {
      normalizedItems = orderedKeys(items).map((key) => items[key as keyof typeof items]);
    }
    return reverse ? [...normalizedItems].reverse() : normalizedItems;
  }, [items, reverse]);

  // --- Text selection across the rendered items (#3959). Each item's content is wrapped in a
  // --- `display: contents` span tagged with this instance's id and the item's index, so the
  // --- selection's anchor and focus nodes can be resolved to items with `closest()`. The
  // --- instance id keeps nested Items apart.
  const instanceId = useId();
  const itemsRef = useRef<any[]>(itemsToRender);
  itemsRef.current = itemsToRender;

  const getTextSelection = useCallback((): ItemsTextSelection => {
    const outside: ItemsTextSelection = {
      text: "",
      startItem: null,
      endItem: null,
      startIndex: null,
      endIndex: null,
    };
    const sel = typeof window !== "undefined" ? window.getSelection() : null;
    if (!sel || sel.rangeCount === 0 || !sel.anchorNode || !sel.focusNode) {
      return outside;
    }
    const selector = `[${SELECTION_ATTR}="${CSS.escape(instanceId)}"]`;
    const indexOf = (node: Node): number | null => {
      const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
      const host = el?.closest(selector) as HTMLElement | null;
      if (!host) return null;
      const index = Number(host.dataset.index);
      return Number.isInteger(index) ? index : null;
    };
    const anchor = indexOf(sel.anchorNode);
    const focus = indexOf(sel.focusNode);
    if (anchor === null || focus === null) {
      return outside;
    }
    const startIndex = Math.min(anchor, focus);
    const endIndex = Math.max(anchor, focus);
    return {
      text: sel.toString(),
      startItem: itemsRef.current[startIndex] ?? null,
      endItem: itemsRef.current[endIndex] ?? null,
      startIndex,
      endIndex,
    };
  }, [instanceId]);

  useEffect(() => {
    if (!trackSelection) return;
    registerComponentApi?.({ getTextSelection });
  }, [trackSelection, registerComponentApi, getTextSelection]);

  // --- Report selection changes once they settle: while a pointer button is down the browser
  // --- updates the selection on every move, so wait for pointerup. Keyboard selection reports
  // --- per step. An unchanged selection doesn't refire; leaving the container reports once.
  const onChangeRef = useRef(onTextSelectionDidChange);
  onChangeRef.current = onTextSelectionDidChange;
  const hasHandler = !!onTextSelectionDidChange;
  useEffect(() => {
    if (!trackSelection || !hasHandler) return;
    let pointerDown = false;
    let lastKey: string | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const evaluate = () => {
      const selection = getTextSelection();
      if (selection.startIndex === null) {
        if (lastKey === null) return;
        lastKey = null;
      } else {
        const key = `${selection.startIndex}|${selection.endIndex}|${selection.text}`;
        if (key === lastKey) return;
        lastKey = key;
      }
      onChangeRef.current?.(selection);
    };
    const onSelectionChange = () => {
      if (!pointerDown) evaluate();
    };
    const onPointerDown = () => {
      pointerDown = true;
    };
    const onPointerUp = () => {
      pointerDown = false;
      // --- Let the browser finish placing the selection before reading it
      clearTimeout(timer);
      timer = setTimeout(evaluate, 0);
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerUp, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerUp, true);
    };
  }, [trackSelection, hasHandler, getTextSelection]);

  if (!itemsToRender || !Array.isArray(itemsToRender)) {
    return null;
  }

  return (
    <>
      {itemsToRender.map((item, index) => {
        const key = getItemKey(item, index);
        const rendered = renderItem?.(
          {
            $item: item,
            $itemIndex: index,
            $isFirst: index === 0,
            $isLast: index === itemsToRender.length - 1,
          },
          key,
        );
        return (
          <Fragment key={key}>
            {trackSelection ? (
              <span
                style={{ display: "contents" }}
                {...{ [SELECTION_ATTR]: instanceId }}
                data-index={index}
              >
                {rendered}
              </span>
            ) : (
              rendered
            )}
          </Fragment>
        );
      })}
    </>
  );
}
