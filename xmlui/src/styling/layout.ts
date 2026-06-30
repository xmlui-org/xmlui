import type { CSSProperties } from "react";

import {
  responsiveBreakpoints,
  supportedLayoutPropNames,
  type LayoutOrientation,
} from "./contracts";
import { resolveThemeReferences } from "./theme";

export type LayoutStyleOptions = {
  orientation?: LayoutOrientation;
  parentOrientation?: LayoutOrientation | string;
};

export const COMPONENT_PART_KEY = "-component";

export type ResponsiveLayoutStyles = Record<
  string,
  {
    base: CSSProperties;
    breakpoints: Partial<Record<keyof typeof responsiveBreakpoints, CSSProperties>>;
    states: Record<
      string,
      {
        base: CSSProperties;
        breakpoints: Partial<Record<keyof typeof responsiveBreakpoints, CSSProperties>>;
      }
    >;
  }
>;

export function resolveLayoutStyle(
  props: Record<string, unknown>,
  options: LayoutStyleOptions = {},
): CSSProperties {
  const style: CSSProperties = { boxSizing: "border-box" };
  const orientation = options.orientation ?? orientationFromProp(props.orientation);

  if (orientation) {
    style.display = "flex";
    style.flexDirection = orientation === "horizontal" ? "row" : "column";
  }

  assignSize(style, "width", props.width, options.parentOrientation === "horizontal");
  assignSize(style, "minWidth", props.minWidth);
  assignSize(style, "maxWidth", props.maxWidth);
  assignSize(style, "height", props.height, options.parentOrientation === "vertical");
  assignSize(style, "minHeight", props.minHeight);
  assignSize(style, "maxHeight", props.maxHeight);

  assign(style, "gap", props.gap);
  assign(style, "backgroundColor", props.backgroundColor);
  assign(style, "background", props.background);
  assign(style, "boxShadow", props.boxShadow);
  assign(style, "direction", props.direction);
  assign(style, "overflowX", props.overflowX);
  assign(style, "overflowY", props.overflowY);
  assign(style, "zIndex", props.zIndex, false);
  assign(style, "color", props.color);
  assign(style, "fontFamily", props.fontFamily);
  assign(style, "fontSize", props.fontSize);
  assign(style, "fontWeight", props.fontWeight, false);
  assign(style, "fontStyle", props.fontStyle);
  assign(style, "textDecoration", props.textDecoration);
  assign(style, "userSelect", props.userSelect);
  assign(style, "letterSpacing", props.letterSpacing);
  assign(style, "textTransform", props.textTransform);
  assign(style, "lineHeight", props.lineHeight, false);
  assign(style, "opacity", props.opacity, false);
  assign(style, "cursor", props.cursor);
  assign(style, "textWrap", props.textWrap);
  assign(style, "textAlign", props.textAlign);
  assign(style, "textAlignLast", props.textAlignLast);
  assign(style, "top", props.top);
  assign(style, "right", props.right);
  assign(style, "bottom", props.bottom);
  assign(style, "left", props.left);
  assign(style, "zoom", props.zoom, false);
  assign(style, "whiteSpace", props.whiteSpace);
  assign(style, "textDecorationLine", props.textDecorationLine);
  assign(style, "textDecorationColor", props.textDecorationColor);
  assign(style, "textDecorationStyle", props.textDecorationStyle);
  assign(style, "textDecorationThickness", props.textDecorationThickness);
  assign(style, "textUnderlineOffset", props.textUnderlineOffset);
  assign(style, "outline", props.outline);
  assign(style, "outlineWidth", props.outlineWidth);
  assign(style, "outlineColor", props.outlineColor);
  assign(style, "outlineStyle", props.outlineStyle);
  assign(style, "outlineOffset", props.outlineOffset);
  assign(style, "fontVariant", props.fontVariant);
  assign(style, "lineBreak", props.lineBreak);
  assign(style, "textIndent", props.textIndent);
  assign(style, "textShadow", props.textShadow);
  assign(style, "wordBreak", props.wordBreak);
  assign(style, "wordSpacing", props.wordSpacing);
  assign(style, "wordWrap", props.wordWrap);
  assign(style, "writingMode", props.writingMode);
  assign(style, "transition", props.transition);
  assign(style, "transform", props.transform);
  assign(style, "alignItems", props.alignItems);
  assign(style, "justifyContent", props.justifyContent);
  assign(style, "scrollSnapType", props.scrollSnapType);
  assign(style, "scrollSnapAlign", props.scrollSnapAlign);
  assign(style, "scrollSnapStop", props.scrollSnapStop);

  assignBox(style, "padding", props);
  assignBox(style, "margin", props);
  assignScrollBox(style, props);
  assignBorder(style, props);
  assignAlignment(style, props, orientation);
  assignFlexBehavior(style, props);
  assignInlineCss(style, props.style);

  return style;
}

