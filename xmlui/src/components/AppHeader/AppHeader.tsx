import type { ReactNode } from "react";
import { useId, useRef} from "react";
import { createPortal } from "react-dom";
import classnames from "@components-core/utils/classnames";

import styles from "./AppHeader.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import { Icon } from "@components/Icon/Icon";
import { createComponentRenderer } from "@components-core/renderers";
import { EMPTY_OBJECT } from "@components-core/constants";
import { useAppContext } from "@components-core/AppContext";
import { Logo } from "@components/Logo/Logo";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { Button } from "@components/Button/Button";
import { useResourceUrl, useTheme } from "@components-core/theming/ThemeContext";
import { parseScssVar } from "@components-core/theming/themeVars";
import { borderSubject, paddingSubject } from "@components-core/theming/themes/base-utils";
import { useIsomorphicLayoutEffect } from "@components-core/utils/hooks";

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
  logoTitle
}: Props) => {
  const { loggedInUser } = useAppContext();

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
            style={{ color: "inherit" }}
          />
        )}
        {(showLogo || !navPanelVisible) && (
          <div className={styles.logoContainer}>{logoContent ? <>{logoContent}</> : <Logo title={logoTitle} />}</div>
        )}
        <div className={styles.childrenWrapper}>{children}</div>
        <div className={styles.rightItems}>
          {/*{profileMenu === undefined ? <ProfileMenu loggedInUser={loggedInUser} /> : profileMenu}*/}
          {profileMenu}
        </div>
      </div>
    </div>
  );
};

function AppContextAwareAppHeader({
  children,
  logoContent,
  profileMenu,
  style,
  className,
  logoTitle,
}: {
  children?: ReactNode;
  profileMenu?: ReactNode;
  style?: React.CSSProperties;
  logoContent?: ReactNode;
  className?: string;
  logoTitle?: string;
}) {
  const appLayoutContext = useAppLayoutContext();
  const id = useId();

  const registered = useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!appLayoutContext || registered.current) {
      return;
    }
    appLayoutContext.registerHeader(id);
    registered.current = true;
    return () => {
      registered.current = false;
      appLayoutContext.unregisterHeader(id);
    };
  }, [appLayoutContext, id]);

  const {
    navPanelVisible,
    toggleDrawer,
    headerRoot,
    layout,
    setNavPanelRoot,
    hasRegisteredHeader,
    hasRegisteredNavPanel,
  } = appLayoutContext || {};
  const showLogo = layout !== "vertical" && layout !== "vertical-sticky";
  const canRestrictContentWidth = layout !== "vertical-full-header";
  if (headerRoot) {
    return createPortal(
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
        {layout && layout.startsWith("condensed") && <div ref={setNavPanelRoot} style={{ minWidth: 0 }} />}
        {children}
      </AppHeader>,
      headerRoot
    );
  }

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
      {layout && layout.startsWith("condensed") && <div ref={setNavPanelRoot} style={{ minWidth: 0 }} />}
      {children}
    </AppHeader>
  );
}

/**
 * \`AppHeader\` is a placeholder within \`App\` to define a custom application header.
 * 
 * > **Note**: You can learn more details about using this component [here](../learning/using-components/app-component).
 */
export interface AppHeaderComponentDef extends ComponentDef<"AppHeader"> {
  props: {
    profileMenuTemplate?: ComponentDef;
    logoTemplate?: ComponentDef;
    logoTitle?: string;
  };
}

// @ts-ignore
const metadata: ComponentDescriptor<AppHeaderComponentDef> = {
  displayName: "AppHeader",
  description: "Display an application header",
  props: {
    logoTemplate: {
      description: "Template for the application logo",
      valueType: "ComponentDef",
    },
    profileMenuTemplate: {
      description: "Template for the profile menu",
      valueType: "ComponentDef",
    },
  },
  themeVars: parseScssVar(styles.themeVars),
  defaultThemeVars: {
    "height-AppHeader": "$space-14",
    "max-content-width-AppHeader": "$max-content-width-App",
    ...borderSubject("AppHeader", {
      bottom: {
        color: "$color-border",
        thickness: "1px",
        style: "solid",
      },
      all: {
        color: "$color-border",
        thickness: "0",
        style: "solid",
      },
    }),
    ...paddingSubject("logo-AppHeader", { horizontal: "$space-0", vertical: "$space-4" }),
    ...paddingSubject("AppHeader", { horizontal: "$space-4", vertical: "$space-0" }),
    "radius-AppHeader": "0px",
    light: {
      "color-bg-AppHeader": "white",
    },
    dark: {
      "color-bg-AppHeader": "$color-surface-900",
    },
  },
};

export const appHeaderComponentRenderer = createComponentRenderer<AppHeaderComponentDef>(
  "AppHeader",
  ({ node, renderChild, layoutCss, layoutContext, extractValue }) => {
    // --- Convert the plain (text) logo template into component definition
    let logoTemplate = node.props.logoTemplate;
    if (typeof (logoTemplate as any) === "string") {
      logoTemplate = {
        type: "TextNode",
        props: {
          value: logoTemplate,
        },
      };
    }
    return (
      <AppContextAwareAppHeader
        profileMenu={renderChild(extractValue(node.props.profileMenuTemplate, true))}
        logoTitle={extractValue(node.props.logoTitle) || layoutContext?.logoTitle}
        logoContent={
          renderChild(logoTemplate, {
            type: "Stack",
            orientation: "horizontal",
          }) || layoutContext?.logoContent
        }
        style={layoutCss}
        className={layoutContext?.themeClassName}
      >
        {renderChild(node.children, {
          // Since the AppHeader is a flex container, it's children should behave the same as in a stack
          type: "Stack",
          width: "100%",
          height: "100%",
        })}
      </AppContextAwareAppHeader>
    );
  },
  metadata
);
