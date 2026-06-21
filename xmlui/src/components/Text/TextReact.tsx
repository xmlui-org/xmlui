import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";

import { defaultProps } from "./Text.defaults";
import styles from "./Text.module.scss?xmlui-css-module";

export const textVariantElement = {
  abbr: "abbr",
  cite: "cite",
  code: "code",
  codefence: "pre",
  deleted: "del",
  em: "em",
  inherit: "span",
  inserted: "ins",
  keyboard: "kbd",
  marked: "mark",
  mono: "pre",
  paragraph: "p",
  placeholder: "span",
  sample: "samp",
  secondary: "span",
  small: "span",
  strong: "strong",
  sub: "sub",
  subheading: "h6",
  subtitle: "span",
  sup: "sup",
  tableheading: "h6",
  title: "span",
  var: "var",
  caption: "span",
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
      className={cx(
        styles.text,
        variant ? styles[`variant_${variant}`] : undefined,
        overflowClass(overflowMode, maxLines),
        overflowUsesMaxLines(overflowMode, maxLines) ? maxLinesClass(maxLines) : undefined,
        preserveLinebreaks ? styles.preserveLinebreaks : undefined,
        !ellipses ? styles.noEllipsis : undefined,
        breakModeClass(breakMode),
        className,
      )}
      style={style}
      onContextMenu={onContextMenu}
      data-xmlui-text-variant={variant}
    >
      {children}
    </Element>
  );
});

function overflowClass(overflowMode: string | undefined, maxLines: number): string | undefined {
  if (overflowMode === "none") {
    return styles.overflowNone;
  }
  if (overflowMode === "scroll") {
    return styles.overflowScroll;
  }
  if (overflowMode === "flow") {
    return styles.overflowFlow;
  }
  if (overflowMode === "ellipsis" || maxLines > 0) {
    return maxLines > 1 ? styles.overflowMultiLine : styles.overflowEllipsis;
  }
  return undefined;
}

function overflowUsesMaxLines(overflowMode: string | undefined, maxLines: number): boolean {
  return maxLines > 0 && overflowMode !== "none" && overflowMode !== "scroll" && overflowMode !== "flow";
}

function breakModeClass(breakMode?: string): string | undefined {
  if (breakMode === "word") {
    return styles.breakWord;
  }
  if (breakMode === "anywhere") {
    return styles.breakAnywhere;
  }
  if (breakMode === "keep") {
    return styles.breakKeep;
  }
  if (breakMode === "hyphenate") {
    return styles.breakHyphenate;
  }
  return undefined;
}

function maxLinesClass(maxLines: number): string | undefined {
  if (maxLines < 1) {
    return undefined;
  }
  const capped = Math.min(Math.floor(maxLines), 12);
  return styles[`maxLines${capped}`];
}

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
