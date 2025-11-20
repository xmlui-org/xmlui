import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./App2.module.scss";

interface AppPagesSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props for controlling pages wrapper behavior will be added when applying to layouts
}

/**
 * AppPagesSlot - Pages wrapper section of the App component.
 * Contains fundamental layout structure for the pages area where children are rendered.
 */
export const AppPagesSlot = forwardRef<HTMLDivElement, AppPagesSlotProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={classnames(styles.PagesWrapper, className)} ref={ref}>
        {children}
      </div>
    );
  }
);

AppPagesSlot.displayName = "AppPagesSlot";
