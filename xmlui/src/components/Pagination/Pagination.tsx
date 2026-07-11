import React from "react";
import { wrapComponent } from "../../components-core/wrapComponent";
import { parseScssVar } from "../../components-core/theming/themeVars";
import { useComponentThemeClass } from "../../components-core/theming/utils";
import { createMetadata, dEnabled } from "../metadata-helpers";
import { defaultProps } from "./Pagination.defaults";
import { PositionValues, type PageNumber, PageNumberValues, Pagination } from "./PaginationReact";
export { PositionValues } from "./PaginationReact";
export type { Position } from "./PaginationReact";
import styles from "./Pagination.module.scss";
import {
  orientationOptionMd,
  type OrientationOptions,
  orientationOptionValues,
} from "../abstractions";
import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent as wrapRuntimeComponent } from "../../runtime/rendering/adapter";

const COMP = "Pagination";

export const PaginationMd = createMetadata({
  status: "experimental",
  description:
    "`Pagination` enables navigation through large datasets by dividing content into pages. " +
    "It provides controls for page navigation and can display current page information.",
  parts: {
    "pagination-controls": {
      description: "The container for pagination buttons.",
    },
    "page-info": {
      description: "The container for page information display.",
    },
    "page-size-selector-container": {
      description: "The container for the page size selector dropdown.",
    },
  },
  props: {
    enabled: dEnabled(),
    itemCount: {
      description:
        "Total number of items to paginate. " +
        "If not provided, the component renders simplified pagination controls " +
        "that are enabled/disabled using the `hasPrevPage` and `hasNextPage` props.",
      valueType: "number",
    },
    pageSize: {
      description: "Number of items per page",
      valueType: "number",
      defaultValue: defaultProps.pageSize,
    },
    pageIndex: {
      description: "Current page index (0-based)",
      valueType: "number",
      defaultValue: defaultProps.pageIndex,
    },
    maxVisiblePages: {
      description:
        "Maximum number of page buttons to display. " +
        "If the value is not among the allowed values, it will fall back to the default.",
      availableValues: PageNumberValues,
      valueType: "number",
      defaultValue: defaultProps.maxVisiblePages,
    },
    showPageInfo: {
      description: "Whether to show page information",
      valueType: "boolean",
      defaultValue: defaultProps.showPageInfo,
    },
    showPageSizeSelector: {
      description: "Whether to show the page size selector",
      valueType: "boolean",
      defaultValue: defaultProps.showPageSizeSelector,
    },
    showCurrentPage: {
      description: "Whether to show the current page indicator",
      valueType: "boolean",
      defaultValue: defaultProps.showCurrentPage,
    },
    pageSizeOptions: {
      description:
        "Array of page sizes the user can select from. If provided, shows a page size selector dropdown",
      valueType: "any",
    },
    hasPrevPage: {
      description:
        "Whether to disable the previous page button. Only takes effect if itemCount is not provided.",
      valueType: "boolean",
    },
    hasNextPage: {
      description:
        "Whether to disable the next page button. Only takes effect if itemCount is not provided.",
      valueType: "boolean",
    },
    orientation: {
      description: "Layout orientation of the pagination component",
      options: orientationOptionValues,
      valueType: "string",
      availableValues: orientationOptionMd,
      defaultValue: defaultProps.orientation,
    },
    pageSizeSelectorPosition: {
      description: "Determines where to place the page size selector in the layout.",
      options: PositionValues,
      valueType: "string",
      defaultValue: defaultProps.pageSizeSelectorPosition,
    },
    pageInfoPosition: {
      description: "Determines where to place the page information in the layout.",
      options: PositionValues,
      valueType: "string",
      defaultValue: defaultProps.pageInfoPosition,
    },
    buttonRowPosition: {
      description: "Determines where to place the pagination button row in the layout.",
      availableValues: PositionValues,
      valueType: "string",
      defaultValue: defaultProps.buttonRowPosition,
    },
  },
  events: {
    pageDidChange: {
      description: "Fired when the current page changes",
      signature: "pageDidChange(pageIndex: number): void",
      parameters: {
        pageIndex: "The new page index (0-based).",
      },
    },
    pageSizeDidChange: {
      description: "Fired when the page size changes",
      signature: "pageSizeDidChange(pageSize: number): void",
      parameters: {
        pageSize: "The new page size.",
      },
    },
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
    "backgroundColor-Pagination": "$backgroundColor",
    "borderColor-Pagination": "$color-gray-300",
    "textColor-Pagination": "$color-gray-600",
    "backgroundColor-selector-Pagination": "transparent",
    "textColor-selector-Pagination": "$color-gray-600",
    "borderRadius-selector-Pagination": "$borderRadius",
    "gap-buttonRow-Pagination": "$space-2",
  },
});

