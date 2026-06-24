export type SplitterResizeMode = "preserveRatio" | "preservePrimary" | "preserveSecondary";
export type SplitterOrientation = "horizontal" | "vertical";

export const defaultProps: {
  initialPrimarySize: string;
  minPrimarySize: string;
  maxPrimarySize: string;
  orientation: SplitterOrientation;
  swapped: boolean;
  floating: boolean;
  resizeMode: SplitterResizeMode;
} = {
  initialPrimarySize: "50%",
  minPrimarySize: "0%",
  maxPrimarySize: "100%",
  orientation: "vertical",
  swapped: false,
  floating: false,
  resizeMode: "preserveRatio",
};
