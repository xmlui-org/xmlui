import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import classnames from "classnames";

import { NavPanelCollapseProvider, useNavPanelCollapseContext } from "../NavPanelCollapseButton/NavPanelCollapseContext";
import styles from "./NavPanel.module.scss";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { getAppLayoutOrientation } from "../App/AppReact";

export type NavPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  footerContent?: ReactNode;
  logoContent?: ReactNode;
  scrollStyle?: string;
};

export const NavPanelComponent = forwardRef<HTMLDivElement, NavPanelProps>(function NavPanelComponent(
  {
    children,
    className,
    footerContent,
    logoContent,
    scrollStyle = "normal",
    ...rest
  },
  ref,
) {
  return (
    <NavPanelCollapseProvider>
      <NavPanelContent
        {...rest}
        className={className}
        footerContent={footerContent}
        logoContent={logoContent}
        ref={ref}
        scrollStyle={scrollStyle}
      >
        {children}
      </NavPanelContent>
    </NavPanelCollapseProvider>
  );
});

const NavPanelContent = forwardRef<HTMLDivElement, NavPanelProps>(function NavPanelContent(
  {
    children,
    className,
    footerContent,
    logoContent,
    scrollStyle = "normal",
    ...rest
  },
  ref,
) {
  const collapseContext = useNavPanelCollapseContext();
  const appLayoutContext = useAppLayoutContext();
  const horizontal = getAppLayoutOrientation(appLayoutContext?.layout) === "horizontal";
  const isCondensed = appLayoutContext?.layout?.startsWith("condensed");
  const vertical = appLayoutContext?.layout?.startsWith("vertical");
  const collapsed = (collapseContext?.collapsed ?? appLayoutContext?.navPanelCollapsed) && vertical;
  const hasFooter = !!footerContent;

  return (
    <nav
      {...rest}
      className={classnames(
        styles.wrapper,
        {
          [styles.horizontal]: horizontal,
          [styles.vertical]: vertical,
          [styles.condensed]: isCondensed,
          [styles.hasFooter]: hasFooter,
          [styles.collapsed]: collapsed,
          [styles.overlayScroll]: scrollStyle !== "normal",
        },
        className,
      )}
      data-nav-panel-collapsed={collapsed ? "true" : "false"}
      data-xmlui-component="NavPanel"
      ref={ref}
    >
      {logoContent ? (
        <div className={styles.logoWrapper} data-xmlui-part="logo">
          {logoContent}
        </div>
      ) : null}
      <div className={styles.wrapperInner} data-xmlui-part="content">
        {children}
      </div>
      {hasFooter ? (
        <div className={styles.footer} data-xmlui-part="footer">
          {footerContent}
        </div>
      ) : null}
    </nav>
  );
});
