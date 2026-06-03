import type { ScrollStyle } from "../ScrollViewer/ScrollViewer";

export const defaultProps = {
  inDrawer: false,
  scrollStyle: "normal" as ScrollStyle,
  showScrollerFade: true,
  syncWithContent: false,
  syncScrollBehavior: "smooth" as ScrollBehavior,
  syncScrollPosition: "center" as ScrollLogicalPosition,
};
