import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./AppContentSlot.module.scss";

interface AppContentSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props for controlling content wrapper behavior will be added when applying to layouts
}

/**
 * AppContentSlot - Main content wrapper section of the App component.
 * Contains fundamental layout structure for the content area.
 */
export const AppContentSlot = forwardRef<HTMLDivElement, AppContentSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.contentSlot, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppContentSlot.displayName = "AppContentSlot";
