import type { CSSProperties } from "react";
import type React from "react";
import { forwardRef, useRef } from "react";
import { composeRefs } from "@radix-ui/react-compose-refs";
import classnames from "classnames";

import styles from "./CodeText.module.scss";

type CodeTextProps = {
  uid?: string;
  children?: React.ReactNode;
  style?: CSSProperties;
  className?: string;
  [variantSpecificProps: string]: any;
};

export const defaultProps = {
  maxLines: 0,
  preserveLinebreaks: false,
  ellipses: true,
};

/**
 * This type implements code text we use in Markdown codefences.
 */
export const CodeText = forwardRef(function CodeText(
  {
    uid,
    style,
    className,
    children,
    preserveLinebreaks = defaultProps.preserveLinebreaks,
    ellipses = defaultProps.ellipses,
    ...variantSpecificProps
  }: CodeTextProps,
  forwardedRef,
) {
  const innerRef = useRef<HTMLElement>(null);
  const ref = forwardedRef ? composeRefs(innerRef, forwardedRef) : innerRef;
  // NOTE: This is to accept syntax highlight classes coming from shiki
  // classes need not to be added to the rendered html element, so we remove them from props
  return (
    <>
      <pre
        {...variantSpecificProps}
        ref={ref as any}
        className={classnames(styles.codeText, styles.codefence, className)}
        style={{
          ...style,
        }}
      >
        {children}
      </pre>
    </>
  );
});
