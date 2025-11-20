import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./App2.module.scss";

interface AppNavPanelSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props for controlling nav panel behavior will be added when applying to layouts
}

/**
 * AppNavPanelSlot - Navigation panel section of the App component.
 * Contains fundamental layout structure for the navigation panel.
 */
export const AppNavPanelSlot = forwardRef<HTMLDivElement, AppNavPanelSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.navPanelWrapper, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppNavPanelSlot.displayName = "AppNavPanelSlot";
