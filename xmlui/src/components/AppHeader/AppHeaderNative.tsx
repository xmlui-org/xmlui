import type { ReactNode } from "react";
import classnames from "@components-core/utils/classnames";

import styles from "./AppHeader.module.scss";

import { Icon } from "@components/Icon/IconNative";
import { EMPTY_OBJECT } from "@components-core/constants";
import { Logo } from "@components/Logo/LogoNative";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { Button } from "@components/Button/ButtonNative";
import { useResourceUrl, useTheme } from "@components-core/theming/ThemeContext";
import { RenderChildFn } from "@abstractions/RendererDefs";

type Props = {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  canRestrictContentWidth?: boolean;
  className?: string;
  logoTitle?: string;
  navPanelVisible?: boolean;
  showLogo?: boolean;
  toggleDrawer?: () => void;
  hasRegisteredNavPanel?: boolean;
};

export function useLogoUrl(inDrawer?: boolean) {
  const { activeThemeId, activeThemeTone } = useTheme();
  const logoResourceString = "resource:logo";
  const drawerLogoResourceString = "resource:logo.drawer";
  const tonedLogoResourceString = `resource:logo-${activeThemeTone}`;
  const themedLogoResourceString = `resource:logo-${activeThemeId}`;

  const baseLogoUrl = useResourceUrl(logoResourceString);
  const drawerLogoUrl = useResourceUrl(drawerLogoResourceString);
  const toneLogoUrl = useResourceUrl(tonedLogoResourceString); //TODO illesg review, it's for light/dark built in themes
  const themeLogoUrl = useResourceUrl(themedLogoResourceString); //TODO illesg review, it's for light/dark built in themes
  if (inDrawer) {
    return drawerLogoUrl || baseLogoUrl;
  }
  return themeLogoUrl || toneLogoUrl || baseLogoUrl;
}

export const AppHeader = ({
  children,
  profileMenu,
  style = EMPTY_OBJECT,
  logoContent,
  className,
  canRestrictContentWidth,
  navPanelVisible = true,
  toggleDrawer,
  showLogo,
  hasRegisteredNavPanel,
  logoTitle,
}: Props) => {
  return (
    <div className={classnames(styles.header, className)} style={style}>
      <div
        className={classnames(styles.headerInner, {
          [styles.full]: !canRestrictContentWidth,
        })}
      >
        {!navPanelVisible && hasRegisteredNavPanel && (
          <Button
            onClick={toggleDrawer}
            icon={<Icon name={"hamburger"} />}
            variant={"ghost"}
            style={{ color: "inherit", flexShrink: 0 }}
          />
        )}
        {(showLogo || !navPanelVisible) && (
          <div className={styles.logoContainer}>
            {logoContent ? <>{logoContent}</> : <Logo title={logoTitle} />}
          </div>
        )}
        <div className={styles.childrenWrapper}>{children}</div>
        {profileMenu && (
          <div className={styles.rightItems}>
            {/*{profileMenu === undefined ? <ProfileMenu loggedInUser={loggedInUser} /> : profileMenu}*/}
            {profileMenu}
          </div>
        )}
      </div>
    </div>
  );
};

export function AppContextAwareAppHeader({
  children,
  logoContent,
  profileMenu,
  style,
  className,
  logoTitle,
  renderChild,
}: {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  className?: string;
  logoTitle?: string;
  renderChild: RenderChildFn;
}) {
  const appLayoutContext = useAppLayoutContext();

  const { navPanelVisible, toggleDrawer, layout, hasRegisteredNavPanel, navPanelDef } =
    appLayoutContext || {};

  // console.log("APP LAYOUT CONTEXT", appLayoutContext);
  const showLogo = layout !== "vertical" && layout !== "vertical-sticky";
  const canRestrictContentWidth = layout !== "vertical-full-header";

  return (
    <AppHeader
      hasRegisteredNavPanel={hasRegisteredNavPanel}
      navPanelVisible={navPanelVisible}
      toggleDrawer={toggleDrawer}
      canRestrictContentWidth={canRestrictContentWidth}
      showLogo={showLogo}
      logoContent={logoContent}
      profileMenu={profileMenu}
      style={style}
      className={className}
      logoTitle={logoTitle}
    >
      {layout?.startsWith("condensed") && navPanelVisible && (
        <div style={{ minWidth: 0 }}>{renderChild(navPanelDef)}</div>
      )}
      {children}
    </AppHeader>
  );
}
