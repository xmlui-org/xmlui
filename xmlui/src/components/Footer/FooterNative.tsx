import React, { ReactNode } from "react";
import styles from "./Footer.module.scss";
import classnames from "@components-core/utils/classnames";

// =====================================================================================================================
// React Footer component implementation

export function Footer({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style: React.CSSProperties;
  className?: string;
}) {
  return (
    <div className={styles.outerWrapper}>
      <div className={classnames(styles.wrapper, className)} style={style}>
        {children}
      </div>
    </div>
  );
}
