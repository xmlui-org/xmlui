import type { CSSProperties, MouseEventHandler, ReactNode, Ref } from "react";
import type React from "react";
import { forwardRef, useCallback, useContext, useMemo, useState } from "react";
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
    forceActive,
    vertical,
    style,
    onClick,
    icon,
    ...rest
  }: Props,
  ref: Ref<HTMLButtonElement | HTMLAnchorElement>,
) {
  // This is for applying the hover indicator for the button
  const [isClicked, setIsClicked] = useState(false);
  const _onClick = useCallback(
    (event: React.MouseEvent<Element, MouseEvent>) => {
      onClick?.(event);
      setIsClicked((last) => !last);
    },
    [onClick],
  );

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
  const sharedClasses = classnames(styles.linkWrapper, {
    [styles.disabled]: disabled,
    [styles.vertical]: safeVertical,
    [styles.displayIndicator]: displayActive,
  });
  let content = null;

  //console.log(disabled);
  if (disabled || !smartTo) {
    content = (
      <button
        id={uid}
        {...rest}
        ref={ref as Ref<HTMLButtonElement>}
        onClick={_onClick}
        className={classnames(sharedClasses, {
          //[styles.routeActive]: displayActive && forceActive,
          [styles.active]: displayActive && (isClicked || forceActive),
        })}
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
        ref={ref as Ref<HTMLAnchorElement>}
        to={smartTo as To}
        style={styleObj}
        onClick={_onClick}
        className={({ isActive }) =>
          classnames(sharedClasses, {
            [styles.active]: displayActive && (isActive || forceActive),
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
