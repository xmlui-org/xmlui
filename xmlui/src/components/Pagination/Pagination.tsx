import React from "react";
import { createMetadata, dEnabled } from "../../component-core/metadata/helpers";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import { extractScssThemeVars } from "../../styling/theme";
import { defaultProps, PageNumberValues, PositionValues, type PageNumber, type Position } from "./Pagination.defaults";
import { PaginationNative, type PaginationApi } from "./PaginationReact";

const COMP = "Pagination";

export { PositionValues };
export type { Position };

const paginationStylesSource = `
$backgroundColor-Pagination: createThemeVar("backgroundColor-Pagination");
$borderColor-Pagination: createThemeVar("borderColor-Pagination");
$borderRadius-selector-Pagination: createThemeVar("borderRadius-selector-Pagination");
$textColor-Pagination: createThemeVar("textColor-Pagination");
$backgroundColor-selector-Pagination: createThemeVar("backgroundColor-selector-Pagination");
$textColor-selector-Pagination: createThemeVar("textColor-selector-Pagination");
$padding-Pagination: createThemeVar("padding-Pagination");
$gap-buttonRow-Pagination: createThemeVar("gap-buttonRow-Pagination");
`;

export const PaginationMd = createMetadata({
  status: "experimental",
  description: "`Pagination` enables navigation through large datasets by dividing content into pages.",
  parts: {
    "pagination-controls": { description: "The container for pagination buttons." },
    "page-info": { description: "The container for page information display." },
    "page-size-selector-container": { description: "The container for the page size selector dropdown." },
  },
  props: {
    id: { description: "The component id.", valueType: "string" },
    testId: { description: "The test id.", valueType: "string" },
    enabled: dEnabled(),
    itemCount: { description: "Total number of items to paginate.", valueType: "number" },
    pageSize: { description: "Number of items per page.", valueType: "number", defaultValue: defaultProps.pageSize },
    pageIndex: { description: "Current page index (0-based).", valueType: "number", defaultValue: defaultProps.pageIndex },
    maxVisiblePages: {
      description: "Maximum number of page buttons to display.",
      availableValues: [...PageNumberValues],
      valueType: "number",
      defaultValue: defaultProps.maxVisiblePages,
    },
    showPageInfo: { description: "Whether to show page information.", valueType: "boolean", defaultValue: defaultProps.showPageInfo },
    showPageSizeSelector: {
      description: "Whether to show the page size selector.",
      valueType: "boolean",
      defaultValue: defaultProps.showPageSizeSelector,
    },
    showCurrentPage: {
      description: "Whether to show the current page indicator.",
      valueType: "boolean",
      defaultValue: defaultProps.showCurrentPage,
    },
    pageSizeOptions: { description: "Array of page sizes.", valueType: "any" },
    hasPrevPage: { description: "Whether a previous page is available in simplified mode.", valueType: "boolean" },
    hasNextPage: { description: "Whether a next page is available in simplified mode.", valueType: "boolean" },
    orientation: {
      description: "Layout orientation.",
      valueType: "string",
      availableValues: ["horizontal", "vertical"],
      defaultValue: defaultProps.orientation,
    },
    pageSizeSelectorPosition: {
      description: "Position of the page size selector.",
      valueType: "string",
      availableValues: [...PositionValues],
      defaultValue: defaultProps.pageSizeSelectorPosition,
    },
    pageInfoPosition: {
      description: "Position of page information.",
      valueType: "string",
      availableValues: [...PositionValues],
      defaultValue: defaultProps.pageInfoPosition,
    },
    buttonRowPosition: {
      description: "Position of pagination controls.",
      valueType: "string",
      availableValues: [...PositionValues],
      defaultValue: defaultProps.buttonRowPosition,
    },
  },
  events: {
    pageDidChange: {
      description: "Fired when the current page changes.",
      signature: "pageDidChange(pageIndex: number): void",
    },
    pageSizeDidChange: {
      description: "Fired when page size changes.",
      signature: "pageSizeDidChange(pageSize: number): void",
    },
  },
  apis: {
    moveFirst: { description: "Moves to the first page.", signature: "moveFirst(): void" },
    moveLast: { description: "Moves to the last page.", signature: "moveLast(): void" },
    movePrev: { description: "Moves to the previous page.", signature: "movePrev(): void" },
    moveNext: { description: "Moves to the next page.", signature: "moveNext(): void" },
    currentPage: { description: "Gets the current page number (1-based)." },
    currentPageSize: { description: "Gets the current page size." },
  },
  themeVars: extractScssThemeVars(paginationStylesSource),
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

export const paginationRenderer = wrapComponent({
  name: COMP,
  metadata: PaginationMd,
  renderer: ({ adapter }) => {
    const maxVisiblePages = adapter.numberProp("maxVisiblePages", defaultProps.maxVisiblePages);
    const sanitizedMaxVisiblePages = PageNumberValues.includes(maxVisiblePages as PageNumber)
      ? maxVisiblePages as PageNumber
      : defaultProps.maxVisiblePages;
    const orientation = adapter.stringProp("orientation", defaultProps.orientation);
    const sanitizedOrientation = orientation === "vertical" ? "vertical" : "horizontal";
    const apiRef = { current: null as PaginationApi | null };
    return (
      <PaginationNative
        {...adapter.rootAttrs()}
        ref={(api) => {
          apiRef.current = api;
          if (api) {
            adapter.registerApi(api as unknown as Record<string, unknown>);
          }
        }}
        id={adapter.stringProp("id")}
        enabled={adapter.booleanProp("enabled", true)}
        itemCount={optionalNumber(adapter.prop("itemCount"))}
        pageSize={adapter.numberProp("pageSize", defaultProps.pageSize)}
        pageIndex={adapter.numberProp("pageIndex", defaultProps.pageIndex)}
        maxVisiblePages={sanitizedMaxVisiblePages}
        showPageInfo={adapter.booleanProp("showPageInfo", defaultProps.showPageInfo)}
        showPageSizeSelector={adapter.booleanProp("showPageSizeSelector", defaultProps.showPageSizeSelector)}
        showCurrentPage={adapter.booleanProp("showCurrentPage", defaultProps.showCurrentPage)}
        pageSizeOptions={arrayOfNumbers(adapter.prop("pageSizeOptions"))}
        orientation={sanitizedOrientation}
        buttonRowPosition={positionProp(adapter.stringProp("buttonRowPosition"), defaultProps.buttonRowPosition)}
        pageInfoPosition={positionProp(adapter.stringProp("pageInfoPosition"), defaultProps.pageInfoPosition)}
        pageSizeSelectorPosition={positionProp(adapter.stringProp("pageSizeSelectorPosition"), defaultProps.pageSizeSelectorPosition)}
        hasPrevPage={adapter.booleanProp("hasPrevPage", false)}
        hasNextPage={adapter.booleanProp("hasNextPage", false)}
        onPageDidChange={(pageIndex, pageSize, itemCount) =>
          void adapter.event("pageDidChange")(pageIndex, pageSize, itemCount)}
        onPageSizeDidChange={(pageSize) => void adapter.event("pageSizeDidChange")(pageSize)}
      />
    );
  },
});

type ThemedPaginationProps = React.ComponentPropsWithoutRef<typeof PaginationNative>;

export const ThemedPagination = React.forwardRef<
  React.ElementRef<typeof PaginationNative>,
  ThemedPaginationProps
>(function ThemedPagination({ className, ...props }, ref) {
  const themeClass = useComponentThemeClass(COMP, PaginationMd);
  return (
    <PaginationNative
      {...props}
      className={[themeClass.className, className].filter(Boolean).join(" ")}
      ref={ref}
    />
  );
});

function arrayOfNumbers(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
}

function optionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function positionProp(value: string | undefined, fallback: Position): Position {
  return PositionValues.includes(value as Position) ? value as Position : fallback;
}
