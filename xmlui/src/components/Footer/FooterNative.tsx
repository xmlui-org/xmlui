import React, { ReactNode } from "react";
import styles from "./Footer.module.scss";
import classnames from "@components-core/utils/classnames";
import {useAppLayoutContext} from "@components/App/AppLayoutContext";

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
  const {layout} = useAppLayoutContext() || {};
  const canRestrictContentWidth = layout !== "vertical-full-header";
  return (
    <div className={styles.outerWrapper}>
      <div className={classnames(styles.wrapper, className, {
        [styles.full]: !canRestrictContentWidth,
      })} style={style}>
        {children}
      </div>
    </div>
  );
}
