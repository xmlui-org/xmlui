import type { LabelPosition } from "recharts/types/component/Label";

export const LabelPositionValues: Exclude<
  LabelPosition,
  {
    x?: number;
    y?: number;
  }
>[] = [
  "top",
  "left",
  "right",
  "bottom",
  "inside",
  "outside",
  "insideLeft",
  "insideRight",
  "insideTop",
  "insideBottom",
  "insideTopLeft",
  "insideBottomLeft",
  "insideTopRight",
  "insideBottomRight",
  "insideStart",
  "insideEnd",
  "end",
  "center",
  "centerTop",
  "centerBottom",
  "middle",
] as const;
