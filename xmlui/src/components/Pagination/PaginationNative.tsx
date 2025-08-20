import { forwardRef, useEffect, useState, useCallback, useMemo } from "react";
import classnames from "classnames";
import type { CSSProperties, ReactNode } from "react";

import styles from "./Pagination.module.scss";
import { Button } from "../Button/ButtonNative";
import type { RegisterComponentApiFn, UpdateStateFn } from "../../abstractions/RendererDefs";
import { Text } from "../Text/TextNative";
import { Icon } from "../Icon/IconNative";
import type { OrientationOptions } from "../abstractions";
import type { ComponentApi } from "../../components-core/rendering/ContainerWrapper";

export const PageNumberValues = [1, 3, 5] as const;
export type PageNumber = (typeof PageNumberValues)[number];

type Props = {
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
  orientation?: OrientationOptions;
  reverseLayout?: boolean;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  onPageDidChange?: (pageIndex: number, pageSize: number, totalItemCount: number) => void;
  onPageSizeDidChange?: (pageSize: number) => void;
  registerComponentApi?: RegisterComponentApiFn;
  updateState?: UpdateStateFn;
  style?: CSSProperties;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const defaultProps: Required<
  Pick<
    Props,
    | "pageSize"
    | "pageIndex"
    | "maxVisiblePages"
    | "showPageInfo"
    | "showPageSizeSelector"
    | "orientation"
    | "reverseLayout"
    | "showCurrentPage"
  >
> = {
  pageSize: 10,
  pageIndex: 0,
  maxVisiblePages: 1,
  showPageInfo: true,
  showPageSizeSelector: true,
  orientation: "horizontal",
  reverseLayout: false,
  showCurrentPage: true,
};

interface PaginationAPI extends ComponentApi {
  moveFirst: () => void;
  moveLast: () => void;
  movePrev: () => void;
  moveNext: () => void;
  currentPage: number;
  currentPageSize: number;
}

export const PaginationNative = forwardRef<PaginationAPI, Props>(function PaginationNative(
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
    reverseLayout = defaultProps.reverseLayout,
    hasPrevPage,
    hasNextPage,
    onPageDidChange,
    onPageSizeDidChange,
    registerComponentApi,
    updateState,
    style,
    className,
    ...rest
  },
  ref,
) {
  // Check if we have valid itemCount for full pagination
  const hasValidItemCount = typeof itemCount === "number" && itemCount >= 0;

  // Calculate pagination values only when itemCount is valid
  const totalPages = hasValidItemCount ? Math.max(1, Math.ceil(itemCount / pageSize)) : 1;
  const currentPage = hasValidItemCount
    ? Math.max(0, Math.min(pageIndex, totalPages - 1))
    : pageIndex;
  const currentPageNumber = currentPage + 1; // 1-based for display

  // Track internal state for API access
  const [internalState, setInternalState] = useState({
    currentPage: currentPageNumber,
    currentPageSize: pageSize,
  });

  // Update internal state when props change
  useEffect(() => {
    setInternalState({
      currentPage: currentPageNumber,
      currentPageSize: pageSize,
    });

    // Update XMLUI container state
    updateState?.({
      currentPage: currentPageNumber,
      currentPageSize: pageSize,
      totalPages: hasValidItemCount ? totalPages : undefined,
      itemCount,
    });
  }, [currentPageNumber, pageSize, totalPages, itemCount, updateState, hasValidItemCount]);

  // Helper function to handle page changes
  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      const clampedPageIndex = hasValidItemCount
        ? Math.max(0, Math.min(newPageIndex, totalPages - 1))
        : newPageIndex;
      if (clampedPageIndex !== currentPage) {
        onPageDidChange?.(clampedPageIndex, pageSize, itemCount || 0);
      }
    },
    [currentPage, totalPages, onPageDidChange, pageSize, itemCount, hasValidItemCount],
  );

  // Helper function to handle page size changes
  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (newPageSize !== pageSize) {
        onPageSizeDidChange?.(newPageSize);
      }
    },
    [pageSize, onPageSizeDidChange],
  );

  // Memoize the API object to prevent unnecessary re-renders
  const paginationAPI: PaginationAPI = useMemo(
    () => ({
      moveFirst: () => handlePageChange(0),
      moveLast: () => handlePageChange(totalPages - 1),
      movePrev: () => handlePageChange(currentPage - 1),
      moveNext: () => handlePageChange(currentPage + 1),
      currentPage: internalState.currentPage,
      currentPageSize: internalState.currentPageSize,
    }),
    [handlePageChange, totalPages, currentPage, internalState],
  );

  // Register APIs with XMLUI framework
  useEffect(() => {
    if (registerComponentApi) {
      registerComponentApi(paginationAPI);
    }
  }, [registerComponentApi, paginationAPI]);

  // For undefined itemCount, show simplified pagination
  if (!hasValidItemCount) {
    return (
      <nav
        {...rest}
        role="navigation"
        aria-label="Pagination"
        ref={ref as any}
        id={id}
        className={classnames(
          styles.pagination,
          orientation === "vertical" ? styles.paginationVertical : styles.paginationHorizontal,
          reverseLayout && styles.paginationReverse,
          className,
        )}
        style={style}
      >
        <ul key={`${id}-pagination-controls`} className={styles.paginationList}>
          {/* Previous page button */}
          <li>
            <Button
              variant="ghost"
              size="sm"
              disabled={!enabled || !hasPrevPage}
              onClick={() => handlePageChange(currentPage - 1)}
              contextualLabel="Previous page"
              style={{ minHeight: "36px", padding: "8px" }}
              aria-label="Previous page"
            >
              <Icon name="chevronleft" size="sm" />
            </Button>
          </li>

          {/* Next page button */}
          <li>
            <Button
              variant="ghost"
              size="sm"
              disabled={!enabled || !hasNextPage}
              onClick={() => handlePageChange(currentPage + 1)}
              contextualLabel="Next page"
              style={{ minHeight: "36px", padding: "8px" }}
              aria-label="Next page"
            >
              <Icon name="chevronright" size="sm" />
            </Button>
          </li>
        </ul>
      </nav>
    );
  }

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show current page with context
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPageNumber - halfVisible);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  // Used the following resource to provide a11y:
  // https://a11ymatters.com/pattern/pagination/
  return (
    <nav
      {...rest}
      role="navigation"
      aria-label="Pagination"
      ref={ref as any}
      id={id}
      className={classnames(
        styles.pagination,
        orientation === "vertical" ? styles.paginationVertical : styles.paginationHorizontal,
        reverseLayout && styles.paginationReverse,
        className,
      )}
      style={style}
    >
      {showPageSizeSelector && pageSizeOptions && pageSizeOptions.length > 1 && (
        <div
          id={`page-size-selector-container`}
          key={`${id}-page-size-selector-container`}
          className={styles.selectorContainer}
        >
          <Text variant="secondary" className={styles.pageSizeLabel}>
            Items per page
          </Text>
          <select
            id={`${id}-page-size-selector`}
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            disabled={!enabled}
            className={styles.pageSizeSelect}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}
      {
        <ul key={`${id}-pagination-controls`} className={styles.paginationList}>
          {/* First page button */}
          <li>
            <Button
              variant="ghost"
              size="sm"
              disabled={!enabled || isFirstPage}
              onClick={() => handlePageChange(0)}
              contextualLabel="First page"
              style={{ minHeight: "36px", padding: "8px" }}
              aria-label="First page"
            >
              <Icon name="doublechevronleft" size="sm" />
            </Button>
          </li>

          {/* Previous page button */}
          {visiblePages.length <= 2 && (
            <li>
              <Button
                variant="ghost"
                size="sm"
                disabled={!enabled || isFirstPage}
                onClick={() => handlePageChange(currentPage - 1)}
                contextualLabel="Previous page"
                style={{ minHeight: "36px", padding: "8px" }}
                aria-label="Previous page"
              >
                <Icon name="chevronleft" size="sm" />
              </Button>
            </li>
          )}

          {/* Page number buttons or text indicator */}
          {showCurrentPage && visiblePages.length === 1 && (
            <li>
              <Text
                variant="strong"
                style={{ paddingLeft: "1rem", paddingRight: "1rem" }}
                aria-current="true"
              >
                {visiblePages[0]}
              </Text>
            </li>
          )}
          {visiblePages.length > 1 &&
            visiblePages.map((pageNum) => (
              <li key={`page-${pageNum}`}>
                <Button
                  variant={pageNum === currentPageNumber ? "solid" : "ghost"}
                  disabled={!enabled}
                  size="sm"
                  onClick={() => handlePageChange(pageNum - 1)}
                  contextualLabel={`Page ${pageNum}`}
                  aria-current={pageNum === currentPageNumber || undefined}
                  aria-label={`Page ${pageNum}${pageNum === currentPageNumber ? " (current)" : ""}`}
                >
                  {pageNum}
                </Button>
              </li>
            ))}

          {/* Next page button */}
          {visiblePages.length <= 2 && (
            <li>
              <Button
                variant="ghost"
                size="sm"
                disabled={!enabled || isLastPage}
                onClick={() => handlePageChange(currentPage + 1)}
                contextualLabel="Next page"
                style={{ minHeight: "36px", padding: "8px" }}
                aria-label="Next page"
              >
                <Icon name="chevronright" size="sm" />
              </Button>
            </li>
          )}

          {/* Last page button */}
          <li>
            <Button
              variant="ghost"
              size="sm"
              disabled={!enabled || isLastPage}
              onClick={() => handlePageChange(totalPages - 1)}
              contextualLabel="Last page"
              style={{ minHeight: "36px", padding: "8px" }}
              aria-label="Last page"
            >
              <Icon name="doublechevronright" size="sm" />
            </Button>
          </li>
        </ul>
      }
      {showPageInfo && (
        <Text key={`${id}-page-info`} variant="secondary">
          Page {currentPageNumber} of {totalPages} ({itemCount} items)
        </Text>
      )}
    </nav>
  );
});
