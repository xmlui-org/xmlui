import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { resolveThemeReferences, resolveThemeVariable } from "../../styling/theme";
import { defaultProps } from "./Text.defaults";

export const textVariantElement = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
  codefence: "pre",
  deleted: "del",
  em: "em",
  inserted: "ins",
  keyboard: "kbd",
  marked: "mark",
  mono: "span",
  paragraph: "p",
  sample: "samp",
  secondary: "span",
  small: "small",
  strong: "strong",
  sub: "sub",
  subheading: "span",
  subtitle: "span",
  sup: "sup",
  title: "span",
  var: "var",
} as const;

export type TextProps = {
  id?: string;
  variant?: string;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  overflowMode?: string;
  breakMode?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  themeVariables: Record<string, unknown>;
  onContextMenu?: () => void | Promise<void>;
  registerApi?: (api: Record<string, unknown>) => void;
};

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    id,
    variant,
    maxLines = defaultProps.maxLines,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    overflowMode = defaultProps.overflowMode,
    breakMode = defaultProps.breakMode,
    className,
    style,
    children,
    themeVariables,
    onContextMenu,
    registerApi,
    ...rest
  },
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement | null>(null);
  const Element = useMemo(() => textVariantElement[variant as keyof typeof textVariantElement] ?? "span", [variant]);
  const hasOverflow = useCallback(() => {
    const element = innerRef.current;
    if (!element) {
      return false;
    }
    const parent = element.parentElement;
    const elementBounds = element.getBoundingClientRect();
    return (
      element.scrollWidth > element.clientWidth ||
      element.scrollHeight > element.clientHeight ||
      !!parent && (
        elementBounds.width > parent.clientWidth ||
        elementBounds.height > parent.clientHeight
      )
    );
  }, []);

  useEffect(() => {
    registerApi?.({ hasOverflow });
  }, [hasOverflow, registerApi]);

  const textStyle = {
    ...baseTextStyle(themeVariables, variant),
    ...overflowStyle({ maxLines, preserveLinebreaks, ellipses, overflowMode, breakMode }),
    ...style,
  };

  return (
    <Element
      {...rest}
      ref={(node: HTMLElement | null) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      id={id}
      className={className}
      style={textStyle}
      onContextMenu={onContextMenu}
      data-xmlui-text-variant={variant}
    >
      {children}
    </Element>
  );
});

function baseTextStyle(themeVariables: Record<string, unknown>, variant?: string): CSSProperties {
  const suffix = variant ? `-${variant}` : "";
  return {
    display: "inline-block",
    margin: 0,
    padding: textPadding(themeVariables, suffix),
    verticalAlign: themeValue(themeVariables, `verticalAlignment-Text${suffix}`) ?? "baseline",
    userSelect: "text",
    color: themeValue(themeVariables, `textColor-Text${suffix}`),
    backgroundColor: themeValue(themeVariables, `backgroundColor-Text${suffix}`),
    fontFamily: themeValue(themeVariables, `fontFamily-Text${suffix}`),
    fontSize: themeValue(themeVariables, `fontSize-Text${suffix}`),
    fontWeight: themeValue(themeVariables, `fontWeight-Text${suffix}`),
    fontStyle: themeValue(themeVariables, `fontStyle-Text${suffix}`),
    lineHeight: themeValue(themeVariables, `lineHeight-Text${suffix}`),
    letterSpacing: themeValue(themeVariables, `letterSpacing-Text${suffix}`),
    textTransform: themeValue(themeVariables, `textTransform-Text${suffix}`),
    textDecorationLine: themeValue(themeVariables, `textDecorationLine-Text${suffix}`),
    borderWidth: themeValue(themeVariables, `borderWidth-Text${suffix}`),
    borderStyle: themeValue(themeVariables, `borderStyle-Text${suffix}`),
    borderColor: themeValue(themeVariables, `borderColor-Text${suffix}`),
    borderRadius: themeValue(themeVariables, `borderRadius-Text${suffix}`),
    marginTop: themeValue(themeVariables, `marginTop-Text${suffix}`),
    marginBottom: themeValue(themeVariables, `marginBottom-Text${suffix}`),
    marginInlineStart: themeValue(themeVariables, `marginLeft-Text${suffix}`),
    marginInlineEnd: themeValue(themeVariables, `marginRight-Text${suffix}`),
  };
}

function textPadding(themeVariables: Record<string, unknown>, suffix: string): string | undefined {
  const vertical =
    themeValue(themeVariables, `paddingVertical-Text${suffix}`)
    ?? themeValue(themeVariables, `paddingBottom-Text${suffix}`);
  const horizontal = themeValue(themeVariables, `paddingHorizontal-Text${suffix}`);
  return vertical || horizontal ? `${vertical ?? 0} ${horizontal ?? 0}` : undefined;
}

function overflowStyle({
  maxLines,
  preserveLinebreaks,
  ellipses,
  overflowMode,
  breakMode,
}: {
  maxLines: number;
  preserveLinebreaks: boolean;
  ellipses: boolean;
  overflowMode?: string;
  breakMode?: string;
}): CSSProperties {
  const style: CSSProperties = {};
  if (preserveLinebreaks) {
    style.whiteSpace = "pre-wrap";
  }
  if (maxLines > 0 || overflowMode === "ellipsis") {
    style.overflow = "hidden";
    style.textOverflow = ellipses ? "ellipsis" : "clip";
    if (maxLines <= 1) {
      style.whiteSpace = preserveLinebreaks ? "pre-wrap" : "nowrap";
    } else {
      style.display = "-webkit-box";
      style.WebkitBoxOrient = "vertical";
      style.WebkitLineClamp = maxLines;
    }
  }
  if (overflowMode === "scroll") {
    style.whiteSpace = "nowrap";
    style.overflowX = "auto";
    style.overflowY = "hidden";
  }
  if (overflowMode === "flow") {
    style.whiteSpace = "normal";
    style.overflowY = "auto";
    style.overflowX = "hidden";
  }
  if (breakMode === "word") {
    style.overflowWrap = "break-word";
  } else if (breakMode === "anywhere") {
    style.overflowWrap = "anywhere";
  } else if (breakMode === "keep") {
    style.wordBreak = "keep-all";
  } else if (breakMode === "hyphenate") {
    style.hyphens = "auto";
  }
  return style;
}

function themeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}
