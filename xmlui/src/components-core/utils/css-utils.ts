import type { CSSProperties } from "react";

import { EMPTY_OBJECT } from "../constants";

export function getMaxLinesStyle(maxLines: number | undefined) {
  const lineCount = maxLines && maxLines > 0 ? maxLines : 0;
  const maxLinesStyles: CSSProperties =
    lineCount > 1
      ? {
          WebkitLineClamp: lineCount,
          lineClamp: lineCount,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          boxOrient: "vertical",
          whiteSpace: "initial",
          overflow: "hidden",
        }
      : EMPTY_OBJECT;
  return maxLinesStyles;
}
