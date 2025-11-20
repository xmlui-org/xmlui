import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./AppFooterSlot.module.scss";

interface AppFooterSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props for controlling footer behavior will be added when applying to layouts
}

/**
 * AppFooterSlot - Footer section of the App component.
 * Contains fundamental layout structure for the footer.
 */
export const AppFooterSlot = forwardRef<HTMLDivElement, AppFooterSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.footerSlot, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppFooterSlot.displayName = "AppFooterSlot";
