import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { defaultProps } from "./Heading.defaults";
import styles from "./Heading.module.scss";

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
      isOverflowing(element.scrollWidth, element.clientWidth) ||
      isOverflowing(element.scrollHeight, element.clientHeight)
    );
  }, []);
  const scrollIntoView = useCallback((options?: ScrollIntoViewOptions) => {
    innerRef.current?.scrollIntoView({ behavior: "smooth", block: "start", ...options });
  }, []);

  useEffect(() => {
    registerApi?.({ hasOverflow, scrollIntoView });
  }, [hasOverflow, registerApi, scrollIntoView]);

  const resolvedAnchorId = useMemo(() => anchorId || textFromChildren(children), [anchorId, children]);

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
      className={cx(
        styles.heading,
        styles[normalizedLevel],
        maxLines > 0 ? styles.truncateOverflow : undefined,
        maxLines > 1 ? styles.multiLineOverflow : undefined,
        maxLinesClass(maxLines),
        preserveLinebreaks ? styles.preserveLinebreaks : undefined,
        !ellipses ? styles.noEllipsis : undefined,
        className,
      )}
      style={style}
      data-xmlui-heading-level={normalizedLevel}
    >
      {resolvedAnchorId ? (
        <span id={resolvedAnchorId} data-anchor="true" className={styles.anchorRef} />
      ) : null}
      {children}
      {showAnchor && resolvedAnchorId ? (
        <a href={`#${resolvedAnchorId}`} aria-hidden="true">
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

function maxLinesClass(maxLines: number): string | undefined {
  if (maxLines < 1) {
    return undefined;
  }
  const capped = Math.min(Math.floor(maxLines), 12);
  return styles[`maxLines${capped}`];
}

function isOverflowing(scrollSize: number, clientSize: number): boolean {
  return scrollSize - clientSize > 1;
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
