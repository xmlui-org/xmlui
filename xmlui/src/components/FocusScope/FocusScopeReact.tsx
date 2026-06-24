import type { ForwardedRef, HTMLAttributes, MutableRefObject, ReactNode } from "react";
import { forwardRef, memo, useCallback } from "react";

import { useFocusScope } from "../../component-core/accessibility";
import { defaultProps } from "./FocusScope.defaults";
import styles from "./FocusScope.module.scss";

export type FocusScopeProps = HTMLAttributes<HTMLDivElement> & {
  trap?: boolean;
  restore?: boolean;
  autoFocus?: boolean;
  children?: ReactNode;
};

export const FocusScope = memo(forwardRef(function FocusScope(
  {
    trap = defaultProps.trap,
    restore = defaultProps.restore,
    autoFocus = defaultProps.autoFocus,
    children,
    className,
    tabIndex = -1,
    ...rest
  }: FocusScopeProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const scopeRef = useFocusScope<HTMLDivElement>({ trap, restore, autoFocus });
  const setRef = useCallback((element: HTMLDivElement | null) => {
    (scopeRef as MutableRefObject<HTMLDivElement | null>).current = element;
    if (typeof forwardedRef === "function") {
      forwardedRef(element);
    } else if (forwardedRef) {
      (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = element;
    }
  }, [forwardedRef, scopeRef]);

  return (
    <div
      {...rest}
      ref={setRef}
      className={[styles.focusScope, className].filter(Boolean).join(" ")}
      tabIndex={tabIndex}
    >
      {children}
    </div>
  );
}));
