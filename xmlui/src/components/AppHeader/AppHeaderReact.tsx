import type { HTMLAttributes, ReactNode } from "react";
import { forwardRef, useCallback } from "react";

import { defaultProps } from "./AppHeader.defaults";
import styles from "./AppHeader.module.scss";
import { useAppLayoutContext } from "../App/AppLayoutContext";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { Logo } from "../Logo/LogoReact";
import { NavLinkMd } from "../NavLink/NavLink";
import navLinkStyles from "../NavLink/NavLink.module.scss";
import { useComponentThemeClass } from "../../runtime/rendering/theme";
import type { ComponentMetadata } from "../../component-core/metadata/types";

export type AppHeaderProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  drawerToggle?: ReactNode;
  logoContent?: ReactNode;
  profileMenu?: ReactNode;
  showLogo?: boolean;
  title?: string;
  titleContent?: ReactNode;
};

export function useLogoUrl() {
  const { logo, logoLight, logoDark } = useAppLayoutContext() || {};
  const logoUrlByTone = {
    light: logoLight,
    dark: logoDark,
  } as Record<string, string | undefined>;
  const { tone, getResourceUrl } = useTheme();

  const baseLogoUrl = getResourceUrl("resource:logo") || logo;
  const toneLogoUrl =
    getResourceUrl(`resource:logo-${tone}`) || logoUrlByTone[String(tone)];

  return toneLogoUrl || baseLogoUrl;
}

export const AppHeaderComponent = forwardRef<HTMLElement, AppHeaderProps>(function AppHeaderComponent(
  {
    children,
    className,
    drawerToggle,
    logoContent,
    profileMenu,
    showLogo = defaultProps.showLogo,
    style,
    title,
    titleContent,
    ...rest
  },
  ref,
) {
  const { isNarrowScreen, layout, registerSubNavPanelSlot } = useAppLayoutContext() || {};
  const logoUrl = useLogoUrl();
  const navLinkThemeClass = useComponentThemeClass("NavLink", NavLinkMd as ComponentMetadata);
  const canRestrictContentWidth = layout !== "vertical-full-header";
  const displayLogo = (isNarrowScreen || (layout !== "vertical" && layout !== "vertical-sticky")) && showLogo;
  const subNavPanelRef = useCallback(
    (node: HTMLDivElement | null) => {
      registerSubNavPanelSlot?.(node);
    },
    [registerSubNavPanelSlot],
  );
  const { boxSizing, ...headerStyle } = style ?? {};
  const titleNode = titleContent ?? (title ? (
    <a className={styles.title} href="/">
      {title}
    </a>
  ) : null);

  return (
    <header
      {...rest}
      className={[styles.header, isNarrowScreen && styles.mobile, className].filter(Boolean).join(" ")}
      data-xmlui-component="AppHeader"
      ref={ref}
      role="banner"
      style={headerStyle}
    >
      <div
        className={[
          styles.headerInner,
          !canRestrictContentWidth && styles.full,
        ].filter(Boolean).join(" ")}
      >
        {drawerToggle ? (
          <div
            className={styles.drawerToggle}
            data-xmlui-part="drawerToggle"
          >
            {drawerToggle}
          </div>
        ) : null}
        <div className={styles.logoAndTitle}>
          {displayLogo && logoContent ? (
            <div className={styles.customLogoContainer} data-xmlui-part="logo">
              {logoContent}
            </div>
          ) : displayLogo && logoUrl ? (
            <div className={styles.logoContainer} data-xmlui-part="logo">
              <a
                className={[
                  navLinkStyles.content,
                  navLinkStyles.base,
                  navLinkThemeClass.className,
                  styles.logoLink,
                ].filter(Boolean).join(" ")}
                href="/"
                style={navLinkThemeClass.style}
              >
                <span className={[
                  navLinkStyles.innerContent,
                  navLinkStyles.iconAlignCenter,
                ].filter(Boolean).join(" ")}>
                  <Logo />
                </span>
              </a>
            </div>
          ) : null}
          {titleNode}
        </div>
        <div
          className={styles.subNavPanelSlot}
          data-xmlui-part="subNavPanel"
          ref={subNavPanelRef}
        />
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
