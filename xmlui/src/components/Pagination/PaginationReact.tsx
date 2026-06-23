import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  type CSSProperties,
} from "react";
import type React from "react";

import { defaultProps, type PageNumber, type Position } from "./Pagination.defaults";
import styles from "./Pagination.module.scss?xmlui-css-module";

export type PaginationApi = {
  moveFirst: () => void;
  moveLast: () => void;
  movePrev: () => void;
  moveNext: () => void;
  currentPage: number;
  currentPageSize: number;
};

export type PaginationProps = {
  id?: string;
  enabled?: boolean;
  itemCount?: number;
  pageSize?: number;
  pageIndex?: number;
  maxVisiblePages?: PageNumber;
  showPageInfo?: boolean;
  showPageSizeSelector?: boolean;
  showCurrentPage?: boolean;
  pageSizeOptions?: number[];
  orientation?: string;
  buttonRowPosition?: Position;
  pageSizeSelectorPosition?: Position;
  pageInfoPosition?: Position;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  className?: string;
  style?: CSSProperties;
  onPageDidChange?: (pageIndex: number, pageSize: number, itemCount: number) => void | Promise<void>;
  onPageSizeDidChange?: (pageSize: number) => void | Promise<void>;
  registerApi?: (api: Record<string, unknown>) => void;
  "data-testid"?: string;
};

