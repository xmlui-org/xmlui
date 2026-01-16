import type { CSSProperties, MouseEventHandler, ReactNode, Ref } from "react";
import type React from "react";
import { forwardRef, useContext, useMemo } from "react";
import { NavLink as RrdNavLink } from "@remix-run/react";
import type { To } from "react-router-dom";
import classnames from "classnames";

import styles from "./NavLink.module.scss";
import type { LinkAria, LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { getAppLayoutOrientation } from "../App/AppNative";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { NavPanelContext } from "../NavPanel/NavPanelNative";
import { NavGroupContext } from "../NavGroup/NavGroupContext";
import { useTheme } from "../../components-core/theming/ThemeContext";

// Default props for NavLink component
export const defaultProps = {
  active: false,
  displayActive: true,
  noIndicator: false,
};

type Props = {
  uid?: string;
  to?: string;
  target?: LinkTarget;
  disabled?: boolean;
  children?: ReactNode;
  displayActive?: boolean;
  noIndicator?: boolean;
  forceActive?: boolean;
  vertical?: boolean;
  style?: CSSProperties;
  className?: string;
  onClick?: MouseEventHandler;
  icon?: React.ReactNode;
  iconAlignment?: "baseline" | "start" | "center" | "end";
  accessibilityProps?: any;
} & Pick<React.HTMLAttributes<HTMLAnchorElement>, LinkAria>;

export const NavLink = forwardRef(function NavLink(
  {
    /* eslint-disable react/prop-types */
    uid,
    children,
    disabled,
    to,
    displayActive = defaultProps.displayActive,
    noIndicator = defaultProps.noIndicator,
    vertical,
    style,
    onClick,
    icon,
    iconAlignment,
    forceActive,
    className,
    ...rest
  }: Props,
  ref: Ref<any>,
) {
  const { getThemeVar } = useTheme();
  const effectiveIconAlignment = iconAlignment ?? getThemeVar("iconAlignment-NavLink") ?? "center";
  const appLayoutContext = useAppLayoutContext();
  const layoutIsVertical =
    !!appLayoutContext && getAppLayoutOrientation(appLayoutContext.layout).includes("vertical");
  const navPanelContext = useContext(NavPanelContext);
  const inDrawer = navPanelContext?.inDrawer;
  
  const { level } = useContext(NavGroupContext);
  let safeVertical = vertical;

  if (safeVertical === undefined) {
    safeVertical = layoutIsVertical || inDrawer;
  }
  const smartTo = useMemo(() => {
    if (to) {
      return createUrlWithQueryParams(to) as To;
    }
  }, [to]) as To;

  const styleObj = useMemo(() => {
    return {
      "--nav-link-level": layoutIsVertical ? level + 1 : 0,
      ...style,
    };
  }, [level, style, layoutIsVertical]);

  const baseClasses = classnames(styles.content, styles.base, className, {
    [styles.disabled]: disabled,
    [styles.vertical]: safeVertical,
    [styles.includeHoverIndicator]: displayActive && !noIndicator,
    [styles.navItemActive]: displayActive && forceActive,
  });

  let innerContent = (
    <div className={classnames(styles.innerContent, {
      [styles.iconAlignBaseline]: effectiveIconAlignment === "baseline",
      [styles.iconAlignStart]: effectiveIconAlignment === "start",
      [styles.iconAlignCenter]: effectiveIconAlignment === "center",
      [styles.iconAlignEnd]: effectiveIconAlignment === "end",
    })}>
      {icon}
      {children}
    </div>
  );
  let content: React.ReactNode = null;
  if (disabled || !smartTo) {
    content = (
      <button
        {...rest}
        ref={ref}
        onClick={onClick}
        className={baseClasses}
        style={styleObj}
        disabled={disabled}
      >
        {innerContent}
      </button>
    );
  } else {
    content = (
      <RrdNavLink
        {...rest}
        id={uid}
        ref={ref}
        to={smartTo as To}
        style={styleObj}
        onClick={onClick}
        className={({ isActive }) =>
          classnames(baseClasses, {
            [styles.displayActive]: displayActive,
            [styles.navItemActive]: displayActive && (isActive || forceActive),
            "xmlui-navlink-active": isActive || forceActive,
          })
        }
      >
        {innerContent}
      </RrdNavLink>
    );
  }

  return content;
});
