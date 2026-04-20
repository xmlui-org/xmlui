import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ForwardedRef, KeyboardEvent, ReactNode } from "react";
import classnames from "classnames";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import type { CustomItemComponent, CustomItemComponentProps, VirtualizerHandle } from "virtua";
import { Virtualizer } from "virtua";
import styles from "./TileGrid.module.scss";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useResizeObserver } from "../../components-core/utils/hooks";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import useRowSelection from "../Table/useRowSelection";
import { ThemedToggle as Toggle } from "../Checkbox/Checkbox";
import {
  parseKeyBinding,
  matchesKeyEvent,
} from "../../parsers/keybinding-parser/keybinding-parser";

// Parses a CSS pixel value string (e.g. "120px") to its numeric value.
function parsePx(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}

/**
 * Pure function that computes the next focused index for 2-D grid keyboard navigation.
 * Returns null when the key is not a navigation key.
 *
 * @param key    - KeyboardEvent.key value
 * @param ctrl   - true when Ctrl or Cmd is held
 * @param focusedIndex - current focused flat index (-1 = nothing focused)
 * @param count  - total number of items
 * @param cols   - number of columns in the grid
 * @param visibleRows - number of fully visible rows (used for PageUp/PageDown)
 */
export function computeNextFocusIndex({
  key,
  ctrl,
  focusedIndex,
  count,
  cols,
  visibleRows,
}: {
  key: string;
  ctrl: boolean;
  focusedIndex: number;
  count: number;
  cols: number;
  visibleRows: number;
}): number | null {
  if (count === 0) return null;
  // First key press when nothing is focused always lands on item 0.
  if (focusedIndex < 0) return 0;
  switch (key) {
    case "ArrowLeft":
      return Math.max(0, focusedIndex - 1);
    case "ArrowRight":
      return Math.min(count - 1, focusedIndex + 1);
    case "ArrowUp": {
      const prev = focusedIndex - cols;
      return prev < 0 ? focusedIndex : prev;
    }
    case "ArrowDown": {
      const next = focusedIndex + cols;
      return next >= count ? focusedIndex : next;
    }
    case "Home":
      return ctrl ? 0 : Math.floor(focusedIndex / cols) * cols;
    case "End":
      return ctrl
        ? count - 1
        : Math.min(count - 1, Math.floor(focusedIndex / cols) * cols + cols - 1);
    case "PageUp":
      return Math.max(0, focusedIndex - visibleRows * cols);
    case "PageDown":
      return Math.min(count - 1, focusedIndex + visibleRows * cols);
    default:
      return null;
  }
}

// Custom virtua item component — renders each row div with the correct style.
const RowItem = forwardRef(({ children, style }: CustomItemComponentProps, ref: any) => (
  <div ref={ref} style={style}>
    {children}
  </div>
));

// =====================================================================================================================
// TileGrid component props

export type CheckboxPosition = "topStart" | "topEnd" | "bottomStart" | "bottomEnd";

export type TileGridProps = {
  data?: any[];
  itemWidth?: string;
  itemHeight?: string;
  gap?: string;
  stretchItems?: boolean;
  loading?: boolean;
  itemsSelectable?: boolean;
  enableMultiSelection?: boolean;
  toggleSelectionOnClick?: boolean;
  syncWithAppState?: any;
  checkboxPosition?: CheckboxPosition;
  hideSelectionCheckboxes?: boolean;
  idKey?: string;
  itemUserSelect?: string;
  renderVersion?: number;
  itemRenderer?: (item: any, index: number, count: number, selected: boolean) => ReactNode;
  onSelectionDidChange?: AsyncFunction;
  onItemDoubleClick?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  onSelectAllAction?: AsyncFunction;
  onContextMenuItem?: (item: any, index: number, event: React.MouseEvent) => void;
  updateState?: (state: Record<string, unknown>) => void;
  registerComponentApi?: RegisterComponentApiFn;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
};

const DEFAULT_KEY_BINDINGS = {
  selectAll: parseKeyBinding("CmdOrCtrl+A"),
  cut: parseKeyBinding("CmdOrCtrl+X"),
  copy: parseKeyBinding("CmdOrCtrl+C"),
  paste: parseKeyBinding("CmdOrCtrl+V"),
  delete: parseKeyBinding("Delete"),
};