export const PaginationNative = memo(forwardRef<PaginationApi, PaginationProps>(function PaginationNative(
  {
    id,
    enabled = true,
    itemCount,
    pageSize = defaultProps.pageSize,
    pageIndex = defaultProps.pageIndex,
    maxVisiblePages = defaultProps.maxVisiblePages,
    showPageInfo = defaultProps.showPageInfo,
    showPageSizeSelector = defaultProps.showPageSizeSelector,
    showCurrentPage = defaultProps.showCurrentPage,
    pageSizeOptions,
    orientation = defaultProps.orientation,
    buttonRowPosition = defaultProps.buttonRowPosition,
    pageSizeSelectorPosition = defaultProps.pageSizeSelectorPosition,
    pageInfoPosition = defaultProps.pageInfoPosition,
    hasPrevPage,
    hasNextPage,
    className,
    style,
    onPageDidChange,
    onPageSizeDidChange,
    registerApi,
    "data-testid": dataTestId,
    ...rest
  },
  ref,
) {
  const hasValidItemCount = typeof itemCount === "number" && itemCount >= 0;
  const safePageSize = pageSize > 0 ? pageSize : defaultProps.pageSize;
  const totalPages = hasValidItemCount ? Math.max(1, Math.ceil(itemCount / safePageSize)) : 1;
  const currentPage = hasValidItemCount
    ? Math.max(0, Math.min(pageIndex, totalPages - 1))
    : Math.max(0, pageIndex);
  const currentPageNumber = currentPage + 1;
  const visiblePages = useMemo(
    () => visiblePageNumbers(currentPageNumber, totalPages, maxVisiblePages),
    [currentPageNumber, totalPages, maxVisiblePages],
  );

  const changePage = useCallback((newPageIndex: number) => {
    const clamped = hasValidItemCount
      ? Math.max(0, Math.min(newPageIndex, totalPages - 1))
      : Math.max(0, newPageIndex);
    if (clamped !== currentPage) {
      void onPageDidChange?.(clamped, safePageSize, itemCount ?? 0);
    }
  }, [currentPage, hasValidItemCount, itemCount, onPageDidChange, safePageSize, totalPages]);

  const api = useMemo<PaginationApi>(() => ({
    moveFirst: () => changePage(0),
    moveLast: () => changePage(totalPages - 1),
    movePrev: () => changePage(currentPage - 1),
    moveNext: () => changePage(currentPage + 1),
    get currentPage() {
      return currentPageNumber;
    },
    get currentPageSize() {
      return safePageSize;
    },
  }), [changePage, currentPage, currentPageNumber, safePageSize, totalPages]);

  useImperativeHandle(ref, () => api, [api]);

  useEffect(() => {
    registerApi?.(api as unknown as Record<string, unknown>);
  }, [api, registerApi]);

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;
  const buttons = hasValidItemCount
    ? (
      <>
        <PageButton label="First page" disabled={!enabled || isFirstPage} onClick={() => changePage(0)}>First</PageButton>
        <PageButton label="Previous page" disabled={!enabled || isFirstPage} onClick={() => changePage(currentPage - 1)}>Prev</PageButton>
        {showCurrentPage && visiblePages.map((page) => (
          <PageButton
            key={page}
            label={`Page ${page}`}
            current={page === currentPageNumber}
            disabled={!enabled}
            onClick={() => changePage(page - 1)}
          >
            {page}
          </PageButton>
        ))}
        <PageButton label="Next page" disabled={!enabled || isLastPage} onClick={() => changePage(currentPage + 1)}>Next</PageButton>
        <PageButton label="Last page" disabled={!enabled || isLastPage} onClick={() => changePage(totalPages - 1)}>Last</PageButton>
      </>
    )
    : (
      <>
        <PageButton label="Previous page" disabled={!enabled || !hasPrevPage} onClick={() => changePage(currentPage - 1)}>Prev</PageButton>
        <PageButton label="Next page" disabled={!enabled || !hasNextPage} onClick={() => changePage(currentPage + 1)}>Next</PageButton>
      </>
    );

  const buttonRow = (
    <ul className={cx(styles.buttonRow, orientation === "vertical" ? styles.paginationListVertical : undefined)} data-xmlui-part="pagination-controls">
      {buttons}
    </ul>
  );
  const pageInfo = showPageInfo && hasValidItemCount
    ? <div className={styles.pageInfo} data-xmlui-part="page-info">Page {currentPageNumber} of {totalPages}</div>
    : null;
  const selector = showPageSizeSelector && pageSizeOptions && pageSizeOptions.length > 1
    ? (
      <label className={styles.selectorContainer} data-xmlui-part="page-size-selector-container">
        <span className={styles.pageSizeLabel}>Rows per page</span>
        <select
          className={styles.pageSizeSelect}
          disabled={!enabled}
          value={safePageSize}
          onChange={(event) => void onPageSizeDidChange?.(Number(event.currentTarget.value))}
        >
          {pageSizeOptions.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
    )
    : null;

  return (
    <nav
      {...rest}
      id={id}
      role="navigation"
      aria-label="Pagination"
      data-testid={dataTestId}
      className={cx(styles.pagination, orientation === "vertical" ? styles.paginationVertical : undefined, className)}
      style={style}
    >
      <Slot position={pageSizeSelectorPosition}>{selector}</Slot>
      <Slot position={buttonRowPosition}>{buttonRow}</Slot>
      <Slot position={pageInfoPosition}>{pageInfo}</Slot>
    </nav>
  );
}));

function PageButton({
  label,
  disabled,
  current,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  current?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <li>
      <button
        className={styles.paginationButton}
        type="button"
        disabled={disabled}
        aria-label={label}
        aria-current={current ? "page" : undefined}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
}

function Slot({ position, children }: { position: Position; children: React.ReactNode }) {
  if (!children) {
    return null;
  }
  return <div className={cx(styles.slot, positionClass(position))}>{children}</div>;
}

function visiblePageNumbers(currentPage: number, totalPages: number, maxVisiblePages: PageNumber): number[] {
  const count = Math.max(1, maxVisiblePages);
  if (totalPages <= count) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const half = Math.floor(count / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + count - 1);
  if (end === totalPages) {
    start = Math.max(1, end - count + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function positionClass(position: Position): string {
  switch (position) {
    case "start":
      return styles.startSlot;
    case "end":
      return styles.endSlot;
    case "center":
    default:
      return styles.centerSlot;
  }
}

function cx(...parts: Array<string | undefined | false>): string {
  return parts.filter(Boolean).join(" ");
}
