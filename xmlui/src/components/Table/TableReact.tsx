import type { CSSProperties, ForwardedRef, PointerEvent, ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import type {
  CellContext,
  Column,
  ColumnDef,
  HeaderContext,
  PaginationState,
  Row,
  RowData,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import {
  Virtualizer,
  type VirtualizerHandle,
  type CustomItemComponentProps,
  type CustomItemComponent,
} from "virtua";
import { get } from "lodash-es";
import classnames from "classnames";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";

import styles from "./Table.module.scss";

import "./react-table-config.d.ts";
import type { RegisterComponentApiFn } from "../../abstractions/RendererDefs";
import type { AsyncFunction } from "../../abstractions/FunctionDefs";
import { EMPTY_ARRAY } from "../../components-core/constants";
import { defaultProps } from "./Table.defaults";
import { useEvent } from "../../components-core/utils/misc";
import {
  useHasExplicitHeight,
  useIsomorphicLayoutEffect,
  usePrevious,
  useResizeObserver,
  useScrollParent,
  useStartMarginState,
} from "../../components-core/utils/hooks";
import { useVirtualizedRenderCache } from "../../components-core/utils/virtualized-render-cache";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { isThemeVarName } from "../../components-core/theming/transformThemeVars";
import { ThemedSpinner as Spinner } from "../Spinner/Spinner";
import { ThemedToggle as Toggle } from "../Checkbox/Checkbox";
import { ThemedColorPicker } from "../ColorPicker/ColorPicker";
import { ThemedSwitch } from "../Switch/Switch";
import { ThemedIcon } from "../Icon/Icon";
import { ThemedTooltip as Tooltip } from "../Tooltip/Tooltip";
import { type OurColumnMetadata, type TypedCellBooleanResolver } from "../Column/TableContext";
import useRowSelection from "./useRowSelection";
import { ThemedPagination, type Position } from "../Pagination/Pagination";
import { Part } from "../Part/Part";
import {
  parseKeyBinding,
  matchesKeyEvent,
  type ParsedKeyBinding,
} from "../../parsers/keybinding-parser/keybinding-parser";
import { toCssVar } from "../../components-core/theming/layout-resolver";
import { buildInferredColumns } from "./table-column-inference";
import { normalizeColumnType, type NormalizedColumnType } from "../Column/column-types";
import { useLocaleProfile, type LocaleProfile } from "../../components-core/i18n";
import { Value } from "../Value/ValueReact";
import {
  areSourceIdSetsEqual,
  diffInsertedIds,
  getSourceIdSet,
  isPreserveScrollTarget,
  shouldInferFirstInserted,
  type CollectionDataRefreshMode,
  type CollectionDataRefreshOptions,
  type CollectionScrollMetrics,
} from "../../components-core/abstractions/dataRefreshAbstractions";

// =====================================================================================================================
// Helper types

// --- Declaration merging, see here: https://tanstack.com/table/v8/docs/api/core/table#meta
declare module "@tanstack/table-core" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    cellRenderer: (...args: any[]) => any;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    style?: CSSProperties;
    className?: string;
    starSizedWidth?: string;
    accessorKey?: string;
    pinTo?: string;
    headerHorizontalAlignment?: string;
    tooltipOptions?: Record<string, any>;
    tooltipRenderer?: (row: any, rowIdx: number, colIdx: number, value?: any) => ReactNode;
    cellRenderer?: (row: any, rowIdx: number, colIdx: number, value?: any) => ReactNode;
    columnType?: NormalizedColumnType;
    readOnly?: boolean;
    readOnlyResolver?: TypedCellBooleanResolver;
    enabled?: boolean;
    enabledResolver?: TypedCellBooleanResolver;
    willChange?: AsyncFunction;
    didChange?: AsyncFunction;
    fillCellContent?: boolean;
  }
}

/**
 * This type describes an arbitraty table row that has an integer identifier and an order index.
 */
type RowWithOrder = {
  /**
   * Order index; we use it with paging.
   */
  order: number;

  [x: string | number | symbol]: unknown;
};

type SortingDirection = "ascending" | "descending";
export const TablePaginationControlsLocationValues = ["top", "bottom", "both"] as const;
export type TablePaginationControlsLocation =
  (typeof TablePaginationControlsLocationValues)[number];

export const CheckboxToleranceValues = ["none", "compact", "comfortable", "spacious"] as const;
export type CheckboxTolerance = (typeof CheckboxToleranceValues)[number];

export const TableColumnSizingValues = ["auto", "stretch", "balanced", "content"] as const;
export type TableColumnSizing = (typeof TableColumnSizingValues)[number];

function hasExpandedInteractiveDescendant(element: HTMLElement | null) {
  return !!element?.querySelector('[aria-expanded="true"]');
}

function sortTableData<T extends Record<string, any>>(
  data: T[],
  sortBy: string,
  sortingDirection: SortingDirection,
  locale: string,
): T[] {
  const direction = sortingDirection === "ascending" ? 1 : -1;
  const collator = new Intl.Collator(locale);

  return data
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const result = compareTableSortValues(
        get(left.item, sortBy),
        get(right.item, sortBy),
        collator,
      );
      return result === 0 ? left.index - right.index : result * direction;
    })
    .map(({ item }) => item);
}

function compareTableSortValues(a: unknown, b: unknown, collator: Intl.Collator): number {
  if (a === b) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  if (typeof a === "string" || typeof b === "string") {
    return collator.compare(String(a), String(b));
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return collator.compare(String(a), String(b));
}

const TableCellTooltip = memo(function TableCellTooltip({
  children,
  tooltipTemplate,
  tooltipOptions,
}: {
  children: ReactNode;
  tooltipTemplate: ReactNode;
  tooltipOptions?: Record<string, any>;
}) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const pointerInsideTriggerRef = useRef(false);
  const hadExpandedInteractiveDescendantRef = useRef(false);
  const reopenOnPointerMoveRef = useRef(false);
  const [open, setOpen] = useState(false);

  const closeTooltip = useCallback(() => {
    setOpen(false);
  }, []);

  const syncInteractiveDescendantState = useCallback(() => {
    const hasExpandedDescendant = hasExpandedInteractiveDescendant(triggerRef.current);
    if (hasExpandedDescendant || hadExpandedInteractiveDescendantRef.current) {
      pointerInsideTriggerRef.current = false;
      reopenOnPointerMoveRef.current =
        hadExpandedInteractiveDescendantRef.current && !hasExpandedDescendant;
      closeTooltip();
    }
    hadExpandedInteractiveDescendantRef.current = hasExpandedDescendant;
  }, [closeTooltip]);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const observer = new MutationObserver(syncInteractiveDescendantState);
    observer.observe(trigger, {
      attributes: true,
      attributeFilter: ["aria-expanded"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, [syncInteractiveDescendantState]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(
      nextOpen &&
        pointerInsideTriggerRef.current &&
        !hasExpandedInteractiveDescendant(triggerRef.current),
    );
  }, []);

  const handlePointerEnter = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      pointerInsideTriggerRef.current = true;
      if (reopenOnPointerMoveRef.current && !hasExpandedInteractiveDescendant(triggerRef.current)) {
        reopenOnPointerMoveRef.current = false;
        setOpen(true);
      }
      if (isValidElement(children)) {
        (children as ReactElement<any>).props.onPointerEnter?.(event);
      }
    },
    [children],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!hasExpandedInteractiveDescendant(triggerRef.current)) {
        pointerInsideTriggerRef.current = true;
        if (reopenOnPointerMoveRef.current) {
          reopenOnPointerMoveRef.current = false;
          setOpen(true);
        }
      }
      if (isValidElement(children)) {
        (children as ReactElement<any>).props.onPointerMove?.(event);
      }
    },
    [children],
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      pointerInsideTriggerRef.current = false;
      closeTooltip();
      if (isValidElement(children)) {
        (children as ReactElement<any>).props.onPointerLeave?.(event);
      }
    },
    [children, closeTooltip],
  );

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        ref: triggerRef,
        onPointerEnter: handlePointerEnter,
        onPointerMove: handlePointerMove,
        onPointerLeave: handlePointerLeave,
      })
    : children;

  return (
    <Tooltip
      text=""
      tooltipTemplate={tooltipTemplate}
      open={open}
      onOpenChange={handleOpenChange}
      {...tooltipOptions}
    >
      {trigger}
    </Tooltip>
  );
});

// =====================================================================================================================
// Table Action Context Types

/**
 * Context information about a specific row
 */
export type TableRowContext = {
  /** The row data object */
  item: any;
  /** Row index in the visible/filtered data (0-based) */
  rowIndex: number;
  /** Row ID (from idKey property) */
  rowId: string;
  /** Whether this row is currently selected */
  isSelected: boolean;
  /** Whether this row is currently focused */
  isFocused: boolean;
};

/**
 * Complete context passed to table action event handlers
 */
export type TableActionContext = {
  /** Array of selected row IDs */
  selectedIds: string[];
  /** Array of selected row items (full row objects) */
  selectedItems: any[];
  /** Current focused row context (if any) */
  row: TableRowContext | null;
};

/**
 * Helper function to build action context parameters from current table state.
 * Returns three separate values instead of an object for cleaner event handler APIs.
 *
 * @param selectedItems - Array of selected row items
 * @param selectedRowIdMap - Map of selected row IDs
 * @param focusedIndex - Currently focused row index (-1 if none)
 * @param data - All table data
 * @param idKey - Property name used for row IDs
 * @returns Tuple of [row context, selected items, selected IDs]
 */
function buildActionContext(
  selectedItems: any[],
  selectedRowIdMap: Record<string, boolean>,
  focusedIndex: number,
  data: any[],
  idKey: string,
): [TableRowContext | null, any[], string[]] {
  const selectedIds = Object.keys(selectedRowIdMap).filter((id) => selectedRowIdMap[id]);

  let row: TableRowContext | null = null;
  if (focusedIndex >= 0 && focusedIndex < data.length) {
    const item = data[focusedIndex];
    row = {
      item,
      rowIndex: focusedIndex,
      rowId: String(item[idKey]),
      isSelected: selectedRowIdMap[String(item[idKey])] ?? false,
      isFocused: true,
    };
  }

  return [row, selectedItems, selectedIds];
}

// =====================================================================================================================
// React Table component implementation

type CellVerticalAlign = "top" | "center" | "bottom";
type RowDetailRenderer = (
  row: any,
  rowIndex: number,
  rowId: string,
  isExpanded: boolean,
) => ReactNode;

const END_ALIGNED_COLUMN_TYPES = new Set<NormalizedColumnType["name"]>([
  "number",
  "integer",
  "decimal",
  "percent",
  "currency",
  "accounting",
  "scientific",
  "bytes",
  "duration",
  "rating",
]);

type TableProps = {
  data: any[];
  columns?: OurColumnMetadata[];
  columnInference?: string;
  columnSizing?: TableColumnSizing;
  canResizeColumns?: boolean;
  idKey?: string;
  dataRefreshMode?: CollectionDataRefreshMode;
  hasExplicitColumns?: boolean;
  isPaginated?: boolean;
  loading?: boolean;
  loadingDelay?: number;
  headerHeight?: string | number;
  rowsSelectable?: boolean;
  enableMultiRowSelection?: boolean;
  toggleSelectionOnClick?: boolean;
  initiallySelected?: string[];
  syncWithAppState?: any;
  pageSizeOptions?: number[];
  currentPageIndex?: number;
  pageSize?: number;
  paginationControlsLocation?: TablePaginationControlsLocation;
  rowDisabledPredicate?: (item: any) => boolean;
  rowUnselectablePredicate?: (item: any) => boolean;
  sortBy?: string;
  sortingDirection?: SortingDirection;
  defaultSortDirection?: SortingDirection;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconNoSort?: string;
  lookupEventHandler?: any;
  sortingDidChange?: AsyncFunction;
  onSelectionDidChange?: AsyncFunction;
  willSort?: AsyncFunction;
  style?: CSSProperties;
  className?: string;
  classes?: Record<string, string>;
  uid?: string;
  noDataRenderer?: () => ReactNode;
  rowDetailRenderer?: RowDetailRenderer;
  expandedRowIds?: any;
  initiallyExpandedRowIds?: any;
  rowExpansionDidChange?: (expandedRowIds: string[], expandedItems: any[]) => void;
  autoFocus?: boolean;
  hideHeader?: boolean;
  hideNoDataView?: boolean;
  hideSelectionCheckboxes?: boolean;
  renderCache?: boolean;
  renderCacheSize?: number;
  virtualBufferSize?: number;
  renderVersion?: number;
  hideSelectionCheckboxesHeader?: boolean;
  alwaysShowSelectionCheckboxesHeader?: boolean;
  alwaysShowSelectionCheckboxes?: boolean;
  alwaysShowSortingIndicator?: boolean;
  alwaysShowPagination?: boolean;
  registerComponentApi: RegisterComponentApiFn;
  noBottomBorder?: boolean;
  cellVerticalAlign?: CellVerticalAlign;
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  showCurrentPage?: boolean;
  buttonRowPosition?: Position;
  pageSizeSelectorPosition?: Position;
  pageInfoPosition?: Position;
  checkboxTolerance?: CheckboxTolerance;
  rowHeight?: number;
  rowDoubleClick?: (item: any) => void;
  rowClick?: (item: any) => void;
  rowEnter?: (item: any) => void;
  rowLeave?: (item: any) => void;
  headerUserSelect?: string;
  cellUserSelect?: string;
  userSelectCell?: string;
  userSelectRow?: string;
  userSelectHeading?: string;
  keyBindings?: Record<string, string>;
  onScroll?: (event: {
    scrollTop: number;
    scrollHeight: number;
    viewportSize: number;
    atEnd: boolean;
    visibleRange: { startIndex: number; endIndex: number };
    itemCount: number;
  }) => void;
  onVisibleRangeDidChange?: (range: { startIndex: number; endIndex: number }) => void;
  onSelectAllAction?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  alwaysShowHeader?: boolean;
  striped?: boolean;
  highlightHoveredColumn?: boolean;
};

type PendingDataRefresh = {
  sourceIds: Set<string>;
  scrollMetrics: CollectionScrollMetrics;
  options?: CollectionDataRefreshOptions;
};

function getScrollMetrics(virtualizer: VirtualizerHandle | null): CollectionScrollMetrics {
  return {
    scrollPosition: virtualizer?.scrollOffset ?? 0,
    scrollSize: virtualizer?.scrollSize ?? 0,
    viewportSize: virtualizer?.viewportSize ?? 0,
  };
}

function defaultIsRowDisabled(_: any) {
  return false;
}

function defaultIsRowUnselectable(_: any) {
  return false;
}

function getDefaultTypeStyle(columnType?: NormalizedColumnType): CSSProperties | undefined {
  if (columnType && INTERACTIVE_COLUMN_TYPES.has(columnType.name)) {
    return {
      display: "flex",
      justifyContent: "center",
      textAlign: "center",
    };
  }

  if (!columnType || !END_ALIGNED_COLUMN_TYPES.has(columnType.name)) {
    return undefined;
  }

  return {
    display: "flex",
    justifyContent: "flex-end",
    textAlign: "end",
  };
}

