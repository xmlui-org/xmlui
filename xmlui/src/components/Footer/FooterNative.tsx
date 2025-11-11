import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import styles from "./Footer.module.scss";

import { useAppLayoutContext } from "../App/AppLayoutContext";

// =====================================================================================================================
// React Footer component implementation

export const defaultProps = {
  nonSticky: false,
};

export const Footer = forwardRef(function Footer(
  {
    children,
    style,
    className,
    nonSticky = defaultProps.nonSticky,
    ...rest
  }: {
    children: ReactNode;
    style?: React.CSSProperties;
    className?: string;
    nonSticky?: boolean;
  },
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { layout } = useAppLayoutContext() || {};
  const canRestrictContentWidth = layout !== "vertical-full-header";
  return (
    <div 
      {...rest} 
      className={styles.outerWrapper} 
      ref={forwardedRef} 
      style={style} 
      role="contentinfo"
      data-non-sticky={nonSticky}
    >
      <div
        className={classnames(styles.wrapper, className, {
          [styles.full]: !canRestrictContentWidth,
        })}
      >
        {children}
      </div>
    </div>
  );
});
