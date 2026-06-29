import type { ScrollStyle } from "../ScrollViewer/ScrollViewer.defaults";

export const DEFAULT_ORIENTATION = "vertical";

export const defaultProps: {
  orientation: string;
  reverse: boolean;
  desktopOnly: boolean;
  hoverContainer: boolean;
  visibleOnHover: boolean;
  scrollStyle: ScrollStyle;
  showScrollerFade: boolean;
} = {
  orientation: DEFAULT_ORIENTATION,
  reverse: false,
  desktopOnly: false,
  hoverContainer: false,
  visibleOnHover: false,
  scrollStyle: "normal",
  showScrollerFade: true,
};