export function parseStyleSelectorKey(key: string): {
  property: string;
  part?: string;
  breakpoint?: string;
  state?: string;
} {
  const [beforeState, state] = key.split("--", 2);
  const segments = beforeState.split("-").filter(Boolean);
  const propertyMatch = findLayoutPropertyPrefix(segments);
  if (!propertyMatch) {
    return {
      property: segments[0] ?? key,
      part: segments.length > 2 ? segments.slice(1, -1).join("-") : segments[1],
      breakpoint: segments.length > 2 ? segments[segments.length - 1] : undefined,
      state,
    };
  }
  const rest = segments.slice(propertyMatch.segmentCount);
  const breakpoint = rest.length > 0 && isBreakpoint(rest[rest.length - 1])
    ? rest[rest.length - 1]
    : undefined;
  const partSegments = breakpoint ? rest.slice(0, -1) : rest;
  return {
    property: propertyMatch.property,
    part: partSegments.length > 0 ? partSegments.join("-") : undefined,
    breakpoint,
    state,
  };
}

export function resolveResponsiveLayoutStyles(
  props: Record<string, unknown>,
  options: LayoutStyleOptions = {},
): ResponsiveLayoutStyles {
  const styles: ResponsiveLayoutStyles = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (looksLikeComponentThemeVariableName(key)) {
      continue;
    }
    const selector = parseStyleSelectorKey(key);
    if (!supportedLayoutPropNames.includes(selector.property as never)) {
      continue;
    }
    const part = selector.part ?? COMPONENT_PART_KEY;
    const entry = styles[part] ??= { base: {}, breakpoints: {}, states: {} };
    const style = resolveLayoutStyle({ [selector.property]: value }, options);
    if (selector.state) {
      const state = entry.states[selector.state] ??= { base: {}, breakpoints: {} };
      if (selector.breakpoint && isBreakpoint(selector.breakpoint)) {
        state.breakpoints[selector.breakpoint] = {
          ...state.breakpoints[selector.breakpoint],
          ...style,
        };
      } else {
        Object.assign(state.base, style);
      }
    } else if (selector.breakpoint && isBreakpoint(selector.breakpoint)) {
      entry.breakpoints[selector.breakpoint] = {
        ...entry.breakpoints[selector.breakpoint],
        ...style,
      };
    } else {
      Object.assign(entry.base, style);
    }
  }
  return styles;
}

function assign(
  style: CSSProperties,
  key: keyof CSSProperties,
  value: unknown,
  pxForNumber = true,
): void {
  const normalized = normalizeCssValue(value, pxForNumber);
  if (normalized !== undefined) {
    (style as Record<string, unknown>)[key] = normalized;
  }
}

function assignSize(
  style: CSSProperties,
  key: "width" | "minWidth" | "maxWidth" | "height" | "minHeight" | "maxHeight",
  value: unknown,
  starAsFlex = false,
): void {
  const star = parseStarSize(value);
  if (star && starAsFlex) {
    style.flexGrow = star.grow;
    style.flexShrink = 1;
    style.flexBasis = 0;
    return;
  }
  assign(style, key, value);
}

function assignBox(
  style: CSSProperties,
  base: "padding" | "margin",
  props: Record<string, unknown>,
): void {
  assign(style, base, props[base]);
  assign(style, `${base}Top` as keyof CSSProperties, props[`${base}Top`]);
  assign(style, `${base}Right` as keyof CSSProperties, props[`${base}Right`]);
  assign(style, `${base}Bottom` as keyof CSSProperties, props[`${base}Bottom`]);
  assign(style, `${base}Left` as keyof CSSProperties, props[`${base}Left`]);

  const horizontal = normalizeCssValue(props[`${base}Horizontal`]);
  if (horizontal !== undefined) {
    (style as Record<string, unknown>)[`${base}Left`] = horizontal;
    (style as Record<string, unknown>)[`${base}Right`] = horizontal;
  }
  const vertical = normalizeCssValue(props[`${base}Vertical`]);
  if (vertical !== undefined) {
    (style as Record<string, unknown>)[`${base}Top`] = vertical;
    (style as Record<string, unknown>)[`${base}Bottom`] = vertical;
  }
}

function assignScrollBox(style: CSSProperties, props: Record<string, unknown>): void {
  assign(style, "scrollPadding", props.scrollPadding);
  assign(style, "scrollPaddingTop", props.scrollPaddingTop);
  assign(style, "scrollPaddingRight", props.scrollPaddingRight);
  assign(style, "scrollPaddingBottom", props.scrollPaddingBottom);
  assign(style, "scrollPaddingLeft", props.scrollPaddingLeft);
  assign(style, "scrollMargin", props.scrollMargin);
  assign(style, "scrollMarginTop", props.scrollMarginTop);
  assign(style, "scrollMarginRight", props.scrollMarginRight);
  assign(style, "scrollMarginBottom", props.scrollMarginBottom);
  assign(style, "scrollMarginLeft", props.scrollMarginLeft);
}

