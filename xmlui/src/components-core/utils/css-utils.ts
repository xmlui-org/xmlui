import type { CSSProperties } from "react";

import { EMPTY_OBJECT } from "../constants";

export function getMaxLinesStyle(maxLines: number | undefined) {
  const _maxLines = maxLines && maxLines > 0 ? maxLines : 0;
  const maxLinesStyles: CSSProperties =
    _maxLines > 1
      ? {
          WebkitLineClamp: _maxLines,
          lineClamp: _maxLines,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          boxOrient: "vertical",
          whiteSpace: "initial",
          overflow: "hidden",
        }
      : EMPTY_OBJECT;
  return maxLinesStyles;
}
