import { createComponentRenderer } from "../../components-core/renderers";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { createMetadata, d, dEnabled } from "../metadata-helpers";
import {
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
    "It provides controls for page navigation and displays current page information.",
  props: {
    enabled: dEnabled(),
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
    pageSizeOptions: d(
      "Array of page sizes the user can select from. If provided, shows a page size selector dropdown",
    ),
    orientation: {
      description: "Layout orientation of the pagination component",
      options: orientationOptionValues,
      type: "string",
      availableValues: orientationOptionMd,
      default: defaultProps.orientation,
    },
    reverseLayout: d(
      "Whether to reverse the order of pagination sections",
      undefined,
      "boolean",
      defaultProps.reverseLayout,
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
  /* contextVars: {
    currentPage: {
      description: "Gets the current page number (1-based)",
    },
    currentPageSize: {
      description: "Gets the current page size",
    },
  }, */
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "gap-Pagination": "$space-2",
    "padding-Pagination": "$space-4",
    "alignment-Pagination": "center",
    "backgroundColor-Pagination": "transparent",
    "borderColor-Pagination": "$color-gray-300",
    "textColor-Pagination": "$color-gray-600",
    "backgroundColor-selector-Pagination": "transparent",
    "textColor-selector-Pagination": "$color-gray-600",
    "borderRadius-selector-Pagination": "$borderRadius",
  },
});

export const paginationComponentRenderer = createComponentRenderer(
  COMP,
  PaginationMd,
  ({ node, extractValue, lookupEventHandler, registerComponentApi, updateState, layoutCss }) => {
    // Extract property values
    const enabled = extractValue.asOptionalBoolean(node.props.enabled, true);
    const itemCount = extractValue.asOptionalNumber(node.props.itemCount, 0);
    const pageSize = extractValue.asOptionalNumber(node.props.pageSize, defaultProps.pageSize);
    const pageIndex = extractValue.asOptionalNumber(node.props.pageIndex, defaultProps.pageIndex);
    const hasPageInfo = extractValue.asOptionalBoolean(
      node.props.hasPageInfo,
      defaultProps.hasPageInfo,
    );
    const pageSizeOptions = extractValue(node.props.pageSizeOptions) as number[] | undefined;
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
    const reverseLayout = extractValue.asOptionalBoolean(
      node.props.reverseLayout,
      defaultProps.reverseLayout,
    );

    // Create event handlers
    const onPageDidChange = lookupEventHandler("pageDidChange");
    const onPageSizeDidChange = lookupEventHandler("pageSizeDidChange");

    return (
      <PaginationNative
        enabled={enabled}
        itemCount={itemCount}
        pageSize={pageSize}
        pageIndex={pageIndex}
        hasPageInfo={hasPageInfo}
        maxVisiblePages={maxVisiblePages as PageNumber}
        pageSizeOptions={pageSizeOptions}
        orientation={orientation as OrientationOptions}
        reverseLayout={reverseLayout}
        onPageDidChange={onPageDidChange}
        onPageSizeDidChange={onPageSizeDidChange}
        registerComponentApi={registerComponentApi}
        updateState={updateState}
        style={layoutCss}
      />
    );
  },
);