function assignBorder(style: CSSProperties, props: Record<string, unknown>): void {
  assign(style, "border", props.border);
  assign(style, "borderTop", props.borderTop);
  assign(style, "borderRight", props.borderRight);
  assign(style, "borderBottom", props.borderBottom);
  assign(style, "borderLeft", props.borderLeft);
  assign(style, "borderColor", props.borderColor);
  assign(style, "borderStyle", props.borderStyle);
  assign(style, "borderWidth", props.borderWidth);
  assign(style, "borderRadius", props.borderRadius);
  assign(style, "borderTopLeftRadius", props.radiusTopLeft);
  assign(style, "borderTopRightRadius", props.radiusTopRight);
  assign(style, "borderBottomLeftRadius", props.radiusBottomLeft);
  assign(style, "borderBottomRightRadius", props.radiusBottomRight);

  const horizontal = normalizeCssValue(props.borderHorizontal);
  if (horizontal !== undefined) {
    style.borderLeft = horizontal;
    style.borderRight = horizontal;
  }
  const vertical = normalizeCssValue(props.borderVertical);
  if (vertical !== undefined) {
    style.borderTop = vertical;
    style.borderBottom = vertical;
  }
}

function assignAlignment(
  style: CSSProperties,
  props: Record<string, unknown>,
  orientation?: LayoutOrientation,
): void {
  const horizontal = alignment(props.horizontalAlignment);
  const vertical = alignment(props.verticalAlignment);
  if (orientation === "vertical") {
    if (horizontal) {
      style.alignItems = horizontal;
    }
    if (vertical) {
      style.justifyContent = vertical;
    }
    return;
  }
  if (horizontal) {
    style.justifyContent = horizontal;
  }
  if (vertical) {
    style.alignItems = vertical;
  }
}

function assignFlexBehavior(style: CSSProperties, props: Record<string, unknown>): void {
  if (coerceBoolean(props.wrapContent)) {
    style.flexWrap = "wrap";
  }
  if (props.canShrink !== undefined) {
    style.flexShrink = coerceBoolean(props.canShrink) ? 1 : 0;
  }
}

function normalizeCssValue(value: unknown, pxForNumber = true): string | number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const resolved = resolveThemeReferences(value);
  if (typeof resolved === "number") {
    return pxForNumber ? `${resolved}px` : resolved;
  }
  return String(resolved);
}

function assignInlineCss(style: CSSProperties, value: unknown): void {
  if (typeof value !== "string" || value.trim() === "") {
    return;
  }
  for (const declaration of value.split(";")) {
    const separatorIndex = declaration.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }
    const name = declaration.slice(0, separatorIndex).trim();
    const rawValue = declaration.slice(separatorIndex + 1).trim();
    if (!name || !rawValue) {
      continue;
    }
    (style as Record<string, unknown>)[cssNameToReactName(name)] = resolveThemeReferences(rawValue);
  }
}

function cssNameToReactName(name: string): string {
  if (name.startsWith("--")) {
    return name;
  }
  return name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

function parseStarSize(value: unknown): { grow: number } | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const match = value.trim().match(/^(\d+(?:\.\d+)?)?\*$/);
  if (!match) {
    return undefined;
  }
  return { grow: match[1] ? Number(match[1]) : 1 };
}

function orientationFromProp(value: unknown): LayoutOrientation | undefined {
  return value === "horizontal" || value === "vertical" ? value : undefined;
}

function alignment(value: unknown): CSSProperties["alignItems"] {
  switch (value) {
    case "center":
    case "middle":
      return "center";
    case "end":
    case "right":
    case "bottom":
      return "flex-end";
    case "space-between":
      return "space-between";
    case "stretch":
      return "stretch";
    case "start":
    case "left":
    case "top":
      return "flex-start";
    default:
      return undefined;
  }
}

function findLayoutPropertyPrefix(
  segments: string[],
): { property: string; segmentCount: number } | undefined {
  for (let count = segments.length; count >= 1; count -= 1) {
    const property = segments.slice(0, count).join("-");
    if (supportedLayoutPropNames.includes(property as never)) {
      return { property, segmentCount: count };
    }
  }
  return undefined;
}

export function looksLikeComponentThemeVariableName(name: string): boolean {
  return /-[A-Z][A-Za-z0-9]*(?:-|$)/.test(name);
}

function isBreakpoint(value: string | undefined): value is keyof typeof responsiveBreakpoints {
  return value !== undefined && Object.prototype.hasOwnProperty.call(responsiveBreakpoints, value);
}

function coerceBoolean(value: unknown): boolean {
  if (typeof value === "string") {
    return value === "true";
  }
  return Boolean(value);
}
