import { type ReactNode, forwardRef, memo, useRef } from "react";
import classnames from "classnames";

import styles from "./AppHeader.module.scss";

import type { RenderChildFn } from "../../abstractions/RendererDefs";
import { useTheme } from "../../components-core/theming/ThemeContext";
import { EMPTY_OBJECT } from "../../components-core/constants";
import { useAppContext } from "../../components-core/AppContext";
import { ThemedIcon } from "../../components/Icon/Icon";
import { Logo } from "../../components/Logo/LogoNative";
import { useAppLayoutContext } from "../../components/App/AppLayoutContext";
import { ThemedButton as Button } from "../../components/Button/Button";
import { ThemedNavLink } from "../../components/NavLink/NavLink";
import { useIsomorphicLayoutEffect } from "../../components-core/utils/hooks";
import { Part } from "../Part/Part";
import { COMPONENT_PART_KEY } from "../../components-core/theming/responsive-layout";
import { PART_HAMBURGER } from "../../components-core/parts";

type Props = {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  canRestrictContentWidth?: boolean;
  className?: string;
  classes?: Record<string, string>;
  title?: string;
  navPanelVisible?: boolean;
  showLogo?: boolean;
  toggleDrawer?: () => void;
  hasRegisteredNavPanel?: boolean;
  titleContent?: ReactNode;
  registerSubNavPanelSlot?: (node: HTMLElement) => void;
  renderChild?: RenderChildFn;
};

export const defaultProps: Pick<Props, "showLogo"> = {
  showLogo: true,
};

export function useLogoUrl() {
  const { logo, logoLight, logoDark } = useAppLayoutContext() || {};
  const logoUrlByTone = {
    light: logoLight,
    dark: logoDark,
  };
  const { activeThemeTone, getResourceUrl } = useTheme();

  const baseLogoUrl = getResourceUrl("resource:logo") || logo;
  const toneLogoUrl =
    getResourceUrl(`resource:logo-${activeThemeTone}`) || logoUrlByTone[activeThemeTone];

  return toneLogoUrl || baseLogoUrl;
}

export const AppHeader = memo(forwardRef<HTMLDivElement, Props>(function AppHeader({
  children,
  profileMenu,
  style = EMPTY_OBJECT,
  logoContent,
  className,
  classes,
  canRestrictContentWidth,
  navPanelVisible = true,
  toggleDrawer,
  showLogo = defaultProps.showLogo,
  hasRegisteredNavPanel,
  title,
  titleContent,
  registerSubNavPanelSlot,
  ...rest
}: Props, ref) {
  const { mediaSize } = useAppContext();
  const logoUrl = useLogoUrl();
  const subNavPanelSlot = useRef(null);
  const effectiveNavPanelVisible = navPanelVisible;
  const safeLogoTitle =
    mediaSize.sizeIndex < 2 ? null : !titleContent && title ? (
      <ThemedNavLink to={"/"} displayActive={false} style={{ paddingLeft: 0 }}>
        {title}
      </ThemedNavLink>
    ) : (
      titleContent
    );

  useIsomorphicLayoutEffect(() => {
    registerSubNavPanelSlot?.(subNavPanelSlot.current);
  }, []);

  return (
    <div ref={ref} {...rest} className={classnames(styles.header, classes?.[COMPONENT_PART_KEY], className)} style={style} role="banner">
      <div
        className={classnames(styles.headerInner, {
          [styles.full]: !canRestrictContentWidth,
        })}
      >
        {hasRegisteredNavPanel && (
          <Part partId={PART_HAMBURGER}>
            <Button
              onClick={toggleDrawer}
              icon={<ThemedIcon name={"hamburger"} />}
              variant={"ghost"}
              className={styles.drawerToggle}
              style={{ color: "inherit", flexShrink: 0 }}
            />
          </Part>
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
                    <ThemedNavLink to={"/"} displayActive={false} className={styles.logoLink}>
                      <Logo />
                    </ThemedNavLink>
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
}));

type AppContextAwareAppHeaderProps = {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  className?: string;
  classes?: Record<string, string>;
  title?: string;
  titleContent?: ReactNode;
  showLogo?: boolean;
  renderChild: RenderChildFn;
};

export const AppContextAwareAppHeader = memo(forwardRef<HTMLDivElement, AppContextAwareAppHeaderProps>(function AppContextAwareAppHeader({
  children,
  logoContent,
  profileMenu,
  style,
  className,
  classes,
  title,
  titleContent,
  showLogo = true,
  renderChild,
}: AppContextAwareAppHeaderProps, ref) {
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
  const effectiveNavPanelVisible = navPanelVisible;

  return (
    <AppHeader
      ref={ref}
      hasRegisteredNavPanel={hasRegisteredNavPanel}
      navPanelVisible={effectiveNavPanelVisible}
      toggleDrawer={toggleDrawer}
      canRestrictContentWidth={canRestrictContentWidth}
      showLogo={displayLogo}
      logoContent={logoContent || renderChild(logoContentDef)}
      profileMenu={profileMenu}
      style={style}
      className={className}
      classes={classes}
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
}));
