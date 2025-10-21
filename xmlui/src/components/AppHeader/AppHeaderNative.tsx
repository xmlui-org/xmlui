import type { ReactNode} from "react";
import { useLayoutEffect, useRef } from "react";
import classnames from "classnames";

import styles from "./AppHeader.module.scss";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { useResourceUrl, useTheme } from "../../components-core/theming/ThemeContext";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { useAppContext } from "../../components-core/AppContext";
import { Icon } from "../../components/Icon/IconNative";
import { Logo } from "../../components/Logo/LogoNative";
import { useAppLayoutContext } from "../../components/App/AppLayoutContext";
import { Button } from "../../components/Button/ButtonNative";
import { NavLink } from "../../components/NavLink/NavLinkNative";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";

type Props = {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  canRestrictContentWidth?: boolean;
  className?: string;
  title?: string;
  navPanelVisible?: boolean;
  showLogo?: boolean;
  showNavPanelIf?: boolean;
  toggleDrawer?: () => void;
  hasRegisteredNavPanel?: boolean;
  titleContent?: ReactNode;
  registerSubNavPanelSlot?: (node: HTMLElement) => void;
  renderChild?: RenderChildFn;
};

export const defaultProps: Pick<Props, "showLogo" | "showNavPanelIf"> = {
  showLogo: true,
  showNavPanelIf: true,
};

export function useLogoUrl() {
  const { logo, logoLight, logoDark } = useAppLayoutContext() || {};
  const logoUrlByTone = {
    light: logoLight,
    dark: logoDark,
  };
  const { activeThemeTone } = useTheme();

  const baseLogoUrl = useResourceUrl("resource:logo") || logo;
  const toneLogoUrl =
    useResourceUrl(`resource:logo-${activeThemeTone}`) || logoUrlByTone[activeThemeTone];

  return toneLogoUrl || baseLogoUrl;
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
  showLogo = defaultProps.showLogo,
  showNavPanelIf = defaultProps.showNavPanelIf,
  hasRegisteredNavPanel,
  title,
  titleContent,
  registerSubNavPanelSlot,
  ...rest
}: Props) => {
  const { mediaSize } = useAppContext();
  const logoUrl = useLogoUrl();
  const subNavPanelSlot = useRef(null);
  const effectiveNavPanelVisible = navPanelVisible && showNavPanelIf;
  const safeLogoTitle =
    mediaSize.sizeIndex < 2 ? null : !titleContent && title ? (
      <NavLink to={"/"} displayActive={false} style={{ paddingLeft: 0 }}>
        {title}
      </NavLink>
    ) : (
      titleContent
    );

  useIsomorphicLayoutEffect(() => {
    registerSubNavPanelSlot?.(subNavPanelSlot.current);
  }, []);

  return (
    <div {...rest} className={classnames(styles.header, className)} style={style} role="banner">
      <div
        className={classnames(styles.headerInner, {
          [styles.full]: !canRestrictContentWidth,
        })}
      >
        {hasRegisteredNavPanel && showNavPanelIf && (
          <Button
            onClick={toggleDrawer}
            icon={<Icon name={"hamburger"} />}
            variant={"ghost"}
            className={styles.drawerToggle}
            style={{ color: "inherit", flexShrink: 0 }}
          />
        )}
        <div className={styles.logoAndTitle}>
          {(showLogo || !effectiveNavPanelVisible) &&
            (logoContent ? (
              <>
                <div className={styles.customLogoContainer}>{logoContent}</div>
                {safeLogoTitle}
              </>
            ) : (
              <>
                {!!logoUrl && (
                  <div className={styles.logoContainer}>
                    <NavLink to={"/"} displayActive={false} className={styles.logoLink}>
                      <Logo />
                    </NavLink>
                  </div>
                )}
                {safeLogoTitle}
              </>
            ))}
        </div>
        <div ref={subNavPanelSlot} className={styles.subNavPanelSlot} />
        <div className={styles.childrenWrapper}>{children}</div>
        {profileMenu && <div className={styles.rightItems}>{profileMenu}</div>}
      </div>
    </div>
  );
};

type AppContextAwareAppHeaderProps = {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  className?: string;
  title?: string;
  titleContent?: ReactNode;
  showLogo?: boolean;
  showNavPanelIf?: boolean;
  renderChild: RenderChildFn;
};

export function AppContextAwareAppHeader({
  children,
  logoContent,
  profileMenu,
  style,
  className,
  title,
  titleContent,
  showLogo = true,
  showNavPanelIf = defaultProps.showNavPanelIf,
  renderChild,
}: AppContextAwareAppHeaderProps) {
  const appLayoutContext = useAppLayoutContext();

  const {
    navPanelVisible,
    toggleDrawer,
    layout,
    hasRegisteredNavPanel,
    navPanelDef,
    logoContentDef,
    registerSubNavPanelSlot,
  } = appLayoutContext || {};

  // console.log("APP LAYOUT CONTEXT", appLayoutContext);
  const displayLogo = layout !== "vertical" && layout !== "vertical-sticky" && showLogo;
  const canRestrictContentWidth = layout !== "vertical-full-header";
  const effectiveNavPanelVisible = navPanelVisible && showNavPanelIf;

  return (
    <AppHeader
      hasRegisteredNavPanel={hasRegisteredNavPanel}
      navPanelVisible={effectiveNavPanelVisible}
      toggleDrawer={toggleDrawer}
      canRestrictContentWidth={canRestrictContentWidth}
      showLogo={displayLogo}
      showNavPanelIf={showNavPanelIf}
      logoContent={logoContent || renderChild(logoContentDef)}
      profileMenu={profileMenu}
      style={style}
      className={className}
      title={title}
      titleContent={titleContent}
      registerSubNavPanelSlot={registerSubNavPanelSlot}
    >
      {layout?.startsWith("condensed") && effectiveNavPanelVisible && (
        <div style={{ minWidth: 0 }}>{renderChild(navPanelDef)}</div>
      )}
      {children}
    </AppHeader>
  );
}