function resolveColumnSizingMode(
  columnSizing: TableColumnSizing | undefined,
  hasExplicitColumns: boolean | undefined,
  columnCount: number,
): Exclude<TableColumnSizing, "auto"> {
  if (columnSizing && columnSizing !== "auto") {
    return columnSizing;
  }
  return hasExplicitColumns || columnCount > 0 ? "stretch" : "balanced";
}

function getDefaultTypeWidth(
  columnType: NormalizedColumnType | undefined,
  columnSizing: Exclude<TableColumnSizing, "auto">,
  header?: string,
  canSort?: boolean,
  canResize?: boolean,
): string | number | undefined {
  if (!columnType) {
    return undefined;
  }
  if (INTERACTIVE_COLUMN_TYPES.has(columnType.name)) {
    return getInteractiveColumnDefaultWidth(columnType.name, header, canSort, canResize);
  }
  if (columnSizing === "stretch") {
    return undefined;
  }
  if (columnSizing === "balanced" && STAR_WIDTH_TYPES.has(columnType.name)) {
    return columnType.name === "long-text" || columnType.name === "markdown" ? "2*" : "*";
  }
  return TYPE_WIDTHS[columnType.name] ?? CONTENT_WIDTHS[columnType.name];
}

function getDefaultTypeMinWidth(
  columnType: NormalizedColumnType | undefined,
  columnSizing: Exclude<TableColumnSizing, "auto">,
): number | undefined {
  if (!columnType || columnSizing === "stretch") {
    return undefined;
  }
  return MIN_WIDTHS[columnType.name];
}

const SELECT_COLUMN_WIDTH = 42;
const EXPAND_COLUMN_WIDTH = 42;
const EXPAND_COLUMN_ID = "__row_expand";

const DEFAULT_PAGE_SIZES = [10];

const DEFAULT_CELL_HORIZONTAL_PADDING = 12;
const DEFAULT_INTERACTIVE_CELL_INLINE_PADDING = DEFAULT_CELL_HORIZONTAL_PADDING / 2;
const DEFAULT_HEADER_HORIZONTAL_PADDING = 12;
const HEADER_RESIZE_HANDLE_WIDTH = 6;
const HEADER_SORT_INDICATOR_WIDTH = 16;
const HEADER_SORT_INDICATOR_GAP = 4;
const AVERAGE_HEADER_CHARACTER_WIDTH = 7;

const INTERACTIVE_COLUMN_CONTROL_WIDTHS: Partial<Record<NormalizedColumnType["name"], number>> = {
  checkbox: 20,
  switch: 58,
  color: 50,
};

const TYPE_WIDTHS: Partial<Record<NormalizedColumnType["name"], number>> = {
  id: 96,
  uuid: 260,
  number: 120,
  integer: 96,
  decimal: 120,
  percent: 96,
  currency: 140,
  accounting: 140,
  scientific: 120,
  bytes: 112,
  duration: 112,
  rating: 96,
  boolean: 88,
  "yes-no": 88,
  date: 128,
  time: 112,
  datetime: 176,
  timestamp: 152,
  "iso-date": 128,
  "relative-time": 128,
  enum: 128,
  status: 128,
  tag: 128,
};

const INTERACTIVE_COLUMN_TYPES = new Set<NormalizedColumnType["name"]>([
  "checkbox",
  "switch",
  "color",
]);

function getInteractiveColumnDefaultWidth(
  columnTypeName: NormalizedColumnType["name"],
  header?: string,
  canSort?: boolean,
  canResize?: boolean,
): number {
  const controlWidth =
    (INTERACTIVE_COLUMN_CONTROL_WIDTHS[columnTypeName] ?? 0) + DEFAULT_CELL_HORIZONTAL_PADDING;
  const headerWidth = estimateHeaderWidth(header, canSort, canResize);
  return Math.ceil(Math.max(controlWidth, headerWidth));
}

function estimateHeaderWidth(header?: string, canSort?: boolean, canResize?: boolean): number {
  const text = header?.trim();
  if (!text) {
    return 0;
  }
  return (
    estimateHeaderTextWidth(text) +
    DEFAULT_HEADER_HORIZONTAL_PADDING +
    (canSort ? HEADER_SORT_INDICATOR_WIDTH + HEADER_SORT_INDICATOR_GAP : 0) +
    (canResize ? HEADER_RESIZE_HANDLE_WIDTH : 0)
  );
}

function estimateHeaderTextWidth(text: string): number {
  return text.length * AVERAGE_HEADER_CHARACTER_WIDTH;
}

function normalizeExpandedRowIds(value: any): Record<string, true> {
  if (value == null || value === false) {
    return {};
  }
  if (value instanceof Set) {
    return Array.from(value).reduce<Record<string, true>>((acc, id) => {
      acc[String(id)] = true;
      return acc;
    }, {});
  }
  if (Array.isArray(value)) {
    return value.reduce<Record<string, true>>((acc, id) => {
      if (id != null) {
        acc[String(id)] = true;
      }
      return acc;
    }, {});
  }
  if (typeof value === "object") {
    return Object.entries(value).reduce<Record<string, true>>((acc, [id, expanded]) => {
      if (expanded) {
        acc[String(id)] = true;
      }
      return acc;
    }, {});
  }
  return { [String(value)]: true };
}

function areExpandedRowIdMapsEqual(
  left: Record<string, true>,
  right: Record<string, true>,
): boolean {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length && leftKeys.every((key) => right[key]);
}

function getExpandedRowIds(expandedRowIdMap: Record<string, true>): string[] {
  return Object.keys(expandedRowIdMap);
}

function getItemRowId(item: any, index: number, idKey: string): string {
  const idVal = item?.[idKey];
  return idVal != null ? String(idVal) : String(index);
}

function getHeaderJustifyContent(
  horizontalAlignment?: string,
): React.CSSProperties["justifyContent"] | undefined {
  if (!horizontalAlignment) {
    return undefined;
  }
  return horizontalAlignment === "start"
    ? "flex-start"
    : horizontalAlignment === "center"
      ? "center"
      : horizontalAlignment === "end"
        ? "flex-end"
        : horizontalAlignment;
}

const CONTENT_WIDTHS: Partial<Record<NormalizedColumnType["name"], number>> = {
  text: 180,
  "short-text": 160,
  name: 180,
  email: 220,
  phone: 160,
  url: 240,
  link: 220,
  "long-text": 320,
  markdown: 320,
  address: 260,
  json: 260,
  object: 260,
  array: 220,
  list: 220,
  tags: 220,
};

const STAR_WIDTH_TYPES = new Set<NormalizedColumnType["name"]>([
  "text",
  "short-text",
  "name",
  "email",
  "phone",
  "url",
  "link",
  "long-text",
  "markdown",
  "address",
  "json",
  "object",
  "array",
  "list",
  "tags",
]);

const MIN_WIDTHS: Partial<Record<NormalizedColumnType["name"], number>> = {
  text: 120,
  "short-text": 120,
  name: 120,
  email: 160,
  phone: 120,
  url: 160,
  link: 160,
  "long-text": 220,
  markdown: 220,
  address: 180,
  json: 180,
  object: 180,
  array: 160,
  list: 160,
  tags: 160,
};

type SelectionToggleProps = {
  checkboxTolerance: CheckboxTolerance;
  ariaLabel: string;
  value: boolean;
  indeterminate: boolean;
  onDidChange: () => void;
  alwaysVisibleClassName?: string;
};

function SelectionToggle({
  checkboxTolerance,
  ariaLabel,
  value,
  indeterminate,
  onDidChange,
  alwaysVisibleClassName,
}: SelectionToggleProps) {
  const wrapperClassName = classnames(styles.checkBoxWrapper, alwaysVisibleClassName, {
    [styles.toleranceCompact]: checkboxTolerance === "compact",
    [styles.toleranceComfortable]: checkboxTolerance === "comfortable",
    [styles.toleranceSpacious]: checkboxTolerance === "spacious",
  });
  return (
    <div className={wrapperClassName}>
      <Toggle
        {...{
          "aria-label": ariaLabel,
          className: styles.selectionToggle,
          value,
          indeterminate,
          onDidChange,
        }}
      />
    </div>
  );
}

type TypedColumnCellProps = {
  value: unknown;
  valueType: NormalizedColumnType;
  localeProfile: LocaleProfile;
  row: any;
  rowIndex: number;
  colIndex: number;
  columnId: string;
  readOnly?: boolean;
  readOnlyResolver?: TypedCellBooleanResolver;
  enabled?: boolean;
  enabledResolver?: TypedCellBooleanResolver;
  onValueChange?: (newValue: boolean | string) => void;
  onValueChanged?: () => void;
  onWillChange?: AsyncFunction;
  onDidChange?: AsyncFunction;
};

function TypedColumnCell({
  value,
  valueType,
  localeProfile,
  row,
  rowIndex,
  colIndex,
  columnId,
  readOnly,
  readOnlyResolver,
  enabled,
  enabledResolver,
  onValueChange,
  onValueChanged,
  onWillChange,
  onDidChange,
}: TypedColumnCellProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleDidChange = useCallback(
    async (newValue: boolean | string) => {
      const shouldChange = await onWillChange?.(newValue, row, rowIndex, columnId, value);
      if (shouldChange === false) {
        return;
      }
      onValueChange?.(newValue);
      setLocalValue(newValue);
      onDidChange?.(newValue, row, rowIndex, columnId, value);
      onValueChanged?.();
    },
    [columnId, onDidChange, onValueChange, onValueChanged, onWillChange, row, rowIndex, value],
  );

  if (!INTERACTIVE_COLUMN_TYPES.has(valueType.name)) {
    return (
      <Value
        value={value}
        valueType={valueType}
        localeProfile={localeProfile}
        withColumnKindAttribute
      />
    );
  }

  const ariaLabel = `${columnId} row ${rowIndex + 1}`;
  const commonControlProps = {
    "aria-label": ariaLabel,
    "data-column-cell-kind": valueType.name,
  };
  const resolvedReadOnly =
    readOnlyResolver?.(row, rowIndex, colIndex, columnId, localValue) ?? readOnly;
  const resolvedEnabled =
    enabledResolver?.(row, rowIndex, colIndex, columnId, localValue) ?? enabled;

  switch (valueType.name) {
    case "checkbox":
      return (
        <Toggle
          {...commonControlProps}
          value={toBooleanCellValue(localValue)}
          readOnly={resolvedReadOnly}
          enabled={resolvedEnabled}
          onDidChange={handleDidChange}
        />
      );
    case "switch":
      return (
        <ThemedSwitch
          {...commonControlProps}
          value={toBooleanCellValue(localValue)}
          readOnly={resolvedReadOnly}
          enabled={resolvedEnabled}
          onDidChange={handleDidChange}
          variant="switch"
        />
      );
    case "color":
      return (
        <ThemedColorPicker
          {...commonControlProps}
          value={toColorCellValue(localValue)}
          readOnly={resolvedReadOnly}
          enabled={resolvedEnabled}
          onDidChange={handleDidChange}
        />
      );
    default:
      return null;
  }
}

function toBooleanCellValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && value !== 0;
  }
  if (typeof value === "string") {
    return value.trim() !== "" && value.toLowerCase() !== "false";
  }
  return !!value;
}

function toColorCellValue(value: unknown): string {
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  return "#000000";
}

function getLocaleProfileRenderKey(localeProfile: LocaleProfile): string {
  return [
    localeProfile.locale,
    localeProfile.decimalSeparator ?? "",
    localeProfile.groupSeparator ?? "",
    localeProfile.minusSign ?? "",
    localeProfile.currency ?? "",
    localeProfile.numberingSystem ?? "",
  ].join("\u0000");
}

//These are the important styles to make sticky column pinning work!
//Apply styles like this using your CSS strategy of choice with this kind of logic to head cells, data cells, footer cells, etc.
//View the index.css file for more needed styles such as border-collapse: separate
const getCommonPinningStyles = (column: Column<RowWithOrder>, isHeader = false): CSSProperties => {
  const isPinned = column.getIsPinned();
  // const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left");
  // const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right");

  return {
    // boxShadow: isLastLeftPinnedColumn
    //   ? "-4px 0 4px -4px gray inset"
    //   : isFirstRightPinnedColumn
    //   ? "4px 0 4px -4px gray inset"
    //   : undefined,
    left: isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right: isPinned === "right" ? `${column.getAfter("right")}px` : undefined,
    position: isPinned ? "sticky" : "relative",
    backgroundColor: isPinned
      ? isHeader
        ? toCssVar("$backgroundColor-heading-Table")
        : column.id === "select"
          ? `var(--checkbox-cell-bg, ${toCssVar("$backgroundColor-selectionCell-Table")})`
          : `var(--pinned-cell-bg, ${toCssVar("$backgroundColor-pinnedCell-Table")})`
      : undefined,
    zIndex: isPinned ? 1 : undefined,
  };
};

/**
 * Custom hook to handle keyboard actions for the Table component
 * Merges user-provided key bindings with defaults and detects conflicts
 */
