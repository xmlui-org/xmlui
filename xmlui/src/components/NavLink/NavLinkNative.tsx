import type { CSSProperties, MouseEventHandler, ReactNode, Ref } from "react";
import type React from "react";
import { forwardRef, useContext, useMemo } from "react";
import { NavLink as RrdNavLink } from "@remix-run/react";
import type { To } from "react-router";
import classnames from "classnames";

import styles from "./NavLink.module.scss";
import type { LinkAria, LinkTarget } from "../abstractions";
import { createUrlWithQueryParams } from "../component-utils";
import { getAppLayoutOrientation } from "../App/AppNative";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { NavPanelContext } from "../NavPanel/NavPanelNative";

type Props = {
  uid?: string;
  to?: string;
  target?: LinkTarget;
  disabled?: boolean;
  children?: ReactNode;
  sx?: CSSProperties;
  displayActive?: boolean;
  forceActive?: boolean;
  vertical?: boolean;
  style?: CSSProperties;
  onClick?: MouseEventHandler;
  icon?: React.ReactNode;
  accessibilityProps?: any;
} & Pick<React.HTMLAttributes<HTMLAnchorElement>, LinkAria>;

export const NavLink = forwardRef(function NavLink(
  {
    /* eslint-disable react/prop-types */
    uid,
    children,
    disabled,
    to,
    sx = {},
    displayActive = true,
    vertical,
    style,
    onClick,
    icon,
    forceActive,
    ...rest
  }: Props,
  ref: Ref<any>,
) {
  const appLayoutContext = useAppLayoutContext();
  const navPanelContext = useContext(NavPanelContext);
  let safeVertical = vertical;
  if (appLayoutContext && safeVertical === undefined) {
    safeVertical =
      getAppLayoutOrientation(appLayoutContext.layout) === "vertical" || navPanelContext?.inDrawer;
  }
  const smartTo = useMemo(() => {
    if (to) {
      return createUrlWithQueryParams(to) as To;
    }
  }, [to]) as To;

  const styleObj = { ...sx, ...style };

  const baseClasses = classnames(styles.content, styles.base, {
    [styles.disabled]: disabled,
    [styles.vertical]: safeVertical,
    [styles.includeHoverIndicator]: displayActive,
    [styles.navItemActive]: displayActive && forceActive,
  });

  let content;

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
        {icon}
        {children}
      </button>
    );
  } else {
    content = (
      <RrdNavLink
        id={uid}
        {...rest}
        ref={ref}
        to={smartTo as To}
        style={styleObj}
        onClick={onClick}
        className={({ isActive }) =>
          classnames(baseClasses, {
            [styles.displayActive]: displayActive,
            [styles.navItemActive]: displayActive && (isActive || forceActive),
          })
        }
      >
        {icon}
        {children}
      </RrdNavLink>
    );
  }

  return content;
});
