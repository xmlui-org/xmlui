import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { resolveThemeReferences, resolveThemeVariable } from "../../styling/theme";
import { defaultProps } from "./Heading.defaults";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type HeadingProps = {
  id?: string;
  level?: string;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  showAnchor?: boolean;
  anchorId?: string;
  omitFromToc?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  themeVariables: Record<string, unknown>;
  registerApi?: (api: Record<string, unknown>) => void;
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  {
    id,
    level = defaultProps.level,
    maxLines = defaultProps.maxLines,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    showAnchor = defaultProps.showAnchor,
    anchorId,
    omitFromToc: _omitFromToc = defaultProps.omitFromToc,
    className,
    style,
    children,
    themeVariables,
    registerApi,
    ...rest
  },
  forwardedRef,
) {
  const normalizedLevel = normalizeHeadingLevel(level);
  const Element = normalizedLevel;
  const innerRef = useRef<HTMLHeadingElement | null>(null);
  const hasOverflow = useCallback(() => {
    const element = innerRef.current;
    return !!element && (
      element.scrollWidth > element.clientWidth ||
      element.scrollHeight > element.clientHeight
    );
  }, []);
  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    innerRef.current?.scrollIntoView({ behavior: "smooth", block: "start", ...options });
  }, []);

  useEffect(() => {
    registerApi?.({ hasOverflow, scrollIntoView });
  }, [hasOverflow, registerApi, scrollIntoView]);

  const resolvedAnchorId = useMemo(() => anchorId || textFromChildren(children), [anchorId, children]);

  const headingStyle = useMemo(
    () => ({
      ...baseHeadingStyle(themeVariables, normalizedLevel),
      ...overflowStyle(maxLines, preserveLinebreaks, ellipses),
      ...style,
    }),
    [ellipses, maxLines, normalizedLevel, preserveLinebreaks, style, themeVariables],
  );

  return (
    <Element
      {...rest}
      ref={(node) => {
        innerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      id={id}
      className={className}
      style={headingStyle}
      data-xmlui-heading-level={normalizedLevel}
    >
      {resolvedAnchorId ? <span id={resolvedAnchorId} data-anchor="true" style={anchorRefStyle} /> : null}
      {children}
      {showAnchor && resolvedAnchorId ? (
        <a href={`#${resolvedAnchorId}`} aria-hidden="true" style={anchorStyle(themeVariables)}>
          #
        </a>
      ) : null}
    </Element>
  );
});

export function normalizeHeadingLevel(value: unknown): HeadingLevel {
  if (typeof value === "number" && value >= 1 && value <= 6) {
    return `h${value}` as HeadingLevel;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (/^h[1-6]$/.test(normalized)) {
      return normalized as HeadingLevel;
    }
    if (/^[1-6]$/.test(normalized)) {
      return `h${normalized}` as HeadingLevel;
    }
  }
  return "h1";
}

function baseHeadingStyle(themeVariables: Record<string, unknown>, level: HeadingLevel): CSSProperties {
  const key = level.toUpperCase();
  return {
    userSelect: "text",
    color: themeValue(themeVariables, `Heading:textColor-${key}`) ?? themeValue(themeVariables, "textColor-Heading"),
    fontFamily: themeValue(themeVariables, `Heading:fontFamily-${key}`) ?? themeValue(themeVariables, "fontFamily-Heading"),
    fontSize: themeValue(themeVariables, `fontSize-${key}`),
    fontWeight: themeValue(themeVariables, `Heading:fontWeight-${key}`) ?? themeValue(themeVariables, "fontWeight-Heading"),
    lineHeight: themeValue(themeVariables, `lineHeight-${key}`),
    letterSpacing: themeValue(themeVariables, `Heading:letterSpacing-${key}`),
    marginTop: themeValue(themeVariables, `marginTop-${key}`) ?? 0,
    marginBottom: themeValue(themeVariables, `marginBottom-${key}`) ?? 0,
    textDecorationLine: themeValue(themeVariables, `Heading:textDecorationLine-${key}`),
    textDecorationColor: themeValue(themeVariables, `Heading:textDecorationColor-${key}`),
    textDecorationStyle: themeValue(themeVariables, `Heading:textDecorationStyle-${key}`),
    textDecorationThickness: themeValue(themeVariables, `Heading:textDecorationThickness-${key}`),
    textUnderlineOffset: themeValue(themeVariables, `Heading:textUnderlineOffset-${key}`),
  } as CSSProperties;
}

function overflowStyle(maxLines: number, preserveLinebreaks: boolean, ellipses: boolean): CSSProperties {
  if (maxLines <= 0) {
    return preserveLinebreaks ? { whiteSpace: "pre-wrap" } : {};
  }
  if (maxLines > 1) {
    return {
      display: "-webkit-box",
      overflow: "hidden",
      textOverflow: ellipses ? "ellipsis" : "clip",
      whiteSpace: preserveLinebreaks ? "pre-wrap" : undefined,
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: maxLines,
    };
  }
  return {
    overflow: "hidden",
    textOverflow: ellipses ? "ellipsis" : "clip",
    whiteSpace: preserveLinebreaks ? "pre-wrap" : "nowrap",
  };
}

function anchorStyle(themeVariables: Record<string, unknown>): CSSProperties {
  return {
    marginInlineStart: themeValue(themeVariables, "gap-anchor-Heading"),
    color: themeValue(themeVariables, "color-anchor-Heading"),
    textDecorationLine: themeValue(themeVariables, "textDecorationLine-anchor-Heading"),
  };
}

const anchorRefStyle: CSSProperties = {
  width: 0,
  height: 0,
  scrollMarginTop: "var(--header-height)",
};

function textFromChildren(children: ReactNode): string | undefined {
  if (typeof children !== "string" && typeof children !== "number") {
    return undefined;
  }
  return slugifyHeading(String(children).replace(/#$/, ""));
}

function slugifyHeading(text: string): string {
  const slug = text.trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase();
  return /^[0-9]/.test(slug) ? `heading-${slug}` : slug;
}

function themeValue(themeVariables: Record<string, unknown>, name: string): string | undefined {
  const value = resolveThemeVariable(name, [themeVariables]);
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return String(resolveThemeReferences(value));
}
