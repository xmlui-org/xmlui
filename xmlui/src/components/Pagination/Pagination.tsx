import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dEnabled } from "../metadata-helpers";
import {
  PositionValues,
  defaultProps,
  type PageNumber,
  PageNumberValues,
  PaginationNative,
} from "./PaginationNative";
import styles from "./Pagination.module.scss";
import {
  orientationOptionMd,
  type OrientationOptions,
  orientationOptionValues,
} from "../abstractions";

const COMP = "Pagination";

export const PaginationMd = createMetadata({
  status: "experimental",
  description:
    "`Pagination` enables navigation through large datasets by dividing content into pages. " +
    "It provides controls for page navigation and can display current page information.",
  props: {
    enabled: dEnabled(),
    itemCount: d(
      "Total number of items to paginate. " +
        "If not provided, the component renders simplified pagination controls " +
        "that are enabled/disabled using the `hasPrevPage` and `hasNextPage` props.",
      undefined,
      "number",
    ),
    pageSize: d("Number of items per page", undefined, "number", defaultProps.pageSize),
    pageIndex: d("Current page index (0-based)", undefined, "number", defaultProps.pageIndex),
    maxVisiblePages: d(
      "Maximum number of page buttons to display. " +
        "If the value is not among the allowed values, it will fall back to the default.",
      PageNumberValues,
      "number",
      defaultProps.maxVisiblePages,
    ),
    showPageInfo: d(
      "Whether to show page information",
      undefined,
      "boolean",
      defaultProps.showPageInfo,
    ),
    showPageSizeSelector: d(
      "Whether to show the page size selector",
      undefined,
      "boolean",
      defaultProps.showPageSizeSelector,
    ),
    showCurrentPage: d(
      "Whether to show the current page indicator",
      undefined,
      "boolean",
      defaultProps.showCurrentPage,
    ),
    pageSizeOptions: d(
      "Array of page sizes the user can select from. If provided, shows a page size selector dropdown",
    ),
    hasPrevPage: d(
      "Whether to disable the previous page button. Only takes effect if itemCount is not provided.",
      undefined,
      "boolean",
    ),
    hasNextPage: d(
      "Whether to disable the next page button. Only takes effect if itemCount is not provided.",
      undefined,
      "boolean",
    ),
    orientation: {
      description: "Layout orientation of the pagination component",
      options: orientationOptionValues,
      type: "string",
      availableValues: orientationOptionMd,
      default: defaultProps.orientation,
    },
    pageSizeSelectorPosition: {
      description: "Determines where to place the page size selector in the layout.",
      options: PositionValues,
      type: "string",
      default: defaultProps.pageSizeSelectorPosition,
    },
    pageInfoPosition: {
      description: "Determines where to place the page information in the layout.",
      options: PositionValues,
      type: "string",
      default: defaultProps.pageInfoPosition,
    },
    buttonRowPosition: d(
      "Determines where to place the pagination button row in the layout.",
      PositionValues,
      "string",
      defaultProps.buttonRowPosition,
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
    currentPage: {
      description: "Gets the current page number (1-based)",
    },
    currentPageSize: {
      description: "Gets the current page size",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "padding-Pagination": "$space-4",
    "backgroundColor-Pagination": "transparent",
    "borderColor-Pagination": "$color-gray-300",
    "textColor-Pagination": "$color-gray-600",
    "backgroundColor-selector-Pagination": "transparent",
    "textColor-selector-Pagination": "$color-gray-600",
    "borderRadius-selector-Pagination": "$borderRadius",
    "gap-buttonRow-Pagination": "$space-2",
  },
});

export const paginationComponentRenderer = createComponentRenderer(
  COMP,
  PaginationMd,
  ({ node, extractValue, lookupEventHandler, registerComponentApi, updateState, className }) => {
    let maxVisiblePages = extractValue.asOptionalNumber(
      node.props.maxVisiblePages,
      defaultProps.maxVisiblePages,
    );
    if (!PageNumberValues.includes(maxVisiblePages as any)) {
      console.warn(
        `Invalid maxVisiblePages value provided To Pagination: ${maxVisiblePages}. Falling back to default.`,
      );
      maxVisiblePages = defaultProps.maxVisiblePages;
    }

    let orientation = extractValue.asOptionalString(
      node.props.orientation,
      defaultProps.orientation,
    );
    if (!orientationOptionValues.includes(orientation as any)) {
      console.warn(
        `Invalid orientation value provided To Pagination: ${orientation}. Falling back to default.`,
      );
      orientation = defaultProps.orientation;
    }

    return (
      <PaginationNative
        enabled={extractValue.asOptionalBoolean(node.props.enabled, true)}
        itemCount={extractValue.asOptionalNumber(node.props.itemCount)}
        pageSize={extractValue.asOptionalNumber(node.props.pageSize, defaultProps.pageSize)}
        pageIndex={extractValue.asOptionalNumber(node.props.pageIndex, defaultProps.pageIndex)}
        showPageInfo={extractValue.asOptionalBoolean(
          node.props.showPageInfo,
          defaultProps.showPageInfo,
        )}
        showPageSizeSelector={extractValue.asOptionalBoolean(
          node.props.showPageSizeSelector,
          defaultProps.showPageSizeSelector,
        )}
        showCurrentPage={extractValue.asOptionalBoolean(
          node.props.showCurrentPage,
          defaultProps.showCurrentPage,
        )}
        hasPrevPage={extractValue.asOptionalBoolean(node.props.hasPrevPage)}
        hasNextPage={extractValue.asOptionalBoolean(node.props.hasNextPage)}
        maxVisiblePages={maxVisiblePages as PageNumber}
        pageSizeOptions={extractValue(node.props.pageSizeOptions) as number[] | undefined}
        orientation={orientation as OrientationOptions}
        buttonRowPosition={extractValue.asOptionalString(
          node.props.buttonRowPosition,
          defaultProps.buttonRowPosition,
        )}
        pageSizeSelectorPosition={extractValue.asOptionalString(
          node.props.pageSizeSelectorPosition,
          defaultProps.pageSizeSelectorPosition,
        )}
        pageInfoPosition={extractValue.asOptionalString(
          node.props.pageInfoPosition,
          defaultProps.pageInfoPosition,
        )}
        onPageDidChange={lookupEventHandler("pageDidChange")}
        onPageSizeDidChange={lookupEventHandler("pageSizeDidChange")}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
        className={className}
      />
    );
  },
);
