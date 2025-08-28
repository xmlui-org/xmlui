import type { CSSProperties } from "react";
import type React from "react";
import { forwardRef, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./Text.module.scss";

import { getMaxLinesStyle } from "../../components-core/utils/css-utils";
import { type TextVariant, TextVariantElement, type OverflowBehavior } from "../abstractions";

type TextProps = {
  uid?: string;
  children?: React.ReactNode;
  variant?: TextVariant;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  overflowBehavior?: OverflowBehavior;
  style?: CSSProperties;
  className?: string;
  [variantSpecificProps: string]: any;
};

export const defaultProps = {
  maxLines: 0,
  preserveLinebreaks: false,
  ellipses: true,
  overflowBehavior: undefined as OverflowBehavior | undefined,
};

export const Text = forwardRef(function Text(
  {
    uid,
    variant,
    maxLines = defaultProps.maxLines,
    style,
    className,
    children,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    overflowBehavior = defaultProps.overflowBehavior,
    ...variantSpecificProps
  }: TextProps,
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = forwardedRef ? composeRefs(innerRef, forwardedRef) : innerRef;

    // NOTE: This is to accept syntax highlight classes coming from shiki
  // classes need not to be added to the rendered html element, so we remove them from props
  const { syntaxHighlightClasses, ...restVariantSpecificProps } = variantSpecificProps;

  const Element = useMemo(() => {
    if (!variant || !TextVariantElement[variant]) return "div"; //todo illesg, could be a span?
    return TextVariantElement[variant];
  }, [variant]);

  // Determine overflow behavior classes based on overflowBehavior and existing props
  const overflowClasses = useMemo(() => {
    const classes: Record<string, boolean> = {};
    
    // If overflowBehavior is not explicitly set, use original behavior
    if (!overflowBehavior) {
      classes[styles.truncateOverflow] = maxLines > 0;
      classes[styles.noEllipsis] = !ellipses;
      return classes;
    }
    
    switch (overflowBehavior) {
      case "wrap":
        classes[styles.overflowWrap] = true;
        break;
      case "none":
        // For "none" behavior, use simple overflow settings
        classes[styles.overflowNone] = true;
        break;
      case "scroll":
        classes[styles.overflowScroll] = true;
        break;
      case "fade":
        classes[styles.overflowFade] = true;
        break;
      case "ellipsis":
        // For explicit ellipsis, apply truncation for both single line and multi-line
        classes[styles.truncateOverflow] = true;
        classes[styles.noEllipsis] = !ellipses;
        break;
    }
    
    return classes;
  }, [overflowBehavior, maxLines, ellipses]);

  return (
    <>
      {overflowBehavior === "none" && maxLines && maxLines > 0 ? (
        // Wrapper for "none" behavior with maxLines for precise height control
        <div
          style={{
            maxHeight: `${maxLines * 1.5}em`, // Use a more generous multiplier
            overflow: "hidden",
          }}
        >
          <Element
            {...restVariantSpecificProps}
            ref={ref as any}
            className={classnames(
              syntaxHighlightClasses,
              styles.text,
              styles[variant || "default"],
              {
                [styles.preserveLinebreaks]: preserveLinebreaks,
                ...overflowClasses,
              },
              className,
            )}
            style={style}
          >
            {children}
          </Element>
        </div>
      ) : (
        <Element
          {...restVariantSpecificProps}
          ref={ref as any}
          className={classnames(
            syntaxHighlightClasses,
            styles.text,
            styles[variant || "default"],
            {
              [styles.preserveLinebreaks]: preserveLinebreaks,
              ...overflowClasses,
            },
            className,
          )}
          style={{
            ...style,
            ...getMaxLinesStyle(maxLines),
          }}
        >
          {children}
        </Element>
      )}
    </>
  );
});
