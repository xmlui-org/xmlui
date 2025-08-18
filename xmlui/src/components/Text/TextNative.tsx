import type { CSSProperties } from "react";
import type React from "react";
import { forwardRef, useMemo, useRef } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./Text.module.scss";

import { getMaxLinesStyle } from "../../components-core/utils/css-utils";
import { type TextVariant, TextVariantElement } from "../abstractions";

type TextProps = {
  uid?: string;
  children?: React.ReactNode;
  variant?: TextVariant;
  maxLines?: number;
  preserveLinebreaks?: boolean;
  ellipses?: boolean;
  style?: CSSProperties;
  className?: string;
  [variantSpecificProps: string]: any;
};

export const defaultProps = {
  maxLines: 0,
  preserveLinebreaks: false,
  ellipses: true,
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

  return (
    <>
      <Element
        {...restVariantSpecificProps}
        ref={ref as any}
        className={classnames(
          syntaxHighlightClasses,
          styles.text,
          styles[variant || "default"],
          {
            [styles.truncateOverflow]: maxLines > 0,
            [styles.preserveLinebreaks]: preserveLinebreaks,
            [styles.noEllipsis]: !ellipses,
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
    </>
  );
});
