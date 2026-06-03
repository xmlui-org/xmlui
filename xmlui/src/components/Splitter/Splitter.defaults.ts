import type { OrientationOptions } from "../abstractions";

export const defaultProps: {
  initialPrimarySize: string;
  minPrimarySize: string;
  maxPrimarySize: string;
  orientation: OrientationOptions;
  swapped: boolean;
  floating: boolean;
} = {
  initialPrimarySize: "50%",
  minPrimarySize: "0%",
  maxPrimarySize: "100%",
  orientation: "vertical",
  swapped: false,
  floating: false,
};
