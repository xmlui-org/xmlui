import type { ReactNode } from "react";
import classnames from "@components-core/utils/classnames";

import styles from "./AppHeader.module.scss";

import type { ComponentDef } from "@abstractions/ComponentDefs";
import type { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";

import { Icon } from "@components/Icon/IconNative";
import { createComponentRenderer } from "@components-core/renderers";
import { EMPTY_OBJECT } from "@components-core/constants";
import { Logo } from "@components/Logo/Logo";
import { useAppLayoutContext } from "@components/App/AppLayoutContext";
import { Button } from "@components/Button/ButtonNative";
import { useResourceUrl, useTheme } from "@components-core/theming/ThemeContext";
import { parseScssVar } from "@components-core/theming/themeVars";
import { borderSubject, paddingSubject } from "@components-core/theming/themes/base-utils";
import { desc, nestedComp } from "@components-core/descriptorHelper";
import type { RenderChildFn } from "@abstractions/RendererDefs";
import { NavLink } from "@components/NavLink/NavLinkNative";
import { useAppContext } from "@components-core/AppContext";
import { SlotItem } from "@components/slot-helpers";

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
  title,
  titleContent,
}: Props) => {
  const { mediaSize } = useAppContext();
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
        {(showLogo || !navPanelVisible) &&
          (logoContent ? (
            <>
              <div className={styles.customLogoContainer}>{logoContent}</div>
              {safeLogoTitle}
            </>
          ) : (
            <>
              <div className={styles.logoContainer}>
                <NavLink to={"/"} displayActive={false} style={{ padding: 0, height: "100%" }}>
                  <Logo />
                </NavLink>
              </div>
              {safeLogoTitle}
            </>
          ))}
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

/**
 * \`AppHeader\` is a placeholder within \`App\` to define a custom application header.
 *
 * > **Note**: You can learn more details about using this component [here](../learning/using-components/app-component).
 */
export interface AppHeaderComponentDef extends ComponentDef<"AppHeader"> {
  props: {
    profileMenuTemplate?: ComponentDef;
    logoTemplate?: ComponentDef;
    titleTemplate?: ComponentDef;
    title?: string;
  };
}

export const AppHeaderMd: ComponentDescriptor<AppHeaderComponentDef> = {
  displayName: "AppHeader",
  description: "A placeholder within App to define a custom application header",
  props: {
    profileMenuTemplate: nestedComp("Template for the profile menu"),
    logoTemplate: nestedComp("Template for the application logo"),
    title: desc("Title for the application logo"),
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
    const logoTemplate = node.props.logoTemplate || node.slots?.logoSlot;
    const titleTemplate = node.props.titleTemplate || node.slots?.titleSlot;
    return (
      <AppContextAwareAppHeader
        profileMenu={renderChild(extractValue(node.props.profileMenuTemplate, true))}
        title={extractValue(node.props.title)}
        titleContent={
          titleTemplate && (
            <SlotItem
              node={titleTemplate}
              renderChild={renderChild}
              slotProps={{ title: extractValue(node.props.title) }}
            />
          )
        }
        logoContent={renderChild(logoTemplate, {
          type: "Stack",
          orientation: "horizontal",
        })}
        style={layoutCss}
        className={layoutContext?.themeClassName}
        renderChild={renderChild}
      >
        {renderChild(node.children, {
          // Since the AppHeader is a flex container, it's children should behave the same as in a stack
          type: "Stack",
        })}
      </AppContextAwareAppHeader>
    );
  },
  AppHeaderMd,
);
