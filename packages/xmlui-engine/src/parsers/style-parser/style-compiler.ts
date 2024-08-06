import { isEmpty } from "lodash-es";

import type { CSSProperties } from "react";
import type { StyleNode, ThemeIdDescriptor } from "./source-tree";
import type { LayoutProps } from "@abstractions/ComponentDescriptorDefs";
import type { LayoutContext, NonCssLayoutProps } from "@abstractions/RendererDefs";

import { EMPTY_OBJECT } from "@components-core/constants";
import { StyleParser, toCssVar } from "./StyleParser";

// Property parsing issues
type PropertyIssues = Record<string, string | undefined>;

export type StyleCompilationResult = {
  cssProps: CSSProperties;
  issues?: PropertyIssues;
  nonCssProps: NonCssLayoutProps;
};

const defaultCompResult = {
  cssProps: {},
  nonCssProps: {},
};

// Compile style properties into an object that can be directly used as the "style" attribute of elements
export function compileLayout(
  layoutProps: LayoutProps = EMPTY_OBJECT,
  themeVars?: Record<string, string>,
  layoutContext?: LayoutContext
): StyleCompilationResult {
  const result: StyleCompilationResult = {
    cssProps: {},
    nonCssProps: {},
  };
  const css: CSSProperties = result.cssProps!;

  // --- Compile alignment
  const horizontalAlignment = compileAlignment("horizontalAlignment", layoutProps?.horizontalAlignment?.toString());
  if (horizontalAlignment) {
    result.nonCssProps.horizontalAlignment = horizontalAlignment;
  }
  const verticalAlignment = compileAlignment("verticalAlignment", layoutProps?.verticalAlignment?.toString());
  if (verticalAlignment) {
    result.nonCssProps.verticalAlignment = verticalAlignment;
  }
  const orientation = compileOrientation("orientation", layoutProps?.orientation?.toString());
  if (orientation) {
    result.nonCssProps.orientation = orientation;
  }

  // --- Compile dimensions
  if (!!getOrientation(layoutContext)) {
    // --- In a container, we always use "flex-shrink: 0"
    css.flexShrink = 0;
  }

  const widthResult = compileSize("width", layoutProps.width?.toString());
  if (widthResult.value) css.width = widthResult.value;
  if (isHorizontalAndStartSize(widthResult, layoutContext)) {
    // --- In a horizontal container, we use "flex" when width is in start-size
    css.flex = widthResult.ratio;
    css.flexShrink = 1; //if it's star sizing, we allow shrinking
  }
  const minWidthResult = compileSize("minWidth", layoutProps.minWidth?.toString());
  if (minWidthResult.value) css.minWidth = minWidthResult.value;
  const maxWidthResult = compileSize("maxWidth", layoutProps.maxWidth?.toString());
  if (maxWidthResult.value) css.maxWidth = maxWidthResult.value;
  const heightResult = compileSize("height", layoutProps.height?.toString());
  if (heightResult.value) css.height = heightResult.value;
  if (isVerticalAndStarSize(heightResult, layoutContext)) {
    // --- In a vertical container, we use "flex" when height is in star-size
    css.flex = heightResult.ratio;
    css.flexShrink = 1;
  }
  const minHeightResult = compileSize("minHeight", layoutProps.minHeight?.toString());
  if (minHeightResult.value) css.minHeight = minHeightResult.value;
  const maxHeightResult = compileSize("maxHeight", layoutProps.maxHeight?.toString());
  if (maxHeightResult.value) css.maxHeight = maxHeightResult.value;

  // --- Compile positions
  const top = compileSize("top", layoutProps.top?.toString());
  if (top.value) css.top = top.value;
  const right = compileSize("right", layoutProps.right?.toString());
  if (right.value) css.right = right.value;
  const bottom = compileSize("bottom", layoutProps.bottom?.toString());
  if (bottom.value) css.bottom = bottom.value;
  const left = compileSize("left", layoutProps.left?.toString());
  if (left.value) css.left = left.value;

  // --- Compile gap
  const gap = compileSize("gap", layoutProps.gap?.toString());
  if (gap.value) css.gap = gap.value;

  // --- Compile border
  const border = compileBorder("border", layoutProps.border?.toString());
  if (border) css.border = border;
  const borderTop = compileBorder("borderTop", layoutProps.borderTop?.toString());
  if (borderTop) css.borderTop = borderTop;
  const borderRight = compileBorder("borderRight", layoutProps.borderRight?.toString());
  if (borderRight) css.borderRight = borderRight;
  const borderBottom = compileBorder("borderBottom", layoutProps.borderBottom?.toString());
  if (borderBottom) css.borderBottom = borderBottom;
  const borderLeft = compileBorder("borderLeft", layoutProps.borderLeft?.toString());
  if (borderLeft) css.borderLeft = borderLeft;

  // --- Compile radius
  const radius = compileRadius("radius", layoutProps.radius?.toString());
  if (radius) css.borderRadius = radius;
  const radiusTopLeft = compileRadius("radiusTopLeft", layoutProps.radiusTopLeft?.toString());
  if (radiusTopLeft) css.borderTopLeftRadius = radiusTopLeft;
  const radiusTopRight = compileRadius("radiusTopRight", layoutProps.radiusTopRight?.toString());
  if (radiusTopRight) css.borderTopRightRadius = radiusTopRight;
  const radiusBottomLeft = compileRadius("radiusBottomLeft", layoutProps.radiusBottomLeft?.toString());
  if (radiusBottomLeft) css.borderBottomLeftRadius = radiusBottomLeft;
  const radiusBottomRight = compileRadius("radiusBottomRight", layoutProps.radiusBottomRight?.toString());
  if (radiusBottomRight) css.borderBottomRightRadius = radiusBottomRight;

  // --- Compile padding
  const padding = compileSize("padding", layoutProps.padding?.toString());
  if (padding.value) css.padding = padding.value;
  const horizontalPadding = compileSize("horizontalPadding", layoutProps.horizontalPadding?.toString());
  const verticalPadding = compileSize("verticalPadding", layoutProps.verticalPadding?.toString());
  const paddingLeft = mergeSizes(compileSize("leftPadding", layoutProps.paddingLeft?.toString()), horizontalPadding);
  if (paddingLeft.value) css.paddingLeft = paddingLeft.value;
  const paddingRight = mergeSizes(compileSize("rightPadding", layoutProps.paddingRight?.toString()), horizontalPadding);
  if (paddingRight.value) css.paddingRight = paddingRight.value;
  const paddingTop = mergeSizes(compileSize("topPadding", layoutProps.paddingTop?.toString()), verticalPadding);
  if (paddingTop.value) css.paddingTop = paddingTop.value;
  const paddingBottom = mergeSizes(
    compileSize("bottomPadding", layoutProps.paddingBottom?.toString()),
    verticalPadding
  );
  if (paddingBottom.value) css.paddingBottom = paddingBottom.value;

  // --- Compile margin
  const margin = compileMargin("margin", layoutProps.margin?.toString());
  if (margin) css.margin = margin;
  const horizontalMargin = compileMargin("horizontalMargin", layoutProps.horizontalMargin?.toString());
  const verticalMargin = compileMargin("verticalMargin", layoutProps.verticalMargin?.toString());
  const marginLeft = compileMargin("leftMargin", layoutProps.marginLeft?.toString()) ?? horizontalMargin;
  if (marginLeft) css.marginLeft = marginLeft;
  const marginRight = compileMargin("rightMargin", layoutProps.marginRight?.toString()) ?? horizontalMargin;
  if (marginRight) css.marginRight = marginRight;
  const marginTop = compileMargin("topMargin", layoutProps.marginTop?.toString()) ?? verticalMargin;
  if (marginTop) css.marginTop = marginTop;
  const marginBottom = compileMargin("bottomMargin", layoutProps.marginBottom?.toString()) ?? verticalMargin;
  if (marginBottom) css.marginBottom = marginBottom;

  // --- Compile other
  const backgroundColor = compileColor("backgroundColor", layoutProps.backgroundColor?.toString());
  if (backgroundColor) css.backgroundColor = backgroundColor;
  //TODO illesg
  const background = compileBackground("background", layoutProps.background?.toString());
  if (background) css.background = background;
  const boxShadow = compileShadow("shadow", layoutProps.shadow?.toString());
  if (boxShadow) css.boxShadow = boxShadow;
  const direction = compileDirection("direction", layoutProps.direction?.toString()) as any;
  if (direction) css.direction = direction;
  const overflowX = compileScrolling("horizontalOverflow", layoutProps.horizontalOverflow?.toString()) as any;
  if (overflowX) css.overflowX = overflowX;
  const overflowY = compileScrolling("verticalOverflow", layoutProps.verticalOverflow?.toString()) as any;
  if (overflowY) css.overflowY = overflowY;
  const zIndex = compileZIndex("zIndex", layoutProps.zIndex?.toString()) as any;
  if (zIndex) css.zIndex = zIndex;
  const opacity = compileOpacity("zIndex", layoutProps?.opacity?.toString()) as any;
  if (opacity) css.opacity = opacity;

  // --- Compile typography
  const color = compileColor("color", layoutProps.color?.toString());
  if (color) css.color = color;
  const fontFamily = compileFontFamily("fontFamily", layoutProps.fontFamily?.toString());
  if (fontFamily) css.fontFamily = fontFamily;
  const fontSize = compileSize("fontSize", layoutProps.fontSize?.toString());
  if (fontSize.value) css.fontSize = fontSize.value;
  const fontWeight = compileFontWeight("fontWeight", layoutProps.fontWeight?.toString());
  if (fontWeight) css.fontWeight = fontWeight;
  const fontStyle = compileItalic("italic", layoutProps.italic?.toString());
  if (fontStyle) css.fontStyle = fontStyle;
  const textDecoration = compileTextDecoration("textDecoration", layoutProps.textDecoration?.toString());
  if (textDecoration) css.textDecoration = textDecoration;
  const userSelect = compileUserSelect("userSelect", layoutProps?.userSelect?.toString());
  if (userSelect) css.userSelect = userSelect as any;
  const letterSpacing = compileSize("letterSpacing", layoutProps?.letterSpacing?.toString());
  if (letterSpacing.value) css.letterSpacing = letterSpacing.value;
  const textTransform = compileTextTransform("textTransform", layoutProps?.textTransform?.toString());
  if (textTransform) css.textTransform = textTransform as any;
  const lineHeight = compileLineHeight("lineHeight", layoutProps?.lineHeight?.toString());
  if (lineHeight) css.lineHeight = lineHeight;
  const textAlign = compileTextAlign("textAlign", layoutProps?.textAlign?.toString());
  if (textAlign) css.textAlign = textAlign as any;
  const textAlignLast = compileTextAlign("textAlignLast", layoutProps?.textAlignLast?.toString());
  if (textAlignLast) css.textAlignLast = textAlignLast as any;

  //TODO illesg
  const textWrap = layoutProps?.textWrap?.toString();
  if (textWrap) css.textWrap = textWrap as any;

  // --- Compile content rendering
  const wrapContent = compileWrapContent("wrapContent", layoutProps?.wrapContent?.toString());
  if (wrapContent) css.flexWrap = wrapContent as any;
  const canShrink = compileCanShrink("canShrink", layoutProps?.canShrink?.toString());
  if (canShrink) css.flexShrink = canShrink as any;

  // --- Other
  const cursor = compileCursor("cursor", layoutProps?.cursor?.toString());
  if (cursor) css.cursor = cursor;

  // --- Done
  //if we didn't set any props, return a referentially stable result
  if (isEmpty(result.cssProps) && isEmpty(result.nonCssProps) && isEmpty(result.issues)) {
    return defaultCompResult;
  }
  return result;

  function mergeSizes(size: SizeResult, defSize: SizeResult): SizeResult {
    return size.value ? size : defSize;
  }

  function getThemeVar(themeVar: ThemeIdDescriptor) {
    return themeVars?.[themeVar.id.substring(1)];
  }

  function isCssVarResolved(themeVar: ThemeIdDescriptor) {
    const varValue = getThemeVar(themeVar);
    if (varValue === undefined || varValue === "") {
      return false;
    }
    return true;
  }

  function compile<T extends StyleNode>(
    propName: string,
    source: string | undefined,
    parseFn: (parser: StyleParser) => T | null,
    convertFn: (node: T) => string | undefined
  ): string | undefined {
    if (!source) return undefined;
    const parser = new StyleParser(source);
    try {
      const node = parseFn(parser);
      if (!node) return source;
      if (!parser.testCompleted()) {
        result.issues ??= {};
        result.issues[propName] = `Unexpected tail after the ${propName}`;
        return source;
      }
      //TODO illesg
      // if (hasOnlyUnresolvedVars(node.themeId)) {
      //   return undefined;
      // }
      if (node.themeId) {
        return toCssVar(node.themeId);
      }
      return convertFn(node);
    } catch (err: any) {
      result.issues ??= {};
      result.issues[propName] = err?.toString();
      //TODO illesg
      return source;
    }
  }

  // --- Compiles an alignment definition into a CSS size property
  function compileAlignment(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseAlignment(),
      (n) => n.value
    );
  }

  // --- Compiles an alignment definition into a CSS size property
  function compileTextAlign(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseTextAlign(),
      (n) => n.value
    );
  }

  // --- Compiles a user select definition into a CSS size property
  function compileUserSelect(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseUserSelect(),
      (n) => n.value
    );
  }

  // --- Compiles a text transform definition into a CSS size property
  function compileTextTransform(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseTextTransform(),
      (n) => n.value
    );
  }

  function compileOrientation(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseOrientation(),
      (n) => n.value
    );
  }

  // --- Compiles a size definition into a CSS size property
  function compileLineHeight(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseLineHeight(),
      (n) => `${n.value}${n.unit}`
    );
  }

  // --- Compiles a size definition into a CSS size property
  function compileOpacity(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseOpacity(),
      (n) => `${n.value}${n.unit}`
    );
  }

  // --- Compiles a size definition into a CSS size property
  function compileSize(propName: string, source?: string): SizeResult {
    let isStarSize = false;
    let ratio: number | undefined;
    let value = compile(
      propName,
      source,
      (p) => {
        const sizeNode = p.parseSize();
        isStarSize = sizeNode?.unit === "*";
        if (isStarSize) {
          ratio = sizeNode?.value ?? 1;
        }

        return sizeNode;
      },
      (n) => n.extSize ?? `${n.value}${n.unit}`
    );

    return {
      value: value ? replaceThemeVar(value) : undefined,
      ratio,
      isStarSize,
    };
  }

  // --- Compiles a size definition into a CSS size property
  function compileMargin(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseMargin(),
      (n) => n.extSize ?? `${n.value}${n.unit}`
    );
  }

  // --- Compiles a zIndex definition into a CSS zIndex property
  function compileZIndex(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseZIndex(),
      (n) => n.value.toString()
    );
  }

  function compileScrolling(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseScrolling(),
      (n) => n.value
    );
  }

  function compileDirection(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseDirection(),
      (n) => n.value
    );
  }

  function compileCursor(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseCursor(),
      (n) => n.value
    );
  }

  function compileFontWeight(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseFontWeight(),
      (n) => n.value?.toString()
    );
  }

  function compileFontFamily(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseFontFamily(),
      (n) => n.value
    );
  }

  function compileColor(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseColor(),
      (n) =>
        n.value !== undefined
          ? typeof n.value === "number"
            ? `#${n.value.toString(16).padStart(8, "0")}`
            : n.value
          : undefined
    );
  }

  function compileBackground(propName: string, source?: string): string | undefined {
    return compile(
        propName,
        source,
        (p) => p.parseColor(),
        (n) =>
            n.value !== undefined
                ? typeof n.value === "number"
                    ? `#${n.value.toString(16).padStart(8, "0")}`
                    : n.value
                : undefined
    );
  }

  function hasOnlyUnresolvedVars(...themeIds: (ThemeIdDescriptor | undefined)[]) {
    let definedThemeIds = themeIds.filter((id) => id !== undefined);
    if (!definedThemeIds.length) {
      return false;
    }
    for (let i = 0; i < definedThemeIds.length; i++) {
      const themeId = definedThemeIds[i]!;
      if (isCssVarResolved(themeId)) {
        return false;
      }
      if (themeId.defaultValue) {
        const hasStringDefaultValue = themeId.defaultValue.find((value) => typeof value === "string") !== undefined;
        if (hasStringDefaultValue) {
          return false;
        }
        const themeVarDefaultValues = themeId.defaultValue.filter(
          (value) => typeof value !== "string"
        ) as ThemeIdDescriptor[];
        if (!hasOnlyUnresolvedVars(...themeVarDefaultValues)) {
          return false;
        }
      }
    }
    return true;
  }

  function compileBorder(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseBorder(),
      (n) => {
        if (hasOnlyUnresolvedVars(n.themeId1, n.themeId2, n.themeId3)) {
          return undefined;
        }
        return (
          (
            `${n.themeId1 ? toCssVar(n.themeId1) : ""} ` +
            `${n.themeId2 ? toCssVar(n.themeId2) : ""} ` +
            `${n.themeId3 ? toCssVar(n.themeId3) : ""}`
          ).trim() +
          " " +
          `${n.widthValue ?? ""}${n.widthUnit ?? ""}` +
          `${n.widthValue && n.styleValue ? " " : ""}` +
          `${n.styleValue ?? ""}` +
          `${(n.widthValue || n.styleValue) && n.color ? " " : ""}` +
          `${
            n.color !== undefined
              ? typeof n.color === "number"
                ? `#${n.color.toString(16).padStart(8, "0")}`
                : n.color
              : ""
          }`
        ).trim();
      }
    );
  }

  function compileTextDecoration(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseTextDecoration(),
      (n) => {
        if (n.none) {
          return "none";
        }
        if (hasOnlyUnresolvedVars(n.themeId1, n.themeId2, n.themeId3)) {
          return undefined;
        }
        return (
          (
            `${n.themeId1 ? toCssVar(n.themeId1) : ""} ` +
            `${n.themeId2 ? toCssVar(n.themeId2) : ""} ` +
            `${n.themeId3 ? toCssVar(n.themeId3) : ""}`
          ).trim() +
          " " +
          `${n.line ?? ""}` +
          `${n.line && n.style ? " " : ""}` +
          `${n.style ?? ""}` +
          `${(n.line || n.style) && n.color ? " " : ""}` +
          `${n.color ?? ""}`
        ).trim();
      }
    );
  }

  function compileRadius(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseRadius(),
      (n) => {
        if (hasOnlyUnresolvedVars(n.themeId1, n.themeId2)) {
          return undefined;
        }
        const theme1 = `${n.themeId1 ? toCssVar(n.themeId1) : ""}`;
        const value1 = `${n.value1 ?? ""}${n.unit1 ?? ""}`;
        const theme2 = `${n.themeId2 ? toCssVar(n.themeId2) : ""}`;
        const value2 = `${n.value2 ?? ""}${n.unit2 ?? ""}`;
        let part = `${theme1}${value1}`;
        let part2 = `${theme2}${value2}`;
        part += part2 ? " / " + part2 : "";
        return part.trim();
      }
    );
  }

  function compileShadow(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseShadow(),
      (n) => {
        let css = "";
        for (const sg of n.segments ?? []) {
          if (css) {
            css += ", ";
          }
          css += sg.inset ? "inset " : "";
          css += `${sg.offsetXValue}${sg.offsetXUnit} ${sg.offsetYValue}${sg.offsetYUnit}`;
          if (sg.blurRadiusValue !== undefined) {
            css += ` ${sg.blurRadiusValue}${sg.blurRadiusUnit}`;
          }
          if (sg.spreadRadiusValue !== undefined) {
            css += ` ${sg.spreadRadiusValue}${sg.spreadRadiusUnit}`;
          }
          if (sg.color !== undefined) {
            css += ` ${sg.color}`;
          }
        }
        return css;
      }
    );
  }

  // --- Compiles a Boolean definition into a CSS font-style size property
  function compileItalic(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseBoolean(),
      (n) => (n.value ? "italic" : "normal")
    );
  }

  // --- Compiles a Boolean definition into a CSS flex-wrap property
  function compileWrapContent(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseBoolean(),
      (n) => (n.value ? "wrap" : "nowrap")
    );
  }

  // --- Compiles a Boolean definition into a CSS flex-shrink property
  function compileCanShrink(propName: string, source?: string): string | undefined {
    return compile(
      propName,
      source,
      (p) => p.parseBoolean(),
      (n) => (n.value ? "1" : "0")
    );
  }

  function compileBoolean(propName: string, defValue?: boolean, source?: string): boolean | undefined {
    const compiledValue = compile(
      propName,
      source,
      (p) => (source ? p.parseBoolean() : null),
      (n) => (n.value ? "true" : "false")
    );
    return compiledValue === undefined ? defValue : compiledValue?.toString() === "true";
  }

  function isHorizontalAndStartSize(size: SizeResult, layoutContext?: LayoutContext): boolean {
    if (!size.value) return false;
    const orientation = getOrientation(layoutContext);
    return orientation === "horizontal" && size.isStarSize;
  }

  function isVerticalAndStarSize(size: SizeResult, layoutContext?: LayoutContext): boolean {
    if (!size.value) return false;
    const orientation = getOrientation(layoutContext);
    return orientation === "vertical" && size.isStarSize;
  }

  function getOrientation(layoutContext?: LayoutContext): string | undefined {
    if (!layoutContext) return;
    let orientation = layoutContext?.type === "Stack" && layoutContext?.orientation;
    return orientation?.toString();
  }

  function replaceThemeVar(input: string) {
    const regex = /\$([a-zA-Z0-9_-]+)/gi;
    let matches = input.matchAll(regex);

    // --- We go from 1, because result[1] is the whole stuff
    if (matches) {
      let ret = input;
      for (let match of matches) {
        const varName = match[0];
        if (varName) {
          ret = ret.replace(match[0], toCssVar(varName));
        }
      }
      return ret;
    }
    return input;
  }
}

// --- Represents the compilation result of width/height
type SizeResult = {
  ratio?: number;
  value?: string;
  isStarSize: boolean;
};
