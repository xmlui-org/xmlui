import type { CSSProperties } from "react";

export type StyleObjectType = {
  [key: string]: CSSProperties[keyof CSSProperties] | StyleObjectType | undefined;
};