function useTableKeyboardActions({
  keyBindings,
  onSelectAllAction,
  onCutAction,
  onCopyAction,
  onPasteAction,
  onDeleteAction,
  selectedItems,
  selectedRowIdMap,
  focusedIndex,
  data,
  idKey,
  rowsSelectable,
  selectionApi,
}: {
  keyBindings: Record<string, string>;
  onSelectAllAction?: AsyncFunction;
  onCutAction?: AsyncFunction;
  onCopyAction?: AsyncFunction;
  onPasteAction?: AsyncFunction;
  onDeleteAction?: AsyncFunction;
  selectedItems: any[];
  selectedRowIdMap: Record<string, boolean>;
  focusedIndex: number | null;
  data: any[];
  idKey: string;
  rowsSelectable: boolean;
  selectionApi: any;
}) {
  // Merge user key bindings with defaults (user bindings take precedence)
  const mergedBindings = useMemo(() => {
    return {
      ...defaultProps.keyBindings,
      ...keyBindings,
    };
  }, [keyBindings]);

  // Parse key bindings and detect duplicates
  const parsedBindings = useMemo(() => {
    const parsed: Record<string, { binding: ParsedKeyBinding; action: string }> = {};
    const keyToActions: Record<string, string[]> = {};

    // Parse each key binding
    Object.entries(mergedBindings).forEach(([action, keyString]) => {
      if (!keyString) return;

      try {
        const binding = parseKeyBinding(keyString);
        parsed[action] = { binding, action };

        // Track which actions use the same key for duplicate detection
        const keySignature = keyString.toLowerCase().trim();
        if (!keyToActions[keySignature]) {
          keyToActions[keySignature] = [];
        }
        keyToActions[keySignature].push(action);
      } catch (error) {
        console.warn(`Failed to parse key binding for action '${action}': ${keyString}`, error);
      }
    });

    // Log warnings for duplicate key bindings
    Object.entries(keyToActions).forEach(([key, actions]) => {
      if (actions.length > 1) {
        console.warn(
          `Key binding conflict: '${key}' is bound to multiple actions: [${actions.join(", ")}]. Using: ${actions[actions.length - 1]}`,
        );
      }
    });

    return parsed;
  }, [mergedBindings]);

  // Create composite keyboard handler
  const handleKeyboardActions = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Check each parsed binding
      for (const { binding, action } of Object.values(parsedBindings)) {
        if (matchesKeyEvent(event.nativeEvent, binding)) {
          // Call the appropriate handler
          let handled = false;
          switch (action) {
            case "selectAll":
              // Only handle selectAll if rows are selectable
              if (rowsSelectable) {
                // First, select all items via the API
                selectionApi.selectAll();

                // Build the selectedRowIdMap for all items (since selectAll selects everything)
                const allSelectedRowIdMap: Record<string, boolean> = {};
                data.forEach((item: any) => {
                  allSelectedRowIdMap[String(item[idKey])] = true;
                });

                // Build context with all items selected
                const [row, allItems, allIds] = buildActionContext(
                  data, // All data items are selected
                  allSelectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );

                // Finally, invoke the event handler if provided
                if (onSelectAllAction) {
                  onSelectAllAction(row, allItems, allIds);
                }
                handled = true;
              }
              break;
            case "cut":
              if (rowsSelectable && onCutAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onCutAction(row, items, ids);
                handled = true;
              }
              break;
            case "copy":
              if (rowsSelectable && onCopyAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onCopyAction(row, items, ids);
                handled = true;
              }
              break;
            case "paste":
              if (onPasteAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onPasteAction(row, items, ids);
                handled = true;
              }
              break;
            case "delete":
              if (rowsSelectable && onDeleteAction) {
                const [row, items, ids] = buildActionContext(
                  selectedItems,
                  selectedRowIdMap,
                  focusedIndex,
                  data,
                  idKey,
                );
                onDeleteAction(row, items, ids);
                handled = true;
              }
              break;
          }

          if (handled) {
            // Prevent default browser behavior when key matches and action is handled.
            // Also stop propagation so parent React onKeyDown handlers don't double-fire.
            event.preventDefault();
            event.stopPropagation();
            return true; // Signal that the event was handled
          }
        }
      }

      return false; // Event not handled
    },
    [
      parsedBindings,
      onSelectAllAction,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      selectedItems,
      selectedRowIdMap,
      focusedIndex,
      data,
      idKey,
      rowsSelectable,
      selectionApi,
    ],
  );

  return handleKeyboardActions;
}

