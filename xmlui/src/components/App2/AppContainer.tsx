import React, { forwardRef } from "react";
import classnames from "classnames";
import styles from "./AppContainer.module.scss";

interface AppContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  // Props for controlling scroll and layout behavior will be added when applying to layouts
}

/**
 * AppContainer - The outermost wrapper for the App component.
 * Contains fundamental layout structure for the app container.
 */
export const AppContainer = forwardRef<HTMLDivElement, AppContainerProps>(
  ({ className, children, ...rest }, ref) => {
    return (
      <div {...rest} className={className} ref={ref}>
        {children}
      </div>
    );
  }
);

AppContainer.displayName = "AppContainer";
