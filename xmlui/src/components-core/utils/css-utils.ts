import { useEffect, useState, type CSSProperties } from "react";

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

export function normalizeCssValueForCalc(cssValue: string | number) {
  if (typeof cssValue === "number") {
    return `${cssValue}px`;
  }

  const cssTrimmed = cssValue.trim();
  if (cssTrimmed.startsWith("var(")) {
    return cssTrimmed;
  }

  const value = parseFloat(cssTrimmed);
  const valueStr = value.toString();
  const unit = cssTrimmed.replace(valueStr, "");

  if (Number.isNaN(value)) {
    return "0px";
  }
  if (unit === "") {
    return `${valueStr}px`;
  }
  return cssTrimmed;
}

export function getSizeString(size: unknown): string {
  if (typeof size === "number") {
    return `${size}px`;
  }

  if (typeof size === "string" && /^\d+$/.test(size.trim())) {
    const value = parseInt(size, 10);
    if (!Number.isNaN(value)) {
      return `${value}px`;
    }
  }

  return size?.toString() ?? "";
}

export const useScrollbarWidth = () => {
  const [scrollbarWidth, setScrollbarWidth] = useState(15);

  useEffect(() => {
    function handleResize() {
      let width = obtainScrollbarWidth();
      if (window.devicePixelRatio !== Math.round(window.devicePixelRatio)) {
        width -= 0.5;
      }
      setScrollbarWidth(width);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return scrollbarWidth;
};

let cachedScrollbarWidth: number | null = null;

function obtainScrollbarWidth() {
  if (cachedScrollbarWidth !== null) {
    return cachedScrollbarWidth;
  }

  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll";
  document.body.appendChild(outer);

  const width = outer.offsetWidth - outer.clientWidth;

  outer.parentNode?.removeChild(outer);
  cachedScrollbarWidth = width;
  return width;
}
