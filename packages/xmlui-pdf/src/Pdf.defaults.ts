import type { Annotation } from "./types/annotation.types";

export const defaultProps = {
  mode: "view" as "view" | "edit",
  scale: 1.0,
  annotations: [] as Annotation[],
  horizontalAlignment: "start" as "start" | "center" | "end",
  verticalAlignment: "start" as "start" | "center" | "end",
  scrollStyle: "normal" as "normal" | "overlay" | "whenMouseOver" | "whenScrolling",
};