type ThemedPaginationProps = React.ComponentPropsWithoutRef<typeof Pagination>;

export const ThemedPagination = React.forwardRef<
  React.ElementRef<typeof Pagination>,
  ThemedPaginationProps
>(function ThemedPagination({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(PaginationMd);
  return (
    <Pagination
      {...props}
      className={`${themeClass}${className ? ` ${className}` : ""}`}
      ref={ref}
    />
  );
});

export const paginationComponentRenderer = wrapComponent(COMP, Pagination, PaginationMd, {
  exposeRegisterApi: true,
  stateful: true,
  exclude: ["maxVisiblePages"],
  events: [],
  customRender(
    _props,
    { node, extractValue, lookupEventHandler, registerComponentApi, updateState, classes },
  ) {
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
      <Pagination
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
        classes={classes}
      />
    );
  },
});

export const paginationRenderer = wrapRuntimeComponent({
  name: COMP,
  metadata: PaginationMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    let maxVisiblePages = adapter.numberProp("maxVisiblePages", defaultProps.maxVisiblePages);
    if (!PageNumberValues.includes(maxVisiblePages as PageNumber)) {
      console.warn(
        `Invalid maxVisiblePages value provided To Pagination: ${maxVisiblePages}. Falling back to default.`,
      );
      maxVisiblePages = defaultProps.maxVisiblePages;
    }

    let orientation = adapter.stringProp("orientation", defaultProps.orientation);
    if (!orientationOptionValues.includes(orientation as OrientationOptions)) {
      console.warn(
        `Invalid orientation value provided To Pagination: ${orientation}. Falling back to default.`,
      );
      orientation = defaultProps.orientation;
    }

    return (
      <Pagination
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        enabled={adapter.booleanProp("enabled", true)}
        itemCount={optionalNumber(adapter.prop("itemCount"))}
        pageSize={adapter.numberProp("pageSize", defaultProps.pageSize)}
        pageIndex={adapter.numberProp("pageIndex", defaultProps.pageIndex)}
        showPageInfo={adapter.booleanProp("showPageInfo", defaultProps.showPageInfo)}
        showPageSizeSelector={adapter.booleanProp(
          "showPageSizeSelector",
          defaultProps.showPageSizeSelector,
        )}
        showCurrentPage={adapter.booleanProp("showCurrentPage", defaultProps.showCurrentPage)}
        hasPrevPage={adapter.booleanProp("hasPrevPage")}
        hasNextPage={adapter.booleanProp("hasNextPage")}
        maxVisiblePages={maxVisiblePages as PageNumber}
        pageSizeOptions={adapter.prop("pageSizeOptions") as number[] | undefined}
        orientation={orientation as OrientationOptions}
        buttonRowPosition={adapter.stringProp(
          "buttonRowPosition",
          defaultProps.buttonRowPosition,
        ) as React.ComponentProps<typeof Pagination>["buttonRowPosition"]}
        pageSizeSelectorPosition={adapter.stringProp(
          "pageSizeSelectorPosition",
          defaultProps.pageSizeSelectorPosition,
        ) as React.ComponentProps<typeof Pagination>["pageSizeSelectorPosition"]}
        pageInfoPosition={adapter.stringProp(
          "pageInfoPosition",
          defaultProps.pageInfoPosition,
        ) as React.ComponentProps<typeof Pagination>["pageInfoPosition"]}
        onPageDidChange={(pageIndex, pageSize, totalItemCount) =>
          void adapter.event("pageDidChange")(pageIndex, pageSize, totalItemCount)}
        onPageSizeDidChange={(pageSize) => void adapter.event("pageSizeDidChange")(pageSize)}
        registerComponentApi={adapter.registerApi}
        updateState={(state) => adapter.registerApi(state)}
        classes={{ root: adapter.className }}
      />
    );
  },
});

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
