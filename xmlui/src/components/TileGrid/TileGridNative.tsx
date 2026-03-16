import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";
import type { CustomItemComponent, CustomItemComponentProps } from "virtua";
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
  loading?: boolean;
  itemsSelectable?: boolean;
  enableMultiSelection?: boolean;
  syncWithAppState?: any;
  checkboxPosition?: CheckboxPosition;
  idKey?: string;
  itemUserSelect?: string;
  itemRenderer?: (item: any, index: number, count: number, selected: boolean) => ReactNode;
  onSelectionDidChange?: AsyncFunction;
  onItemDoubleClick?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  onSelectAllAction?: AsyncFunction;
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
  loading: false,
  itemsSelectable: false,
  enableMultiSelection: true,
  checkboxPosition: "topStart" as CheckboxPosition,
  idKey: "id",
  itemUserSelect: "none",
};

// =====================================================================================================================
// TileGrid native React component — virtualized grid (Steps 3-7)

export const TileGridNative = memo(
  forwardRef<HTMLDivElement, TileGridProps>(function TileGridNative(
    {
      data,
      itemWidth = defaultProps.itemWidth,
      itemHeight = defaultProps.itemHeight,
      gap = defaultProps.gap,
      loading = defaultProps.loading,
      idKey = defaultProps.idKey,
      itemsSelectable = defaultProps.itemsSelectable,
      enableMultiSelection = defaultProps.enableMultiSelection,
      checkboxPosition = defaultProps.checkboxPosition,
      itemUserSelect = defaultProps.itemUserSelect,
      syncWithAppState,
      onSelectionDidChange,
      onItemDoubleClick,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      onSelectAllAction,
      itemRenderer,
      registerComponentApi,
      style,
      className,
      classes,
    },
    ref,
  ) {
    // --- refs
    const outerRef = useRef<HTMLDivElement | null>(null);
    const composedRef = ref ? composeRefs(outerRef, ref) : outerRef;

    // --- container width for column calculation
    const [containerWidth, setContainerWidth] = useState(0);
    const [resolvedGapPx, setResolvedGapPx] = useState(() => parsePx(gap, 8));
    const handleResize = useCallback<ResizeObserverCallback>((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
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

    const items = data ?? [];
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
    const { toggleRow, checkAllRows, selectedRowIdMap, selectedItems, selectionApi, onKeyDown } =
      useRowSelection({
        items,
        visibleItems: items,
        rowsSelectable: itemsSelectable,
        enableMultiRowSelection: enableMultiSelection,
        onSelectionDidChange,
        syncWithAppState,
      });

    useEffect(() => {
      registerComponentApi?.({
        clearSelection: () => selectionApi.clearSelection(),
        selectAll: () => selectionApi.selectAll(),
        selectId: (id: any) => selectionApi.selectId(id),
        getSelectedItems: () => selectionApi.getSelectedItems(),
        getSelectedIds: () => selectionApi.getSelectedIds(),
      });
    }, [registerComponentApi, selectionApi]);

    // --- keyboard shortcut handler
    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (!itemsSelectable) return;
        const nativeEvent = event.nativeEvent;
        const selectedItems = selectionApi.getSelectedItems();
        const selectedIds = selectionApi.getSelectedIds();

        if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.selectAll)) {
          event.preventDefault();
          event.stopPropagation();
          selectionApi.selectAll();
          onSelectAllAction?.(selectedItems, selectedIds);
        } else if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.cut) && onCutAction) {
          event.preventDefault();
          event.stopPropagation();
          onCutAction(null, selectedItems, selectedIds);
        } else if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.copy) && onCopyAction) {
          event.preventDefault();
          event.stopPropagation();
          onCopyAction(null, selectedItems, selectedIds);
        } else if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.paste) && onPasteAction) {
          event.preventDefault();
          event.stopPropagation();
          onPasteAction(null, selectedItems, selectedIds);
        } else if (matchesKeyEvent(nativeEvent, DEFAULT_KEY_BINDINGS.delete) && onDeleteAction) {
          event.preventDefault();
          event.stopPropagation();
          onDeleteAction(null, selectedItems, selectedIds);
        } else {
          // Delegate to useRowSelection's navigation handler
          onKeyDown(event as any);
        }
      },
      [
        itemsSelectable,
        selectionApi,
        onSelectAllAction,
        onCutAction,
        onCopyAction,
        onPasteAction,
        onDeleteAction,
        onKeyDown,
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
        {!loading && rows.length > 0 && (
          <Virtualizer
            scrollRef={outerRef}
            itemSize={rowSize}
            item={RowItem as CustomItemComponent}
          >
            {rows.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={styles.tileRow}
                style={{ gap, paddingBottom: gap }}
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
                      })}
                      style={{ width: itemWidth, height: itemHeight }}
                      role="gridcell"
                      aria-selected={itemsSelectable ? isSelected : undefined}
                      onClick={
                        itemsSelectable
                          ? (e) =>
                              toggleRow(item, {
                                shiftKey: e.shiftKey,
                                metaKey: e.metaKey || e.ctrlKey,
                              })
                          : undefined
                      }
                      onDoubleClick={
                        onItemDoubleClick
                          ? () => onItemDoubleClick(item)
                          : undefined
                      }
                    >
                      {itemsSelectable && isSelected && (
                        <div className={styles.selectedIndicator} />
                      )}
                      {itemsSelectable && (
                        <div
                          className={classnames(
                            styles.checkboxOverlay,
                            styles[checkboxPosition],
                          )}
                        >
                          <Toggle
                            aria-label={`Select ${item[idKey] ?? globalIndex}`}
                            value={isSelected}
                            onDidChange={() => toggleRow(item, { metaKey: true })}
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
