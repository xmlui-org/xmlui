export type ScrollStyle = "normal" | "overlay" | "whenMouseOver" | "whenScrolling";

export const defaultProps: {
  scrollStyle: ScrollStyle;
  showScrollerFade: boolean;
} = {
  scrollStyle: "normal",
  showScrollerFade: true,
};
