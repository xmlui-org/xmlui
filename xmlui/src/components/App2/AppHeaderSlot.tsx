import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./App2.module.scss";

interface AppHeaderSlotProps extends React.HTMLAttributes<HTMLElement> {
  // Props for controlling header behavior will be added when applying to layouts
}

/**
 * AppHeaderSlot - Header section of the App component.
 * Contains fundamental layout structure for the header.
 */
export const AppHeaderSlot = forwardRef<HTMLElement, AppHeaderSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <header {...rest} className={classnames(styles.headerWrapper, className)} ref={ref}>
        {children}
      </header>
    );
  }
);

AppHeaderSlot.displayName = "AppHeaderSlot";
