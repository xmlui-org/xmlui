import type { CSSProperties } from "react";
import type { LayoutContext } from "../../abstractions/RendererDefs";
import { isInsideLayout } from "../../abstractions/layout-context-utils";
import { EMPTY_OBJECT } from "../constants";
import { isEmpty } from "lodash-es";

export const THEME_VAR_PREFIX = "xmlui";
const themeVarCapturesRegex = /(\$[a-zA-Z][a-zA-Z0-9-_]*)/g;
const booleanRegex = /^(true|false)$/;
const starSizeRegex = /^\d*\*$/;

export type ResolvedLayout = {
  cssProps: Record<string, CSSProperties[keyof CSSProperties]>;
  issues: Set<string>;
};

const defaultCompResult: ResolvedLayout = {
  cssProps: {},
  issues: new Set(),
};

export type ApplyLayoutProperties = "none" | "dims" | "spacing" | "all";

/** Properties allowed in "dims" mode (dimensions only). */
export const DIMS_ONLY_PROPS = new Set([
  "width", "minWidth", "maxWidth",
  "height", "minHeight", "maxHeight",
]);

/** Properties allowed in "spacing" mode (dims + gap, padding, margin and their variants). */
export const SPACING_ONLY_PROPS = new Set([
  ...DIMS_ONLY_PROPS,
  "gap",
  "padding", "paddingHorizontal", "paddingVertical",
  "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "margin", "marginHorizontal", "marginVertical",
  "marginTop", "marginBottom", "marginLeft", "marginRight",
]);

