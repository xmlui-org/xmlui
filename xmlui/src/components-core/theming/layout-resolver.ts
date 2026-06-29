import type { CSSProperties } from "react";

export type ResolvedLayout = {
  cssProps: Record<string, CSSProperties[keyof CSSProperties]>;
  issues: Set<string>;
};

export type LayoutResolverContext = {
  type?: string;
  orientation?: "horizontal" | "vertical";
  ignoreLayoutProps?: string[];
};

export function toCssVar(value: string): string {
  return value.startsWith("$") ? `var(--xmlui-${value.slice(1)})` : value;
}

export function resolveLayoutProps(
  layoutProps: Record<string, unknown> = {},
  layoutContext?: LayoutResolverContext,
  _disableInlineStyle?: boolean,
): ResolvedLayout {
  const cssProps: Record<string, CSSProperties[keyof CSSProperties]> = {};
  const ignored = new Set(layoutContext?.ignoreLayoutProps ?? []);

  collectDimension("width");
  collectDimension("minWidth");
  collectDimension("maxWidth");
  collectDimension("height");
  collectDimension("minHeight");
  collectDimension("maxHeight");

  const width = cssProps.width;
  if (
    !ignored.has("width") &&
    layoutContext?.orientation === "horizontal" &&
    typeof width === "string" &&
    /^\d*\*$/.test(width)
  ) {
    cssProps.flex = starSizeToFlex(width);
    cssProps.flexShrink = 1;
    delete cssProps.width;
  }

  const height = cssProps.height;
  if (
    !ignored.has("height") &&
    layoutContext?.orientation === "vertical" &&
    typeof height === "string" &&
    /^\d*\*$/.test(height)
  ) {
    cssProps.flex = starSizeToFlex(height);
    cssProps.flexShrink = 1;
    delete cssProps.height;
  }

  return {
    cssProps,
    issues: new Set(),
  };

  function collectDimension(name: string) {
    if (ignored.has(name)) {
      return;
    }
    const value = layoutProps[name];
    if (value === undefined || value === null || value === "") {
      return;
    }
    (cssProps as Record<string, unknown>)[name] =
      typeof value === "string" ? toCssVar(value) : value;
  }
}

function starSizeToFlex(value: string): number {
  const numberPart = value.slice(0, -1);
  return numberPart ? Number(numberPart) : 1;
}
