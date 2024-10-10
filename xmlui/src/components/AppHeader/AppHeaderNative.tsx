import { ReactNode, useEffect, useState } from "react";
import classnames from "@components-core/utils/classnames";

import styles from "./AppHeader.module.scss";

import { Icon } from "@components/Icon/IconNative";
import { EMPTY_OBJECT } from "@components-core/constants";
import { Logo } from "@components/Logo/LogoNative";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { Button } from "@components/Button/ButtonNative";
import { useResourceUrl, useTheme } from "@components-core/theming/ThemeContext";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { NavLink } from "@components/NavLink/NavLinkNative";
import { useAppContext } from "@components-core/AppContext";

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
  toggleDrawer?: () => void;
  hasRegisteredNavPanel?: boolean;
  titleContent?: ReactNode;
};

function tryLoadImage(url: string, onLoaded: () => void, onError: () => void) {
  const img = new Image();
  img.src = url;
  img.onload = () => {
    onLoaded();
  };
  img.onerror = () => {
    onError();
  };
}

export function useLogoUrl() {
  const [autoLogoUrl, setAutoLogoUrl] = useState<string>(undefined);
  const [logoUrlByTone, setLogoUrlByTone] = useState<Record<string, string>>({});
  const { activeThemeTone } = useTheme();

  const baseLogoUrl = useResourceUrl("resource:logo");
  const toneLogoUrl = useResourceUrl(`resource:logo-${activeThemeTone}`);

  const givenUrl = toneLogoUrl || baseLogoUrl;

  useEffect(() => {
    if (!givenUrl) {
      if(autoLogoUrl === undefined){
        const defaultUrl = "/resources/logo.svg";
        tryLoadImage(defaultUrl, ()=>{
          setAutoLogoUrl(defaultUrl);
        }, ()=>{
          setAutoLogoUrl(null);
        });
      }
      if(logoUrlByTone[activeThemeTone] === undefined){
        const defaultUrl = `/resources/logo-${activeThemeTone}.svg`;
        tryLoadImage(defaultUrl, ()=>{
          setLogoUrlByTone((prev)=>({...prev, [activeThemeTone]: defaultUrl}));
        }, ()=>{
          setLogoUrlByTone((prev)=>({...prev, [activeThemeTone]: null}));
        });
      }
    }
  }, [activeThemeTone, autoLogoUrl, givenUrl, logoUrlByTone]);
  return givenUrl || logoUrlByTone[activeThemeTone] || autoLogoUrl;
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
  title,
  titleContent,
}: Props) => {
  const { mediaSize } = useAppContext();
  const logoUrl = useLogoUrl();
  const safeLogoTitle =
    mediaSize.sizeIndex < 2 ? null : !titleContent && title ? (
      <NavLink to={"/"} displayActive={false} style={{ paddingLeft: 0 }}>
        {title}
      </NavLink>
    ) : (
      titleContent
    );

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
        <div className={styles.logoAndTitle}>
          {(showLogo || !navPanelVisible) &&
            (logoContent ? (
              <>
                <div className={styles.customLogoContainer}>{logoContent}</div>
                {safeLogoTitle}
              </>
            ) : (
              <>
                {!!logoUrl && (
                  <div className={styles.logoContainer}>
                    <NavLink to={"/"} displayActive={false} style={{ padding: 0, height: "100%" }}>
                      <Logo />
                    </NavLink>
                  </div>
                )}
                {safeLogoTitle}
              </>
            ))}
        </div>
        <div className={styles.childrenWrapper}>{children}</div>
        {profileMenu && <div className={styles.rightItems}>{profileMenu}</div>}
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
  title,
  titleContent,
  renderChild,
}: {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  className?: string;
  title?: string;
  titleContent?: ReactNode;
  renderChild: RenderChildFn;
}) {
  const appLayoutContext = useAppLayoutContext();

  const {
    navPanelVisible,
    toggleDrawer,
    layout,
    hasRegisteredNavPanel,
    navPanelDef,
    logoContentDef,
  } = appLayoutContext || {};

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
      logoContent={logoContent || renderChild(logoContentDef)}
      profileMenu={profileMenu}
      style={style}
      className={className}
      title={title}
      titleContent={titleContent}
    >
      {layout?.startsWith("condensed") && navPanelVisible && (
        <div style={{ minWidth: 0 }}>{renderChild(navPanelDef)}</div>
      )}
      {children}
    </AppHeader>
  );
}