export function resolveLayoutProps(
  layoutProps: LayoutProps = EMPTY_OBJECT,
  layoutContext?: LayoutContext,
  disableInlineStyle?: boolean,
  applyLayoutProperties?: ApplyLayoutProperties,
): ResolvedLayout {
  const mode = applyLayoutProperties ?? "all";

  // --- "none" mode: no layout properties at all
  if (mode === "none") {
    return defaultCompResult;
  }

  const result: ResolvedLayout = {
    cssProps: {},
    issues: new Set(),
  };

  // --- "dims" mode: only allow dimension properties
  const dimsOnly = mode === "dims";
  // --- "spacing" mode: allow dimensions + padding + margin + gap
  const spacingOnly = mode === "spacing";

  // Get the list of layout properties to ignore from layout context
  const ignoreLayoutProps = (layoutContext?.ignoreLayoutProps as string[]) || [];
  const shouldIgnore = (prop: string) => ignoreLayoutProps.includes(prop);

  // --- Inside a TableCell, reset min-width to 0 so nested flex containers
  // --- (HStack, Link, etc.) can shrink below their content width, allowing
  // --- text-overflow: ellipsis to work on descendant Text components. (#2936)
  // --- The Text component's own overflow CSS handles clipping; we do NOT set
  // --- overflow: hidden here because that would clip flow-mode text reflow.
  const insideTableCell = isInsideLayout(layoutContext, "TableCell");
  if (insideTableCell && !layoutProps.minWidth) {
    result.cssProps.minWidth = 0;
  }

  // --- Adjust flex
  if (!!getOrientation(layoutContext)) {
    // --- In a container, we normally use "flex-shrink: 0" to prevent items
    // --- from collapsing. Inside a TableCell however, items must be allowed
    // --- to shrink so that text truncation / ellipsis works. (#2936)
    // --- We set flexShrink: 1 explicitly (not just omit 0) so the inline style
    // --- overrides any SCSS class that sets flex-shrink: 0 (e.g. overflowFlow).
    if (insideTableCell) {
      result.cssProps.flexShrink = 1;
    } else {
      result.cssProps.flexShrink = 0;
    }
  }

  // --- Dimensions: widht and height is not considered to be inline styles
  if (!shouldIgnore("width")) {
    collectCss("width", false);
    const horizontalStarSize = getHorizontalStarSize(result.cssProps.width, layoutContext);
    if (horizontalStarSize !== null) {
      // --- We use "flex" when width is in start-size and allow shrinking
      result.cssProps.flex = horizontalStarSize;
      result.cssProps.flexShrink = 1;
    }
  }
  if (!shouldIgnore("minWidth")) {
    collectCss("minWidth", false);
  }
  if (!shouldIgnore("maxWidth")) {
    collectCss("maxWidth", false);
  }
  // Remove width if it's a star size (regardless of whether it was converted to flex)
  if (result.cssProps.width && typeof result.cssProps.width === 'string' && starSizeRegex.test(result.cssProps.width)) {
    delete result.cssProps.width;
  }
  collectCss("minWidth", false);
  collectCss("maxWidth", false);

  if (!shouldIgnore("height")) {
    collectCss("height", false);
    const verticalStarSize = getVerticalStarSize(result.cssProps.height, layoutContext);
    if (verticalStarSize !== null) {
      // --- We use "flex" when width is in start-size and allow shrinking
      result.cssProps.flex = verticalStarSize;
      result.cssProps.flexShrink = 1;
    }
  }
  if (!shouldIgnore("minHeight")) {
    collectCss("minHeight", false);
  }
  if (!shouldIgnore("maxHeight")) {
    collectCss("maxHeight", false);
  }
  // Remove height if it's a star size (regardless of whether it was converted to flex)
  if (result.cssProps.height && typeof result.cssProps.height === 'string' && starSizeRegex.test(result.cssProps.height)) {
    delete result.cssProps.height;
  }
  collectCss("minHeight", false);
  collectCss("maxHeight", false);

  // --- In "dims" mode, skip everything beyond dimensions
  if (dimsOnly) {
    // --- If we didn't set any props, return a referentially stable result
    if (isEmpty(result.cssProps) && isEmpty(result.issues)) {
      return defaultCompResult;
    }
    return result;
  }

  // --- Positions
  collectCss("top", disableInlineStyle);
  collectCss("right", disableInlineStyle);
  collectCss("bottom", disableInlineStyle);
  collectCss("left", disableInlineStyle);

  // --- Paddings and gap
  collectCss("gap", disableInlineStyle);
  collectCss("padding", disableInlineStyle);
  const paddingHorizontal = transformLayoutValue("paddingHorizontal");
  if (paddingHorizontal) {
    result.cssProps.paddingLeft = paddingHorizontal;
    result.cssProps.paddingRight = paddingHorizontal;
  }
  collectCss("paddingRight", disableInlineStyle);
  collectCss("paddingLeft", disableInlineStyle);

  const paddingVertical = transformLayoutValue("paddingVertical");
  if (paddingVertical) {
    result.cssProps.paddingTop = paddingVertical;
    result.cssProps.paddingBottom = paddingVertical;
  }
  collectCss("paddingTop", disableInlineStyle);
  collectCss("paddingBottom", disableInlineStyle);

  // --- Margins
  collectCss("margin", disableInlineStyle);
  const marginHorizontal = transformLayoutValue("marginHorizontal");
  if (marginHorizontal) {
    result.cssProps.marginLeft = marginHorizontal;
    result.cssProps.marginRight = marginHorizontal;
  }
  collectCss("marginRight", disableInlineStyle);
  collectCss("marginLeft", disableInlineStyle);

  const marginVertical = transformLayoutValue("marginVertical");
  if (marginVertical) {
    result.cssProps.marginTop = marginVertical;
    result.cssProps.marginBottom = marginVertical;
  }
  collectCss("marginTop", disableInlineStyle);
  collectCss("marginBottom", disableInlineStyle);

  // --- In "spacing" mode, skip everything beyond dimensions + padding + margin
  if (spacingOnly) {
    // --- If we didn't set any props, return a referentially stable result
    if (isEmpty(result.cssProps) && isEmpty(result.issues)) {
      return defaultCompResult;
    }
    return result;
  }

  // --- Borders
  collectCss("border", disableInlineStyle);
  const horizontalBorder = transformLayoutValue("borderHorizontal");
  if (horizontalBorder) {
    result.cssProps.borderLeft = horizontalBorder;
    result.cssProps.borderRight = horizontalBorder;
  }
  collectCss("borderRight", disableInlineStyle);
  collectCss("borderLeft", disableInlineStyle);

  const verticalBorder = transformLayoutValue("borderVertical");
  if (verticalBorder) {
    result.cssProps.borderTop = verticalBorder;
    result.cssProps.borderBottom = verticalBorder;
  }
  collectCss("borderTop", disableInlineStyle);
  collectCss("borderBottom", disableInlineStyle);
  collectCss("borderColor", disableInlineStyle);
  collectCss("borderStyle", disableInlineStyle);
  collectCss("borderWidth", disableInlineStyle);

  // --- Radius
  collectCss("borderRadius", disableInlineStyle);
  collectCss("radiusTopLeft", disableInlineStyle, "borderTopLeftRadius");
  collectCss("radiusTopRight", disableInlineStyle, "borderTopRightRadius");
  collectCss("radiusBottomLeft", disableInlineStyle, "borderBottomLeftRadius");
  collectCss("radiusBottomRight", disableInlineStyle, "borderBottomRightRadius");

  // --- Typography
  collectCss("color", disableInlineStyle);
  collectCss("fontFamily", disableInlineStyle);
  collectCss("fontSize", disableInlineStyle);
  collectCss("fontWeight", disableInlineStyle);
  collectCss("fontStyle", disableInlineStyle);
  collectCss("fontVariant", disableInlineStyle);
  collectCss("lineBreak", disableInlineStyle);
  collectCss("textDecoration", disableInlineStyle);
  collectCss("textDecorationLine", disableInlineStyle);
  collectCss("textDecorationColor", disableInlineStyle);
  collectCss("textDecorationStyle", disableInlineStyle);
  collectCss("textDecorationThickness", disableInlineStyle);
  collectCss("textIndent", disableInlineStyle);
  collectCss("textShadow", disableInlineStyle);
  collectCss("textUnderlineOffset", disableInlineStyle);
  collectCss("userSelect", disableInlineStyle);
  collectCss("letterSpacing", disableInlineStyle);
  collectCss("textTransform", disableInlineStyle);
  collectCss("lineHeight", disableInlineStyle);
  collectCss("textAlign", disableInlineStyle);
  collectCss("textAlignLast", disableInlineStyle);
  collectCss("textWrap", disableInlineStyle);
  collectCss("wordBreak", disableInlineStyle);
  collectCss("wordSpacing", disableInlineStyle);
  collectCss("wordWrap", disableInlineStyle);
  collectCss("writingMode", disableInlineStyle);

  // --- Other
  collectCss("backgroundColor", disableInlineStyle);
  collectCss("background", disableInlineStyle);
  collectCss("boxShadow", disableInlineStyle);
  collectCss("direction", disableInlineStyle);
  collectCss("overflowX", disableInlineStyle);
  collectCss("overflowY", disableInlineStyle);
  collectCss("zIndex", disableInlineStyle);
  collectCss("opacity", disableInlineStyle);
  collectCss("zoom", disableInlineStyle);
  collectCss("cursor", disableInlineStyle);
  collectCss("whiteSpace", disableInlineStyle);
  collectCss("transform", disableInlineStyle);

  // --- Scroll snap
  collectCss("scrollSnapType", disableInlineStyle);
  collectCss("scrollSnapAlign", disableInlineStyle);
  collectCss("scrollSnapStop", disableInlineStyle);
  collectCss("scrollPadding", disableInlineStyle);
  collectCss("scrollPaddingTop", disableInlineStyle);
  collectCss("scrollPaddingRight", disableInlineStyle);
  collectCss("scrollPaddingBottom", disableInlineStyle);
  collectCss("scrollPaddingLeft", disableInlineStyle);
  collectCss("scrollMargin", disableInlineStyle);
  collectCss("scrollMarginTop", disableInlineStyle);
  collectCss("scrollMarginRight", disableInlineStyle);
  collectCss("scrollMarginBottom", disableInlineStyle);
  collectCss("scrollMarginLeft", disableInlineStyle);

  // --- Outline
  collectCss("outline", disableInlineStyle);
  collectCss("outlineWidth", disableInlineStyle);
  collectCss("outlineColor", disableInlineStyle);
  collectCss("outlineStyle", disableInlineStyle);
  collectCss("outlineOffset", disableInlineStyle);

  // --- Content rendering
  const wrapContent = transformLayoutValue("wrapContent");
  if (wrapContent) {
    result.cssProps.flexWrap = wrapContent === "true" ? "wrap" : "nowrap";
  }
  collectCss("canShrink", disableInlineStyle, "flexShrink");
  const canShrink = transformLayoutValue("canShrink");
  if (canShrink) {
    result.cssProps.flexShrink = canShrink === "true" ? 1 : 0;
  }

  // --- If we didn't set any props, return a referentially stable result
  if (isEmpty(result.cssProps) && isEmpty(result.issues)) {
    return defaultCompResult;
  }

  // --- Done
  return result;

  // --- Replaces all variable occurrences in the input string with the result of toCssVar
  function transformLayoutValue(prop: string): string {
    const defValue = resolveSingleValue();
    if (layoutContext?.mediaSize?.sizeIndex !== undefined) {
      const sizeIndex = layoutContext.mediaSize?.sizeIndex;
      const xsValue = resolveSingleValue("xs");
      const smValue = resolveSingleValue("sm");
      const mdValue = resolveSingleValue("md");
      const lgValue = resolveSingleValue("lg");
      const xlValue = resolveSingleValue("xl");
      const xxlValue = resolveSingleValue("xxl");
      let mergedValue: string;
      switch (sizeIndex) {
        case 0: // xs
          mergedValue = xsValue ?? smValue ?? mdValue;
          break;
        case 1: // sm
          mergedValue = smValue ?? mdValue;
          break;
        case 2: // md
          mergedValue = mdValue;
          break;
        case 3: // lg
          mergedValue = lgValue;
          break;
        case 4: // xl
          mergedValue = xlValue ?? lgValue;
          break;
        case 5: // xxl
          mergedValue = xxlValue ?? xlValue ?? lgValue;
          break;
      }
      return mergedValue ?? defValue;
    }
    return defValue;

    function resolveSingleValue(sizeTag = ""): string {
      const fullProp = sizeTag ? `${prop}-${sizeTag}` : prop;
      let singleInput = layoutProps[fullProp];
      if (singleInput == undefined) {
        return;
      }
      if (typeof singleInput === "string") {
        singleInput = singleInput.trim();
      } else {
        singleInput = singleInput.toString();
      }

      // --- Evaluate
      const value = singleInput
        ? (singleInput as string).replace(themeVarCapturesRegex, (match: string) =>
            toCssVar(match.trim()),
          )
        : undefined;

      if (singleInput !== value) {
        // --- Theme variable replaced, do not check pattern validity
        return value;
      }

      // --- Check value validity
      const propPatterns = layoutPatterns[prop];
      if (!propPatterns || propPatterns.length === 0) {
        return value;
      }

      for (const pattern of propPatterns) {
        if (pattern.test(value)) {
          return value;
        }
      }

      // --- Done
      result.issues.add(fullProp);
      return value;
    }
  }

  function collectCss(prop: string, disableInlineStyle = false, propCssName = ""): void {
    if (disableInlineStyle) return;
    const value = transformLayoutValue(prop);
    if (value) {
      result.cssProps[propCssName || prop] = value;
    }
  }

  // --- Checks if the specified size is a star size and the orientation is horizontal
  function getHorizontalStarSize(
    size: string | number,
    layoutContext?: LayoutContext,
  ): number | null {
    if (!size) return null;
    const orientation = getOrientation(layoutContext);
    return orientation === "horizontal" && starSizeRegex.test(size.toString())
      ? getStarSizeNumber(size.toString())
      : null;
  }

  // --- Checks if the specified size is a star size and the orientation is vertical
  function getVerticalStarSize(
    size: string | number,
    layoutContext?: LayoutContext,
  ): number | null {
    if (!size) return null;
    const orientation = getOrientation(layoutContext);
    return orientation === "vertical" && starSizeRegex.test(size.toString())
      ? getStarSizeNumber(size.toString())
      : null;
  }

  // ---  Obtains the integer number from a string that matches the starSizeRegex.
  function getStarSizeNumber(input: string): number | null {
    if (starSizeRegex.test(input)) {
      const numberPart = input.slice(0, -1); // Remove the trailing '*'
      return numberPart === "" ? 1 : parseInt(numberPart, 10); // Default to 1 if no number is present
    }
    return null;
  }

  // --- Gets the current orientation from the layout context
  function getOrientation(layoutContext?: LayoutContext): string | undefined {
    if (!layoutContext) return;
    let orientation = layoutContext?.type === "Stack" && layoutContext?.orientation;
    return orientation?.toString();
  }
}

