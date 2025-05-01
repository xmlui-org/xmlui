import React, { ForwardedRef, forwardRef, ReactNode } from "react";
import classnames from "classnames";

import styles from "./Footer.module.scss";

import { useAppLayoutContext } from "../App/AppLayoutContext";

// =====================================================================================================================
// React Footer component implementation

export const Footer = forwardRef(function Footer(
  {
    children,
    style,
    className,
  }: {
    children: ReactNode;
    style: React.CSSProperties;
    className?: string;
  },
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const { layout } = useAppLayoutContext() || {};
  return (
    <div className={styles.outerWrapper} ref={forwardedRef} style={style}>
      <div
        className={classnames(styles.wrapper, className, {
          [styles.verticalFullHeader]: layout === "vertical-full-header",
        })}
      >
        {children}
      </div>
    </div>
  );
});
