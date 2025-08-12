import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d } from "../metadata-helpers";
import { defaultProps, PaginationNative } from "./PaginationNative";
import styles from "./Pagination.module.scss";

const COMP = "Pagination";

export const PaginationMd = createMetadata({
  status: "experimental",
  description:
    "`Pagination` enables navigation through large datasets by dividing content into pages. " +
    "It provides controls for page navigation and displays current page information.",
  props: {
    itemCount: d("Total number of items to paginate", undefined, "number", defaultProps.itemCount),
    pageSize: d("Number of items per page", undefined, "number", defaultProps.pageSize),
    pageIndex: d("Current page index (0-based)", undefined, "number", defaultProps.pageIndex),
    maxVisiblePages: d(
      "Maximum number of page buttons to display",
      undefined,
      "number",
      defaultProps.maxVisiblePages,
    ),
    hasPageInfo: d(
      "Whether to show page information",
      undefined,
      "boolean",
      defaultProps.hasPageInfo,
    ),
  },
  events: {
    pageDidChange: d("Fired when the current page changes"),
    pageSizeDidChange: d("Fired when the page size changes"),
  },
  apis: {
    moveFirst: {
      description: "Moves to the first page",
      signature: "moveFirst(): void",
    },
    moveLast: {
      description: "Moves to the last page",
      signature: "moveLast(): void",
    },
    movePrev: {
      description: "Moves to the previous page",
      signature: "movePrev(): void",
    },
    moveNext: {
      description: "Moves to the next page",
      signature: "moveNext(): void",
    },
  },
  contextVars: {
    currentPage: {
      description: "Gets the current page number (1-based)",
    },
    currentPageSize: {
      description: "Gets the current page size",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
});

export const paginationComponentRenderer = createComponentRenderer(
  COMP,
  PaginationMd,
  ({ node, extractValue, lookupEventHandler, registerComponentApi, updateState }) => {
    // Extract property values
    const itemCount = extractValue.asOptionalNumber(node.props.itemCount, 0);
    const pageSize = extractValue.asOptionalNumber(node.props.pageSize, defaultProps.pageSize);
    const pageIndex = extractValue.asOptionalNumber(node.props.pageIndex, defaultProps.pageIndex);
    const maxVisiblePages = extractValue.asOptionalNumber(
      node.props.maxVisiblePages,
      defaultProps.maxVisiblePages,
    );
    const hasPageInfo = extractValue.asOptionalBoolean(
      node.props.hasPageInfo,
      defaultProps.hasPageInfo,
    );

    // Create event handlers
    const onPageDidChange = lookupEventHandler("pageDidChange");
    const onPageSizeDidChange = lookupEventHandler("pageSizeDidChange");

    return (
      <PaginationNative
        itemCount={itemCount}
        pageSize={pageSize}
        pageIndex={pageIndex}
        maxVisiblePages={maxVisiblePages}
        hasPageInfo={hasPageInfo}
        onPageDidChange={onPageDidChange}
        onPageSizeDidChange={onPageSizeDidChange}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
      />
    );
  },
);
