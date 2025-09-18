import React, { ForwardedRef, forwardRef, ReactNode } from "react";
import classnames from "classnames";

import styles from "./Footer.module.scss";

import { useAppLayoutContext } from "../App/AppLayoutContext";

// =====================================================================================================================
// React Footer component implementation

export const defaultProps = {
  // No default props needed currently, but adding object for consistency
};

export const Footer = forwardRef(function Footer(
  {
    children,
    style,
    className,
    ...rest
  }: {
    children: ReactNode;
    style?: React.CSSProperties;
    className?: string;
  },
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { layout } = useAppLayoutContext() || {};
  const canRestrictContentWidth = layout !== "vertical-full-header";
  return (
    <div {...rest} className={styles.outerWrapper} ref={forwardedRef} style={style} role="contentinfo">
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
