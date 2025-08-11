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

// Default props for NavLink component
export const defaultProps = {
  active: false,
  displayActive: true,
};

type Props = {
  uid?: string;
  to?: string;
  target?: LinkTarget;
  disabled?: boolean;
  children?: ReactNode;
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
    displayActive = defaultProps.displayActive,
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

  const baseClasses = classnames(styles.content, styles.base, {
    [styles.disabled]: disabled,
    [styles.vertical]: safeVertical,
    [styles.includeHoverIndicator]: displayActive,
    [styles.navItemActive]: displayActive && forceActive,
  });

  let innerContent = (
    <div className={styles.innerContent}>
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
