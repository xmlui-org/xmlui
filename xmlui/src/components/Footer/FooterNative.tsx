import type { ForwardedRef, ReactNode } from "react";
import type React from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import styles from "./Footer.module.scss";

import { useAppLayoutContext } from "../App/AppLayoutContext";

// =====================================================================================================================
// React Footer component implementation

export const defaultProps = {
  sticky: true,
};

export const Footer = forwardRef(function Footer(
  {
    children,
    style,
    className,
    sticky = defaultProps.sticky,
    ...rest
  }: {
    children: ReactNode;
    style?: React.CSSProperties;
    className?: string;
    sticky?: boolean;
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
      data-sticky={sticky}
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
