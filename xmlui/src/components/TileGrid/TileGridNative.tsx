import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
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

export const defaultProps = {
  itemWidth: "120px",
  itemHeight: "140px",
  gap: "8px",
  loading: false,
  itemsSelectable: false,
  enableMultiSelection: true,
  checkboxPosition: "topStart" as CheckboxPosition,
  idKey: "id",
};

// =====================================================================================================================
// TileGrid native React component — virtualized grid (Steps 3-5)

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
      syncWithAppState,
      onSelectionDidChange,
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
    const handleResize = useCallback<ResizeObserverCallback>((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    }, []);
    useResizeObserver(outerRef, handleResize);

    // --- column calculation
    const itemWidthPx = parsePx(itemWidth, 120);
    const gapPx = parsePx(gap, 8);
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
    const { toggleRow, checkAllRows, selectedRowIdMap, selectedItems, selectionApi } =
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

    return (
      <div
        ref={composedRef}
        className={classnames(
          styles.tileGridWrapper,
          classes?.[COMPONENT_PART_KEY],
          className,
        )}
        style={style}
        role="grid"
        aria-label="Tile grid"
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
                    >
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
                      <div className={styles.tileContent}>
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