/**
 * Converts the specified themeID to a CSS var string
 * @param c segment to convert
 */
export function toCssVar(c: string): string {
  return `var(--${THEME_VAR_PREFIX}-${c.substring(1)})`;
}

// The properties constituting a component's layout
export type LayoutProps = {
  // --- Dimensions
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
  gap?: string;

  // --- Positions
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;

  // --- Border
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: string;
  borderHorizontal?: string;
  borderVertical?: string;

  // --- Border radius
  borderRadius?: number | string;
  radiusTopLeft?: number | string;
  radiusTopRight?: number | string;
  radiusBottomLeft?: number | string;
  radiusBottomRight?: number | string;

  // --- Padding
  padding?: number | string;
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  // --- Margin
  margin?: number | string;
  marginHorizontal?: number | string;
  marginVertical?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;

  // --- Other
  backgroundColor?: string;
  background?: string;
  boxShadow?: string;
  direction?: string;
  overflowX?: string;
  overflowY?: string;
  zIndex?: number | string;
  opacity?: string | number;
  transform?: string;

  // --- Scroll snap
  scrollSnapType?: string;
  scrollSnapAlign?: string;
  scrollSnapStop?: string;
  scrollPadding?: string | number;
  scrollPaddingTop?: string | number;
  scrollPaddingRight?: string | number;
  scrollPaddingBottom?: string | number;
  scrollPaddingLeft?: string | number;
  scrollMargin?: string | number;
  scrollMarginTop?: string | number;
  scrollMarginRight?: string | number;
  scrollMarginBottom?: string | number;
  scrollMarginLeft?: string | number;

  // --- Typography
  color?: string;
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontStyle?: string;
  fontVariant?: string;
  lineBreak?: string;
  textDecoration?: string;
  textDecorationLine?: string;
  textDecorationColor?: string;
  textDecorationStyle?: string;
  textDecorationThickness?: string;
  textIndent?: number | string;
  textShadow?: string;
  textUnderlineOffset?: string;
  userSelect?: string;
  letterSpacing?: string;
  textTransform?: string;
  lineHeight?: string;
  textAlign?: string;
  textWrap?: string;
  textAlignLast?: string;
  wordBreak?: string;
  wordSpacing?: string | number;
  wordWrap?: string;
  writingMode?: string;

  // --- Outline
  outline?: string;
  outlineWidth?: string;
  outlineColor?: string;
  outlineStyle?: string;
  outlineOffset?: string;

  // --- Content rendering
  wrapContent?: boolean | string;
  canShrink?: boolean | string;

  // --- Other
  cursor?: string;
  zoom?: string | number;
  whiteSpace?: string;

  // --- Animation
  transition?: string;
};

