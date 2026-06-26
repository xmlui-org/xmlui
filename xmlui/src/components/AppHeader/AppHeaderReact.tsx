import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

import { defaultProps } from "./AppHeader.defaults";
import styles from "./AppHeader.module.scss";

export type AppHeaderProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  drawerToggle?: ReactNode;
  logoContent?: ReactNode;
  profileMenu?: ReactNode;
  showLogo?: boolean;
  title?: string;
  titleContent?: ReactNode;
};

export const AppHeaderComponent = forwardRef<HTMLElement, AppHeaderProps>(function AppHeaderComponent(
  {
    children,
    className,
    drawerToggle,
    logoContent,
    profileMenu,
    showLogo = defaultProps.showLogo,
    title,
    titleContent,
    ...rest
  },
  ref,
) {
  const titleNode = titleContent ?? (title ? (
    <a className={styles.title} href="/">
      {title}
    </a>
  ) : null);

  return (
    <header
      {...rest}
      className={[styles.header, className].filter(Boolean).join(" ")}
      data-xmlui-component="AppHeader"
      ref={ref}
      role="banner"
    >
      <div className={[styles.headerInner, styles.full].join(" ")}>
        {drawerToggle ? (
          <div className={styles.drawerToggle} data-xmlui-part="drawerToggle">
            {drawerToggle}
          </div>
        ) : null}
        <div className={styles.logoAndTitle}>
          {showLogo && logoContent ? (
            <div className={styles.logoContainer} data-xmlui-part="logo">
              {logoContent}
            </div>
          ) : null}
          {titleNode}
        </div>
        <div className={styles.subNavPanelSlot} data-xmlui-part="subNavPanel" />
        <div className={styles.childrenWrapper} data-xmlui-part="content">
          {children}
        </div>
        {profileMenu ? (
          <div className={styles.rightItems} data-xmlui-part="profileMenu">
            {profileMenu}
          </div>
        ) : null}
      </div>
    </header>
  );
});
