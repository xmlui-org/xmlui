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
  [variantSpecificProps: string]: any;
};

export const Text = forwardRef(function Text(
  {
    uid,
    variant,
    maxLines = 0,
    style,
    children,
    preserveLinebreaks,
    ellipses = true,
    ...variantSpecificProps
  }: TextProps,
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = forwardedRef ? composeRefs(innerRef, forwardedRef) : innerRef;

  const Element = useMemo(() => {
    if (!variant || !TextVariantElement[variant]) return "div"; //todo illesg, could be a span?
    return TextVariantElement[variant];
  }, [variant]);

  return (
    <>
      <Element
        {...variantSpecificProps}
        ref={ref as any}
        className={classnames([
          styles.text,
          styles[variant || "default"],
          {
            [styles.truncateOverflow]: maxLines > 0,
            [styles.preserveLinebreaks]: preserveLinebreaks,
            [styles.noEllipsis]: !ellipses,
          },
        ])}
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
