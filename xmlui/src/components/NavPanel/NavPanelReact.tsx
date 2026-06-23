import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { NavPanelCollapseProvider, useNavPanelCollapseContext } from "../NavPanelCollapseButton/NavPanelCollapseContext";
import styles from "./NavPanel.module.scss";

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
  const collapsed = collapseContext?.collapsed ?? false;

  return (
    <nav
      {...rest}
      className={[
        styles.wrapper,
        collapsed && styles.collapsed,
        scrollStyle !== "normal" && styles.overlayScroll,
        className,
      ].filter(Boolean).join(" ")}
      data-nav-panel-collapsed={collapsed ? "true" : "false"}
      data-xmlui-component="NavPanel"
      ref={ref}
    >
      {logoContent ? (
        <div className={styles.logo} data-xmlui-part="logo">
          {logoContent}
        </div>
      ) : null}
      <div className={styles.content} data-xmlui-part="content">
        {children}
      </div>
      {footerContent ? (
        <div className={styles.footer} data-xmlui-part="footer">
          {footerContent}
        </div>
      ) : null}
    </nav>
  );
});
