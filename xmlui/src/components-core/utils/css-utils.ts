import type {CSSProperties} from "react";
import { useEffect, useRef} from "react";
import Color from "color";

import { getVarKey } from "@components-core/theming/themeVars";
import { EMPTY_OBJECT } from "@components-core/constants";

/**
 * Converts a string to its kebab-case representation
 * @param str Input string
 * @returns Kebab-case representation
 */
export function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`);
}

/**
 * Converts the set of style properties to a string
 * @param style Style properties
 * @returns Style string representation
 */
export function toStyleString(style: CSSProperties): string {
  return Object.keys(style).reduce((accumulator, key) => {
    // remove ' in value
    const cssValue = (style as any)[key].toString().replace("'", "");
    // build the result
    // you can break the line, add indent for it if you need
    return `${accumulator}${key}:${cssValue};`;
  }, "");
}

const formatStringToCamelCase = (str: string) => {
  const splitted = str.split("-");
  if (splitted.length === 1) return splitted[0];
  return (
    splitted[0] +
    splitted
      .slice(1)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join("")
  );
};

export const getStyleObjectFromString = (str: string) => {
  const style: React.CSSProperties = {};
  str.split(";").forEach((el) => {
    const [property, value] = el.split(":");
    if (!property || !value) return;

    const formattedProperty = formatStringToCamelCase(property.trim());
    // @ts-ignore
    style[formattedProperty] = value.trim();
  });

  return style;
};

export function normalizeCssValueForCalc(cssValue: string | number) {
  // 1. number -> append "px"
  if (typeof cssValue === "number") return cssValue + "px";

  // 2. string
  const cssTrimmed = cssValue.trim();
  if (cssTrimmed.startsWith("var(")) {
    return cssTrimmed;
  }

  const value = parseFloat(cssTrimmed);
  const valueStr = value.toString();
  const unit = cssTrimmed.replace(valueStr, "");

  //  a) non-value -> "0px"
  if (Number.isNaN(value)) return "0px";
  //  b) value without unit -> append "px"
  if (unit === "") return valueStr + "px";
  //  c) value with unit -> do nothing
  return cssTrimmed;
}

export type ColorDef = {
  name: string;
  format: "hex" | "rgb" | "hsl";
};

export function getColor(varName: string, format?: "hex" | "rgb" | "hsl") {
  const varValue = getComputedStyle(document.getElementById("_ui-engine-theme-root")!).getPropertyValue(
    getVarKey(varName)
  );
  if (format === "hex") {
    return Color(varValue).hex().toString();
  }
  return Color(varValue).toString();
}

export function getColors(...colors: (string | ColorDef)[]) {
  const ret: Record<string, string> = {};
  for (const color of colors) {
    if (typeof color === "string") {
      ret[color] = getColor(color);
    } else {
      ret[color.name] = getColor(color.name, color.format);
    }
  }
  return ret;
}

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
        }
      : EMPTY_OBJECT;
  return maxLinesStyles;
}

export function getSizeString(size: any): string {
  if (typeof size === "number") {
    return size + "px";
  }
  
  if (typeof size === "string" && /^\d+$/.test(size.trim())) {
    const rowGapValue = parseInt(size, 10);
    if (!isNaN(rowGapValue)) {
      return rowGapValue + "px";
    }
  }

  return size?.toString();
}

export const useScrollbarWidth = () => {
  const didCompute = useRef(false);
  const widthRef = useRef(0);

  useEffect(()=>{
    function handleResize(){
      didCompute.current = false;
    }
    window.addEventListener("resize", handleResize);
    return ()=>{
      window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (didCompute.current) return widthRef.current;

  // Creating invisible container
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll'; // forcing scrollbar to appear
  document.body.appendChild(outer);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - outer.clientWidth;

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);

  didCompute.current = true;
  widthRef.current = scrollbarWidth;

  return scrollbarWidth;
};