// The properties constituting a component's layout
const layoutPatterns: Record<keyof LayoutProps, RegExp[]> = {
  // --- Dimensions
  width: [],
  minWidth: [],
  maxWidth: [],
  height: [],
  minHeight: [],
  maxHeight: [],
  gap: [],

  // --- Positions
  top: [],
  right: [],
  bottom: [],
  left: [],

  // --- Border
  border: [],
  borderTop: [],
  borderRight: [],
  borderBottom: [],
  borderLeft: [],
  borderColor: [],
  borderStyle: [],
  borderWidth: [],
  borderHorizontal: [],
  borderVertical: [],

  // --- Border radius
  borderRadius: [],
  radiusTopLeft: [],
  radiusTopRight: [],
  radiusBottomLeft: [],
  radiusBottomRight: [],

  // --- Padding
  padding: [],
  paddingHorizontal: [],
  paddingVertical: [],
  paddingTop: [],
  paddingRight: [],
  paddingBottom: [],
  paddingLeft: [],

  // --- Margin
  margin: [],
  marginHorizontal: [],
  marginVertical: [],
  marginTop: [],
  marginRight: [],
  marginBottom: [],
  marginLeft: [],

  // --- Other
  backgroundColor: [],
  background: [],
  boxShadow: [],
  direction: [],
  overflowX: [],
  overflowY: [],
  zIndex: [],
  opacity: [],

  // --- Scroll snap
  scrollSnapType: [],
  scrollSnapAlign: [],
  scrollSnapStop: [],
  scrollPadding: [],
  scrollPaddingTop: [],
  scrollPaddingRight: [],
  scrollPaddingBottom: [],
  scrollPaddingLeft: [],
  scrollMargin: [],
  scrollMarginTop: [],
  scrollMarginRight: [],
  scrollMarginBottom: [],
  scrollMarginLeft: [],

  // --- Typography
  color: [],
  fontFamily: [],
  fontSize: [],
  fontWeight: [],
  fontStyle: [booleanRegex],
  fontVariant: [],
  lineBreak: [],
  textDecoration: [],
  userSelect: [],
  letterSpacing: [],
  textTransform: [],
  lineHeight: [],
  textAlign: [],
  textWrap: [],
  textAlignLast: [],
  textIndent: [],
  textShadow: [],
  wordBreak: [],
  wordSpacing: [],
  wordWrap: [],
  writingMode: [],

  // --- Content rendering
  wrapContent: [],
  canShrink: [],

  // --- Other
  cursor: [],
  zoom: [],
  whiteSpace: [],
  textDecorationLine: [],
  textDecorationColor: [],
  textDecorationStyle: [],
  textDecorationThickness: [],
  textUnderlineOffset: [],
  transform: [],

  // --- Outline
  outline: [],
  outlineWidth: [],
  outlineColor: [],
  outlineStyle: [],
  outlineOffset: [],

  // --- Animation
  transition: [],
};
