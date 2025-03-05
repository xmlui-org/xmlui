import { CSSProperties } from "react";
import { LayoutContext } from "../../abstractions/RendererDefs";
import { EMPTY_OBJECT } from "../constants";
import { isEmpty } from "lodash-es";

export const THEME_VAR_PREFIX = "xmlui";
const themeVarCapturesRegex = /(\$[a-zA-Z][a-zA-Z0-9-_]*)/g;
const booleanRegex = /^(true|false)$/;
const starSizeRegex = /^\d*\*$/;

export type ResolvedLayout = {
  cssProps: CSSProperties;
  issues: Set<string>;
};

const defaultCompResult: ResolvedLayout = {
  cssProps: {},
  issues: new Set(),
};

export function resolveLayoutProps(
  layoutProps: LayoutProps = EMPTY_OBJECT,
  layoutContext?: LayoutContext,
): ResolvedLayout {
  const result: ResolvedLayout = {
    cssProps: {},
    issues: new Set(),
  };

  // --- Adjust flex
  if (!!getOrientation(layoutContext)) {
    // --- In a container, we always use "flex-shrink: 0"
    result.cssProps.flexShrink = 0;
  }

  // --- Dimensions
  collectCss("width");
  const horizontalStarSize = getHorizontalStartSize(result.cssProps.width, layoutContext);
  if (horizontalStarSize !== null) {
    // --- We use "flex" when width is in start-size and allow shrinking
    result.cssProps.flex = horizontalStarSize;
    result.cssProps.flexShrink = 1;
  }
  collectCss("minWidth");
  collectCss("maxWidth");

  collectCss("height");
  const verticalStarSize = getVerticalStartSize(result.cssProps.height, layoutContext);
  if (verticalStarSize !== null) {
    // --- We use "flex" when width is in start-size and allow shrinking
    result.cssProps.flex = verticalStarSize;
    result.cssProps.flexShrink = 1;
  }
  collectCss("minHeight");
  collectCss("maxHeight");

  // --- Positions
  collectCss("top");
  collectCss("right");
  collectCss("bottom");
  collectCss("left");

  // --- Paddings and gap
  collectCss("gap");
  collectCss("padding");
  const horizontalPadding = transformLayoutValue("horizontalPadding");
  if (horizontalPadding) {
    result.cssProps.paddingLeft = horizontalPadding;
    result.cssProps.paddingRight = horizontalPadding;
  }
  collectCss("paddingRight");
  collectCss("paddingLeft");

  const verticalPadding = transformLayoutValue("verticalPadding");
  if (verticalPadding) {
    result.cssProps.paddingTop = verticalPadding;
    result.cssProps.paddingBottom = verticalPadding;
  }
  collectCss("paddingTop");
  collectCss("paddingBottom");

  // --- Margins
  collectCss("margin");
  const horizontalMargin = transformLayoutValue("horizontalMargin");
  if (horizontalMargin) {
    result.cssProps.marginLeft = horizontalMargin;
    result.cssProps.marginRight = horizontalMargin;
  }
  collectCss("marginRight");
  collectCss("marginLeft");

  const verticalMargin = transformLayoutValue("verticalMargin");
  if (verticalMargin) {
    result.cssProps.marginTop = verticalMargin;
    result.cssProps.marginBottom = verticalMargin;
  }
  collectCss("marginTop");
  collectCss("marginBottom");

  // --- Borders
  collectCss("border");
  const horizontalBorder = transformLayoutValue("borderHorizontal");
  if (horizontalBorder) {
    result.cssProps.borderLeft = horizontalBorder;
    result.cssProps.borderRight = horizontalBorder;
  }
  collectCss("borderRight");
  collectCss("borderLeft");

  const verticalBorder = transformLayoutValue("borderVertical");
  if (verticalBorder) {
    result.cssProps.borderTop = verticalBorder;
    result.cssProps.borderBottom = verticalBorder;
  }
  collectCss("borderTop");
  collectCss("borderBottom");
  collectCss("borderColor");
  collectCss("borderStyle");
  collectCss("borderThickness");

  // --- Radius
  collectCss("radius", "borderRadius");
  collectCss("radiusTopLeft", "borderTopLeftRadius");
  collectCss("radiusTopRight", "borderTopRightRadius");
  collectCss("radiusBottomLeft", "borderBottomLeftRadius");
  collectCss("radiusBottomRight", "borderBottomRightRadius");

  // --- Typography
  collectCss("color");
  collectCss("fontFamily");
  collectCss("fontSize");
  collectCss("fontWeight");
  collectCss("fontStyle");
  collectCss("textDecoration");
  collectCss("textDecorationLine");
  collectCss("textDecorationColor");
  collectCss("textDecorationStyle");
  collectCss("textDecorationThickness");
  collectCss("textUnderlineOffset");
  collectCss("userSelect");
  collectCss("letterSpacing");
  collectCss("textTransform");
  collectCss("lineHeight");
  collectCss("textAlign");
  collectCss("textAlignLast");
  collectCss("textWrap");

  // --- Other
  collectCss("backgroundColor");
  collectCss("background");
  collectCss("boxShadow");
  collectCss("direction");
  collectCss("horizontalOverflow", "overflowX");
  collectCss("verticalOverflow", "overflowY");
  collectCss("zIndex");
  collectCss("opacity");
  collectCss("zoom");
  collectCss("cursor");
  collectCss("whiteSpace");

  // --- Outline
  collectCss("outline");
  collectCss("outlineWidth");
  collectCss("outlineColor");
  collectCss("outlineStyle");
  collectCss("outlineOffset");

  // --- Content rendering
  const wrapContent = transformLayoutValue("wrapContent");
  if (wrapContent) {
    result.cssProps.flexWrap = wrapContent === "true" ? "wrap" : "nowrap";
  }
  collectCss("canShrink", "flexShrink");
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

  function collectCss(prop: string, propCssName = ""): void {
    const value = transformLayoutValue(prop);
    if (value) {
      result.cssProps[propCssName || prop] = value;
    }
  }

  // --- Checks if the specified size is a star size and the orientation is horizontal
  function getHorizontalStartSize(
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
  function getVerticalStartSize(
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
  borderThickness?: string;
  borderHorizontal?: string;
  borderVertical?: string;

  // --- Border radius
  radius?: number | string;
  radiusTopLeft?: number | string;
  radiusTopRight?: number | string;
  radiusBottomLeft?: number | string;
  radiusBottomRight?: number | string;

  // --- Padding
  padding?: number | string;
  horizontalPadding?: number | string;
  verticalPadding?: number | string;
  paddingTop?: number | string;
  paddingRight?: number | string;
  paddingBottom?: number | string;
  paddingLeft?: number | string;

  // --- Margin
  margin?: number | string;
  horizontalMargin?: number | string;
  verticalMargin?: number | string;
  marginTop?: number | string;
  marginRight?: number | string;
  marginBottom?: number | string;
  marginLeft?: number | string;

  // --- Other
  backgroundColor?: string;
  background?: string;
  boxShadow?: string;
  direction?: string;
  horizontalOverflow?: string;
  verticalOverflow?: string;
  zIndex?: number | string;
  opacity?: string | number;

  // --- Typography
  color?: string;
  fontFamily?: string;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontStyle?: string;
  textDecoration?: string;
  textDecorationLine?: string;
  textDecorationColor?: string;
  textDecorationStyle?: string;
  textDecorationThickness?: string;
  textUnderlineOffset?: string;
  userSelect?: string;
  letterSpacing?: string;
  textTransform?: string;
  lineHeight?: string;
  textAlign?: string;
  textWrap?: string;
  textAlignLast?: string;

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
  borderThickness: [],
  borderHorizontal: [],
  borderVertical: [],

  // --- Border radius
  radius: [],
  radiusTopLeft: [],
  radiusTopRight: [],
  radiusBottomLeft: [],
  radiusBottomRight: [],

  // --- Padding
  padding: [],
  horizontalPadding: [],
  verticalPadding: [],
  paddingTop: [],
  paddingRight: [],
  paddingBottom: [],
  paddingLeft: [],

  // --- Margin
  margin: [],
  horizontalMargin: [],
  verticalMargin: [],
  marginTop: [],
  marginRight: [],
  marginBottom: [],
  marginLeft: [],

  // --- Other
  backgroundColor: [],
  background: [],
  boxShadow: [],
  direction: [],
  horizontalOverflow: [],
  verticalOverflow: [],
  zIndex: [],
  opacity: [],

  // --- Typography
  color: [],
  fontFamily: [],
  fontSize: [],
  fontWeight: [],
  fontStyle: [booleanRegex],
  textDecoration: [],
  userSelect: [],
  letterSpacing: [],
  textTransform: [],
  lineHeight: [],
  textAlign: [],
  textWrap: [],
  textAlignLast: [],

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

  // --- Outline
  outline: [],
  outlineWidth: [],
  outlineColor: [],
  outlineStyle: [],
  outlineOffset: [],
};
