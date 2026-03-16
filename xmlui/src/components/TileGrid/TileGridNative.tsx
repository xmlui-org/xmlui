import { forwardRef, memo, useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import classnames from "classnames";
import { composeRefs } from "@radix-ui/react-compose-refs";
import styles from "./TileGrid.module.scss";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import { useResizeObserver } from "../../components-core/utils/hooks";

// Parses a CSS pixel value string (e.g. "120px") to its numeric value.
function parsePx(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}

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
  onSelectionDidChange?: (selectedItems: any[]) => void;
  onItemDoubleClick?: (item: any) => void;
  onCutAction?: (item: any, selectedItems: any[], selectedIds: any[]) => void;
  onCopyAction?: (item: any, selectedItems: any[], selectedIds: any[]) => void;
  onPasteAction?: (item: any, selectedItems: any[], selectedIds: any[]) => void;
  onDeleteAction?: (item: any, selectedItems: any[], selectedIds: any[]) => void;
  onSelectAllAction?: (selectedItems: any[], selectedIds: any[]) => void;
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
// TileGrid native React component — grid layout with responsive column calculation (Step 2)

export const TileGridNative = memo(
  forwardRef<HTMLDivElement, TileGridProps>(function TileGridNative(
    {
      data,
      itemWidth = defaultProps.itemWidth,
      itemHeight = defaultProps.itemHeight,
      gap = defaultProps.gap,
      loading = defaultProps.loading,
      idKey = defaultProps.idKey,
      itemRenderer,
      style,
      className,
      classes,
    },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement>(null);
    const composedRef = ref ? composeRefs(innerRef, ref) : innerRef;

    const [containerWidth, setContainerWidth] = useState(0);

    const handleResize = useCallback<ResizeObserverCallback>((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    }, []);

    useResizeObserver(innerRef, handleResize);

    const itemWidthPx = parsePx(itemWidth, 120);
    const gapPx = parsePx(gap, 8);
    const cols =
      containerWidth > 0
        ? Math.max(1, Math.floor((containerWidth + gapPx) / (itemWidthPx + gapPx)))
        : 1;

    const items = data ?? [];

    const rows = useMemo(() => {
      if (items.length === 0) return [];
      const result: any[][] = [];
      for (let i = 0; i < items.length; i += cols) {
        result.push(items.slice(i, i + cols));
      }
      return result;
    }, [items, cols]);

    return (
      <div
        ref={composedRef}
        className={classnames(styles.tileGridWrapper, classes?.["-component"], className)}
        style={style}
        role="grid"
        aria-label="Tile grid"
      >
        {!loading &&
          rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={styles.tileRow}
              style={{ gap, marginBottom: gap }}
              role="row"
            >
              {row.map((item, colIndex) => {
                const globalIndex = rowIndex * cols + colIndex;
                return (
                  <div
                    key={item[idKey] ?? globalIndex}
                    className={styles.tileWrapper}
                    style={{ width: itemWidth, height: itemHeight }}
                    role="gridcell"
                  >
                    <div className={styles.tileContent}>
                      {itemRenderer?.(item, globalIndex, items.length, false)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    );
  }),
);
