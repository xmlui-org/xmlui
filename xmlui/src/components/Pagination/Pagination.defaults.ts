import type { OrientationOptions } from "../abstractions";

export type Position = "start" | "center" | "end";
export const PositionValues = ["start", "center", "end"] as const;

export type PageNumber = 1 | 3 | 5;
export const PageNumberValues = [1, 3, 5] as const;

export const defaultProps = {
  pageSize: 10,
  pageIndex: 0,
  maxVisiblePages: 1 as PageNumber,
  showPageInfo: true,
  showPageSizeSelector: true,
  orientation: "horizontal" as OrientationOptions,
  showCurrentPage: true,
  pageSizeSelectorPosition: "start" as Position,
  buttonRowPosition: "center" as Position,
  pageInfoPosition: "end" as Position,
};
