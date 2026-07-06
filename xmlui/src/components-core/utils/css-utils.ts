import { useEffect, useState, type CSSProperties } from "react";

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

export function normalizeCssValueForCalc(cssValue: string | number) {
  if (typeof cssValue === "number") {
    return `${cssValue}px`;
  }

  const trimmed = cssValue.trim();
  if (trimmed.startsWith("var(")) {
    return trimmed;
  }

  const value = parseFloat(trimmed);
  const valueString = value.toString();
  const unit = trimmed.replace(valueString, "");

  if (Number.isNaN(value)) {
    return "0px";
  }
  if (unit === "") {
    return `${valueString}px`;
  }
  return trimmed;
}

export function getSizeString(size: unknown): string {
  if (typeof size === "number") {
    return `${size}px`;
  }
  if (typeof size === "string" && /^\d+$/.test(size.trim())) {
    return `${parseInt(size, 10)}px`;
  }
  return size?.toString() ?? "";
}

export function extractPaddings(extractValue: any, props: Record<string, unknown>) {
  const paddingHorizontal = extractValue.asSize?.(props.paddingHorizontal);
  const paddingVertical = extractValue.asSize?.(props.paddingVertical);
  const paddingLeft = extractValue.asSize?.(props.paddingLeft);
  const paddingRight = extractValue.asSize?.(props.paddingRight);
  const paddingTop = extractValue.asSize?.(props.paddingTop);
  const paddingBottom = extractValue.asSize?.(props.paddingBottom);
  const padding = extractValue.asSize?.(props.padding);

  return {
    paddingLeft: paddingLeft || paddingHorizontal || padding,
    paddingRight: paddingRight || paddingHorizontal || padding,
    paddingTop: paddingTop || paddingVertical || padding,
    paddingBottom: paddingBottom || paddingVertical || padding,
  };
}

export function useScrollbarWidth() {
  const [scrollbarWidth, setScrollbarWidth] = useState(15);

  useEffect(() => {
    const handleResize = () => {
      setScrollbarWidth(obtainScrollbarWidth());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return scrollbarWidth;
}

let cachedScrollbarWidth: number | null = null;

function obtainScrollbarWidth() {
  if (cachedScrollbarWidth !== null) {
    return cachedScrollbarWidth;
  }
  if (typeof document === "undefined") {
    return 15;
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