export const Table = memo(
  forwardRef(function Table(
    {
      data = defaultProps.data,
      columns = defaultProps.columns,
      columnInference = defaultProps.columnInference,
      columnSizing: columnSizingMode = defaultProps.columnSizing,
      canResizeColumns = defaultProps.canResizeColumns,
      idKey: inferenceIdKey = defaultProps.idKey,
      dataRefreshMode = defaultProps.dataRefreshMode,
      hasExplicitColumns = false,
      isPaginated,
      loading = defaultProps.loading,
      loadingDelay = defaultProps.loadingDelay,
      headerHeight,
      rowsSelectable = defaultProps.rowsSelectable,
      enableMultiRowSelection = defaultProps.enableMultiRowSelection,
      toggleSelectionOnClick = defaultProps.toggleSelectionOnClick,
      initiallySelected = defaultProps.initiallySelected,
      syncWithAppState,
      pageSizeOptions = defaultProps.pageSizeOptions,
      pageSize,
      currentPageIndex = 0,
      rowDisabledPredicate = defaultIsRowDisabled,
      rowUnselectablePredicate = defaultIsRowUnselectable,
      sortBy,
      sortingDirection,
      defaultSortDirection = defaultProps.defaultSortDirection,
      iconSortAsc,
      iconSortDesc,
      iconNoSort,
      sortingDidChange,
      willSort,
      lookupEventHandler,
      style,
      className,
      classes,
      noDataRenderer,
      rowDetailRenderer,
      expandedRowIds,
      initiallyExpandedRowIds,
      rowExpansionDidChange,
      autoFocus = defaultProps.autoFocus,
      hideHeader = defaultProps.hideHeader,
      hideNoDataView = defaultProps.hideNoDataView,
      hideSelectionCheckboxes = defaultProps.hideSelectionCheckboxes,
      renderCache = defaultProps.renderCache,
      renderCacheSize = defaultProps.renderCacheSize,
      virtualBufferSize,
      renderVersion = 0,
      hideSelectionCheckboxesHeader = defaultProps.hideSelectionCheckboxesHeader,
      alwaysShowSelectionCheckboxes = defaultProps.alwaysShowSelectionCheckboxes,
      alwaysShowPagination,
      alwaysShowSelectionCheckboxesHeader = defaultProps.alwaysShowSelectionCheckboxesHeader,
      alwaysShowSortingIndicator = defaultProps.alwaysShowSortingIndicator,
      registerComponentApi,
      onSelectionDidChange,
      noBottomBorder = defaultProps.noBottomBorder,
      paginationControlsLocation = defaultProps.paginationControlsLocation,
      cellVerticalAlign = defaultProps.cellVerticalAlign,
      buttonRowPosition = defaultProps.buttonRowPosition,
      pageSizeSelectorPosition = defaultProps.pageSizeSelectorPosition,
      pageInfoPosition = defaultProps.pageInfoPosition,
      showCurrentPage = defaultProps.showCurrentPage,
      showPageInfo = defaultProps.showPageInfo,
      showPageSizeSelector = defaultProps.showPageSizeSelector,
      checkboxTolerance = defaultProps.checkboxTolerance,
      rowHeight = defaultProps.rowHeight,
      rowDoubleClick,
      rowClick,
      rowEnter,
      rowLeave,
      headerUserSelect,
      cellUserSelect,
      userSelectCell,
      userSelectRow,
      userSelectHeading,
      keyBindings = defaultProps.keyBindings,
      onScroll,
      onVisibleRangeDidChange,
      onSelectAllAction,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      alwaysShowHeader = defaultProps.alwaysShowHeader,
      striped = defaultProps.striped,
      highlightHoveredColumn = defaultProps.highlightHoveredColumn,
      ...rest
      // cols
    }: TableProps,
    forwardedRef: ForwardedRef<HTMLDivElement>,
  ) {
    const { getThemeVar } = useTheme();
    const localeProfile = useLocaleProfile();
    const effectiveUserSelectCell =
      cellUserSelect ??
      userSelectCell ??
      getThemeVar("userSelect-cell-Table") ??
      defaultProps.userSelectCell;
    const effectiveUserSelectRow =
      userSelectRow ?? getThemeVar("userSelect-row-Table") ?? defaultProps.userSelectRow;
    const effectiveUserSelectHeading =
      headerUserSelect ??
      userSelectHeading ??
      getThemeVar("userSelect-heading-Table") ??
      defaultProps.userSelectHeading;

    const safeData = Array.isArray(data) ? data : EMPTY_ARRAY;
    const isExpansionControlled = expandedRowIds !== undefined;
    const controlledExpandedRowIdMap = useMemo(
      () => (isExpansionControlled ? normalizeExpandedRowIds(expandedRowIds) : undefined),
      [expandedRowIds, isExpansionControlled],
    );
    const [uncontrolledExpandedRowIdMap, setUncontrolledExpandedRowIdMap] = useState<
      Record<string, true>
    >(() => normalizeExpandedRowIds(initiallyExpandedRowIds));
    const expandedRowIdMap = controlledExpandedRowIdMap ?? uncontrolledExpandedRowIdMap;
    const expandedRowIdMapRef = useRef(expandedRowIdMap);
    expandedRowIdMapRef.current = expandedRowIdMap;
    const isExpansionControlledRef = useRef(isExpansionControlled);
    isExpansionControlledRef.current = isExpansionControlled;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(wrapperRef, forwardedRef);
    const tableRef = useRef<HTMLTableElement>(null);
    const virtualizerRef = useRef<VirtualizerHandle>(null);
    const firstRowRef = useRef<HTMLTableRowElement>(null);

    const effectivePageSize = pageSize ?? (pageSizeOptions?.[0] || DEFAULT_PAGE_SIZES[0]);

    const effectivePageSizeOptions = useMemo(() => {
      if (pageSizeOptions.includes(effectivePageSize)) {
        return pageSizeOptions;
      }
      return [...pageSizeOptions, effectivePageSize].sort((a, b) => a - b);
    }, [pageSizeOptions, effectivePageSize]);

    const effectiveIsPaginated = useMemo(() => {
      if (isPaginated !== undefined) {
        return isPaginated;
      }
      if (pageSize !== undefined) {
        return safeData.length > effectivePageSize;
      }
      return defaultProps.isPaginated;
    }, [isPaginated, pageSize, safeData.length, effectivePageSize]);

    const currentDataRowIds = useMemo(
      () => new Set(safeData.map((item, index) => getItemRowId(item, index, inferenceIdKey))),
      [inferenceIdKey, safeData],
    );

    useEffect(() => {
      if (isExpansionControlled) {
        return;
      }
      setUncontrolledExpandedRowIdMap((prev) => {
        const next: Record<string, true> = {};
        for (const rowId of Object.keys(prev)) {
          if (currentDataRowIds.has(rowId)) {
            next[rowId] = true;
          }
        }
        return areExpandedRowIdMapsEqual(prev, next) ? prev : next;
      });
    }, [currentDataRowIds, isExpansionControlled]);

    const emitRowExpansionChange = useEvent((nextExpandedRowIdMap: Record<string, true>) => {
      if (!rowExpansionDidChange) {
        return;
      }
      const nextExpandedIds = getExpandedRowIds(nextExpandedRowIdMap);
      const nextExpandedItems = safeData.filter(
        (item, index) => nextExpandedRowIdMap[getItemRowId(item, index, inferenceIdKey)],
      );
      rowExpansionDidChange(nextExpandedIds, nextExpandedItems);
    });

    const setExpandedRows = useEvent((nextExpandedRowIdMap: Record<string, true>) => {
      if (areExpandedRowIdMapsEqual(expandedRowIdMapRef.current, nextExpandedRowIdMap)) {
        return;
      }
      if (!isExpansionControlledRef.current) {
        setUncontrolledExpandedRowIdMap(nextExpandedRowIdMap);
      }
      emitRowExpansionChange(nextExpandedRowIdMap);
    });

    const expandRow = useEvent((rowId: string | number) => {
      const id = String(rowId);
      setExpandedRows({ ...expandedRowIdMapRef.current, [id]: true });
    });

    const collapseRow = useEvent((rowId: string | number) => {
      const id = String(rowId);
      const { [id]: _removed, ...rest } = expandedRowIdMapRef.current;
      setExpandedRows(rest);
    });

    const toggleRowExpansion = useEvent((rowId: string | number) => {
      const id = String(rowId);
      if (expandedRowIdMapRef.current[id]) {
        collapseRow(id);
      } else {
        expandRow(id);
      }
    });

    const getCurrentExpandedRowIds = useEvent(() => getExpandedRowIds(expandedRowIdMapRef.current));
    const isRowExpanded = useEvent((rowId: string | number) => {
      return !!expandedRowIdMapRef.current[String(rowId)];
    });

    const safeColumns: OurColumnMetadata[] = useMemo(() => {
      if (hasExplicitColumns || columns.length > 0) {
        return columns;
      }
      if (!safeData.length) {
        return EMPTY_ARRAY;
      }
      return buildInferredColumns(safeData, columnInference, { idKey: inferenceIdKey });
    }, [columnInference, columns, hasExplicitColumns, inferenceIdKey, safeData]);

    const effectiveColumnSizingMode = resolveColumnSizingMode(
      columnSizingMode,
      hasExplicitColumns,
      columns.length,
    );

    useEffect(() => {
      if (autoFocus) {
        wrapperRef.current!.focus();
      }
    }, [autoFocus]);

    // --- Keep track of visible table rows
    const [visibleItems, setVisibleItems] = useState<any[]>(EMPTY_ARRAY);

    // --- Get the operations to manage selected rows in a table
    const {
      toggleRow,
      checkAllRows,
      focusedIndex,
      onKeyDown,
      selectedRowIdMap,
      idKey,
      selectionApi,
    } = useRowSelection({
      items: safeData,
      visibleItems,
      rowsSelectable,
      enableMultiRowSelection,
      toggleSelectionOnClick,
      rowDisabledPredicate,
      rowUnselectablePredicate,
      onSelectionDidChange,
      initiallySelected,
      syncWithAppState,
    });

    // --- Handle keyboard actions (selectAll, cut, copy, paste, delete)
    const handleKeyboardActions = useTableKeyboardActions({
      keyBindings,
      onSelectAllAction,
      onCutAction,
      onCopyAction,
      onPasteAction,
      onDeleteAction,
      selectedItems: selectionApi.getSelectedItems(),
      selectedRowIdMap,
      focusedIndex,
      data: safeData,
      idKey,
      rowsSelectable,
      selectionApi,
    });

    // --- Create composite keyboard handler that handles both actions and navigation
    const compositeKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        // Modifier-only keys match no table action. Without this guard they bubble to
        // Main.xmlui → runCodeAsync → cloneDeep(state) → ~160ms freeze per key-repeat.
        if (
          event.key === "Control" ||
          event.key === "Meta" ||
          event.key === "Shift" ||
          event.key === "Alt"
        ) {
          event.stopPropagation();
          return;
        }

        // First, try to handle keyboard actions (selectAll, cut, copy, paste, delete)
        const actionHandled = handleKeyboardActions(event);

        // If no action was handled, delegate to existing row selection keyboard navigation
        if (!actionHandled) {
          onKeyDown(event);
        }
      },
      [handleKeyboardActions, onKeyDown],
    );

    // --- Create data with order information whenever the items in the table change
    const dataWithOrder = useMemo(() => {
      return safeData.map((item, index) => {
        return {
          ...item,
          order: index + 1,
        };
      });
    }, [safeData]);

    // --- Local or external sorting of data
    const [_sortBy, _setSortBy] = useState(sortBy);
    // The initial direction when the table opens already sorted via `sortBy`.
    // An explicit `sortDirection` wins; otherwise `defaultSortDirection` supplies it, so
    // a table that declares "biggest first" opens that way instead of needing a click.
    const seedSortingDirection: SortingDirection =
      sortingDirection ?? defaultSortDirection ?? defaultProps.sortingDirection;

    const [_sortingDirection, _setSortingDirection] = useState(seedSortingDirection);

    useIsomorphicLayoutEffect(() => {
      _setSortBy(sortBy);
    }, [sortBy]);

    useIsomorphicLayoutEffect(() => {
      _setSortingDirection(seedSortingDirection);
    }, [seedSortingDirection]);

    const sortedData = useMemo(() => {
      if (!_sortBy) {
        return dataWithOrder;
      }
      return sortTableData(dataWithOrder, _sortBy, _sortingDirection, localeProfile.locale);
    }, [_sortBy, _sortingDirection, dataWithOrder, localeProfile.locale]);

    const _updateSorting = useCallback(
      async (accessorKey: string) => {
        // Where the cycle starts for THIS column: its own defaultSortDirection wins,
        // then the table-level one, then "ascending". The cycle itself is unchanged --
        // three states, only the starting point moves.
        const firstDirection: SortingDirection =
          safeColumns.find((col) => col.accessorKey === accessorKey)?.defaultSortDirection ??
          defaultSortDirection ??
          "ascending";
        const oppositeDirection: SortingDirection =
          firstDirection === "ascending" ? "descending" : "ascending";

        let newDirection: SortingDirection = firstDirection;
        let newSortBy = accessorKey;
        // The current key is the same as the last -> the user clicked on the same header twice
        if (_sortBy === accessorKey) {
          // Still on the first direction -> flip to the other one
          if (_sortingDirection === firstDirection) {
            newDirection = oppositeDirection;
            // Already on the second direction -> remove the sorting from the current key
          } else {
            newSortBy = undefined;
            // Report the direction the user was actually looking at, not the
            // cycle's starting point. Previously this left newDirection at
            // firstDirection, so clearing an ascending sort on a descending-first
            // column announced "descending" -- a direction that had never been on
            // screen (observed downstream, judell/bram#290).
            newDirection = _sortingDirection;
          }
        }

        // --- Check if sorting is allowed
        const result = await willSort?.(newSortBy, newDirection);
        if (result === false) {
          return;
        }

        _setSortingDirection(newDirection);
        _setSortBy(newSortBy);

        // External callback function is always called.
        // Even if sorting is internal, we can notify other components through this callback
        sortingDidChange?.(newSortBy, newDirection);
      },
      [_sortBy, willSort, sortingDidChange, _sortingDirection, safeColumns, defaultSortDirection],
    );

    // --- Prepare column renderers according to columns defined in the table
    const columnsWithCustomCell: ColumnDef<any>[] = useMemo(() => {
      return safeColumns.map((col, idx) => {
        // --- Obtain column width information
        const columnType = col.type
          ? normalizeColumnType(col.type, col.typeOptions).type
          : undefined;
        const header = col.header ?? col.accessorKey ?? " ";
        const enableResizing = col.canResize ?? canResizeColumns;
        const enableSorting = col.canSort !== false && !!col.accessorKey;
        const effectiveColumnWidth =
          col.width ??
          getDefaultTypeWidth(
            columnType,
            effectiveColumnSizingMode,
            header,
            enableSorting,
            enableResizing,
          );
        const effectiveMinWidth =
          col.minWidth ?? getDefaultTypeMinWidth(columnType, effectiveColumnSizingMode);
        const { width, starSizedWidth } = getColumnWidth(effectiveColumnWidth, true, "width");
        const { width: minWidth } = getColumnWidth(effectiveMinWidth, false, "minWidth");
        const { width: maxWidth } = getColumnWidth(col.maxWidth, false, "maxWidth");
        const typeStyle = getDefaultTypeStyle(columnType);
        const columnStyle = typeStyle ? { ...typeStyle, ...col.style } : col.style;

        const customColumn = {
          ...col,
          header,
          id: col.id ?? col.accessorKey ?? "col_" + idx,
          size: width,
          minSize: minWidth,
          maxSize: maxWidth,
          enableResizing,
          enableSorting,
          enablePinning: col.pinTo !== undefined,
          meta: {
            starSizedWidth,
            pinTo: col.pinTo,
            style: columnStyle,
            className: col.className,
            headerHorizontalAlignment: col.headerHorizontalAlignment,
            accessorKey: col.accessorKey,
            cellRenderer: col.cellRenderer,
            tooltipOptions: col.tooltipOptions,
            tooltipRenderer: col.tooltipRenderer,
            columnType,
            readOnly: col.readOnly,
            readOnlyResolver: col.readOnlyResolver,
            enabled: col.enabled,
            enabledResolver: col.enabledResolver,
            willChange: col.willChange,
            didChange: col.didChange,
            fillCellContent: col.fillCellContent,
          },
        };
        return customColumn;

        function getColumnWidth(
          colWidth: any,
          allowStarSize: boolean,
          propName: string,
        ): { width?: number; starSizedWidth?: string } {
          let starSizedWidth: string;
          let width: number;
          const resolvedWidth = isThemeVarName(colWidth) ? getThemeVar(colWidth) : colWidth;
          if (typeof resolvedWidth === "number") {
            width = resolvedWidth;
          } else if (typeof resolvedWidth === "string") {
            const oneStarSizedWidthMatch = resolvedWidth.match(/^\s*\*\s*$/);
            if (allowStarSize && oneStarSizedWidthMatch) {
              starSizedWidth = "1*";
            } else {
              const starSizedWidthMatch = resolvedWidth.match(/^\s*(\d+)\s*\*\s*$/);
              if (allowStarSize && starSizedWidthMatch) {
                starSizedWidth = starSizedWidthMatch[1] + "*";
              } else {
                const pixelWidthMatch = resolvedWidth.match(/^\s*(\d+(?:\.\d+)?)\s*(px)?\s*$/);
                if (pixelWidthMatch) {
                  width = parseFloat(pixelWidthMatch[1]);
                } else {
                  const remEmMatch = resolvedWidth.match(/^\s*(\d+(?:\.\d+)?)\s*(rem|em)\s*$/);
                  if (remEmMatch) {
                    const rootFontSize = parseFloat(
                      getComputedStyle(document.documentElement).fontSize,
                    );
                    width = parseFloat(remEmMatch[1]) * (isNaN(rootFontSize) ? 16 : rootFontSize);
                  } else {
                    // --- Do not throw here: this computation runs inside a `useMemo` in the
                    // --- inner Table render, past the point where XMLUI's per-component error
                    // --- containment (ComponentAdapter's try/catch) can catch it. A throw here
                    // --- propagates as a genuinely uncaught render error, which can take down
                    // --- far more than this one Table (see xmlui-org/xmlui#3867). Instead, we
                    // --- report the problem loudly to the console and fall back to the default
                    // --- width so rendering can continue.
                    console.error(
                      `[Table] Invalid TableColumnDef '${propName}' value: ${JSON.stringify(resolvedWidth)} ` +
                        `(column "${col.id ?? col.accessorKey ?? `col_${idx}`}"). Expected a number, a pixel ` +
                        `value (e.g. "100px"), a rem/em value (e.g. "2rem"), or (when allowed) a star-sized ` +
                        `value (e.g. "*", "2*"). Falling back to the default width.`,
                    );
                  }
                }
              }
            }
          }
          if (width === undefined && starSizedWidth === undefined && allowStarSize) {
            starSizedWidth = "1*";
          }
          return { width, starSizedWidth };
        }
      });
    }, [canResizeColumns, effectiveColumnSizingMode, getThemeVar, safeColumns]);

    // --- Prepare the selection column separately so hover-driven updates stay isolated to it
    const selectColumn: ColumnDef<any> = useMemo(() => {
      // --- Extend the columns with a selection checkbox (indeterminate) without affecting the main column sizing pipeline
      return {
        id: "select",
        size: SELECT_COLUMN_WIDTH,
        enableResizing: false,
        enablePinning: true,
        meta: {
          pinTo: "left",
        },
        header: ({ table }: HeaderContext<any, unknown>) =>
          enableMultiRowSelection && !hideSelectionCheckboxesHeader ? (
            <SelectionToggle
              checkboxTolerance={checkboxTolerance}
              ariaLabel="Select all rows"
              alwaysVisibleClassName={
                alwaysShowSelectionCheckboxesHeader ? styles.showInHeader : undefined
              }
              value={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onDidChange={() => {
                const allSelected = table
                  .getRowModel()
                  .rows.every(
                    (row) =>
                      rowDisabledPredicate(row.original) ||
                      rowUnselectablePredicate(row.original) ||
                      row.getIsSelected(),
                  );
                checkAllRows(!allSelected);
              }}
            />
          ) : null,
        cell: ({ row }: CellContext<any, unknown>) => {
          return (
            <>
              {row.getCanSelect() && (
                <SelectionToggle
                  checkboxTolerance={checkboxTolerance}
                  ariaLabel={`Select ${row.original[idKey]}`}
                  alwaysVisibleClassName={
                    alwaysShowSelectionCheckboxes ? styles.showInRow : undefined
                  }
                  value={row.getIsSelected()}
                  indeterminate={row.getIsSomeSelected()}
                  onDidChange={() => {
                    // In single selection mode, allow deselection by checking if already selected
                    if (!enableMultiRowSelection && row.getIsSelected()) {
                      checkAllRows(false); // Deselect all (which is just this one row)
                    } else {
                      toggleRow(row.original, { metaKey: true });
                    }
                  }}
                />
              )}
            </>
          );
        },
      };
    }, [
      idKey,
      enableMultiRowSelection,
      alwaysShowSelectionCheckboxesHeader,
      checkAllRows,
      toggleRow,
      checkboxTolerance,
      rowDisabledPredicate,
      rowUnselectablePredicate,
      hideSelectionCheckboxesHeader,
      alwaysShowSelectionCheckboxes,
    ]);

    const expandColumn: ColumnDef<any> = useMemo(() => {
      return {
        id: EXPAND_COLUMN_ID,
        size: EXPAND_COLUMN_WIDTH,
        enableResizing: false,
        enablePinning: true,
        meta: {
          pinTo: "left",
          className: styles.expandCell,
        },
        header: () => null,
        cell: ({ row }: CellContext<any, unknown>) => {
          const rowId = row.id;
          const isExpanded = !!expandedRowIdMap[rowId];
          return (
            <button
              type="button"
              className={styles.rowExpandButton}
              aria-label={`${isExpanded ? "Collapse" : "Expand"} row ${rowId}`}
              aria-expanded={isExpanded}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleRowExpansion(rowId);
              }}
            >
              <ThemedIcon
                name={isExpanded ? "chevrondown" : "chevronright"}
                fallback={isExpanded ? "chevrondown" : "chevronright"}
                size="16"
              />
            </button>
          );
        },
      };
    }, [expandedRowIdMap, toggleRowExpansion]);

    // --- Prepare column renderers according to columns defined in the table supporting optional row selection
    const columnsWithSelectColumn: ColumnDef<any>[] = useMemo(() => {
      const utilityColumns: ColumnDef<any>[] = [];
      if (rowDetailRenderer) {
        utilityColumns.push(expandColumn);
      }
      if (rowsSelectable && !hideSelectionCheckboxes) {
        utilityColumns.push(selectColumn);
      }
      if (hideSelectionCheckboxes) {
        return utilityColumns.length > 0
          ? [...utilityColumns, ...columnsWithCustomCell]
          : columnsWithCustomCell;
      }
      return utilityColumns.length > 0
        ? [...utilityColumns, ...columnsWithCustomCell]
        : columnsWithCustomCell;
    }, [
      rowDetailRenderer,
      rowsSelectable,
      columnsWithCustomCell,
      hideSelectionCheckboxes,
      expandColumn,
      selectColumn,
    ]);

    const columnRenderVersionRef = useRef(0);
    const prevColumnsWithSelectColumnRef = useRef(columnsWithSelectColumn);
    if (prevColumnsWithSelectColumnRef.current !== columnsWithSelectColumn) {
      prevColumnsWithSelectColumnRef.current = columnsWithSelectColumn;
      columnRenderVersionRef.current++;
    }

    // --- Set up page information (using the first page size option)
    const [pagination, setPagination] = useState<PaginationState>({
      pageSize: effectiveIsPaginated ? effectivePageSize : Number.MAX_VALUE,
      pageIndex: currentPageIndex,
    });

    const prevIsPaginated = usePrevious(effectiveIsPaginated);

    useEffect(() => {
      if (!prevIsPaginated && effectiveIsPaginated) {
        setPagination((prev) => {
          return {
            ...prev,
            pageSize: effectivePageSize,
            pageIndex: 0,
          };
        });
      }
      if (prevIsPaginated && !effectiveIsPaginated) {
        setPagination(() => {
          return {
            pageIndex: 0,
            pageSize: Number.MAX_VALUE,
          };
        });
      }
    }, [effectiveIsPaginated, pageSizeOptions, prevIsPaginated, effectivePageSize]);

    const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

    // layoutVersion tracks internal layout state changes that cells must respond to
    // (column drag resize, window resize via recalculateStarSizes).
    const prevColumnSizingRef = useRef(columnSizing);
    const layoutVersionRef = useRef(0);
    if (columnSizing !== prevColumnSizingRef.current) {
      prevColumnSizingRef.current = columnSizing;
      layoutVersionRef.current++;
    }
    const layoutVersion = layoutVersionRef.current;
    const dataRenderVersionRef = useRef(0);
    const prevDataRenderVersionSourceRef = useRef(safeData);
    if (prevDataRenderVersionSourceRef.current !== safeData) {
      prevDataRenderVersionSourceRef.current = safeData;
      dataRenderVersionRef.current++;
    }
    const expansionRenderVersionRef = useRef(0);
    const prevExpandedRowIdMapRef = useRef(expandedRowIdMap);
    if (prevExpandedRowIdMapRef.current !== expandedRowIdMap) {
      prevExpandedRowIdMapRef.current = expandedRowIdMap;
      expansionRenderVersionRef.current++;
    }

    const columnPinning = useMemo(() => {
      const left: Array<string> = [];
      const right: Array<string> = [];
      columnsWithSelectColumn.forEach((col) => {
        if (col.meta?.pinTo === "right") {
          right.push(col.id!);
        }
        if (col.meta?.pinTo === "left") {
          left.push(col.id!);
        }
      });
      return {
        left,
        right,
      };
    }, [columnsWithSelectColumn]);

    // --- Memoize the row selection predicate to ensure it's stable across renders
    const enableRowSelectionFn = useCallback(
      (row: Row<RowWithOrder>) => {
        return rowsSelectable && !rowUnselectablePredicate(row.original);
      },
      [rowUnselectablePredicate, rowsSelectable],
    );

    // --- Use the @tanstack/core-table component that manages a table
    const table = useReactTable<RowWithOrder>({
      columns: columnsWithSelectColumn,
      data: sortedData,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: effectiveIsPaginated ? getPaginationRowModel() : undefined,
      enableRowSelection: enableRowSelectionFn,
      enableMultiRowSelection,
      columnResizeMode: "onChange",
      getRowId: useCallback(
        (originalRow: any, index: number) => {
          const idVal = originalRow[idKey];
          return idVal != null ? String(idVal) : String(index);
        },
        [idKey],
      ),
      state: useMemo(
        () => ({
          pagination,
          rowSelection: selectedRowIdMap,
          columnSizing,
          columnPinning,
        }),
        [columnPinning, columnSizing, pagination, selectedRowIdMap],
      ),
      onColumnSizingChange: setColumnSizing,
      onPaginationChange: setPagination,
    });

    // --- Select the set of visible rows whenever the table rows change
    const rows = table.getRowModel().rows;
    const currentSourceIds = useMemo(() => getSourceIdSet(safeData, idKey), [idKey, safeData]);
    const previousDataRef = useRef<any>(data);
    const hasReceivedDataRef = useRef(data !== undefined && data !== null);
    const latestSourceIdsRef = useRef<Set<string>>(currentSourceIds);
    const previousRenderedSourceIdsRef = useRef<Set<string>>(currentSourceIds);
    const latestScrollMetricsRef = useRef<CollectionScrollMetrics>({
      scrollPosition: 0,
      scrollSize: 0,
      viewportSize: 0,
    });
    const pendingDataRefreshRef = useRef<PendingDataRefresh | undefined>(undefined);
    const pendingRefreshScrollTargetRef = useRef<
      | { type: "row"; rowId: string | number }
      | { type: "first-inserted"; insertedIds: Set<string> }
      | undefined
    >(undefined);
    const pendingScrollPositionRef = useRef<number | undefined>(undefined);
    const scrollRestoreAnimationFrameRef = useRef<number | undefined>(undefined);
    const targetScrollAnimationFrameRef = useRef<number | undefined>(undefined);
    const [preservedScrollPaddingEnd, setPreservedScrollPaddingEnd] = useState(0);
    if (
      previousDataRef.current !== data &&
      !pendingDataRefreshRef.current &&
      dataRefreshMode === "preserve-state" &&
      previousRenderedSourceIdsRef.current.size > 0
    ) {
      latestScrollMetricsRef.current = getScrollMetrics(virtualizerRef.current);
    }

    const getRenderCacheRowId = useCallback(
      (index: number) => {
        const row = rows[index];
        return row?.id !== undefined ? `row:${String(row.id)}` : undefined;
      },
      [rows],
    );
    const {
      keepMountedIndexes: renderCacheKeepMountedIndexes,
      noteVisibleRange: noteRenderCacheVisibleRange,
      clear: clearRenderCache,
    } = useVirtualizedRenderCache({
      enabled: renderCache,
      maxSize: renderCacheSize,
      rowCount: rows.length,
      getRowId: getRenderCacheRowId,
    });

    useEffect(() => {
      setVisibleItems(rows.map((row) => row.original));
    }, [rows]);

    const scrollParent = useScrollParent(wrapperRef.current?.parentElement);
    const scrollRef = useRef(scrollParent);
    scrollRef.current = scrollParent;

    const hasHeight = useHasExplicitHeight(wrapperRef);

    const [stretchToParent, setStretchToParent] = useState(false);

    useIsomorphicLayoutEffect(() => {
      const wrapper = wrapperRef.current;
      const parent = wrapper?.parentElement;
      if (!parent) {
        return;
      }

      const parentStyle = getComputedStyle(parent);
      const isColumnFlexParent =
        parentStyle.display.includes("flex") && parentStyle.flexDirection === "column";
      const parentStretches = Number.parseFloat(parentStyle.flexGrow) > 0;

      if (isColumnFlexParent && parentStretches && !hasExplicitWrapperHeight(wrapper)) {
        setStretchToParent(true);
      }
    }, []);

    const hasOutsideScroll = scrollRef.current && !hasHeight && !stretchToParent;
    const scrollElementRef = hasOutsideScroll ? scrollRef : wrapperRef;

    const { startMargin, measureStartMargin } = useStartMarginState(
      hasOutsideScroll,
      wrapperRef,
      scrollRef,
    );

    const theadRef = useRef<HTMLTableSectionElement>(null);

    // Use transform-based approach to keep header visible during outside scroll.
    // The header stays in document flow (no position:fixed) — we just visually
    // shift it with translate3d, which avoids all layout-shift/bounce issues.
    // We run synchronously in the scroll handler and cache layout offsets so we
    // only use cheap scrollTop reads per frame.
    // On mobile, scroll events are throttled during momentum scrolling, so we
    // also listen to touchmove (fires every frame during active touch) and run
    // a rAF polling loop during the momentum phase (touchend → scrollend/idle).
    useEffect(() => {
      if (!alwaysShowHeader || !hasOutsideScroll || !tableRef.current || !theadRef.current) return;

      const isBody = !scrollRef.current || scrollRef.current === document.body;
      const scrollEl = isBody ? document.documentElement : scrollRef.current!;
      const scrollTarget: EventTarget = isBody ? window : scrollRef.current!;
      const thead = theadRef.current;
      const table = tableRef.current;

      // Cache layout values — recomputed only on resize, not every scroll
      let tableOffsetTop = 0;
      let tableHeight = 0;
      let theadHeight = thead.offsetHeight;
      let fixedHeaderOffset = 0;
      let lastOffset = -1;

      const getFixedHeaderOffset = (): number => {
        // Get the root node for this component (either document or shadow root)
        const rootNode = thead.getRootNode() as Document | ShadowRoot;

        // Combine selectors into single query for better performance
        // Note: Avoid [style*="..."] selectors - they only match inline styles, not computed styles
        const selector =
          '[data-part-header], [role="banner"], header, .app-header, .header, [data-fixed-header]';

        let maxBottom = 0;

        try {
          const elements = rootNode.querySelectorAll(selector);

          // Use for...of for better performance than forEach
          for (const el of elements) {
            if (el === thead || thead.contains(el)) continue;

            const style = window.getComputedStyle(el);

            // Only check position if element is fixed/sticky
            if (style.position === "fixed" || style.position === "sticky") {
              const rect = el.getBoundingClientRect();
              // Check if element is at or near the top of the viewport
              if (rect.top <= 10 && rect.bottom > 0) {
                maxBottom = Math.max(maxBottom, rect.bottom);
              }
            }
          }
        } catch (e) {
          // Invalid selector or other DOM error, return 0
        }

        return maxBottom;
      };

      const applyTransform = () => {
        const scrollTop = isBody ? window.scrollY : scrollEl.scrollTop;
        const tableTop = tableOffsetTop - scrollTop;

        const tableScrolledPast = tableTop < 0;
        const tableStillVisible = tableTop + tableHeight > theadHeight;

        if (tableScrolledPast && tableStillVisible) {
          const offset = -tableTop + fixedHeaderOffset;
          if (offset !== lastOffset) {
            lastOffset = offset;
            thead.style.transform = `translate3d(0,${offset}px,0)`;
            if (!thead.style.zIndex) {
              thead.style.zIndex = "1000";
              thead.style.position = "relative";
            }
          }
        } else if (lastOffset !== -1) {
          lastOffset = -1;
          thead.style.transform = "";
          thead.style.zIndex = "";
          thead.style.position = "";
        }
      };

      const cacheOffsets = () => {
        theadHeight = thead.offsetHeight;
        tableHeight = table.offsetHeight;
        fixedHeaderOffset = getFixedHeaderOffset();
        if (isBody) {
          tableOffsetTop = table.getBoundingClientRect().top + window.scrollY;
        } else {
          tableOffsetTop =
            table.getBoundingClientRect().top -
            scrollEl.getBoundingClientRect().top +
            scrollEl.scrollTop;
        }
        // Ensure header is correctly positioned after resizing (e.g. orientation change)
        requestAnimationFrame(applyTransform);
      };
      cacheOffsets();

      const ro = new ResizeObserver(cacheOffsets);
      ro.observe(table);
      ro.observe(scrollEl === document.documentElement ? document.body : scrollEl);

      // --- Momentum-phase polling ---
      // After touchend, mobile browsers momentum-scroll but throttle scroll events.
      // We poll via rAF until scroll position stabilises for ~100ms.
      let pollRafId: number | null = null;
      let lastPollScrollTop = -1;
      let idleFrames = 0;
      const IDLE_THRESHOLD = 6; // ~100ms at 60fps

      const pollLoop = () => {
        applyTransform();
        const currentScroll = isBody ? window.scrollY : scrollEl.scrollTop;
        if (currentScroll === lastPollScrollTop) {
          idleFrames++;
        } else {
          idleFrames = 0;
          lastPollScrollTop = currentScroll;
        }
        if (idleFrames < IDLE_THRESHOLD) {
          pollRafId = requestAnimationFrame(pollLoop);
        } else {
          pollRafId = null;
        }
      };

      const startPolling = () => {
        if (pollRafId == null) {
          idleFrames = 0;
          lastPollScrollTop = -1;
          pollRafId = requestAnimationFrame(pollLoop);
        }
      };

      const stopPolling = () => {
        if (pollRafId != null) {
          cancelAnimationFrame(pollRafId);
          pollRafId = null;
        }
      };

      // --- Event handlers ---
      const onScroll = () => {
        applyTransform();
      };

      const onTouchMove = () => {
        applyTransform();
      };

      const onTouchEnd = () => {
        // Finger lifted — momentum scroll may be happening. Start polling.
        startPolling();
      };

      const onTouchStart = () => {
        // Finger back down — stop polling, touchmove will take over.
        stopPolling();
      };

      scrollTarget.addEventListener("scroll", onScroll, { passive: true });
      scrollTarget.addEventListener("touchmove", onTouchMove, { passive: true });
      scrollTarget.addEventListener("touchend", onTouchEnd, { passive: true });
      scrollTarget.addEventListener("touchstart", onTouchStart, { passive: true });
      applyTransform(); // initial check

      return () => {
        scrollTarget.removeEventListener("scroll", onScroll);
        scrollTarget.removeEventListener("touchmove", onTouchMove);
        scrollTarget.removeEventListener("touchend", onTouchEnd);
        scrollTarget.removeEventListener("touchstart", onTouchStart);
        stopPolling();
        ro.disconnect();
        thead.style.transform = "";
        thead.style.zIndex = "";
        thead.style.position = "";
      };
    }, [alwaysShowHeader, hasOutsideScroll]);

    // ==================================================================================
    // Virtua Virtualization
    // ==================================================================================
    const hasData = safeData.length !== 0;
    const [typedCellRevision, setTypedCellRevision] = useState(0);

    // Use a ref to avoid recreating VirtualTableRow when rows change
    const rowsRef = useRef(rows);
    rowsRef.current = rows;
    const safeDataRef = useRef(safeData);
    safeDataRef.current = safeData;

    // --- Stable ref for all values accessed inside VirtualTableRow.
    // Keeping VirtualTableRow identity stable is critical: virtua's ListItem uses
    // useLayoutEffect(() => observe(ref, index), [index]) to register each row with
    // ResizeObserver. If VirtualTableRow identity changes (useMemo recreates it),
    // React remounts all <tr> elements, but the effect doesn't re-run (index is the
    // same), so the new DOM nodes are never observed → rows stay visibility:hidden.
    const rowRenderVersion =
      renderVersion +
      layoutVersion +
      dataRenderVersionRef.current +
      expansionRenderVersionRef.current +
      typedCellRevision +
      columnRenderVersionRef.current;
    const rowState = {
      focusedIndex,
      rowDisabledPredicate,
      noBottomBorder,
      effectiveUserSelectRow,
      toggleRow,
      checkAllRows,
      enableMultiRowSelection,
      lookupEventHandler,
      rowDoubleClick,
      rowClick,
      rowEnter,
      rowLeave,
      striped,
      rowHeight,
      rowDetailRenderer,
      expandedRowIdMap,
      visibleColumnCount: table.getVisibleFlatColumns().length,
      totalColumnWidth: table.getTotalSize(),
      renderVersion: rowRenderVersion,
    };
    const rowStateRef = useRef(rowState);
    rowStateRef.current = rowState;

    const localeRenderKey = getLocaleProfileRenderKey(localeProfile);

    // Stable ref for cell rendering context (effectiveUserSelectCell / cellVerticalAlign can
    // change when theme/props change, but we don't want to recreate TableMemoizedCells for that).
    const cellRenderStateRef = useRef({
      effectiveUserSelectCell,
      cellVerticalAlign,
      localeProfile,
      localeRenderKey,
      highlightHoveredColumn,
    });
    cellRenderStateRef.current = {
      effectiveUserSelectCell,
      cellVerticalAlign,
      localeProfile,
      localeRenderKey,
      highlightHoveredColumn,
    };

    // TableMemoizedCells — analogous to TileGridMemoizedItem.
    // Created ONCE (useMemo([], [])), reads latest cell data from rowsRef via closure.
    // The custom comparator only allows a re-render when:
    //   • renderVersion changes  (e.g. selectMode/data/layout changes → closures must refresh)
    //   • rowIndex changes        (row at this slot changed)
    //   • isSelected changes      (the only thing that changes on a click)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const TableMemoizedCells = useMemo(() => {
      return memo(
        function TableMemoizedCellsInner({
          rowIndex,
          isSelected: _isSelected,
          renderVersion: _rv,
          localeRenderKey: _localeRenderKey,
        }: {
          rowIndex: number;
          isSelected: boolean;
          renderVersion: number;
          localeRenderKey: string;
        }) {
          const row = rowsRef.current[rowIndex];
          if (!row) return null;
          const {
            effectiveUserSelectCell: userSelectCell,
            cellVerticalAlign: vertAlign,
            localeProfile: currentLocaleProfile,
            highlightHoveredColumn: columnHoverEnabled,
          } = cellRenderStateRef.current;
          return (
            <>
              {row.getVisibleCells().map((cell, i) => {
                const cellRenderer = cell.column.columnDef?.meta?.cellRenderer;
                const columnType = cell.column.columnDef?.meta?.columnType;
                const isInteractiveColumn =
                  columnType !== undefined && INTERACTIVE_COLUMN_TYPES.has(columnType.name);
                const readOnly = cell.column.columnDef?.meta?.readOnly;
                const readOnlyResolver = cell.column.columnDef?.meta?.readOnlyResolver;
                const enabled = cell.column.columnDef?.meta?.enabled;
                const enabledResolver = cell.column.columnDef?.meta?.enabledResolver;
                const willChange = cell.column.columnDef?.meta?.willChange;
                const didChange = cell.column.columnDef?.meta?.didChange;
                const tooltipOptions = cell.column.columnDef?.meta?.tooltipOptions;
                const tooltipRenderer = cell.column.columnDef?.meta?.tooltipRenderer;
                const fillCellContent = cell.column.columnDef?.meta?.fillCellContent;
                const cellColumnId = cell.column.columnDef?.meta?.accessorKey ?? cell.column.id;
                const size = cell.column.getSize();
                const columnClassName = cell.column.columnDef?.meta?.className;
                const columnStyle = cell.column.columnDef?.meta?.style;
                const rowSourceIndex =
                  typeof row.original.order === "number" ? row.original.order - 1 : rowIndex;
                const sourceRow = safeDataRef.current[rowSourceIndex] ?? row.original;
                const cachedCellValue = cell?.getValue();
                const liveCellValue =
                  cellColumnId &&
                  sourceRow &&
                  typeof sourceRow === "object" &&
                  cellColumnId in sourceRow
                    ? sourceRow[cellColumnId]
                    : cachedCellValue;
                const updateTypedCellValue = (newValue: boolean | string) => {
                  if (cellColumnId) {
                    row.original[cellColumnId] = newValue;
                    if (sourceRow && typeof sourceRow === "object") {
                      sourceRow[cellColumnId] = newValue;
                    }
                  }
                };
                const { width: _ignoredWidth, ...styleWithoutWidth } = columnStyle || {};
                const effectiveCellUserSelect =
                  userSelectCell as React.CSSProperties["userSelect"];
                const effectiveCellWebkitUserSelect =
                  userSelectCell as React.CSSProperties["WebkitUserSelect"];
                const cellUserSelectStyle: React.CSSProperties = {
                  userSelect: effectiveCellUserSelect,
                  WebkitUserSelect: effectiveCellWebkitUserSelect,
                };
                const cellContentStyle: React.CSSProperties = {
                  ...cellUserSelectStyle,
                };
                if (fillCellContent) {
                  cellContentStyle.width = "100%";
                  cellContentStyle.boxSizing = "border-box";
                }
                if (isInteractiveColumn) {
                  cellContentStyle.width = "100%";
                  cellContentStyle.boxSizing = "border-box";
                  cellContentStyle.display = "flex";
                  cellContentStyle.justifyContent = "center";
                  cellContentStyle.paddingInline = DEFAULT_INTERACTIVE_CELL_INLINE_PADDING;
                }
                if (tooltipRenderer) {
                  cellContentStyle.width = "100%";
                  cellContentStyle.boxSizing = "border-box";
                }
                const alignmentClass =
                  vertAlign === "top"
                    ? styles.alignTop
                    : vertAlign === "bottom"
                      ? styles.alignBottom
                      : styles.alignCenter;
                const cellContent = (
                  <div className={styles.cellContent} style={cellContentStyle}>
                    {cellRenderer ? (
                      cellRenderer(row.original, rowIndex, i, liveCellValue)
                    ) : columnType ? (
                      <TypedColumnCell
                        value={liveCellValue}
                        valueType={columnType}
                        localeProfile={currentLocaleProfile}
                        row={sourceRow}
                        rowIndex={rowIndex}
                        colIndex={i}
                        columnId={cellColumnId}
                        readOnly={readOnly}
                        readOnlyResolver={readOnlyResolver}
                        enabled={enabled}
                        enabledResolver={enabledResolver}
                        onValueChange={updateTypedCellValue}
                        onValueChanged={() => setTypedCellRevision((revision) => revision + 1)}
                        onWillChange={willChange}
                        onDidChange={didChange}
                      />
                    ) : (
                      (flexRender(cell.column.columnDef.cell, cell.getContext()) as ReactNode)
                    )}
                  </div>
                );
                const tooltipTemplate = tooltipRenderer?.(sourceRow, rowIndex, i, liveCellValue);
                // Column hover highlight: opt-in, off by default. When enabled, a non-pinned
                // cell's mouseenter writes the hovered column's positional index directly to a
                // CSS custom property on the table wrapper (outside React state), so a
                // horizontal traverse costs a style write rather than a per-cell re-render.
                // Table.module.scss reads --xmlui-hovered-col-index against each cell's own
                // static --xmlui-col-index and paints the tint via a color-mix() background,
                // which the existing higher-specificity row-hover/selected rules already
                // override at the intersection — no extra selector or !important needed.
                // Pinned cells are excluded so they keep their own hover precedence.
                const isPinnedColumn = !!cell.column.getIsPinned();
                const columnHoverActive = columnHoverEnabled && !isPinnedColumn;
                return (
                  <td
                    className={classnames(styles.cell, alignmentClass, columnClassName)}
                    key={`${cell.id}-${i}`}
                    data-column-id={cell.column.id}
                    style={
                      {
                        width: size,
                        "--column-width": `${size}px`,
                        flexShrink: 0,
                        ...getCommonPinningStyles(cell.column),
                        ...styleWithoutWidth,
                        ...cellUserSelectStyle,
                        ...(columnHoverActive ? { "--xmlui-col-index": i } : undefined),
                      } as React.CSSProperties
                    }
                    onMouseEnter={
                      columnHoverActive
                        ? () => {
                            wrapperRef.current?.style.setProperty(
                              "--xmlui-hovered-col-index",
                              String(i),
                            );
                          }
                        : undefined
                    }
                  >
                    {tooltipTemplate ? (
                      <TableCellTooltip
                        tooltipTemplate={tooltipTemplate}
                        tooltipOptions={tooltipOptions}
                      >
                        {cellContent}
                      </TableCellTooltip>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}
            </>
          );
        },
        (prev, next) =>
          prev.rowIndex === next.rowIndex &&
          prev.isSelected === next.isSelected &&
          prev.renderVersion === next.renderVersion &&
          prev.localeRenderKey === next.localeRenderKey,
      );
    }, []);

    // Custom row component for Virtualizer — created once, reads current values from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const VirtualTableRow = useMemo(() => {
      const RowComponent = forwardRef<HTMLTableRowElement, CustomItemComponentProps>(
        ({ style, children, index: rowIndex }, ref) => {
          const row = rowsRef.current[rowIndex];
          if (!row) {
            console.warn(`Table: No row data found at index ${rowIndex}`);
            return null;
          }
          const s = rowStateRef.current;
          const isFirstRow = rowIndex === 0;
          const composedRowRef = useComposedRefs(ref, isFirstRow ? firstRowRef : null);
          const effectiveRowUserSelect =
            s.effectiveUserSelectRow as React.CSSProperties["userSelect"];
          const effectiveRowWebkitUserSelect =
            s.effectiveUserSelectRow as React.CSSProperties["WebkitUserSelect"];
          const isExpanded = !!s.expandedRowIdMap[row.id];
          return (
            <tr
              data-index={rowIndex}
              ref={composedRowRef}
              style={{
                ...style,
                boxSizing: "content-box",
                minHeight: s.rowHeight,
                minWidth: "max-content",
                userSelect: effectiveRowUserSelect,
                WebkitUserSelect: effectiveRowWebkitUserSelect,
              }}
              className={classnames(styles.row, {
                [styles.selected]: row.getIsSelected(),
                [styles.focused]: s.focusedIndex === rowIndex,
                [styles.disabled]: s.rowDisabledPredicate(row.original),
                [styles.noBottomBorder]: s.noBottomBorder,
                [styles.evenRow]: s.striped && rowIndex % 2 === 0,
                [styles.oddRow]: s.striped && rowIndex % 2 !== 0,
                [styles.expanded]: isExpanded,
              })}
              onClick={(event) => {
                // On Windows, the second click of a double-click fires onClick before onDoubleClick.
                // If we allow state mutations (toggleRow, focus) during that second click, the
                // resulting re-render can destroy the dblclick event on <tr> elements.
                // Returning early for detail >= 2 prevents that and lets onDoubleClick fire cleanly.
                if (event.detail >= 2) {
                  return;
                }
                if (event?.defaultPrevented) {
                  return;
                }
                // Ignore the second click of a double-click to allow onDoubleClick to fire
                if (event.detail >= 2) {
                  return;
                }
                const target = event.target as HTMLElement;
                if (target.tagName.toLowerCase() === "input") {
                  return;
                }
                if (target.closest("button")) {
                  return;
                }

                const isSelectColumn =
                  target.closest("td")?.getAttribute("data-column-id") === "select";

                // Selection is gated on getCanSelect() (rowsSelectable + the unselectable
                // predicate); rowClick below is not — it must fire even when the table isn't
                // selectable at all, which is its main use case ("click a row to open it").
                if (row.getCanSelect()) {
                  // Focus the table wrapper to enable keyboard shortcuts (after checking input/button)
                  wrapperRef.current?.focus();

                  if (isSelectColumn) {
                    const rs = rowStateRef.current;
                    if (!rs.enableMultiRowSelection && row.getIsSelected()) {
                      rs.checkAllRows(false); // Deselect all (which is just this one row)
                    } else {
                      rs.toggleRow(row.original, { metaKey: true });
                    }
                    return;
                  }

                  rowStateRef.current.toggleRow(row.original, event);
                }

                // rowClick is additive: it reports the click without suppressing or replacing
                // selection above, and it does not fire for clicks the code already treats as
                // belonging to something else (the selection checkbox, or the input/button
                // guards above).
                if (isSelectColumn) {
                  return;
                }
                const { rowClick } = rowStateRef.current;
                if (rowClick && typeof rowClick === "function") {
                  try {
                    rowClick(row.original);
                  } catch (e) {
                    console.error("Error in rowClick handler:", e);
                  }
                }
              }}
              onDoubleClick={(event) => {
                // Prevent browser text selection on double-click
                event.preventDefault();

                // Call external handler if provided
                const { rowDoubleClick: dblClick } = rowStateRef.current;
                if (dblClick && typeof dblClick === "function") {
                  try {
                    dblClick(row.original);
                  } catch (e) {
                    console.error("Error in rowDoubleClick handler:", e);
                  }
                }
              }}
              // Hover handlers attach only when the app binds the event. An
              // unbound table registers no listener at all: row hover fires on
              // every traverse of a virtualized list, so the unused case must
              // cost nothing rather than merely returning early.
              onMouseEnter={
                rowStateRef.current.rowEnter
                  ? () => {
                      const { rowEnter: enter } = rowStateRef.current;
                      if (enter && typeof enter === "function") {
                        try {
                          enter(row.original);
                        } catch (e) {
                          console.error("Error in rowEnter handler:", e);
                        }
                      }
                    }
                  : undefined
              }
              onMouseLeave={
                rowStateRef.current.rowLeave
                  ? () => {
                      const { rowLeave: leave } = rowStateRef.current;
                      if (leave && typeof leave === "function") {
                        try {
                          leave(row.original);
                        } catch (e) {
                          console.error("Error in rowLeave handler:", e);
                        }
                      }
                    }
                  : undefined
              }
              onContextMenu={
                rowStateRef.current.lookupEventHandler
                  ? (event) => {
                      // Prevent default browser context menu only when a contextMenu handler is configured
                      event.preventDefault();

                      const handler = rowStateRef.current.lookupEventHandler("contextMenu", {
                        context: {
                          $item: row.original,
                          $row: row.original,
                          $rowIndex: rowIndex,
                          $itemIndex: rowIndex,
                        },
                        ephemeral: true, // Don't cache this handler since context changes per row
                      });

                      handler?.(event);
                    }
                  : undefined
              }
            >
              <TableMemoizedCells
                rowIndex={rowIndex}
                isSelected={row.getIsSelected()}
                renderVersion={s.renderVersion}
                localeRenderKey={cellRenderStateRef.current.localeRenderKey}
              />
              {isExpanded && s.rowDetailRenderer ? (
                <td
                  className={styles.rowDetailCell}
                  colSpan={s.visibleColumnCount}
                  style={{
                    width: s.totalColumnWidth,
                    flexBasis: s.totalColumnWidth,
                    flexShrink: 0,
                  }}
                >
                  <div className={styles.rowDetailContent}>
                    {s.rowDetailRenderer(row.original, rowIndex, row.id, isExpanded)}
                  </div>
                </td>
              ) : null}
            </tr>
          );
        },
      );
      return RowComponent as any;
    }, []);

    const touchedSizesRef = useRef<Record<string, boolean>>({});
    const lastMeasuredWidthRef = useRef<number | null>(null);
    const lastTouchedSizesRef = useRef<Record<string, number>>({});
    const columnSizeTouched = useCallback((id: string) => {
      touchedSizesRef.current[id] = true;
    }, []);

    const recalculateStarSizes = useEvent((resizedColumnId?: string) => {
      if (!tableRef.current) {
        return;
      }
      const measuredWidth = Math.floor(tableRef.current.getBoundingClientRect().width);
      if (resizedColumnId === undefined && measuredWidth === lastMeasuredWidthRef.current) {
        return;
      }
      lastMeasuredWidthRef.current = measuredWidth;
      let availableWidth = measuredWidth;
      const widths: Record<string, number> = {};
      const columnsWithoutSize: Array<Column<RowWithOrder>> = [];
      const numberOfUnitsById: Record<string, number> = {};

      // When a column was just resized by the user, only redistribute among the columns
      // AFTER it — columns to the left keep their current width (Excel/Sheets behavior).
      const allColumns = table.getAllColumns();
      const resizedIdx = resizedColumnId
        ? allColumns.findIndex((c) => c.id === resizedColumnId)
        : -1;

      allColumns.forEach((column, idx) => {
        const isFrozenByPosition = resizedIdx >= 0 && idx <= resizedIdx;
        if (
          column.columnDef.size !== undefined ||
          touchedSizesRef.current[column.id] ||
          isFrozenByPosition
        ) {
          availableWidth -= columnSizing[column.id] || column.columnDef.size || 0;
        } else {
          columnsWithoutSize.push(column);
          let units: number;
          if (column.columnDef.meta?.starSizedWidth) {
            units = Number(column.columnDef.meta?.starSizedWidth.replace("*", "").trim()) || 1;
          } else {
            units = 1;
          }
          numberOfUnitsById[column.id] = units;
        }
      });
      // Distribute available width respecting minSize/maxSize constraints of each column.
      // When a column would exceed its maxSize (or fall below its minSize), pin it at
      // that bound and redistribute the remaining space among the other star-sized columns.
      let remaining = availableWidth;
      const unitsMap = new Map<string, number>(
        columnsWithoutSize.map((col) => [col.id, numberOfUnitsById[col.id]]),
      );
      const constrainedWidths = new Map<string, number>();

      let changed = true;
      while (changed && unitsMap.size > 0) {
        changed = false;
        const totalUnits = [...unitsMap.values()].reduce((s, v) => s + v, 0);
        if (totalUnits === 0) break;
        for (const [id, units] of [...unitsMap.entries()]) {
          const col = columnsWithoutSize.find((c) => c.id === id)!;
          const allocated = remaining * (units / totalUnits);
          const maxSize = col.columnDef.maxSize ?? Number.MAX_SAFE_INTEGER;
          const minSize = col.columnDef.minSize ?? 20;
          if (allocated > maxSize) {
            constrainedWidths.set(id, maxSize);
            remaining -= maxSize;
            unitsMap.delete(id);
            changed = true;
            break;
          } else if (allocated < minSize) {
            constrainedWidths.set(id, minSize);
            remaining -= minSize;
            unitsMap.delete(id);
            changed = true;
            break;
          }
        }
      }

      // Allocate remaining space to unconstrained columns, distributing any remainder
      // from Math.floor to the last column so the total exactly equals the available width.
      // This prevents the column sum from undershooting clientWidth, which would cause the
      // parent flex container to shrink and trigger an infinite resize loop.
      const finalTotalUnits = [...unitsMap.values()].reduce((s, v) => s + v, 0);
      const unitsEntries = [...unitsMap.entries()];
      let allocatedToUnconstrained = 0;
      for (let i = 0; i < unitsEntries.length; i++) {
        const [id, units] = unitsEntries[i];
        if (i < unitsEntries.length - 1) {
          widths[id] = Math.floor(remaining * (units / (finalTotalUnits || 1)));
          allocatedToUnconstrained += widths[id];
        } else {
          // Last unconstrained column absorbs the remainder so sum = remaining exactly
          widths[id] = remaining - allocatedToUnconstrained;
        }
      }
      for (const [id, w] of constrainedWidths.entries()) {
        widths[id] = w;
      }
      setColumnSizing((prev: any) => {
        const next = { ...prev, ...widths };
        table.getAllColumns().forEach((col) => {
          if (col.columnDef.size !== undefined && !touchedSizesRef.current[col.id]) {
            delete next[col.id];
          }
        });
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length === nextKeys.length && nextKeys.every((k) => prev[k] === next[k])) {
          return prev;
        }
        return next;
      });
      // Snapshot touched column sizes so the redistribute effect can detect user-driven changes
      const snapshot: Record<string, number> = {};
      for (const id of Object.keys(touchedSizesRef.current)) {
        if (touchedSizesRef.current[id]) {
          snapshot[id] = columnSizing[id] ?? 0;
        }
      }
      lastTouchedSizesRef.current = snapshot;
    });

    useResizeObserver(tableRef, () => recalculateStarSizes());

    // Redistribute remaining width across non-touched star-sized columns AFTER the resized
    // column when the user resizes a touched column. Without this, dragging a column smaller
    // leaves an empty gap on the right because react-table only updates the dragged column.
    useEffect(() => {
      let changedId: string | undefined;
      const nextSnapshot: Record<string, number> = {};
      for (const id of Object.keys(touchedSizesRef.current)) {
        if (!touchedSizesRef.current[id]) continue;
        const current = columnSizing[id] ?? 0;
        nextSnapshot[id] = current;
        if (lastTouchedSizesRef.current[id] !== current && changedId === undefined) {
          changedId = id;
        }
      }
      if (changedId !== undefined) {
        lastTouchedSizesRef.current = nextSnapshot;
        recalculateStarSizes(changedId);
      }
    }, [columnSizing, recalculateStarSizes]);

    useIsomorphicLayoutEffect(() => {
      // Reset cached width so columns are recalculated when the column set changes
      lastMeasuredWidthRef.current = null;
      recalculateStarSizes();
    }, [
      recalculateStarSizes,
      safeColumns,
      columnsWithCustomCell,
      rowsSelectable,
      hideSelectionCheckboxes,
    ]);

    const programmaticScroll = useRef(false);
    const programmaticScrollReleaseTimer = useRef<number | null>(null);
    const scheduleProgrammaticScrollRelease = useEvent(() => {
      if (programmaticScrollReleaseTimer.current !== null) {
        window.clearTimeout(programmaticScrollReleaseTimer.current);
      }
      programmaticScrollReleaseTimer.current = window.setTimeout(() => {
        programmaticScroll.current = false;
        programmaticScrollReleaseTimer.current = null;
      }, 80);
    });
    useEffect(() => {
      return () => {
        if (programmaticScrollReleaseTimer.current !== null) {
          window.clearTimeout(programmaticScrollReleaseTimer.current);
        }
      };
    }, []);

    const computeVisibleRange = useCallback(() => {
      const v = virtualizerRef.current;
      const rowCount = rowsRef.current.length;
      if (!v || rowCount === 0 || v.viewportSize <= 0) {
        return null;
      }
      const startIndex = v.findItemIndex(v.scrollOffset);
      const endIndex = Math.min(v.findItemIndex(v.scrollOffset + v.viewportSize), rowCount - 1);
      return { startIndex, endIndex };
    }, []);

    const lastVisibleRange = useRef<{ startIndex: number; endIndex: number } | null>(null);
    const reportVisibleRange = useCallback(() => {
      const range = computeVisibleRange();
      if (!range) return;
      noteRenderCacheVisibleRange(range);
      if (!onVisibleRangeDidChange) return;
      const last = lastVisibleRange.current;
      if (last && last.startIndex === range.startIndex && last.endIndex === range.endIndex) return;
      lastVisibleRange.current = range;
      onVisibleRangeDidChange(range);
    }, [computeVisibleRange, noteRenderCacheVisibleRange, onVisibleRangeDidChange]);

    useEffect(() => {
      if (!rows.length) return;
      let raf: number | undefined;
      let attempts = 0;
      const reportWhenMeasured = () => {
        const range = computeVisibleRange();
        if (range || attempts >= 8) {
          reportVisibleRange();
          return;
        }
        attempts++;
        raf = requestAnimationFrame(reportWhenMeasured);
      };
      raf = requestAnimationFrame(reportWhenMeasured);
      return () => {
        if (raf !== undefined) {
          cancelAnimationFrame(raf);
        }
      };
    }, [computeVisibleRange, reportVisibleRange, rows]);

    const lastScrollOffset = useRef(0);
    const handleVirtuaScroll = useCallback(
      (offset: number) => {
        const v = virtualizerRef.current;
        if (!v) return;
        const atEnd = offset - v.scrollSize + v.viewportSize >= -1.5;
        const prevOffset = lastScrollOffset.current;
        lastScrollOffset.current = offset;
        const offsetChanged = Math.abs(offset - prevOffset) > 0.5;
        if (!programmaticScroll.current && offsetChanged) {
          const rowCount = rowsRef.current.length;
          onScroll?.({
            scrollTop: offset,
            scrollHeight: v.scrollSize,
            viewportSize: v.viewportSize,
            atEnd,
            visibleRange: computeVisibleRange() ?? { startIndex: -1, endIndex: -1 },
            itemCount: rowCount,
          });
        } else if (programmaticScroll.current) {
          scheduleProgrammaticScrollRelease();
        }
        reportVisibleRange();
      },
      [computeVisibleRange, onScroll, reportVisibleRange, scheduleProgrammaticScrollRelease],
    );

    const runProgrammaticScroll = useEvent((scroll: () => void) => {
      clearRenderCache();
      programmaticScroll.current = true;
      requestAnimationFrame(() => {
        scroll();
        scheduleProgrammaticScrollRelease();
      });
    });

    const scrollToBottom = useEvent(() => {
      const v = virtualizerRef.current;
      if (v && rowsRef.current.length) {
        runProgrammaticScroll(() => v.scrollTo(v.scrollSize + measureStartMargin()));
      }
    });

    const scrollToTop = useEvent(() => {
      if (rowsRef.current.length) {
        runProgrammaticScroll(() =>
          virtualizerRef.current?.scrollToIndex(0, {
            align: "start",
            offset: -measureStartMargin(),
          }),
        );
      }
    });

    const scrollToIndex = useEvent((index: number) => {
      runProgrammaticScroll(() => {
        const freshMargin = measureStartMargin();
        virtualizerRef.current?.scrollToIndex(index, { offset: freshMargin - startMargin });
      });
    });

    const scrollToId = useEvent((id: string) => {
      const index = rowsRef.current.findIndex(
        (row) => String(row.original?.[idKey]) === String(id),
      );
      if (index >= 0) {
        scrollToIndex(index);
      }
    });

    const getItemCount = useEvent(() => rowsRef.current.length);
    const getVisibleRange = useEvent(() => {
      return computeVisibleRange() ?? { startIndex: -1, endIndex: -1 };
    });

    const restorePendingScrollPosition = useCallback(
      (clearAfterRestore = false) => {
        const nextScrollPosition = pendingScrollPositionRef.current;
        const virtualizer = virtualizerRef.current;
        if (nextScrollPosition === undefined || !virtualizer) {
          return;
        }

        clearRenderCache();
        programmaticScroll.current = true;
        virtualizer.scrollTo(nextScrollPosition);
        scheduleProgrammaticScrollRelease();

        if (clearAfterRestore) {
          pendingScrollPositionRef.current = undefined;
        }
      },
      [clearRenderCache, scheduleProgrammaticScrollRelease],
    );

    const queueScrollPositionRestore = useCallback(
      (scrollPosition: number | undefined) => {
        if (scrollPosition === undefined) {
          return;
        }

        pendingScrollPositionRef.current = Math.max(0, scrollPosition);
        restorePendingScrollPosition();

        if (scrollRestoreAnimationFrameRef.current !== undefined) {
          cancelAnimationFrame(scrollRestoreAnimationFrameRef.current);
        }

        scrollRestoreAnimationFrameRef.current = requestAnimationFrame(() => {
          restorePendingScrollPosition(true);
          scrollRestoreAnimationFrameRef.current = undefined;
        });
      },
      [restorePendingScrollPosition],
    );

    const preparePreservedScrollRange = useCallback(
      (
        options: CollectionDataRefreshOptions | undefined,
        previousSourceIds: Set<string>,
        previousScrollMetrics: CollectionScrollMetrics,
      ) => {
        if (!isPreserveScrollTarget(options?.scrollTarget)) {
          setPreservedScrollPaddingEnd(0);
          return;
        }

        const dataShrank = currentSourceIds.size < previousSourceIds.size;
        if (options?.operation !== "delete" && !dataShrank) {
          setPreservedScrollPaddingEnd(0);
          return;
        }

        const currentMetrics = getScrollMetrics(virtualizerRef.current);
        const viewportSize = currentMetrics.viewportSize || previousScrollMetrics.viewportSize;
        const currentMaxScrollPosition = Math.max(0, currentMetrics.scrollSize - viewportSize);
        const neededPadding = Math.ceil(
          Math.max(0, previousScrollMetrics.scrollPosition - currentMaxScrollPosition),
        );
        setPreservedScrollPaddingEnd((prev) => (prev === neededPadding ? prev : neededPadding));
      },
      [currentSourceIds],
    );

    const prepareRefreshScrollTarget = useCallback(
      (options: CollectionDataRefreshOptions | undefined, previousSourceIds: Set<string>) => {
        const explicitTarget = options?.scrollTarget;
        if (explicitTarget === "preserve") {
          pendingRefreshScrollTargetRef.current = undefined;
          return;
        }

        if (isPreserveScrollTarget(explicitTarget)) {
          pendingRefreshScrollTargetRef.current = shouldInferFirstInserted(options)
            ? {
                type: "first-inserted",
                insertedIds: diffInsertedIds(previousSourceIds, currentSourceIds),
              }
            : undefined;
          if (
            pendingRefreshScrollTargetRef.current?.type === "first-inserted" &&
            pendingRefreshScrollTargetRef.current.insertedIds.size === 0
          ) {
            pendingRefreshScrollTargetRef.current = undefined;
          }
          return;
        }

        if (explicitTarget === "first-inserted") {
          const insertedIds = diffInsertedIds(previousSourceIds, currentSourceIds);
          pendingRefreshScrollTargetRef.current =
            insertedIds.size > 0 ? { type: "first-inserted", insertedIds } : undefined;
          return;
        }

        pendingRefreshScrollTargetRef.current = { type: "row", rowId: explicitTarget };
      },
      [currentSourceIds],
    );

    const clampPaginationForCurrentData = useCallback(() => {
      if (!effectiveIsPaginated) {
        return;
      }
      setPagination((prev) => {
        const pageCount = Math.max(1, Math.ceil(safeData.length / prev.pageSize));
        const pageIndex = Math.min(prev.pageIndex, pageCount - 1);
        return pageIndex === prev.pageIndex ? prev : { ...prev, pageIndex };
      });
    }, [effectiveIsPaginated, safeData.length]);

    const captureLatestRefreshState = useCallback(() => {
      if (currentSourceIds.size === 0 && latestSourceIdsRef.current.size > 0) {
        return;
      }

      latestSourceIdsRef.current = currentSourceIds;
      latestScrollMetricsRef.current = getScrollMetrics(virtualizerRef.current);
    }, [currentSourceIds]);

    useIsomorphicLayoutEffect(() => {
      const dataChanged = previousDataRef.current !== data;
      const hasCurrentData = data !== undefined && data !== null;

      if (!dataChanged) {
        if (hasCurrentData) {
          hasReceivedDataRef.current = true;
        }
        previousRenderedSourceIdsRef.current = currentSourceIds;
        captureLatestRefreshState();
        return;
      }

      const isInitialDataArrival = !hasReceivedDataRef.current && hasCurrentData;
      const pendingRefresh = pendingDataRefreshRef.current;
      const shouldPreserve = !!pendingRefresh || dataRefreshMode === "preserve-state";
      const previousSourceIds = pendingRefresh?.sourceIds ?? latestSourceIdsRef.current;
      const previousRenderedSourceIds = previousRenderedSourceIdsRef.current;
      const previousScrollMetrics = pendingRefresh?.scrollMetrics ?? latestScrollMetricsRef.current;

      pendingDataRefreshRef.current = undefined;
      previousDataRef.current = data;
      previousRenderedSourceIdsRef.current = currentSourceIds;
      if (hasCurrentData) {
        hasReceivedDataRef.current = true;
      }

      if (isInitialDataArrival) {
        pendingRefreshScrollTargetRef.current = undefined;
        setPreservedScrollPaddingEnd(0);
        captureLatestRefreshState();
        return;
      }

      if (shouldPreserve) {
        if (!pendingRefresh && areSourceIdSetsEqual(previousRenderedSourceIds, currentSourceIds)) {
          captureLatestRefreshState();
          return;
        }

        clampPaginationForCurrentData();
        preparePreservedScrollRange(
          pendingRefresh?.options,
          previousSourceIds,
          previousScrollMetrics,
        );
        prepareRefreshScrollTarget(pendingRefresh?.options, previousSourceIds);
        if (isPreserveScrollTarget(pendingRefresh?.options?.scrollTarget)) {
          queueScrollPositionRestore(previousScrollMetrics.scrollPosition);
        }
        return;
      }

      pendingRefreshScrollTargetRef.current = undefined;
      setPreservedScrollPaddingEnd(0);
      captureLatestRefreshState();
    }, [
      captureLatestRefreshState,
      clampPaginationForCurrentData,
      data,
      dataRefreshMode,
      preparePreservedScrollRange,
      prepareRefreshScrollTarget,
      queueScrollPositionRestore,
    ]);

    useIsomorphicLayoutEffect(() => {
      const scrollPosition = pendingScrollPositionRef.current;
      if (scrollPosition === undefined || !virtualizerRef.current) {
        return;
      }

      restorePendingScrollPosition();
    }, [restorePendingScrollPosition, rows.length]);

    const scrollRowIntoViewIfNeeded = useCallback(
      (rowId: string | number) => {
        const rowIndex = rowsRef.current.findIndex(
          (row) => String(row.original?.[idKey]) === String(rowId),
        );
        const virtualizer = virtualizerRef.current;
        if (rowIndex < 0 || !virtualizer) {
          return;
        }

        const itemOffset = virtualizer.getItemOffset(rowIndex);
        const itemSize = virtualizer.getItemSize(rowIndex);
        const viewportStart = virtualizer.scrollOffset;
        const viewportEnd = viewportStart + virtualizer.viewportSize;
        const itemEnd = itemOffset + itemSize;

        if (itemOffset >= viewportStart && itemEnd <= viewportEnd) {
          return;
        }

        runProgrammaticScroll(() => virtualizer.scrollToIndex(rowIndex, { align: "center" }));
      },
      [idKey, runProgrammaticScroll],
    );

    useEffect(() => {
      const pendingTarget = pendingRefreshScrollTargetRef.current;
      if (!pendingTarget) {
        return;
      }

      if (targetScrollAnimationFrameRef.current !== undefined) {
        cancelAnimationFrame(targetScrollAnimationFrameRef.current);
      }

      targetScrollAnimationFrameRef.current = requestAnimationFrame(() => {
        targetScrollAnimationFrameRef.current = requestAnimationFrame(() => {
          const target = pendingRefreshScrollTargetRef.current;
          if (!target) {
            targetScrollAnimationFrameRef.current = undefined;
            return;
          }

          const targetRowId =
            target.type === "row"
              ? target.rowId
              : (rowsRef.current.find((row) =>
                  target.insertedIds.has(String(row.original?.[idKey])),
                )?.original?.[idKey] as string | number | undefined);

          if (targetRowId !== undefined) {
            scrollRowIntoViewIfNeeded(targetRowId);
          }

          pendingRefreshScrollTargetRef.current = undefined;
          targetScrollAnimationFrameRef.current = undefined;
        });
      });
    }, [idKey, rows, scrollRowIntoViewIfNeeded]);

    const clearPreservedScrollPaddingEnd = useCallback(() => {
      setPreservedScrollPaddingEnd((prev) => (prev === 0 ? prev : 0));
    }, []);

    useEffect(() => {
      return () => {
        if (scrollRestoreAnimationFrameRef.current !== undefined) {
          cancelAnimationFrame(scrollRestoreAnimationFrameRef.current);
        }
        if (targetScrollAnimationFrameRef.current !== undefined) {
          cancelAnimationFrame(targetScrollAnimationFrameRef.current);
        }
      };
    }, []);

    const handleWrapperKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        clearPreservedScrollPaddingEnd();
        compositeKeyDown(event);
      },
      [clearPreservedScrollPaddingEnd, compositeKeyDown],
    );

    useIsomorphicLayoutEffect(() => {
      registerComponentApi({
        scrollToBottom,
        scrollToTop,
        scrollToIndex,
        scrollToId,
        getItemCount,
        getVisibleRange,
        expandRow,
        collapseRow,
        toggleRowExpansion,
        getExpandedRowIds: getCurrentExpandedRowIds,
        isRowExpanded,
        preserveStateOnNextDataRefresh: (options?: CollectionDataRefreshOptions) => {
          pendingDataRefreshRef.current = {
            sourceIds: new Set(currentSourceIds),
            scrollMetrics: getScrollMetrics(virtualizerRef.current),
            options,
          };
        },
        ...selectionApi,
      });
    }, [
      currentSourceIds,
      collapseRow,
      expandRow,
      getCurrentExpandedRowIds,
      getItemCount,
      getVisibleRange,
      isRowExpanded,
      registerComponentApi,
      scrollToBottom,
      scrollToId,
      scrollToIndex,
      scrollToTop,
      selectionApi,
      toggleRowExpansion,
    ]);

    const paginationControls = (
      <ThemedPagination
        pageIndex={pagination.pageIndex}
        pageSize={pagination.pageSize}
        itemCount={safeData.length}
        pageSizeOptions={effectivePageSizeOptions}
        onPageDidChange={(page) => table.setPageIndex(page)}
        onPageSizeDidChange={(size) => table.setPageSize(size)}
        showCurrentPage={showCurrentPage}
        showPageInfo={showPageInfo}
        showPageSizeSelector={showPageSizeSelector}
        buttonRowPosition={buttonRowPosition}
        pageInfoPosition={pageInfoPosition}
        pageSizeSelectorPosition={pageSizeSelectorPosition}
      />
    );

    const shouldShowPagination = useMemo(() => {
      if (alwaysShowPagination !== undefined) {
        return alwaysShowPagination;
      }
      if (!effectiveIsPaginated || !hasData || rows.length === 0 || !pagination) {
        return false;
      }
      return table.getPageCount() > 1;
    }, [effectiveIsPaginated, hasData, rows.length, pagination, alwaysShowPagination, table]);

    return (
      <div
        {...rest}
        className={classnames(styles.wrapper, classes?.[COMPONENT_PART_KEY], className, {
          [styles.noScroll]: hasOutsideScroll,
          [styles.stretchToParent]: stretchToParent,
          [styles.emptyState]: !loading && !hasData,
        })}
        tabIndex={0}
        onKeyDown={handleWrapperKeyDown}
        onPointerDown={clearPreservedScrollPaddingEnd}
        onTouchStart={clearPreservedScrollPaddingEnd}
        onWheel={clearPreservedScrollPaddingEnd}
        // Clears the column hover highlight when the pointer leaves the whole table rather
        // than on each cell's mouseleave, so moving between adjacent cells does not flicker.
        onMouseLeave={
          highlightHoveredColumn
            ? () => {
                wrapperRef.current?.style.removeProperty("--xmlui-hovered-col-index");
              }
            : undefined
        }
        onClick={(e) => {
          const target = e.target as HTMLElement;

          // Skip focusing wrapper if clicking on interactive elements that handle their own focus
          if (target.closest("button")) {
            return;
          }

          // Skip if target is an element that expects keyboard text input
          if (isTextInputElement(target)) {
            return;
          }

          // Focus the wrapper to enable keyboard shortcuts
          wrapperRef.current?.focus();
        }}
        ref={ref}
        style={style}
      >
        {shouldShowPagination &&
          (paginationControlsLocation === "top" || paginationControlsLocation === "both") &&
          paginationControls}

        <table className={styles.table} ref={tableRef} aria-label={(rest as any)["aria-label"]}>
          {!hideHeader && (
            <>
              <thead
                ref={theadRef}
                style={{
                  height: headerHeight,
                  position: "sticky",
                  top: 0,
                  minWidth: "100%",
                  willChange: alwaysShowHeader && hasOutsideScroll ? "transform" : undefined,
                }}
                className={styles.headerWrapper}
              >
                {table.getHeaderGroups().map((headerGroup, headerGroupIndex) => (
                  <tr
                    key={`${headerGroup.id}-${headerGroupIndex}`}
                    className={classnames(styles.headerRow, {
                      [styles.allSelected]: table.getIsAllRowsSelected(),
                    })}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;

                      // Allow native checkbox clicks to be handled by Toggle's onChange
                      if (
                        target.tagName.toLowerCase() === "input" &&
                        target.getAttribute("type") === "checkbox"
                      ) {
                        return;
                      }

                      const headerCell = target.closest("th");

                      // Only handle clicks for the select column header when the header checkbox is visible
                      if (
                        headerCell &&
                        rowsSelectable &&
                        enableMultiRowSelection &&
                        !hideSelectionCheckboxesHeader
                      ) {
                        const headerId = headerCell.getAttribute("data-column-id");

                        if (headerId === "select") {
                          const allSelected = table
                            .getRowModel()
                            .rows.every(
                              (row) =>
                                rowDisabledPredicate(row.original) ||
                                rowUnselectablePredicate(row.original) ||
                                row.getIsSelected(),
                            );
                          checkAllRows(!allSelected);
                        }
                      }
                    }}
                  >
                    {headerGroup.headers.map((header, headerIndex) => {
                      const { width, ...style } = header.column.columnDef.meta?.style || {};
                      const headerJustifyContent = getHeaderJustifyContent(
                        header.column.columnDef.meta?.headerHorizontalAlignment,
                      );
                      const size = header.getSize();
                      const alignmentClass =
                        cellVerticalAlign === "top"
                          ? styles.alignTop
                          : cellVerticalAlign === "bottom"
                            ? styles.alignBottom
                            : styles.alignCenter;
                      const effectiveHeadingUserSelect =
                        effectiveUserSelectHeading as React.CSSProperties["userSelect"];
                      const effectiveHeadingWebkitUserSelect =
                        effectiveUserSelectHeading as React.CSSProperties["WebkitUserSelect"];
                      return (
                        <th
                          key={`${header.id}-${headerIndex}`}
                          data-column-id={header.id}
                          className={classnames(styles.columnCell, alignmentClass)}
                          colSpan={header.colSpan}
                          style={
                            {
                              ["--column-width" as string]: `${size}px`,
                              position: "relative",
                              width: size,
                              flexShrink: 0,
                              ...getCommonPinningStyles(header.column, true),
                            } as React.CSSProperties
                          }
                        >
                          <ClickableHeader
                            hasSorting={
                              header.column.columnDef.enableSorting &&
                              !!header.column.columnDef.meta?.accessorKey
                            }
                            updateSorting={() =>
                              _updateSorting(header.column.columnDef.meta?.accessorKey)
                            }
                          >
                            <div
                              className={styles.headerContent}
                              style={{
                                ...style,
                                width: headerJustifyContent ? "100%" : undefined,
                                boxSizing: headerJustifyContent ? "border-box" : undefined,
                                justifyContent: headerJustifyContent,
                                userSelect: effectiveHeadingUserSelect,
                                WebkitUserSelect: effectiveHeadingWebkitUserSelect,
                              }}
                            >
                              {
                                flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                ) as ReactNode
                              }
                              {header.column.columnDef.enableSorting && (
                                <Part partId="orderIndicator">
                                  <span
                                    className={classnames(styles.orderingIndicator, {
                                      [styles.activeOrdering]:
                                        header.column.columnDef.meta?.accessorKey === _sortBy,
                                      [styles.alwaysShow]: alwaysShowSortingIndicator,
                                    })}
                                  >
                                    <ColumnOrderingIndicator
                                      iconSortAsc={iconSortAsc}
                                      iconSortDesc={iconSortDesc}
                                      iconNoSort={iconNoSort}
                                      direction={
                                        header.column.columnDef.meta?.accessorKey === _sortBy
                                          ? _sortingDirection
                                          : undefined
                                      }
                                    />
                                  </span>
                                </Part>
                              )}
                            </div>
                          </ClickableHeader>
                          {header.column.getCanResize() && (
                            <div
                              {...{
                                onDoubleClick: () => {
                                  touchedSizesRef.current[header.column.id] = false;
                                  if (header.column.columnDef.size !== undefined) {
                                    header.column.resetSize();
                                  } else {
                                    recalculateStarSizes();
                                  }
                                },
                                onMouseDown: (event) => {
                                  columnSizeTouched(header.column.id);
                                  header.getResizeHandler()(event);
                                },
                                onTouchStart: (event) => {
                                  columnSizeTouched(header.column.id);
                                  header.getResizeHandler()(event);
                                },
                                className: classnames(styles.resizer, {
                                  [styles.isResizing]: header.column.getIsResizing(),
                                }),
                              }}
                            />
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
            </>
          )}
          {hasData && (
            <Virtualizer
              key={hasOutsideScroll ? "outside-scroll" : "inside-scroll"}
              as="tbody"
              item={VirtualTableRow as CustomItemComponent}
              ref={virtualizerRef}
              scrollRef={scrollElementRef}
              startMargin={startMargin}
              onScroll={handleVirtuaScroll}
              keepMounted={renderCacheKeepMountedIndexes}
              bufferSize={virtualBufferSize}
            >
              {rows.map((row) => (
                <tr key={row.id} data-render-version={rowRenderVersion} />
              ))}
            </Virtualizer>
          )}
        </table>
        {preservedScrollPaddingEnd > 0 ? (
          <div aria-hidden="true" style={{ height: preservedScrollPaddingEnd }} />
        ) : null}
        {loading && !hasData && (
          <div className={styles.loadingWrapper}>
            <Spinner delay={loadingDelay} />
          </div>
        )}
        {!hideNoDataView &&
          !loading &&
          !hasData &&
          (noDataRenderer ? (
            <div className={styles.noDataWrapper}>{noDataRenderer()}</div>
          ) : (
            <div className={styles.noDataWrapper}>
              <div className={styles.noRows}>No data available</div>
            </div>
          ))}

        {shouldShowPagination &&
          (paginationControlsLocation === "bottom" || paginationControlsLocation === "both") &&
          paginationControls}
      </div>
    );
  }),
);

type ClickableHeaderProps = {
  hasSorting?: boolean;
  updateSorting?: () => void;
  children?: ReactNode;
};

function ClickableHeader({ hasSorting, updateSorting, children }: ClickableHeaderProps) {
  return hasSorting ? (
    <button type="button" className={styles.clickableHeader} onClick={updateSorting}>
      {children}
    </button>
  ) : (
    <>{children}</>
  );
}

type ColumnOrderingIndicatorProps = {
  direction?: SortingDirection;
  iconSortAsc?: string;
  iconSortDesc?: string;
  iconNoSort?: string;
};

function ColumnOrderingIndicator({
  direction,
  iconSortAsc = "sortasc:Table",
  iconSortDesc = "sortdesc:Table",
  iconNoSort = "nosort:Table",
}: ColumnOrderingIndicatorProps) {
  if (direction === "ascending") {
    return <ThemedIcon name={iconSortAsc} fallback="sortasc" size="12" />; //sortasc
  } else if (direction === "descending") {
    return <ThemedIcon name={iconSortDesc} fallback="sortdesc" size="12" />; //sortdesc
  }
  return iconNoSort !== "-" ? (
    <ThemedIcon name={iconNoSort} fallback="nosort" size="12" />
  ) : (
    <ThemedIcon name={iconNoSort} size="12" />
  ); //nosort
}

/**
 * Checks whether the table wrapper has a real height constraint. Table's base
 * max-height should not count as explicit height for stretch-parent detection.
 */
function hasExplicitWrapperHeight(wrapper: HTMLDivElement): boolean {
  const originalHeight = getComputedStyle(wrapper).height;
  const originalInlineHeight = wrapper.style.height || "";

  wrapper.style.height = "auto";
  const autoHeight = getComputedStyle(wrapper).height;
  wrapper.style.height = originalInlineHeight;

  return originalHeight !== autoHeight || !!originalInlineHeight;
}

/**
 * Checks if an HTML element expects keyboard text input
 * @param target - The HTML element to check
 * @returns true if the element expects text input (textarea, contenteditable, or text-like input)
 */
function isTextInputElement(target: HTMLElement): boolean {
  return (
    target.tagName.toLowerCase() === "textarea" ||
    target.contentEditable === "true" ||
    (target.tagName.toLowerCase() === "input" &&
      !["checkbox", "radio", "button", "submit", "reset", "file", "image"].includes(
        (target as HTMLInputElement).type,
      ))
  );
}

export { defaultProps } from "./Table.defaults";