export const defaultProps = {
  itemWidth: "120px",
  itemHeight: "140px",
  gap: "8px",
  stretchItems: false,
  loading: false,
  itemsSelectable: false,
  enableMultiSelection: true,
  toggleSelectionOnClick: false,
  checkboxPosition: "topStart" as CheckboxPosition,
  hideSelectionCheckboxes: false,
  idKey: "id",
  itemUserSelect: "none",
};

// =====================================================================================================================
// TileGrid native React component — virtualized grid (Steps 3-7)

export const TileGridNative = memo(
  forwardRef<HTMLDivElement, TileGridProps>(function TileGrid(
    {
      data,
      itemWidth = defaultProps.itemWidth,
      itemHeight = defaultProps.itemHeight,
      gap = defaultProps.gap,
      stretchItems = defaultProps.stretchItems,
      loading = defaultProps.loading,
      idKey = defaultProps.idKey,
      itemsSelectable = defaultProps.itemsSelectable,
      enableMultiSelection = defaultProps.enableMultiSelection,
      toggleSelectionOnClick = defaultProps.toggleSelectionOnClick,
      checkboxPosition = defaultProps.checkboxPosition,
      hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
      itemUserSelect = defaultProps.itemUserSelect,
      syncWithAppState,
      onSelectionDidChange,
      onItemDoubleClick,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      onSelectAllAction,
      onContextMenuItem,
      itemRenderer,
      registerComponentApi,
      style,
      className,
      classes,
    },
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) {
    // --- refs
    const outerRef = useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(outerRef, forwardedRef);
    const virtualizerRef = useRef<VirtualizerHandle>(null);

    // --- container dimensions for column/page calculation
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [resolvedGapPx, setResolvedGapPx] = useState(() => parsePx(gap, 8));
    const handleResize = useCallback<ResizeObserverCallback>((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
        setContainerHeight(entry.contentRect.height);
        // getComputedStyle resolves var() references for regular CSS properties,
        // so we read columnGap (which we also set on the wrapper element as the
        // gap value) to get the actual numeric pixel value.
        if (outerRef.current) {
          const computedGap = parseFloat(
            window.getComputedStyle(outerRef.current).columnGap,
          );
          if (!isNaN(computedGap)) setResolvedGapPx(computedGap);
        }
      }
    }, []);
    useResizeObserver(outerRef, handleResize);

    // --- column calculation
    const itemWidthPx = parsePx(itemWidth, 120);
    // resolvedGapPx is updated via getComputedStyle so CSS custom properties
    // (e.g. var(--xmlui-gap-normal)) are resolved to actual pixel values.
    const gapPx = resolvedGapPx;
    const itemHeightPx = parsePx(itemHeight, 140);

    const cols =
      containerWidth > 0
        ? Math.max(1, Math.floor((containerWidth + gapPx) / (itemWidthPx + gapPx)))
        : 1;

    // Row height = tile height + gap (gap is added as paddingBottom on each row)
    const rowSize = itemHeightPx + gapPx;

    // How many rows fit in the visible area (used for PageUp/PageDown)
    const visibleRows = containerHeight > 0 ? Math.max(1, Math.floor(containerHeight / rowSize)) : 5;

    // When stretchItems is true, compute the exact tile width so tiles in each
    // full row have the same size and, together with the gaps, exactly fill
    // the container width. The last row may still have remaining space if it
    // is not completely filled. Sub-pixel values are fine in CSS.
    const effectiveItemWidth = stretchItems && cols > 0 && containerWidth > 0
      ? `${(containerWidth - gapPx * (cols - 1)) / cols}px`
      : itemWidth;

    const items = useMemo(() => data ?? [], [data]);
    const count = items.length;

    const rows = useMemo(() => {
      if (count === 0) return [];
      const result: any[][] = [];
      for (let i = 0; i < count; i += cols) {
        result.push(items.slice(i, i + cols));
      }
      return result;
    }, [items, count, cols]);

    // --- selection
    const { toggleRow, checkAllRows, selectedRowIdMap, selectedItems, selectionApi, toggleRowIndex } =
      useRowSelection({
        items,
        visibleItems: items,
        rowsSelectable: itemsSelectable,
        enableMultiRowSelection: enableMultiSelection,
        toggleSelectionOnClick,
        onSelectionDidChange,
        syncWithAppState,
      });

    // --- independent focus-indicator index
    // Kept separate from useRowSelection's internal focusedIndex so that
    // Ctrl/Cmd+navigation can move the focus ring without changing the selection
    // (standard Windows Ctrl+Arrow / Ctrl+Home/End behaviour).
    const [focusedTileIndex, setFocusedTileIndex] = useState(-1);

    // --- clamp focus when data shrinks
    useEffect(() => {
      if (focusedTileIndex >= count) {
        setFocusedTileIndex(count > 0 ? count - 1 : -1);
      }
    }, [count, focusedTileIndex]);

    // --- auto-scroll to keep focused tile visible
    useEffect(() => {
      if (focusedTileIndex >= 0) {
        virtualizerRef.current?.scrollToIndex(Math.floor(focusedTileIndex / cols), { align: "nearest" });
      }
    }, [focusedTileIndex, cols]);

    // Refs for values used inside the component API so the effect doesn't re-run
    // when data/idKey change (which would trigger registerComponentApi on every render).
    const itemsRef = useRef(items);
    itemsRef.current = items;
    const idKeyRef = useRef(idKey);
    idKeyRef.current = idKey;

    useEffect(() => {
      registerComponentApi?.({
        clearSelection: () => {
          selectionApi.clearSelection();
          setFocusedTileIndex(-1);
        },
        selectAll: () => selectionApi.selectAll(),
        selectId: (id: any) => {
          selectionApi.selectId(id);
          // Move focus to the selected item (first if array).
          const targetId = String(Array.isArray(id) ? id[0] : id);
          const idx = itemsRef.current.findIndex(
            (item) => String(item[idKeyRef.current]) === targetId,
          );
          setFocusedTileIndex(idx >= 0 ? idx : -1);
        },
        getSelectedItems: () => selectionApi.getSelectedItems(),
        getSelectedIds: () => selectionApi.getSelectedIds(),
      });
    }, [registerComponentApi, selectionApi]);

    // --- keyboard shortcut handler (action keys + 2-D grid navigation)
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (!itemsSelectable) return;
        const nativeEvent = event.nativeEvent;
        const currentSelectedItems = selectionApi.getSelectedItems();
        const currentSelectedIds = selectionApi.getSelectedIds();

        // --- Action shortcuts (Cut / Copy / Paste / Delete / SelectAll)
        if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.selectAll)) {
          event.preventDefault();
          event.stopPropagation();
          selectionApi.selectAll();
          // selectAll updates React state asynchronously; pass the expected result directly.
          const allIds = items.map(item => item[idKey]);
          onSelectAllAction?.(items, allIds);
          return;
        }
        if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.cut) && onCutAction) {
          event.preventDefault();
          event.stopPropagation();
          onCutAction(null, currentSelectedItems, currentSelectedIds);
          return;
        }
        if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.copy) && onCopyAction) {
          event.preventDefault();
          event.stopPropagation();
          onCopyAction(null, currentSelectedItems, currentSelectedIds);
          return;
        }
        if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.paste) && onPasteAction) {
          event.preventDefault();
          event.stopPropagation();
          onPasteAction(null, currentSelectedItems, currentSelectedIds);
          return;
        }
        if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.delete) && onDeleteAction) {
          event.preventDefault();
          event.stopPropagation();
          onDeleteAction(null, currentSelectedItems, currentSelectedIds);
          return;
        }

        // Modifier-only keys match no tile-grid action. Stop propagation to prevent
        // bubbling to Main.xmlui → runCodeAsync → cloneDeep(state) → ~160ms per key-repeat.
        if (event.key === "Control" || event.key === "Meta" || event.key === "Shift" || event.key === "Alt") {
          event.stopPropagation();
          return;
        }

        // --- Space: toggle selection of the focused tile without moving focus
        if (event.key === " " && focusedTileIndex >= 0) {
          event.preventDefault();
          event.stopPropagation();
          toggleRowIndex(focusedTileIndex, { metaKey: true });
          return;
        }

        // --- 2-D grid navigation
        const NAV_KEYS = [
          "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
          "Home", "End", "PageUp", "PageDown",
        ];
        if (!NAV_KEYS.includes(event.key)) return;

        if (count === 0) return;
        event.preventDefault();
        event.stopPropagation();

        const ctrl = event.ctrlKey || event.metaKey;
        const shift = event.shiftKey;

        const newIndex = computeNextFocusIndex({
          key: event.key,
          ctrl,
          focusedIndex: focusedTileIndex,
          count,
          cols,
          visibleRows,
        });

        if (newIndex !== null) {
          if (ctrl && !shift) {
            // Ctrl/Cmd without Shift: move the focus ring without touching the selection.
            // This matches Windows Ctrl+Arrow / Ctrl+Home / Ctrl+End behaviour and lets
            // the user reposition the focus anchor before doing a Shift+navigation.
            setFocusedTileIndex(newIndex);
          } else {
            toggleRowIndex(newIndex, { shiftKey: shift, source: "keyboard" });
            setFocusedTileIndex(newIndex);
          }
        }
      },
      [
        itemsSelectable,
        count,
        cols,
        visibleRows,
        focusedTileIndex,
        items,
        idKey,
        selectionApi,
        toggleRowIndex,
        onSelectAllAction,
        onCutAction,
        onCopyAction,
        onPasteAction,
        onDeleteAction,
      ],
    );

    return (
      <div
        ref={composedRef}
        className={classnames(
          styles.tileGridWrapper,
          classes?.[COMPONENT_PART_KEY],
          className,
        )}
        style={{ ...style, columnGap: gap }}
        role="grid"
        aria-label="Tile grid"
        tabIndex={itemsSelectable ? 0 : undefined}
        onKeyDown={itemsSelectable ? handleKeyDown : undefined}
      >
        {!loading && rows.length > 0 && containerWidth > 0 && (
          <Virtualizer
            ref={virtualizerRef}
            scrollRef={outerRef}
            itemSize={rowSize}
            item={RowItem as CustomItemComponent}
          >
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={styles.tileRow}
                style={{ gap, paddingBottom: rowIndex < rows.length - 1 ? gap : undefined }}
                role="row"
              >
                {row.map((item, colIndex) => {
                  const globalIndex = rowIndex * cols + colIndex;
                  const isSelected =
                    selectedRowIdMap[String(item[idKey] ?? globalIndex)] ?? false;
                  return (
                    <div
                      key={item[idKey] ?? globalIndex}
                      className={classnames(styles.tileWrapper, {
                        [styles.selected]: isSelected,
                        [styles.focused]: itemsSelectable && globalIndex === focusedTileIndex,
                      })}
                      style={{ width: effectiveItemWidth, height: itemHeight }}
                      role="gridcell"
                      aria-selected={itemsSelectable ? isSelected : undefined}
                      onClick={
                        itemsSelectable
                          ? (e) => {
                              const isCtrl = e.metaKey || e.ctrlKey;
                              // Ctrl/Cmd+Click on an already-selected tile deselects it;
                              // clear focus so no outline remains (matches Table behaviour).
                              if (isCtrl && isSelected) {
                                setFocusedTileIndex(-1);
                              } else {
                                setFocusedTileIndex(globalIndex);
                              }
                              toggleRow(item, {
                                shiftKey: e.shiftKey,
                                metaKey: isCtrl,
                              });
                            }
                          : undefined
                      }
                      onDoubleClick={
                        onItemDoubleClick
                          ? () => onItemDoubleClick(item)
                          : undefined
                      }
                      onContextMenu={
                        onContextMenuItem
                          ? (event) => { onContextMenuItem(item, globalIndex, event); }
                          : undefined
                      }
                    >
                      {itemsSelectable && isSelected && (
                        <div className={styles.selectedIndicator} />
                      )}
                      {itemsSelectable && !hideSelectionCheckboxes && (
                        <div
                          className={classnames(
                            styles.checkboxOverlay,
                            styles[checkboxPosition],
                          )}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Toggle
                            tabIndex={-1}
                            aria-label={`Select ${item[idKey] ?? globalIndex}`}
                            value={isSelected}
                            onDidChange={() => {
                              // When unchecking via checkbox, clear focus (matches Table behaviour).
                              if (isSelected) {
                                setFocusedTileIndex(-1);
                              } else {
                                setFocusedTileIndex(globalIndex);
                              }
                              toggleRow(item, { metaKey: true });
                            }}
                          />
                        </div>
                      )}
                      <div className={styles.tileContent} style={{ userSelect: itemUserSelect as React.CSSProperties["userSelect"] }}>
                        {itemRenderer?.(item, globalIndex, count, isSelected)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </Virtualizer>
        )}
      </div>
    );
  }),
);
