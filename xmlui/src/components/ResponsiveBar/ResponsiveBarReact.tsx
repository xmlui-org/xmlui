import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef, useCallback, useEffect } from "react";

import { defaultResponsiveBarProps } from "./ResponsiveBar.defaults";
import styles from "./ResponsiveBar.module.scss";

export type ResponsiveBarProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  orientation?: "horizontal" | "vertical";
  gap?: number;
  reverse?: boolean;
  overflowIcon?: string;
  dropdownText?: string;
  dropdownAlignment?: string;
  triggerTemplate?: ReactNode;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  onWillOpen?: () => unknown | Promise<unknown>;
  registerComponentApi?: (api: Record<string, unknown>) => void;
};

export const ResponsiveBar = forwardRef<HTMLDivElement, ResponsiveBarProps>(function ResponsiveBar(
  {
    children,
    orientation = defaultResponsiveBarProps.orientation,
    gap = defaultResponsiveBarProps.gap,
    reverse = defaultResponsiveBarProps.reverse,
    overflowIcon: _overflowIcon,
    dropdownText: _dropdownText,
    dropdownAlignment: _dropdownAlignment,
    triggerTemplate: _triggerTemplate,
    onWillOpen: _onWillOpen,
    className,
    onClick,
    registerComponentApi,
    ...rest
  },
  ref,
) {
  const normalizedOrientation = orientation === "vertical" ? "vertical" : "horizontal";
  const hasOverflow = useCallback(() => false, []);
  const open = useCallback(() => undefined, []);
  const close = useCallback(() => undefined, []);

  useEffect(() => {
    registerComponentApi?.({ open, close, hasOverflow });
  }, [close, hasOverflow, open, registerComponentApi]);

  return (
    <div
      {...rest}
      ref={ref}
      className={cx(
        styles.responsiveBar,
        normalizedOrientation === "vertical" ? styles.vertical : styles.horizontal,
        className,
      )}
      style={{
        ...rest.style,
        "--xmlui-gap-ResponsiveBar": `${gap}px`,
      } as CSSProperties}
      onClick={(event) => void onClick?.(event)}
    >
      <div
        className={cx(
          styles.visibleItems,
          normalizedOrientation === "vertical" ? styles.visibleItemsVertical : styles.visibleItemsHorizontal,
          reverse && normalizedOrientation === "vertical" ? styles.reverseVertical : undefined,
          reverse && normalizedOrientation === "horizontal" ? styles.reverseHorizontal : undefined,
        )}
        style={{
          gap: "var(--xmlui-gap-ResponsiveBar)",
          flexDirection: normalizedOrientation === "vertical"
            ? reverse ? "column-reverse" : "column"
            : reverse ? "row-reverse" : "row",
        } as CSSProperties}
      >
        {children}
      </div>
      <div className={styles.overflowDropdown} data-xmlui-part="overflow" />
    </div>
  );
});

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
